export type Category =
  | 'yacht' | 'wine' | 'horse' | 'quad' | 'surf' | 'fishing' | 'rope' | 'excursion'
  | 'buggy' | 'jeep' | 'paraglide' | 'sailing' | 'skydive' | 'kayak' | 'diving'
  | 'farm' | 'canyon' | 'zipline' | 'helicopter'
export type BookingStatus = 'pending' | 'paid' | 'confirmed' | 'cancelled'

export interface Partner {
  id: string
  name: string
  phone: string | null
  email: string | null
  rating: number | null
  created_at: string
}

export interface Activity {
  id: string
  slug: string
  title: string
  description: string | null
  category: Category
  price_from: number
  duration_hours: number | null
  location_name: string | null
  lat: number | null
  lng: number | null
  images: string[] | null
  partner_id: string | null
  commission_pct: number
  is_active: boolean
  created_at: string
}

export interface Wine {
  id: string
  slug: string
  name: string
  region: string
  description: string | null
  images: string[] | null
  tour_types: string[]
  price_from: number | null
  partner_id: string | null
  created_at: string
}

export interface Booking {
  id: string
  activity_id: string
  tourist_name: string
  tourist_phone: string
  tourist_email: string
  booking_date: string
  guests_count: number
  total_price: number
  commission_amount: number
  status: BookingStatus
  payment_id: string | null
  created_at: string
}

export interface QuizState {
  who: 'couple' | 'family' | 'group' | 'solo' | null
  interests: string[]
  days: number
}

export const CATEGORY_LABELS: Record<Category, string> = {
  yacht: 'Яхты',
  wine: 'Виноделие',
  horse: 'Конные прогулки',
  quad: 'Квадроциклы',
  surf: 'Сёрфинг',
  fishing: 'Рыбалка',
  rope: 'Канатный парк',
  excursion: 'Экскурсии',
  buggy: 'Багги',
  jeep: 'Джипинг',
  paraglide: 'Параплан',
  sailing: 'Парусные туры',
  skydive: 'Скайдайвинг',
  kayak: 'Каяки и рафтинг',
  diving: 'Дайвинг',
  farm: 'Фермы',
  canyon: 'Каньоны и походы',
  zipline: 'Зиплайн',
  helicopter: 'Вертолётные туры',
}

export const CATEGORY_IMAGES: Record<Category, string> = {
  yacht: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
  wine: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80',
  horse: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  quad: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=600&q=80',
  surf: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&q=80',
  fishing: 'https://images.unsplash.com/photo-1467139701929-18c0d27a7516?w=600&q=80',
  rope: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=600&q=80',
  excursion: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  buggy: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80',
  jeep: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=600&q=80',
  paraglide: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=600&q=80',
  sailing: 'https://images.unsplash.com/photo-1520116468816-95b69f847357?w=600&q=80',
  skydive: 'https://images.unsplash.com/photo-1601024445121-e294cd8f53a6?w=600&q=80',
  kayak: 'https://images.unsplash.com/photo-1571863533956-01c88e79957e?w=600&q=80',
  diving: 'https://images.unsplash.com/photo-1560008580-6d136f0a4e43?w=600&q=80',
  farm: 'https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=600&q=80',
  canyon: 'https://images.unsplash.com/photo-1446941303997-f4b3f97d7b60?w=600&q=80',
  zipline: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
  helicopter: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=600&q=80',
}
