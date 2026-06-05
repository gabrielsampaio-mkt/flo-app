import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Flô',
    short_name: 'Flô',
    description: 'Seu cultivo. Sua jornada. Nossa comunidade.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d1a0d',
    theme_color: '#2d5a27',
    orientation: 'portrait',
    categories: ['lifestyle', 'utilities'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
