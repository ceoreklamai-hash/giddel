'use client'
// src/components/map/InteractiveMap.tsx
import { useEffect, useRef } from 'react'
import type { Activity } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/types'
import styles from './InteractiveMap.module.css'

interface WineMarker {
  id: string
  name: string
  region: string
  lat: number | null
  lng: number | null
  price_from: number | null
  slug: string
}

interface Props {
  activities: Activity[]
  wines?: WineMarker[]
}

// Цвета по категориям
const CATEGORY_COLORS: Record<string, string> = {
  yacht:     '#a87fe8',
  wine:      '#c9a227',
  horse:     '#e8a87f',
  quad:      '#e85c5c',
  surf:      '#5ce8d4',
  fishing:   '#5c9ee8',
  diving:    '#2196f3',
  canyon:    '#6ab04c',
  paraglide: '#e85ce8',
  jeep:      '#e8785c',
  kayak:     '#5ce8a8',
  buggy:     '#e8c05c',
  farm:      '#b8e85c',
  rope:      '#8c5ce8',
  excursion: '#e8e85c',
  sailing:   '#5c78e8',
  skydive:   '#ff6b6b',
  zipline:   '#56cf6a',
  helicopter:'#ff9f43',
}

function makeIcon(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0z" fill="${color}"/>
    <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
  </svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

export function InteractiveMap({ activities, wines = [] }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<import('leaflet').Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    // Динамический импорт чтобы не сломать SSR
    import('leaflet').then(L => {
      // Центр Краснодарского края
      const map = L.map(mapRef.current!, {
        center: [44.8, 37.8],
        zoom: 9,
        zoomControl: true,
      })

      mapInstance.current = map

      // Тёмные тайлы OpenStreetMap через CartoDB
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      // Маркеры активностей
      const validActivities = activities.filter(a => a.lat != null && a.lng != null)

      validActivities.forEach(activity => {
        const color = CATEGORY_COLORS[activity.category] ?? '#a87fe8'
        const iconUrl = makeIcon(color)

        const icon = L.icon({
          iconUrl,
          iconSize: [28, 36],
          iconAnchor: [14, 36],
          popupAnchor: [0, -36],
        })

        const marker = L.marker([Number(activity.lat), Number(activity.lng)], { icon })

        const categoryLabel = CATEGORY_LABELS[activity.category] ?? activity.category
        const price = activity.price_from.toLocaleString('ru-RU')
        const duration = activity.duration_hours ? `${activity.duration_hours} ч · ` : ''
        const location = activity.location_name ? `<div class="lf-location">📍 ${activity.location_name}</div>` : ''

        marker.bindPopup(`
          <div class="lf-popup">
            <div class="lf-cat" style="color:${color}">${categoryLabel}</div>
            <div class="lf-title">${activity.title}</div>
            ${location}
            <div class="lf-meta">${duration}от ${price} ₽/чел</div>
            <a href="/activities/${activity.slug}" class="lf-btn">Подробнее →</a>
          </div>
        `, { maxWidth: 240 })

        marker.addTo(map)
      })

      // Маркеры виноделен (золотые)
      const wineIcon = L.icon({
        iconUrl: makeIcon('#c9a227'),
        iconSize: [28, 36],
        iconAnchor: [14, 36],
        popupAnchor: [0, -36],
      })

      wines.filter(w => w.lat != null && w.lng != null).forEach(wine => {
        const lat = Number(wine.lat)
        const lng = Number(wine.lng)
        if (isNaN(lat) || isNaN(lng)) return
        const price = wine.price_from ? `от ${Number(wine.price_from).toLocaleString('ru-RU')} ₽` : ''
        L.marker([lat, lng], { icon: wineIcon })
          .bindPopup(`
            <div class="lf-popup">
              <div class="lf-cat" style="color:#c9a227">🍷 Винодельня</div>
              <div class="lf-title">${wine.name}</div>
              <div class="lf-location">📍 ${wine.region}</div>
              ${price ? `<div class="lf-meta">${price}</div>` : ''}
              <a href="/wines/${wine.slug}" class="lf-btn" style="background:#c9a227;color:#000">Подробнее →</a>
            </div>
          `, { maxWidth: 240 })
          .addTo(map)
      })

      // Fit bounds если есть маркеры
      const allCoords = [
        ...validActivities.map(a => [Number(a.lat), Number(a.lng)] as [number, number]),
        ...wines.filter(w => w.lat != null && w.lng != null).map(w => [Number(w.lat), Number(w.lng)] as [number, number]),
      ]
      if (allCoords.length > 0) {
        map.fitBounds(allCoords, { padding: [40, 40], maxZoom: 11 })
      }
    })

    return () => {
      mapInstance.current?.remove()
      mapInstance.current = null
    }
  }, [activities])

  return <div ref={mapRef} className={styles.map} />
}
