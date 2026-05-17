// src/app/api/partner/availability/route.ts
// GET  ?token=xxx  — расписание партнёра (7 дней)
// POST ?token=xxx  — сохранить расписание

import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

const DAYS = 7

interface DaySchedule {
  day_of_week: number
  is_active: boolean
  time_from: string
  time_to: string
}

async function getPartner(token: string) {
  const { data } = await supabase
    .from('partners')
    .select('id')
    .eq('portal_token', token)
    .limit(1)
  return data?.[0] ?? null
}

function defaultSchedule(): DaySchedule[] {
  return Array.from({ length: DAYS }, (_, i) => ({
    day_of_week: i,
    is_active: i < 5, // Пн–Пт активны, Сб/Вс — выходные
    time_from: '09:00',
    time_to: '18:00',
  }))
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  if (!token) return Response.json({ error: 'no token' }, { status: 401 })

  const partner = await getPartner(token)
  if (!partner) return Response.json({ error: 'bad token' }, { status: 401 })

  const { data } = await supabase
    .from('partner_availability')
    .select('day_of_week, is_active, time_from, time_to')
    .eq('partner_id', partner.id)
    .order('day_of_week')

  // Если записей ещё нет — отдаём дефолт
  const saved = data ?? []
  const schedule = defaultSchedule().map(def => {
    const found = saved.find(r => r.day_of_week === def.day_of_week)
    return found ?? def
  })

  return Response.json({ schedule })
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  if (!token) return Response.json({ error: 'no token' }, { status: 401 })

  const partner = await getPartner(token)
  if (!partner) return Response.json({ error: 'bad token' }, { status: 401 })

  const body = await request.json() as { schedule: DaySchedule[] }
  if (!Array.isArray(body.schedule)) return Response.json({ error: 'bad body' }, { status: 400 })

  const rows = body.schedule.map(d => ({
    partner_id: partner.id,
    day_of_week: d.day_of_week,
    is_active: d.is_active,
    time_from: d.time_from,
    time_to: d.time_to,
  }))

  const { error } = await supabase
    .from('partner_availability')
    .upsert(rows, { onConflict: 'partner_id,day_of_week' })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
