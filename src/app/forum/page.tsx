import Link from 'next/link'
import { AppShell } from '@/components/AppShell'
import { FORUM_CATEGORIAS } from '@/lib/constants'

export default function ForumPage() {
  return (
    <AppShell>
      <div className="min-h-screen bg-[#0d1a0d] px-4 py-8 max-w-lg mx-auto pb-24">
        <h1 className="font-display text-2xl font-bold text-[#e8f0e8] mb-2">Fórum</h1>
        <p className="text-[#8fac8f] text-sm mb-8">
          Discussões anônimas — sua identidade nunca é exibida
        </p>

        <div className="flex flex-col gap-3">
          {FORUM_CATEGORIAS.map(cat => (
            <Link key={cat.slug} href={`/forum/${cat.slug}`}>
              <div className="bg-[#1f351f] border border-[#2d4a2d] rounded-xl p-4 hover:border-[#4a7c4e] transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{cat.emoji}</span>
                  <div>
                    <h3 className="text-[#e8f0e8] font-medium">{cat.nome}</h3>
                    <p className="text-[#8fac8f] text-sm mt-0.5">{cat.descricao}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
