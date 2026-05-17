'use client'
// src/components/admin/AdminPanel.tsx
import { useState } from 'react'
import { Plus, Copy, Check, ExternalLink, Power } from 'lucide-react'
import { CATEGORY_LABELS } from '@/lib/types'
import type { Category } from '@/lib/types'
import styles from './AdminPanel.module.css'

interface Partner {
  id: string; name: string; phone: string | null; email: string | null; portal_token: string | null; rating: number | null
}
interface Activity {
  id: string; title: string; category: string; price_from: number; is_active: boolean; partner_id: string | null; location_name: string | null
}
interface Booking {
  id: string; status: string; total_price: number; commission_amount: number; created_at: string; source: string | null;
  tourist_name: string | null; tourist_phone: string | null; tourist_email: string | null;
  booking_date: string; guests_count: number;
  activity: { title: string; partner_id: string | null } | null
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Ожидает', confirmed: 'Подтверждено', paid: 'Оплачено', cancelled: 'Отменено',
}
const STATUS_COLOR: Record<string, string> = {
  pending: '#e8a85c', confirmed: '#6ab04c', paid: '#6fa8a3', cancelled: '#555',
}

const PARTNER_DEFAULT = { name: '', phone: '', email: '', commission_pct: 10 }
const ACTIVITY_DEFAULT = { title: '', category: 'quad', price_from: 0, duration_hours: 2, location_name: '', description: '', partner_id: '' }

