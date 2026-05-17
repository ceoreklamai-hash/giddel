'use client'
// src/app/booking/success/BookingSuccess.tsx
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Calendar, Users, Phone } from 'lucide-react'
import styles from './BookingSuccess.module.css'

interface BookingData {
  id: string
  status: string
  total_price: number
  booking_date: string
  booking_time: string | null
  tourist_name: string
  tourist_phone: string
  guests_count: number
  activity: { title: string; images: string[] | null; location_name: string | null } | null
}

export function BookingSuccess() {
  const params = useSearchParams()
  const id = params.get('id')
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/payment/success?id=${id}`)
      .then(r => r.json())
      .then(d => { setBooking(d.booking); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.loading}>Проверяем оплату...</div>
    </div>
  )

  if (!booking) return (
    <div className={styles.page}>
      <div className={styles.error}>Бронь не найдена</div>
    </div>
  )

  const isPaid = booking.status === 'paid' || booking.status === 'confirmed'

  const image = booking.activity?.images?.[0]

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {image && (
          <div className={styles.image}>
            <img src={image} alt={booking.activity?.title ?? ''} />
            <div className={styles.imageOverlay} />
          </div>
        )}

        <div className={styles.icon}>
          <CheckCircle size={52} strokeWidth={1.5} color={isPaid ? '#6ab04c' : '#6fa8a3'} />
        </div>

        <h1 className={styles.title}>
          {isPaid ? 'Оплачено!' : 'Заявка принята!'}
        </h1>
        <p className={styles.subtitle}>
          {isPaid
            ? 'Ваше бронирование подтверждено. Ждём вас!'
            : 'Мы свяжемся с вами для подтверждения в течение 30 минут.'}
        </p>

        <div className={styles.details}>
          <div className={styles.detail}>
            <Calendar size={15} />
            <span>{booking.activity?.title ?? 'Активность'}</span>
          </div>
          <div className={styles.detail}>
            <Calendar size={15} />
            <span>
              {new Date(booking.booking_date + 'T12:00:00').toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
              {booking.booking_time ? ` в ${booking.booking_time}` : ''}
            </span>
          </div>
          <div className={styles.detail}>
            <Users size={15} />
            <span>{booking.guests_count} {booking.guests_count === 1 ? 'гость' : 'гостей'}</span>
          </div>
          <div className={styles.detail}>
            <Phone size={15} />
            <span>{booking.tourist_phone}</span>
          </div>
        </div>

        <div className={styles.total}>
          {booking.total_price.toLocaleString('ru-RU')} ₽
        </div>

        <div className={styles.actions}>
          <Link href="/activities" className={styles.btnSecondary}>
            Другие активности
          </Link>
          <Link href="/" className={styles.btnPrimary}>
            На главную
          </Link>
        </div>
      </div>
    </div>
  )
}
