// src/app/wines/page.tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Nav } from '@/components/nav/Nav'
import { SommelierChat } from '@/components/sommelier/SommelierChat'
import { supabase } from '@/lib/supabase'
import styles from './Wines.module.css'

export const metadata: Metadata = {
  title: 'Винная карта Кубани — Giddel',
  description: 'Лучшие виноделни Краснодарского края: Абрау-Дюрсо, Фанагория, Лефкадия, Шато де Талю. Дегустации, туры, авторские ужины.',
}

interface WineRow {
  id: string
  slug: string
  name: string
  region: string
  story: string | null
  description: string | null
  tour_types: string[]
  price_from: number | null
  images: string[] | null
  lat: number | null
  lng: number | null
  rating: number | null
}

async function getWines(): Promise<WineRow[]> {
  const { data, error } = await supabase
    .from('wines')
    .select('*')
    .order('rating', { ascending: false })
  if (error) {
    console.error('[wines]', error.message)
    return []
  }
  return data ?? []
}

const REGION_COLORS: Record<string, string> = {
  'Новороссийск': '#a87fe8',
  'Таманский полуостров': '#6ab04c',
  'Геленджик': '#e8a87f',
  'Новокубанск': '#e8d07f',
  'Краснодар': '#7fc8e8',
}

export default async function WinesPage() {
  const wines = await getWines()

  // Центр карты — середина Кубанских виноградников (Абрау-Дюрсо)
  const mapCenter = { lat: 44.95, lng: 38.20 }

  return (
    <>
      <Nav />
      <div className={styles.page}>

        {/* Герой */}
        <div className={styles.hero}>
          <Image
            src="/categories/wine.jpg"
            alt="Виноградники Кубани"
            fill
            priority
            className={styles.heroImg}
            sizes="100vw"
          />
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <span className={styles.heroLabel}>Краснодарский край</span>
            <h1 className={styles.heroTitle}>
              Винная карта<br /><em>Кубани</em>
            </h1>
            <p className={styles.heroDesc}>
              8 виноделен — от легендарной Абрау-Дюрсо до бутиковых хозяйств Тамани.
              История, терруар и вкус, который невозможно забыть.
            </p>
          </div>
        </div>

        {/* Карта + легенда */}
        <div className={styles.mapSection}>
          <div className={styles.mapWrap}>
            <iframe
              src={`https://yandex.ru/map-widget/v1/?ll=${mapCenter.lng}%2C${mapCenter.lat}&z=8&l=map`}
              className={styles.mapFrame}
              title="Виноделни Кубани"
              allowFullScreen
            />
          </div>
          <div className={styles.legend}>
            <div className={styles.legendTitle}>Регионы</div>
            {Object.entries(REGION_COLORS).map(([region, color]) => (
              <div key={region} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: color }} />
                {region}
              </div>
            ))}
            <div className={styles.legendNote}>
              Всего виноградников<br />
              <strong>~{wines.length} хозяйств</strong> на карте
            </div>
          </div>
        </div>

        {/* Сетка виноделен */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className="label">Все виноделни</span>
            <span className={styles.count}>{wines.length} хозяйств</span>
          </div>

          <div className={styles.grid}>
            {wines.map((wine, i) => {
              const regionColor = REGION_COLORS[wine.region] ?? '#a87fe8'
              return (
                <Link key={wine.id} href={`/wines/${wine.slug}`} className={styles.card}>
                  <div className={styles.cardAccent} style={{ background: regionColor + '18', borderColor: regionColor + '30' }}>
                    <div className={styles.cardNumber}>{String(i + 1).padStart(2, '0')}</div>
                    <span
                      className={styles.cardRegion}
                      style={{ color: regionColor, borderColor: regionColor + '40' }}
                    >
                      {wine.region}
                    </span>
                    {wine.rating && (
                      <div className={styles.cardRating} style={{ color: regionColor }}>★ {wine.rating}</div>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <h2 className={styles.cardName}>{wine.name}</h2>
                    {wine.story && (
                      <p className={styles.cardStory}>
                        {wine.story.slice(0, 160)}…
                      </p>
                    )}
                    <div className={styles.cardTours}>
                      {wine.tour_types.slice(0, 3).map(t => (
                        <span key={t} className={styles.cardTour}>{t}</span>
                      ))}
                    </div>
                    <div className={styles.cardFooter}>
                      {wine.price_from && (
                        <span className={styles.cardPrice}>
                          от {wine.price_from.toLocaleString('ru-RU')} ₽
                        </span>
                      )}
                      <span className={styles.cardCta}>Узнать →</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <SommelierChat />
    </>
  )
}
