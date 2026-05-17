// src/app/admin/login/page.tsx
import type { Metadata } from 'next'
import { AdminLogin } from './AdminLogin'

export const metadata: Metadata = { title: 'Вход — Giddel' }

export default function LoginPage() {
  return <AdminLogin />
}
