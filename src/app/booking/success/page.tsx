// src/app/booking/success/page.tsx
import { Suspense } from 'react'
import { Nav } from '@/components/nav/Nav'
import { BookingSuccess } from './BookingSuccess'

export default function BookingSuccessPage() {
  return (
    <>
      <Nav />
      <Suspense fallback={<div style={{padding:'80px',textAlign:'center',color:'rgba(255,255,255,0.3)'}}>Загружаем...</div>}>
        <BookingSuccess />
      </Suspense>
    </>
  )
}
