// src/app/admin-guide/page.tsx
import type { Metadata } from 'next'
import { Nav } from '@/components/nav/Nav'
import {
  LogIn, Users, MapPin, BarChart2, Settings,
  CheckCircle, XCircle, Plus, Eye, Lightbulb
} from 'lucide-react'
import styles from './AdminGuide.module.css'

export const metadata: Metadata = { title: 'Инструкция для администратора — Giddel' }

const sections = [
  {
    num: '01',
    icon: <LogIn size={20} />,
    title: 'Вход в панель',
    text: 'Административная панель доступна по адресу giddel.ru/admin. Вход только по логину и паролю — доступ не публичный.',
    steps: [
      'Перейдите на giddel.ru/admin/login',
      'Введите логин: admin@giddel.ru',
      'Введите пароль (выдаётся при подключении)',
      'Нажмите «Войти» — вы попадёте в главную панель',
      'Сессия действует 30 дней, потом нужно войти снова',
    ],
    tip: 'Не передавайте логин и пароль третьим лицам. При компрометации смените ADMIN_PASSWORD в настройках Netlify.',
  },
  {
    num: '02',
    icon: <Users size={20} />,
    title: 'Управление партнёрами',
    text: 'Партнёр — это компания или частное лицо, которое предоставляет активности. Каждый партнёр получает уникальную ссылку для своего портала.',
    steps: [
      'В панели выберите вкладку «Партнёры»',
      'Нажмите «Добавить партнёра»',
      'Заполните: название, контактное лицо, email, телефон, комиссию (%)',
      'Система автоматически генерирует уникальный токен (ссылку)',
      'Скопируйте ссылку вида giddel.ru/partner/ТОКЕН и отправьте партнёру',
      'Партнёр использует эту ссылку для входа — пароль не нужен',
    ],
    tip: 'Токен партнёра — это его единственный ключ доступа. Если он потерян, создайте партнёра заново или обновите токен в базе данных Supabase.',
  },
  {
    num: '03',
    icon: <MapPin size={20} />,
    title: 'Управление активностями',
    text: 'Активность — это конкретная услуга: квадроцикл, конный тур, яхта и т.д. Активность привязана к партнёру и отображается на сайте.',
    steps: [
      'Перейдите на вкладку «Активности»',
      'Нажмите «Добавить активность»',
      'Заполните: название, описание, цена за человека, мин./макс. гостей',
      'Укажите партнёра из списка (обязательно)',
      'Загрузите фото (URL изображения)',
      'Активируйте тумблером «Активно» — после этого активность появится на сайте',
    ],
    tip: 'Неактивные активности скрыты от туристов, но сохраняются в базе. Удобно использовать для сезонных услуг.',
  },
  {
    num: '04',
    icon: <BarChart2 size={20} />,
    title: 'Аналитика и бронирования',
    text: 'На главной странице панели отображается сводка по всем показателям платформы.',
    steps: [
      'Общая выручка — сумма всех оплаченных бронирований',
      'Комиссия Giddel — доход платформы (% от каждой брони)',
      'Активные партнёры и активности — текущий каталог',
      'Последние бронирования — с датой, гостями, статусом, суммой',
      'Статусы: Ожидает → Подтверждено → Оплачено / Отменено',
    ],
    tip: 'Для детальной аналитики по конкретному партнёру откройте его портал через ссылку с токеном.',
  },
  {
    num: '05',
    icon: <Settings size={20} />,
    title: 'Настройки и переменные',
    text: 'Все секретные ключи и настройки хранятся в Netlify. Менять их можно без правки кода.',
    steps: [
      'Зайдите на app.netlify.com → проект giddel → Site configuration → Environment variables',
      'ADMIN_LOGIN / ADMIN_PASSWORD — логин и пароль для панели',
      'TELEGRAM_BOT_TOKEN — токен вашего бота для уведомлений',
      'TELEGRAM_OPERATOR_CHAT_ID — ваш Telegram ID для получения уведомлений',
      'YOOKASSA_SHOP_ID / YOOKASSA_SECRET_KEY — для подключения приёма оплаты',
      'После изменения любого ключа нажмите «Trigger deploy» для применения',
    ],
    tip: 'NEXT_PUBLIC_ переменные видны в браузере — не используйте для секретов. Все чувствительные ключи (API, пароли) — без этого префикса.',
  },
  {
    num: '06',
    icon: <CheckCircle size={20} />,
    title: 'Статусы бронирований',
    text: 'Жизненный цикл брони проходит несколько этапов. Ручное изменение статуса — через Supabase Dashboard.',
    steps: [
      'pending — турист начал бронирование, оплата не прошла (30 мин. до автоотмены)',
      'confirmed — партнёр подтвердил бронь вручную через свой портал',
      'paid — оплата прошла успешно через YooKassa (автоматически)',
      'cancelled — отменено туристом, партнёром или по таймауту',
    ],
    tip: 'Принудительно изменить статус можно в Supabase Dashboard → Table Editor → bookings. Это может потребоваться при технических сбоях.',
  },
]

export default function AdminGuidePage() {
  return (
    <div className={styles.page}>
      <Nav />
      <div className={styles.wrap}>
        <header className={styles.header}>
          <div className={styles.badge}>Для внутреннего использования</div>
          <h1 className={styles.title}>Инструкция администратора</h1>
          <p className={styles.sub}>
            Полное руководство по управлению платформой Giddel: партнёры, активности, аналитика, настройки.
          </p>
          <div className={styles.loginCard}>
            <div className={styles.loginLabel}>Вход в панель</div>
            <a href="/admin/login" className={styles.loginLink}>
              giddel.ru/admin/login <LogIn size={14} />
            </a>
          </div>
        </header>

        {sections.map(s => (
          <div key={s.num} className={styles.section}>
            <div className={styles.sectionLeft}>
              <div className={styles.sectionNum}>{s.num}</div>
            </div>
            <div className={styles.sectionRight}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.iconWrap}>{s.icon}</span>
                {s.title}
              </h2>
              <p className={styles.sectionText}>{s.text}</p>

              <div className={styles.steps}>
                {s.steps.map((step, i) => (
                  <div key={i} className={styles.step}>
                    <span className={styles.stepNum}>{i + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <div className={styles.tip}>
                <Lightbulb size={14} />
                <span>{s.tip}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Быстрые действия */}
        <div className={styles.actions}>
          <h2 className={styles.actionsTitle}>Быстрые ссылки</h2>
          <div className={styles.actionsGrid}>
            <a href="/admin" className={styles.actionBtn}>
              <BarChart2 size={18} /> Панель управления
            </a>
            <a href="/admin/login" className={styles.actionBtn}>
              <LogIn size={18} /> Войти в панель
            </a>
            <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className={styles.actionBtn}>
              <Eye size={18} /> Supabase Dashboard
            </a>
            <a href="https://app.netlify.com/projects/giddel" target="_blank" rel="noreferrer" className={styles.actionBtn}>
              <Settings size={18} /> Настройки Netlify
            </a>
          </div>
        </div>

        {/* Контакты поддержки */}
        <div className={styles.support}>
          <XCircle size={20} color="#e8a85c" />
          <div>
            <div className={styles.supportTitle}>Что-то пошло не так?</div>
            <div className={styles.supportText}>
              По всем техническим вопросам: <strong>info@giddel.ru</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
