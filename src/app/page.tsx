// src/app/page.tsx
import { Nav } from '@/components/nav/Nav'
import { Hero } from '@/components/hero/Hero'
import { CategoryGrid } from '@/components/categories/CategoryGrid'
import { WineBlock } from '@/components/wine/WineBlock'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <CategoryGrid />
        <WineBlock />
      </main>
    </>
  )
}
