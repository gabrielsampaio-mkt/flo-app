'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function UpvoteButton({
  postId,
  initialUpvotes,
}: {
  postId: string
  initialUpvotes: number
}) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [voted, setVoted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleUpvote() {
    if (voted || loading) return
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('posts_forum')
      .update({ upvotes: upvotes + 1 })
      .eq('id', postId)

    if (!error) {
      setUpvotes(v => v + 1)
      setVoted(true)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleUpvote}
      disabled={voted || loading}
      className={`flex items-center gap-1 text-sm transition-colors ${
        voted ? 'text-[#6aab6f]' : 'text-[#8fac8f] hover:text-[#e8f0e8]'
      }`}
    >
      ▲ {upvotes}
    </button>
  )
}

export function ComentarioForm({ postId }: { postId: string }) {
  const router = useRouter()
  const [conteudo, setConteudo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!conteudo.trim()) return

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: insertError } = await supabase.from('comentarios_forum').insert({
      post_id: postId,
      user_id: user.id,
      conteudo: conteudo.trim(),
    })

    if (insertError) {
      setError('Não foi possível comentar.')
      setLoading(false)
      return
    }

    setConteudo('')
    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <textarea
        value={conteudo}
        onChange={e => setConteudo(e.target.value)}
        placeholder="Escreva um comentário anônimo..."
        rows={3}
        className="w-full bg-[#1f351f] border border-[#2d4a2d] rounded-2xl px-4 py-3 text-[#e8f0e8] placeholder-[#4a7c4e] focus:outline-none focus:border-[#4a7c4e] transition-colors resize-none text-sm"
      />
      {error && <p className="text-[#c0392b] text-xs mt-1">{error}</p>}
      <button
        type="submit"
        disabled={loading || !conteudo.trim()}
        className="mt-2 py-2 px-4 rounded-xl bg-[#4a7c4e] text-[#e8f0e8] text-sm font-medium hover:bg-[#6aab6f] transition-colors disabled:opacity-50"
      >
        {loading ? 'Enviando...' : 'Comentar'}
      </button>
    </form>
  )
}
