'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const FASES_INICIAIS = [
  { value: 'germinacao', label: 'Germinação' },
  { value: 'muda', label: 'Muda' },
  { value: 'vegetativo', label: 'Vegetativo' },
]

const METODOS = [
  { value: 'indoor', label: 'Indoor' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'greenhouse', label: 'Greenhouse' },
]

const SUBSTRATOS = [
  { value: 'solo_organico', label: 'Solo Orgânico' },
  { value: 'solo_vivo_notill', label: 'Solo Vivo / No-Till' },
  { value: 'inerte', label: 'Inerte' },
  { value: 'semi_inerte', label: 'Semi-Inerte' },
  { value: 'hidroponia', label: 'Hidroponia' },
  { value: 'aeroponia', label: 'Aeroponia' },
]

const TIPOS_SEMENTE = [
  { value: 'feminizada', label: 'Feminizada' },
  { value: 'automatica', label: 'Automática' },
  { value: 'regular', label: 'Regular' },
  { value: 'fast_flowering', label: 'Fast Flowering' },
  { value: 'cbd', label: 'CBD' },
  { value: 'prenseed', label: 'Prenseed' },
]

export default function NovoCultivoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nome: '',
    genetica: '',
    banco_semente: '',
    tipo_semente: '',
    substrato: '',
    metodo: '',
    fase_atual: 'germinacao',
    data_inicio: new Date().toISOString().split('T')[0],
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) {
      setError('Dê um nome para o seu cultivo.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const { data: cultivo, error: cultivoError } = await supabase
      .from('cultivos')
      .insert({
        user_id: user.id,
        nome: form.nome.trim(),
        genetica: form.genetica || null,
        banco_semente: form.banco_semente || null,
        tipo_semente: form.tipo_semente || null,
        substrato: form.substrato || null,
        metodo: form.metodo || null,
        fase_atual: form.fase_atual,
        data_inicio: form.data_inicio,
      })
      .select('id')
      .single()

    if (cultivoError || !cultivo) {
      setError('Não foi possível criar o cultivo. Tente novamente.')
      setLoading(false)
      return
    }

    await supabase.from('milestones').insert({
      cultivo_id: cultivo.id,
      user_id: user.id,
      tipo: form.fase_atual,
    })

    router.push(`/cultivo/${cultivo.id}`)
  }

  return (
    <div className="min-h-screen bg-[#0d1a0d] px-4 py-8 max-w-lg mx-auto">
      <button
        onClick={() => router.back()}
        className="text-[#8fac8f] text-sm mb-6 hover:text-[#e8f0e8] transition-colors"
      >
        ← Voltar
      </button>

      <h1 className="font-display text-2xl font-bold text-[#e8f0e8] mb-8">Novo Cultivo</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-[#8fac8f] text-sm mb-2">
            Nome do cultivo <span className="text-[#c0392b]">*</span>
          </label>
          <input
            type="text"
            placeholder="ex: Gorilla Glue — Janela do Quarto"
            value={form.nome}
            onChange={e => set('nome', e.target.value)}
            className="w-full bg-[#1f351f] border border-[#2d4a2d] rounded-2xl px-4 py-3 text-[#e8f0e8] placeholder-[#4a7c4e] focus:outline-none focus:border-[#4a7c4e] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[#8fac8f] text-sm mb-2">Genética</label>
          <input
            type="text"
            placeholder="ex: Gorilla Glue #4"
            value={form.genetica}
            onChange={e => set('genetica', e.target.value)}
            className="w-full bg-[#1f351f] border border-[#2d4a2d] rounded-2xl px-4 py-3 text-[#e8f0e8] placeholder-[#4a7c4e] focus:outline-none focus:border-[#4a7c4e] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[#8fac8f] text-sm mb-2">Banco de sementes</label>
          <input
            type="text"
            placeholder="ex: Fastbuds, Barney's Farm..."
            value={form.banco_semente}
            onChange={e => set('banco_semente', e.target.value)}
            className="w-full bg-[#1f351f] border border-[#2d4a2d] rounded-2xl px-4 py-3 text-[#e8f0e8] placeholder-[#4a7c4e] focus:outline-none focus:border-[#4a7c4e] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[#8fac8f] text-sm mb-2">Tipo de semente</label>
          <div className="grid grid-cols-3 gap-2">
            {TIPOS_SEMENTE.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => set('tipo_semente', form.tipo_semente === t.value ? '' : t.value)}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-colors border ${
                  form.tipo_semente === t.value
                    ? 'bg-[#4a7c4e] border-[#4a7c4e] text-[#e8f0e8]'
                    : 'bg-[#1f351f] border-[#2d4a2d] text-[#8fac8f] hover:border-[#4a7c4e]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[#8fac8f] text-sm mb-2">Substrato</label>
          <div className="grid grid-cols-2 gap-2">
            {SUBSTRATOS.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => set('substrato', form.substrato === s.value ? '' : s.value)}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-colors border ${
                  form.substrato === s.value
                    ? 'bg-[#4a7c4e] border-[#4a7c4e] text-[#e8f0e8]'
                    : 'bg-[#1f351f] border-[#2d4a2d] text-[#8fac8f] hover:border-[#4a7c4e]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[#8fac8f] text-sm mb-2">Método</label>
          <div className="grid grid-cols-3 gap-2">
            {METODOS.map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => set('metodo', form.metodo === m.value ? '' : m.value)}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-colors border ${
                  form.metodo === m.value
                    ? 'bg-[#4a7c4e] border-[#4a7c4e] text-[#e8f0e8]'
                    : 'bg-[#1f351f] border-[#2d4a2d] text-[#8fac8f] hover:border-[#4a7c4e]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[#8fac8f] text-sm mb-2">Fase inicial</label>
          <div className="grid grid-cols-3 gap-2">
            {FASES_INICIAIS.map(f => (
              <button
                key={f.value}
                type="button"
                onClick={() => set('fase_atual', f.value)}
                className={`py-2 px-3 rounded-xl text-xs font-medium transition-colors border ${
                  form.fase_atual === f.value
                    ? 'bg-[#4a7c4e] border-[#4a7c4e] text-[#e8f0e8]'
                    : 'bg-[#1f351f] border-[#2d4a2d] text-[#8fac8f] hover:border-[#4a7c4e]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[#8fac8f] text-sm mb-2">Data de início</label>
          <input
            type="date"
            value={form.data_inicio}
            onChange={e => set('data_inicio', e.target.value)}
            className="w-full bg-[#1f351f] border border-[#2d4a2d] rounded-2xl px-4 py-3 text-[#e8f0e8] focus:outline-none focus:border-[#4a7c4e] transition-colors"
          />
        </div>

        {error && <p className="text-[#c0392b] text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-[#4a7c4e] text-[#e8f0e8] font-medium hover:bg-[#6aab6f] transition-colors disabled:opacity-50 mt-2"
        >
          {loading ? 'Criando...' : 'Criar cultivo'}
        </button>
      </form>
    </div>
  )
}
