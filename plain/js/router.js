const ROUTES = {
  '/': 'pages/index.html',
  '/about': 'pages/about.html',
  '/contact': 'pages/contact.html',
  '/help': 'pages/help.html',
  '/terms': 'pages/terms.html',
  '/privacy': 'pages/privacy.html',
  '/auth': 'pages/auth.html',
  '/register': 'pages/register.html',
  '/profile': 'pages/profile.html',
  '/upload': 'pages/upload.html',
  '/admin': 'pages/admin.html',
  '/verify-email': 'pages/email-verification.html',
}

const appEl = document.getElementById('app')

async function loadRoute(path){
  const route = ROUTES[path] || 'pages/404.html'
  try{
    const res = await fetch(route)
    if(!res.ok){
      appEl.innerHTML = '<p style="color:#ef4444">Failed to load page</p>'
      return
    }
    const html = await res.text()
    appEl.innerHTML = html
  }catch(e){
    console.error('Router fetch error', e)
    appEl.innerHTML = '<p style="color:#ef4444">Failed to load page</p>'
  }
}

function parseHash(){
  const hash = location.hash || '#/'
  // support #/path and #/path?query
  const path = hash.replace(/^#/, '').split('?')[0]
  return path
}

window.addEventListener('hashchange', ()=>{
  const path = parseHash()
  loadRoute(path)
})

window.addEventListener('DOMContentLoaded', ()=>{
  const path = parseHash()
  loadRoute(path)
})
