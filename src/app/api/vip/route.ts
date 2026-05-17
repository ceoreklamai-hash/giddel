// src/app/api/vip/route.ts
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Генерируем красивый ID
    const requestId = `VIP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`

    const { error } = await supabase.from('vip_requests').insert({
      request_id: requestId,
      dates_from: body.dates_from || null,
      dates_to: body.dates_to || null,
      guests_count: body.guests_count ?? 2,
      budget_tier: body.budget_tier ?? 'comfort',
      wishes: body.wishes ?? '',
      needs: body.needs ?? {},
      contact_method: body.contact_method ?? 'telegram',
      contact_value: body.contact_value ?? '',
      ref_code: body.ref_code ?? null,
    })

    if (error) {
      console.error('[vip]', error.message)
      return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ ok: true, request_id: requestId })
  } catch (err) {
    console.error('[vip]', err)
    return Response.json({ error: 'Ошибка' }, { status: 500 })
  }
}
