'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function TogglePublicoButton({
  cultivoId,
  publico,
}: {
  cultivoId: string
  publico: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isPublico, setIsPublico] = useState(publico)

  async function handleToggle() {
    setLoading(true)
    const supabase = createClient()
    const novoValor = !isPublico

    const { error } = await supabase
      .from('cultivos')
      .update({ publico: novoValor })
      .eq('id', cultivoId)

    if (!error) {
      setIsPublico(novoValor)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`py-2 px-4 rounded-2xl text-sm font-medium transition-colors border disabled:opacity-50 ${
        isPublico
          ? 'bg-[#4a7c4e] border-[#4a7c4e] text-[#e8f0e8]'
          : 'bg-transparent border-[#2d4a2d] text-[#8fac8f] hover:border-[#4a7c4e]'
      }`}
    >
      {loading ? '...' : isPublico ? '🌐 Público' : '🔒 Privado'}
    </button>
  )
}
