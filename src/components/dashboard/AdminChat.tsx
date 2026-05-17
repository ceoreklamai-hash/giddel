'use client'
// src/components/dashboard/AdminChat.tsx
import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Check, X, Plus, RefreshCw } from 'lucide-react'
import styles from './AdminChat.module.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
  action?: Record<string, unknown>
  actionStatus?: 'pending' | 'done' | 'error'
  actionMessage?: string
}

// Парсит ```action ... ``` блок из ответа AI
function parseAction(text: string): { clean: string; action: Record<string, unknown> | null } {
  const match = text.match(/```action\s*([\s\S]*?)```/)
  if (!match) return { clean: text, action: null }
  try {
    const action = JSON.parse(match[1].trim())
    const clean = text.replace(/```action[\s\S]*?```/, '').trim()
    return { clean, action }
  } catch {
    return { clean: text, action: null }
  }
}

function actionLabel(action: Record<string, unknown>): string {
  switch (action.action) {
    case 'add_activity': return `Добавить: ${action.title}`
    case 'add_winery': return `Добавить винодельню: ${action.name}`
    case 'update_booking': return `Обновить бронь: ${action.status}`
    default: return 'Выполнить'
  }
}

const GREETING: Message = {
  role: 'assistant',
  content: 'Здравствуйте. Я помогу управлять платформой через обычный текст.\n\nПримеры команд:\n— «Добавь конные прогулки в Анапе за 2500 ₽»\n— «Добавь винодельню Кубань-Вино в Новокубанске»\n— «Сколько броней сегодня?»',
}

const QUICK = [
  'Добавь активность квадроциклы Геленджик 3000 ₽',
  'Добавь винодельню в Тамани',
  'Список активных категорий',
]

export function AdminChat({ onRefresh }: { onRefresh?: () => void }) {
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
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history
            .filter(m => !(m === GREETING))
            .map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      const raw = data.reply ?? 'Не удалось получить ответ.'
      const { clean, action } = parseAction(raw)

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: clean,
        action: action ?? undefined,
        actionStatus: action ? 'pending' : undefined,
      }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Ошибка связи. Попробуйте ещё раз.' }])
    } finally {
      setLoading(false)
    }
  }

  async function executeAction(msgIndex: number, action: Record<string, unknown>) {
    setMessages(prev => prev.map((m, i) =>
      i === msgIndex ? { ...m, actionStatus: 'pending' as const } : m
    ))

    try {
      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      })
      const data = await res.json()
      if (data.ok) {
        setMessages(prev => prev.map((m, i) =>
          i === msgIndex ? { ...m, actionStatus: 'done', actionMessage: data.message } : m
        ))
        onRefresh?.()
      } else {
        setMessages(prev => prev.map((m, i) =>
          i === msgIndex ? { ...m, actionStatus: 'error', actionMessage: data.error } : m
        ))
      }
    } catch {
      setMessages(prev => prev.map((m, i) =>
        i === msgIndex ? { ...m, actionStatus: 'error', actionMessage: 'Ошибка сети' } : m
      ))
    }
  }

  function dismissAction(msgIndex: number) {
    setMessages(prev => prev.map((m, i) =>
      i === msgIndex ? { ...m, actionStatus: 'error', actionMessage: 'Отменено' } : m
    ))
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.headerIcon}><Bot size={18} strokeWidth={1.5} /></div>
        <div>
          <div className={styles.headerTitle}>AI-ассистент</div>
          <div className={styles.headerSub}>управление платформой</div>
        </div>
        {onRefresh && (
          <button type="button" className={styles.refreshBtn} onClick={onRefresh} title="Обновить данные">
            <RefreshCw size={14} strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} className={`${styles.msg} ${msg.role === 'user' ? styles.user : styles.assistant}`}>
            {msg.role === 'assistant' && (
              <div className={styles.msgIcon}><Bot size={14} strokeWidth={1.5} /></div>
            )}
            <div className={styles.msgBody}>
              <div className={styles.bubble}>
                {msg.content.split('\n').map((line, j) => (
                  <span key={j}>{line}{j < msg.content.split('\n').length - 1 && <br />}</span>
                ))}
              </div>

              {/* Карточка действия */}
              {msg.action && (
                <div className={`${styles.actionCard} ${msg.actionStatus === 'done' ? styles.done : msg.actionStatus === 'error' ? styles.error : ''}`}>
                  <div className={styles.actionLabel}>{actionLabel(msg.action)}</div>
                  {msg.actionStatus === 'pending' && (
                    <div className={styles.actionBtns}>
                      <button
                        type="button"
                        className={styles.actionConfirm}
                        onClick={() => executeAction(i, msg.action!)}
                      >
                        <Check size={13} /> Выполнить
                      </button>
                      <button
                        type="button"
                        className={styles.actionDismiss}
                        onClick={() => dismissAction(i)}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )}
                  {(msg.actionStatus === 'done' || msg.actionStatus === 'error') && (
                    <div className={styles.actionResult}>
                      {msg.actionStatus === 'done' ? <Check size={12} /> : <X size={12} />}
                      {msg.actionMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className={`${styles.msg} ${styles.assistant}`}>
            <div className={styles.msgIcon}><Bot size={14} strokeWidth={1.5} /></div>
            <div className={styles.bubble}>
              <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className={styles.quick}>
          {QUICK.map(q => (
            <button key={q} type="button" className={styles.quickBtn} onClick={() => send(q)}>
              <Plus size={11} /> {q}
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
          placeholder="Напишите команду..."
          rows={1}
          disabled={loading}
        />
        <button
          type="button"
          className={styles.sendBtn}
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
        >
          <Send size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
