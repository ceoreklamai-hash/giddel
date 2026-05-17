// src/app/api/admin/chat/route.ts
// AI-ассистент администратора — понимает команды на русском,
// возвращает текст + JSON-действие для исполнения фронтом

const GIGACHAT_OAUTH_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth'
const GIGACHAT_API_URL = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions'

const ADMIN_PROMPT = `Ты — ИИ-ассистент администратора платформы Giddel (туристический гид Краснодарского края).

Помогаешь через естественный язык:
- добавлять активности и виноделни в базу
- просматривать статистику
- управлять бронированиями

Когда нужно выполнить действие, добавь JSON-блок в самом конце ответа:
\`\`\`action
{ JSON }
\`\`\`

Форматы действий:

Добавить активность:
{"action":"add_activity","title":"...","category":"...","price_from":0,"duration_hours":2,"location_name":"...","description":"...","slug":"translit-slug"}

Добавить винодельню:
{"action":"add_winery","name":"...","region":"...","price_from":0,"tour_types":["Дегустация"],"story":"...","slug":"translit-slug"}

Изменить статус брони:
{"action":"update_booking","id":"uuid","status":"confirmed|cancelled"}

Доступные категории активностей: yacht, wine, horse, quad, surf, fishing, rope, excursion, buggy, jeep, paraglide, sailing, skydive, kayak, diving, farm, canyon, zipline, helicopter, spa

Доступные регионы вин: Новороссийск, Таманский полуостров, Геленджик, Новокубанск, Краснодар

Слаг — транслитерация названия строчными буквами через дефис.
Если slug очевидно не задан, придумай сам.

Отвечай коротко, по-русски, профессионально. Если действие не нужно — просто отвечай текстом без JSON-блока.`

async function getToken(): Promise<string> {
  const authKey = process.env.GIGACHAT_AUTH_KEY
  if (!authKey) throw new Error('GIGACHAT_AUTH_KEY не задан')
  const res = await fetch(GIGACHAT_OAUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Basic ${authKey}`,
      'RqUID': crypto.randomUUID(),
    },
    body: 'scope=GIGACHAT_API_PERS',
  })
  if (!res.ok) throw new Error(`OAuth: ${res.status}`)
  const data = await res.json()
  return data.access_token as string
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json() as {
      messages: Array<{ role: string; content: string }>
    }
    if (!Array.isArray(messages) || !messages.length) {
      return Response.json({ error: 'messages обязателен' }, { status: 400 })
    }

    const token = await getToken()
    const res = await fetch(GIGACHAT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: 'GigaChat',
        messages: [{ role: 'system', content: ADMIN_PROMPT }, ...messages],
        max_tokens: 800,
        temperature: 0.4,
      }),
    })

    if (!res.ok) return Response.json({ error: 'GigaChat error' }, { status: 502 })
    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content ?? ''
    return Response.json({ reply })
  } catch (err) {
    console.error('[admin/chat]', err)
    return Response.json({ error: 'Ошибка' }, { status: 500 })
  }
}
