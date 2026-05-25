'use client'
// src/app/utesov/WineMapWrapper.tsx
import dynamic from 'next/dynamic'

const WineMapClient = dynamic(
  () => import('./WineMapClient').then(m => m.WineMapClient),
  { ssr: false, loading: () => <div style={{ width: '100%', height: '100%', background: '#0d0205' }} /> }
)

export function WineMapWrapper() {
  return <WineMapClient />
}
