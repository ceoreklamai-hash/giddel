'use client'
// src/components/partner/PartnerClient.tsx
import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Check, X, Clock, Users, CalendarDays, Settings2, BarChart2, TrendingUp, Wallet } from 'lucide-react'
import styles from './PartnerClient.module.css'

interface Activity { id: string; title: string; price_from: number; duration_hours: number | null }
interface Booking {
  id: string; tourist_name: string; tourist_phone: string
  booking_date: string; booking_time: string | null
  guests_count: number; total_price: number; status: string
  notes: string | null; source: string | null
  activity: { title: string } | null
}
interface DaySchedule {
  day_of_week: number // 0=Пн … 6=Вс
  is_active: boolean
  time_from: string
  time_to: string
}
interface Analytics {
  stats: {
    totalRevenue: number
    totalCommission: number
    partnerEarnings: number
    paidBookings: number
    pendingBookings: number
    totalGuests: number
  } | null
  monthly: { month: string; revenue: number; bookings: number; guests: number }[]
  recent: (Booking & { activity: { title: string } | null })[]
}

interface Props {
  token: string
  partner: { id: string; name: string }
  activities: Activity[]
  initialBookings: Booking[]
}

const MONTHS_RU = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
const DAYS_RU = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс']
const DAYS_FULL = ['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье']
const ALL_SLOTS = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']
const STATUS_COLOR: Record<string, string> = { pending:'#e8a85c', confirmed:'#6ab04c', paid:'#6fa8a3', cancelled:'#555' }
const STATUS_LABEL: Record<string, string> = { pending:'Ожидает', confirmed:'Подтверждено', paid:'Оплачено', cancelled:'Отменено' }

function toDateStr(d: Date) { return d.toISOString().split('T')[0] }
function today() { return toDateStr(new Date()) }
function defaultSchedule(): DaySchedule[] {
  return Array.from({ length: 7 }, (_, i) => ({
    day_of_week: i, is_active: i < 5, time_from: '09:00', time_to: '18:00',
  }))
}

