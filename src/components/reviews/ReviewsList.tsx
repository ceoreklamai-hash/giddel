'use client'
// src/components/reviews/ReviewsList.tsx
import { useEffect, useState } from 'react'
import styles from './ReviewsList.module.css'

interface Review {
  id: string
  tourist_name: string
  rating: number
  text: string | null
  created_at: string
}

interface Props { activityId: string }

export function ReviewsList({ activityId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/reviews?activity_id=${activityId}`)
      .then(r => r.json())
      .then(d => { setReviews(d.reviews ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [activityId])

  if (loading) return null
  if (reviews.length === 0) return null

  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.avgBlock}>
          <span className={styles.avgStar}>★</span>
          <span className={styles.avgNum}>{avg}</span>
          <span className={styles.avgCount}>{reviews.length} {declReview(reviews.length)}</span>
        </div>
        <div className={styles.title}>Отзывы</div>
      </div>

      <div className={styles.list}>
        {reviews.map(r => (
          <div key={r.id} className={styles.item}>
            <div className={styles.itemTop}>
              <div className={styles.itemName}>{r.tourist_name}</div>
              <div className={styles.itemStars}>
                {[1,2,3,4,5].map(n => (
                  <span key={n} className={n <= r.rating ? styles.starOn : styles.starOff}>★</span>
                ))}
              </div>
              <div className={styles.itemDate}>
                {new Date(r.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </div>
            </div>
            {r.text && <div className={styles.itemText}>{r.text}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function declReview(n: number) {
  if (n % 100 >= 11 && n % 100 <= 19) return 'отзывов'
  if (n % 10 === 1) return 'отзыв'
  if (n % 10 >= 2 && n % 10 <= 4) return 'отзыва'
  return 'отзывов'
}
