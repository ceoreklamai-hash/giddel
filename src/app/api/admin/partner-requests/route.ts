// src/app/api/admin/partner-requests/route.ts
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { cookies } from 'next/headers'

async function checkAuth() {
  const jar = await cookies()
  return jar.get('admin_session')?.value === process.env.ADMIN_SESSION_SECRET
}

export async function GET() {
  if (!await checkAuth()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('partner_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ requests: data })
}

export async function PATCH(request: Request) {
  if (!await checkAuth()) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    id: string
    status?: 'approved' | 'rejected'
    admin_notes?: string
    // При одобрении — создать партнёра + активность
    create_partner?: boolean
  }

  const { id, status, admin_notes, create_partner } = body

  // Обновляем статус заявки
  const { data: req, error: updateErr } = await supabaseAdmin
    .from('partner_requests')
    .update({ status, admin_notes })
    .eq('id', id)
    .select()
    .single()

  if (updateErr) return Response.json({ error: updateErr.message }, { status: 500 })

  // Если одобрена и нужно создать партнёра — создаём
  if (status === 'approved' && create_partner && req) {
    const portalToken = crypto.randomUUID()

    const { data: partner, error: pErr } = await supabaseAdmin
      .from('partners')
      .insert({
        name: req.partner_name,
        phone: req.phone,
        telegram_chat_id: req.telegram_chat_id,
        portal_token: portalToken,
      })
      .select()
      .single()

    if (pErr) return Response.json({ error: pErr.message }, { status: 500 })

    // Создаём активность
    const slug = req.activity_name
      .toLowerCase()
      .replace(/[^a-zа-яё0-9\s]/gi, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60)
      + '-' + Date.now()

    await supabaseAdmin.from('activities').insert({
      slug,
      title: req.activity_name,
      category: req.category ?? 'excursion',
      description: req.description,
      price_from: req.price_from ?? 0,
      duration_hours: req.duration_hours,
      images: req.photo_urls ?? [],
      partner_id: partner.id,
      is_active: false, // сначала не активна — админ включает когда готово
    })

    // Уведомляем партнёра в Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (botToken && req.telegram_chat_id) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: req.telegram_chat_id,
          text: [
            `✅ <b>Ваша заявка одобрена!</b>`,
            ``,
            `🎯 ${req.activity_name} добавлена на платформу Giddel.`,
            ``,
            `Для доступа к вашей панели и управления бронями:`,
            `👉 https://giddel.ru/partner/${portalToken}`,
            ``,
            `Сохраните эту ссылку — она ваша личная.`,
          ].join('\n'),
          parse_mode: 'HTML',
        }),
      }).catch(() => {})
    }

    return Response.json({ ok: true, partner_id: partner.id, portal_token: portalToken })
  }

  // Если отклонена — уведомляем
  if (status === 'rejected' && req?.telegram_chat_id) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (botToken) {
      const note = admin_notes ? `\n\nПричина: ${admin_notes}` : ''
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: req.telegram_chat_id,
          text: `❌ К сожалению, ваша заявка на партнёрство не была принята.${note}\n\nЕсли есть вопросы — напишите нам напрямую.`,
          parse_mode: 'HTML',
        }),
      }).catch(() => {})
    }
  }

  return Response.json({ ok: true })
}
