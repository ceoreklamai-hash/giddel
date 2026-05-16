export type Category = 'yacht' | 'wine' | 'horse' | 'quad' | 'surf' | 'fishing' | 'rope' | 'excursion'
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
}
