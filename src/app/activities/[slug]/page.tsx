// src/app/activities/[slug]/page.tsx
import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Nav } from '@/components/nav/Nav'
import { BookingForm } from '@/components/booking/BookingForm'
import { supabase } from '@/lib/supabase'
import { CATEGORY_LABELS } from '@/lib/types'
import type { Activity } from '@/lib/types'
import styles from './ActivityDetail.module.css'

const getActivity = cache(async (slug: string): Promise<Activity | null> => {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  if (error) return null
  return data
})

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const activity = await getActivity(slug)
  if (!activity) return { title: 'Не найдено — Giddel' }
  return {
    title: `${activity.title} — Giddel`,
    description: activity.description ?? `${activity.title} в ${activity.location_name}. Бронирование онлайн.`,
  }
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const { slug } = await params
  const activity = await getActivity(slug)

  if (!activity) notFound()

  const imageSrc = activity.images?.[0] ?? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'

  return (
    <>
      <Nav />
      <div className={styles.page}>
        <div className={styles.hero}>
          <Image
            src={imageSrc}
            alt={activity.title}
            fill
            priority
            className={styles.heroImg}
            sizes="100vw"
          />
          <div className={styles.heroOverlay} />
        </div>

        <div className={styles.layout}>
          <div className={styles.main}>
            <Link href="/activities" className={styles.backLink}>
              ← Все активности
            </Link>
            <div className={styles.categoryTag}>
              {CATEGORY_LABELS[activity.category]}
            </div>
            <h1 className={styles.title}>{activity.title}</h1>

            <div className={styles.meta}>
              {activity.location_name && (
                <span className={styles.metaItem}>
                  <strong>{activity.location_name}</strong>
                </span>
              )}
              {activity.duration_hours && (
                <span className={styles.metaItem}>
                  Длительность: <strong>{activity.duration_hours} ч</strong>
                </span>
              )}
              <span className={styles.metaItem}>
                От <strong>{activity.price_from.toLocaleString('ru-RU')} ₽</strong> / чел
              </span>
            </div>

            {activity.description && (
              <p className={styles.desc}>{activity.description}</p>
            )}
          </div>

          <div className={styles.sideCol}>
            <BookingForm activity={activity} />
          </div>
        </div>
      </div>
    </>
  )
}
