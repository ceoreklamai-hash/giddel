-- Добавить тестового партнёра
INSERT INTO partners (name, phone, email) VALUES
  ('Яхт-клуб Геленджик', '+79001234567', 'yacht@gelendzhik.ru'),
  ('Усадьба Голубицкое', '+79007654321', 'info@golubitskoe.ru');

-- Добавить тестовые активности
INSERT INTO activities (slug, title, description, category, price_from, duration_hours, location_name, lat, lng, images, commission_pct)
VALUES
  ('yakhta-na-zakat-gelendzhik', 'Яхта на закате', 'Прогулка на яхте по Геленджикской бухте с бокалом вина', 'yacht', 5000, 3, 'Геленджик', 44.5617, 38.0698, ARRAY['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'], 12),
  ('konnye-progulki-abrau', 'Конные прогулки Абрау', 'Верховая прогулка по виноградникам долины Абрау', 'horse', 3500, 2, 'Абрау-Дюрсо', 44.6982, 37.5601, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], 10),
  ('kvadrotsikly-gory', 'Квадроциклы в горах', 'Маршрут по горным тропам Кавказского хребта', 'quad', 4000, 2.5, 'Горячий Ключ', 44.6339, 39.1345, ARRAY['https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800'], 10);

-- Добавить тестовые виноделни
INSERT INTO wines (slug, name, region, description, tour_types, price_from, images)
VALUES
  ('fanagoria', 'Фанагория', 'Тамань', 'Крупнейшая винодельня России. Дегустации, экскурсии по заводу, фирменный магазин.', ARRAY['дегустация','экскурсия'], 2000, ARRAY['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800']),
  ('abrau-durso', 'Абрау-Дюрсо', 'Новороссийск', 'Легендарное игристое вино с 1870 года. Подземные тоннели, дегустации, прогулки по озеру.', ARRAY['дегустация','экскурсия','пикник'], 2500, ARRAY['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800']),
  ('usadba-golubitskoe', 'Усадьба Голубицкое', 'Темрюк', 'Бутиковая винодельня на берегу Азовского моря. Авторские ужины среди лоз.', ARRAY['дегустация','ужин'], 4800, ARRAY['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800']),
  ('lefkadia', 'Лефкадия', 'Крымск', 'Греко-российский проект. Органическое виноделие, гастрономические туры, сырная ферма.', ARRAY['дегустация','экскурсия'], 3500, ARRAY['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800']);
