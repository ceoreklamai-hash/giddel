// src/app/activities/page.tsx
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Nav } from '@/components/nav/Nav'
import { ActivityCard } from '@/components/activities/ActivityCard'
import { CategoryTabs } from '@/components/activities/CategoryTabs'
import { MapView } from '@/components/activities/MapView'
import { supabase } from '@/lib/supabase'
import type { Activity, Category } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'
import styles from './Activities.module.css'

export const metadata: Metadata = {
  title: 'Активности — Kuban.Guide',
  description: 'Все активности Краснодарского края: яхты, конные прогулки, квадроциклы, сёрфинг, виноделие и многое другое.',
}

async function getActivities(category: Category | null): Promise<Activity[]> {
  let query = supabase
    .from('activities')
    .select('*')
    .eq('is_active', true)
    .order('price_from', { ascending: true })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) {
    console.error('[activities] Supabase error:', error.message)
    return []
  }
  return data ?? []
}

interface PageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function ActivitiesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const validCategories = Object.keys(CATEGORY_LABELS) as Category[]
  const category = validCategories.includes(params.category as Category)
    ? (params.category as Category)
    : null
  const activities = await getActivities(category)

  return (
    <>
      <Nav />
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>
              {category ? (
                <span>{CATEGORY_LABELS[category]}</span>
              ) : (
                <>Все <span>активности</span></>
              )}
            </h1>
            <span className={styles.count}>{activities.length} результатов</span>
          </div>
          <Suspense fallback={null}>
            <CategoryTabs />
          </Suspense>
        </div>

        <div className={styles.layout}>
          <div>
            <div className={styles.grid}>
              {activities.length === 0 ? (
                <div className={styles.empty}>Активностей в этой категории пока нет</div>
              ) : (
                activities.map(a => (
                  <ActivityCard key={a.id} activity={a} />
                ))
              )}
            </div>
          </div>

          <div className={styles.mapCol}>
            <MapView activities={activities} />
          </div>
        </div>
      </div>
    </>
  )
}
