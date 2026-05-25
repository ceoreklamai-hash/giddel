// src/app/api/utesov/route.ts
export async function POST(request: Request) {
  const { name, phone, guests, date, comment } = await request.json()

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_OPERATOR_CHAT_ID

  if (token && chatId) {
    const text = [
      '🍷 <b>Заявка на винный тур — Утёсов</b>',
      `👤 Имя: ${name}`,
      `📞 Телефон: ${phone}`,
      `👥 Гостей: ${guests}`,
      date ? `📅 Дата: ${date}` : '',
      comment ? `💬 Комментарий: ${comment}` : '',
    ].filter(Boolean).join('\n')

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
  }

  return Response.json({ ok: true })
}
