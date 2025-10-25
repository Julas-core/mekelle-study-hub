import { supabase } from '../supabase-client.js'

export async function init(){
  const area = document.getElementById('profileArea')
  if(!area) return
  area.textContent = 'Loading profile…'
  if(!supabase){ area.textContent = 'Supabase not configured'; return }

  try{
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if(!user){
      area.innerHTML = '<p>Please <a href="#/auth">sign in</a> to view your profile.</p>'
      return
    }

    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if(error){
      console.warn('profile fetch error', error)
    }

    const fullName = data?.full_name || user.email.split('@')[0] || ''
    const email = user.email

    area.innerHTML = `
      <form id="profileForm">
        <label>Full name</label>
        <input name="full_name" value="${escapeHtml(fullName)}" />
        <label>Email</label>
        <input name="email" value="${escapeHtml(email)}" disabled />
        <div style="margin-top:8px"><button type="submit">Save</button></div>
      </form>
      <div id="profileMsg" style="margin-top:8px;color:#6b7280"></div>
    `

    const form = document.getElementById('profileForm')
    form.addEventListener('submit', async (e)=>{
      e.preventDefault()
      const fd = new FormData(form)
      const payload = Object.fromEntries(fd.entries())
      try{
        const { error } = await supabase.from('profiles').upsert({ id: user.id, full_name: payload.full_name })
        const msg = document.getElementById('profileMsg')
        if(error){ msg.textContent = 'Update failed: ' + (error.message || error); return }
        msg.textContent = 'Profile updated.'
      }catch(err){
        document.getElementById('profileMsg').textContent = 'Update failed.'
      }
    })
  }catch(err){
    console.error(err)
    area.textContent = 'Failed to load profile.'
  }
}

function escapeHtml(str){
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')
}
