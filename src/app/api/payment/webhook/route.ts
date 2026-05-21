// src/app/api/payment/webhook/route.ts
// YooKassa шлёт сюда уведомления об оплате
// Настройте в ЛК YooKassa: URL вебхука = https://giddel.ru/api/payment/webhook

import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { sendTelegramNotification } from '@/lib/telegram'
import { sendBookingConfirmation, sendReviewInvitation } from '@/lib/email'

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

  // Email клиенту — подтверждение оплаты
  if (booking.tourist_email) {
    await sendBookingConfirmation({
      to: booking.tourist_email,
      touristName: booking.tourist_name,
      activityTitle: (booking.activity as { title: string })?.title ?? '',
      bookingDate: booking.booking_date,
      bookingTime: booking.booking_time,
      guestsCount: booking.guests_count,
      totalPrice: booking.total_price,
      bookingId: booking.id,
    })

    // Приглашение на отзыв — отправляем через день после активности
    const activityDate = new Date(booking.booking_date)
    const now = new Date()
    const msDelay = activityDate.getTime() + 24 * 60 * 60 * 1000 - now.getTime()
    if (msDelay > 0 && msDelay < 7 * 24 * 60 * 60 * 1000) {
      // Только если активность в ближайшую неделю — откладываем на следующий день
      setTimeout(() => {
        sendReviewInvitation({
          to: booking.tourist_email!,
          touristName: booking.tourist_name,
          activityTitle: (booking.activity as { title: string })?.title ?? '',
          bookingId: booking.id,
        })
      }, msDelay)
    }
  }

  return Response.json({ ok: true })
}
