// src/app/api/admin/activity/route.ts
import { supabase } from '@/lib/supabase'

function toSlug(title: string) {
  return title.toLowerCase()
    .replace(/[а-яё]/g, c => ({'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'}[c] ?? c))
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    + '-' + Date.now().toString(36)
}

export async function POST(request: Request) {
  const body = await request.json()
  const slug = toSlug(body.title)
  const { data, error } = await supabase.from('activities').insert({
    slug,
    title: body.title,
    category: body.category,
    price_from: body.price_from ?? 0,
    duration_hours: body.duration_hours ?? 2,
    location_name: body.location_name || null,
    description: body.description || null,
    partner_id: body.partner_id || null,
    is_active: true,
  }).select('id, title, category, price_from, is_active, partner_id, location_name').single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true, activity: data })
}

export async function PATCH(request: Request) {
  const { id, ...updates } = await request.json()
  const { error } = await supabase.from('activities').update(updates).eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
