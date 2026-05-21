// src/app/api/reviews/route.ts
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

// GET ?activity_id=xxx — отзывы для активности
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const activityId = searchParams.get('activity_id')
  if (!activityId) return Response.json({ reviews: [] })

  const { data } = await supabase
    .from('reviews')
    .select('id, tourist_name, rating, text, created_at')
    .eq('activity_id', activityId)
    .order('created_at', { ascending: false })

  return Response.json({ reviews: data ?? [] })
}

// POST — оставить отзыв по booking_id
export async function POST(request: Request) {
  const { booking_id, rating, text } = await request.json()

  if (!booking_id || !rating || rating < 1 || rating > 5) {
    return Response.json({ error: 'Некорректные данные' }, { status: 400 })
  }

  // Проверяем что бронь существует и оплачена/подтверждена
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, activity_id, tourist_name, tourist_email, status')
    .eq('id', booking_id)
    .single()

  if (!booking) return Response.json({ error: 'Бронь не найдена' }, { status: 404 })
  if (!['paid', 'confirmed'].includes(booking.status)) {
    return Response.json({ error: 'Отзыв можно оставить только после оплаты' }, { status: 403 })
  }

  // Проверяем что отзыв ещё не оставлен
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', booking_id)
    .single()

  if (existing) return Response.json({ error: 'Отзыв уже оставлен' }, { status: 409 })

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      booking_id,
      activity_id: booking.activity_id,
      tourist_name: booking.tourist_name,
      rating,
      text: text?.trim() || null,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ ok: true, review })
}
