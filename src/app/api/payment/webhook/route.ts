// src/app/api/payment/webhook/route.ts
// YooKassa шлёт сюда уведомления об оплате
// Настройте в ЛК YooKassa: URL вебхука = https://giddel.ru/api/payment/webhook

import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { sendTelegramNotification } from '@/lib/telegram'

export async function POST(request: Request) {
  const body = await request.json()

  if (body.event !== 'payment.succeeded') {
    return Response.json({ ok: true }) // игнорируем другие события
  }

  const paymentId = body.object?.id
  const bookingId = body.object?.metadata?.booking_id

  if (!bookingId) return Response.json({ error: 'no booking_id' }, { status: 400 })

  // Помечаем бронь как оплаченную
  const { data: booking } = await supabase
    .from('bookings')
    .update({ status: 'paid', payment_id: paymentId })
    .eq('id', bookingId)
    .select('*, activity:activities(title, partner_id, partners(name, phone))')
    .single()

  if (!booking) return Response.json({ error: 'booking not found' }, { status: 404 })

  // Telegram-уведомление партнёру
  await sendTelegramNotification(booking)

  return Response.json({ ok: true })
}
