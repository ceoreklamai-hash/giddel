import type { NextConfig } from 'next'

// GigaChat (Sberbank) использует собственный CA — обходим проверку SSL на сервере
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
}

export default nextConfig
