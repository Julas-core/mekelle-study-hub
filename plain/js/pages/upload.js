import { supabase } from '../supabase-client.js'

export async function init(){
  const form = document.getElementById('uploadForm')
  if(!form) return

  form.addEventListener('submit', async (e)=>{
    e.preventDefault()
    const filesEl = document.getElementById('files')
    if(!filesEl || !filesEl.files || filesEl.files.length===0){ alert('Select files first'); return }
    if(!supabase){ alert('Supabase not configured'); return }

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if(!user){ alert('Please sign in to upload'); location.hash = '#/auth'; return }

    const files = filesEl.files
    for(const file of files){
      const filePath = `${user.id}/${Date.now()}_${file.name}`
      try{
        const { error: uploadErr } = await supabase.storage.from('course-materials').upload(filePath, file)
        if(uploadErr){ throw uploadErr }
        // Create material record
        await supabase.from('materials').insert({ title: file.name, file_path: filePath, uploaded_by_user_id: user.id })
      }catch(err){
        console.error('upload error', err)
        alert('Failed to upload ' + file.name)
        return
      }
    }
    alert('Upload(s) completed')
    filesEl.value = null
  })
}
