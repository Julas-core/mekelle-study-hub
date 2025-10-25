// Minimal local server for sending email via Resend API.
// Usage: set RESEND_API_KEY env var then run `node index.js` in this folder (Node 18+ required).

import http from 'node:http'
import { URL } from 'node:url'

const PORT = process.env.PORT || 3001
const RESEND_API_KEY = process.env.RESEND_API_KEY // MUST be set in environment

if(!RESEND_API_KEY){
  console.warn('Warning: RESEND_API_KEY is not set. /send-email will return 500 until you set it.')
}

async function handleSendEmail(req, res){
  try{
    let body = ''
    for await (const chunk of req) body += chunk
    const payload = JSON.parse(body || '{}')
    const { to, subject, html } = payload
    if(!to || !subject || !html){
      res.writeHead(400, {'Content-Type':'application/json'})
      res.end(JSON.stringify({ error: 'to, subject and html are required in JSON body' }))
      return
    }

    if(!RESEND_API_KEY){
      res.writeHead(500, {'Content-Type':'application/json'})
      res.end(JSON.stringify({ error: 'Server email API not configured (RESEND_API_KEY missing)' }))
      return
    }

    // Call Resend API
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'no-reply@your-domain.com',
        to: [to],
        subject,
        html
      })
    })

    const data = await r.json()
    if(!r.ok){
      res.writeHead(502, {'Content-Type':'application/json'})
      res.end(JSON.stringify({ error: 'Resend API error', details: data }))
      return
    }

    res.writeHead(200, {'Content-Type':'application/json'})
    res.end(JSON.stringify({ ok: true, result: data }))
  }catch(err){
    console.error('send-email error', err)
    res.writeHead(500, {'Content-Type':'application/json'})
    res.end(JSON.stringify({ error: 'internal server error' }))
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  if(req.method === 'POST' && url.pathname === '/send-email'){
    handleSendEmail(req, res)
    return
  }

  // simple health
  if(req.method === 'GET' && url.pathname === '/'){
    res.writeHead(200, {'Content-Type':'application/json'})
    res.end(JSON.stringify({ ok: true }))
    return
  }

  res.writeHead(404, {'Content-Type':'application/json'})
  res.end(JSON.stringify({ error: 'not found' }))
})

server.listen(PORT, () => {
  console.log(`Resend demo server listening on http://localhost:${PORT}`)
})
