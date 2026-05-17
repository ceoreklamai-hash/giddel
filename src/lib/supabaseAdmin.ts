// src/lib/supabaseAdmin.ts
// Серверный клиент с service role — обходит RLS
// НИКОГДА не импортировать в client components ('use client')
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
