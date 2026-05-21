-- 013_reviews.sql
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE,
  tourist_name text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Service role only write" ON reviews USING (false) WITH CHECK (false);

-- Добавляем средний рейтинг в activities (вычисляемый через view)
CREATE OR REPLACE VIEW activity_ratings AS
SELECT activity_id,
  ROUND(AVG(rating)::numeric, 1) as avg_rating,
  COUNT(*) as review_count
FROM reviews
GROUP BY activity_id;
