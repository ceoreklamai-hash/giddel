// src/components/hero/Quiz.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { QuizState } from '@/lib/types'
import styles from './Hero.module.css'

const WHO_OPTIONS = [
  { value: 'couple', label: 'Вдвоём' },
  { value: 'family', label: 'С семьёй' },
  { value: 'group', label: 'Компания' },
  { value: 'solo', label: 'Один' },
] as const

const INTEREST_OPTIONS = [
  { value: 'wine', label: 'Вино и гастро' },
  { value: 'sea', label: 'Море и яхты' },
  { value: 'active', label: 'Активный отдых' },
  { value: 'nature', label: 'Природа' },
]

export function Quiz() {
  const router = useRouter()
  const [quiz, setQuiz] = useState<QuizState>({ who: null, interests: [], days: 2 })

  function toggleWho(value: QuizState['who']) {
    setQuiz(q => ({ ...q, who: q.who === value ? null : value }))
  }

  function toggleInterest(value: string) {
    setQuiz(q => ({
      ...q,
      interests: q.interests.includes(value)
        ? q.interests.filter(i => i !== value)
        : [...q.interests, value],
    }))
  }

  function handleSubmit() {
    const params = new URLSearchParams({
      who: quiz.who ?? 'couple',
      interests: quiz.interests.join(','),
      days: String(quiz.days),
    })
    router.push(`/route?${params}`)
  }

  return (
    <div className={styles.quiz}>
      <div className={styles.quizLabel}>С кем едете?</div>
      <div className={styles.chips}>
        {WHO_OPTIONS.map(o => (
          <button
            key={o.value}
            className={`${styles.chip} ${quiz.who === o.value ? styles.chipActive : ''}`}
            onClick={() => toggleWho(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className={styles.quizLabel} style={{ marginTop: 20 }}>Что интересует?</div>
      <div className={styles.chips}>
        {INTEREST_OPTIONS.map(o => (
          <button
            key={o.value}
            className={`${styles.chip} ${quiz.interests.includes(o.value) ? styles.chipActive : ''}`}
            onClick={() => toggleInterest(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>

      <button
        className={styles.cta}
        onClick={handleSubmit}
        disabled={!quiz.who && quiz.interests.length === 0}
      >
        Построить маршрут
      </button>
    </div>
  )
}
