'use client'
// src/app/auth/login/TouristLogin.tsx
import { useState } from 'react'
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import { Nav } from '@/components/nav/Nav'
import { Mail, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react'
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

  async function handleVK() {
    await supabase.auth.signInWithOAuth({
      provider: 'vk',
      options: { redirectTo: `${window.location.origin}/profile` },
    })
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

          {/* VK */}
          <button className={styles.vkBtn} onClick={handleVK} type="button">
            <VKIcon />
            Войти через VK
          </button>

          <div className={styles.divider}><span>или по email</span></div>

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

function VKIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14C20.67 22 22 20.67 22 15.07V8.93C22 3.33 20.67 2 15.07 2zm3.08 13.5h-1.54c-.58 0-.76-.46-1.8-1.52-.9-.89-1.3-.98-1.52-.98-.3 0-.39.08-.39.5v1.38c0 .36-.11.57-1.05.57-1.55 0-3.27-.94-4.48-2.7C5.58 10.81 5 8.88 5 8.49c0-.22.08-.43.5-.43h1.54c.37 0 .51.17.65.57.72 2.08 1.93 3.9 2.42 3.9.19 0 .27-.09.27-.57V9.75c-.06-1.01-.59-1.1-.59-1.46 0-.17.14-.35.37-.35h2.42c.32 0 .43.17.43.54v2.9c0 .32.14.43.23.43.19 0 .35-.11.7-.46 1.08-1.2 1.85-3.06 1.85-3.06.1-.22.27-.43.64-.43h1.54c.46 0 .56.24.46.56-.19.87-2.08 3.56-2.08 3.56-.17.27-.22.39 0 .69.16.22.68.68 1.03 1.1.64.73 1.12 1.34 1.25 1.76.13.41-.08.62-.51.62z"/>
    </svg>
  )
}
