// src/components/activities/MapView.tsx
'use client'

import { useEffect, useState } from 'react'
import type { Activity } from '@/lib/types'
import styles from './MapView.module.css'

interface Props {
  activities: Activity[]
}

export function MapView({ activities }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Центр Краснодарского края
  const centerLat = 44.9
  const centerLng = 38.0
  const zoom = 8

  // Берём первую активность с координатами для центрирования
  const withCoords = activities.filter(a => a.lat != null && a.lng != null)
  const centerActivity = withCoords[0]
  const lat = centerActivity?.lat ?? centerLat
  const lng = centerActivity?.lng ?? centerLng

  const iframeUrl = `https://yandex.ru/map-widget/v1/?ll=${lng}%2C${lat}&z=${zoom}&l=map`

  if (!mounted) return <div className={styles.wrap}><div className={styles.fallback}>Загрузка карты...</div></div>

  return (
    <div className={styles.wrap}>
      <iframe
        className={styles.iframe}
        src={iframeUrl}
        allowFullScreen
        title="Карта активностей"
      />
    </div>
  )
}
