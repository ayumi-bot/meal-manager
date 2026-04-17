import { supabase } from './supabase'

export async function uploadImage(file: File, path: string): Promise<string | null> {
  const ext = file.name.split('.').pop()
  const fileName = `${path}_${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('images')
    .upload(fileName, file, { upsert: true })

  if (error) {
    console.error('Upload error:', error)
    return null
  }

  const { data } = supabase.storage.from('images').getPublicUrl(fileName)
  return data.publicUrl
}
