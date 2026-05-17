import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'não autenticado' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('foto') as File | null
  const cultivoId = formData.get('cultivoId') as string | null

  if (!file) {
    return NextResponse.json({ error: 'nenhum arquivo enviado' }, { status: 400 })
  }
  if (!cultivoId) {
    return NextResponse.json({ error: 'cultivoId obrigatório' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  const semExif = await sharp(buffer)
    .rotate()
    .webp({ quality: 80 })
    .toBuffer()

  const filename = `${user.id}/${cultivoId}/${Date.now()}.webp`
  const { data, error } = await supabase.storage
    .from('fotos-cultivo')
    .upload(filename, semExif, { contentType: 'image/webp', upsert: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ path: data.path })
}
