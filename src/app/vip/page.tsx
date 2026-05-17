// src/app/vip/page.tsx
import type { Metadata } from 'next'
import { Car, Sailboat, Wine, ShieldCheck } from 'lucide-react'
import { Nav } from '@/components/nav/Nav'
import { VipForm } from '@/components/vip/VipForm'
import styles from './Vip.module.css'

export const metadata: Metadata = {
  title: 'ВИП-консьерж — Giddel',
  description: 'Персональный консьерж организует всё — от трансфера до яхты. Анонимно. Без лишних вопросов.',
}

export default function VipPage() {
  return (
    <>
      <Nav />
      <div className={styles.page}>
        <div className={styles.left}>
          <span className={styles.badge}>✦ Приватный сервис</span>
          <h1 className={styles.title}>
            Отдых без<br />компромиссов
          </h1>
          <p className={styles.desc}>
            Личный консьерж берёт на себя всё:
            трансфер, размещение, активности,
            частный повар, яхта — любой каприз Кубани.
          </p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.fi}><Car size={22} strokeWidth={1.5} /></span>
              <div>
                <div className={styles.ftitle}>Трансфер от двери до двери</div>
                <div className={styles.fdesc}>Бизнес-класс, вертолёт, катер</div>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.fi}><Sailboat size={22} strokeWidth={1.5} /></span>
              <div>
                <div className={styles.ftitle}>Яхты и катера</div>
                <div className={styles.fdesc}>Частный чартер, маршрут под вас</div>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.fi}><Wine size={22} strokeWidth={1.5} /></span>
              <div>
                <div className={styles.ftitle}>Закрытые дегустации</div>
                <div className={styles.fdesc}>Лучшие виноделни без туристов</div>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.fi}><ShieldCheck size={22} strokeWidth={1.5} /></span>
              <div>
                <div className={styles.ftitle}>Полная анонимность</div>
                <div className={styles.fdesc}>NDA с каждым подрядчиком</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <VipForm />
        </div>
      </div>
    </>
  )
}
