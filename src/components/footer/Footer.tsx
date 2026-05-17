// src/components/footer/Footer.tsx
import Link from 'next/link'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        <div className={styles.brand}>
          <div className={styles.logo}>GIDDEL</div>
          <p className={styles.tagline}>Активный и культурный отдых<br />в Краснодарском крае</p>
          <a href="mailto:info@giddel.ru" className={styles.email}>info@giddel.ru</a>
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>Туристам</div>
          <Link href="/activities" className={styles.link}>Все активности</Link>
          <Link href="/wines" className={styles.link}>Винная карта</Link>
          <Link href="/map" className={styles.link}>Карта</Link>
          <Link href="/route" className={styles.link}>Маршруты</Link>
          <Link href="/vip" className={styles.link}>VIP-сервис</Link>
          <Link href="/how-it-works" className={styles.link}>Как это работает</Link>
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>Партнёрам</div>
          <Link href="/partner-guide" className={styles.link}>Инструкция</Link>
          <a href="mailto:partners@giddel.ru" className={styles.link}>Стать партнёром</a>
          <Link href="/contacts" className={styles.link}>Контакты</Link>
        </div>

        <div className={styles.col}>
          <div className={styles.colTitle}>Компания</div>
          <Link href="/contacts" className={styles.link}>О нас</Link>
          <Link href="/privacy" className={styles.link}>Конфиденциальность</Link>
          <Link href="/terms" className={styles.link}>Соглашение</Link>
          <Link href="/admin-guide" className={styles.link}>Для администратора</Link>
        </div>

      </div>

      <div className={styles.bottom}>
        <div className={styles.copy}>© 2026 Giddel. Все права защищены.</div>
        <div className={styles.legal}>
          <Link href="/privacy" className={styles.legalLink}>Политика конфиденциальности</Link>
          <Link href="/terms" className={styles.legalLink}>Пользовательское соглашение</Link>
        </div>
      </div>
    </footer>
  )
}
