// src/app/api/bookings/status/route.ts
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

const VALID_STATUSES = ['pending', 'paid', 'confirmed', 'cancelled'] as const

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json() as { id: string; status: string }

    if (!id || !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
      return Response.json({ error: 'Неверные параметры' }, { status: 400 })
    }

    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('[bookings/status]', error.message)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('[bookings/status]', err)
    return Response.json({ error: 'Внутренняя ошибка' }, { status: 500 })
  }
}
