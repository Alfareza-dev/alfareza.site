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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // HANDLE MESSAGES (/menu command)
    if (body.message) {
      const chatId = body.message.chat.id.toString();
      
      // SILENTLY DROP UNAUTHORIZED
      if (chatId !== TELEGRAM_CHAT_ID) {
        return NextResponse.json({ ok: true });
      }

      const text = body.message.text || '';
      
      if (text.startsWith('/menu')) {
        const { count: logsCount } = await supabase.from('activity_logs').select('*', { count: 'exact', head: true });
        
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
      if (chatId !== TELEGRAM_CHAT_ID) {
        return NextResponse.json({ ok: true });
      }

      const data = callbackQuery.data;

      // Toggle Maintenance Mode
      if (data === 'toggle_maintenance') {
        const { data: setting } = await supabase.from('site_settings').select('value').eq('key', 'maintenance_mode').single();
        const newVal = setting?.value === 'true' ? 'false' : 'true';
        
        // Update database
        await supabase.from('site_settings').upsert({
          key: 'maintenance_mode',
          value: newVal,
          updated_at: new Date().toISOString()
        });

        // Edit the message to show confirmation
        await telegramAPI('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `✅ Maintenance mode turned <b>${newVal === 'true' ? 'ON' : 'OFF'}</b>.`,
          parse_mode: 'HTML'
        });
      }

      // View Unread Inbox
      if (data === 'view_inbox') {
        const { data: messages } = await supabase.from('inbox')
          .select('*')
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(5);

        let text = messages && messages.length > 0 ? `📥 <b>Unread Inbox:</b>\n\n` : `📥 <b>Inbox Empty! All caught up.</b>`;
        let buttons: any[] = [];

        if (messages) {
          messages.forEach((m: any, idx: number) => {
            text += `${idx + 1}. From: ${m.name || m.email}\n`;
            buttons.push({ text: `Read [${idx + 1}]`, callback_data: `read_msg_${m.id}` });
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
      if (data.startsWith('read_msg_')) {
        const msgId = data.replace('read_msg_', '');
        const { data: m } = await supabase.from('inbox').select('*').eq('id', msgId).single();
        
        if (m) {
          const text = `📬 <b>Message:</b>\n<b>From:</b> ${m.name}\n<b>Email:</b> ${m.email}\n\n${m.message}`;
          
          await telegramAPI('sendMessage', {
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '✅ Mark Read', callback_data: `mark_msg_${m.id}` },
                  { text: '🗑 Delete', callback_data: `del_msg_${m.id}` }
                ]
              ]
            }
          });
        }
      }

      // Mark Message as Read
      if (data.startsWith('mark_msg_')) {
        const msgId = data.replace('mark_msg_', '');
        await supabase.from('inbox').update({ is_read: true }).eq('id', msgId);
        
        await telegramAPI('editMessageText', {
          chat_id: chatId,
          message_id: messageId,
          text: `✅ Message marked as read.`,
          parse_mode: 'HTML'
        });
      }

      // Delete Message
      if (data.startsWith('del_msg_')) {
        const msgId = data.replace('del_msg_', '');
        await supabase.from('inbox').delete().eq('id', msgId);
        
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
