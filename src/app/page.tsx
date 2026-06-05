import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FORUM_CATEGORIAS, FUNDADOR_LIMITE } from '@/lib/constants'

function CtaButton({
  href,
  children,
  variant = 'primary',
}: {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
}) {
  const base = 'inline-block w-full py-3 px-6 rounded-2xl font-medium text-center transition-colors'
  const styles =
    variant === 'primary'
      ? 'bg-[#4a7c4e] text-[#e8f0e8] hover:bg-[#6aab6f]'
      : 'border border-[#2d4a2d] text-[#8fac8f] hover:border-[#4a7c4e] hover:text-[#e8f0e8]'

  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  )
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: vagasRestantes } = await supabase.rpc('fundadores_restantes')
  const vagas = typeof vagasRestantes === 'number' ? vagasRestantes : FUNDADOR_LIMITE

  return (
    <div className="min-h-screen bg-[#0d1a0d] text-[#e8f0e8]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0d1a0d]/90 backdrop-blur-sm border-b border-[#2d4a2d]">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-display text-xl font-bold">Flô</span>
          <Link
            href="/auth/cadastro"
            className="py-2 px-4 rounded-2xl bg-[#4a7c4e] text-[#e8f0e8] text-sm font-medium hover:bg-[#6aab6f] transition-colors"
          >
            Criar conta
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4">
        {/* Hero */}
        <section className="pt-12 pb-16 text-center">
          <span className="inline-block text-xs font-medium bg-[#1f351f] border border-[#4a7c4e] text-[#6aab6f] px-3 py-1 rounded-full mb-2">
            🏆 Membros Fundadores — Badge Flô #1
          </span>
          {vagas > 0 ? (
            <p className="text-[#6aab6f] text-xs font-medium mb-6">
              {vagas} de {FUNDADOR_LIMITE} vagas restantes
            </p>
          ) : (
            <p className="text-[#8fac8f] text-xs mb-6">
              Vagas de fundador esgotadas — cadastro aberto para todos
            </p>
          )}

          <h1 className="font-display text-4xl font-bold leading-tight mb-3">
            O diário do seu grow, do dia 1 à colheita
          </h1>

          <p className="text-[#8fac8f] text-lg mb-2">
            Seu cultivo. Sua jornada. Nossa comunidade.
          </p>

          <p className="text-[#8fac8f] text-sm mb-8 max-w-xs mx-auto">
            Registre cada fase, acompanhe pH e ambiente, e conecte-se com outros cultivadores — tudo em um só lugar.
          </p>

          <div className="flex flex-col gap-3 max-w-xs mx-auto mb-12">
            <CtaButton href="/auth/cadastro">Criar conta grátis</CtaButton>
            <CtaButton href="/auth/login" variant="secondary">
              Já tenho conta
            </CtaButton>
          </div>

          {/* UI preview mockup */}
          <div className="bg-[#1f351f] border border-[#2d4a2d] rounded-xl p-4 text-left">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[#e8f0e8] font-medium text-sm">Gorilla Glue — Quarto</p>
                <p className="text-[#8fac8f] text-xs">Semana 6 • Floração</p>
              </div>
              <span className="text-xs bg-[#0d1a0d] border border-[#2d4a2d] text-[#6aab6f] px-2 py-1 rounded-lg">
                Floração
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'Temp', value: '24°C' },
                { label: 'Umidade', value: '58%' },
                { label: 'pH', value: '6.2' },
              ].map(item => (
                <div key={item.label} className="bg-[#0d1a0d] rounded-lg p-2 text-center">
                  <p className="text-[#8fac8f] text-xs">{item.label}</p>
                  <p className="text-[#e8f0e8] font-medium text-sm">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="w-14 h-14 rounded-lg bg-[#2d4a2d] flex items-center justify-center text-lg">
                🌿
              </div>
              <div className="w-14 h-14 rounded-lg bg-[#2d4a2d] flex items-center justify-center text-lg">
                📸
              </div>
            </div>
          </div>
        </section>

        {/* Problema → Solução */}
        <section className="pb-16">
          <h2 className="font-display text-xl font-bold text-center mb-2">
            Chega de planilha e fórum bagunçado
          </h2>
          <p className="text-[#8fac8f] text-sm text-center mb-8">
            O Flô organiza o que você já faz — só que melhor.
          </p>

          <div className="flex flex-col gap-3">
            {[
              {
                emoji: '📓',
                titulo: 'Diário estruturado por fase',
                descricao:
                  'Germinação, vegetativo, flora, flush, colheita e cura — cada etapa com campos pensados para o cultivador brasileiro.',
              },
              {
                emoji: '📸',
                titulo: 'Linha do tempo com contexto',
                descricao:
                  'Fotos, pH, rega, temperatura e anotações num feed cronológico. Cada registro conta a história da sua planta.',
              },
              {
                emoji: '🥷',
                titulo: 'Comunidade no seu ritmo',
                descricao:
                  'Compartilhe grows públicos ou participe do fórum 100% anônimo. Você controla o que o mundo vê.',
              },
            ].map(item => (
              <div
                key={item.titulo}
                className="bg-[#1f351f] border border-[#2d4a2d] rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <h3 className="font-medium text-[#e8f0e8] mb-1">{item.titulo}</h3>
                    <p className="text-[#8fac8f] text-sm leading-relaxed">{item.descricao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Como funciona */}
        <section className="pb-16">
          <h2 className="font-display text-xl font-bold text-center mb-8">
            Como funciona
          </h2>

          <div className="flex flex-col gap-4">
            {[
              {
                passo: '1',
                titulo: 'Crie seu primeiro cultivo',
                descricao: 'Nome, genética, substrato e fase — leva menos de 2 minutos.',
              },
              {
                passo: '2',
                titulo: 'Registre o dia com foto',
                descricao:
                  'Estado da planta, rega, ambiente e anotações. Metadados GPS removidos automaticamente.',
              },
              {
                passo: '3',
                titulo: 'Evolua e compartilhe',
                descricao:
                  'Desbloqueie milestones, conquiste o badge Flô #1 e participe da comunidade.',
              },
            ].map(item => (
              <div key={item.passo} className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-[#4a7c4e] text-[#e8f0e8] text-sm font-bold flex items-center justify-center shrink-0">
                  {item.passo}
                </span>
                <div>
                  <h3 className="font-medium text-[#e8f0e8] mb-1">{item.titulo}</h3>
                  <p className="text-[#8fac8f] text-sm">{item.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comunidade */}
        <section className="pb-16">
          <h2 className="font-display text-xl font-bold text-center mb-2">
            Nossa comunidade
          </h2>
          <p className="text-[#8fac8f] text-sm text-center mb-8">
            Feed de grows públicos e fórum anônimo com 5 categorias.
          </p>

          <div className="grid grid-cols-1 gap-2">
            {FORUM_CATEGORIAS.map(cat => (
              <div
                key={cat.slug}
                className="bg-[#1a2e1a] border border-[#2d4a2d] rounded-xl px-4 py-3 flex items-center gap-3"
              >
                <span className="text-lg">{cat.emoji}</span>
                <span className="text-[#e8f0e8] text-sm font-medium">{cat.nome}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-[#1f351f] border border-[#4a7c4e] rounded-xl p-4 text-center">
            <p className="text-[#6aab6f] text-sm font-medium mb-1">
              Complete seu primeiro ciclo
            </p>
            <p className="text-[#8fac8f] text-xs">
              Desbloqueie o badge <strong className="text-[#e8f0e8]">Flô #1</strong> e mostre que você é membro fundador.
            </p>
          </div>
        </section>

        {/* Privacidade */}
        <section className="pb-16">
          <h2 className="font-display text-xl font-bold text-center mb-8">
            Sua segurança em primeiro lugar
          </h2>

          <div className="flex flex-col gap-3">
            {[
              {
                emoji: '🔒',
                texto: 'Fotos sem metadados GPS — EXIF removido automaticamente no servidor.',
              },
              {
                emoji: '🥷',
                texto: 'Modo Ninja oculta seu perfil e cultivos da comunidade.',
              },
              {
                emoji: '👤',
                texto: 'Fórum anônimo — posts nunca exibem seu username.',
              },
            ].map(item => (
              <div
                key={item.texto}
                className="flex items-start gap-3 bg-[#1f351f] border border-[#2d4a2d] rounded-xl p-4"
              >
                <span className="text-xl">{item.emoji}</span>
                <p className="text-[#8fac8f] text-sm leading-relaxed">{item.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="pb-12 text-center">
          <h2 className="font-display text-2xl font-bold mb-3">
            Comece seu grow journal hoje
          </h2>
          <p className="text-[#8fac8f] text-sm mb-8">
            Grátis. Sem cartão. Feito para o cultivador brasileiro.
          </p>

          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <CtaButton href="/auth/cadastro">Criar conta grátis</CtaButton>
            <CtaButton href="/auth/login" variant="secondary">
              Entrar
            </CtaButton>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2d4a2d] py-8 px-4">
        <div className="max-w-lg mx-auto text-center">
          <p className="font-display text-lg font-bold mb-1">Flô</p>
          <p className="text-[#8fac8f] text-xs mb-4">
            Seu cultivo. Sua jornada. Nossa comunidade.
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/auth/cadastro" className="text-[#6aab6f] hover:underline">
              Criar conta
            </Link>
            <Link href="/auth/login" className="text-[#8fac8f] hover:text-[#e8f0e8] transition-colors">
              Entrar
            </Link>
            <Link href="/comunidade" className="text-[#8fac8f] hover:text-[#e8f0e8] transition-colors">
              Comunidade
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
