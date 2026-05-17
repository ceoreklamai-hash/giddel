// src/app/contacts/page.tsx
import type { Metadata } from 'next'
import { Nav } from '@/components/nav/Nav'
import { Phone, Mail, MapPin, MessageCircle, Clock } from 'lucide-react'
import styles from './Contacts.module.css'

export const metadata: Metadata = {
  title: 'Контакты — Giddel',
  description: 'Свяжитесь с командой Giddel — агрегатора активностей Краснодарского края.',
}

export default function ContactsPage() {
  return (
    <>
      <Nav />
      <div className={styles.page}>
        <div className={styles.wrap}>
          <div className={styles.header}>
            <h1 className={styles.title}>Контакты</h1>
            <p className={styles.sub}>Отвечаем быстро — обычно в течение 15 минут</p>
          </div>

          <div className={styles.grid}>
            <div className={styles.contacts}>
              <a href="tel:+78001234567" className={styles.contactCard}>
                <div className={styles.contactIcon}><Phone size={20} strokeWidth={1.5} /></div>
                <div>
                  <div className={styles.contactLabel}>Телефон</div>
                  <div className={styles.contactVal}>8 800 000 00 00</div>
                  <div className={styles.contactNote}>Бесплатно по России</div>
                </div>
              </a>

              <a href="https://wa.me/78001234567" className={styles.contactCard}>
                <div className={styles.contactIcon}><MessageCircle size={20} strokeWidth={1.5} /></div>
                <div>
                  <div className={styles.contactLabel}>WhatsApp</div>
                  <div className={styles.contactVal}>+7 800 000 00 00</div>
                  <div className={styles.contactNote}>Написать сообщение</div>
                </div>
              </a>

              <a href="mailto:info@giddel.ru" className={styles.contactCard}>
                <div className={styles.contactIcon}><Mail size={20} strokeWidth={1.5} /></div>
                <div>
                  <div className={styles.contactLabel}>Email</div>
                  <div className={styles.contactVal}>info@giddel.ru</div>
                  <div className={styles.contactNote}>Для общих вопросов</div>
                </div>
              </a>

              <div className={styles.contactCard}>
                <div className={styles.contactIcon}><Clock size={20} strokeWidth={1.5} /></div>
                <div>
                  <div className={styles.contactLabel}>Режим работы</div>
                  <div className={styles.contactVal}>Ежедневно</div>
                  <div className={styles.contactNote}>09:00 — 21:00 МСК</div>
                </div>
              </div>

              <div className={styles.contactCard}>
                <div className={styles.contactIcon}><MapPin size={20} strokeWidth={1.5} /></div>
                <div>
                  <div className={styles.contactLabel}>Регион работы</div>
                  <div className={styles.contactVal}>Краснодарский край</div>
                  <div className={styles.contactNote}>Анапа, Геленджик, Новороссийск, Туапсе, Краснодар</div>
                </div>
              </div>
            </div>

            <div className={styles.side}>
              <div className={styles.forPartners}>
                <div className={styles.fpTitle}>Для партнёров</div>
                <p className={styles.fpText}>
                  Хотите разместить свои услуги на Giddel? Мы работаем с компаниями по всему Краснодарскому краю.
                  Комиссия от 10%, инструменты управления бронями, мгновенные уведомления.
                </p>
                <a href="mailto:partners@giddel.ru" className={styles.fpBtn}>
                  partners@giddel.ru
                </a>
              </div>

              <div className={styles.forMedia}>
                <div className={styles.fpTitle}>СМИ и реклама</div>
                <p className={styles.fpText}>
                  Партнёрство с отелями, туристическими агентствами и рекламными площадками.
                </p>
                <a href="mailto:info@giddel.ru" className={styles.fpBtn}>
                  info@giddel.ru
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
