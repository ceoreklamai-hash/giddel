// src/app/api/activities/availability/route.ts
// GET ?activity_id=xxx&date=YYYY-MM-DD — свободные слоты для формы бронирования
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

const ALL_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const activityId = searchParams.get('activity_id')
  const date = searchParams.get('date')

  if (!activityId || !date) return Response.json({ free: ALL_SLOTS })

  // Занятые вручную партнёром
  const { data: manualBusy } = await supabase
    .from('partner_busy_slots')
    .select('time_slot')
    .eq('activity_id', activityId)
    .eq('date', date)

  // Занятые бронями
  const { data: bookings } = await supabase
    .from('bookings')
    .select('booking_time')
    .eq('activity_id', activityId)
    .eq('booking_date', date)
    .neq('status', 'cancelled')
    .not('booking_time', 'is', null)

  const busySlots = new Set([
    ...(manualBusy ?? []).map(s => s.time_slot),
    ...(bookings ?? []).map(b => b.booking_time as string),
  ])

  const free = ALL_SLOTS.filter(s => !busySlots.has(s))
  return Response.json({ free })
}
