'use client'
// src/app/utesov/WineMapClient.tsx
import { useEffect, useRef } from 'react'

const WINERIES = [
  { name: 'Абрау-Дюрсо', lat: 44.864, lng: 37.703, desc: 'Легендарное игристое с 1870 года' },
  { name: 'Мысхако', lat: 44.685, lng: 37.857, desc: 'Терруарные вина у горы Колдун' },
  { name: 'Шато де Талю', lat: 44.797, lng: 38.097, desc: 'Французский замок в Краснодарском крае' },
  { name: 'Лефкадия', lat: 44.788, lng: 38.917, desc: 'Агрокомплекс в предгорьях Кавказа' },
  { name: 'Фанагория', lat: 45.217, lng: 36.950, desc: 'Крупнейшая винодельня Тамани' },
  { name: 'Гай-Кодзор', lat: 44.552, lng: 38.112, desc: 'Современный терруар над морем' },
  { name: 'Бюрнье', lat: 44.851, lng: 37.682, desc: 'Камерное авторское хозяйство' },
  { name: 'Имение Сикоры', lat: 45.182, lng: 37.010, desc: 'Семейная винодельня на Тамани' },
]

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ymaps3: any
  }
}

function makeIcon(emoji: string, size: number, borderColor: string) {
  const el = document.createElement('div')
  el.style.cssText = [
    `width:${size}px`, `height:${size}px`,
    'background:#0d0205',
    `border:2px solid ${borderColor}`,
    'border-radius:50%',
    'display:flex', 'align-items:center', 'justify-content:center',
    `font-size:${Math.round(size * 0.5)}px`,
    'box-shadow:0 0 16px rgba(201,162,39,0.35)',
    'cursor:pointer',
    'transition:transform 0.2s',
  ].join(';')
  el.textContent = emoji
  el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.25)' })
  el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)' })
  return el
}

export function WineMapClient() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    if (!apiKey) return

    // Load Yandex Maps v3 script once
    const scriptId = 'ymaps3-script'
    let script = document.getElementById(scriptId) as HTMLScriptElement | null

    const init = async () => {
      await window.ymaps3.ready

      const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker, YMapControls, YMapZoomControl } = window.ymaps3

      const map = new YMap(containerRef.current!, {
        location: { center: [37.8, 44.9], zoom: 8 },
        theme: 'dark',
      })
      mapRef.current = map

      map.addChild(new YMapDefaultSchemeLayer({ theme: 'dark' }))
      map.addChild(new YMapDefaultFeaturesLayer())

      // Controls
      const controls = new YMapControls({ position: 'right' })
      controls.addChild(new YMapZoomControl())
      map.addChild(controls)

      // Hotel marker
      const hotelEl = makeIcon('🏨', 40, '#c9a227')
      const hotelMarker = new YMapMarker(
        { coordinates: [37.323, 44.894] },
        hotelEl
      )
      hotelEl.title = 'Отель Утёсов — ваша отправная точка'
      map.addChild(hotelMarker)

      // Winery markers
      WINERIES.forEach((w, i) => {
        const el = makeIcon('🍷', 34, '#c9a227')
        el.title = `${i + 1}. ${w.name} — ${w.desc}`
        const marker = new YMapMarker(
          { coordinates: [w.lng, w.lat] },
          el
        )
        map.addChild(marker)
      })
    }

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = `https://api-maps.yandex.ru/v3/?apikey=${apiKey}&lang=ru_RU`
      script.onload = init
      document.head.appendChild(script)
    } else if (window.ymaps3) {
      init()
    } else {
      script.addEventListener('load', init)
    }

    return () => {
      if (mapRef.current) {
        (mapRef.current as { destroy?: () => void }).destroy?.()
        mapRef.current = null
      }
    }
  }, [apiKey])

  if (!apiKey) {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: '#0d0205',
        border: '1px solid rgba(201,162,39,0.15)',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        color: 'rgba(245,230,200,0.4)',
        fontSize: '14px',
        textAlign: 'center',
        padding: '24px',
      }}>
        <span style={{ fontSize: '32px' }}>🗺️</span>
        <div>Карта виноделен Кубани</div>
        <div style={{ fontSize: '12px', maxWidth: '280px', lineHeight: 1.6 }}>
          Для отображения карты добавьте<br />
          <code style={{ color: '#c9a227', background: 'rgba(201,162,39,0.1)', padding: '2px 6px', borderRadius: '3px' }}>
            NEXT_PUBLIC_YANDEX_MAPS_KEY
          </code><br />
          в переменные окружения
        </div>
      </div>
    )
  }

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
