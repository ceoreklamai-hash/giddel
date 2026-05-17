'use client'
// src/components/booking/BookingForm.tsx
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { Activity } from '@/lib/types'
import styles from './BookingForm.module.css'

interface Props {
  activity: Activity
  availableSlots?: string[] // слоты из расписания партнёра
  takenSlots?: string[]     // уже занятые слоты на выбранную дату
}

export function BookingForm({ activity, availableSlots, takenSlots = [] }: Props) {
  const router = useRouter()
  const [refCode, setRefCode] = useState<string | null>(null)

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)ref=([^;]+)/)
    if (match) setRefCode(decodeURIComponent(match[1]))
  }, [])

  const today = new Date().toISOString().split('T')[0]

  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [guests, setGuests] = useState(1)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const total = activity.price_from * guests

  const slots = useMemo(() => {
    if (!availableSlots || availableSlots.length === 0) return null // не показываем выбор времени
    return availableSlots.filter(s => !takenSlots.includes(s))
  }, [availableSlots, takenSlots])

  const isValid = date && name.trim().length >= 2 && phone.trim().length >= 10

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activity_id: activity.id,
        tourist_name: name.trim(),
        tourist_phone: phone.trim(),
        tourist_email: email.trim(),
        booking_date: date,
        booking_time: time || null,
        guests_count: guests,
        ref_code: refCode,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!data.ok) {
      setError(data.error ?? 'Ошибка. Попробуйте ещё раз.')
      return
    }

    if (data.payment_url) {
      // Редирект на оплату YooKassa
      window.location.href = data.payment_url
    } else {
      // Тест-режим без оплаты
      router.push(`/booking/success?id=${data.booking_id}`)
    }
  }

  return (
    <div className={styles.box}>
      <div className={styles.title}>Забронировать</div>
      <div className={styles.subtitle}>{activity.title}</div>

      <div className={styles.price}>
        {total.toLocaleString('ru-RU')} ₽
      </div>
      <div className={styles.priceNote}>
        {activity.price_from.toLocaleString('ru-RU')} ₽ × {guests} чел.
      </div>

      <div className={styles.divider} />

      <form onSubmit={handleSubmit}>
        {/* Дата */}
        <div className={styles.field}>
          <label className={styles.label}>Дата</label>
          <input
            type="date"
            className={styles.input}
            value={date}
            min={today}
            onChange={e => { setDate(e.target.value); setTime('') }}
            required
          />
        </div>

        {/* Время — только если есть расписание */}
        {slots && slots.length > 0 && (
          <div className={styles.field}>
            <label className={styles.label}>Время</label>
            <div className={styles.timeGrid}>
              {slots.map(s => (
                <button
                  key={s} type="button"
                  className={`${styles.timeSlot} ${time === s ? styles.timeSlotActive : ''}`}
                  onClick={() => setTime(s)}
                >{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* Гости */}
        <div className={styles.field}>
          <label className={styles.label}>Количество гостей</label>
          <div className={styles.counter}>
            <button type="button" className={styles.cBtn} onClick={() => setGuests(g => Math.max(1, g - 1))}>−</button>
            <span className={styles.cVal}>{guests}</span>
            <button type="button" className={styles.cBtn} onClick={() => setGuests(g => g + 1)}>+</button>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Контакты */}
        <div className={styles.field}>
          <label className={styles.label}>Ваше имя</label>
          <input type="text" className={styles.input} placeholder="Иван Иванов"
            value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Телефон</label>
          <input type="tel" className={styles.input} placeholder="+7 900 000 00 00"
            value={phone} onChange={e => setPhone(e.target.value)} required />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email <span className={styles.optional}>(необязательно)</span></label>
          <input type="email" className={styles.input} placeholder="ivan@mail.ru"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" className={styles.submit} disabled={!isValid || loading}>
          {loading ? 'Создаём бронь...' : `Оплатить ${total.toLocaleString('ru-RU')} ₽`}
        </button>

        <div className={styles.guarantee}>
          Безопасная оплата · Подтверждение за 30 минут
        </div>
      </form>
    </div>
  )
}
