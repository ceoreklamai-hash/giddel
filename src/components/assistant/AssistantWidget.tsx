'use client'
// src/components/assistant/AssistantWidget.tsx
// Глобальный ИИ-ассистент — помогает выбрать активность и забронировать
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react'
import styles from './AssistantWidget.module.css'

interface Message { role: 'user' | 'assistant'; content: string }

const GREETING: Message = {
  role: 'assistant',
  content: 'Привет! Я Макс, ваш консьерж в Краснодарском крае 🌊\n\nПомогу выбрать идеальную активность — яхты, вино, квадроциклы, конные прогулки и многое другое.\n\nКогда планируете отдых и сколько вас будет?',
}

const QUICK = ['Что посмотреть в Геленджике?', 'Винный тур', 'Активности для детей', 'Что недорого?']

export function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg: Message = { role: 'user', content }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)

    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updated.map(m => ({ role: m.role, content: m.content })) }),
    })

    const data = await res.json()
    const reply: Message = { role: 'assistant', content: data.reply }
    setMessages(prev => [...prev, reply])
    setLoading(false)

    if (!open) setUnread(n => n + 1)
  }

  return (
    <>
      {/* Панель чата */}
      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.avatar}>М</div>
            <div>
              <div className={styles.name}>Макс</div>
              <div className={styles.status}>Консьерж Giddel · онлайн</div>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>
              <ChevronDown size={18} />
            </button>
          </div>

          <div className={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.msg} ${m.role === 'user' ? styles.msgUser : styles.msgAssistant}`}>
                {m.content.split('\n').map((line, j) => (
                  <span key={j}>{line}{j < m.content.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
            ))}
            {loading && (
              <div className={`${styles.msg} ${styles.msgAssistant} ${styles.msgLoading}`}>
                <span />
                <span />
                <span />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Быстрые вопросы — только в начале */}
          {messages.length <= 1 && (
            <div className={styles.quickBtns}>
              {QUICK.map(q => (
                <button key={q} className={styles.quickBtn} onClick={() => send(q)}>{q}</button>
              ))}
            </div>
          )}

          <div className={styles.inputRow}>
            <input
              ref={inputRef}
              className={styles.input}
              placeholder="Напишите вопрос..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              disabled={loading}
            />
            <button
              className={styles.sendBtn}
              onClick={() => send()}
              disabled={!input.trim() || loading}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* FAB-кнопка */}
      <button
        className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label="Открыть консьерж"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && unread > 0 && <span className={styles.badge}>{unread}</span>}
      </button>
    </>
  )
}
