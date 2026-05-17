-- 009_payment_telegram.sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;
