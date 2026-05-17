import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { differenceInWeeks, parseISO } from 'date-fns'

const FASE_LABEL: Record<string, string> = {
  germinacao: 'Germinação',
  muda: 'Muda',
  vegetativo: 'Vegetativo',
  pre_floracao: 'Pré-Floração',
  floracao: 'Floração',
  flush: 'Flush',
  colheita: 'Colheita',
  cura: 'Cura',
  concluido: 'Concluído',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: cultivos } = await supabase
    .from('cultivos')
    .select('id, nome, genetica, genetica_custom, fase_atual, data_inicio, metodo, concluido')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const ativos = cultivos?.filter(c => !c.concluido) ?? []
  const concluidos = cultivos?.filter(c => c.concluido) ?? []

  return (
    <div className="min-h-screen bg-[#0d1a0d] px-4 py-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-bold text-[#e8f0e8]">Meus Cultivos</h1>
        <Link
          href="/cultivo/novo"
          className="py-2 px-4 rounded-2xl bg-[#4a7c4e] text-[#e8f0e8] text-sm font-medium hover:bg-[#6aab6f] transition-colors"
        >
          + Novo cultivo
        </Link>
      </div>

      {ativos.length === 0 && concluidos.length === 0 && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🌱</div>
          <p className="text-[#8fac8f] mb-6">Você ainda não tem nenhum cultivo.</p>
          <Link
            href="/cultivo/novo"
            className="inline-block py-3 px-8 rounded-2xl bg-[#4a7c4e] text-[#e8f0e8] font-medium hover:bg-[#6aab6f] transition-colors"
          >
            Começar meu primeiro cultivo
          </Link>
        </div>
      )}

      {ativos.length > 0 && (
        <section className="mb-8">
          <h2 className="text-[#8fac8f] text-xs font-medium uppercase tracking-wider mb-3">
            Em andamento
          </h2>
          <div className="flex flex-col gap-3">
            {ativos.map(cultivo => {
              const semanas = cultivo.data_inicio
                ? differenceInWeeks(new Date(), parseISO(cultivo.data_inicio))
                : null
              const geneticaNome = cultivo.genetica === 'Outra'
                ? cultivo.genetica_custom
                : cultivo.genetica

              return (
                <Link key={cultivo.id} href={`/cultivo/${cultivo.id}`}>
                  <div className="bg-[#1f351f] border border-[#2d4a2d] rounded-xl p-4 hover:border-[#4a7c4e] transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-[#e8f0e8] font-medium">{cultivo.nome}</h3>
                        {geneticaNome && (
                          <p className="text-[#8fac8f] text-sm">{geneticaNome}</p>
                        )}
                      </div>
                      <span className="text-xs bg-[#0d1a0d] border border-[#2d4a2d] text-[#6aab6f] px-2 py-1 rounded-lg">
                        {cultivo.fase_atual ? FASE_LABEL[cultivo.fase_atual] : 'Sem fase'}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs text-[#8fac8f]">
                      {semanas !== null && <span>Semana {semanas}</span>}
                      {cultivo.metodo && <span>• {cultivo.metodo}</span>}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {concluidos.length > 0 && (
        <section>
          <h2 className="text-[#8fac8f] text-xs font-medium uppercase tracking-wider mb-3">
            Concluídos
          </h2>
          <div className="flex flex-col gap-3">
            {concluidos.map(cultivo => (
              <Link key={cultivo.id} href={`/cultivo/${cultivo.id}`}>
                <div className="bg-[#1a2e1a] border border-[#2d4a2d] rounded-xl p-4 opacity-70 hover:opacity-100 transition-opacity">
                  <h3 className="text-[#e8f0e8] font-medium">{cultivo.nome}</h3>
                  {cultivo.genetica && (
                    <p className="text-[#8fac8f] text-sm">{cultivo.genetica}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
