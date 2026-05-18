// src/app/api/partner/busy-slots/route.ts
// GET ?token=xxx&date=YYYY-MM-DD&activity_id=xxx  — занятые слоты
// POST ?token=xxx  — добавить/убрать слот
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

const ALL_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']

async function getPartner(token: string) {
  const { data } = await supabase.from('partners').select('id').eq('portal_token', token).single()
  return data
}

// GET — слоты для конкретной даты и активности
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const date = searchParams.get('date')
  const activityId = searchParams.get('activity_id')

  if (!token || !date || !activityId) return Response.json({ error: 'missing params' }, { status: 400 })

  const partner = await getPartner(token)
  if (!partner) return Response.json({ error: 'bad token' }, { status: 401 })

  // Слоты заблокированные вручную
  const { data: manualSlots } = await supabase
    .from('partner_busy_slots')
    .select('time_slot, reason')
    .eq('activity_id', activityId)
    .eq('partner_id', partner.id)
    .eq('date', date)

  // Брони на эту дату
  const { data: bookings } = await supabase
    .from('bookings')
    .select('booking_time, id, tourist_name')
    .eq('activity_id', activityId)
    .eq('booking_date', date)
    .neq('status', 'cancelled')

  const busyFromBookings = (bookings ?? [])
    .filter(b => b.booking_time)
    .map(b => ({ time_slot: b.booking_time as string, reason: `booking:${b.id}`, tourist: b.tourist_name }))

  const busyManual = (manualSlots ?? []).map(s => ({ time_slot: s.time_slot, reason: s.reason, tourist: null }))

  // Объединяем
  const busyMap = new Map<string, { reason: string; tourist: string | null }>()
  busyFromBookings.forEach(s => busyMap.set(s.time_slot, { reason: s.reason, tourist: s.tourist }))
  busyManual.forEach(s => { if (!busyMap.has(s.time_slot)) busyMap.set(s.time_slot, { reason: s.reason, tourist: null }) })

  const slots = ALL_SLOTS.map(time => ({
    time,
    status: busyMap.has(time) ? 'busy' : 'free',
    reason: busyMap.get(time)?.reason ?? null,
    tourist: busyMap.get(time)?.tourist ?? null,
  }))

  return Response.json({ slots })
}

// POST — переключить слот (занять/освободить)
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  if (!token) return Response.json({ error: 'no token' }, { status: 401 })

  const partner = await getPartner(token)
  if (!partner) return Response.json({ error: 'bad token' }, { status: 401 })

  const { activity_id, date, time_slot, action } = await request.json() as {
    activity_id: string; date: string; time_slot: string; action: 'block' | 'unblock'
  }

  if (action === 'block') {
    await supabase.from('partner_busy_slots').upsert({
      activity_id, partner_id: partner.id, date, time_slot, reason: 'manual'
    }, { onConflict: 'activity_id,date,time_slot' })
  } else {
    await supabase.from('partner_busy_slots').delete()
      .eq('activity_id', activity_id).eq('partner_id', partner.id)
      .eq('date', date).eq('time_slot', time_slot)
  }

  return Response.json({ ok: true })
}
