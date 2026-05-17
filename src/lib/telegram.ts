// src/lib/telegram.ts
// Отправка уведомлений партнёрам через Telegram

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ''

interface BookingForNotification {
  tourist_name: string
  tourist_phone: string
  booking_date: string
  booking_time?: string | null
  guests_count: number
  total_price: number
  status: string
  activity?: {
    title: string
    partner_id?: string
    partners?: {
      name: string
      telegram_chat_id?: string | null
    } | null
  } | null
}

export async function sendTelegramNotification(booking: BookingForNotification) {
  if (!BOT_TOKEN) return

  const partner = (booking.activity as { partners?: { telegram_chat_id?: string | null } | null } | null)?.partners
  const chatId = partner?.telegram_chat_id

  if (!chatId) return // у партнёра нет telegram_chat_id

  const statusEmoji: Record<string, string> = {
    paid: '✅',
    confirmed: '☑️',
    pending: '⏳',
    cancelled: '❌',
  }

  const text = [
    `${statusEmoji[booking.status] ?? '📋'} Новая бронь`,
    ``,
    `🎯 ${booking.activity?.title ?? 'Активность'}`,
    `📅 ${booking.booking_date}${booking.booking_time ? ` в ${booking.booking_time}` : ''}`,
    `👥 ${booking.guests_count} чел.`,
    `💰 ${booking.total_price.toLocaleString('ru-RU')} ₽`,
    ``,
    `👤 ${booking.tourist_name}`,
    `📞 ${booking.tourist_phone}`,
  ].join('\n')

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  }).catch(() => {}) // не роняем сервер если Telegram недоступен
}

// Уведомление нам (операторам) о любой новой брони
export async function notifyOperator(text: string) {
  if (!BOT_TOKEN) return
  const operatorChatId = process.env.TELEGRAM_OPERATOR_CHAT_ID
  if (!operatorChatId) return

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: operatorChatId, text }),
  }).catch(() => {})
}
