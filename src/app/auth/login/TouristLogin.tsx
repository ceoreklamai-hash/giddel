'use client'
// src/app/auth/login/TouristLogin.tsx
// Email → magic link (кликнуть ссылку в письме)
// Телефон → SMS OTP (ввести 6-значный код)
import { useState } from 'react'
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'
import { Nav } from '@/components/nav/Nav'
import { Mail, Phone, ArrowRight, CheckCircle, MailOpen } from 'lucide-react'
import styles from './TouristLogin.module.css'

type Method = 'email' | 'phone'

export function TouristLogin() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [method, setMethod] = useState<Method>('email')
  const [value, setValue] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'input' | 'link_sent' | 'otp' | 'done'>('input')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function formatPhone(raw: string) {
    const digits = raw.replace(/\D/g, '')
    if (digits.startsWith('8') && digits.length === 11) return '+7' + digits.slice(1)
    if (digits.startsWith('7') && digits.length === 11) return '+' + digits
    return raw
  }

  async function sendCode() {
    setLoading(true)
    setError('')

    if (method === 'email') {
      // Логин через серверный роут — без отправки письма
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value.trim() }),
      })
      const data = await res.json()
      if (!data.ok) { setError(data.error ?? 'Ошибка входа'); setLoading(false); return }

      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      })
      setStep('done')
      setTimeout(() => { window.location.href = '/profile' }, 800)
    } else {
      const phone = formatPhone(value)
      const { error: err } = await supabase.auth.signInWithOtp({ phone })
      if (err) { setError(err.message); setLoading(false); return }
      setStep('otp')
    }
    setLoading(false)
  }

  async function verifyOtp() {
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.verifyOtp({
      phone: formatPhone(value), token: otp, type: 'sms'
    })
    if (err) { setError('Неверный код. Проверьте и попробуйте снова.'); setLoading(false); return }
    setStep('done')
    setTimeout(() => { window.location.href = '/profile' }, 1200)
    setLoading(false)
  }

  // Вход успешен
  if (step === 'done') {
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

  // Email — ссылка отправлена
  if (step === 'link_sent') {
    return (
      <div className={styles.page}>
        <Nav />
        <div className={styles.center}>
          <div className={styles.card}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <MailOpen size={48} strokeWidth={1.2} color="var(--color-accent)" />
            </div>
            <h2 className={styles.title}>Проверьте почту</h2>
            <p className={styles.sub}>
              Отправили письмо на <strong style={{ color: '#fff' }}>{value}</strong>.
              Нажмите на ссылку в письме — и вы автоматически войдёте в личный кабинет.
            </p>
            <p className={styles.hint} style={{ marginTop: 16 }}>
              Письмо может прийти в течение 1–2 минут. Проверьте папку «Спам», если не нашли.
            </p>
            <button
              className={styles.back}
              style={{ marginTop: 24 }}
              onClick={() => { setStep('input'); setError('') }}
            >
              ← Изменить email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Nav />
      <div className={styles.center}>
        <div className={styles.card}>
          <h1 className={styles.title}>Вход или регистрация</h1>
          <p className={styles.sub}>Аккаунт создаётся автоматически при первом входе</p>

          {step === 'input' && (
            <>
              <div className={styles.methodTabs}>
                <button
                  className={`${styles.methodTab} ${method === 'email' ? styles.methodTabActive : ''}`}
                  onClick={() => { setMethod('email'); setValue(''); setError('') }}
                >
                  <Mail size={15} /> Email
                </button>
                <button
                  className={`${styles.methodTab} ${method === 'phone' ? styles.methodTabActive : ''}`}
                  onClick={() => { setMethod('phone'); setValue(''); setError('') }}
                >
                  <Phone size={15} /> Телефон
                </button>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  {method === 'email' ? 'Email-адрес' : 'Номер телефона'}
                </label>
                <input
                  className={styles.input}
                  type={method === 'email' ? 'email' : 'tel'}
                  placeholder={method === 'email' ? 'ivan@mail.ru' : '+7 900 000 00 00'}
                  value={value}
                  onChange={e => { setValue(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && sendCode()}
                  autoFocus
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button
                className={styles.btn}
                onClick={sendCode}
                disabled={loading || !value.trim()}
              >
                {loading ? 'Отправляем...' : method === 'email' ? 'Отправить ссылку' : 'Получить код'}
                {!loading && <ArrowRight size={16} />}
              </button>

              <p className={styles.hint}>
                {method === 'email'
                  ? 'Пришлём ссылку для входа на email — без паролей'
                  : 'Отправим SMS с кодом подтверждения'}
              </p>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className={styles.otpInfo}>
                SMS с кодом отправлено на {value}:
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Код из SMS</label>
                <input
                  className={`${styles.input} ${styles.inputOtp}`}
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                  autoFocus
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button
                className={styles.btn}
                onClick={verifyOtp}
                disabled={loading || otp.length < 6}
              >
                {loading ? 'Проверяем...' : 'Войти'}
                {!loading && <ArrowRight size={16} />}
              </button>

              <button
                className={styles.back}
                onClick={() => { setStep('input'); setOtp(''); setError('') }}
              >
                ← Изменить телефон
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
