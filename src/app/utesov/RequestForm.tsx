'use client'
// src/app/utesov/RequestForm.tsx
import { useState } from 'react'
import styles from './Utesov.module.css'

export function RequestForm() {
  const [form, setForm] = useState({ name: '', phone: '', guests: '2', date: '', comment: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.phone) return
    setLoading(true)
    await fetch('/api/utesov', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    setDone(true)
  }

  if (done) return (
    <div className={styles.formDone}>
      <div className={styles.formDoneIcon}>🍷</div>
      <div className={styles.formDoneTitle}>Заявка принята</div>
      <div className={styles.formDoneSub}>Наш консьерж свяжется с вами в течение часа и составит программу под ваши пожелания</div>
    </div>
  )

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Ваше имя</label>
          <input className={styles.formInput} placeholder="Александр" value={form.name}
            onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Телефон</label>
          <input className={styles.formInput} type="tel" placeholder="+7 900 000 00 00" value={form.phone}
            onChange={e => setForm(f => ({...f, phone: e.target.value}))} required />
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Количество гостей</label>
          <select className={styles.formInput} value={form.guests}
            onChange={e => setForm(f => ({...f, guests: e.target.value}))}>
            {['1','2','3','4','5','6','7','8','9','10+'].map(n => (
              <option key={n} value={n}>{n} {n === '1' ? 'гость' : 'гостей'}</option>
            ))}
          </select>
        </div>
        <div className={styles.formField}>
          <label className={styles.formLabel}>Желаемая дата</label>
          <input className={styles.formInput} type="date" value={form.date}
            onChange={e => setForm(f => ({...f, date: e.target.value}))} />
        </div>
      </div>
      <div className={styles.formField}>
        <label className={styles.formLabel}>Особые пожелания</label>
        <textarea className={styles.formTextarea} placeholder="Предпочтения по винам, особые моменты, которые важно учесть..."
          value={form.comment} onChange={e => setForm(f => ({...f, comment: e.target.value}))} rows={3} />
      </div>
      <button className={styles.formBtn} type="submit" disabled={loading}>
        {loading ? 'Отправляем...' : 'Узнать стоимость тура'}
      </button>
      <div className={styles.formNote}>Цена рассчитывается индивидуально · Ответим в течение часа</div>
    </form>
  )
}
