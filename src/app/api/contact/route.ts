import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Consider using ANON key if strictly client-facing, but SERVICE key ensures bypass of initial RLS for backend API logic.
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { full_name, email, subject, content } = body;

    if (!full_name || !email || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Insert into Supabase `messages` table
    const { data: insertedMessage, error: insertError } = await supabase
      .from('messages')
      .insert([{ full_name, email, subject, content }])
      .select('id')
      .single();

    if (insertError || !insertedMessage) {
      console.error('Failed to save message:', insertError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // 2. Trigger Real-Time Telegram SOC Alert
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (botToken && chatId) {
      const messageId = insertedMessage.id;
      const text = `📬 <b>New Message Received!</b>\n\n<b>From:</b> ${full_name}\n<b>Email:</b> ${email}\n<b>Subject:</b> ${subject || 'No Subject'}`;
      
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '📖 Read Message', callback_data: `rd_msg_${messageId}` },
                  { text: '🗑 Delete', callback_data: `dl_msg_${messageId}` }
                ],
                [
                  { text: '👀 Ignore', callback_data: 'ignore_msg' }
                ]
              ]
            }
          })
        });
      } catch (telegramErr) {
        console.error('Failed to dispatch Telegram alert:', telegramErr);
      }
    }

    return NextResponse.json({ success: true, message: 'Message securely delivered.' }, { status: 200 });
  } catch (error) {
    console.error('Contact Form Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
