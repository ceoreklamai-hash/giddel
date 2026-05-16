// src/components/wine/WineBlock.tsx
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Wine } from '@/lib/types'
import styles from './WineBlock.module.css'

async function getWines(): Promise<Wine[]> {
  const { data } = await supabase
    .from('wines')
    .select('*')
    .limit(4)
  return data ?? []
}

export async function WineBlock() {
  const wines = await getWines()

  return (
    <section className={styles.block}>
      <div className={styles.image}>
        <Image
          src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=900&q=85"
          alt="Виноделни Кубани"
          fill
          sizes="50vw"
        />
      </div>
      <div className={styles.content}>
        <span className="label">Особый раздел</span>
        <h2 className={styles.title}>
          Винная карта<br /><em>Кубани</em>
        </h2>
        <p className={styles.desc}>
          Более 30 виноделен Краснодарского края — от легендарной Фанагории
          до бутиковых хозяйств Таманского полуострова. Дегустации, экскурсии
          по виноградникам, авторские ужины.
        </p>
        {wines.length > 0 && (
          <div className={styles.wineries}>
            {wines.map(w => (
              <div key={w.id} className={styles.winery}>
                <span className={styles.wineryName}>{w.name}</span>
                <span className={styles.wineryRegion}>{w.region}</span>
              </div>
            ))}
          </div>
        )}
        <Link href="/wines" className={styles.cta}>
          Все виноделни →
        </Link>
      </div>
    </section>
  )
}
