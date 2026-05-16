-- supabase/migrations/001_init.sql

-- Партнёры (владельцы бизнесов)
CREATE TABLE partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  bank_details jsonb,
  rating numeric(2,1),
  created_at timestamptz DEFAULT now()
);

-- Активности
CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('yacht','wine','horse','quad','surf','fishing','rope','excursion')),
  price_from integer NOT NULL,
  duration_hours numeric(4,1),
  location_name text,
  lat numeric(9,6),
  lng numeric(9,6),
  images text[],
  partner_id uuid REFERENCES partners(id),
  commission_pct integer DEFAULT 10,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Виноделни
CREATE TABLE wines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  region text NOT NULL,
  description text,
  images text[],
  tour_types text[],
  price_from integer,
  partner_id uuid REFERENCES partners(id),
  created_at timestamptz DEFAULT now()
);

-- Бронирования
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES activities(id),
  tourist_name text NOT NULL,
  tourist_phone text NOT NULL,
  tourist_email text NOT NULL,
  booking_date date NOT NULL,
  guests_count integer NOT NULL DEFAULT 1,
  total_price integer NOT NULL,
  commission_amount integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending','paid','confirmed','cancelled')),
  payment_id text,
  created_at timestamptz DEFAULT now()
);

-- RLS: разрешить публичное чтение активностей и вин
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE wines ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read activities" ON activities FOR SELECT USING (is_active = true);
CREATE POLICY "Public read wines" ON wines FOR SELECT USING (true);
CREATE POLICY "Public read partners" ON partners FOR SELECT USING (true);
CREATE POLICY "Insert bookings" ON bookings FOR INSERT WITH CHECK (true);
