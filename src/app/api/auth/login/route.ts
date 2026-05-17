// src/app/api/auth/login/route.ts
// Вход без отправки email — через Admin API генерируем OTP и сразу верифицируем
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { createClient } from '@supabase/supabase-js'

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  const { email } = await request.json() as { email: string }
  if (!email) return Response.json({ error: 'email required' }, { status: 400 })

  // 1. Создаём пользователя если нет
  await supabaseAdmin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    email_confirm: true,
  })

  // 2. Генерируем magic link — получаем OTP код
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: email.trim().toLowerCase(),
  })

  if (error || !data?.properties?.email_otp) {
    return Response.json({ error: error?.message ?? 'Не удалось создать сессию' }, { status: 500 })
  }

  // 3. Верифицируем OTP — получаем токены сессии
  const { data: session, error: verifyError } = await supabaseAnon.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: data.properties.email_otp,
    type: 'email',
  })

  if (verifyError || !session?.session) {
    return Response.json({ error: verifyError?.message ?? 'Ошибка верификации' }, { status: 500 })
  }

  return Response.json({
    ok: true,
    access_token: session.session.access_token,
    refresh_token: session.session.refresh_token,
  })
}
