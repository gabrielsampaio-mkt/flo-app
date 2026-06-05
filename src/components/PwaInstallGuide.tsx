'use client'

import { useEffect, useState } from 'react'

export function PwaInstallGuide() {
  const [visible, setVisible] = useState(false)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other')

  useEffect(() => {
    if (localStorage.getItem('flo-pwa-dismissed')) return
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const ua = navigator.userAgent
    if (/iPhone|iPad|iPod/i.test(ua)) setPlatform('ios')
    else if (/Android/i.test(ua)) setPlatform('android')

    setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem('flo-pwa-dismissed', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="bg-[#1f351f] border border-[#4a7c4e] rounded-xl p-4 mb-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-[#e8f0e8] font-medium text-sm">📲 Instale o Flô no celular</p>
          <p className="text-[#8fac8f] text-xs mt-1">
            Acesse rápido na estufa — funciona como app nativo.
          </p>
        </div>
        <button
          onClick={dismiss}
          className="text-[#8fac8f] hover:text-[#e8f0e8] text-sm shrink-0"
          aria-label="Fechar"
        >
          ✕
        </button>
      </div>

      {platform === 'ios' && (
        <ol className="text-[#8fac8f] text-xs space-y-1.5 list-decimal list-inside">
          <li>Toque no botão <strong className="text-[#e8f0e8]">Compartilhar</strong> no Safari</li>
          <li>Selecione <strong className="text-[#e8f0e8]">Adicionar à Tela de Início</strong></li>
          <li>Confirme tocando em <strong className="text-[#e8f0e8]">Adicionar</strong></li>
        </ol>
      )}

      {platform === 'android' && (
        <ol className="text-[#8fac8f] text-xs space-y-1.5 list-decimal list-inside">
          <li>Toque no menu <strong className="text-[#e8f0e8]">⋮</strong> do Chrome</li>
          <li>Selecione <strong className="text-[#e8f0e8]">Instalar app</strong> ou <strong className="text-[#e8f0e8]">Adicionar à tela inicial</strong></li>
          <li>Confirme a instalação</li>
        </ol>
      )}

      {platform === 'other' && (
        <p className="text-[#8fac8f] text-xs">
          No navegador do celular, use a opção <strong className="text-[#e8f0e8]">Instalar app</strong> ou <strong className="text-[#e8f0e8]">Adicionar à tela inicial</strong> no menu do browser.
        </p>
      )}

      <button
        onClick={dismiss}
        className="mt-3 text-[#6aab6f] text-xs hover:underline"
      >
        Entendi, não mostrar de novo
      </button>
    </div>
  )
}
