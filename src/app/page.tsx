import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0d1a0d]">
      <div className="text-center max-w-sm">
        <h1 className="font-display text-5xl font-bold text-[#e8f0e8] mb-2">Flô</h1>
        <p className="text-[#8fac8f] mb-10">Seu cultivo. Sua jornada. Sua comunidade.</p>

        <div className="flex flex-col gap-3">
          <Link
            href="/auth/login"
            className="w-full py-3 px-6 rounded-2xl bg-[#4a7c4e] text-[#e8f0e8] font-medium text-center hover:bg-[#6aab6f] transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/auth/cadastro"
            className="w-full py-3 px-6 rounded-2xl border border-[#2d4a2d] text-[#8fac8f] font-medium text-center hover:border-[#4a7c4e] hover:text-[#e8f0e8] transition-colors"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  )
}
