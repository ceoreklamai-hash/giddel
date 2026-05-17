'use client'
// src/components/nav/Nav.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Map, Wine, Route, Compass, User, Menu, X } from 'lucide-react'
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import styles from './Nav.module.css'

export function Nav() {
  const [open, setOpen] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session)
    })
  }, [])

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>Giddel</Link>

      {/* Desktop links */}
      <div className={styles.links}>
        <Link href="/activities" className={styles.link}>Активности</Link>
        <Link href="/map" className={styles.link}><Map size={13} />Карта</Link>
        <Link href="/wines" className={styles.link}><Wine size={13} />Вина</Link>
        <Link href="/chat" className={styles.link}><Compass size={13} />Атаман</Link>
        <Link href="/route" className={styles.routeBtn}><Route size={13} />Маршрут</Link>
        <Link href="/vip" className={styles.vipBtn}>ВИП</Link>
        {loggedIn
          ? <Link href="/profile" className={styles.loginBtn}><User size={13} />Профиль</Link>
          : <Link href="/auth/login" className={styles.loginBtn}><User size={13} />Войти</Link>
        }
      </div>

      {/* Mobile burger */}
      <button className={styles.burger} onClick={() => setOpen(o => !o)} aria-label="Меню">
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile drawer */}
      {open && (
        <div className={styles.drawer} onClick={() => setOpen(false)}>
          <Link href="/activities" className={styles.drawerLink}>Активности</Link>
          <Link href="/map" className={styles.drawerLink}>Карта</Link>
          <Link href="/wines" className={styles.drawerLink}>Вина</Link>
          <Link href="/how-it-works" className={styles.drawerLink}>Как это работает</Link>
          <Link href="/chat" className={styles.drawerLink}>Атаман Егор</Link>
          <Link href="/route" className={styles.drawerLink}>Маршрут</Link>
          <Link href="/vip" className={styles.drawerLink}>ВИП</Link>
          {loggedIn
            ? <Link href="/profile" className={styles.drawerLogin}>Профиль</Link>
            : <Link href="/auth/login" className={styles.drawerLogin}>Войти</Link>
          }
        </div>
      )}
    </nav>
  )
}
