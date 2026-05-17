'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  cultivoId: string
  userId: string
  proximaFase: string
  proximaFaseLabel: string
}

export function AvancarFaseButton({ cultivoId, userId, proximaFase, proximaFaseLabel }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function avancar() {
    setLoading(true)
    const supabase = createClient()

    await supabase
      .from('cultivos')
      .update({ fase_atual: proximaFase, concluido: proximaFase === 'concluido' })
      .eq('id', cultivoId)

    await supabase.from('milestones').insert({
      cultivo_id: cultivoId,
      user_id: userId,
      tipo: proximaFase,
    })

    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={avancar}
      disabled={loading}
      className="flex-1 py-3 rounded-2xl border border-[#4a7c4e] text-[#6aab6f] text-sm font-medium hover:bg-[#1f351f] transition-colors disabled:opacity-50"
    >
      {loading ? '...' : `→ ${proximaFaseLabel}`}
    </button>
  )
}
