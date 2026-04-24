# Mind Over Admin

A Next.js 16 admin dashboard for the Mind Over backend. Uses a secure
Backend-for-Frontend (BFF) pattern: the browser only talks to our Next.js
route handlers, and the real backend token lives in an httpOnly cookie.

## Quick start

```bash
npm install
npm run dev
# open http://localhost:3000
```

Default credentials (from your Postman collection):

- email: `jack@yopmail.com`
- password: `12345678`

## Configuration

All API config lives in `.env.local` (not committed):

```
MINDOVER_API_BASE_URL=http://mindover.prodservers.com:9000
MINDOVER_API_VERSION=/api/v1
ADMIN_SESSION_COOKIE=mo_admin_session
```

Change `MINDOVER_API_BASE_URL` to point at a different environment (e.g.
your dev tunnel).

## Project layout

```
app/
  layout.js                # root layout
  globals.css              # all styles
  login/page.js            # /login
  (admin)/                 # route group (no URL segment)
    layout.js              # admin shell (sidebar + topbar) + auth gate
    page.js                # /        -> Dashboard
    users/page.js          # /users   -> (demo data, needs admin list endpoint)
    profile/page.js        # /profile -> POST /user/profile
    settings/page.js       # /settings -> notifications + delete account
  api/                     # BFF proxy routes (browser calls these)
    auth/login/route.js    # POST /auth/login + sets httpOnly cookie
    auth/logout/route.js   # clears cookie
    auth/me/route.js       # returns decoded JWT payload
    profile/route.js       # -> POST /user/profile
    notifications/route.js # -> POST /user/notification-toggle
    account/route.js       # -> POST /user/delete-account
components/
  AdminShell.js            # sidebar + topbar component
lib/
  backend.js               # server-side fetch wrapper (base URL + bearer)
  session.js               # cookie + JWT helpers
proxy.js                   # auth gate (Next.js 16 middleware equivalent)
```

## API wiring status

| Wired              | Endpoint                                |
| ------------------ | --------------------------------------- |
| Login              | `POST /api/v1/auth/login`               |
| Profile upsert     | `POST /api/v1/user/profile`             |
| Notification toggle| `POST /api/v1/user/notification-toggle` |
| Delete account     | `POST /api/v1/user/delete-account`      |

### Not yet wired (backend needs to provide)

| Page   | Endpoint required        |
| ------ | ------------------------ |
| Users  | `GET /api/v1/admin/users` (list) |

If the exact paths differ from the above, update the single string in
the corresponding file under `app/api/*/route.js` — everything else
(auth header, base URL, error handling) is already in place.

## Security notes

- The backend bearer token is stored in a secure httpOnly cookie
  (`mo_admin_session`). It is never exposed to client-side JavaScript.
- All backend calls go through Next.js server route handlers, which
  attach `Authorization: Bearer <token>` automatically.
- `proxy.js` gates every page: unauthenticated users are redirected to
  `/login`; authenticated users hitting `/login` go straight to the
  dashboard.
