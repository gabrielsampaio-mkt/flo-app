'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getCategoria } from '@/lib/constants'

export default function NovoPostPage() {
  const router = useRouter()
  const params = useParams()
  const categoria = params.categoria as string
  const cat = getCategoria(categoria)

  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!cat) {
    return <p className="text-center py-20 text-[#8fac8f]">Categoria não encontrada.</p>
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim() || !conteudo.trim()) {
      setError('Preencha título e conteúdo.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data, error: insertError } = await supabase
      .from('posts_forum')
      .insert({
        user_id: user.id,
        categoria,
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
      })
      .select('id')
      .single()

    if (insertError || !data) {
      setError('Não foi possível publicar. Tente novamente.')
      setLoading(false)
      return
    }

    router.push(`/forum/${categoria}/${data.id}`)
  }

  return (
    <div className="min-h-screen bg-[#0d1a0d] px-4 py-8 max-w-lg mx-auto">
      <Link
        href={`/forum/${categoria}`}
        className="text-[#8fac8f] text-sm mb-6 inline-block hover:text-[#e8f0e8] transition-colors"
      >
        ← {cat.nome}
      </Link>

      <h1 className="font-display text-2xl font-bold text-[#e8f0e8] mb-2">Novo post</h1>
      <p className="text-[#8fac8f] text-sm mb-8">
        Seu post será anônimo — ninguém verá seu username.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-[#8fac8f] text-sm mb-2">Título</label>
          <input
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Resuma sua dúvida ou tema"
            className="w-full bg-[#1f351f] border border-[#2d4a2d] rounded-2xl px-4 py-3 text-[#e8f0e8] placeholder-[#4a7c4e] focus:outline-none focus:border-[#4a7c4e] transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-[#8fac8f] text-sm mb-2">Conteúdo</label>
          <textarea
            value={conteudo}
            onChange={e => setConteudo(e.target.value)}
            placeholder="Descreva com detalhes..."
            rows={8}
            className="w-full bg-[#1f351f] border border-[#2d4a2d] rounded-2xl px-4 py-3 text-[#e8f0e8] placeholder-[#4a7c4e] focus:outline-none focus:border-[#4a7c4e] transition-colors resize-none"
            required
          />
        </div>

        {error && <p className="text-[#c0392b] text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-[#4a7c4e] text-[#e8f0e8] font-medium hover:bg-[#6aab6f] transition-colors disabled:opacity-50"
        >
          {loading ? 'Publicando...' : 'Publicar anonimamente'}
        </button>
      </form>
    </div>
  )
}
