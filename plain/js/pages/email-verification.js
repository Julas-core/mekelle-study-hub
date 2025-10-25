import { supabase } from '../supabase-client.js'

export async function init(){
  const container = document.querySelector('.content-block')
  if(!container) return
  container.innerHTML = '<h1>Email Verification</h1><p>Verifying…</p>'

  // token can be in the hash: #/verify-email?token=XYZ
  const hash = window.location.hash || ''
  const q = hash.split('?')[1] || ''
  const params = new URLSearchParams(q)
  const token = params.get('token')

  if(!token){
    container.innerHTML = '<h1>Email Verification</h1><p>No token provided.</p>'
    return
  }

  // In this scaffold we just show success (the real app would call a backend)
  try{
    // If you had a backend endpoint, call it here. For demo, simulate delay.
    await new Promise(r => setTimeout(r, 800))
    container.innerHTML = '<h1>Email Verification</h1><p>Your email has been verified. You can now sign in.</p>'
  }catch(err){
    container.innerHTML = '<h1>Email Verification</h1><p>Verification failed.</p>'
  }
}
