import { supabase } from './supabase'

const CLOUDINARY_PREFIX = 'cloudinary:'
const SUPABASE_BUCKET = 'artblog-images'

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

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

function withAutoOptimize(secureUrl) {
  if (typeof secureUrl !== 'string') return secureUrl
  return secureUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto/')
}

export async function uploadImageToStorage(file, folder = 'posts') {
  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary 환경변수(VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_UPLOAD_PRESET)가 설정되지 않았습니다.')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', `artblog/${folder}`)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.error?.message || `이미지 업로드 실패 (${res.status})`)
  }

  const data = await res.json()
  return {
    url: withAutoOptimize(data.secure_url),
    path: `${CLOUDINARY_PREFIX}${data.public_id}`,
  }
}

export async function removeImages(paths) {
  const list = (Array.isArray(paths) ? paths : [paths]).filter(Boolean)
  if (list.length === 0) return

  const supabasePaths = list.filter((p) => !p.startsWith(CLOUDINARY_PREFIX))
  const cloudinaryIds = list
    .filter((p) => p.startsWith(CLOUDINARY_PREFIX))
    .map((p) => p.slice(CLOUDINARY_PREFIX.length))

  if (supabasePaths.length > 0) {
    await supabase.storage.from(SUPABASE_BUCKET).remove(supabasePaths)
  }

  if (cloudinaryIds.length > 0) {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) {
      console.warn('Cloudinary 삭제 건너뜀: 인증 세션 없음')
      return
    }
    const res = await fetch('/api/cloudinary-delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ publicIds: cloudinaryIds }),
    })
    if (!res.ok) {
      const detail = await res.json().catch(() => ({}))
      console.warn('Cloudinary 이미지 삭제 일부 실패:', detail)
    }
  }
}
