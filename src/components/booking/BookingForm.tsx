// src/components/booking/BookingForm.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Activity } from '@/lib/types'
import styles from './BookingForm.module.css'

interface Props {
  activity: Activity
}

interface FormState {
  date: string
  guests: number
  name: string
  phone: string
  email: string
}

export function BookingForm({ activity }: Props) {
  const [form, setForm] = useState<FormState>({
    date: '',
    guests: 1,
    name: '',
    phone: '',
    email: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalPrice = activity.price_from * form.guests
  const commissionAmount = Math.round(totalPrice * (activity.commission_pct ?? 0) / 100)

  function update(field: keyof FormState, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
    setError(null)
  }

  const isValid =
    form.date !== '' &&
    form.guests >= 1 &&
    form.name.trim().length >= 2 &&
    form.phone.trim().length >= 10 &&
    form.email.includes('@')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setLoading(true)
    setError(null)

    const { error: supabaseError } = await supabase.from('bookings').insert({
      activity_id: activity.id,
      tourist_name: form.name.trim(),
      tourist_phone: form.phone.trim(),
      tourist_email: form.email.trim(),
      booking_date: form.date,
      guests_count: form.guests,
      total_price: totalPrice,
      commission_amount: commissionAmount,
      status: 'pending',
    })

    setLoading(false)

    if (supabaseError) {
      setError('Ошибка при сохранении. Попробуйте ещё раз.')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className={styles.box}>
        <div className={styles.success}>
          <div className={styles.successIcon}>✓</div>
          <div className={styles.successTitle}>Заявка принята!</div>
          <p className={styles.successText}>
            Мы свяжемся с вами по номеру {form.phone} для подтверждения бронирования.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.box}>
      <div className={styles.title}>Забронировать</div>
      <div className={styles.subtitle}>{activity.title}</div>

      <div className={styles.price}>
        {totalPrice.toLocaleString('ru-RU')} ₽
      </div>
      <div className={styles.priceNote}>
        {activity.price_from.toLocaleString('ru-RU')} ₽ × {form.guests} чел.
      </div>

      <div className={styles.divider} />

      <form onSubmit={handleSubmit}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Дата</label>
            <input
              type="date"
              className={styles.input}
              value={form.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => update('date', e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Гостей</label>
            <input
              type="number"
              className={styles.input}
              value={form.guests}
              min={1}
              max={20}
              onChange={e => update('guests', parseInt(e.target.value) || 1)}
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Ваше имя</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Иван Иванов"
            value={form.name}
            onChange={e => update('name', e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Телефон</label>
          <input
            type="tel"
            className={styles.input}
            placeholder="+7 900 000 00 00"
            value={form.phone}
            onChange={e => update('phone', e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            className={styles.input}
            placeholder="ivan@mail.ru"
            value={form.email}
            onChange={e => update('email', e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className={styles.submit}
          disabled={!isValid || loading}
        >
          {loading ? 'Отправляем...' : 'Забронировать'}
        </button>

        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  )
}
