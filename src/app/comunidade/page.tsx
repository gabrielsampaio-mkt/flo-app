import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { differenceInWeeks, parseISO } from 'date-fns'
import { AppShell } from '@/components/AppShell'
import { FASE_LABEL, formatMembroNumero } from '@/lib/constants'

export default async function ComunidadePage() {
  const supabase = await createClient()

  const { data: cultivos } = await supabase
    .from('cultivos')
    .select(`
      id, nome, genetica, genetica_custom, fase_atual, metodo, data_inicio, created_at,
      profiles!inner (username, membro_numero, modo_ninja)
    `)
    .eq('publico', true)
    .eq('profiles.modo_ninja', false)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0d1a0d] px-4 py-8 max-w-lg mx-auto pb-24">
        <h1 className="font-display text-2xl font-bold text-[#e8f0e8] mb-2">Comunidade</h1>
        <p className="text-[#8fac8f] text-sm mb-8">
          Cultivos públicos compartilhados pela comunidade
        </p>

        {(!cultivos || cultivos.length === 0) && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🌿</div>
            <p className="text-[#8fac8f] mb-2">Nenhum cultivo público ainda.</p>
            <p className="text-[#4a7c4e] text-sm">
              Torne seu cultivo público nas configurações do perfil ou na página do cultivo.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {cultivos?.map(cultivo => {
            const profile = Array.isArray(cultivo.profiles)
              ? cultivo.profiles[0]
              : cultivo.profiles
            const semanas = cultivo.data_inicio
              ? differenceInWeeks(new Date(), parseISO(cultivo.data_inicio))
              : null
            const geneticaNome = cultivo.genetica === 'Outra'
              ? cultivo.genetica_custom
              : cultivo.genetica

            return (
              <div
                key={cultivo.id}
                className="bg-[#1f351f] border border-[#2d4a2d] rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-[#e8f0e8] font-medium">{cultivo.nome}</h3>
                    {geneticaNome && (
                      <p className="text-[#8fac8f] text-sm">{geneticaNome}</p>
                    )}
                  </div>
                  <span className="text-xs bg-[#0d1a0d] border border-[#2d4a2d] text-[#6aab6f] px-2 py-1 rounded-lg">
                    {cultivo.fase_atual ? FASE_LABEL[cultivo.fase_atual] : '—'}
                  </span>
                </div>

                <div className="flex gap-3 text-xs text-[#8fac8f] mb-3">
                  {semanas !== null && <span>Semana {semanas}</span>}
                  {cultivo.metodo && <span>• {cultivo.metodo}</span>}
                </div>

                {profile?.username && (
                  <Link
                    href={`/perfil/${profile.username}`}
                    className="text-xs text-[#6aab6f] hover:text-[#e8f0e8] transition-colors"
                  >
                    @{profile.username}
                    {profile.membro_numero && (
                      <span className="text-[#8fac8f] ml-2">
                        {formatMembroNumero(profile.membro_numero)}
                      </span>
                    )}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
