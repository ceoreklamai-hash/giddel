// src/app/partner-guide/page.tsx
import type { Metadata } from 'next'
import { Nav } from '@/components/nav/Nav'
import { CalendarDays, Settings2, BarChart2, Plus, Check, X, Clock, Smartphone, Bell, CreditCard } from 'lucide-react'
import styles from './PartnerGuide.module.css'

export const metadata: Metadata = {
  title: 'Инструкция для партнёров — Giddel',
  description: 'Как работать с порталом Giddel: управление бронями, расписание, аналитика.',
}

export default function PartnerGuidePage() {
  return (
    <>
      <Nav />
      <div className={styles.page}>
        <div className={styles.wrap}>

          <div className={styles.header}>
            <div className={styles.tag}>Для партнёров</div>
            <h1 className={styles.title}>Как работать с Giddel</h1>
            <p className={styles.sub}>Полная инструкция по партнёрскому порталу — от настройки расписания до получения выплат</p>
          </div>

          {/* Блок 1: Вход */}
          <section className={styles.section}>
            <div className={styles.sectionNum}>01</div>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>Вход в портал</h2>
              <p className={styles.sectionText}>
                Ваш менеджер Giddel пришлёт персональную ссылку вида <span className={styles.code}>giddel.ru/partner/ваш-токен</span>.
                Ссылка уникальна — не передавайте её посторонним. Для быстрого доступа добавьте её на главный экран телефона.
              </p>
              <div className={styles.tip}>
                <Smartphone size={15} /> На iPhone: Поделиться → Добавить на экран «Домой». На Android: браузер → меню → Добавить на главный экран.
              </div>
            </div>
          </section>

          {/* Блок 2: Расписание */}
          <section className={styles.section}>
            <div className={styles.sectionNum}>02</div>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}><Settings2 size={20} /> Настройте расписание</h2>
              <p className={styles.sectionText}>
                Первым делом — вкладка <strong>«Расписание»</strong>. Укажите рабочие дни и часы для каждого дня недели.
                Именно эти временные слоты увидят туристы при бронировании.
              </p>
              <div className={styles.steps}>
                <div className={styles.step}><span>1</span> Нажмите вкладку «Расписание» в верхнем меню портала</div>
                <div className={styles.step}><span>2</span> Для каждого дня недели включите переключатель и укажите время начала и конца</div>
                <div className={styles.step}><span>3</span> Выходные дни оставьте выключенными</div>
                <div className={styles.step}><span>4</span> Нажмите «Сохранить расписание»</div>
              </div>
              <div className={styles.tip}>
                <Clock size={15} /> Расписание применяется ко всем вашим активностям. Туристы увидят только свободные слоты — уже занятые будут скрыты автоматически.
              </div>
            </div>
          </section>

          {/* Блок 3: Брони */}
          <section className={styles.section}>
            <div className={styles.sectionNum}>03</div>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}><CalendarDays size={20} /> Управление бронями</h2>
              <p className={styles.sectionText}>
                Вкладка <strong>«Календарь»</strong> — основной рабочий инструмент. Нажмите на любой день чтобы увидеть записи.
              </p>

              <div className={styles.actionGrid}>
                <div className={styles.actionCard}>
                  <div className={styles.actionIcon} style={{background:'rgba(106,176,76,0.1)',color:'#6ab04c'}}>
                    <Check size={18} />
                  </div>
                  <div>
                    <div className={styles.actionTitle}>Подтвердить бронь</div>
                    <div className={styles.actionText}>Нажмите зелёную кнопку ✓ на заявке. Турист получит уведомление. Если не подтвердить за 30 минут — бронь отменяется автоматически.</div>
                  </div>
                </div>

                <div className={styles.actionCard}>
                  <div className={styles.actionIcon} style={{background:'rgba(200,80,80,0.1)',color:'#e05555'}}>
                    <X size={18} />
                  </div>
                  <div>
                    <div className={styles.actionTitle}>Отменить бронь</div>
                    <div className={styles.actionText}>Нажмите красную кнопку ✗. Деньги вернутся туристу автоматически. Используйте только в случае невозможности оказать услугу.</div>
                  </div>
                </div>

                <div className={styles.actionCard}>
                  <div className={styles.actionIcon} style={{background:'rgba(111,168,163,0.1)',color:'var(--color-accent)'}}>
                    <Plus size={18} />
                  </div>
                  <div>
                    <div className={styles.actionTitle}>Добавить запись вручную</div>
                    <div className={styles.actionText}>Нажмите «Добавить запись» в правом верхнем углу. Используйте для клиентов, которые записались по телефону или лично.</div>
                  </div>
                </div>
              </div>

              <div className={styles.tip}>
                <Bell size={15} /> Включите Telegram-уведомления — и новые брони будут приходить мгновенно. Сообщите менеджеру Giddel ваш Telegram для подключения.
              </div>
            </div>
          </section>

          {/* Блок 4: Аналитика */}
          <section className={styles.section}>
            <div className={styles.sectionNum}>04</div>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}><BarChart2 size={20} /> Аналитика и доходы</h2>
              <p className={styles.sectionText}>
                Вкладка <strong>«Аналитика»</strong> показывает статистику по вашим активностям:
              </p>
              <ul className={styles.list}>
                <li><strong>Ваш доход</strong> — сумма после вычета комиссии Giddel</li>
                <li><strong>Оборот</strong> — общая сумма оплаченных броней</li>
                <li><strong>График по месяцам</strong> — динамика за последние 6 месяцев</li>
                <li><strong>Последние брони</strong> — история записей</li>
              </ul>
              <div className={styles.tip}>
                <CreditCard size={15} /> Выплаты производятся 2 раза в месяц (1-го и 15-го числа) на реквизиты, указанные в договоре с Giddel.
              </div>
            </div>
          </section>

          {/* Блок 5: Важно */}
          <section className={styles.section}>
            <div className={styles.sectionNum}>05</div>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>Важные правила</h2>
              <ul className={styles.list}>
                <li>Подтверждайте брони в течение <strong>30 минут</strong> — иначе отменяются автоматически</li>
                <li>Держите расписание актуальным — туристы видят только свободные слоты</li>
                <li>При отмене со стороны партнёра деньги возвращаются туристу полностью</li>
                <li>Качество сервиса влияет на рейтинг и позицию в каталоге</li>
                <li>Не договаривайтесь с туристами об оплате в обход Giddel</li>
              </ul>
            </div>
          </section>

          {/* Контакты поддержки */}
          <div className={styles.support}>
            <div className={styles.supportTitle}>Нужна помощь?</div>
            <p className={styles.supportText}>Менеджер Giddel на связи ежедневно с 9:00 до 21:00</p>
            <div className={styles.supportContacts}>
              <a href="tel:+78001234567" className={styles.supportBtn}>Позвонить</a>
              <a href="https://wa.me/78001234567" className={styles.supportBtn}>WhatsApp</a>
              <a href="mailto:partners@giddel.ru" className={styles.supportBtn}>partners@giddel.ru</a>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
