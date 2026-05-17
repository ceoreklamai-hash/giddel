// src/app/api/calendar/feed/route.ts
// GET /api/calendar/feed?token=xxx
// iCal-лента для подключения в Google/Apple/Outlook Calendar
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
  const token = searchParams.get('token')

  // Простая защита — токен из env или дефолтный
  const validToken = process.env.CALENDAR_TOKEN ?? 'giddel-calendar'
  if (token !== validToken) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, activity:activities(title, category, location_name)')
    .in('status', ['confirmed', 'paid'])
    .order('booking_date', { ascending: true })

  if (error) {
    return new Response('Server Error', { status: 500 })
  }

  const events = (bookings ?? []).map(b => {
    const activity = b.activity as { title: string; category: string; location_name: string | null } | null
    const title = activity?.title ?? 'Активность'
    const location = activity?.location_name ?? 'Краснодарский край'
    const dateStart = formatICalDate(b.booking_date)
    // Ставим длительность 2 часа
    const dateEnd = formatICalDate(new Date(new Date(b.booking_date).getTime() + 2 * 3600 * 1000).toISOString())
    const desc = `Гость: ${b.tourist_name}\\nТелефон: ${b.tourist_phone}\\nГостей: ${b.guests_count}\\nСумма: ${b.total_price} руб`

    return [
      'BEGIN:VEVENT',
      `UID:booking-${b.id}@giddel.ru`,
      `DTSTAMP:${formatICalDate(new Date().toISOString())}`,
      `DTSTART:${dateStart}`,
      `DTEND:${dateEnd}`,
      `SUMMARY:${escape(title)} — ${escape(b.tourist_name)} (${b.guests_count} чел)`,
      `DESCRIPTION:${escape(desc)}`,
      `LOCATION:${escape(location)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n')
  })

  const ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Giddel//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Giddel — Бронирования',
    'X-WR-TIMEZONE:Europe/Moscow',
    'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')

  return new Response(ical, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="giddel-bookings.ics"',
      'Cache-Control': 'no-cache',
    },
  })
}
