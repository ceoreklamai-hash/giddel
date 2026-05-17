// src/app/api/admin/action/route.ts
// Исполняет действия из AI-ассистента: добавляет активности, виноделни, обновляет статусы

import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

interface AddActivityData {
  title: string
  category: string
  price_from: number
  duration_hours?: number
  location_name?: string
  description?: string
  slug: string
}

interface AddWineryData {
  name: string
  region: string
  price_from?: number
  tour_types?: string[]
  story?: string
  slug: string
}

interface UpdateBookingData {
  id: string
  status: string
}

type ActionPayload =
  | { action: 'add_activity' } & AddActivityData
  | { action: 'add_winery' } & AddWineryData
  | { action: 'update_booking' } & UpdateBookingData

export async function POST(request: Request) {
  try {
    const payload = await request.json() as ActionPayload

    switch (payload.action) {
      case 'add_activity': {
        const slug = payload.slug ?? payload.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const { data, error } = await supabase.from('activities').insert({
          slug,
          title: payload.title,
          category: payload.category,
          price_from: payload.price_from ?? 0,
          duration_hours: payload.duration_hours ?? 2,
          location_name: payload.location_name ?? null,
          description: payload.description ?? null,
          is_active: true,
        }).select('id, title, slug').single()

        if (error) return Response.json({ error: error.message }, { status: 500 })
        return Response.json({ ok: true, message: `Активность "${data.title}" добавлена`, data })
      }

      case 'add_winery': {
        const slug = payload.slug ?? payload.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const { data, error } = await supabase.from('wines').insert({
          slug,
          name: payload.name,
          region: payload.region,
          price_from: payload.price_from ?? null,
          tour_types: payload.tour_types ?? ['Дегустация'],
          story: payload.story ?? null,
          images: [],
          rating: null,
          lat: null,
          lng: null,
        }).select('id, name, slug').single()

        if (error) return Response.json({ error: error.message }, { status: 500 })
        return Response.json({ ok: true, message: `Винодельня "${data.name}" добавлена`, data })
      }

      case 'update_booking': {
        const validStatuses = ['pending', 'paid', 'confirmed', 'cancelled']
        if (!validStatuses.includes(payload.status)) {
          return Response.json({ error: 'Недопустимый статус' }, { status: 400 })
        }
        const { error } = await supabase
          .from('bookings')
          .update({ status: payload.status })
          .eq('id', payload.id)

        if (error) return Response.json({ error: error.message }, { status: 500 })
        return Response.json({ ok: true, message: `Статус брони обновлён: ${payload.status}` })
      }

      default:
        return Response.json({ error: 'Неизвестное действие' }, { status: 400 })
    }
  } catch (err) {
    console.error('[admin/action]', err)
    return Response.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
