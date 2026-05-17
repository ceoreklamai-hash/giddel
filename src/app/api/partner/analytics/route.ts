// src/app/api/partner/analytics/route.ts
// Отчётность партнёра: доходы, комиссии, статистика по месяцам

import { supabase } from '@/lib/supabase'

async function getPartner(token: string) {
  const { data } = await supabase
    .from('partners')
    .select('id, name')
    .eq('portal_token', token)
    .limit(1)
  return data?.[0] ?? null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  if (!token) return Response.json({ error: 'no token' }, { status: 401 })

  const partner = await getPartner(token)
  if (!partner) return Response.json({ error: 'bad token' }, { status: 401 })

  // Активности партнёра
  const { data: activities } = await supabase
    .from('activities')
    .select('id, title')
    .eq('partner_id', partner.id)

  const activityIds = (activities ?? []).map(a => a.id)
  if (activityIds.length === 0) {
    return Response.json({ stats: null, monthly: [], recent: [] })
  }

  // Все брони (кроме отменённых)
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, status, total_price, commission_amount, booking_date, created_at, tourist_name, guests_count, activity:activities(title)')
    .in('activity_id', activityIds)
    .neq('status', 'cancelled')
    .order('booking_date', { ascending: false })

  const all = bookings ?? []

  // Общая статистика
  const paid = all.filter(b => b.status === 'paid' || b.status === 'confirmed')
  const pending = all.filter(b => b.status === 'pending')

  const totalRevenue = paid.reduce((s, b) => s + b.total_price, 0)
  const totalCommission = paid.reduce((s, b) => s + b.commission_amount, 0)
  const partnerEarnings = totalRevenue - totalCommission
  const totalGuests = paid.reduce((s, b) => s + b.guests_count, 0)

  // По месяцам (последние 6)
  const monthMap: Record<string, { revenue: number; bookings: number; guests: number }> = {}
  paid.forEach(b => {
    const month = b.booking_date.slice(0, 7) // YYYY-MM
    if (!monthMap[month]) monthMap[month] = { revenue: 0, bookings: 0, guests: 0 }
    monthMap[month].revenue += b.total_price
    monthMap[month].bookings += 1
    monthMap[month].guests += b.guests_count
  })

  const monthly = Object.entries(monthMap)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 6)
    .map(([month, data]) => ({ month, ...data }))
    .reverse()

  // Последние 10 броней
  const recent = all.slice(0, 10)

  return Response.json({
    stats: {
      totalRevenue,
      totalCommission,
      partnerEarnings,
      paidBookings: paid.length,
      pendingBookings: pending.length,
      totalGuests,
    },
    monthly,
    recent,
  })
}
