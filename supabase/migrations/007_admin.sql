-- 007_admin.sql
-- Таймер брони 30 минут + права на запись для ИИ-ассистента

-- Добавить expires_at и reminder_sent_at в bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

-- Триггер: при создании новой pending-брони ставит expires_at = now + 30 минут
CREATE OR REPLACE FUNCTION set_booking_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    NEW.expires_at = NOW() + INTERVAL '30 minutes';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS booking_expiry_trigger ON bookings;
CREATE TRIGGER booking_expiry_trigger
  BEFORE INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_booking_expiry();

-- Обновить существующие pending-брони
UPDATE bookings
  SET expires_at = created_at + INTERVAL '30 minutes'
  WHERE status = 'pending' AND expires_at IS NULL;

-- Права RLS: чтение, обновление и вставка для дашборда и ИИ
DROP POLICY IF EXISTS "Read bookings" ON bookings;
CREATE POLICY "Read bookings" ON bookings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Update bookings" ON bookings;
CREATE POLICY "Update bookings" ON bookings FOR UPDATE USING (true) WITH CHECK (true);

-- Права для ИИ на добавление активностей
DROP POLICY IF EXISTS "Insert activities" ON activities;
CREATE POLICY "Insert activities" ON activities FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Update activities" ON activities;
CREATE POLICY "Update activities" ON activities FOR UPDATE USING (true) WITH CHECK (true);

-- Добавить spa в допустимые категории
ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_category_check;
ALTER TABLE activities ADD CONSTRAINT activities_category_check
  CHECK (category IN (
    'yacht', 'wine', 'horse', 'quad', 'surf', 'fishing', 'rope', 'excursion',
    'buggy', 'jeep', 'paraglide', 'sailing', 'skydive', 'kayak', 'diving',
    'farm', 'canyon', 'zipline', 'helicopter', 'spa'
  ));

-- Права для ИИ на добавление виноделен
DROP POLICY IF EXISTS "Insert wines" ON wines;
CREATE POLICY "Insert wines" ON wines FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Update wines" ON wines;
CREATE POLICY "Update wines" ON wines FOR UPDATE USING (true) WITH CHECK (true);
