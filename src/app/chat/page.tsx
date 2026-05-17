// src/app/chat/page.tsx
import type { Metadata } from 'next'
import { Nav } from '@/components/nav/Nav'
import { ChatUI } from '@/components/chat/ChatUI'

export const metadata: Metadata = {
  title: 'AI-гид — Giddel',
  description: 'Спроси у AI-гида что посмотреть, куда поехать и что попробовать в Краснодарском крае.',
}

export default function ChatPage() {
  return (
    <>
      <Nav />
      <ChatUI />
    </>
  )
}
