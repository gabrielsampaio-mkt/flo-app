'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { AppShell } from '@/components/AppShell'

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [username, setUsername] = useState('')
  const [form, setForm] = useState({
    bio: '',
    estado: '',
    modo_ninja: false,
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login')
        return
      }
      supabase
        .from('profiles')
        .select('username, bio, estado, modo_ninja')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setUsername(data.username)
            setForm({
              bio: data.bio ?? '',
              estado: data.estado ?? '',
              modo_ninja: data.modo_ninja ?? false,
            })
          }
          setLoading(false)
        })
    })
  }, [router])

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
    setSuccess(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        bio: form.bio.trim() || null,
        estado: form.estado.trim() || null,
        modo_ninja: form.modo_ninja,
      })
      .eq('id', user.id)

    if (updateError) {
      setError('Não foi possível salvar. Tente novamente.')
    } else {
      setSuccess(true)
    }
    setSaving(false)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-[#0d1a0d] flex items-center justify-center">
          <p className="text-[#8fac8f]">Carregando...</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0d1a0d] px-4 py-8 max-w-lg mx-auto pb-24">
        <h1 className="font-display text-2xl font-bold text-[#e8f0e8] mb-2">Configurações</h1>
        {username && (
          <Link
            href={`/perfil/${username}`}
            className="text-[#6aab6f] text-sm hover:underline"
          >
            Ver meu perfil público →
          </Link>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-8">
          <div>
            <label className="block text-[#8fac8f] text-sm mb-2">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              placeholder="Conte um pouco sobre você..."
              rows={3}
              className="w-full bg-[#1f351f] border border-[#2d4a2d] rounded-2xl px-4 py-3 text-[#e8f0e8] placeholder-[#4a7c4e] focus:outline-none focus:border-[#4a7c4e] transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-[#8fac8f] text-sm mb-2">Estado (UF)</label>
            <input
              type="text"
              value={form.estado}
              onChange={e => set('estado', e.target.value.toUpperCase().slice(0, 2))}
              placeholder="ex: SP"
              maxLength={2}
              className="w-full bg-[#1f351f] border border-[#2d4a2d] rounded-2xl px-4 py-3 text-[#e8f0e8] placeholder-[#4a7c4e] focus:outline-none focus:border-[#4a7c4e] transition-colors"
            />
          </div>

          <div className="bg-[#1f351f] border border-[#2d4a2d] rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[#e8f0e8] font-medium text-sm">Modo Ninja 🥷</p>
                <p className="text-[#8fac8f] text-xs mt-1">
                  Oculta seu perfil e cultivos públicos da comunidade.
                </p>
              </div>
              <button
                type="button"
                onClick={() => set('modo_ninja', !form.modo_ninja)}
                className={`w-12 h-7 rounded-full transition-colors shrink-0 ${
                  form.modo_ninja ? 'bg-[#4a7c4e]' : 'bg-[#2d4a2d]'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-[#e8f0e8] transition-transform mx-1 ${
                    form.modo_ninja ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {error && <p className="text-[#c0392b] text-sm">{error}</p>}
          {success && <p className="text-[#6aab6f] text-sm">Salvo com sucesso!</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-2xl bg-[#4a7c4e] text-[#e8f0e8] font-medium hover:bg-[#6aab6f] transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </form>

        <button
          onClick={handleLogout}
          className="w-full mt-6 py-3 rounded-2xl border border-[#2d4a2d] text-[#8fac8f] text-sm hover:border-[#c0392b] hover:text-[#c0392b] transition-colors"
        >
          Sair da conta
        </button>
      </div>
    </AppShell>
  )
}
