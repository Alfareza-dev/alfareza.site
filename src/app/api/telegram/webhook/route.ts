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

    // HANDLE MESSAGES (/menu command)
    if (body.message) {
      const chatId = body.message.chat.id.toString();
      
      // SILENTLY DROP UNAUTHORIZED
      if (chatId !== String(TELEGRAM_CHAT_ID)) {
        return NextResponse.json({ ok: true });
      }

      const text = body.message.text || '';
      
      if (text.startsWith('/menu')) {
        const { count: logsCount, error } = await supabase.from('activity_logs').select('*', { count: 'exact', head: true });
        if (error) console.error('Supabase error fetching activity logs:', error);
        
        const messageText = `🎛️ <b>C2 Dashboard Menu</b>\n\n📊 Total Activity Logs: ${logsCount || 0}\n\nSelect an action below:`;
        
        await telegramAPI('sendMessage', {
          chat_id: chatId,
          text: messageText,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🛠 Toggle Maintenance Mode', callback_data: 'toggle_maintenance' }],
              [{ text: '📥 View Unread Inbox', callback_data: 'view_inbox' }]
            ]
          }
        });
      }
    }

    // HANDLE INLINE BUTTON CALLBACKS
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const chatId = callbackQuery.message.chat.id.toString();
      const messageId = callbackQuery.message.message_id;
      
      // SILENTLY DROP UNAUTHORIZED
      if (chatId !== String(TELEGRAM_CHAT_ID)) {
        return NextResponse.json({ ok: true });
      }

      const data = callbackQuery.data;

      // Toggle Maintenance Mode
      if (data === 'toggle_maintenance') {
        const { data: setting, error: fetchErr } = await supabase.from('site_settings').select('value').eq('key', 'maintenance_mode').single();
        if (fetchErr) console.error('Supabase error fetching settings:', fetchErr);
        
        const newVal = setting?.value === 'true' ? 'false' : 'true';
        
        // Update database
        const { error: upsertErr } = await supabase.from('site_settings').upsert({
          key: 'maintenance_mode',
          value: newVal,
          updated_at: new Date().toISOString()
        });
        if (upsertErr) console.error('Supabase error updating settings:', upsertErr);

        // Edit the message to show confirmation
        await telegramAPI('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `✅ Maintenance mode turned <b>${newVal === 'true' ? 'ON' : 'OFF'}</b>.`,
          parse_mode: 'HTML'
        });
      }

      // View Unread Inbox (Schema: messages)
      if (data === 'view_inbox') {
        const { data: messages, error } = await supabase.from('messages')
          .select('*')
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(5);
        if (error) console.error('Supabase error fetching messages:', error);

        let text = messages && messages.length > 0 ? `📥 <b>Unread Inbox:</b>\n\n` : `📥 <b>Inbox Empty! All caught up.</b>`;
        let buttons: any[] = [];

        if (messages) {
          messages.forEach((m: any, idx: number) => {
            text += `${idx + 1}. From: ${m.full_name || m.email}\n`;
            buttons.push({ text: `Read [${idx + 1}]`, callback_data: `rd_msg_${m.id}` });
          });
        }

        const keyboard = buttons.length ? { inline_keyboard: [buttons] } : undefined;

        await telegramAPI('sendMessage', {
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
      }

      // Read Specific Message
      if (data.startsWith('rd_msg_')) {
        const msgId = data.replace('rd_msg_', '');
        const { data: m, error } = await supabase.from('messages').select('*').eq('id', msgId).single();
        if (error) console.error('Supabase error reading msg:', error);
        
        if (m) {
          const text = `📬 <b>Message:</b>\n<b>From:</b> ${m.full_name}\n<b>Email:</b> ${m.email}\n\n${m.content}`;
          
          await telegramAPI('sendMessage', {
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '✅ Mark Read', callback_data: `mk_msg_${m.id}` },
                  { text: '🗑 Delete', callback_data: `dl_msg_${m.id}` }
                ]
              ]
            }
          });
        }
      }

      // Mark Message as Read
      if (data.startsWith('mk_msg_')) {
        const msgId = data.replace('mk_msg_', '');
        const { error } = await supabase.from('messages').update({ is_read: true }).eq('id', msgId);
        if (error) console.error('Supabase error marking msg read:', error);
        
        await telegramAPI('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `✅ Message marked as read.`,
          parse_mode: 'HTML'
        });
      }

      // Delete Message
      if (data.startsWith('dl_msg_')) {
        const msgId = data.replace('dl_msg_', '');
        const { error } = await supabase.from('messages').delete().eq('id', msgId);
        if (error) console.error('Supabase error deleting msg:', error);
        
        await telegramAPI('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `🗑 Message deleted permanently.`,
          parse_mode: 'HTML'
        });
      }

      // Acknowledge callback query to remove loading state on the button
      await telegramAPI('answerCallbackQuery', {
        callback_query_id: callbackQuery.id
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram Webhook Error:', error);
    // Always return ok: true so Telegram doesn't retry failed deliveries endlessly
    return NextResponse.json({ ok: true });
  }
}
