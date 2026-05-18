-- 012_busy_slots.sql
-- Занятые слоты партнёра по конкретным датам
CREATE TABLE IF NOT EXISTS partner_busy_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
  partner_id uuid REFERENCES partners(id) ON DELETE CASCADE,
  date date NOT NULL,
  time_slot text NOT NULL, -- '10:00'
  reason text DEFAULT 'manual', -- 'manual' | booking_id
  created_at timestamptz DEFAULT now(),
  UNIQUE(activity_id, date, time_slot)
);

ALTER TABLE partner_busy_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON partner_busy_slots USING (false);
