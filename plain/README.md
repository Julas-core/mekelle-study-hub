# Plain HTML/CSS/JS scaffold for Mekelle Study Hub

This folder (`plain/`) contains a minimal vanilla-JS scaffold that reproduces the basic UI layout of the React app in a plain HTML/CSS/JS form. It's intended as a lightweight starting point to prototype or migrate pages.

Files created:
- `index.html` — main single-file page (SPA-like). Contains header, hero, search, and materials grid.
- `css/style.css` — minimal styles.
- `js/config.js` — place public keys here (see notes).
- `js/supabase-client.js` — small wrapper that creates a Supabase client from `CONFIG` using CDN ESM.
- `js/app.js` — app logic: renders sample cards, simple search, and a stub to fetch from a `materials` table if Supabase keys are set.

Important notes
- DO NOT put server-only secrets (Resend API key, Supabase service_role key) into `js/config.js` or any client file. Those must stay on a backend.
- It's OK to add the Supabase public (anon) key and URL to `js/config.js` for client-side features. If you want to connect to your existing Supabase project copy the `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from your `.env`.

How to run
- The simplest: open `plain/index.html` in a browser. For module imports to work reliably, run a tiny local server (recommended):

  # PowerShell example
  python -m http.server 5173

  Or use `npx http-server` or `bun run` depending on your environment.

Then open http://localhost:5173/plain/index.html

Server (Resend) example

- A tiny server is provided at `plain/server/index.js` which demonstrates how to send emails using Resend from a secure server-side environment. Do NOT put your Resend API key in the client.

Steps:

1. Set the `RESEND_API_KEY` environment variable locally. In PowerShell:

```pwsh
$env:RESEND_API_KEY = 're_...'
```

2. Run the server (Node 18+ recommended):

```pwsh
# from plain/server
node index.js
```

3. Call the endpoint from your client or curl:

```pwsh
curl -X POST http://localhost:3001/send-email -H "Content-Type: application/json" -d '{"to":"you@example.com","subject":"Test","html":"<p>Hello</p>"}'
```

The server will forward the request to Resend using the `RESEND_API_KEY` from the environment and return the API response.

Routes available in the plain scaffold
- `/` — Home (index)
- `/about` — About page
- `/contact` — Contact form (posts to local demo server if available)
- `/help` — Help / FAQ
- `/terms` — Terms of service
- `/privacy` — Privacy policy
- `/auth` — Sign in
- `/register` — Register page
- `/profile` — User profile (requires sign-in)
- `/upload` — Upload materials (requires sign-in)
- `/admin` — Admin dashboard (requires profile.is_admin)
- `/verify-email` — Email verification page (token via query string)

Open these via the hash routes, e.g. `http://localhost:5173/plain/index.html#/upload`.

Next steps / migration tips
- Port one page at a time. Use `js/app.js` as the starting point and progressively replicate components.
- Move server work (email sending, tokens, service_role actions) to serverless functions or an API; call them from this client scaffold.
- If the app grows, consider using ES modules + a build step (Vite/ESBuild) or Web Components for better structure.

