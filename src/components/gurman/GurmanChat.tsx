'use client'
// src/components/gurman/GurmanChat.tsx
import { useState, useRef, useEffect } from 'react'
import styles from './GurmanChat.module.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const GREETING: Message = {
  role: 'assistant',
  content: 'Привет! Я — Гурман, ваш проводник по кухне Краснодарского края. Расскажу, что попробовать, где поесть и какие блюда здесь готовят лучше всего.',
}

const SUGGESTIONS = [
  'Что обязательно попробовать?',
  'Лучшие рестораны у моря',
  'Где поесть раков и рыбу?',
  'Кубанский борщ — где найти?',
]

export function GurmanChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function send(text: string) {
    if (!text.trim() || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/gurman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      const reply = data.reply ?? 'Извините, что-то пошло не так. Попробуйте ещё раз.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Связь прервалась. Пожалуйста, попробуйте ещё раз.',
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
    <>
      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen(v => !v)}
        aria-label="Открыть Гурмана"
      >
        <span className={styles.fabIcon}>🍽️</span>
        {!open && <span className={styles.fabLabel}>Гурман</span>}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.avatar}>🍽️</div>
            <div className={styles.headerInfo}>
              <div className={styles.name}>Гурман</div>
              <div className={styles.status}>
                <span className={styles.statusDot} />
                AI-гид по кухне Кубани
              </div>
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setOpen(false)}
            >✕</button>
          </div>

          <div className={styles.messages}>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`${styles.message} ${msg.role === 'user' ? styles.user : styles.assistant}`}
              >
                {msg.role === 'assistant' && (
                  <div className={styles.msgAvatar}>🍽️</div>
                )}
                <div className={styles.bubble}>{msg.content}</div>
              </div>
            ))}

            {loading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.msgAvatar}>🍽️</div>
                <div className={`${styles.bubble} ${styles.typing}`}>
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && (
            <div className={styles.suggestions}>
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  type="button"
                  className={styles.suggestion}
                  onClick={() => send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className={styles.inputRow}>
            <textarea
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Спросите Гурмана о еде..."
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
      )}
    </>
  )
}
