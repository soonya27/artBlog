const CLOUDINARY_PREFIX = 'cloudinary:'
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

export function collectPostImagePaths(post) {
  if (!post) return []
  const paths = []

  if (post.image_path) paths.push(post.image_path)

  if (Array.isArray(post.slider_images)) {
    for (const item of post.slider_images) {
      if (item?.path) paths.push(item.path)
    }
  }

  if (post.content && cloudName) {
    paths.push(...extractCloudinaryPathsFromHtml(post.content))
  }

  return Array.from(new Set(paths))
}

function extractCloudinaryPathsFromHtml(html) {
  const out = []
  const re = /<img[^>]+src=["']([^"']+)["']/gi
  let m
  while ((m = re.exec(html))) {
    const id = cloudinaryUrlToPublicId(m[1])
    if (id) out.push(`${CLOUDINARY_PREFIX}${id}`)
  }
  return out
}

function cloudinaryUrlToPublicId(url) {
  const prefix = `https://res.cloudinary.com/${cloudName}/image/upload/`
  if (!url.startsWith(prefix)) return null

  const tail = url.slice(prefix.length).split('?')[0].split('#')[0]
  const segs = tail.split('/')

  while (segs.length > 0 && (segs[0].includes(',') || /^v\d+$/.test(segs[0]))) {
    segs.shift()
  }
  if (segs.length === 0) return null

  const last = segs[segs.length - 1]
  const dot = last.lastIndexOf('.')
  if (dot >= 0) segs[segs.length - 1] = last.slice(0, dot)

  return segs.join('/')
}
