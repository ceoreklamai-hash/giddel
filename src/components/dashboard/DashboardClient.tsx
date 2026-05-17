'use client'
// src/components/dashboard/DashboardClient.tsx
import { useState, useTransition, useEffect, useCallback } from 'react'
import { Calendar, Bell, Download } from 'lucide-react'
import type { BookingRow } from '@/app/dashboard/page'
import { CATEGORY_LABELS } from '@/lib/types'
import { Countdown } from './Countdown'
import styles from './DashboardClient.module.css'

function CalendarFeedBanner() {
  const [copied, setCopied] = useState(false)
  const token = 'giddel-calendar'
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/api/calendar/feed?token=${token}`
    : `/api/calendar/feed?token=${token}`

  function copy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.calBanner}>
      <div className={styles.calBannerLeft}>
        <Calendar size={20} strokeWidth={1.5} className={styles.calIcon} />
        <div>
          <div className={styles.calTitle}>Синхронизация с календарём</div>
          <div className={styles.calDesc}>Добавьте ссылку в Google Calendar, Apple Calendar или Outlook — бронирования появятся автоматически</div>
        </div>
      </div>
      <button type="button" className={styles.calCopyBtn} onClick={copy}>
        {copied ? '✓ Скопировано' : 'Скопировать ссылку'}
      </button>
    </div>
  )
}

const STATUS_LABELS: Record<string, string> = {
  pending:   'Ожидает',
  paid:      'Оплачено',
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
}

const STATUS_COLORS: Record<string, string> = {
  pending:   '#e8a85c',
  paid:      '#5ca8e8',
  confirmed: '#6ab04c',
  cancelled: '#e85c5c',
}

const FILTERS = ['all', 'pending', 'paid', 'confirmed', 'cancelled'] as const

export function DashboardClient({ bookings }: { bookings: BookingRow[] }) {
  const [filter, setFilter] = useState<typeof FILTERS[number]>('all')
  const [search, setSearch] = useState('')
  const [statuses, setStatuses] = useState<Record<string, string>>({})
  const [reminded, setReminded] = useState<Record<string, boolean>>({})
  const [isPending, startTransition] = useTransition()

  // Автоотмена просроченных броней
  const runExpire = useCallback(async () => {
    await fetch('/api/bookings/expire', { method: 'POST' })
  }, [])

  useEffect(() => {
    runExpire()
    const id = setInterval(runExpire, 60_000)
    return () => clearInterval(id)
  }, [runExpire])

  function handleExpire(id: string) {
    setStatuses(prev => ({ ...prev, [id]: 'cancelled' }))
  }

  const visible = bookings.filter(b => {
    const status = statuses[b.id] ?? b.status
    if (filter !== 'all' && status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        b.tourist_name.toLowerCase().includes(q) ||
        b.tourist_phone.includes(q) ||
        b.activity?.title.toLowerCase().includes(q)
      )
    }
    return true
  })

  async function sendReminder(id: string) {
    await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setReminded(prev => ({ ...prev, [id]: true }))
  }

  function downloadIcs(id: string) {
    window.open(`/api/calendar/booking?id=${id}`, '_blank')
  }

  async function updateStatus(id: string, newStatus: string) {
    startTransition(async () => {
      setStatuses(prev => ({ ...prev, [id]: newStatus }))
      await fetch('/api/bookings/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
    })
  }

  return (
    <div className={styles.wrap}>
      <CalendarFeedBanner />

      {/* Фильтры + поиск */}
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {FILTERS.map(f => (
            <button
              key={f}
              type="button"
              className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Все' : STATUS_LABELS[f]}
              <span className={styles.filterCount}>
                {f === 'all' ? bookings.length : bookings.filter(b => (statuses[b.id] ?? b.status) === f).length}
              </span>
            </button>
          ))}
        </div>
        <input
          type="text"
          className={styles.search}
          placeholder="Поиск по имени, телефону, активности..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Таблица */}
      {visible.length === 0 ? (
        <div className={styles.empty}>Нет бронирований</div>
      ) : (
        <div className={styles.table}>
          <div className={styles.thead}>
            <div>Гость</div>
            <div>Активность</div>
            <div>Дата</div>
            <div>Гостей</div>
            <div>Сумма</div>
            <div>Статус</div>
            <div>Действие</div>
          </div>
          {visible.map(b => {
            const status = statuses[b.id] ?? b.status
            const color = STATUS_COLORS[status] ?? '#fff'
            return (
              <div key={b.id} className={styles.row}>
                <div className={styles.guest}>
                  <div className={styles.guestName}>{b.tourist_name}</div>
                  <div className={styles.guestPhone}>{b.tourist_phone}</div>
                </div>
                <div className={styles.activity}>
                  <div className={styles.activityTitle}>{b.activity?.title ?? '—'}</div>
                  {b.activity?.category && (
                    <div className={styles.activityCat}>
                      {CATEGORY_LABELS[b.activity.category as keyof typeof CATEGORY_LABELS] ?? b.activity.category}
                    </div>
                  )}
                </div>
                <div className={styles.date}>
                  {new Date(b.booking_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                </div>
                <div className={styles.guests}>{b.guests_count} чел</div>
                <div className={styles.price}>
                  {b.total_price.toLocaleString('ru-RU')} ₽
                  <div className={styles.commission}>+{b.commission_amount.toLocaleString('ru-RU')} ком.</div>
                </div>
                <div className={styles.status} style={{ color }}>
                  <span className={styles.statusDot} style={{ background: color }} />
                  {STATUS_LABELS[status]}
                  {status === 'pending' && (
                    <Countdown
                      expiresAt={b.expires_at}
                      onExpire={() => handleExpire(b.id)}
                    />
                  )}
                </div>
                <div className={styles.actions}>
                  {status === 'pending' && (
                    <>
                      <button type="button" className={styles.btnConfirm} onClick={() => updateStatus(b.id, 'confirmed')}>
                        Подтвердить
                      </button>
                      <button type="button" className={styles.btnCancel} onClick={() => updateStatus(b.id, 'cancelled')}>
                        ✕
                      </button>
                    </>
                  )}
                  {status === 'confirmed' && (
                    <>
                      <button
                        type="button"
                        className={styles.btnRemind}
                        onClick={() => sendReminder(b.id)}
                        disabled={!!reminded[b.id]}
                        title="Напомнить клиенту"
                      >
                        {reminded[b.id] ? <span style={{color:'#6ab04c',fontSize:12}}>✓</span> : <Bell size={13} strokeWidth={1.5} />}
                      </button>
                      <button
                        type="button"
                        className={styles.btnIcs}
                        onClick={() => downloadIcs(b.id)}
                        title="Добавить в календарь"
                      >
                        <Download size={13} strokeWidth={1.5} />
                      </button>
                      <button type="button" className={styles.btnCancel} onClick={() => updateStatus(b.id, 'cancelled')}>
                        Отменить
                      </button>
                    </>
                  )}
                  {(status === 'paid') && (
                    <button type="button" className={styles.btnConfirm} onClick={() => updateStatus(b.id, 'confirmed')}>
                      Подтвердить
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
