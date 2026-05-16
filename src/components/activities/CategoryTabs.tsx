// src/components/activities/CategoryTabs.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORY_LABELS, type Category } from '@/lib/types'
import styles from './CategoryTabs.module.css'

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[]

export function CategoryTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('category') as Category | null

  function select(cat: Category | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (cat) {
      params.set('category', cat)
    } else {
      params.delete('category')
    }
    router.push(`/activities?${params.toString()}`)
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={`${styles.tab} ${!active ? styles.tabActive : ''}`}
        onClick={() => select(null)}
      >
        Все
      </button>
      {ALL_CATEGORIES.map(cat => (
        <button
          key={cat}
          type="button"
          className={`${styles.tab} ${active === cat ? styles.tabActive : ''}`}
          onClick={() => select(cat)}
        >
          {CATEGORY_LABELS[cat]}
        </button>
      ))}
    </div>
  )
}
