'use client'
// src/components/vip/VipForm.tsx
import { useState, useEffect } from 'react'
import styles from './VipForm.module.css'

const BUDGET_OPTIONS = [
  { value: 'comfort',   label: 'Комфорт',    desc: '15 000–50 000 ₽/день' },
  { value: 'luxury',    label: 'Люкс',        desc: '50 000–150 000 ₽/день' },
  { value: 'unlimited', label: 'Без лимита',  desc: 'Всё лучшее' },
]

const NEEDS_OPTIONS = [
  { key: 'transfer',    icon: '🚗', label: 'Трансфер' },
  { key: 'yacht',       icon: '⛵', label: 'Яхта' },
  { key: 'helicopter',  icon: '🚁', label: 'Вертолёт' },
  { key: 'chef',        icon: '👨‍🍳', label: 'Повар' },
  { key: 'spa',         icon: '💆', label: 'СПА' },
  { key: 'wine',        icon: '🍷', label: 'Дегустация' },
  { key: 'horse',       icon: '🐎', label: 'Конные прогулки' },
  { key: 'guide',       icon: '🗺️', label: 'Личный гид' },
  { key: 'photo',       icon: '📸', label: 'Фотограф' },
  { key: 'security',    icon: '🔒', label: 'Анонимность' },
]

export function VipForm() {
  const [step, setStep] = useState(1)
  const [refCode, setRefCode] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [requestId, setRequestId] = useState('')
  const [loading, setLoading] = useState(false)

  const [dates, setDates] = useState({ from: '', to: '' })
  const [guests, setGuests] = useState(2)
  const [budget, setBudget] = useState('luxury')
  const [needs, setNeeds] = useState<Record<string, boolean>>({})
  const [wishes, setWishes] = useState('')
  const [contact, setContact] = useState({ method: 'telegram', value: '' })

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)ref=([^;]+)/)
    if (match) setRefCode(decodeURIComponent(match[1]))
  }, [])

  function toggleNeed(key: string) {
    setNeeds(prev => ({ ...prev, [key]: !prev[key] }))
  }

  async function submit() {
    if (!contact.value.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/vip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dates_from: dates.from || null,
          dates_to: dates.to || null,
          guests_count: guests,
          budget_tier: budget,
          needs,
          wishes,
          contact_method: contact.method,
          contact_value: contact.value,
          ref_code: refCode,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setRequestId(data.request_id)
        setSubmitted(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon}>✦</div>
        <div className={styles.successId}>{requestId}</div>
        <h2 className={styles.successTitle}>Заявка принята</h2>
        <p className={styles.successText}>
          Личный консьерж свяжется с вами в течение 30 минут.<br />
          Сохраните номер заявки для связи.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.form}>
      {/* Прогресс */}
      <div className={styles.steps}>
        {[1, 2, 3].map(s => (
          <div key={s} className={`${styles.step} ${step >= s ? styles.active : ''}`}>
            {s}
          </div>
        ))}
      </div>

      {/* Шаг 1 — Даты и компания */}
      {step === 1 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Когда и с кем?</h2>

          <div className={styles.dateRow}>
            <div className={styles.field}>
              <label className={styles.label}>Заезд</label>
              <input type="date" className={styles.input}
                value={dates.from} min={new Date().toISOString().split('T')[0]}
                onChange={e => setDates(d => ({ ...d, from: e.target.value }))} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Выезд</label>
              <input type="date" className={styles.input}
                value={dates.to} min={dates.from || new Date().toISOString().split('T')[0]}
                onChange={e => setDates(d => ({ ...d, to: e.target.value }))} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Количество гостей</label>
            <div className={styles.counter}>
              <button type="button" className={styles.counterBtn}
                onClick={() => setGuests(g => Math.max(1, g - 1))}>−</button>
              <span className={styles.counterVal}>{guests}</span>
              <button type="button" className={styles.counterBtn}
                onClick={() => setGuests(g => g + 1)}>+</button>
            </div>
          </div>

          <button className={styles.nextBtn} onClick={() => setStep(2)}>
            Далее →
          </button>
        </div>
      )}

      {/* Шаг 2 — Бюджет и пожелания */}
      {step === 2 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Уровень и пожелания</h2>

          <div className={styles.field}>
            <label className={styles.label}>Бюджет</label>
            <div className={styles.budgetGrid}>
              {BUDGET_OPTIONS.map(b => (
                <button
                  key={b.value} type="button"
                  className={`${styles.budgetBtn} ${budget === b.value ? styles.budgetActive : ''}`}
                  onClick={() => setBudget(b.value)}
                >
                  <span className={styles.budgetLabel}>{b.label}</span>
                  <span className={styles.budgetDesc}>{b.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Что включить?</label>
            <div className={styles.needsGrid}>
              {NEEDS_OPTIONS.map(n => (
                <button
                  key={n.key} type="button"
                  className={`${styles.needBtn} ${needs[n.key] ? styles.needActive : ''}`}
                  onClick={() => toggleNeed(n.key)}
                >
                  <span>{n.icon}</span>
                  <span>{n.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Особые пожелания</label>
            <textarea
              className={styles.textarea}
              placeholder="Аллергии, предпочтения, особые запросы..."
              value={wishes}
              onChange={e => setWishes(e.target.value)}
              rows={3}
            />
          </div>

          <div className={styles.btnRow}>
            <button className={styles.backBtn} onClick={() => setStep(1)}>← Назад</button>
            <button className={styles.nextBtn} onClick={() => setStep(3)}>Далее →</button>
          </div>
        </div>
      )}

      {/* Шаг 3 — Контакт */}
      {step === 3 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Как с вами связаться?</h2>
          <p className={styles.stepDesc}>
            Данные не хранятся публично. Консьерж свяжется лично.
          </p>

          <div className={styles.field}>
            <div className={styles.methodRow}>
              {['telegram', 'whatsapp', 'phone'].map(m => (
                <button
                  key={m} type="button"
                  className={`${styles.methodBtn} ${contact.method === m ? styles.methodActive : ''}`}
                  onClick={() => setContact(c => ({ ...c, method: m }))}
                >
                  {m === 'telegram' ? '✈ Telegram' : m === 'whatsapp' ? '💬 WhatsApp' : '📞 Звонок'}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              {contact.method === 'telegram' ? '@username или номер' :
               contact.method === 'whatsapp' ? 'Номер телефона' : 'Номер телефона'}
            </label>
            <input
              type={contact.method === 'phone' ? 'tel' : 'text'}
              className={styles.input}
              placeholder={contact.method === 'telegram' ? '@username' : '+7 900 000 00 00'}
              value={contact.value}
              onChange={e => setContact(c => ({ ...c, value: e.target.value }))}
            />
          </div>

          <div className={styles.privacy}>
            🔒 Анонимность гарантирована. Данные не передаются третьим лицам.
          </div>

          <div className={styles.btnRow}>
            <button className={styles.backBtn} onClick={() => setStep(2)}>← Назад</button>
            <button
              className={styles.submitBtn}
              onClick={submit}
              disabled={!contact.value.trim() || loading}
            >
              {loading ? 'Отправляем...' : 'Отправить заявку'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
