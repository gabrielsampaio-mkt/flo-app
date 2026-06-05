import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/AppShell'
import { getCategoria } from '@/lib/constants'

export default async function ForumCategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>
}) {
  const { categoria } = await params
  const cat = getCategoria(categoria)
  if (!cat) notFound()

  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts_forum_publico')
    .select('*')
    .eq('categoria', categoria)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0d1a0d] px-4 py-8 max-w-lg mx-auto pb-24">
        <Link
          href="/forum"
          className="text-[#8fac8f] text-sm mb-6 inline-block hover:text-[#e8f0e8] transition-colors"
        >
          ← Fórum
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-xl font-bold text-[#e8f0e8]">
              {cat.emoji} {cat.nome}
            </h1>
            <p className="text-[#8fac8f] text-sm mt-1">{cat.descricao}</p>
          </div>
          <Link
            href={`/forum/${categoria}/novo`}
            className="py-2 px-4 rounded-2xl bg-[#4a7c4e] text-[#e8f0e8] text-sm font-medium hover:bg-[#6aab6f] transition-colors shrink-0"
          >
            + Post
          </Link>
        </div>

        {(!posts || posts.length === 0) && (
          <div className="text-center py-16">
            <p className="text-[#8fac8f] mb-4">Nenhum post ainda nesta categoria.</p>
            <Link
              href={`/forum/${categoria}/novo`}
              className="text-[#6aab6f] text-sm hover:underline"
            >
              Seja o primeiro a postar
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {posts?.map(post => (
            <Link key={post.id} href={`/forum/${categoria}/${post.id}`}>
              <div className="bg-[#1f351f] border border-[#2d4a2d] rounded-xl p-4 hover:border-[#4a7c4e] transition-colors">
                <h3 className="text-[#e8f0e8] font-medium mb-1">{post.titulo}</h3>
                <p className="text-[#8fac8f] text-sm line-clamp-2">{post.conteudo}</p>
                <div className="flex gap-4 mt-3 text-xs text-[#8fac8f]">
                  <span>▲ {post.upvotes ?? 0}</span>
                  <span>
                    {format(new Date(post.created_at), "d MMM yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
