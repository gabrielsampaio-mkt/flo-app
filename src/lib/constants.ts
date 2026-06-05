export const FASE_LABEL: Record<string, string> = {
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

export const FORUM_CATEGORIAS = [
  {
    slug: 'clinica_flo',
    emoji: '🏥',
    nome: 'Clínica Flô',
    descricao: 'Socorro, o que minha planta tem?',
  },
  {
    slug: 'cacadores_terpenos',
    emoji: '🧬',
    nome: 'Caçadores de Terpenos',
    descricao: 'Reviews de strains e genéticas',
  },
  {
    slug: 'mostra_seu_canto',
    emoji: '🏡',
    nome: 'Mostra o Seu Canto',
    descricao: 'Setups, estruturas e grows',
  },
  {
    slug: 'cultura_reducao_danos',
    emoji: '🌍',
    nome: 'Cultura & Redução de Danos',
    descricao: 'Notícias, legislação e harm reduction',
  },
  {
    slug: 'papo_laricas',
    emoji: '💬',
    nome: 'Papo de Lariça',
    descricao: 'Bate-papo geral da comunidade',
  },
] as const

export type ForumCategoria = (typeof FORUM_CATEGORIAS)[number]['slug']

export function getCategoria(slug: string) {
  return FORUM_CATEGORIAS.find(c => c.slug === slug)
}

export function formatMembroNumero(num: number | null | undefined) {
  if (!num) return null
  return `Flô #${String(num).padStart(4, '0')}`
}
