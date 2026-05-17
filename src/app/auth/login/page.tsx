// src/app/auth/login/page.tsx
import type { Metadata } from 'next'
import { TouristLogin } from './TouristLogin'

export const metadata: Metadata = { title: 'Вход — Giddel' }

export default function LoginPage() {
  return <TouristLogin />
}
