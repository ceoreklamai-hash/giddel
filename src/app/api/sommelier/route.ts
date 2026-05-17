// src/app/api/sommelier/route.ts
const GIGACHAT_OAUTH_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth'
const GIGACHAT_API_URL = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions'

const SOMMELIER_PROMPT = `Ты — Виктор, AI-сомелье винодельни Кубани. Элегантный, знающий, с тонким юмором.
Специализируешься исключительно на винах Краснодарского края.

Знаешь досконально: Абрау-Дюрсо, Фанагорию, Мысхако, Лефкадию, Шато де Талю, Гай-Кодзор, Шато Андре, Кубань-Вино.
Знаешь сорта: Красностоп, Цимлянский чёрный, Саперави, Рислинг, Совиньон Блан, Шардоне, Мерло, Каберне.
Знаешь терруары: Тамань, Новороссийск, Геленджик, Анапа, Новокубанск.

Помогаешь с:
- Подбором вина к блюду или случаю
- Описанием вкусового профиля кубанских вин
- Рекомендацией виноделен для посещения
- Рассказом об истории и особенностях сортов

Отвечай красиво и коротко — 3-5 предложений. Используй профессиональную винную лексику.
Никогда не выходи за тему вин Кубани.`

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
        messages: [{ role: 'system', content: SOMMELIER_PROMPT }, ...messages],
        max_tokens: 600,
        temperature: 0.75,
      }),
    })
    if (!res.ok) return Response.json({ error: 'GigaChat error' }, { status: 502 })
    const data = await res.json()
    return Response.json({ reply: data.choices?.[0]?.message?.content ?? '' })
  } catch (err) {
    console.error('[sommelier]', err)
    return Response.json({ error: 'Ошибка' }, { status: 500 })
  }
}
