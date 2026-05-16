// src/components/activities/ActivityCard.tsx
import Image from 'next/image'
import Link from 'next/link'
import type { Activity } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'
import styles from './ActivityCard.module.css'

interface Props {
  activity: Activity
}

export function ActivityCard({ activity }: Props) {
  const imageSrc = activity.images?.[0] ?? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=70'

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src={imageSrc}
          alt={activity.title}
          fill
          className={styles.image}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span className={styles.category}>{CATEGORY_LABELS[activity.category]}</span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{activity.title}</h3>
        {activity.location_name && (
          <p className={styles.location}>{activity.location_name}</p>
        )}
        <div className={styles.footer}>
          <div>
            <span className={styles.price}>
              {activity.price_from.toLocaleString('ru-RU')} ₽
            </span>
            <span className={styles.priceLabel}>/ чел</span>
          </div>
          {activity.duration_hours && (
            <span className={styles.duration}>{activity.duration_hours} ч</span>
          )}
        </div>
        <Link href={`/activities/${activity.slug}`} className={styles.cta}>
          Подробнее →
        </Link>
      </div>
    </article>
  )
}
