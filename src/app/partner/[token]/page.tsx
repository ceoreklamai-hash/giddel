// src/app/partner/[token]/page.tsx
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PartnerClient } from '@/components/partner/PartnerClient'
import styles from './Partner.module.css'

interface Props {
  params: Promise<{ token: string }>
}

async function getPartnerData(token: string) {
  const { data: rows, error } = await supabase
    .from('partners')
    .select('id, name, phone, email, portal_token')
    .eq('portal_token', token)
    .limit(1)
  console.log('[partner]', { token, rows, error: error?.message })
  const partner = rows?.[0] ?? null
  if (!partner) return null

  const { data: activities } = await supabase
    .from('activities')
    .select('id, title, category, price_from, duration_hours, location_name')
    .eq('partner_id', partner.id)
    .eq('is_active', true)

  const activityIds = (activities ?? []).map(a => a.id)
  let bookings: unknown[] = []
  if (activityIds.length > 0) {
    const { data } = await supabase
      .from('bookings')
      .select('id, tourist_name, tourist_phone, booking_date, booking_time, guests_count, total_price, status, notes, source, created_at, activity:activities(title)')
      .in('activity_id', activityIds)
      .neq('status', 'cancelled')
      .order('booking_date', { ascending: true })
    bookings = data ?? []
  }

  return { partner, activities: activities ?? [], bookings }
}

export default async function PartnerPage({ params }: Props) {
  const { token } = await params
  const data = await getPartnerData(token)
  if (!data) notFound()

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>Giddel</div>
        <div className={styles.partnerName}>{data.partner.name}</div>
      </header>
      <PartnerClient
        token={token}
        partner={data.partner}
        activities={data.activities as never[]}
        initialBookings={data.bookings as never[]}
      />
    </div>
  )
}
