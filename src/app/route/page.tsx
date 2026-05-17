// src/app/route/page.tsx
import type { Metadata } from 'next'
import { Nav } from '@/components/nav/Nav'
import { RouteBuilder } from '@/components/route/RouteBuilder'
import styles from './Route.module.css'

export const metadata: Metadata = {
  title: 'Построить маршрут — Giddel',
  description: 'AI-гид Атаман Егор построит персональный маршрут по Краснодарскому краю за 2 минуты.',
}

export default function RoutePage() {
  return (
    <>
      <Nav />
      <div className={styles.page}>
        <div className={styles.left}>
          <span className={styles.label}>AI-маршрутизатор</span>
          <h1 className={styles.title}>
            Построй<br />маршрут<br /><em>мечты</em>
          </h1>
          <p className={styles.desc}>
            Атаман Егор знает каждую тропу Кубани.
            Расскажи о себе — получишь маршрут по дням
            с конкретными местами, виноделнями и активностями.
          </p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🗓️</span>
              <span>Маршрут по дням</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📍</span>
              <span>Реальные места</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🍷</span>
              <span>Под твои интересы</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>💬</span>
              <span>Ответы на вопросы</span>
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <RouteBuilder />
        </div>
      </div>
    </>
  )
}
