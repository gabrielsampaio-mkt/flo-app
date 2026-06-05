import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { format, differenceInWeeks, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AvancarFaseButton } from './AvancarFaseButton'
import { TogglePublicoButton } from './TogglePublicoButton'
import { AppShell } from '@/components/AppShell'

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

const FASE_ORDEM = [
  'germinacao', 'muda', 'vegetativo', 'pre_floracao',
  'floracao', 'flush', 'colheita', 'cura', 'concluido',
]

const ESTADO_LABEL: Record<string, string> = {
  saudavel: 'Saudável',
  overfert: 'Overfert',
  fome: 'Fome',
  pragas: 'Pragas',
  estresse_termico: 'Estresse Térmico',
  em_recuperacao: 'Em Recuperação',
  outro: 'Outro',
}

export default async function CultivoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: cultivo } = await supabase
    .from('cultivos')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!cultivo) notFound()

  const { data: registros } = await supabase
    .from('registros')
    .select('*')
    .eq('cultivo_id', id)
    .order('created_at', { ascending: false })

  // Gera links temporários (1h) para todas as fotos de todos os registros
  const todasPaths = registros
    ?.flatMap(r => r.fotos ?? [])
    .filter((p: string) => p && !p.startsWith('http')) ?? []

  const signedMap: Record<string, string> = {}
  if (todasPaths.length > 0) {
    const { data: signed } = await supabase.storage
      .from('fotos-cultivo')
      .createSignedUrls(todasPaths, 3600)
    signed?.forEach(s => {
      if (s.signedUrl && s.path) signedMap[s.path] = s.signedUrl
    })
  }

  const { data: milestones } = await supabase
    .from('milestones')
    .select('tipo, desbloqueado_em')
    .eq('cultivo_id', id)
    .order('desbloqueado_em', { ascending: true })

  const semanas = cultivo.data_inicio
    ? differenceInWeeks(new Date(), parseISO(cultivo.data_inicio))
    : null

  const faseAtualIdx = FASE_ORDEM.indexOf(cultivo.fase_atual ?? '')
  const proximaFase = faseAtualIdx >= 0 && faseAtualIdx < FASE_ORDEM.length - 1
    ? FASE_ORDEM[faseAtualIdx + 1]
    : null

  const geneticaNome = cultivo.genetica === 'Outra' ? cultivo.genetica_custom : cultivo.genetica

  return (
    <AppShell>
    <div className="min-h-screen bg-[#0d1a0d] px-4 py-8 max-w-lg mx-auto pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-[#8fac8f] hover:text-[#e8f0e8] transition-colors">
          ←
        </Link>
        <h1 className="font-display text-xl font-bold text-[#e8f0e8]">{cultivo.nome}</h1>
      </div>

      {/* Card de info do cultivo */}
      <div className="bg-[#1f351f] border border-[#2d4a2d] rounded-xl p-4 mb-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            {geneticaNome && (
              <p className="text-[#e8f0e8] font-medium">{geneticaNome}</p>
            )}
            {cultivo.banco_semente && (
              <p className="text-[#8fac8f] text-sm">{cultivo.banco_semente}</p>
            )}
          </div>
          <span className="text-xs bg-[#0d1a0d] border border-[#2d4a2d] text-[#6aab6f] px-3 py-1 rounded-lg font-medium">
            {cultivo.fase_atual ? FASE_LABEL[cultivo.fase_atual] : '—'}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-[#8fac8f]">
          {semanas !== null && <span>Semana {semanas}</span>}
          {cultivo.metodo && <span>• {cultivo.metodo}</span>}
          {cultivo.substrato && <span>• {cultivo.substrato.replace(/_/g, ' ')}</span>}
          {cultivo.tipo_semente && <span>• {cultivo.tipo_semente.replace(/_/g, ' ')}</span>}
        </div>

        {/* Milestones */}
        {milestones && milestones.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#2d4a2d]">
            <div className="flex gap-2 flex-wrap">
              {milestones.map(m => (
                <span key={m.tipo} className="text-xs bg-[#0d1a0d] text-[#6aab6f] px-2 py-1 rounded-lg border border-[#2d4a2d]">
                  ✓ {FASE_LABEL[m.tipo] ?? m.tipo}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Botões de ação */}
      <div className="flex gap-3 mb-4">
        <Link
          href={`/cultivo/${id}/registro`}
          className="flex-1 py-3 rounded-2xl bg-[#4a7c4e] text-[#e8f0e8] text-sm font-medium text-center hover:bg-[#6aab6f] transition-colors"
        >
          + Registrar hoje
        </Link>
        {proximaFase && !cultivo.concluido && (
          <AvancarFaseButton
            cultivoId={id}
            userId={user.id}
            proximaFase={proximaFase}
            proximaFaseLabel={FASE_LABEL[proximaFase]}
          />
        )}
      </div>

      <div className="mb-8">
        <TogglePublicoButton cultivoId={id} publico={cultivo.publico ?? false} />
      </div>

      {/* Linha do tempo */}
      <h2 className="text-[#8fac8f] text-xs font-medium uppercase tracking-wider mb-4">
        Linha do tempo
      </h2>

      {(!registros || registros.length === 0) && (
        <div className="text-center py-12">
          <p className="text-[#8fac8f] text-sm">Nenhum registro ainda.</p>
          <p className="text-[#4a7c4e] text-sm mt-1">Faça o primeiro registro do seu cultivo!</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {registros?.map(registro => (
          <div key={registro.id} className="bg-[#1f351f] border border-[#2d4a2d] rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[#8fac8f] text-xs">
                {format(new Date(registro.created_at), "d 'de' MMMM", { locale: ptBR })}
              </p>
              {registro.estado_planta && (
                <span className={`text-xs px-2 py-0.5 rounded-lg border ${
                  registro.estado_planta === 'saudavel'
                    ? 'border-[#4a7c4e] text-[#6aab6f]'
                    : 'border-[#c0392b] text-[#c0392b]'
                }`}>
                  {ESTADO_LABEL[registro.estado_planta] ?? registro.estado_planta}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
              {registro.temperatura_c && (
                <div className="bg-[#0d1a0d] rounded-lg p-2 text-center">
                  <p className="text-[#8fac8f]">Temp</p>
                  <p className="text-[#e8f0e8] font-medium">{registro.temperatura_c}°C</p>
                </div>
              )}
              {registro.umidade_pct && (
                <div className="bg-[#0d1a0d] rounded-lg p-2 text-center">
                  <p className="text-[#8fac8f]">Umidade</p>
                  <p className="text-[#e8f0e8] font-medium">{registro.umidade_pct}%</p>
                </div>
              )}
              {registro.ph_agua && (
                <div className="bg-[#0d1a0d] rounded-lg p-2 text-center">
                  <p className="text-[#8fac8f]">pH</p>
                  <p className="text-[#e8f0e8] font-medium">{registro.ph_agua}</p>
                </div>
              )}
            </div>

            {registro.regou && (
              <p className="text-xs text-[#8fac8f] mb-1">
                Regou{registro.volume_ml ? ` — ${registro.volume_ml}ml` : ''}
                {registro.tipo_agua ? ` (${registro.tipo_agua})` : ''}
              </p>
            )}

            {registro.anotacao && (
              <p className="text-[#e8f0e8] text-sm mt-2">{registro.anotacao}</p>
            )}

            {registro.fotos && registro.fotos.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {registro.fotos.map((path: string, i: number) => {
                  const src = signedMap[path] ?? path
                  return (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </AppShell>
  )
}
