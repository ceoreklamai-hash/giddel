'use client'
// src/app/auth/login/TouristLogin.tsx
import { useState } from 'react'
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import { Nav } from '@/components/nav/Nav'
import { Mail, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react'
// VK OAuth requires custom implementation — добавить позже
import styles from './TouristLogin.module.css'

type Mode = 'login' | 'register'

export function TouristLogin() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  function clearError() { setError('') }

  async function handleSubmit() {
    if (!email.trim() || !password) return
    setLoading(true)
    setError('')

    if (mode === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (err) {
        setError(err.message.includes('Invalid login') ? 'Неверный email или пароль' : err.message)
        setLoading(false)
        return
      }
    } else {
      if (password.length < 6) {
        setError('Пароль должен быть не менее 6 символов')
        setLoading(false)
        return
      }
      const { error: err } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/profile` },
      })
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }
    }

    setDone(true)
    setTimeout(() => { window.location.href = '/profile' }, 800)
    setLoading(false)
  }

  async function sendReset() {
    if (!email.trim()) { setError('Введите email чтобы сбросить пароль'); return }
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    setResetSent(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className={styles.page}>
        <Nav />
        <div className={styles.center}>
          <CheckCircle size={52} strokeWidth={1.5} color="#6ab04c" />
          <h2 className={styles.doneTitle}>Вы вошли!</h2>
          <p className={styles.doneSub}>Перенаправляем в личный кабинет...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Nav />
      <div className={styles.center}>
        <div className={styles.card}>

          {/* Переключатель Войти / Зарегистрироваться */}
          <div className={styles.modeTabs}>
            <button
              className={`${styles.modeTab} ${mode === 'login' ? styles.modeTabActive : ''}`}
              onClick={() => { setMode('login'); clearError() }}
            >
              Войти
            </button>
            <button
              className={`${styles.modeTab} ${mode === 'register' ? styles.modeTabActive : ''}`}
              onClick={() => { setMode('register'); clearError() }}
            >
              Регистрация
            </button>
          </div>

          <p className={styles.sub}>
            {mode === 'login' ? 'Войдите в личный кабинет' : 'Создайте аккаунт — это займёт минуту'}
          </p>

          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div className={styles.inputWrap}>
              <Mail size={15} className={styles.inputIcon} />
              <input
                className={styles.input}
                type="email"
                placeholder="ivan@mail.ru"
                value={email}
                autoComplete="email"
                onChange={e => { setEmail(e.target.value); clearError() }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                autoFocus
              />
            </div>
          </div>

          {/* Пароль */}
          <div className={styles.field}>
            <label className={styles.label}>Пароль</label>
            <div className={styles.inputWrap}>
              <input
                className={styles.input}
                type={showPass ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Минимум 6 символов' : '••••••••'}
                value={password}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                onChange={e => { setPassword(e.target.value); clearError() }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {resetSent && (
            <div className={styles.success}>
              Письмо со сбросом пароля отправлено на {email}
            </div>
          )}

          <button
            className={styles.btn}
            onClick={handleSubmit}
            disabled={loading || !email.trim() || !password}
          >
            {loading ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
            {!loading && <ArrowRight size={16} />}
          </button>

          {mode === 'login' && (
            <button className={styles.forgotBtn} type="button" onClick={sendReset}>
              Забыли пароль?
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

