## Mind Over Admin

A Next.js 16 admin dashboard for the Mind Over backend. Uses a secure Backend-for-Frontend (BFF) pattern: the browser only talks to our Next.js route handlers, and the real backend admin JWT lives in an httpOnly cookie.

### Quick start (local)

```bash
npm install
npm run dev
# open http://localhost:3000
```

### Configuration

Create a local `.env` (not committed). Example:

```bash
# Backend origin (no trailing slash)
MINDOVER_API_BASE_URL=http://mindover.prodservers.com:9000
MINDOVER_API_VERSION=/api/v1

# Used only for /auth/login pre-auth header
MINDOVER_INITIAL_TOKEN=paste-initial-token-from-postman-env
MINDOVER_DEVICE_TOKEN=paste-device-token-from-postman-env

# Cookie used to store admin JWT
ADMIN_SESSION_COOKIE=mo_admin_session
```

#### Audio/voice proxy (affirmations playback)

Some voice URLs come as **path-only** (e.g. `/uploads/...`) or require auth. The admin UI proxies these through:

- `GET /api/admin/affirmation-voice?path=/uploads/...`

If your backend returns full URLs on the **same host** as `MINDOVER_API_BASE_URL`, the proxy will be used automatically. For other hosts (CDNs), the browser will try to play them directly.

### Project layout

```text
app/
  (admin)/                 # admin routes (no URL segment)
  api/                     # BFF proxy routes (browser calls these)
components/
lib/
proxy.js                   # auth gate (middleware)
```

### Notes for cPanel/shared hosting

Many shared hosts do not have enough RAM to run `next build` server-side. In that case:

- build on your PC (`npm run build`)
- upload the `.next` folder
- run in production via your Node app manager (Passenger / Setup Node.js App)

