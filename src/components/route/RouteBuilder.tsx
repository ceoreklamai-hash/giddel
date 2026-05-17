'use client'
// src/components/route/RouteBuilder.tsx
import { useState, useRef, useEffect } from 'react'
import styles from './RouteBuilder.module.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const GREETING: Message = {
  role: 'assistant',
  content: 'Добре, станичник! Давай построим тебе маршрут по Кубани — такой, что запомнишь на всю жизнь 🐎\n\nСкажи: сколько дней планируешь и кто едет — пара, семья, компания?',
}

// Быстрые варианты для первого шага
const QUICK_REPLIES = [
  { label: '🌊 3 дня, море + вино', text: '3 дня, едем вдвоём, хотим море и виноделни' },
  { label: '🏔️ 5 дней, горы + активности', text: '5 дней, семья с детьми, горы и активный отдых' },
  { label: '🍷 Уикенд, только вино', text: '2 дня, компания 4 человека, только виноделни и гастрономия' },
  { label: '🎯 Насыщенная неделя', text: '7 дней, хочу всё: море, горы, вино и экстрим' },
]

// Рендер текста с markdown-разметкой (жирный, списки)
function renderText(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    // Заголовок **День N — ...**
    if (line.startsWith('**') && line.endsWith('**')) {
      return <div key={i} className={styles.dayTitle}>{line.replace(/\*\*/g, '')}</div>
    }
    // Пункт списка • ...
    if (line.startsWith('•')) {
      return <div key={i} className={styles.bullet}>{line}</div>
    }
    // Жирный внутри строки
    if (line.includes('**')) {
      const parts = line.split(/(\*\*[^*]+\*\*)/)
      return (
        <div key={i} className={styles.line}>
          {parts.map((p, j) =>
            p.startsWith('**') ? <strong key={j}>{p.replace(/\*\*/g, '')}</strong> : p
          )}
        </div>
      )
    }
    if (line === '') return <div key={i} className={styles.spacer} />
    return <div key={i} className={styles.line}>{line}</div>
  })
}

export function RouteBuilder() {
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showQuick, setShowQuick] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text: string) {
    if (!text.trim() || loading) return
    setShowQuick(false)

    const userMsg: Message = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()
      const reply = data.reply ?? 'Что-то пошло не так. Попробуй ещё раз.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Связь прервалась, как в горах. Попробуй ещё раз, добре?',
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div className={styles.builder}>
      {/* Заголовок */}
      <div className={styles.header}>
        <div className={styles.avatar}>🐎</div>
        <div>
          <div className={styles.avatarName}>Атаман Егор</div>
          <div className={styles.avatarSub}>строит маршруты по Кубани</div>
        </div>
        <button
          type="button"
          className={styles.resetBtn}
          onClick={() => { setMessages([GREETING]); setShowQuick(true) }}
          title="Начать заново"
        >
          ↺
        </button>
      </div>

      {/* Сообщения */}
      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} className={`${styles.msg} ${msg.role === 'user' ? styles.user : styles.bot}`}>
            {msg.role === 'assistant' && <div className={styles.botIcon}>🐎</div>}
            <div className={styles.bubble}>
              {msg.role === 'assistant' ? renderText(msg.content) : msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className={`${styles.msg} ${styles.bot}`}>
            <div className={styles.botIcon}>🐎</div>
            <div className={`${styles.bubble} ${styles.typing}`}>
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Быстрые ответы */}
      {showQuick && (
        <div className={styles.quickReplies}>
          {QUICK_REPLIES.map(q => (
            <button
              key={q.text}
              type="button"
              className={styles.quickBtn}
              onClick={() => send(q.text)}
            >
              {q.label}
            </button>
          ))}
        </div>
      )}

      {/* Ввод */}
      <div className={styles.inputRow}>
        <textarea
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Расскажи Атаману о своих планах..."
          rows={1}
          disabled={loading}
        />
        <button
          type="button"
          className={styles.sendBtn}
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
        >
          →
        </button>
      </div>
    </div>
  )
}
