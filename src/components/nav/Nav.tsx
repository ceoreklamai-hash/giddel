// src/components/nav/Nav.tsx
import Link from 'next/link'
import styles from './Nav.module.css'

export function Nav() {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>Kuban.Guide</Link>
      <div className={styles.links}>
        <Link href="/activities" className={styles.link}>Активности</Link>
        <Link href="/route" className={styles.link}>Маршруты</Link>
        <Link href="/wines" className={styles.link}>Вина</Link>
      </div>
    </nav>
  )
}
