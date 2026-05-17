// src/app/profile/page.tsx
import type { Metadata } from 'next'
import { Nav } from '@/components/nav/Nav'
import { ProfileClient } from './ProfileClient'

export const metadata: Metadata = { title: 'Мой профиль — Giddel' }

export default function ProfilePage() {
  return (
    <>
      <Nav />
      <ProfileClient />
    </>
  )
}
