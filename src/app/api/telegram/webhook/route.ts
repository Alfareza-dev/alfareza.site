import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Helper to interact with Telegram API
async function telegramAPI(method: string, body: any) {
  if (!TELEGRAM_BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ status: "Telegram Webhook Endpoint is Alive", timestamp: new Date() }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ ok: true, message: 'Invalid JSON payload' });
    }

    const chatId = body.message?.chat.id.toString() || body.callback_query?.message.chat.id.toString();
    
    // SILENTLY DROP UNAUTHORIZED
    if (chatId !== String(TELEGRAM_CHAT_ID)) {
      return NextResponse.json({ ok: true });
    }

    // --- HELPER TO RENDER MAIN DASHBOARD ---
    const renderDashboard = async (messageIdToEdit?: number) => {
      const [visits, blocked, activity, lastLogin, siteSettings] = await Promise.all([
        supabase.from('visitor_stats').select('*', { count: 'exact', head: true }),
        supabase.from('blocked_ips').select('*', { count: 'exact', head: true }),
        supabase.from('activity_logs').select('*', { count: 'exact', head: true }).in('action', ['HONEYPOT_TRIGGERED', 'SQL_INJECTION', 'XSS_ATTACK', 'BRUTE_FORCE']),
        supabase.from('activity_logs').select('created_at').eq('action', 'ADMIN_LOGIN').order('created_at', { ascending: false }).limit(1),
        supabase.from('site_settings').select('value').eq('key', 'maintenance_mode').single()
      ]);

      const totalVisits = visits.count || 0;
      const bannedCount = blocked.count || 0;
      const alertCount = activity.count || 0;
      const lastLoginTime = lastLogin.data && lastLogin.data[0] ? new Date(lastLogin.data[0].created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : 'Never';
      
      const isMaint = siteSettings.data?.value === 'true';

      const start = Date.now();
      await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL!, { method: 'HEAD' }).catch(() => {});
      const pingTime = Date.now() - start;

      const messageText = `🎛️ <b>C2 Operations Dashboard</b> 🎛️
⚡ Live Ping: ${pingTime}ms

<b>📈 Traffic Stats</b>
• Total Visits: <code>${totalVisits}</code>

<b>🛡️ Security Posture</b>
• Banned IPs: <code>${bannedCount}</code>
• Critical Alerts: <code>${alertCount}</code>
• Last Admin Login: <code>${lastLoginTime}</code>

Select an action below:`;

      const replyMarkup = {
        inline_keyboard: [
          [{ text: `🛠️ Maint: ${isMaint ? 'ON' : 'OFF'}`, callback_data: 'toggle_maint' }, { text: '📋 Activity Logs', callback_data: 'view_activity' }],
          [{ text: '📥 View Unread Inbox', callback_data: 'view_inbox' }]
        ]
      };

      if (messageIdToEdit) {
        await telegramAPI('editMessageText', { chat_id: chatId, message_id: messageIdToEdit, text: messageText, parse_mode: 'HTML', reply_markup: replyMarkup });
      } else {
        await telegramAPI('sendMessage', { chat_id: chatId, text: messageText, parse_mode: 'HTML', reply_markup: replyMarkup });
      }
    };

    // HANDLE DIRECT MESSAGES
    if (body.message) {
      const text = body.message.text || '';
      if (text.startsWith('/menu') || text.startsWith('/start')) {
        await renderDashboard();
      }
    }

    // HANDLE INLINE BUTTON CALLBACKS
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const messageId = callbackQuery.message.message_id;
      const data = callbackQuery.data;

      if (data === 'back_to_menu') {
        await renderDashboard(messageId);
      }

      // --- MAINTENANCE FLOW ---
      else if (data === 'toggle_maint') {
        const { data: setting } = await supabase.from('site_settings').select('value').eq('key', 'maintenance_mode').single();
        const isMaint = setting?.value === 'true';
        await telegramAPI('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `⚠️ <b>Are you sure you want to toggle maintenance?</b>\nCurrent state: ${isMaint ? 'ON' : 'OFF'}\nThis will ${isMaint ? 'unlock' : 'lock'} frontend traffic.`,
          parse_mode: 'HTML',
          reply_markup: {
             inline_keyboard: [
               [{ text: '✅ Confirm', callback_data: 'cfm_maint' }],
               [{ text: '❌ Cancel', callback_data: 'back_to_menu' }]
             ]
          }
        });
      }

      else if (data === 'cfm_maint') {
        const { data: setting } = await supabase.from('site_settings').select('value').eq('key', 'maintenance_mode').single();
        const newVal = setting?.value === 'true' ? 'false' : 'true';
        
        await supabase.from('site_settings').upsert({ key: 'maintenance_mode', value: newVal, updated_at: new Date().toISOString() });
        await supabase.from('activity_logs').insert({ action: 'MAINTENANCE_TOGGLED', details: { status: newVal }, admin_email: 'telegram_c2' });

        await telegramAPI('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `✅ Maintenance mode successfully turned <b>${newVal === 'true' ? 'ON' : 'OFF'}</b>.`,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]] }
        });
      }

      // --- RECENT ACTIVITY FLOW ---
      else if (data === 'view_activity') {
        const { data: logs } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(5);
        
        let text = `📋 <b>Recent Activity (Top 5):</b>\n\n`;
        if (logs && logs.length > 0) {
          logs.forEach(log => {
             const time = new Date(log.created_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
             text += `• <code>${time}</code> | <b>${log.action}</b> (${log.admin_email || 'System'})\n`;
          });
        } else {
          text += `No recent activity found.`;
        }

        await telegramAPI('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: text,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]] }
        });
      }

      // --- INBOX FLOW ---
      else if (data === 'view_inbox' || data === 'show_all_msgs') {
        const query = supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(5);
        if (data === 'view_inbox') query.eq('is_read', false);
        
        const { data: messages } = await query;

        if (!messages || messages.length === 0) {
          if (data === 'show_all_msgs') {
            await telegramAPI('editMessageText', {
              chat_id: chatId,
              message_id: messageId,
              text: `📭 <b>The database is completely empty.</b>\nNo messages found.`,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]]
              }
            });
          } else {
            await telegramAPI('editMessageText', {
              chat_id: chatId,
              message_id: messageId,
              text: `📥 <b>All messages read!</b>\nNo unread communications in your inbox.`,
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '📁 Show All Messages (Top 5)', callback_data: 'show_all_msgs' }],
                  [{ text: '🔙 Back', callback_data: 'back_to_menu' }]
                ]
              }
            });
          }
        } else {
          let text = `📥 <b>${data === 'view_inbox' ? 'Unread Inbox' : 'Latest Messages (All)'}:</b>\n\n`;
          let buttons: any[] = [];
  
          messages.forEach((m: any, idx: number) => {
            text += `${idx + 1}. From: ${m.full_name || m.email}\n`;
            buttons.push({ text: `Read [${idx + 1}]`, callback_data: `rd_msg_${m.id}` });
          });
  
          const keyboard = [...buttons.map(b => [b]), [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]];
          await telegramAPI('editMessageText', {
            chat_id: chatId,
            message_id: messageId,
            text: text,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: keyboard }
          });
        }
      }

      else if (data.startsWith('rd_msg_')) {
        const msgId = data.replace('rd_msg_', '');
        const { data: m } = await supabase.from('messages').select('*').eq('id', msgId).single();
        
        if (m) {
          const text = `📬 <b>Message:</b>\n<b>From:</b> ${m.full_name}\n<b>Email:</b> ${m.email}\n\n${m.content}`;
          const isReadBtn = m.is_read 
            ? { text: '🔴 Mark Unread', callback_data: `unrd_msg_${m.id}` }
            : { text: '✅ Mark Read', callback_data: `mk_msg_${m.id}` };

          await telegramAPI('editMessageText', {
            chat_id: chatId,
            message_id: messageId,
            text: text,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [ isReadBtn, { text: '🗑 Delete', callback_data: `dl_msg_${m.id}` } ],
                [ { text: '🔙 Back', callback_data: 'view_inbox' } ]
              ]
            }
          });
        }
      }

      else if (data.startsWith('mk_msg_')) {
        const msgId = data.replace('mk_msg_', '');
        await supabase.from('messages').update({ is_read: true }).eq('id', msgId);
        await supabase.from('activity_logs').insert({ action: 'MESSAGE_READ', details: { id: msgId }, admin_email: 'telegram_c2' });
        
        await telegramAPI('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `✅ Message marked as read.`,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Inbox', callback_data: 'view_inbox' }]] }
        });
      }

      else if (data.startsWith('unrd_msg_')) {
        const msgId = data.replace('unrd_msg_', '');
        await supabase.from('messages').update({ is_read: false }).eq('id', msgId);
        await supabase.from('activity_logs').insert({ action: 'MESSAGE_UNREAD', details: { id: msgId }, admin_email: 'telegram_c2' });
        
        await telegramAPI('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `🔴 Message marked as unread.`,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Inbox', callback_data: 'view_inbox' }]] }
        });
      }

      // --- DELETE MESSAGE (2-STEP) ---
      else if (data.startsWith('dl_msg_')) {
        const msgId = data.replace('dl_msg_', '');
        await telegramAPI('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `⚠️ <b>Are you sure you want to permanently delete this message?</b>\nThis action cannot be undone.`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '✅ Delete', callback_data: `cfm_del_${msgId}` }],
              [{ text: '❌ Cancel', callback_data: 'show_all_msgs' }]
            ]
          }
        });
      }

      else if (data.startsWith('cfm_del_')) {
        const msgId = data.replace('cfm_del_', '');
        await supabase.from('messages').delete().eq('id', msgId);
        await supabase.from('activity_logs').insert({ action: 'MESSAGE_DELETED', details: { id: msgId }, admin_email: 'telegram_c2' });
        
        await telegramAPI('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `🗑 Message deleted permanently.`,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Messages', callback_data: 'show_all_msgs' }]] }
        });
      }

      // --- UNBLOCK IP (2-STEP) ---
      else if (data.startsWith('ublk_')) {
        const ipToUnblock = data.replace('ublk_', '');
        await telegramAPI('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `⚠️ <b>Are you sure you want to unblock this IP?</b>\nIP: <code>${ipToUnblock}</code>`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '✅ Unblock', callback_data: `cfm_unb_${ipToUnblock}` }],
              [{ text: '❌ Cancel', callback_data: 'back_to_menu' }]
            ]
          }
        });
      }
      
      else if (data.startsWith('cfm_unb_')) {
        const ipToUnblock = data.replace('cfm_unb_', '');
        await supabase.from('blocked_ips').delete().eq('ip', ipToUnblock);
        await supabase.from('activity_logs').insert({ action: 'IP_UNBLOCKED', details: { ip: ipToUnblock }, admin_email: 'telegram_c2' });

        await telegramAPI('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `✅ <b>IP <code>${ipToUnblock}</code> UNBLOCKED FROM TELEGRAM C2</b>`,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]] }
        });
      }
      
      else if (data === 'ignore_msg') {
        const originalText = callbackQuery.message?.text || '';
        await telegramAPI('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `${originalText}\n\n<b>[👀 System: Notification Ignored]</b>`,
          parse_mode: 'HTML'
        });
      }

      await telegramAPI('answerCallbackQuery', { callback_query_id: callbackQuery.id });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram Webhook Error:', error);
    return NextResponse.json({ ok: true });
  }
}
