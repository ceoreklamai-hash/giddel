// src/app/how-it-works/page.tsx
import type { Metadata } from 'next'
import { Nav } from '@/components/nav/Nav'
import { Search, CalendarCheck, CreditCard, CheckCircle, Phone, MessageCircle, Star, ShieldCheck, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import styles from './HowItWorks.module.css'

export const metadata: Metadata = {
  title: 'Как забронировать — Giddel',
  description: 'Бронирование активностей в Краснодарском крае за 3 шага. Без звонков, без ожидания.',
}

const STEPS = [
  {
    icon: Search,
    num: '01',
    title: 'Выберите активность',
    text: 'Просматривайте каталог — квадроциклы, яхты, конные прогулки, винные туры и многое другое. Фильтруйте по категории, цене и дате.',
    tip: 'Не знаете что выбрать? Спросите нашего ИИ-ассистента Виктора на странице вин — он поможет с маршрутом.',
  },
  {
    icon: CalendarCheck,
    num: '02',
    title: 'Укажите дату и гостей',
    text: 'Выберите удобный день и время из доступных слотов. Укажите количество гостей — цена пересчитается автоматически.',
    tip: 'Слоты обновляются в реальном времени: вы видите только реально свободное время у партнёра.',
  },
  {
    icon: CreditCard,
    num: '03',
    title: 'Оплатите онлайн',
    text: 'Безопасная оплата через ЮKassa — карты Visa, МИР, СБП. Деньги списываются только после подтверждения бронирования.',
    tip: 'Подтверждение приходит в течение 30 минут. Если партнёр не подтверждает — возвращаем деньги автоматически.',
  },
]

const FAQ = [
  {
    q: 'Что если партнёр не подтвердит бронь?',
    a: 'Если в течение 30 минут бронь не подтверждена, она автоматически отменяется и деньги возвращаются на карту в течение 1–3 рабочих дней.',
  },
  {
    q: 'Можно ли отменить бронирование?',
    a: 'Да, свяжитесь с нами по телефону или в WhatsApp. Условия возврата зависят от конкретного партнёра и указаны на странице активности.',
  },
  {
    q: 'Как мне узнать детали поездки?',
    a: 'После оплаты на email придёт подтверждение с адресом, контактами партнёра и всеми деталями. Также можно позвонить партнёру напрямую.',
  },
  {
    q: 'Что такое VIP-сервис?',
    a: 'Персональный менеджер подбирает программу под ваш запрос, бронирует несколько активностей в один маршрут и сопровождает на всём пути.',
  },
  {
    q: 'Можно ли заказать групповую поездку?',
    a: 'Конечно. При выборе активности укажите нужное количество гостей. Для больших групп (от 15 человек) рекомендуем обратиться через VIP-сервис.',
  },
]

export default function HowItWorksPage() {
  return (
    <>
      <Nav />
      <div className={styles.page}>

        {/* Герой */}
        <div className={styles.hero}>
          <div className={styles.heroTag}>Как это работает</div>
          <h1 className={styles.heroTitle}>Бронирование за 3 шага.<br />Без звонков и ожидания.</h1>
          <p className={styles.heroSub}>
            Giddel — агрегатор активностей Краснодарского края. Мы работаем с проверенными партнёрами
            и берём на себя всё: выбор, бронь, оплату и подтверждение.
          </p>
        </div>

        {/* Шаги */}
        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepNum}>{s.num}</div>
              <div className={styles.stepIcon}><s.icon size={28} strokeWidth={1.5} /></div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepText}>{s.text}</p>
                <div className={styles.stepTip}>{s.tip}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Гарантии */}
        <div className={styles.guarantees}>
          <h2 className={styles.sectionTitle}>Почему Giddel</h2>
          <div className={styles.guaranteeGrid}>
            <div className={styles.gCard}>
              <ShieldCheck size={22} strokeWidth={1.5} className={styles.gIcon} />
              <div className={styles.gTitle}>Проверенные партнёры</div>
              <div className={styles.gText}>Каждый партнёр проходит проверку перед добавлением в каталог. Мы следим за качеством и рейтингом.</div>
            </div>
            <div className={styles.gCard}>
              <Clock size={22} strokeWidth={1.5} className={styles.gIcon} />
              <div className={styles.gTitle}>Подтверждение за 30 мин</div>
              <div className={styles.gText}>Партнёр подтверждает в течение 30 минут или бронь отменяется с полным возвратом денег.</div>
            </div>
            <div className={styles.gCard}>
              <CreditCard size={22} strokeWidth={1.5} className={styles.gIcon} />
              <div className={styles.gTitle}>Безопасная оплата</div>
              <div className={styles.gText}>Оплата через ЮKassa — российский платёжный сервис. Карты МИР, Visa, СБП. SSL-шифрование.</div>
            </div>
            <div className={styles.gCard}>
              <Star size={22} strokeWidth={1.5} className={styles.gIcon} />
              <div className={styles.gTitle}>ИИ-ассистент</div>
              <div className={styles.gText}>Сомелье Виктор и консьерж помогут выбрать активности под ваш запрос и составить маршрут.</div>
            </div>
            <div className={styles.gCard}>
              <Users size={22} strokeWidth={1.5} className={styles.gIcon} />
              <div className={styles.gTitle}>Группы и корпоративы</div>
              <div className={styles.gText}>Организуем мероприятия для групп любого размера. VIP-сервис с персональным менеджером.</div>
            </div>
            <div className={styles.gCard}>
              <MessageCircle size={22} strokeWidth={1.5} className={styles.gIcon} />
              <div className={styles.gTitle}>Поддержка 7 дней</div>
              <div className={styles.gText}>Отвечаем в WhatsApp и по телефону ежедневно. Поможем с любым вопросом до и после поездки.</div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className={styles.faq}>
          <h2 className={styles.sectionTitle}>Частые вопросы</h2>
          <div className={styles.faqList}>
            {FAQ.map((f, i) => (
              <details key={i} className={styles.faqItem}>
                <summary className={styles.faqQ}>{f.q}</summary>
                <div className={styles.faqA}>{f.a}</div>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className={styles.cta}>
          <h2 className={styles.ctaTitle}>Готовы к приключению?</h2>
          <p className={styles.ctaSub}>Сотни активностей в Краснодарском крае ждут вас</p>
          <div className={styles.ctaBtns}>
            <Link href="/activities" className={styles.ctaBtnPrimary}>Смотреть активности</Link>
            <Link href="/vip" className={styles.ctaBtnSecondary}>VIP-сервис</Link>
          </div>
          <div className={styles.ctaContacts}>
            <a href="tel:+78001234567" className={styles.ctaContact}><Phone size={14} /> 8 800 000 00 00</a>
            <a href="https://wa.me/78001234567" className={styles.ctaContact}><MessageCircle size={14} /> WhatsApp</a>
          </div>
        </div>

      </div>
    </>
  )
}
