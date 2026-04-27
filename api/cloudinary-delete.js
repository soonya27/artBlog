import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'method not allowed' })
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  if (!cloudName || !apiKey || !apiSecret || !supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'server env not configured' })
  }

  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: 'unauthorized' })

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data: { user }, error: userErr } = await supabase.auth.getUser(token)
  if (userErr || !user) return res.status(401).json({ error: 'unauthorized' })

  const publicIds = Array.isArray(req.body?.publicIds)
    ? req.body.publicIds.filter((id) => typeof id === 'string' && id.length > 0)
    : []
  if (publicIds.length === 0) return res.status(200).json({ results: [] })

  const results = []
  for (const publicId of publicIds) {
    const timestamp = Math.floor(Date.now() / 1000)
    const sigStr = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
    const signature = crypto.createHash('sha1').update(sigStr).digest('hex')

    const form = new URLSearchParams()
    form.append('public_id', publicId)
    form.append('timestamp', String(timestamp))
    form.append('api_key', apiKey)
    form.append('signature', signature)

    const r = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: form,
    })
    const json = await r.json().catch(() => ({}))
    results.push({ publicId, ok: r.ok, result: json.result ?? null })
  }

  return res.status(200).json({ results })
}
