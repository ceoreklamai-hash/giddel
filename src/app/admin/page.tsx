// src/app/admin/page.tsx
import type { Metadata } from 'next'
import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { AdminLogout } from './AdminLogout'
import styles from './Admin.module.css'

export const metadata: Metadata = { title: 'Админ — Giddel' }

async function getData() {
  const [{ data: partners }, { data: activities }, { data: bookings }, { data: requests }] = await Promise.all([
    supabase.from('partners').select('id, name, phone, email, portal_token, rating').order('created_at', { ascending: false }),
    supabase.from('activities').select('id, title, category, price_from, is_active, partner_id, location_name').order('created_at', { ascending: false }),
    supabase.from('bookings').select('id, status, total_price, commission_amount, created_at, source, tourist_name, tourist_phone, tourist_email, booking_date, guests_count, activity:activities(title, partner_id)').order('created_at', { ascending: false }).limit(100),
    supabase.from('partner_requests').select('*').order('created_at', { ascending: false }).limit(200),
  ])
  return {
    partners: partners ?? [],
    activities: activities ?? [],
    bookings: bookings ?? [],
    requests: requests ?? [],
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
      />
    </div>
  )
}
