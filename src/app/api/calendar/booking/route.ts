// src/app/api/calendar/booking/route.ts
// GET /api/calendar/booking?id=xxx
// Скачать .ics для конкретного бронирования (для клиента)
import { supabase } from '@/lib/supabase'

function formatICalDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function escape(str: string): string {
  return str.replace(/[\\;,]/g, c => '\\' + c).replace(/\n/g, '\\n')
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return new Response('Missing id', { status: 400 })

  const { data: b, error } = await supabase
    .from('bookings')
    .select('*, activity:activities(title, category, location_name)')
    .eq('id', id)
    .single()

  if (error || !b) return new Response('Not found', { status: 404 })

  const activity = b.activity as { title: string; category: string; location_name: string | null } | null
  const title = activity?.title ?? 'Активность'
  const location = activity?.location_name ?? 'Краснодарский край'
  const dateStart = formatICalDate(b.booking_date)
  const dateEnd = formatICalDate(new Date(new Date(b.booking_date).getTime() + 2 * 3600 * 1000).toISOString())
  const desc = `Ваше бронирование в Giddel\\nГостей: ${b.guests_count}\\nТелефон для связи: +7 (800) 000-00-00\\ngiddel.ru`

  const ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Giddel//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:booking-${b.id}@giddel.ru`,
    `DTSTAMP:${formatICalDate(new Date().toISOString())}`,
    `DTSTART:${dateStart}`,
    `DTEND:${dateEnd}`,
    `SUMMARY:${escape(title)} — Giddel`,
    `DESCRIPTION:${escape(desc)}`,
    `LOCATION:${escape(location)}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Напоминание: ${escape(title)} завтра`,
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escape(title)} — через 1 час`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return new Response(ical, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="booking-${id}.ics"`,
    },
  })
}
