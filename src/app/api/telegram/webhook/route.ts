// src/app/api/telegram/webhook/route.ts
// Telegram-бот: регистрация партнёров + уведомления о бронях
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ''
const API = `https://api.telegram.org/bot${TOKEN}`

// ─── Типы Telegram ────────────────────────────────────────────────────────────

interface TgUser { id: number; username?: string; first_name?: string }
interface TgChat { id: number }
interface TgMessage {
  message_id: number
  from?: TgUser
  chat: TgChat
  text?: string
  photo?: Array<{ file_id: string; file_size?: number }>
}
interface TgCallbackQuery {
  id: string
  from: TgUser
  message?: TgMessage
  data?: string
}
interface TgUpdate {
  message?: TgMessage
  callback_query?: TgCallbackQuery
}

// ─── Категории ────────────────────────────────────────────────────────────────

const CATEGORIES: Record<string, string> = {
  yacht:     '⛵ Яхта',
  sailing:   '🚤 Парусный спорт',
  horse:     '🐴 Конные прогулки',
  quad:      '🏍️ Квадроциклы',
  buggy:     '🚗 Багги',
  surf:      '🏄 Сёрфинг',
  kayak:     '🛶 Каяк',
  fishing:   '🎣 Рыбалка',
  diving:    '🤿 Дайвинг',
  wine:      '🍷 Винный тур',
  excursion: '🗺️ Экскурсия',
  rope:      '🧗 Верёвочный парк',
  canyon:    '🏔️ Каньон',
  paraglide: '🪂 Параплан',
  jeep:      '🚙 Джип-тур',
  farm:      '🌾 Фермерский тур',
  skydive:   '🪂 Прыжок с парашютом',
  zipline:   '🎿 Зиплайн',
  helicopter:'🚁 Вертолёт',
}

// ─── Хелперы ─────────────────────────────────────────────────────────────────

async function sendMessage(chatId: number, text: string, extra?: object) {
  await fetch(`${API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...extra }),
  })
}

async function answerCallback(callbackId: string, text?: string) {
  await fetch(`${API}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackId, text }),
  })
}

async function getFileUrl(fileId: string): Promise<string | null> {
  try {
    const res = await fetch(`${API}/getFile?file_id=${fileId}`)
    const data = await res.json()
    if (!data.ok) return null
    return `https://api.telegram.org/file/bot${TOKEN}/${data.result.file_path}`
  } catch { return null }
}

async function getSession(chatId: number) {
  const { data } = await supabaseAdmin
    .from('bot_sessions')
    .select('state, data')
    .eq('chat_id', String(chatId))
    .single()
  return { state: data?.state ?? 'idle', data: (data?.data ?? {}) as Record<string, unknown> }
}

async function saveSession(chatId: number, state: string, data: Record<string, unknown>) {
  await supabaseAdmin.from('bot_sessions').upsert({
    chat_id: String(chatId),
    state,
    data,
    updated_at: new Date().toISOString(),
  })
}

async function resetSession(chatId: number) {
  await saveSession(chatId, 'idle', {})
}

// ─── Меню и клавиатуры ────────────────────────────────────────────────────────

const START_KEYBOARD = {
  inline_keyboard: [[
    { text: '📝 Подать заявку на партнёрство', callback_data: 'start_reg' },
  ]],
}

const CATEGORY_KEYBOARD = {
  inline_keyboard: Object.entries(CATEGORIES).reduce<Array<Array<{ text: string; callback_data: string }>>>((rows, [key, label], i) => {
    if (i % 2 === 0) rows.push([])
    rows[rows.length - 1].push({ text: label, callback_data: `cat_${key}` })
    return rows
  }, []),
}

const PHOTOS_DONE_KEYBOARD = {
  inline_keyboard: [[{ text: '✅ Готово, продолжить', callback_data: 'photos_done' }]],
}

const CONFIRM_KEYBOARD = {
  inline_keyboard: [[
    { text: '✅ Отправить заявку', callback_data: 'confirm_yes' },
    { text: '❌ Отмена', callback_data: 'confirm_no' },
  ]],
}

// ─── Форматирование сводки ────────────────────────────────────────────────────

function formatSummary(d: Record<string, unknown>) {
  const cat = CATEGORIES[d.category as string] ?? d.category
  const photos = (d.photo_urls as string[] | undefined)?.length ?? 0
  return [
    '📋 <b>Ваша заявка:</b>',
    '',
    `👤 Имя: ${d.partner_name}`,
    `📞 Телефон: ${d.phone}`,
    `📍 Город: ${d.city}`,
    '',
    `🎯 Активность: ${d.activity_name}`,
    `📂 Категория: ${cat}`,
    `📝 Описание: ${d.description}`,
    `💰 Цена от: ${Number(d.price_from).toLocaleString('ru-RU')} ₽`,
    `⏱️ Длительность: ${d.duration_hours} ч`,
    `📸 Фото: ${photos} шт.`,
  ].join('\n')
}

