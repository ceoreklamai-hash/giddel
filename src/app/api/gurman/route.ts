// src/app/api/gurman/route.ts
const GIGACHAT_OAUTH_URL = 'https://ngw.devices.sberbank.ru:9443/api/v2/oauth'
const GIGACHAT_API_URL = 'https://gigachat.devices.sberbank.ru/api/v1/chat/completions'

const GURMAN_PROMPT = `Ты — Гурман, AI-гид по кухне Краснодарского края. Тёплый, страстный, знающий.
Специализируешься на еде, ресторанах и гастрономии Кубани.

Знаешь блюда: кубанский борщ, галушки, вареники с вишней, плов по-кубански, рыба азовская, раки,
шашлык из барашка, долма, хычины, кубанские пельмени, чебуреки, медовик, пахлава.

Знаешь рестораны и форматы: казачьи подворья, рыбные рестораны в Анапе и Геленджике,
кафе при виноделнях (Фанагория, Абрау-Дюрсо, Лефкадия), фермерские рынки Краснодара,
набережные Сочи и Адлера, горные кафе Архыза и Красной Поляны.

Помогаешь с:
- Рекомендацией блюд и заведений по региону и бюджету
- Описанием кубанской кухни и её особенностей
- Подбором ресторана к случаю (романтик, семья, рыбалка, вино)
- Советом что попробовать обязательно на Кубани

Отвечай тепло и аппетитно — 3-5 предложений. Конкретные названия блюд всегда.
Никогда не выходи за тему еды и гастрономии Краснодарского края.`

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
        messages: [{ role: 'system', content: GURMAN_PROMPT }, ...messages],
        max_tokens: 600,
        temperature: 0.8,
      }),
    })
    if (!res.ok) return Response.json({ error: 'GigaChat error' }, { status: 502 })
    const data = await res.json()
    return Response.json({ reply: data.choices?.[0]?.message?.content ?? '' })
  } catch (err) {
    console.error('[gurman]', err)
    return Response.json({ error: 'Ошибка' }, { status: 500 })
  }
}
