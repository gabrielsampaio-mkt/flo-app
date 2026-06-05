import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/AppShell'
import { getCategoria } from '@/lib/constants'
import { UpvoteButton, ComentarioForm } from './ForumPostClient'

export default async function ForumPostPage({
  params,
}: {
  params: Promise<{ categoria: string; postId: string }>
}) {
  const { categoria, postId } = await params
  const cat = getCategoria(categoria)
  if (!cat) notFound()

  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts_forum_publico')
    .select('*')
    .eq('id', postId)
    .eq('categoria', categoria)
    .single()

  if (!post) notFound()

  const { data: comentarios } = await supabase
    .from('comentarios_forum_publico')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()

  const raiz = comentarios?.filter(c => !c.parent_id) ?? []
  const respostas = comentarios?.filter(c => c.parent_id) ?? []

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0d1a0d] px-4 py-8 max-w-lg mx-auto pb-24">
        <Link
          href={`/forum/${categoria}`}
          className="text-[#8fac8f] text-sm mb-6 inline-block hover:text-[#e8f0e8] transition-colors"
        >
          ← {cat.nome}
        </Link>

        <article className="bg-[#1f351f] border border-[#2d4a2d] rounded-xl p-4 mb-6">
          <h1 className="font-display text-xl font-bold text-[#e8f0e8] mb-3">
            {post.titulo}
          </h1>
          <p className="text-[#e8f0e8] text-sm whitespace-pre-wrap leading-relaxed">
            {post.conteudo}
          </p>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#2d4a2d]">
            {user ? (
              <UpvoteButton postId={postId} initialUpvotes={post.upvotes ?? 0} />
            ) : (
              <span className="text-[#8fac8f] text-sm">▲ {post.upvotes ?? 0}</span>
            )}
            <span className="text-[#8fac8f] text-xs">
              {format(new Date(post.created_at), "d 'de' MMMM yyyy", { locale: ptBR })}
            </span>
            <span className="text-[#4a7c4e] text-xs">Anônimo</span>
          </div>
        </article>

        <section>
          <h2 className="text-[#8fac8f] text-xs font-medium uppercase tracking-wider mb-4">
            Comentários ({comentarios?.length ?? 0})
          </h2>

          <div className="flex flex-col gap-3">
            {raiz.map(comentario => (
              <div key={comentario.id}>
                <div className="bg-[#1a2e1a] border border-[#2d4a2d] rounded-xl p-3">
                  <p className="text-[#e8f0e8] text-sm whitespace-pre-wrap">
                    {comentario.conteudo}
                  </p>
                  <p className="text-[#8fac8f] text-xs mt-2">
                    {format(new Date(comentario.created_at), "d MMM", { locale: ptBR })}
                    {comentario.upvotes > 0 && ` • ▲ ${comentario.upvotes}`}
                  </p>
                </div>
                {respostas
                  .filter(r => r.parent_id === comentario.id)
                  .map(resposta => (
                    <div
                      key={resposta.id}
                      className="ml-4 mt-2 bg-[#0d1a0d] border border-[#2d4a2d] rounded-xl p-3"
                    >
                      <p className="text-[#e8f0e8] text-sm whitespace-pre-wrap">
                        {resposta.conteudo}
                      </p>
                      <p className="text-[#8fac8f] text-xs mt-2">
                        {format(new Date(resposta.created_at), "d MMM", { locale: ptBR })}
                      </p>
                    </div>
                  ))}
              </div>
            ))}
          </div>

          {user ? (
            <ComentarioForm postId={postId} />
          ) : (
            <p className="text-[#8fac8f] text-sm mt-6">
              <Link href="/auth/login" className="text-[#6aab6f] hover:underline">
                Entre
              </Link>{' '}
              para comentar.
            </p>
          )}
        </section>
      </div>
    </AppShell>
  )
}
