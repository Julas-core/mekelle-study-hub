import { supabase, isSupabaseReady } from './supabase-client.js'

const materialsContainer = document.getElementById('materialsGrid')

const SAMPLE_MATERIALS = [
  { id:1, title: 'Calculus I - Lecture Notes', author: 'Dr. A. Gebremedhin', dept: 'Mathematics', summary: 'Limits, derivatives, integrals.'},
  { id:2, title: 'Intro to Algorithms - Past Exam', author: 'Prof. K. Tadesse', dept: 'Computer Science', summary: 'Past midterm and final with solutions.'},
  { id:3, title: 'Organic Chemistry Lab Report', author: 'Ass. L. Mekonnen', dept: 'Chemistry', summary: 'Lab notebook and analysis.'}
]

let currentMaterials = []

function escapeHtml(str){
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function createCard(mat){
  const el = document.createElement('div')
  el.className = 'card'
  el.innerHTML = `<h4>${escapeHtml(mat.title)}</h4><p>${escapeHtml(mat.summary)}</p><p style="margin-top:.5rem;color:#374151;font-size:.85rem">${escapeHtml(mat.author)} • ${escapeHtml(mat.dept)}</p>`
  return el
}

function renderMaterials(materials){
  currentMaterials = materials || []
  materialsContainer.innerHTML = ''

  if(!currentMaterials || currentMaterials.length === 0){
    materialsContainer.innerHTML = '<p style="color:#6b7280">No materials found.</p>'
    return
  }

  const countEl = document.getElementById('materials-count')
  if(countEl) countEl.textContent = `${currentMaterials.length} ${currentMaterials.length ===1 ? 'material' : 'materials'} found`

  const listWrap = document.createElement('div')
  listWrap.className = 'grid'
  currentMaterials.forEach(m => listWrap.appendChild(createCard(m)))
  materialsContainer.appendChild(listWrap)
}

async function fetchMaterialsFromSupabase(){
  if(!isSupabaseReady()) return SAMPLE_MATERIALS
  try{
    const { data, error } = await supabase.from('materials').select('*').order('created_at', {ascending:false}).limit(50)
    if(error){
      console.warn('Supabase fetch error:', error)
      return SAMPLE_MATERIALS
    }
    return data || SAMPLE_MATERIALS
  }catch(e){
    console.warn(e)
    return SAMPLE_MATERIALS
  }
}

export async function initMaterialsGrid(){
  // show loading state
  materialsContainer.innerHTML = '<p style="color:#6b7280">Loading materials…</p>'
  try{
    const items = await fetchMaterialsFromSupabase()
    renderMaterials(items)
  }catch(e){
    materialsContainer.innerHTML = '<p style="color:#ef4444">Failed to load materials.</p>'
    console.error(e)
  }
}

// Simple client-side search helper used by app.js
export function searchMaterialsClient(query){
  const q = String(query || '').trim().toLowerCase()
  if(!q){ renderMaterials(currentMaterials.length ? currentMaterials : SAMPLE_MATERIALS); return }
  const filtered = (currentMaterials.length ? currentMaterials : SAMPLE_MATERIALS).filter(m => {
    return (m.title + ' ' + (m.summary || '') + ' ' + (m.author || '') + ' ' + (m.dept || '')).toLowerCase().includes(q)
  })
  renderMaterials(filtered)
}
