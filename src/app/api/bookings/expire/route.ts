// src/app/api/bookings/expire/route.ts
// Отменяет бронирования, не подтверждённые за 30 минут
import { supabase } from '@/lib/supabase'

export async function POST() {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('status', 'pending')
    .lt('expires_at', new Date().toISOString())
    .select('id')

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ cancelled: data?.length ?? 0 })
}
