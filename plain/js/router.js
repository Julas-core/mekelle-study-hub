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
    // Try to run page-specific module: e.g. for "/profile" import ./pages/profile.js
    try{
      await runPageModule(path)
    }catch(err){
      // non-fatal
      // console.debug('No page module for', path)
    }
    // update active nav link
    try{
      const navLinks = document.querySelectorAll('.nav a')
      navLinks.forEach(a => {
        const href = a.getAttribute('href') || ''
        const linkPath = href.replace(/^#/, '') || '/'
        if(linkPath === path) a.classList.add('active')
        else a.classList.remove('active')
      })
    }catch(e){/* ignore */}
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

async function runPageModule(path){
  // normalize root
  const normalized = path === '/' ? '/index' : path
  const modulePath = `./pages${normalized}.js`
  try{
    const mod = await import(modulePath)
    if(mod && typeof mod.init === 'function'){
      await mod.init()
    }
  }catch(err){
    // ignore missing module
    // console.debug('runPageModule', modulePath, err.message)
  }
}
