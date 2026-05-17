'use client'
// src/components/chat/ChatUI.tsx
import { useState, useRef, useEffect } from 'react'
import styles from './ChatUI.module.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const GREETING: Message = {
  role: 'assistant',
  content: 'Здорово, станичник! Я — Атаман Егор, твой казачий проводник по Кубани. Гутаришь, куда хочешь поехать — на море, в горы или на винодельню? Спрашивай, помогу добре!',
}

const SUGGESTIONS = [
  'Что посмотреть с детьми в Геленджике?',
  'Лучшие виноделни для дегустации',
  'Активный отдых — квадроциклы или джипинг?',
  'Маршрут на 3 дня: горы + море',
]

export function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text: string) {
    if (!text.trim() || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next
            .filter(m => m.role !== 'assistant' || m !== GREETING)
            .map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()
      const reply = data.reply ?? 'Что-то пошло не так, станичник. Попробуй ещё раз.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Связь прервалась, как в горном ущелье. Попробуй ещё раз.',
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
    <div className={styles.page}>
      {/* Шапка */}
      <div className={styles.header}>
        <div className={styles.avatar}>
          <span className={styles.avatarIcon}>🐎</span>
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.name}>Атаман Егор</div>
          <div className={styles.status}>
            <span className={styles.statusDot} />
            Казачий гид по Кубани
          </div>
        </div>
      </div>

      {/* Сообщения */}
      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${styles.message} ${msg.role === 'user' ? styles.user : styles.assistant}`}
          >
            {msg.role === 'assistant' && (
              <div className={styles.msgAvatar}>🐎</div>
            )}
            <div className={styles.bubble}>{msg.content}</div>
          </div>
        ))}

        {loading && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.msgAvatar}>🐎</div>
            <div className={`${styles.bubble} ${styles.typing}`}>
              <span /><span /><span />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Подсказки (только в начале) */}
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

      {/* Ввод */}
      <div className={styles.inputRow}>
        <textarea
          className={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Спроси Атамана Егора..."
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
