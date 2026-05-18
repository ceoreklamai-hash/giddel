-- 011_bot.sql

-- Состояния диалога бота (FSM)
CREATE TABLE IF NOT EXISTS bot_sessions (
  chat_id TEXT PRIMARY KEY,
  state TEXT DEFAULT 'idle',
  data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Заявки от партнёров через бот
CREATE TABLE IF NOT EXISTS partner_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_chat_id TEXT NOT NULL,
  telegram_username TEXT,
  partner_name TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  activity_name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  price_from INTEGER,
  duration_hours NUMERIC(4,1),
  photo_urls TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE partner_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_sessions ENABLE ROW LEVEL SECURITY;

-- Только сервис-роль читает/пишет (RLS блокирует анонов)
CREATE POLICY "Service role only" ON partner_requests USING (false);
CREATE POLICY "Service role only" ON bot_sessions USING (false);
