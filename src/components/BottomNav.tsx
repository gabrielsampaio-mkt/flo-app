'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Cultivos', icon: '🌱' },
  { href: '/comunidade', label: 'Comunidade', icon: '🌿' },
  { href: '/forum', label: 'Fórum', icon: '💬' },
  { href: '/perfil/configuracoes', label: 'Perfil', icon: '👤' },
]

export function BottomNav() {
  const pathname = usePathname()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.username) setUsername(data.username)
        })
    })
  }, [])

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a2e1a] border-t border-[#2d4a2d] z-50">
      <div className="max-w-lg mx-auto flex">
        {NAV_ITEMS.map(item => {
          const href =
            item.href === '/perfil/configuracoes' && username
              ? `/perfil/${username}`
              : item.href
          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + '/') ||
            (item.href === '/perfil/configuracoes' && pathname.startsWith('/perfil/'))

          return (
            <Link
              key={item.href}
              href={href}
              className={`flex-1 flex flex-col items-center py-3 text-xs transition-colors ${
                active ? 'text-[#6aab6f]' : 'text-[#8fac8f] hover:text-[#e8f0e8]'
              }`}
            >
              <span className="text-lg mb-0.5">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
