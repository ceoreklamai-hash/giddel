'use client'
// src/app/admin/login/AdminLogin.tsx
import { useState } from 'react'
import styles from './AdminLogin.module.css'

export function AdminLogin() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    })

    const data = await res.json()
    if (data.ok) {
      window.location.href = '/admin'
    } else {
      setError(data.error ?? 'Ошибка входа')
    }
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>GIDDEL</div>
        <div className={styles.subtitle}>Операторская панель</div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Email или телефон</label>
            <input
              className={styles.input}
              type="text"
              placeholder="admin@giddel.ru"
              value={login}
              onChange={e => setLogin(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Пароль</label>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button className={styles.btn} type="submit" disabled={loading || !login || !password}>
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}
