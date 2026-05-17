export type Category =
  | 'yacht' | 'wine' | 'horse' | 'quad' | 'surf' | 'fishing' | 'rope' | 'excursion'
  | 'buggy' | 'jeep' | 'paraglide' | 'sailing' | 'skydive' | 'kayak' | 'diving'
  | 'farm' | 'canyon' | 'zipline' | 'helicopter' | 'spa'
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
  surf: 'Кайтсерфинг',
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
  farm: 'Гастрономия',
  canyon: 'Хайкинг',
  zipline: 'Зиплайн',
  helicopter: 'Вертолётные туры',
  spa: 'СПА и бани',
}

export const CATEGORY_IMAGES: Record<Category, string> = {
  yacht: '/categories/yacht.jpeg',
  wine: '/categories/wine.jpg',
  horse: '/categories/horse.jpeg',
  quad: '/categories/quad.jpeg',
  surf: '/categories/surf.jpeg',
  fishing: '/categories/fishing.jpg',
  rope: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=600&q=80',
  excursion: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  buggy: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80',
  jeep: '/categories/jeep.jpg',
  paraglide: '/categories/paraglide.jpeg',
  sailing: 'https://images.unsplash.com/photo-1520116468816-95b69f847357?w=600&q=80',
  skydive: '/categories/skydive.jpg',
  kayak: '/categories/kayak.jpeg',
  diving: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
  farm: '/categories/gastro.jpeg',
  canyon: '/categories/canyon.webp',
  zipline: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
  helicopter: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=600&q=80',
  spa: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80',
}
