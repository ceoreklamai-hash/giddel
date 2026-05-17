// src/app/api/payment/success/route.ts
// Проверяем статус платежа после редиректа с YooKassa

import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const bookingId = searchParams.get('id')

  if (!bookingId) return Response.json({ error: 'no id' }, { status: 400 })

  const { data } = await supabase
    .from('bookings')
    .select('id, status, total_price, booking_date, tourist_name, activity:activities(title)')
    .eq('id', bookingId)
    .single()

  return Response.json({ booking: data })
}
