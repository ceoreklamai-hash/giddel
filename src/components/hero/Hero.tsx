// src/components/hero/Hero.tsx
import Image from 'next/image'
import { Quiz } from './Quiz'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section className={styles.hero}>
      <Image
        src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=85"
        alt="Краснодарское побережье, горы и море"
        fill
        priority
        className={styles.bg}
        sizes="100vw"
      />
      <div className={styles.overlay} />
      <div className={styles.content}>
        <div className={styles.tag}>Краснодарский край — лето 2026</div>
        <h1 className={styles.title}>
          Отдых, который<br />вы <em>запомните</em>
        </h1>
        <Quiz />
      </div>
    </section>
  )
}
