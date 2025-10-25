import { initMaterialsGrid, searchMaterialsClient } from './materials-grid.js'

const searchInput = document.getElementById('searchInput')
const searchBtn = document.getElementById('searchBtn')

// Initialize the materials area (will fetch from Supabase if configured)
window.addEventListener('DOMContentLoaded', async () => {
  await initMaterialsGrid()
})

// Simple search that delegates to materials-grid's client-side filter helper
searchBtn.addEventListener('click', ()=>{
  const q = searchInput.value.trim()
  searchMaterialsClient(q)
})
