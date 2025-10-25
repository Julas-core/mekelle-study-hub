import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { CONFIG } from './config.js'

// If CONFIG is not filled, we export a null client and keep functions guarded.
export const supabase = (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY)
  ? createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
  : null

export function isSupabaseReady(){
  return !!supabase
}
