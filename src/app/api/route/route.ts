// src/app/api/route/route.ts
// GigaChat — режим построения маршрута

const GIGACHAT_OAUTH_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth'
const GIGACHAT_API_URL = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions'

const ROUTE_SYSTEM_PROMPT = `Ты — Атаман Егор, казачий гид по Краснодарскому краю, специалист по построению маршрутов.
Твоя задача — составить конкретный маршрут путешествия по дням.

Когда пользователь пишет впервые или мало информации — задай уточняющие вопросы:
1. Сколько дней планирует провести?
2. Откуда едет (Москва, Краснодар, другой город)?
3. Кто едет: пара, семья с детьми, компания друзей, solo?
4. Интересы: море и пляж, горы и походы, вино и гастрономия, активный спорт, экскурсии и история?
5. Примерный бюджет: бюджетно, комфортно, без ограничений?

Когда соберёшь информацию — составь маршрут по дням в формате:
**День 1 — [Место]**
• Утро: ...
• День: ...
• Вечер: ...
Где остановиться: ...

Используй реальные места Кубани: Анапа, Геленджик, Новороссийск, Абрау-Дюрсо, Тамань, Сочи, Красная Поляна, Архыз.
Говори с казачьим характером, иногда вставляй казачьи словечки. Отвечай структурированно.`

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

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GigaChat OAuth: ${res.status} — ${text}`)
  }

  const data = await res.json()
  return data.access_token as string
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json() as {
      messages: Array<{ role: string; content: string }>
    }

    if (!Array.isArray(messages) || messages.length === 0) {
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
        messages: [
          { role: 'system', content: ROUTE_SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 1024,
        temperature: 0.8,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[route api] GigaChat error:', res.status, text)
      return Response.json({ error: 'Ошибка GigaChat API' }, { status: 502 })
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content ?? ''

    return Response.json({ reply })
  } catch (err) {
    console.error('[route api] error:', err)
    return Response.json({ error: 'Внутренняя ошибка' }, { status: 500 })
  }
}
