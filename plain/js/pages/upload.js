import { supabase } from '../supabase-client.js'

let fileEntries = [] // { file, title, course, dept, school, progress }

export async function init(){
  const form = document.getElementById('uploadForm')
  const filesEl = document.getElementById('files')
  const filesList = document.getElementById('filesList')
  if(!form || !filesEl || !filesList) return

  filesEl.addEventListener('change', ()=>{
    fileEntries = Array.from(filesEl.files).map(f => ({ file: f, title: f.name, course: '', dept: '', school: '', progress: 0 }))
    renderFilesList()
  })

  form.addEventListener('submit', async (e)=>{
    e.preventDefault()
    if(fileEntries.length === 0){ alert('No files selected'); return }
    if(!supabase){ alert('Supabase not configured'); return }

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if(!user){ alert('Please sign in to upload'); location.hash = '#/auth'; return }

    for(const entry of fileEntries){
      // simple validation
      if(!entry.title || !entry.course){
        alert('Please provide title and course for all files before uploading')
        return
      }

      const filePath = `${user.id}/${Date.now()}_${entry.file.name}`
      try{
        // upload to Supabase storage
        const { error: uploadErr } = await supabase.storage.from('course-materials').upload(filePath, entry.file)
        if(uploadErr){ throw uploadErr }

        // insert metadata record
        const { error: insertErr } = await supabase.from('materials').insert({
          title: entry.title,
          description: entry.description || '',
          department: entry.dept || '',
          course: entry.course,
          file_type: entry.file.name.split('.').pop(),
          file_path: filePath,
          uploaded_by_user_id: user.id
        })
        if(insertErr) throw insertErr

      }catch(err){
        console.error('upload error', err)
        alert('Failed to upload ' + entry.file.name + ': ' + (err.message || err))
        return
      }
    }

    alert('All uploads completed')
    filesEl.value = null
    fileEntries = []
    renderFilesList()
  })
}

function renderFilesList(){
  const filesList = document.getElementById('filesList')
  filesList.innerHTML = ''
  if(!fileEntries || fileEntries.length===0){ filesList.innerHTML = '<p class="muted">No files selected</p>'; return }

  fileEntries.forEach((entry, idx) => {
    const item = document.createElement('div')
    item.className = 'file-item'

    const meta = document.createElement('div')
    meta.className = 'meta'
    meta.innerHTML = `
      <div style="font-weight:600">${escapeHtml(entry.file.name)}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px">
        <input data-idx="${idx}" data-field="title" value="${escapeHtml(entry.title)}" placeholder="Title" />
        <input data-idx="${idx}" data-field="course" value="${escapeHtml(entry.course)}" placeholder="Course code" />
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px">
        <input data-idx="${idx}" data-field="school" value="${escapeHtml(entry.school)}" placeholder="School" />
        <input data-idx="${idx}" data-field="dept" value="${escapeHtml(entry.dept)}" placeholder="Department" />
      </div>
      <div style="margin-top:6px"><button data-action="generate" data-idx="${idx}">Generate metadata</button> <button data-action="remove" data-idx="${idx}">Remove</button></div>
      <div style="margin-top:8px"><div class="file-progress"><i style="width:${entry.progress}%"></i></div></div>
    `

    item.appendChild(meta)
    filesList.appendChild(item)
  })

  // attach events
  filesList.querySelectorAll('input[data-idx]').forEach(inp => {
    inp.addEventListener('input', (e)=>{
      const el = e.target
      const idx = Number(el.dataset.idx)
      const field = el.dataset.field
      fileEntries[idx][field] = el.value
    })
  })

  filesList.querySelectorAll('button[data-action]')?.forEach(btn => {
    btn.addEventListener('click', async (e)=>{
      const action = btn.dataset.action
      const idx = Number(btn.dataset.idx)
      if(action === 'remove'){
        fileEntries.splice(idx,1)
        renderFilesList()
      }else if(action === 'generate'){
        // simulate AI metadata generation
        btn.textContent = 'Generating...'
        btn.disabled = true
        await new Promise(r=>setTimeout(r,800))
        const entry = fileEntries[idx]
        entry.title = entry.title || entry.file.name.replace(/\.[^.]+$/, '')
        entry.course = entry.course || 'UNKNOWN101'
        entry.dept = entry.dept || 'General'
        entry.school = entry.school || 'All Schools'
        entry.progress = 20
        renderFilesList()
      }
    })
  })
}

function escapeHtml(str){
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')
}
