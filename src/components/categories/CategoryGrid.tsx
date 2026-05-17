// src/components/categories/CategoryGrid.tsx
import Image from 'next/image'
import Link from 'next/link'
import { CATEGORY_LABELS, CATEGORY_IMAGES, type Category } from '@/lib/types'
import styles from './CategoryGrid.module.css'

// Порядок: море → вино → природа → активности → вода → горы → воздух → экстрим
const SHOWN_CATEGORIES: Category[] = [
  'diving', 'yacht', 'wine', 'horse',
  'quad', 'surf', 'fishing', 'canyon',
  'paraglide', 'jeep', 'kayak', 'farm',
  'spa', 'helicopter', 'zipline', 'skydive',
]

export function CategoryGrid() {
  return (
    <section className={styles.section}>
      <div className={styles.label}>
        <span className="label">Все активности</span>
      </div>
      <div className={styles.grid}>
        {SHOWN_CATEGORIES.map(cat => (
          <Link key={cat} href={`/activities?category=${cat}`} className={styles.item}>
            <Image
              src={CATEGORY_IMAGES[cat]}
              alt={CATEGORY_LABELS[cat]}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
            />
            <span className={styles.name}>{CATEGORY_LABELS[cat]}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
