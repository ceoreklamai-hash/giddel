// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import 'leaflet/dist/leaflet.css'

export const metadata: Metadata = {
  title: 'Giddel — Отдых в Краснодарском крае',
  description: 'Яхты, виноделни, конные прогулки, квадроциклы и другие активности Краснодарского края. Бронирование в 3 клика.',
  keywords: 'отдых краснодарский край, яхты геленджик, виноделни кубань, конные прогулки анапа',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
