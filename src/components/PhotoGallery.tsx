'use client'

import { useState, useEffect, useCallback } from 'react'

export function PhotoGallery({ urls }: { urls: string[] }) {
  const [active, setActive] = useState<number | null>(null)

  const close = useCallback(() => setActive(null), [])

  const goPrev = useCallback(() => {
    setActive(i => (i !== null && i > 0 ? i - 1 : i))
  }, [])

  const goNext = useCallback(() => {
    setActive(i => (i !== null && i < urls.length - 1 ? i + 1 : i))
  }, [urls.length])

  useEffect(() => {
    if (active === null) return

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [active, close, goPrev, goNext])

  if (urls.length === 0) return null

  return (
    <>
      <div className="flex gap-2 mt-3 overflow-x-auto">
        {urls.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(i)}
            className="flex-shrink-0 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#4a7c4e]"
            aria-label={`Ver foto ${i + 1} em tela cheia`}
          >
            <img
              src={src}
              alt=""
              className="w-20 h-20 object-cover hover:opacity-90 transition-opacity"
            />
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-[100] bg-[#0d1a0d]/95 flex flex-col items-center justify-center p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Visualização da foto"
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#1f351f] border border-[#2d4a2d] text-[#e8f0e8] text-lg flex items-center justify-center hover:bg-[#2d4a2d] transition-colors z-10"
            aria-label="Fechar"
          >
            ✕
          </button>

          {urls.length > 1 && active > 0 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); goPrev() }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#1f351f]/90 border border-[#2d4a2d] text-[#e8f0e8] text-xl flex items-center justify-center hover:bg-[#2d4a2d] transition-colors z-10"
              aria-label="Foto anterior"
            >
              ‹
            </button>
          )}

          {urls.length > 1 && active < urls.length - 1 && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); goNext() }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#1f351f]/90 border border-[#2d4a2d] text-[#e8f0e8] text-xl flex items-center justify-center hover:bg-[#2d4a2d] transition-colors z-10"
              aria-label="Próxima foto"
            >
              ›
            </button>
          )}

          <img
            src={urls[active]}
            alt=""
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={e => e.stopPropagation()}
          />

          {urls.length > 1 && (
            <p className="absolute bottom-6 text-[#8fac8f] text-sm">
              {active + 1} / {urls.length}
            </p>
          )}
        </div>
      )}
    </>
  )
}