// ─── Обработка сообщений ─────────────────────────────────────────────────────

async function handleMessage(msg: TgMessage) {
  const chatId = msg.chat.id
  const text = msg.text?.trim() ?? ''
  const username = msg.from?.username

  // ── /start ──────────────────────────────────────────────────────────────────
  if (text.startsWith('/start')) {
    const token = text.split(' ')[1]

    if (token) {
      // Привязка существующего партнёра
      const { data: partner } = await supabaseAdmin
        .from('partners')
        .select('id, name')
        .eq('portal_token', token)
        .single()

      if (!partner) {
        await sendMessage(chatId, '❌ Токен не найден. Попросите администратора прислать корректную ссылку.')
        return
      }

      await supabaseAdmin
        .from('partners')
        .update({ telegram_chat_id: String(chatId) })
        .eq('id', partner.id)

      await sendMessage(chatId, `✅ <b>Готово, ${partner.name}!</b>\n\nВы подключены. Теперь будете получать уведомления о новых бронях в этот чат.`)
      return
    }

    // Обычный старт — показываем меню
    await resetSession(chatId)
    await sendMessage(
      chatId,
      `👋 Привет! Я — бот платформы <b>Giddel</b> для партнёров.\n\n` +
      `Через меня можно:\n• Подать заявку на размещение вашей активности\n• Получать уведомления о бронях\n\n` +
      `Для уведомлений о бронях — попросите администратора прислать вам ссылку для подключения.`,
      { reply_markup: START_KEYBOARD }
    )
    return
  }

  // ── /connect <token> ─────────────────────────────────────────────────────────
  if (text.startsWith('/connect ')) {
    const token = text.split(' ')[1]
    const { data: partner } = await supabaseAdmin
      .from('partners')
      .select('id, name')
      .eq('portal_token', token)
      .single()

    if (!partner) {
      await sendMessage(chatId, '❌ Токен не найден.')
      return
    }

    await supabaseAdmin
      .from('partners')
      .update({ telegram_chat_id: String(chatId) })
      .eq('id', partner.id)

    await sendMessage(chatId, `✅ <b>${partner.name}</b>, подключение успешно!\n\nВы будете получать уведомления о бронях сюда.`)
    return
  }

  // ── FSM: обработка по состоянию ──────────────────────────────────────────────
  const { state, data } = await getSession(chatId)

  // Фото
  if (msg.photo && state === 'reg_photos') {
    const largest = msg.photo.reduce((a, b) => (b.file_size ?? 0) > (a.file_size ?? 0) ? b : a)
    const url = await getFileUrl(largest.file_id)
    const photos = (data.photo_urls as string[] | undefined) ?? []

    if (url) {
      photos.push(url)
      data.photo_urls = photos
      await saveSession(chatId, 'reg_photos', data)
      const count = photos.length
      if (count >= 5) {
        await sendMessage(chatId, `📸 Фото ${count} из 5 получено. Достигнут лимит.`)
        await showConfirm(chatId, data)
      } else {
        await sendMessage(
          chatId,
          `📸 Фото ${count}/5 получено. Пришлите ещё или нажмите «Готово».`,
          { reply_markup: PHOTOS_DONE_KEYBOARD }
        )
      }
    }
    return
  }

  switch (state) {
    case 'reg_name':
      if (text.length < 2) { await sendMessage(chatId, '⚠️ Введите имя (минимум 2 символа):'); return }
      data.partner_name = text
      data.telegram_username = username ?? null
      await saveSession(chatId, 'reg_phone', data)
      await sendMessage(chatId, '📞 Введите ваш номер телефона:')
      break

    case 'reg_phone':
      if (text.replace(/\D/g, '').length < 10) { await sendMessage(chatId, '⚠️ Введите корректный номер телефона:'); return }
      data.phone = text
      await saveSession(chatId, 'reg_city', data)
      await sendMessage(chatId, '📍 Из какого вы города или района? (например: Геленджик, Анапа, Краснодар)')
      break

    case 'reg_city':
      data.city = text
      await saveSession(chatId, 'reg_activity', data)
      await sendMessage(chatId, '🎯 Как называется ваша активность или услуга?')
      break

    case 'reg_activity':
      data.activity_name = text
      await saveSession(chatId, 'reg_category', data)
      await sendMessage(chatId, '📂 Выберите категорию:', { reply_markup: CATEGORY_KEYBOARD })
      break

    case 'reg_description':
      data.description = text
      await saveSession(chatId, 'reg_price', data)
      await sendMessage(chatId, '💰 Укажите цену от (только цифры, в рублях):')
      break

    case 'reg_price': {
      const price = parseInt(text.replace(/\D/g, ''))
      if (isNaN(price) || price <= 0) { await sendMessage(chatId, '⚠️ Введите корректную цену (только цифры):'); return }
      data.price_from = price
      await saveSession(chatId, 'reg_duration', data)
      await sendMessage(chatId, '⏱️ Сколько длится активность в часах? (например: 2, 0.5, 8)')
      break
    }

    case 'reg_duration': {
      const dur = parseFloat(text.replace(',', '.'))
      if (isNaN(dur) || dur <= 0) { await sendMessage(chatId, '⚠️ Введите корректное число часов:'); return }
      data.duration_hours = dur
      data.photo_urls = []
      await saveSession(chatId, 'reg_photos', data)
      await sendMessage(
        chatId,
        '📸 Пришлите фото (до 5 штук). Если фото нет — сразу нажмите «Готово».',
        { reply_markup: PHOTOS_DONE_KEYBOARD }
      )
      break
    }

    default:
      await sendMessage(
        chatId,
        'Нажмите /start чтобы начать.',
        { reply_markup: START_KEYBOARD }
      )
  }
}