export function AdminPanel({ initialPartners, initialActivities, initialBookings }: {
  initialPartners: Partner[], initialActivities: Activity[], initialBookings: Booking[]
}) {
  const [tab, setTab] = useState<'partners' | 'activities' | 'bookings'>('bookings')
  const [partners, setPartners] = useState(initialPartners)
  const [activities, setActivities] = useState(initialActivities)
  const [bookings] = useState(initialBookings)
  const [showPartnerForm, setShowPartnerForm] = useState(false)
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [partnerForm, setPartnerForm] = useState(PARTNER_DEFAULT)
  const [activityForm, setActivityForm] = useState(ACTIVITY_DEFAULT)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://giddel.ru'

  function copyLink(token: string) {
    navigator.clipboard.writeText(`${origin}/partner/${token}`)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  async function addPartner() {
    if (!partnerForm.name) return
    setSaving(true)
    const res = await fetch('/api/admin/partner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partnerForm),
    })
    const data = await res.json()
    if (data.ok) {
      setPartners(prev => [data.partner, ...prev])
      setShowPartnerForm(false)
      setPartnerForm(PARTNER_DEFAULT)
    }
    setSaving(false)
  }

  async function addActivity() {
    if (!activityForm.title || !activityForm.category) return
    setSaving(true)
    const res = await fetch('/api/admin/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityForm),
    })
    const data = await res.json()
    if (data.ok) {
      setActivities(prev => [data.activity, ...prev])
      setShowActivityForm(false)
      setActivityForm(ACTIVITY_DEFAULT)
    }
    setSaving(false)
  }

  async function toggleActivity(id: string, is_active: boolean) {
    await fetch('/api/admin/activity', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: !is_active }),
    })
    setActivities(prev => prev.map(a => a.id === id ? { ...a, is_active: !is_active } : a))
  }

  return (
    <div className={styles.wrap}>
      {/* Табы */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'bookings' ? styles.tabActive : ''}`} onClick={() => setTab('bookings')}>
          Заявки <span className={styles.cnt}>{bookings.length}</span>
        </button>
        <button className={`${styles.tab} ${tab === 'partners' ? styles.tabActive : ''}`} onClick={() => setTab('partners')}>
          Партнёры <span className={styles.cnt}>{partners.length}</span>
        </button>
        <button className={`${styles.tab} ${tab === 'activities' ? styles.tabActive : ''}`} onClick={() => setTab('activities')}>
          Активности <span className={styles.cnt}>{activities.length}</span>
        </button>
      </div>

      {/* ЗАЯВКИ */}
      {tab === 'bookings' && (
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>Все заявки</span>
          </div>
          <div className={styles.bookingList}>
            {bookings.map(b => (
              <div key={b.id} className={styles.bookingRow}>
                <div className={styles.bookingMain}>
                  <div className={styles.bookingTitle}>{b.activity?.title ?? '—'}</div>
                  <div className={styles.bookingMeta}>
                    {b.tourist_name && <span>{b.tourist_name}</span>}
                    {b.tourist_phone && <span>{b.tourist_phone}</span>}
                    {b.tourist_email && <span>{b.tourist_email}</span>}
                    <span>{b.booking_date}</span>
                    <span>{b.guests_count} чел.</span>
                  </div>
                </div>
                <div className={styles.bookingRight}>
                  <div className={styles.bookingPrice}>{b.total_price.toLocaleString('ru-RU')} ₽</div>
                  <div className={styles.bookingStatus} style={{ color: STATUS_COLOR[b.status] }}>
                    {STATUS_LABEL[b.status]}
                  </div>
                  <div className={styles.bookingDate}>
                    {new Date(b.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {bookings.length === 0 && <div className={styles.empty}>Заявок пока нет</div>}
          </div>
        </div>
      )}

      {/* ПАРТНЁРЫ */}
      {tab === 'partners' && (
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>Партнёры</span>
            <button className={styles.addBtn} onClick={() => setShowPartnerForm(v => !v)}>
              <Plus size={14} /> Добавить партнёра
            </button>
          </div>

          {showPartnerForm && (
            <div className={styles.formCard}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Название бизнеса *</label>
                  <input className={styles.input} placeholder="Квадроциклы Геленджик" value={partnerForm.name} onChange={e => setPartnerForm(f => ({...f, name: e.target.value}))} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Телефон</label>
                  <input className={styles.input} placeholder="+7 900 000 00 00" value={partnerForm.phone} onChange={e => setPartnerForm(f => ({...f, phone: e.target.value}))} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input className={styles.input} placeholder="partner@example.com" value={partnerForm.email} onChange={e => setPartnerForm(f => ({...f, email: e.target.value}))} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Комиссия Giddel, %</label>
                  <input className={styles.input} type="number" min="0" max="50" value={partnerForm.commission_pct} onChange={e => setPartnerForm(f => ({...f, commission_pct: Number(e.target.value)}))} />
                </div>
              </div>
              <div className={styles.formActions}>
                <button className={styles.saveBtn} onClick={addPartner} disabled={saving || !partnerForm.name}>
                  {saving ? 'Сохраняем...' : 'Добавить партнёра'}
                </button>
                <button className={styles.cancelBtn} onClick={() => setShowPartnerForm(false)}>Отмена</button>
              </div>
            </div>
          )}

          <div className={styles.list}>
            {partners.map(p => (
              <div key={p.id} className={styles.partnerRow}>
                <div className={styles.partnerInfo}>
                  <div className={styles.partnerName}>{p.name}</div>
                  <div className={styles.partnerMeta}>
                    {p.phone && <span>{p.phone}</span>}
                    {p.email && <span>{p.email}</span>}
                  </div>
                </div>
                <div className={styles.partnerActions}>
                  {p.portal_token && (
                    <>
                      <button
                        className={styles.iconBtn}
                        onClick={() => copyLink(p.portal_token!)}
                        title="Скопировать ссылку кабинета"
                      >
                        {copied === p.portal_token ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      <a
                        href={`/partner/${p.portal_token}`}
                        target="_blank"
                        className={styles.iconBtn}
                        title="Открыть кабинет партнёра"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </>
                  )}
                </div>
                {p.portal_token && (
                  <div className={styles.portalLink}>
                    {origin}/partner/{p.portal_token}
                  </div>
                )}
              </div>
            ))}
            {partners.length === 0 && <div className={styles.empty}>Партнёров пока нет</div>}
          </div>
        </div>
      )}

      {/* АКТИВНОСТИ */}
      {tab === 'activities' && (
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTitle}>Активности</span>
            <button className={styles.addBtn} onClick={() => setShowActivityForm(v => !v)}>
              <Plus size={14} /> Добавить активность
            </button>
          </div>

          {showActivityForm && (
            <div className={styles.formCard}>
              <div className={styles.formGrid}>
                <div className={styles.field} style={{gridColumn:'1/-1'}}>
                  <label className={styles.label}>Название *</label>
                  <input className={styles.input} placeholder="Квадроциклы в горах Геленджика" value={activityForm.title} onChange={e => setActivityForm(f => ({...f, title: e.target.value}))} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Категория *</label>
                  <select className={styles.select} value={activityForm.category} onChange={e => setActivityForm(f => ({...f, category: e.target.value}))}>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Цена от, ₽ *</label>
                  <input className={styles.input} type="number" min="0" value={activityForm.price_from} onChange={e => setActivityForm(f => ({...f, price_from: Number(e.target.value)}))} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Длительность, ч</label>
                  <input className={styles.input} type="number" min="0.5" step="0.5" value={activityForm.duration_hours} onChange={e => setActivityForm(f => ({...f, duration_hours: Number(e.target.value)}))} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Локация</label>
                  <input className={styles.input} placeholder="Геленджик" value={activityForm.location_name} onChange={e => setActivityForm(f => ({...f, location_name: e.target.value}))} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Партнёр</label>
                  <select className={styles.select} value={activityForm.partner_id} onChange={e => setActivityForm(f => ({...f, partner_id: e.target.value}))}>
                    <option value="">— без партнёра —</option>
                    {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className={styles.field} style={{gridColumn:'1/-1'}}>
                  <label className={styles.label}>Описание</label>
                  <textarea className={styles.textarea} rows={2} placeholder="Описание активности..." value={activityForm.description} onChange={e => setActivityForm(f => ({...f, description: e.target.value}))} />
                </div>
              </div>
              <div className={styles.formActions}>
                <button className={styles.saveBtn} onClick={addActivity} disabled={saving || !activityForm.title}>
                  {saving ? 'Сохраняем...' : 'Добавить активность'}
                </button>
                <button className={styles.cancelBtn} onClick={() => setShowActivityForm(false)}>Отмена</button>
              </div>
            </div>
          )}

          <div className={styles.actList}>
            {activities.map(a => {
              const partner = partners.find(p => p.id === a.partner_id)
              return (
                <div key={a.id} className={`${styles.actRow} ${!a.is_active ? styles.actInactive : ''}`}>
                  <div className={styles.actInfo}>
                    <div className={styles.actTitle}>{a.title}</div>
                    <div className={styles.actMeta}>
                      <span className={styles.actCat}>{CATEGORY_LABELS[a.category as Category] ?? a.category}</span>
                      {a.location_name && <span>{a.location_name}</span>}
                      {partner && <span>{partner.name}</span>}
                    </div>
                  </div>
                  <div className={styles.actPrice}>{a.price_from.toLocaleString('ru-RU')} ₽</div>
                  <button
                    className={`${styles.iconBtn} ${a.is_active ? styles.iconBtnGreen : styles.iconBtnMuted}`}
                    onClick={() => toggleActivity(a.id, a.is_active)}
                    title={a.is_active ? 'Деактивировать' : 'Активировать'}
                  >
                    <Power size={14} />
                  </button>
                </div>
              )
            })}
            {activities.length === 0 && <div className={styles.empty}>Активностей пока нет</div>}
          </div>
        </div>
      )}
    </div>
  )
}
