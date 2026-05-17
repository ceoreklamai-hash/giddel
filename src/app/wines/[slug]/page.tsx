// src/app/wines/[slug]/page.tsx
import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Nav } from '@/components/nav/Nav'
import { supabase } from '@/lib/supabase'
import styles from './WineDetail.module.css'

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

const getWine = cache(async (slug: string): Promise<WineRow | null> => {
  const { data, error } = await supabase
    .from('wines')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
})

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const wine = await getWine(slug)
  if (!wine) return { title: 'Не найдено — Giddel' }
  return {
    title: `${wine.name} — Винная карта Кубани`,
    description: wine.description ?? `${wine.name} — ${wine.region}. Дегустации, экскурсии, авторские ужины.`,
  }
}

export default async function WineDetailPage({ params }: PageProps) {
  const { slug } = await params
  const wine = await getWine(slug)
  if (!wine) notFound()

  const imageSrc = wine.images?.[0] ?? '/categories/wine.jpg'

  return (
    <>
      <Nav />
      <div className={styles.page}>

        {/* Герой */}
        <div className={styles.hero}>
          <Image
            src={imageSrc}
            alt={wine.name}
            fill
            priority
            className={styles.heroImg}
            sizes="100vw"
          />
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <Link href="/wines" className={styles.back}>← Винная карта</Link>
            <span className={styles.region}>{wine.region}</span>
            <h1 className={styles.title}>{wine.name}</h1>
            {wine.rating && (
              <div className={styles.rating}>★ {wine.rating} / 5.0</div>
            )}
          </div>
        </div>

        <div className={styles.layout}>
          {/* Основной контент */}
          <div className={styles.main}>

            {wine.story && (
              <div className={styles.story}>
                <span className={styles.storyLabel}>История</span>
                <p className={styles.storyText}>{wine.story}</p>
              </div>
            )}

            {wine.description && (
              <div className={styles.desc}>
                <span className={styles.storyLabel}>О хозяйстве</span>
                <p className={styles.descText}>{wine.description}</p>
              </div>
            )}

            {/* Карта расположения */}
            {wine.lat != null && wine.lng != null && (
              <div className={styles.mapBlock}>
                <span className={styles.storyLabel}>На карте</span>
                <div className={styles.mapWrap}>
                  <iframe
                    src={`https://yandex.ru/map-widget/v1/?ll=${wine.lng}%2C${wine.lat}&z=12&l=map&pt=${wine.lng},${wine.lat},pm2rdl`}
                    className={styles.mapFrame}
                    title={`Расположение ${wine.name}`}
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* Боковая панель */}
          <div className={styles.sidebar}>
            <div className={styles.sideCard}>

              {wine.price_from && (
                <div className={styles.price}>
                  от <span>{wine.price_from.toLocaleString('ru-RU')} ₽</span>
                  <small>за дегустацию</small>
                </div>
              )}

              <div className={styles.tours}>
                <div className={styles.toursLabel}>Доступные туры</div>
                {wine.tour_types.map(t => (
                  <div key={t} className={styles.tourItem}>
                    <span className={styles.tourDot} />
                    {t}
                  </div>
                ))}
              </div>

              <a
                href={`/activities?category=wine&winery=${wine.slug}`}
                className={styles.ctaBtn}
              >
                Записаться на тур
              </a>

              <div className={styles.note}>
                Бронирование за 30 секунд — подтверждение в течение 30 минут
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
