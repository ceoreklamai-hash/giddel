'use client'
// src/app/admin/AdminLogout.tsx
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import styles from './Admin.module.css'

export function AdminLogout() {
  const router = useRouter()

  async function logout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <button className={styles.logoutBtn} onClick={logout} title="Выйти">
      <LogOut size={15} /> Выйти
    </button>
  )
}
