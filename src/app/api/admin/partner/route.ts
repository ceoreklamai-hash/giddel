// src/app/api/admin/partner/route.ts
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()
  const { data, error } = await supabase.from('partners').insert({
    name: body.name,
    phone: body.phone || null,
    email: body.email || null,
  }).select('id, name, phone, email, portal_token').single()
  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Обновляем комиссию у будущих активностей партнёра через default
  return Response.json({ ok: true, partner: data })
}
