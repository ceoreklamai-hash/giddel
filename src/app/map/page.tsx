// src/app/map/page.tsx
import type { Metadata } from 'next'
import { Nav } from '@/components/nav/Nav'
import { InteractiveMap } from '@/components/map/InteractiveMap'
import { supabase } from '@/lib/supabase'
import type { Activity } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'
import styles from './Map.module.css'

export const metadata: Metadata = {
  title: 'Карта развлечений — Giddel',
  description: 'Интерактивная карта всех активностей Краснодарского края: яхты, дайвинг, конные прогулки, виноделни и многое другое.',
}

async function getAllActivities(): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('is_active', true)
    .not('lat', 'is', null)
  if (error) {
    console.error('[map activities]', error.message)
    return []
  }
  return (data ?? []) as Activity[]
}

interface WineRow {
  id: string; name: string; region: string
  lat: number | null; lng: number | null
  price_from: number | null; slug: string
}

async function getAllWines(): Promise<WineRow[]> {
  const { data, error } = await supabase
    .from('wines')
    .select('id,name,region,lat,lng,price_from,slug')
  if (error) {
    console.error('[map wines]', error.message)
    return []
  }
  // фильтруем на клиенте чтобы не зависеть от типа колонки
  return (data ?? []).filter(w => w.lat != null && w.lng != null) as WineRow[]
}

export default async function MapPage() {
  const [activities, wines] = await Promise.all([getAllActivities(), getAllWines()])
  console.log(`[map] activities: ${activities.length}, wines: ${wines.length}`)

  // Группируем по категориям для легенды
  const categoryCount: Record<string, number> = {}
  activities.forEach(a => {
    categoryCount[a.category] = (categoryCount[a.category] ?? 0) + 1
  })

  return (
    <>
      <Nav />
      <div className={styles.page}>

        {/* Боковая панель */}
        <div className={styles.sidebar}>
          <div className={styles.sideHeader}>
            <span className="label">Карта развлечений</span>
            <h1 className={styles.title}>Куда<br />поехать?</h1>
            <p className={styles.desc}>
              {activities.length} активностей на карте. Кликни на метку — увидишь подробности.
            </p>
          </div>

          <div className={styles.legend}>
            {wines.length > 0 && (
              <div className={styles.legendItem} style={{ marginBottom: 8 }}>
                <span className={styles.legendLabel} style={{ color: '#c9a227' }}>🍷 Виноделни</span>
                <span className={styles.legendCount} style={{ color: '#c9a227' }}>{wines.length}</span>
              </div>
            )}
            <div className={styles.legendTitle}>Активности</div>
            {Object.entries(categoryCount).map(([cat, count]) => (
              <div key={cat} className={styles.legendItem}>
                <span className={styles.legendLabel}>
                  {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}
                </span>
                <span className={styles.legendCount}>{count}</span>
              </div>
            ))}
          </div>

          <a href="/activities" className={styles.ctaBtn}>
            Смотреть список →
          </a>
        </div>

        {/* Карта */}
        <div className={styles.mapWrap}>
          <InteractiveMap activities={activities} wines={wines} />
        </div>
      </div>
    </>
  )
}
