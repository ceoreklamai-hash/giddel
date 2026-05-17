// src/app/api/payment/create/route.ts
// Создаём платёж в YooKassa, сохраняем бронь со статусом pending

import { supabase } from '@/lib/supabase'
import { randomUUID } from 'crypto'

const YK_SHOP_ID = process.env.YOOKASSA_SHOP_ID ?? ''
const YK_SECRET = process.env.YOOKASSA_SECRET_KEY ?? ''
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://giddel.netlify.app'

export async function POST(request: Request) {
  const body = await request.json() as {
    activity_id: string
    tourist_name: string
    tourist_phone: string
    tourist_email: string
    booking_date: string
    booking_time?: string
    guests_count: number
    ref_code?: string
  }

  // Получаем активность
  const { data: activity } = await supabase
    .from('activities')
    .select('id, title, price_from, commission_pct, partner_id')
    .eq('id', body.activity_id)
    .single()

  if (!activity) return Response.json({ error: 'Активность не найдена' }, { status: 404 })

  const total = activity.price_from * body.guests_count
  const commission = Math.round(total * (activity.commission_pct ?? 10) / 100)
  const idempotenceKey = randomUUID()

  // Создаём бронь со статусом pending
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      activity_id: body.activity_id,
      tourist_name: body.tourist_name,
      tourist_phone: body.tourist_phone,
      tourist_email: body.tourist_email,
      booking_date: body.booking_date,
      booking_time: body.booking_time ?? null,
      guests_count: body.guests_count,
      total_price: total,
      commission_amount: commission,
      status: 'pending',
      source: 'online',
      ref_code: body.ref_code ?? null,
      expires_at: expiresAt,
    })
    .select('id')
    .single()

  if (bookingError) return Response.json({ error: bookingError.message }, { status: 500 })

  // Если YooKassa не настроена — возвращаем бронь без оплаты (тест-режим)
  if (!YK_SHOP_ID || !YK_SECRET) {
    return Response.json({
      ok: true,
      booking_id: booking.id,
      payment_url: null, // без оплаты
      test_mode: true,
    })
  }

  // Создаём платёж в YooKassa
  const ykRes = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotence-Key': idempotenceKey,
      'Authorization': `Basic ${Buffer.from(`${YK_SHOP_ID}:${YK_SECRET}`).toString('base64')}`,
    },
    body: JSON.stringify({
      amount: { value: total.toFixed(2), currency: 'RUB' },
      confirmation: {
        type: 'redirect',
        return_url: `${BASE_URL}/booking/success?id=${booking.id}`,
      },
      description: `${activity.title} — ${body.guests_count} чел. — ${body.booking_date}`,
      metadata: { booking_id: booking.id },
      capture: true,
    }),
  })

  if (!ykRes.ok) {
    const err = await ykRes.text()
    return Response.json({ error: `YooKassa: ${err}` }, { status: 500 })
  }

  const payment = await ykRes.json()

  // Сохраняем payment_id
  await supabase
    .from('bookings')
    .update({ payment_id: payment.id })
    .eq('id', booking.id)

  return Response.json({
    ok: true,
    booking_id: booking.id,
    payment_url: payment.confirmation.confirmation_url,
    payment_id: payment.id,
  })
}
