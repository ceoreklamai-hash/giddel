-- supabase/migrations/006_referrals.sql

-- Партнёры-рефералы (отели, санатории, базы отдыха)
CREATE TABLE IF NOT EXISTS referral_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,           -- уникальный код отеля: "hotel-raduga"
  name text NOT NULL,                  -- название: "Отель Радуга"
  type text DEFAULT 'hotel',           -- hotel, sanatorium, hostel, other
  contact_phone text,
  commission_pct integer DEFAULT 5,    -- % от суммы бронирования
  visits integer DEFAULT 0,            -- счётчик переходов
  created_at timestamptz DEFAULT now()
);

-- Добавляем ref_code в бронирования
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ref_code text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS ref_partner_id uuid REFERENCES referral_partners(id);

-- VIP заявки
CREATE TABLE IF NOT EXISTS vip_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id text UNIQUE NOT NULL,     -- публичный ID вида VIP-2024-0001
  dates_from date,
  dates_to date,
  guests_count integer DEFAULT 2,
  budget_tier text,                    -- budget, comfort, luxury, unlimited
  wishes text,                         -- свободный текст пожеланий
  needs jsonb DEFAULT '{}',            -- { transfer: true, yacht: true, chef: false, ... }
  contact_method text DEFAULT 'telegram', -- telegram, whatsapp, phone
  contact_value text,                  -- номер/ник
  status text DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'done', 'cancelled')),
  ref_code text,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE referral_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read referral_partners" ON referral_partners FOR SELECT USING (true);
CREATE POLICY "Insert vip_requests" ON vip_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Update referral visits" ON referral_partners FOR UPDATE USING (true);

-- Тестовые партнёры
INSERT INTO referral_partners (code, name, type, contact_phone, commission_pct) VALUES
('hotel-raduga', 'Отель Радуга', 'hotel', '+79001234567', 5),
('pansionat-sea', 'Пансионат Морской', 'hotel', '+79001234568', 5),
('sanatorium-kuban', 'Санаторий Кубань', 'sanatorium', '+79001234569', 4);
