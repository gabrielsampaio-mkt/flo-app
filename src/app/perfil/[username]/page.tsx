import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { format, differenceInWeeks, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AppShell } from '@/components/AppShell'
import { FASE_LABEL, formatMembroNumero } from '@/lib/constants'

export default async function PerfilPublicoPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const isOwnProfile = user?.id === profile.id
  if (profile.modo_ninja && !isOwnProfile) notFound()

  const { data: cultivos } = await supabase
    .from('cultivos')
    .select('id, nome, genetica, genetica_custom, fase_atual, metodo, data_inicio, concluido, publico')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  const publicos = cultivos?.filter(c => c.publico) ?? []
  const totalGrows = cultivos?.length ?? 0
  const concluidos = cultivos?.filter(c => c.concluido).length ?? 0
  const geneticas = new Set(
    cultivos
      ?.map(c => (c.genetica === 'Outra' ? c.genetica_custom : c.genetica))
      .filter(Boolean)
  ).size

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0d1a0d] px-4 py-8 max-w-lg mx-auto pb-24">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[#1f351f] border border-[#2d4a2d] flex items-center justify-center text-3xl mx-auto mb-4">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              '🌱'
            )}
          </div>

          <h1 className="font-display text-2xl font-bold text-[#e8f0e8]">
            @{profile.username}
          </h1>

          {profile.membro_numero && (
            <p className="text-[#6aab6f] text-sm mt-1">
              {formatMembroNumero(profile.membro_numero)}
            </p>
          )}

          {profile.ciclo_completo && (
            <span className="inline-block mt-2 text-xs bg-[#4a7c4e] text-[#e8f0e8] px-3 py-1 rounded-full font-medium">
              🏆 Badge Flô #1
            </span>
          )}

          {!profile.ciclo_completo && totalGrows > 0 && (
            <span className="inline-block mt-2 text-xs bg-[#1a2e1a] border border-[#2d4a2d] text-[#8fac8f] px-3 py-1 rounded-full">
              Em busca do badge Flô #1
            </span>
          )}

          {profile.is_fundador && (
            <p className="text-[#8fac8f] text-xs mt-2">Membro Fundador</p>
          )}

          {profile.bio && (
            <p className="text-[#8fac8f] text-sm mt-3 max-w-xs mx-auto">{profile.bio}</p>
          )}

          {profile.estado && (
            <p className="text-[#8fac8f] text-xs mt-1">{profile.estado}</p>
          )}

          {profile.modo_ninja && isOwnProfile && (
            <p className="text-[#8fac8f] text-xs mt-3 bg-[#1a2e1a] border border-[#2d4a2d] rounded-xl px-3 py-2">
              🥷 Modo Ninja ativo — seu perfil está oculto da comunidade.
            </p>
          )}

          {isOwnProfile && (
            <Link
              href="/perfil/configuracoes"
              className="inline-block mt-4 text-[#6aab6f] text-sm hover:underline"
            >
              Editar perfil
            </Link>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-[#1f351f] border border-[#2d4a2d] rounded-xl p-3 text-center">
            <p className="text-[#e8f0e8] font-bold text-lg">{totalGrows}</p>
            <p className="text-[#8fac8f] text-xs">Grows</p>
          </div>
          <div className="bg-[#1f351f] border border-[#2d4a2d] rounded-xl p-3 text-center">
            <p className="text-[#e8f0e8] font-bold text-lg">{concluidos}</p>
            <p className="text-[#8fac8f] text-xs">Concluídos</p>
          </div>
          <div className="bg-[#1f351f] border border-[#2d4a2d] rounded-xl p-3 text-center">
            <p className="text-[#e8f0e8] font-bold text-lg">{geneticas}</p>
            <p className="text-[#8fac8f] text-xs">Genéticas</p>
          </div>
        </div>

        <p className="text-[#8fac8f] text-xs text-center mb-6">
          Membro desde{' '}
          {format(new Date(profile.created_at), "MMMM 'de' yyyy", { locale: ptBR })}
        </p>

        <h2 className="text-[#8fac8f] text-xs font-medium uppercase tracking-wider mb-3">
          Cultivos públicos
        </h2>

        {publicos.length === 0 && (
          <p className="text-[#8fac8f] text-sm text-center py-8">
            Nenhum cultivo público compartilhado.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {publicos.map(cultivo => {
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
                <div className="flex items-start justify-between">
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
                <div className="flex gap-3 text-xs text-[#8fac8f] mt-2">
                  {semanas !== null && <span>Semana {semanas}</span>}
                  {cultivo.metodo && <span>• {cultivo.metodo}</span>}
                  {cultivo.concluido && <span>• Concluído</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
