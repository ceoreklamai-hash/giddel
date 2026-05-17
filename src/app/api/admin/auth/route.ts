// src/app/api/admin/auth/route.ts
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { login, password } = await request.json()

  const validLogin = process.env.ADMIN_LOGIN ?? ''
  const validPassword = process.env.ADMIN_PASSWORD ?? ''

  // Принимаем и email, и телефон (сравниваем с ADMIN_LOGIN)
  const loginMatch = login?.trim().toLowerCase() === validLogin.toLowerCase()
  const passMatch = password === validPassword

  if (!loginMatch || !passMatch) {
    return Response.json({ error: 'Неверный логин или пароль' }, { status: 401 })
  }

  const token = process.env.ADMIN_SESSION_SECRET ?? 'fallback'
  const cookieStore = await cookies()
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 дней
    path: '/',
  })

  return Response.json({ ok: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  return Response.json({ ok: true })
}
