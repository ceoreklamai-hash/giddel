// src/app/api/reminders/route.ts
// GET — список бронирований на завтра (для cron)
// POST — пометить напоминание отправленным

import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const validToken = process.env.CALENDAR_TOKEN ?? 'giddel-calendar'
  if (token !== validToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Бронирования на завтра, которым ещё не отправляли напоминание
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateStr = tomorrow.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('bookings')
    .select('*, activity:activities(title, location_name)')
    .eq('status', 'confirmed')
    .gte('booking_date', dateStr + 'T00:00:00')
    .lte('booking_date', dateStr + 'T23:59:59')
    .is('reminder_sent_at', null)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ bookings: data ?? [], date: dateStr })
}

export async function POST(request: Request) {
  const { id } = await request.json() as { id: string }
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabase
    .from('bookings')
    .update({ reminder_sent_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
