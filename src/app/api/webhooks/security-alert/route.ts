import { NextResponse } from 'next/server';

// Helper to convert 2-letter country code to flag emoji
function getFlagEmoji(countryCode: string | null) {
  if (!countryCode || countryCode.length !== 2) return '🏳️';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export async function POST(req: Request) {
  try {
    // 1. WEBHOOK AUTHENTICATION
    const secret = req.headers.get('x-webhook-secret');
    const expectedSecret = process.env.SUPABASE_WEBHOOK_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();

    // Ensure it's the correct event type and table (optional but good practice)
    if (payload.type !== 'INSERT' || payload.table !== 'activity_logs') {
      return NextResponse.json({ message: 'Ignored: Not an insert on activity_logs' }, { status: 200 });
    }

    const record = payload.record;
    
    // STRICT LOOP PREVENTION: Only process actual attack alerts
    const attackActions = ['HONEYPOT_TRIGGERED', 'SQL_INJECTION', 'XSS_ATTACK', 'BRUTE_FORCE'];
    if (!attackActions.includes(record.action)) {
      return NextResponse.json({ ok: true, message: `Ignored routine C2 action: ${record.action}` }, { status: 200 });
    }

    // 2. SCHEMA ADJUSTMENT - Extract Attacker Info
    const country = record.country || 'Unknown';
    const city = record.city || 'Unknown';
    const isp = record.isp || 'Unknown';
    const flag = getFlagEmoji(record.country);
    
    let ipAddress = 'Unknown IP';
    let userAgent = 'Unknown User-Agent';
    let requestedPath = 'Unknown Path';

    if (typeof record.details === 'string') {
      // Example details string: "Honeypot accessed at path: /.env | IP: 194.5.82.43 | User-Agent: Mozilla/5.0..."
      const pathMatch = record.details.match(/path:\s*([^|]+)/i);
      const ipMatch = record.details.match(/IP:\s*([^|]+)/i);
      const uaMatch = record.details.match(/User-Agent:\s*(.*)/i);

      if (pathMatch) requestedPath = pathMatch[1].trim();
      if (ipMatch) ipAddress = ipMatch[1].trim();
      if (uaMatch) userAgent = uaMatch[1].trim();
    }

    // 3. TELEGRAM UI IMPROVEMENT
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;

    if (telegramBotToken && telegramChatId) {
      const message = `🚨 <b>SECURITY ALERT!</b> 🚨

<b>IP:</b> <code>${ipAddress}</code>
<b>Location:</b> ${flag} ${city}, ${country}
<b>ISP:</b> ${isp}
<b>Target:</b> <code>${requestedPath}</code>
<b>User-Agent:</b> <code>${userAgent}</code>

⚠️ <b>Status: IP HAS BEEN BLOCKED</b>

<a href="https://alfareza.site/admin">View Dashboard</a>`;

      await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [{ text: `🔓 Unblock IP`, callback_data: `ublk_${ipAddress}` }]
            ]
          }
        }),
      });
    }

    return NextResponse.json({ success: true, message: 'Alert processed and sent to Telegram.' }, { status: 200 });

  } catch (error) {
    console.error('Security Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
