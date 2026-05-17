'use client'
// src/app/profile/ProfileClient.tsx
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { CalendarDays, Clock, Users, LogOut, ArrowRight } from 'lucide-react'
import styles from './Profile.module.css'

interface Booking {
  id: string
  booking_date: string
  booking_time: string | null
  guests_count: number
  total_price: number
  status: string
  activity: { title: string; location_name: string | null } | null
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Ожидает', confirmed: 'Подтверждено',
  paid: 'Оплачено', cancelled: 'Отменено',
}
const STATUS_COLOR: Record<string, string> = {
  pending: '#e8a85c', confirmed: '#6ab04c', paid: '#6fa8a3', cancelled: '#555',
}

export function ProfileClient() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [user, setUser] = useState<{ email?: string; phone?: string } | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth/login'; return }
      setUser({ email: user.email, phone: user.phone })

      // Загружаем брони по email И телефону (турист мог бронировать разными способами)
      if (!user.email && !user.phone) return

      const sel = 'id, booking_date, booking_time, guests_count, total_price, status, activity:activities(title, location_name)'
      let orFilter = ''
      if (user.email && user.phone) orFilter = `tourist_email.eq.${user.email},tourist_phone.eq.${user.phone}`
      else if (user.email) orFilter = `tourist_email.eq.${user.email}`
      else orFilter = `tourist_phone.eq.${user.phone}`

      const { data } = await supabase
        .from('bookings')
        .select(sel)
        .or(orFilter)
        .order('booking_date', { ascending: false })
        .limit(20)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setBookings((data ?? []) as any)
      setLoading(false)
    }
    load()
  }, [supabase])

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) return (
    <div className={styles.loading}>Загружаем профиль...</div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Мой профиль</h1>
          <div className={styles.contact}>{user?.email ?? user?.phone}</div>
        </div>
        <button className={styles.logoutBtn} onClick={logout}>
          <LogOut size={15} /> Выйти
        </button>
      </div>

      <h2 className={styles.sectionTitle}>Мои бронирования</h2>

      {bookings.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyText}>Бронирований пока нет</div>
          <Link href="/activities" className={styles.emptyBtn}>
            Найти активность <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className={styles.list}>
          {bookings.map(b => (
            <div key={b.id} className={`${styles.card} ${b.status === 'cancelled' ? styles.cardCancelled : ''}`}>
              <div className={styles.cardMain}>
                <div className={styles.cardTitle}>{b.activity?.title ?? '—'}</div>
                <div className={styles.cardMeta}>
                  <span><CalendarDays size={12} /> {new Date(b.booking_date + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</span>
                  {b.booking_time && <span><Clock size={12} /> {b.booking_time}</span>}
                  <span><Users size={12} /> {b.guests_count} чел.</span>
                </div>
              </div>
              <div className={styles.cardRight}>
                <div className={styles.cardPrice}>{b.total_price.toLocaleString('ru-RU')} ₽</div>
                <div className={styles.cardStatus} style={{ color: STATUS_COLOR[b.status] }}>
                  {STATUS_LABEL[b.status]}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
