-- 010_bookings_read.sql
-- Разрешить чтение бронирований:
-- партнёрам — их брони, туристам — свои, сервису — все

-- Временная политика: анон-клиент может читать все брони
-- (для работы партнёрского портала, профиля туриста и админки)
-- После добавления SUPABASE_SERVICE_ROLE_KEY заменить на более строгие политики
CREATE POLICY "Anon read bookings" ON bookings
  FOR SELECT USING (true);

-- Разрешить обновление статуса бронирований (партнёром/вебхуком)
CREATE POLICY "Anon update bookings" ON bookings
  FOR UPDATE USING (true);