export function PartnerClient({ token, activities, initialBookings }: Props) {
  const [view, setView] = useState<'calendar' | 'schedule' | 'analytics'>('calendar')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState<string>(today())
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)

  // Расписание
  const [schedule, setSchedule] = useState<DaySchedule[]>(defaultSchedule())
  const [scheduleSaving, setScheduleSaving] = useState(false)
  const [scheduleSaved, setScheduleSaved] = useState(false)

  const [form, setForm] = useState({
    activity_id: activities[0]?.id ?? '',
    tourist_name: '', tourist_phone: '',
    booking_time: '', guests_count: 1, note: '', source: 'phone',
  })

  // Загружаем расписание при монтировании
  useEffect(() => {
    fetch(`/api/partner/availability?token=${token}`)
      .then(r => r.json())
      .then(d => { if (d.schedule) setSchedule(d.schedule) })
      .catch(() => {})
  }, [token])

  // Загружаем аналитику при переключении на вкладку
  useEffect(() => {
    if (view !== 'analytics' || analytics) return
    setAnalyticsLoading(true)
    fetch(`/api/partner/analytics?token=${token}`)
      .then(r => r.json())
      .then(d => { setAnalytics(d); setAnalyticsLoading(false) })
      .catch(() => setAnalyticsLoading(false))
  }, [view, token, analytics])

  // Сетка календаря
  const calDays = useMemo(() => {
    const first = new Date(year, month, 1)
    const startDow = (first.getDay() + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: (number | null)[] = Array(startDow).fill(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [year, month])

  const byDate = useMemo(() => {
    const m: Record<string, Booking[]> = {}
    bookings.forEach(b => { if (!m[b.booking_date]) m[b.booking_date] = []; m[b.booking_date].push(b) })
    return m
  }, [bookings])

  const dayBookings = useMemo(() => {
    return (byDate[selectedDate] ?? []).sort((a, b) => (a.booking_time ?? '').localeCompare(b.booking_time ?? ''))
  }, [byDate, selectedDate])

  // Слоты, доступные по расписанию для выбранного дня
  const availableSlots = useMemo(() => {
    const dow = (new Date(selectedDate + 'T12:00:00').getDay() + 6) % 7
    const day = schedule.find(s => s.day_of_week === dow)
    if (!day?.is_active) return []
    return ALL_SLOTS.filter(t => t >= day.time_from && t < day.time_to)
  }, [schedule, selectedDate])

  const takenSlots = dayBookings
    .filter(b => b.status !== 'cancelled')
    .map(b => b.booking_time)
    .filter(Boolean) as string[]

  const isWorkDay = availableSlots.length > 0

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  function selectDay(day: number) {
    const ds = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    setSelectedDate(ds)
    setShowAdd(false)
  }

  async function confirmBooking(id: string) {
    await fetch('/api/bookings/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'confirmed' }),
    })
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b))
  }

  async function cancelBooking(id: string) {
    await fetch('/api/bookings/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'cancelled' }),
    })
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
  }

  async function addBooking() {
    if (!form.tourist_name || !form.tourist_phone) return
    setSaving(true)
    const res = await fetch(`/api/partner/bookings?token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, booking_date: selectedDate, guests_count: Number(form.guests_count) }),
    })
    const data = await res.json()
    if (data.ok) {
      const r2 = await fetch(`/api/partner/bookings?token=${token}`)
      const d2 = await r2.json()
      setBookings(d2.bookings ?? [])
      setShowAdd(false)
      setForm(f => ({ ...f, tourist_name: '', tourist_phone: '', booking_time: '', note: '' }))
    }
    setSaving(false)
  }

  async function saveSchedule() {
    setScheduleSaving(true)
    await fetch(`/api/partner/availability?token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedule }),
    })
    setScheduleSaving(false)
    setScheduleSaved(true)
    setTimeout(() => setScheduleSaved(false), 2500)
  }

  function updateDay(dow: number, patch: Partial<DaySchedule>) {
    setSchedule(prev => prev.map(d => d.day_of_week === dow ? { ...d, ...patch } : d))
  }

  const selectedActivity = activities.find(a => a.id === form.activity_id)
  const todayStr = today()

  return (
    <div className={styles.root}>
      {/* Вкладки */}
      <div className={styles.viewTabs}>
        <button
          className={`${styles.viewTab} ${view === 'calendar' ? styles.viewTabActive : ''}`}
          onClick={() => setView('calendar')}
        >
          <CalendarDays size={15} /> Календарь
        </button>
        <button
          className={`${styles.viewTab} ${view === 'schedule' ? styles.viewTabActive : ''}`}
          onClick={() => setView('schedule')}
        >
          <Settings2 size={15} /> Расписание
        </button>
        <button
          className={`${styles.viewTab} ${view === 'analytics' ? styles.viewTabActive : ''}`}
          onClick={() => setView('analytics')}
        >
          <BarChart2 size={15} /> Аналитика
        </button>
      </div>

      {/* ── КАЛЕНДАРЬ ── */}
      {view === 'calendar' && (
        <div className={styles.layout}>
          {/* Левая колонка: месяц */}
          <div className={styles.calCol}>
            <div className={styles.calHeader}>
              <button className={styles.navBtn} onClick={prevMonth}><ChevronLeft size={18} /></button>
              <span className={styles.calTitle}>{MONTHS_RU[month]} {year}</span>
              <button className={styles.navBtn} onClick={nextMonth}><ChevronRight size={18} /></button>
            </div>

            <div className={styles.calGrid}>
              {DAYS_RU.map(d => <div key={d} className={styles.calDow}>{d}</div>)}
              {calDays.map((day, i) => {
                if (!day) return <div key={i} />
                const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                const count = byDate[ds]?.filter(b => b.status !== 'cancelled').length ?? 0
                const hasPending = byDate[ds]?.some(b => b.status === 'pending')
                const isPast = ds < todayStr
                const isSelected = ds === selectedDate
                const isToday = ds === todayStr
                // Рабочий ли день по расписанию
                const dow = (new Date(ds + 'T12:00:00').getDay() + 6) % 7
                const daySchedule = schedule.find(s => s.day_of_week === dow)
                const isOff = !daySchedule?.is_active
                return (
                  <button
                    key={i}
                    className={[
                      styles.calDay,
                      isSelected ? styles.calDaySelected : '',
                      isToday ? styles.calDayToday : '',
                      isPast ? styles.calDayPast : '',
                      count > 0 ? styles.calDayHasEvents : '',
                      isOff ? styles.calDayOff : '',
                    ].join(' ')}
                    onClick={() => selectDay(day)}
                  >
                    <span className={styles.calDayNum}>{day}</span>
                    {count > 0 && (
                      <span className={`${styles.calDot} ${hasPending ? styles.calDotPending : ''}`}>{count}</span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className={styles.legend}>
              <div className={styles.legendItem}><span className={styles.ldot} style={{background:'#6ab04c'}} />Подтверждено</div>
              <div className={styles.legendItem}><span className={styles.ldot} style={{background:'#e8a85c'}} />Ожидает</div>
              <div className={styles.legendItem}><span className={styles.ldot} style={{background:'rgba(255,255,255,0.06)', border:'1px dashed rgba(255,255,255,0.15)'}} />Выходной</div>
            </div>
          </div>

          {/* Правая колонка: день */}
          <div className={styles.dayCol}>
            <div className={styles.dayHeader}>
              <div className={styles.dayTitle}>
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' })}
                {!isWorkDay && <span className={styles.offLabel}>· выходной</span>}
              </div>
              <button className={styles.addDayBtn} onClick={() => setShowAdd(v => !v)}>
                <Plus size={15} /> Добавить запись
              </button>
            </div>

            {/* Форма добавления */}
            {showAdd && (
              <div className={styles.addForm}>
                {activities.length > 1 && (
                  <div className={styles.formRow}>
                    <label className={styles.flabel}>Активность</label>
                    <select className={styles.fselect} value={form.activity_id} onChange={e => setForm(f => ({...f, activity_id: e.target.value}))}>
                      {activities.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                    </select>
                  </div>
                )}

                <div className={styles.formRow}>
                  <label className={styles.flabel}>
                    Время
                    {availableSlots.length > 0
                      ? <span className={styles.slotHint}>— рабочие часы по расписанию</span>
                      : <span className={styles.slotHintWarn}>— сегодня выходной, все слоты доступны</span>
                    }
                  </label>
                  <div className={styles.timeGrid}>
                    {(availableSlots.length > 0 ? availableSlots : ALL_SLOTS).map(t => {
                      const taken = takenSlots.includes(t)
                      return (
                        <button
                          key={t} type="button"
                          className={[styles.tSlot, form.booking_time === t ? styles.tSlotActive : '', taken ? styles.tSlotTaken : ''].join(' ')}
                          onClick={() => !taken && setForm(f => ({...f, booking_time: t}))}
                          disabled={taken}
                        >{t}</button>
                      )
                    })}
                  </div>
                </div>

                <div className={styles.formRow2}>
                  <div>
                    <label className={styles.flabel}>Имя</label>
                    <input className={styles.finput} placeholder="Иван Петров" value={form.tourist_name} onChange={e => setForm(f => ({...f, tourist_name: e.target.value}))} />
                  </div>
                  <div>
                    <label className={styles.flabel}>Телефон</label>
                    <input className={styles.finput} placeholder="+7 900..." value={form.tourist_phone} onChange={e => setForm(f => ({...f, tourist_phone: e.target.value}))} />
                  </div>
                </div>

                <div className={styles.formRow2}>
                  <div>
                    <label className={styles.flabel}>Гостей</label>
                    <div className={styles.counter}>
                      <button type="button" className={styles.cBtn} onClick={() => setForm(f => ({...f, guests_count: Math.max(1, f.guests_count-1)}))} >−</button>
                      <span className={styles.cVal}>{form.guests_count}</span>
                      <button type="button" className={styles.cBtn} onClick={() => setForm(f => ({...f, guests_count: f.guests_count+1}))}>+</button>
                    </div>
                  </div>
                  <div>
                    <label className={styles.flabel}>Канал</label>
                    <div className={styles.sourceRow}>
                      {[{v:'phone',l:'Телефон'},{v:'whatsapp',l:'WhatsApp'},{v:'walk_in',l:'Лично'}].map(s => (
                        <button key={s.v} type="button"
                          className={`${styles.srcBtn} ${form.source === s.v ? styles.srcBtnActive : ''}`}
                          onClick={() => setForm(f => ({...f, source: s.v}))}
                        >{s.l}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedActivity && (
                  <div className={styles.priceRow}>
                    Итого: <strong>{(selectedActivity.price_from * form.guests_count).toLocaleString('ru-RU')} ₽</strong>
                  </div>
                )}

                <div className={styles.formRow}>
                  <label className={styles.flabel}>Примечание</label>
                  <input className={styles.finput} placeholder="Особые пожелания..." value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))} />
                </div>

                <button className={styles.submitBtn} onClick={addBooking} disabled={saving || !form.tourist_name || !form.tourist_phone}>
                  {saving ? 'Сохраняем...' : 'Добавить запись'}
                </button>
              </div>
            )}

            {/* Временная шкала */}
            <div className={styles.timeline}>
              {dayBookings.length === 0 && !showAdd && (
                <div className={styles.emptyDay}>
                  <div className={styles.emptyDayText}>{isWorkDay ? 'День свободен' : 'Выходной день'}</div>
                  <button className={styles.emptyDayBtn} onClick={() => setShowAdd(true)}>
                    <Plus size={14} /> Добавить запись
                  </button>
                </div>
              )}

              {dayBookings.map(b => (
                <div key={b.id} className={`${styles.event} ${b.status === 'cancelled' ? styles.eventCancelled : ''}`}>
                  <div className={styles.eventTime}>
                    {b.booking_time
                      ? <><Clock size={12} />{b.booking_time}</>
                      : <span className={styles.noTime}>Время не указано</span>
                    }
                  </div>
                  <div className={styles.eventBody}>
                    <div className={styles.eventTitle}>{b.activity?.title ?? activities[0]?.title ?? '—'}</div>
                    <div className={styles.eventMeta}>
                      <span>{b.tourist_name}</span>
                      <span>{b.tourist_phone}</span>
                      <span><Users size={11} /> {b.guests_count} чел</span>
                    </div>
                    {b.notes && <div className={styles.eventNote}>{b.notes}</div>}
                  </div>
                  <div className={styles.eventRight}>
                    <div className={styles.eventPrice}>{b.total_price.toLocaleString('ru-RU')} ₽</div>
                    <div className={styles.eventStatus} style={{color: STATUS_COLOR[b.status]}}>
                      {STATUS_LABEL[b.status]}
                    </div>
                    {b.status === 'pending' && (
                      <div className={styles.eventActions}>
                        <button className={styles.btnOk} onClick={() => confirmBooking(b.id)} title="Подтвердить"><Check size={14} /></button>
                        <button className={styles.btnNo} onClick={() => cancelBooking(b.id)} title="Отменить"><X size={14} /></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── АНАЛИТИКА ── */}
      {view === 'analytics' && (
        <div className={styles.analyticsWrap}>
          {analyticsLoading && <div className={styles.analyticsLoading}>Загружаем данные...</div>}

          {!analyticsLoading && analytics && (
            <>
              {/* Карточки-метрики */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <Wallet size={18} className={styles.statIcon} />
                  <div className={styles.statVal}>{(analytics.stats?.partnerEarnings ?? 0).toLocaleString('ru-RU')} ₽</div>
                  <div className={styles.statLabel}>Ваш доход</div>
                </div>
                <div className={styles.statCard}>
                  <TrendingUp size={18} className={styles.statIcon} />
                  <div className={styles.statVal}>{(analytics.stats?.totalRevenue ?? 0).toLocaleString('ru-RU')} ₽</div>
                  <div className={styles.statLabel}>Оборот</div>
                </div>
                <div className={styles.statCard}>
                  <BarChart2 size={18} className={styles.statIcon} />
                  <div className={styles.statVal}>{analytics.stats?.paidBookings ?? 0}</div>
                  <div className={styles.statLabel}>Оплаченных броней</div>
                </div>
                <div className={styles.statCard}>
                  <Users size={18} className={styles.statIcon} />
                  <div className={styles.statVal}>{analytics.stats?.totalGuests ?? 0}</div>
                  <div className={styles.statLabel}>Гостей</div>
                </div>
              </div>

              {/* По месяцам */}
              {analytics.monthly.length > 0 && (
                <div className={styles.monthlyBlock}>
                  <div className={styles.blockTitle}>По месяцам</div>
                  <div className={styles.monthlyList}>
                    {analytics.monthly.map(m => {
                      const [y, mo] = m.month.split('-')
                      const label = new Date(+y, +mo - 1, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
                      const maxRev = Math.max(...analytics.monthly.map(x => x.revenue), 1)
                      const pct = Math.round((m.revenue / maxRev) * 100)
                      return (
                        <div key={m.month} className={styles.monthRow}>
                          <div className={styles.monthLabel}>{label}</div>
                          <div className={styles.monthBar}>
                            <div className={styles.monthBarFill} style={{ width: `${pct}%` }} />
                          </div>
                          <div className={styles.monthRevenue}>{m.revenue.toLocaleString('ru-RU')} ₽</div>
                          <div className={styles.monthMeta}>{m.bookings} броней · {m.guests} гостей</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Последние брони */}
              {analytics.recent.length > 0 && (
                <div className={styles.recentBlock}>
                  <div className={styles.blockTitle}>Последние брони</div>
                  <div className={styles.recentList}>
                    {analytics.recent.map(b => (
                      <div key={b.id} className={styles.recentRow}>
                        <div className={styles.recentInfo}>
                          <div className={styles.recentName}>{b.tourist_name}</div>
                          <div className={styles.recentMeta}>{b.activity?.title} · {b.booking_date} · {b.guests_count} чел</div>
                        </div>
                        <div className={styles.recentPrice}>{b.total_price.toLocaleString('ru-RU')} ₽</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!analytics.stats && (
                <div className={styles.analyticsEmpty}>Броней пока нет — здесь появится ваша статистика</div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── РАСПИСАНИЕ ── */}
      {view === 'schedule' && (
        <div className={styles.scheduleWrap}>
          <div className={styles.scheduleHead}>
            <div className={styles.scheduleTitle}>Рабочие часы</div>
            <div className={styles.scheduleSubtitle}>Туристы увидят только те слоты, которые попадают в ваш рабочий день</div>
          </div>

          <div className={styles.scheduleList}>
            {schedule.map(day => (
              <div key={day.day_of_week} className={`${styles.scheduleRow} ${!day.is_active ? styles.scheduleRowOff : ''}`}>
                <div className={styles.scheduleDayName}>{DAYS_FULL[day.day_of_week]}</div>

                {/* Тогл вкл/выкл */}
                <button
                  className={`${styles.toggleBtn} ${day.is_active ? styles.toggleBtnOn : ''}`}
                  onClick={() => updateDay(day.day_of_week, { is_active: !day.is_active })}
                >
                  <span className={styles.toggleKnob} />
                </button>

                {day.is_active ? (
                  <div className={styles.scheduleTime}>
                    <select
                      className={styles.timeSelect}
                      value={day.time_from}
                      onChange={e => updateDay(day.day_of_week, { time_from: e.target.value })}
                    >
                      {ALL_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <span className={styles.timeDash}>—</span>
                    <select
                      className={styles.timeSelect}
                      value={day.time_to}
                      onChange={e => updateDay(day.day_of_week, { time_to: e.target.value })}
                    >
                      {ALL_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className={styles.offText}>Выходной</div>
                )}
              </div>
            ))}
          </div>

          <button className={styles.saveScheduleBtn} onClick={saveSchedule} disabled={scheduleSaving}>
            {scheduleSaving ? 'Сохраняем...' : scheduleSaved ? '✓ Сохранено' : 'Сохранить расписание'}
          </button>
        </div>
      )}
    </div>
  )
}
