// src/app/utesov/page.tsx
import type { Metadata } from 'next'
import { RequestForm } from './RequestForm'
import { UtesovConcierge } from './UtesovConcierge'
import { WineMapWrapper } from './WineMapWrapper'
import styles from './Utesov.module.css'

export const metadata: Metadata = {
  title: 'Винный тур — Отель Утёсов, Анапа',
  description: 'Эксклюзивный винный тур по 8 лучшим винодельням Краснодарского края. Только для гостей отеля Утёсов. Индивидуальная программа.',
}

// Elegant SVG icons for each winery (gold, 36×36 viewBox)
const WineryIcons: Record<number, React.ReactNode> = {
  1: ( // Абрау-Дюрсо — бокал игристого
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5h12l-3 11a5 5 0 01-6 0L12 5z" stroke="#c9a227" strokeWidth="1.5" strokeLinejoin="round"/>
      <line x1="18" y1="16" x2="18" y2="28" stroke="#c9a227" strokeWidth="1.5"/>
      <line x1="13" y1="28" x2="23" y2="28" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="15" cy="9" r="1" fill="#c9a227" opacity=".5"/>
      <circle cx="18" cy="7" r="1" fill="#c9a227" opacity=".5"/>
      <circle cx="21" cy="10" r="0.8" fill="#c9a227" opacity=".4"/>
    </svg>
  ),
  2: ( // Мысхако — горный пик
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 28L18 8l12 20H6z" stroke="#c9a227" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M13 28l5-8 5 8" stroke="#c9a227" strokeWidth="1" strokeLinejoin="round" opacity=".5"/>
      <path d="M15 13l3-5 3 5" stroke="#c9a227" strokeWidth="1" strokeLinejoin="round" opacity=".4"/>
    </svg>
  ),
  3: ( // Шато де Талю — замок
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="15" width="18" height="14" stroke="#c9a227" strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="7" y="10" width="4" height="7" stroke="#c9a227" strokeWidth="1.2" strokeLinejoin="round"/>
      <rect x="25" y="10" width="4" height="7" stroke="#c9a227" strokeWidth="1.2" strokeLinejoin="round"/>
      <rect x="16" y="10" width="4" height="7" stroke="#c9a227" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M15 29v-6a3 3 0 016 0v6" stroke="#c9a227" strokeWidth="1.2"/>
      <line x1="7" y1="10" x2="29" y2="10" stroke="#c9a227" strokeWidth="1" opacity=".4"/>
    </svg>
  ),
  4: ( // Лефкадия — лист
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 30C18 30 8 22 8 14a10 10 0 0120 0c0 8-10 16-10 16z" stroke="#c9a227" strokeWidth="1.5" strokeLinejoin="round"/>
      <line x1="18" y1="14" x2="18" y2="30" stroke="#c9a227" strokeWidth="1" opacity=".5"/>
      <line x1="18" y1="18" x2="13" y2="22" stroke="#c9a227" strokeWidth="1" opacity=".35"/>
      <line x1="18" y1="18" x2="23" y2="22" stroke="#c9a227" strokeWidth="1" opacity=".35"/>
      <line x1="18" y1="14" x2="14" y2="17" stroke="#c9a227" strokeWidth="1" opacity=".35"/>
      <line x1="18" y1="14" x2="22" y2="17" stroke="#c9a227" strokeWidth="1" opacity=".35"/>
    </svg>
  ),
  5: ( // Фанагория — гроздь винограда
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="13" r="3" stroke="#c9a227" strokeWidth="1.3"/>
      <circle cx="13" cy="18" r="3" stroke="#c9a227" strokeWidth="1.3"/>
      <circle cx="23" cy="18" r="3" stroke="#c9a227" strokeWidth="1.3"/>
      <circle cx="15" cy="24" r="3" stroke="#c9a227" strokeWidth="1.3"/>
      <circle cx="21" cy="24" r="3" stroke="#c9a227" strokeWidth="1.3"/>
      <circle cx="18" cy="29" r="3" stroke="#c9a227" strokeWidth="1.3"/>
      <path d="M18 10V7l4-2" stroke="#c9a227" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  6: ( // Гай-Кодзор — волна
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 18c3-4 5-4 8 0s5 4 8 0 5-4 8 0" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 23c3-4 5-4 8 0s5 4 8 0 5-4 8 0" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
      <path d="M5 13c3-4 5-4 8 0s5 4 8 0 5-4 8 0" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" opacity=".25"/>
    </svg>
  ),
  7: ( // Бюрнье — бриллиант
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6l10 9-10 15-10-15 10-9z" stroke="#c9a227" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 15h20" stroke="#c9a227" strokeWidth="1" opacity=".5"/>
      <path d="M14 6l-6 9 10 15" stroke="#c9a227" strokeWidth="1" opacity=".35"/>
      <path d="M22 6l6 9-10 15" stroke="#c9a227" strokeWidth="1" opacity=".35"/>
      <path d="M14 6h8" stroke="#c9a227" strokeWidth="1" opacity=".35"/>
    </svg>
  ),
  8: ( // Имение Сикоры — колосок
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="18" y1="30" x2="18" y2="8" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M18 22c-4-2-5-6-3-9" stroke="#c9a227" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M18 22c4-2 5-6 3-9" stroke="#c9a227" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M18 16c-4-2-5-6-3-9" stroke="#c9a227" strokeWidth="1.3" strokeLinecap="round" opacity=".6"/>
      <path d="M18 16c4-2 5-6 3-9" stroke="#c9a227" strokeWidth="1.3" strokeLinecap="round" opacity=".6"/>
      <path d="M18 27c-3-1.5-4-4.5-2-7" stroke="#c9a227" strokeWidth="1.2" strokeLinecap="round" opacity=".5"/>
      <path d="M18 27c3-1.5 4-4.5 2-7" stroke="#c9a227" strokeWidth="1.2" strokeLinecap="round" opacity=".5"/>
    </svg>
  ),
}

const WINERIES = [
  { n: 1, name: 'Абрау-Дюрсо', region: 'Новороссийск', desc: 'Старейший дом игристых вин России. Подземные тоннели, озеро, легендарное «Русское шампанское» с 1870 года.', color: '#8b6914' },
  { n: 2, name: 'Мысхако', region: 'Новороссийск', desc: 'Терруарные вина у подножия горы Колдун. История с 1869 года, уникальный почвенный состав, вина с характером.', color: '#6b3a2a' },
  { n: 3, name: 'Шато де Талю', region: 'Геленджик', desc: 'Французский замок среди виноградников. Прогулки на электрокарах, дегустации в погребах, ресторан высокой кухни.', color: '#4a6741' },
  { n: 4, name: 'Лефкадия', region: 'Краснодарский край', desc: 'Агротуристический рай в предгорьях Кавказа. Органические вина, музей виноделия, бутик-отель «Амфора».', color: '#3d5a3e' },
  { n: 5, name: 'Фанагория', region: 'Тамань', desc: 'Крупнейшее хозяйство Краснодарского края. 50+ наименований вин, коньяки, уникальные вина позднего сбора.', color: '#5c2d6b' },
  { n: 6, name: 'Гай-Кодзор', region: 'Абрау', desc: 'Современный терруар с видом на море. Авторский подход, малые объёмы, высокое качество. Вина для коллекционеров.', color: '#1e4d6b' },
  { n: 7, name: 'Бюрнье', region: 'Абрау', desc: 'Камерное хозяйство семьи Бюрнье. Классический метод, минимальные объёмы, максимум характера в каждом бокале.', color: '#6b4c1e' },
  { n: 8, name: 'Имение Сикоры', region: 'Тамань', desc: 'Семейная динамическая винодельня на Таманском полуострове. Биодинамика, уважение к природе, живые вина.', color: '#5a6b1e' },
]

const PROGRAM = [
  { time: '09:00', title: 'Отправление из Утёсова', desc: 'Встреча у отеля, знакомство с гидом-сомелье. Комфортный трансфер на премиальном минивэне.' },
  { time: '10:30', title: 'Абрау-Дюрсо', desc: 'Экскурсия по историческим подвалам, дегустация игристых вин у озера.' },
  { time: '13:00', title: 'Обед в ресторане винодельни', desc: 'Авторская кухня, сочетания еды и вина, пейринг от шеф-сомелье.' },
  { time: '14:30', title: 'Шато де Талю', desc: 'Замок, виноградники, прогулка на электрокаре, дегустация выдержанных вин.' },
  { time: '16:30', title: 'Мысхако', desc: 'Террасные виноградники, исторический погреб, дегустация терруарных вин.' },
  { time: '18:30', title: 'Возвращение в Утёсов', desc: 'Закат над морем. В подарок — авторская бутылка от винодельни.' },
]

export default function UtesovPage() {
  return (
    <div className={styles.root}>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroVines} aria-hidden>
          {Array.from({length: 12}).map((_, i) => (
            <div key={i} className={styles.vine} style={{ left: `${i * 9}%`, animationDelay: `${i * 0.4}s` }} />
          ))}
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroEyebrow}>Отель Утёсов · Анапа</div>
          <h1 className={styles.heroTitle}>
            Винный тур<br />
            <span className={styles.heroTitleGold}>по Кубани</span>
          </h1>
          <p className={styles.heroSub}>
            8 лучших виноделен · Гид-сомелье · Индивидуальная программа<br />
            Эксклюзивно для гостей отеля
          </p>
          <div className={styles.heroActions}>
            <a href="#request" className={styles.heroBtnPrimary}>Составить программу</a>
            <a href="#wineries" className={styles.heroBtnSecondary}>Узнать маршрут</a>
          </div>
        </div>
        <div className={styles.heroScroll}>
          <div className={styles.heroScrollLine} />
        </div>
      </section>

      {/* INTRO */}
      <section className={styles.intro}>
        <div className={styles.introInner}>
          <div className={styles.introLeft}>
            <div className={styles.introLabel}>Почему с нами</div>
            <h2 className={styles.introTitle}>Вино — это не напиток.<br />Это история места.</h2>
          </div>
          <div className={styles.introRight}>
            <p className={styles.introText}>
              Краснодарский край — самый северный терруар великих вин. Здесь, где горы встречают море,
              виноградники создают вина с характером, который невозможно подделать.
            </p>
            <p className={styles.introText}>
              Мы составим маршрут лично под вас: выберем винодельни по вашему вкусу,
              организуем трансфер, забронируем столики и обеспечим гида, который знает
              каждого винодела лично.
            </p>
            <div className={styles.introStats}>
              <div className={styles.introStat}><span className={styles.introStatNum}>8</span><span className={styles.introStatLabel}>виноделен на карте</span></div>
              <div className={styles.introStat}><span className={styles.introStatNum}>1</span><span className={styles.introStatLabel}>день незабываемых впечатлений</span></div>
              <div className={styles.introStat}><span className={styles.introStatNum}>∞</span><span className={styles.introStatLabel}>вкусов, которые вы запомните</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* WINERIES */}
      <section className={styles.wineries} id="wineries">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>Маршрут</div>
            <h2 className={styles.sectionTitle}>8 виноделен Кубани</h2>
            <p className={styles.sectionSub}>Каждая — отдельная история. Вместе — путешествие через душу Краснодарского края.</p>
          </div>

          <div className={styles.wineriesGrid}>
            {WINERIES.map(w => (
              <div key={w.n} className={styles.wineryCard} style={{'--winery-color': w.color} as React.CSSProperties}>
                <div className={styles.wineryNum}>{String(w.n).padStart(2, '0')}</div>
                <div className={styles.wineryIcon}>{WineryIcons[w.n]}</div>
                <div className={styles.wineryName}>{w.name}</div>
                <div className={styles.wineryRegion}>{w.region}</div>
                <div className={styles.wineryDesc}>{w.desc}</div>
                <div className={styles.wineryGlow} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAP */}
      <section className={styles.mapSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>Интерактивная карта</div>
            <h2 className={styles.sectionTitle}>Весь маршрут на одной карте</h2>
          </div>
          <div className={styles.mapWrap}>
            <WineMapWrapper />
            <div className={styles.mapLegend}>
              <div className={styles.mapLegendItem}><span className={styles.mapLegendDot} style={{background:'#562a1b'}}>🏨</span> Отель Утёсов</div>
              <div className={styles.mapLegendItem}><span className={styles.mapLegendDot} style={{background:'#1a0508'}}>🍷</span> Виноделня</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAM */}
      <section className={styles.program}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>Один день</div>
            <h2 className={styles.sectionTitle}>Программа тура</h2>
            <p className={styles.sectionSub}>Примерный распорядок дня. Программа адаптируется под вас.</p>
          </div>

          <div className={styles.timeline}>
            {PROGRAM.map((p, i) => (
              <div key={i} className={styles.timelineItem}>
                <div className={styles.timelineTime}>{p.time}</div>
                <div className={styles.timelineDot} />
                <div className={styles.timelineBody}>
                  <div className={styles.timelineTitle}>{p.title}</div>
                  <div className={styles.timelineDesc}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INCLUDES */}
      <section className={styles.includes}>
        <div className={styles.sectionInner}>
          <div className={styles.includesGrid}>
            <div className={styles.includesBlock}>
              <div className={styles.includesTitle}>✓ Включено в тур</div>
              <ul className={styles.includesList}>
                <li>Комфортный трансфер на минивэне</li>
                <li>Гид-сомелье на весь день</li>
                <li>Дегустации на всех винодельнях</li>
                <li>Обед с пейрингом вин</li>
                <li>Авторская бутылка в подарок</li>
                <li>Страховка</li>
              </ul>
            </div>
            <div className={styles.includesBlock}>
              <div className={styles.includesTitleGray}>Опционально</div>
              <ul className={styles.includesListGray}>
                <li>Покупка вин на винодельнях</li>
                <li>Фотограф на маршруте</li>
                <li>Пикник на виноградниках</li>
                <li>Дополнительные винодельни</li>
              </ul>
            </div>
            <div className={styles.priceBlock}>
              <div className={styles.priceLabel}>Стоимость</div>
              <div className={styles.priceValue}>Индивидуально</div>
              <div className={styles.priceSub}>Зависит от группы, программы и сезона. Рассчитаем за 1 час.</div>
              <a href="#request" className={styles.priceBtn}>Узнать цену →</a>
            </div>
          </div>
        </div>
      </section>

      {/* REQUEST FORM */}
      <section className={styles.requestSection} id="request">
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionEyebrow}>Бронирование</div>
            <h2 className={styles.sectionTitle}>Составим тур под вас</h2>
            <p className={styles.sectionSub}>Оставьте заявку — наш консьерж свяжется в течение часа и предложит программу с учётом ваших предпочтений</p>
          </div>
          <RequestForm />
        </div>
      </section>

      {/* CONCIERGE */}
      <UtesovConcierge />

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>УТЁСОВ</div>
            <div className={styles.footerSub}>Анапа · ул. Маяковского, 2Б</div>
          </div>
          <div className={styles.footerLinks}>
            <a href="https://hotel-utesov.ru" target="_blank" rel="noopener" className={styles.footerLink}>Официальный сайт отеля</a>
            <a href="/" className={styles.footerLink}>Giddel — все активности края</a>
          </div>
          <div className={styles.footerCopy}>© 2026 Отель Утёсов · Сервис бронирования Giddel</div>
        </div>
      </footer>

    </div>
  )
}
