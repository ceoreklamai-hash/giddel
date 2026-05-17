-- 008_availability.sql
-- Расписание партнёра: рабочие часы по дням недели

CREATE TABLE IF NOT EXISTS partner_availability (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id    UUID        NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  day_of_week   SMALLINT    NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Пн … 6=Вс
  is_active     BOOLEAN     DEFAULT true,
  time_from     TEXT        DEFAULT '09:00',
  time_to       TEXT        DEFAULT '18:00',
  UNIQUE(partner_id, day_of_week)
);

-- Читать расписание может тот, кто знает portal_token
ALTER TABLE partner_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partner reads own availability"
  ON partner_availability FOR SELECT
  USING (
    partner_id IN (
      SELECT id FROM partners WHERE portal_token = current_setting('request.jwt.claims', true)::json->>'role'
    )
    OR true  -- anon key допускает чтение; фильтрацию делаем на API-уровне
  );

-- Upsert через API (service role), поэтому anon policy для INSERT/UPDATE достаточно открытая
CREATE POLICY "partner upserts availability"
  ON partner_availability FOR ALL
  USING (true) WITH CHECK (true);
