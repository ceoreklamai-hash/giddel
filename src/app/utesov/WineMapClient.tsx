'use client'
// src/app/utesov/WineMapClient.tsx — Yandex Maps 2.1
import { useEffect, useRef } from 'react'

const WINERIES = [
  { name: 'Абрау-Дюрсо',   lat: 44.864, lng: 37.703, desc: 'Легендарное игристое с 1870 года' },
  { name: 'Мысхако',        lat: 44.685, lng: 37.857, desc: 'Терруарные вина у горы Колдун' },
  { name: 'Шато де Талю',   lat: 44.797, lng: 38.097, desc: 'Французский замок среди виноградников' },
  { name: 'Лефкадия',       lat: 44.788, lng: 38.917, desc: 'Агрокомплекс в предгорьях Кавказа' },
  { name: 'Фанагория',      lat: 45.217, lng: 36.950, desc: 'Крупнейшая винодельня Тамани' },
  { name: 'Гай-Кодзор',     lat: 44.552, lng: 38.112, desc: 'Современный терруар над морем' },
  { name: 'Бюрнье',         lat: 44.851, lng: 37.682, desc: 'Камерное авторское хозяйство' },
  { name: 'Имение Сикоры',  lat: 45.182, lng: 37.010, desc: 'Семейная винодельня на Тамани' },
]

function loadYmaps(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById('ymaps2-script')) { resolve(); return }
    const s = document.createElement('script')
    s.id = 'ymaps2-script'
    s.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Ошибка загрузки Яндекс.Карт'))
    document.head.appendChild(s)
  })
}

function markerHtml(emoji: string, size: number) {
  return `<div style="width:${size}px;height:${size}px;background:#0d0205;border:2px solid #c9a227;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${Math.round(size*0.46)}px;box-shadow:0 0 14px rgba(201,162,39,0.4);cursor:pointer">${emoji}</div>`
}

export function WineMapClient() {
  const containerRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null)
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !apiKey) return
    let cancelled = false

    async function init() {
      try {
        await loadYmaps(apiKey!)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ymaps = (window as any).ymaps
        if (!ymaps) throw new Error('ymaps не найден')

        await new Promise<void>(resolve => ymaps.ready(resolve))
        if (cancelled || !containerRef.current || mapRef.current) return

        const map = new ymaps.Map(containerRef.current, {
          center: [44.9, 37.8],   // [lat, lng] в v2.1
          zoom: 8,
          controls: ['zoomControl'],
          type: 'yandex#map',
        })
        mapRef.current = map

        // Тёмная тема через стандартный слой
        map.options.set('preset', 'islands#darkCircleIcon')

        // Отель
        const hotel = new ymaps.Placemark(
          [44.894, 37.323],
          { balloonContent: '<b>Отель Утёсов</b><br>Ваша отправная точка' },
          {
            iconLayout: 'default#html',
            iconHtml: markerHtml('🏨', 40),
            iconOffset: [-20, -20],
          }
        )
        map.geoObjects.add(hotel)

        // Винодельни
        WINERIES.forEach((w, i) => {
          const pm = new ymaps.Placemark(
            [w.lat, w.lng],
            { balloonContent: `<b>${i + 1}. ${w.name}</b><br><span style="color:#c9a227">${w.desc}</span>` },
            {
              iconLayout: 'default#html',
              iconHtml: markerHtml('🍷', 34),
              iconOffset: [-17, -17],
            }
          )
          map.geoObjects.add(pm)
        })
      } catch (err) {
        console.error('[WineMap]', err)
      }
    }

    init()

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
      }
    }
  }, [apiKey])

  if (!apiKey) {
    return (
      <div style={{
        width: '100%', height: '100%', background: '#0d0205',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 12,
        color: 'rgba(245,230,200,0.4)', fontSize: 14,
      }}>
        <span style={{ fontSize: 32 }}>🗺️</span>
        <div>Добавьте <code style={{ color: '#c9a227' }}>NEXT_PUBLIC_YANDEX_MAPS_KEY</code></div>
      </div>
    )
  }

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
