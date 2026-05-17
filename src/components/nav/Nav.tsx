// src/components/nav/Nav.tsx
import Link from 'next/link'
import { Map, Wine, Route, Compass } from 'lucide-react'
import styles from './Nav.module.css'

export function Nav() {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>Giddel</Link>
      <div className={styles.links}>
        <Link href="/activities" className={styles.link}>Активности</Link>
        <Link href="/map" className={styles.link}><Map size={13} />Карта</Link>
        <Link href="/wines" className={styles.link}><Wine size={13} />Вина</Link>
        <Link href="/route" className={styles.routeBtn}><Route size={13} />Маршрут</Link>
        <Link href="/vip" className={styles.vipBtn}>ВИП</Link>
        <Link href="/chat" className={styles.link}><Compass size={13} />Атаман</Link>
      </div>
    </nav>
  )
}
