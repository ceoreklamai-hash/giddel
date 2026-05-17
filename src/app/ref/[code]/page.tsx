// src/app/ref/[code]/page.tsx
// Реферальная страница — записывает код в cookie и редиректит на главную
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface PageProps {
  params: Promise<{ code: string }>
}

export default async function RefPage({ params }: PageProps) {
  const { code } = await params

  // Проверяем что код существует и считаем визит
  const { data } = await supabase
    .from('referral_partners')
    .select('id, visits')
    .eq('code', code)
    .single()

  if (data) {
    await supabase
      .from('referral_partners')
      .update({ visits: (data.visits ?? 0) + 1 })
      .eq('code', code)

    // Записываем cookie на 30 дней
    const cookieStore = await cookies()
    cookieStore.set('ref', code, {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'lax',
    })
  }

  redirect('/')
}
