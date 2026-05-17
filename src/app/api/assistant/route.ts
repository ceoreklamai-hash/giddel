// src/app/api/assistant/route.ts
// ИИ-консьерж для помощи в выборе и бронировании активностей
// Использует GigaChat (Сбер) с промптом знающего гида по Кубани

import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'

const SYSTEM_PROMPT = `Ты — Макс, дружелюбный консьерж сервиса Giddel (giddel.ru).
Помогаешь туристам выбрать активности в Краснодарском крае и забронировать их.

Ты знаешь всё об активностях на Кубани:
- Квадроциклы и джип-туры (Анапа, Геленджик, горы)
- Яхты и катера (Новороссийск, Геленджик, Анапа)
- Конные прогулки (степи, горы, побережье)
- Винные туры (Анапа, Темрюк, Новороссийск — Фанагория, Абрау-Дюрсо, Кубань-Вино)
- Рыбалка (Азовское море, Краснодарское водохранилище)
- Кайтсёрфинг и SUP (Анапа, Витязево)
- Экскурсии (горы, дольмены, Горячий Ключ)
- Параглайдинг (горы Геленджика)

Правила:
1. Задавай уточняющие вопросы: когда едут, сколько человек, бюджет, предпочтения
2. Рекомендуй 2-3 конкретных варианта с ценами (от 1500 до 15000₽)
3. После рекомендации предлагай перейти к бронированию: "Хотите забронировать? Перейдите в /activities"
4. Говори на русском, дружелюбно, без официоза
5. Если спрашивают о чём-то не связанном с отдыхом — мягко возвращай к теме
6. Отвечай кратко — 3-5 предложений максимум`

async function getGigaChatToken(): Promise<string> {
  const authKey = process.env.GIGACHAT_AUTH_KEY ?? ''
  const scope = 'GIGACHAT_API_PERS'

  const res = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authKey}`,
      'RqUID': crypto.randomUUID(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `scope=${scope}`,
  })

  const data = await res.json()
  if (!data.access_token) throw new Error(`GigaChat auth failed: ${JSON.stringify(data)}`)
  return data.access_token
}

// Загружаем список активностей для контекста
async function getActivitiesContext(): Promise<string> {
  const { data } = await supabase
    .from('activities')
    .select('title, category, price_from, location_name, description')
    .eq('is_active', true)
    .limit(20)

  if (!data || data.length === 0) return ''

  const list = data.map(a =>
    `- ${a.title} (${a.category}), от ${a.price_from}₽, ${a.location_name ?? 'Краснодарский край'}`
  ).join('\n')

  return `\n\nДоступные активности на сайте:\n${list}`
}

export async function POST(request: Request) {
  const { messages } = await request.json() as {
    messages: { role: string; content: string }[]
  }

  const activitiesCtx = await getActivitiesContext()
  const systemWithContext = SYSTEM_PROMPT + activitiesCtx

  try {
    const token = await getGigaChatToken()

    const res = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'GigaChat',
        messages: [
          { role: 'system', content: systemWithContext },
          ...messages.slice(-10), // последние 10 сообщений
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    })

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content ?? 'Извините, не смог ответить. Попробуйте ещё раз.'
    return Response.json({ reply })
  } catch {
    return Response.json({ reply: 'Связь прервана. Попробуйте чуть позже или напишите нам в WhatsApp.' })
  }
}
