'use client'
// src/app/booking/review/page.tsx
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Nav } from '@/components/nav/Nav'
import styles from './Review.module.css'

function ReviewForm() {
  const params = useSearchParams()
  const bookingId = params.get('id')
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!rating || !bookingId) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId, rating, text }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.ok) setDone(true)
    else setError(data.error ?? 'Ошибка. Попробуйте ещё раз.')
  }

  if (done) return (
    <div className={styles.done}>
      <div className={styles.doneIcon}>★</div>
      <div className={styles.doneTitle}>Спасибо за отзыв!</div>
      <div className={styles.doneSub}>Вы помогаете другим туристам сделать правильный выбор</div>
      <a href="/" className={styles.doneBtn}>На главную</a>
    </div>
  )

  return (
    <div className={styles.card}>
      <div className={styles.title}>Оставьте отзыв</div>
      <div className={styles.sub}>Как вам понравилась активность?</div>

      <div className={styles.stars}>
        {[1,2,3,4,5].map(n => (
          <button
            key={n}
            className={`${styles.star} ${(hover || rating) >= n ? styles.starOn : ''}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
          >★</button>
        ))}
      </div>
      {rating > 0 && (
        <div className={styles.ratingLabel}>
          {['','Ужасно','Плохо','Нормально','Хорошо','Отлично!'][rating]}
        </div>
      )}

      <textarea
        className={styles.textarea}
        placeholder="Расскажите подробнее — что понравилось, что можно улучшить..."
        value={text}
        onChange={e => setText(e.target.value)}
        rows={4}
      />

      {error && <div className={styles.error}>{error}</div>}

      <button
        className={styles.btn}
        onClick={submit}
        disabled={!rating || loading}
      >
        {loading ? 'Отправляем...' : 'Отправить отзыв'}
      </button>
    </div>
  )
}

export default function ReviewPage() {
  return (
    <>
      <Nav />
      <div className={styles.page}>
        <Suspense fallback={<div className={styles.card}>Загрузка...</div>}>
          <ReviewForm />
        </Suspense>
      </div>
    </>
  )
}
