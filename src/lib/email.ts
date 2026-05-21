// src/lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Giddel <no-reply@giddel.ru>'

export async function sendBookingConfirmation(opts: {
  to: string
  touristName: string
  activityTitle: string
  bookingDate: string
  bookingTime: string | null
  guestsCount: number
  totalPrice: number
  bookingId: string
}) {
  if (!process.env.RESEND_API_KEY || !opts.to) return
  const dateStr = new Date(opts.bookingDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Бронь подтверждена — ${opts.activityTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#6fa8a3">Ваша бронь подтверждена ✓</h2>
        <p>Здравствуйте, ${opts.touristName}!</p>
        <p>Оплата прошла успешно. Детали вашей брони:</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          <tr><td style="padding:8px 0;color:#666">Активность</td><td style="padding:8px 0;font-weight:bold">${opts.activityTitle}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Дата</td><td style="padding:8px 0">${dateStr}${opts.bookingTime ? ` в ${opts.bookingTime}` : ''}</td></tr>
          <tr><td style="padding:8px 0;color:#666">Гостей</td><td style="padding:8px 0">${opts.guestsCount} чел.</td></tr>
          <tr><td style="padding:8px 0;color:#666">Сумма</td><td style="padding:8px 0;font-weight:bold;color:#6fa8a3">${opts.totalPrice.toLocaleString('ru-RU')} ₽</td></tr>
        </table>
        <p style="color:#666;font-size:14px">Организатор свяжется с вами для уточнения деталей. Если у вас есть вопросы — напишите нам на <a href="mailto:info@giddel.ru">info@giddel.ru</a></p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#999;font-size:12px">Giddel — активности Краснодарского края · <a href="https://giddel.ru">giddel.ru</a></p>
      </div>
    `,
  })
}

export async function sendReviewInvitation(opts: {
  to: string
  touristName: string
  activityTitle: string
  bookingId: string
}) {
  if (!process.env.RESEND_API_KEY || !opts.to) return
  const reviewUrl = `https://giddel.ru/booking/review?id=${opts.bookingId}`
  await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `Как вам понравилось? Оставьте отзыв о ${opts.activityTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
        <h2 style="color:#6fa8a3">Как прошло?</h2>
        <p>Здравствуйте, ${opts.touristName}!</p>
        <p>Надеемся, вам понравилось <strong>${opts.activityTitle}</strong>. Поделитесь впечатлениями — ваш отзыв поможет другим туристам сделать выбор.</p>
        <a href="${reviewUrl}" style="display:inline-block;margin:20px 0;padding:14px 28px;background:#6fa8a3;color:#fff;text-decoration:none;border-radius:10px;font-weight:bold">Оставить отзыв</a>
        <p style="color:#999;font-size:12px">Или перейдите по ссылке: <a href="${reviewUrl}">${reviewUrl}</a></p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
        <p style="color:#999;font-size:12px">Giddel — активности Краснодарского края · <a href="https://giddel.ru">giddel.ru</a></p>
      </div>
    `,
  })
}