async function showConfirm(chatId: number, data: Record<string, unknown>) {
  await saveSession(chatId, 'reg_confirm', data)
  await sendMessage(chatId, formatSummary(data) + '\n\nВсё верно?', { reply_markup: CONFIRM_KEYBOARD })
}

// ─── Обработка кнопок ─────────────────────────────────────────────────────────

async function handleCallback(cb: TgCallbackQuery) {
  const chatId = cb.message?.chat.id ?? cb.from.id
  const cbData = cb.data ?? ''

  await answerCallback(cb.id)

  // Начало регистрации
  if (cbData === 'start_reg') {
    await resetSession(chatId)
    await saveSession(chatId, 'reg_name', {})
    await sendMessage(chatId, '👤 Введите ваше имя (как к вам обращаться):')
    return
  }

  // Выбор категории
  if (cbData.startsWith('cat_')) {
    const { state, data } = await getSession(chatId)
    if (state !== 'reg_category') return
    data.category = cbData.replace('cat_', '')
    await saveSession(chatId, 'reg_description', data)
    await sendMessage(chatId, '📝 Опишите вашу активность (что включено, для кого, особенности):')
    return
  }

  // Фото готово
  if (cbData === 'photos_done') {
    const { state, data } = await getSession(chatId)
    if (state !== 'reg_photos') return
    await showConfirm(chatId, data)
    return
  }

  // Подтверждение
  if (cbData === 'confirm_yes') {
    const { state, data } = await getSession(chatId)
    if (state !== 'reg_confirm') return

    await supabaseAdmin.from('partner_requests').insert({
      telegram_chat_id: String(chatId),
      telegram_username: data.telegram_username ?? null,
      partner_name: data.partner_name,
      phone: data.phone,
      city: data.city,
      activity_name: data.activity_name,
      category: data.category,
      description: data.description,
      price_from: data.price_from,
      duration_hours: data.duration_hours,
      photo_urls: data.photo_urls ?? [],
      status: 'pending',
    })

    await resetSession(chatId)

    // Уведомляем оператора
    const operatorChatId = process.env.TELEGRAM_OPERATOR_CHAT_ID
    if (operatorChatId && TOKEN) {
      const notif = [
        '🔔 <b>Новая заявка партнёра</b>',
        '',
        `👤 ${data.partner_name} (@${data.telegram_username ?? '—'})`,
        `📞 ${data.phone}`,
        `📍 ${data.city}`,
        `🎯 ${data.activity_name} — ${CATEGORIES[data.category as string] ?? data.category}`,
        `💰 от ${Number(data.price_from).toLocaleString('ru-RU')} ₽`,
        '',
        '👉 Откройте админку: https://giddel.ru/admin',
      ].join('\n')
      await fetch(`${API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: operatorChatId, text: notif, parse_mode: 'HTML' }),
      })
    }

    await sendMessage(chatId, '✅ <b>Заявка принята!</b>\n\nМы рассмотрим её в течение 1–2 рабочих дней и свяжемся с вами.')
    return
  }

  if (cbData === 'confirm_no') {
    await resetSession(chatId)
    await sendMessage(chatId, 'Заявка отменена. Начните снова — /start', { reply_markup: START_KEYBOARD })
    return
  }
}

// ─── Webhook endpoint ─────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const update: TgUpdate = await request.json()

    if (update.callback_query) {
      await handleCallback(update.callback_query)
    } else if (update.message) {
      await handleMessage(update.message)
    }
  } catch (err) {
    console.error('[telegram/webhook]', err)
  }
  return Response.json({ ok: true })
}
