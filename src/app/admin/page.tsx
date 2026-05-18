// src/app/admin/page.tsx
import type { Metadata } from 'next'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminLogout } from './AdminLogout'
import styles from './Admin.module.css'

export const metadata: Metadata = { title: 'Админ — Giddel' }
export const dynamic = 'force-dynamic'

interface RawBooking {
  tourist_name: string; tourist_phone: string; tourist_email: string
  total_price: number; status: string; booking_date: string; created_at: string
  activity: { category: string } | null
}

function buildClients(bookings: RawBooking[]) {
  const map = new Map<string, {
    name: string; phone: string; email: string
    bookings_count: number; total_spent: number
    categories: Set<string>; last_booking: string
  }>()

  for (const b of bookings) {
    if (b.status === 'cancelled') continue
    const key = b.tourist_phone || b.tourist_email
    if (!key) continue
    const existing = map.get(key)
    if (existing) {
      existing.bookings_count++
      existing.total_spent += b.total_price
      if (b.activity?.category) existing.categories.add(b.activity.category)
      if (b.booking_date > existing.last_booking) existing.last_booking = b.booking_date
    } else {
      map.set(key, {
        name: b.tourist_name,
        phone: b.tourist_phone,
        email: b.tourist_email,
        bookings_count: 1,
        total_spent: b.total_price,
        categories: new Set(b.activity?.category ? [b.activity.category] : []),
        last_booking: b.booking_date,
      })
    }
  }

  return Array.from(map.values()).map(c => ({
    ...c, categories: Array.from(c.categories)
  })).sort((a, b) => b.bookings_count - a.bookings_count)
}

async function getData() {
  const [{ data: partners }, { data: activities }, { data: bookings }, { data: requests }, { data: allBookings }] = await Promise.all([
    supabase.from('partners').select('id, name, phone, email, portal_token, rating').order('created_at', { ascending: false }),
    supabase.from('activities').select('id, title, category, price_from, is_active, partner_id, location_name').order('created_at', { ascending: false }),
    supabase.from('bookings').select('id, status, total_price, commission_amount, created_at, source, tourist_name, tourist_phone, tourist_email, booking_date, guests_count, activity:activities(title, partner_id)').order('created_at', { ascending: false }).limit(100),
    supabase.from('partner_requests').select('*').order('created_at', { ascending: false }).limit(200),
    supabase.from('bookings').select('tourist_name, tourist_phone, tourist_email, total_price, status, booking_date, created_at, activity:activities(category)').order('created_at', { ascending: false }).limit(2000),
  ])
  return {
    partners: partners ?? [],
    activities: activities ?? [],
    bookings: bookings ?? [],
    requests: requests ?? [],
    clients: buildClients((allBookings ?? []) as unknown as RawBooking[]),
  }
}

export default async function AdminPage() {
  const data = await getData()

  const totalRevenue = data.bookings.reduce((s: number, b: {total_price: number}) => s + b.total_price, 0)
  const totalCommission = data.bookings.reduce((s: number, b: {commission_amount: number}) => s + b.commission_amount, 0)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logo}>Giddel</div>
        <div className={styles.title}>Операторская панель</div>
        <div style={{marginLeft:'auto'}}><AdminLogout /></div>
      </header>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <div className={styles.statVal}>{data.partners.length}</div>
          <div className={styles.statLabel}>Партнёров</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statVal}>{data.activities.filter((a: {is_active: boolean}) => a.is_active).length}</div>
          <div className={styles.statLabel}>Активностей</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statVal}>{data.bookings.length}</div>
          <div className={styles.statLabel}>Броней</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statVal}>{data.clients.length}</div>
          <div className={styles.statLabel}>Клиентов</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statVal} style={{color:'#6fa8a3'}}>{totalRevenue.toLocaleString('ru-RU')} ₽</div>
          <div className={styles.statLabel}>Оборот</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statVal} style={{color:'#c9a227'}}>{totalCommission.toLocaleString('ru-RU')} ₽</div>
          <div className={styles.statLabel}>Наша комиссия</div>
        </div>
      </div>

      <AdminPanel
        initialPartners={data.partners as never[]}
        initialActivities={data.activities as never[]}
        initialBookings={data.bookings as never[]}
        initialRequests={data.requests as never[]}
        initialClients={data.clients as never[]}
      />
    </div>
  )
}
