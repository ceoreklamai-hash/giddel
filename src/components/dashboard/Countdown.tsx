'use client'
// src/components/dashboard/Countdown.tsx
import { useState, useEffect } from 'react'
import { Timer } from 'lucide-react'
import styles from './Countdown.module.css'

interface Props {
  expiresAt: string | null
  onExpire?: () => void
}

export function Countdown({ expiresAt, onExpire }: Props) {
  const [secsLeft, setSecsLeft] = useState<number | null>(null)

  useEffect(() => {
    if (!expiresAt) return

    function calc() {
      const diff = Math.floor((new Date(expiresAt!).getTime() - Date.now()) / 1000)
      setSecsLeft(diff)
      if (diff <= 0) onExpire?.()
    }

    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [expiresAt, onExpire])

  if (secsLeft === null || secsLeft <= 0) return null

  const mins = Math.floor(secsLeft / 60)
  const secs = secsLeft % 60
  const urgent = secsLeft < 300 // меньше 5 минут

  return (
    <span className={`${styles.timer} ${urgent ? styles.urgent : ''}`}>
      <Timer size={11} strokeWidth={2} />
      {mins}:{String(secs).padStart(2, '0')}
    </span>
  )
}
