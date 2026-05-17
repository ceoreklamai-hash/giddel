// src/app/api/chat/route.ts
// GigaChat API proxy — server-side, ключи не утекают в браузер

const GIGACHAT_OAUTH_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth'
const GIGACHAT_API_URL = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions'

const SYSTEM_PROMPT = `Ты — Атаман Егор, казак-проводник Краснодарского края. Бывалый, с юмором, знаешь каждую тропу от Тамани до Сочи.
Говоришь по-русски, иногда вставляешь казачьи словечки (добре, гутаришь, станица, батько, чоботы).
Помогаешь туристам выбрать активности, маршруты, виноделни и отдых на Кубани.
Знаешь всё про Сочи, Анапу, Геленджик, Краснодар, Тамань, горные станицы и перевалы.
Отвечай кратко и с характером — не длиннее 4 предложений. Предлагай конкретные места.
Держись темы туризма и казачьей культуры Кубани — дальше не заходи.`

async function getGigaChatToken(): Promise<string> {
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
    // GigaChat использует self-signed cert на ngw.devices.sberbank.ru
    // @ts-expect-error — Next.js поддерживает rejectUnauthorized через undici
    dispatcher: undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GigaChat OAuth ошибка: ${res.status} — ${text}`)
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

    const token = await getGigaChatToken()

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
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        max_tokens: 512,
        temperature: 0.7,
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[gigachat] API error:', res.status, text)
      return Response.json({ error: 'Ошибка GigaChat API' }, { status: 502 })
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content ?? ''

    return Response.json({ reply })

  } catch (err) {
    console.error('[gigachat] route error:', err)
    return Response.json({ error: 'Внутренняя ошибка' }, { status: 500 })
  }
}
