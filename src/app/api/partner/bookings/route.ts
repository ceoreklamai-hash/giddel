// src/app/api/partner/bookings/route.ts
// GET  ?token=xxx  — брони партнёра
// POST             — партнёр добавляет ручную бронь

import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

async function getPartner(token: string) {
  const { data } = await supabase
    .from('partners')
    .select('id, name')
    .eq('portal_token', token)
    .single()
  return data
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  if (!token) return Response.json({ error: 'Нет токена' }, { status: 401 })

  const partner = await getPartner(token)
  if (!partner) return Response.json({ error: 'Неверный токен' }, { status: 401 })

  // Все активности этого партнёра
  const { data: activities } = await supabase
    .from('activities')
    .select('id, title, category, price_from')
    .eq('partner_id', partner.id)
    .eq('is_active', true)

  // Брони по этим активностям
  const activityIds = (activities ?? []).map(a => a.id)
  let bookings: unknown[] = []
  if (activityIds.length > 0) {
    const { data } = await supabase
      .from('bookings')
      .select('*, activity:activities(title, category)')
      .in('activity_id', activityIds)
      .order('booking_date', { ascending: true })
    bookings = data ?? []
  }

  return Response.json({ partner, activities: activities ?? [], bookings })
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  if (!token) return Response.json({ error: 'Нет токена' }, { status: 401 })

  const partner = await getPartner(token)
  if (!partner) return Response.json({ error: 'Неверный токен' }, { status: 401 })

  const body = await request.json() as {
    activity_id: string
    tourist_name: string
    tourist_phone: string
    booking_date: string
    booking_time?: string
    guests_count: number
    note?: string
    source?: string
  }

  // Проверяем, что активность принадлежит этому партнёру
  const { data: activity } = await supabase
    .from('activities')
    .select('id, price_from, commission_pct')
    .eq('id', body.activity_id)
    .eq('partner_id', partner.id)
    .single()

  if (!activity) return Response.json({ error: 'Активность не найдена' }, { status: 403 })

  const total = activity.price_from * (body.guests_count || 1)
  const commission = Math.round(total * (activity.commission_pct ?? 10) / 100)

  const { data, error } = await supabase.from('bookings').insert({
    activity_id: body.activity_id,
    tourist_name: body.tourist_name,
    tourist_phone: body.tourist_phone,
    tourist_email: '',
    booking_date: body.booking_date,
    booking_time: body.booking_time ?? null,
    guests_count: body.guests_count,
    total_price: total,
    commission_amount: commission,
    status: 'confirmed', // партнёр сам подтверждает свои ручные брони
    notes: body.note ?? null,
    source: body.source ?? 'partner_manual',
  }).select('id').single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true, id: data.id })
}
