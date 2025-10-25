import { supabase } from '../supabase-client.js'

export async function init(){
  const container = document.querySelector('.content-block')
  if(!container) return
  container.innerHTML = '<h1>Admin Dashboard (Demo)</h1><p>Loading…</p>'
  if(!supabase){ container.innerHTML = '<p>Supabase not configured</p>'; return }

  try{
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if(!user){ container.innerHTML = '<p>Please <a href="#/auth">sign in</a> to access admin dashboard.</p>'; return }

    // Check admin flag in profiles table
    const { data: profile } = await supabase.from('profiles').select('is_admin,full_name').eq('id', user.id).single()
    if(!profile || !profile.is_admin){ container.innerHTML = '<p>Access denied: admin only.</p>'; return }

    const [{ count: materialsCount }, { count: usersCount }] = await Promise.all([
      supabase.rpc('count_table_rows', { table_name: 'materials' }).catch(()=>({ count: null })),
      supabase.rpc('count_table_rows', { table_name: 'profiles' }).catch(()=>({ count: null })),
    ])

    container.innerHTML = `
      <h1>Admin Dashboard</h1>
      <div class="grid" style="grid-template-columns:repeat(2,1fr);gap:12px;">
        <div class="card"><h4>Total Materials</h4><p>${materialsCount ?? 'N/A'}</p></div>
        <div class="card"><h4>Total Users</h4><p>${usersCount ?? 'N/A'}</p></div>
      </div>
    `
  }catch(err){
    console.error(err)
    container.innerHTML = '<p>Error loading admin dashboard.</p>'
  }
}
