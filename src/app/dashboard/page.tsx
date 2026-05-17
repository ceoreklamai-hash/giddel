// src/app/dashboard/page.tsx
import type { Metadata } from 'next'
import { Nav } from '@/components/nav/Nav'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { supabase } from '@/lib/supabase'
import styles from './Dashboard.module.css'

export const metadata: Metadata = {
  title: 'Кабинет — Giddel',
}

export interface BookingRow {
  id: string
  tourist_name: string
  tourist_phone: string
  tourist_email: string
  booking_date: string
  guests_count: number
  total_price: number
  commission_amount: number
  status: string
  created_at: string
  expires_at: string | null
  activity: { title: string; category: string; location_name: string | null } | null
}

async function getBookings(): Promise<BookingRow[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, activity:activities(title, category, location_name)')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    console.error('[dashboard]', error.message)
    return []
  }
  return (data ?? []) as BookingRow[]
}

export default async function DashboardPage() {
  const bookings = await getBookings()

  const totalRevenue = bookings.reduce((s, b) => s + b.total_price, 0)
  const totalCommission = bookings.reduce((s, b) => s + b.commission_amount, 0)
  const pending = bookings.filter(b => b.status === 'pending').length
  const confirmed = bookings.filter(b => b.status === 'confirmed').length

  return (
    <>
      <Nav />
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <span className="label">Кабинет партнёра</span>
            <h1 className={styles.title}>Бронирования</h1>
          </div>
        </div>

        {/* Статистика */}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statValue}>{bookings.length}</div>
            <div className={styles.statLabel}>Всего броней</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue} style={{ color: '#e8a85c' }}>{pending}</div>
            <div className={styles.statLabel}>Ожидают</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue} style={{ color: '#6ab04c' }}>{confirmed}</div>
            <div className={styles.statLabel}>Подтверждено</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>
              {totalRevenue.toLocaleString('ru-RU')} ₽
            </div>
            <div className={styles.statLabel}>Оборот</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue} style={{ color: '#a87fe8' }}>
              {totalCommission.toLocaleString('ru-RU')} ₽
            </div>
            <div className={styles.statLabel}>Комиссия</div>
          </div>
        </div>

        {/* Таблица + AI */}
        <DashboardClient bookings={bookings} />
      </div>
    </>
  )
}
