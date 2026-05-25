'use client'
// src/app/utesov/WineMapClient.tsx
import { useEffect, useRef } from 'react'

const WINERIES = [
  { name: 'Абрау-Дюрсо', lat: 44.864, lng: 37.703, desc: 'Легендарное шампанское с 1870 года' },
  { name: 'Мысхако', lat: 44.685, lng: 37.857, desc: 'Терруарные вина у горы Колдун' },
  { name: 'Шато де Талю', lat: 44.797, lng: 38.097, desc: 'Французский замок в Краснодарском крае' },
  { name: 'Лефкадия', lat: 44.788, lng: 38.917, desc: 'Агрокомплекс в предгорьях Кавказа' },
  { name: 'Фанагория', lat: 45.217, lng: 36.950, desc: 'Крупнейшая винодельня Тамани' },
  { name: 'Гай-Кодзор', lat: 44.552, lng: 38.112, desc: 'Современный терруар над морем' },
  { name: 'Бюрнье', lat: 44.851, lng: 37.682, desc: 'Камерное авторское хозяйство' },
  { name: 'Имение Сикоры', lat: 45.182, lng: 37.010, desc: 'Семейная винодельня на Тамани' },
]

export function WineMapClient() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<unknown>(null)

  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return

    import('leaflet').then(L => {
      if (!mapRef.current || mapInstance.current) return

      const map = L.map(mapRef.current, {
        center: [44.9, 37.8],
        zoom: 8,
        zoomControl: true,
        scrollWheelZoom: false,
      })

      mapInstance.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        maxZoom: 18,
      }).addTo(map)

      // Утёсов (отель)
      const hotelIcon = L.divIcon({
        html: `<div style="width:36px;height:36px;background:#562a1b;border:3px solid #c9a227;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 0 20px rgba(201,162,39,0.5)">🏨</div>`,
        className: '',
        iconAnchor: [18, 18],
      })
      L.marker([44.894, 37.323], { icon: hotelIcon })
        .addTo(map)
        .bindPopup('<b>Отель Утёсов</b><br>Ваша отправная точка', { className: 'wine-popup' })

      // Винодельни
      WINERIES.forEach((w, i) => {
        const icon = L.divIcon({
          html: `<div style="width:32px;height:32px;background:rgba(26,5,8,0.95);border:2px solid #c9a227;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 0 15px rgba(201,162,39,0.3);cursor:pointer;transition:transform 0.2s" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">🍷</div>`,
          className: '',
          iconAnchor: [16, 16],
        })
        L.marker([w.lat, w.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>${i + 1}. ${w.name}</b><br><span style="color:#c9a227">${w.desc}</span>`)
      })
    })

    return () => {
      if (mapInstance.current) {
        (mapInstance.current as { remove: () => void }).remove()
        mapInstance.current = null
      }
    }
  }, [])

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
  )
}
