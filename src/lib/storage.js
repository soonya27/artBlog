import { supabase } from './supabase'

export function validateImageFile(file, maxSizeMb = 10) {
  if (!file) {
    return '파일을 선택해주세요.'
  }

  if (!file.type.startsWith('image/')) {
    return '이미지 파일만 업로드 가능합니다.'
  }

  if (file.size > maxSizeMb * 1024 * 1024) {
    return `파일 크기는 ${maxSizeMb}MB 이하여야 합니다.`
  }

  return null
}

export async function uploadImageToStorage(file, folder = 'posts') {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const path = `${folder}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from('artblog-images')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) throw error

  const { data } = supabase.storage.from('artblog-images').getPublicUrl(path)
  return { url: data.publicUrl, path }
}
