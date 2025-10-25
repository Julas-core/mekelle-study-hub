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
      <section style="margin-top:16px">
        <h2>Recent Materials</h2>
        <div id="adminMaterialsList">Loading...</div>
      </section>
    `
    // render recent materials list
    renderMaterialsList(container)
  }catch(err){
    console.error(err)
    container.innerHTML = '<p>Error loading admin dashboard.</p>'
  }
}

async function renderMaterialsList(container){
  const listEl = container.querySelector('#adminMaterialsList')
  if(!listEl) return
  listEl.textContent = 'Loading materials...'

  try{
    const { data: materials } = await supabase.from('materials').select('*').order('created_at', { ascending: false }).limit(20)
    if(!materials || materials.length===0){ listEl.innerHTML = '<p class="muted">No recent materials</p>'; return }

    listEl.innerHTML = ''
    for(const m of materials){
      const item = document.createElement('div')
      item.className = 'card'
      item.style.marginBottom = '8px'
      item.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:600">${escapeHtml(m.title || 'Untitled')}</div>
            <div class="muted">${escapeHtml(m.course || '')} • ${escapeHtml(m.department || '')}</div>
          </div>
          <div style="display:flex;gap:8px">
            <button data-action="approve" data-id="${m.id}">Approve</button>
            <button data-action="reject" data-id="${m.id}">Reject</button>
          </div>
        </div>
      `
      listEl.appendChild(item)
    }

    // attach actions
    listEl.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', async (e)=>{
        const id = btn.dataset.id
        const action = btn.dataset.action
        if(action === 'approve') await updateMaterialStatus(id, 'approved')
        else if(action === 'reject') await updateMaterialStatus(id, 'rejected')
        // refresh
        renderMaterialsList(container)
      })
    })
  }catch(err){
    console.error(err)
    listEl.innerHTML = '<p class="muted">Failed to load materials</p>'
  }
}

async function updateMaterialStatus(id, status){
  try{
    const { error } = await supabase.from('materials').update({ status }).eq('id', id)
    if(error) throw error
    alert('Material ' + status)
  }catch(err){
    console.error(err)
    alert('Failed to update status: ' + (err.message || err))
  }
}

export async function grantAdmin(userId){
  try{
    const { error } = await supabase.from('user_roles').insert([{ user_id: userId, role: 'admin' }])
    if(error){
      // try update if duplicate
      if(error.code === '23505'){
        await supabase.from('user_roles').update({ role: 'admin' }).eq('user_id', userId)
      }else{
        throw error
      }
    }
    alert('Granted admin to user')
  }catch(err){
    console.error(err)
    alert('Failed to grant admin: ' + (err.message || err))
  }
}

function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
