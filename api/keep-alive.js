import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'server env not configured' })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { error } = await supabase.from('site_settings').select('id').limit(1)
  if (error) return res.status(500).json({ ok: false, error: error.message })

  return res.status(200).json({ ok: true, at: new Date().toISOString() })
}
