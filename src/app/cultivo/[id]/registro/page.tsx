'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const ESTADOS = [
  { value: 'saudavel', label: 'Saudável' },
  { value: 'overfert', label: 'Overfert' },
  { value: 'fome', label: 'Fome' },
  { value: 'pragas', label: 'Pragas' },
  { value: 'estresse_termico', label: 'Estresse Térmico' },
  { value: 'em_recuperacao', label: 'Em Recuperação' },
]

const TREINAMENTOS = [
  { value: 'lst', label: 'LST' },
  { value: 'topping', label: 'Topping' },
  { value: 'fimming', label: 'Fimming' },
  { value: 'defolha', label: 'Defolha' },
  { value: 'scrog', label: 'SCROG' },
  { value: 'lollipopping', label: 'Lollipopping' },
]

interface Params {
  id: string
}

export default function NovoRegistroPage({ params }: { params: Promise<Params> }) {
  const { id: cultivoId } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()

  const [estado, setEstado] = useState('')
  const [regou, setRegou] = useState(false)
  const [volumeMl, setVolumeMl] = useState('')
  const [tipoAgua, setTipoAgua] = useState('')
  const [phAgua, setPhAgua] = useState('')
  const [ecPpm, setEcPpm] = useState('')
  const [nutriu, setNutriu] = useState(false)
  const [temperaturaC, setTemperaturaC] = useState('')
  const [umidadePct, setUmidadePct] = useState('')
  const [horasLuz, setHorasLuz] = useState('')
  const [treinamento, setTreinamento] = useState<string[]>([])
  const [anotacao, setAnotacao] = useState('')
  const [fotos, setFotos] = useState<File[]>([])
  const [fotosPreviews, setFotosPreviews] = useState<string[]>([])
  const [uploadError, setUploadError] = useState('')

  function toggleTreinamento(v: string) {
    setTreinamento(prev =>
      prev.includes(v) ? prev.filter(t => t !== v) : [...prev, v]
    )
  }

  function handleFotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setFotos(prev => [...prev, ...files])
    files.forEach(f => {
      const url = URL.createObjectURL(f)
      setFotosPreviews(prev => [...prev, url])
    })
  }

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('não autenticado')

      const fotosUrls: string[] = []

      for (const foto of fotos) {
        const formData = new FormData()
        formData.append('foto', foto)
        formData.append('cultivoId', cultivoId)
        const res = await fetch('/api/upload-foto', { method: 'POST', body: formData })
        if (!res.ok) {
          setUploadError('Erro ao enviar uma das fotos.')
          throw new Error('upload error')
        }
        const json = await res.json()
        fotosUrls.push(json.path)
      }

      const { error } = await supabase.from('registros').insert({
        cultivo_id: cultivoId,
        user_id: user.id,
        estado_planta: estado || null,
        regou,
        volume_ml: volumeMl ? parseInt(volumeMl) : null,
        tipo_agua: tipoAgua || null,
        ph_agua: phAgua ? parseFloat(phAgua) : null,
        ec_ppm: ecPpm ? parseFloat(ecPpm) : null,
        nutriu,
        temperatura_c: temperaturaC ? parseFloat(temperaturaC) : null,
        umidade_pct: umidadePct ? parseFloat(umidadePct) : null,
        horas_luz: horasLuz ? parseFloat(horasLuz) : null,
        treinamento: treinamento.length > 0 ? treinamento : null,
        anotacao: anotacao || null,
        fotos: fotosUrls.length > 0 ? fotosUrls : null,
      })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registros', cultivoId] })
      router.push(`/cultivo/${cultivoId}`)
      router.refresh()
    },
  })

  return (
    <div className="min-h-screen bg-[#0d1a0d] px-4 py-8 max-w-lg mx-auto pb-24">
      <button
        onClick={() => router.back()}
        className="text-[#8fac8f] text-sm mb-6 hover:text-[#e8f0e8] transition-colors"
      >
        ← Voltar
      </button>

      <h1 className="font-display text-2xl font-bold text-[#e8f0e8] mb-8">Registrar hoje</h1>

      <div className="flex flex-col gap-6">
        {/* Estado da planta */}
        <div>
          <label className="block text-[#8fac8f] text-sm mb-2">Como está a planta?</label>
          <div className="grid grid-cols-3 gap-2">
            {ESTADOS.map(e => (
              <button
                key={e.value}
                type="button"
                onClick={() => setEstado(estado === e.value ? '' : e.value)}
                className={`py-2 px-2 rounded-xl text-xs font-medium transition-colors border ${
                  estado === e.value
                    ? e.value === 'saudavel'
                      ? 'bg-[#4a7c4e] border-[#4a7c4e] text-[#e8f0e8]'
                      : 'bg-[#c0392b]/20 border-[#c0392b] text-[#c0392b]'
                    : 'bg-[#1f351f] border-[#2d4a2d] text-[#8fac8f] hover:border-[#4a7c4e]'
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rega */}
        <div>
          <label className="block text-[#8fac8f] text-sm mb-2">Rega</label>
          <button
            type="button"
            onClick={() => setRegou(r => !r)}
            className={`w-full py-3 rounded-2xl text-sm font-medium transition-colors border mb-3 ${
              regou
                ? 'bg-[#4a7c4e] border-[#4a7c4e] text-[#e8f0e8]'
                : 'bg-[#1f351f] border-[#2d4a2d] text-[#8fac8f]'
            }`}
          >
            {regou ? 'Regou hoje' : 'Não regou hoje'}
          </button>

          {regou && (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Volume (ml)"
                value={volumeMl}
                onChange={e => setVolumeMl(e.target.value)}
                className="bg-[#1f351f] border border-[#2d4a2d] rounded-xl px-3 py-2 text-[#e8f0e8] text-sm placeholder-[#4a7c4e] focus:outline-none focus:border-[#4a7c4e]"
              />
              <input
                type="text"
                placeholder="Tipo de água"
                value={tipoAgua}
                onChange={e => setTipoAgua(e.target.value)}
                className="bg-[#1f351f] border border-[#2d4a2d] rounded-xl px-3 py-2 text-[#e8f0e8] text-sm placeholder-[#4a7c4e] focus:outline-none focus:border-[#4a7c4e]"
              />
              <input
                type="number"
                placeholder="pH da água"
                step="0.1"
                value={phAgua}
                onChange={e => setPhAgua(e.target.value)}
                className="bg-[#1f351f] border border-[#2d4a2d] rounded-xl px-3 py-2 text-[#e8f0e8] text-sm placeholder-[#4a7c4e] focus:outline-none focus:border-[#4a7c4e]"
              />
              <input
                type="number"
                placeholder="EC / PPM"
                step="0.01"
                value={ecPpm}
                onChange={e => setEcPpm(e.target.value)}
                className="bg-[#1f351f] border border-[#2d4a2d] rounded-xl px-3 py-2 text-[#e8f0e8] text-sm placeholder-[#4a7c4e] focus:outline-none focus:border-[#4a7c4e]"
              />
            </div>
          )}
        </div>

        {/* Ambiente */}
        <div>
          <label className="block text-[#8fac8f] text-sm mb-2">Ambiente</label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <input
                type="number"
                placeholder="Temp °C"
                step="0.1"
                value={temperaturaC}
                onChange={e => setTemperaturaC(e.target.value)}
                className="w-full bg-[#1f351f] border border-[#2d4a2d] rounded-xl px-3 py-2 text-[#e8f0e8] text-sm placeholder-[#4a7c4e] focus:outline-none focus:border-[#4a7c4e]"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Umidade %"
                step="0.1"
                value={umidadePct}
                onChange={e => setUmidadePct(e.target.value)}
                className="w-full bg-[#1f351f] border border-[#2d4a2d] rounded-xl px-3 py-2 text-[#e8f0e8] text-sm placeholder-[#4a7c4e] focus:outline-none focus:border-[#4a7c4e]"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Horas luz"
                step="0.5"
                value={horasLuz}
                onChange={e => setHorasLuz(e.target.value)}
                className="w-full bg-[#1f351f] border border-[#2d4a2d] rounded-xl px-3 py-2 text-[#e8f0e8] text-sm placeholder-[#4a7c4e] focus:outline-none focus:border-[#4a7c4e]"
              />
            </div>
          </div>
        </div>

        {/* Treinamento */}
        <div>
          <label className="block text-[#8fac8f] text-sm mb-2">Treinamento (opcional)</label>
          <div className="grid grid-cols-3 gap-2">
            {TREINAMENTOS.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => toggleTreinamento(t.value)}
                className={`py-2 px-2 rounded-xl text-xs font-medium transition-colors border ${
                  treinamento.includes(t.value)
                    ? 'bg-[#4a7c4e] border-[#4a7c4e] text-[#e8f0e8]'
                    : 'bg-[#1f351f] border-[#2d4a2d] text-[#8fac8f] hover:border-[#4a7c4e]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Anotação */}
        <div>
          <label className="block text-[#8fac8f] text-sm mb-2">Anotação</label>
          <textarea
            placeholder="Como está o cultivo hoje? Observações, problemas, descobertas..."
            value={anotacao}
            onChange={e => setAnotacao(e.target.value)}
            rows={4}
            className="w-full bg-[#1f351f] border border-[#2d4a2d] rounded-xl px-4 py-3 text-[#e8f0e8] text-sm placeholder-[#4a7c4e] focus:outline-none focus:border-[#4a7c4e] resize-none"
          />
        </div>

        {/* Fotos */}
        <div>
          <label className="block text-[#8fac8f] text-sm mb-2">Fotos</label>
          <label className="flex items-center justify-center w-full py-3 border border-dashed border-[#2d4a2d] rounded-xl cursor-pointer hover:border-[#4a7c4e] transition-colors">
            <span className="text-[#8fac8f] text-sm">+ Adicionar foto</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFotoSelect}
              className="hidden"
            />
          </label>

          {fotosPreviews.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {fotosPreviews.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
              ))}
            </div>
          )}

          {uploadError && <p className="text-[#c0392b] text-sm mt-2">{uploadError}</p>}
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={() => mutate()}
          className="w-full py-3 rounded-2xl bg-[#4a7c4e] text-[#e8f0e8] font-medium hover:bg-[#6aab6f] transition-colors disabled:opacity-50 mt-2"
        >
          {isPending ? 'Salvando...' : 'Salvar registro'}
        </button>
      </div>
    </div>
  )
}
