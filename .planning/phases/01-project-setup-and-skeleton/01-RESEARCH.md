# Technical Research Report: Phase 1 - Project Setup and Skeleton

**Output Destination:** `.planning/phases/01-project-setup-and-skeleton/01-RESEARCH.md`

---

## 1. Overview & Scope
Phase 1 establishes the baseline monorepo architecture, initializing a Django REST API backend and a Vite React SPA frontend. It configures database persistence via Neon PostgreSQL, sets up continuous deployment to Render (Backend) and Vercel (Frontend), and provides skeleton navigation pages and API health check endpoints to verify end-to-end integration.

---

## 2. Monorepo Repository Structure
The repository follows a clean 2-folder structure without complex monorepo tooling:
```
.
├── backend/                  # Django project root
│   ├── manage.py
│   ├── requirements.txt
│   ├── render.yaml           # Render deployment configuration / blueprint
│   ├── core/                 # Django settings package (settings.py, urls.py, wsgi.py)
│   └── api/                  # Django app for endpoints (views.py, urls.py)
├── frontend/                 # Vite React project root
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json           # Vercel SPA routing rewrite config
│   ├── index.html
│   └── src/
│       ├── components/       # Common UI (Header, Navigation, Layout)
│       ├── pages/            # Skeleton pages (PlannerPage, LogsPage)
│       ├── services/         # API HTTP client (api.js / axios instance)
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css         # Global Vanilla CSS styling
└── .planning/                # Project documentation and phase specs
```

---

## 3. Backend Technical Architecture (Django + DRF)

### 3.1 Dependencies
- **Core Framework**: `Django` (v5.x), `djangorestframework`
- **Database Driver & Parser**: `psycopg2-binary` (or `psycopg[binary]`), `dj-database-url`
- **CORS Handling**: `django-cors-headers`
- **Production Web Server**: `gunicorn`
- **Environment & Static Handling**: `python-dotenv`, `whitenoise`

### 3.2 Configuration Standards
- **Settings Package (`core/settings.py`)**:
  - `SECRET_KEY`: Managed via environment variable `SECRET_KEY`.
  - `DEBUG`: Controlled by environment variable `DEBUG` (defaults to `False` in production).
  - `ALLOWED_HOSTS`: Configured via environment variable (e.g. `['*.onrender.com', 'localhost', '127.0.0.1']`).
  - `DATABASES`: Configured dynamically using `dj-database-url.parse(os.getenv('DATABASE_URL'))`. Note: Neon PostgreSQL requires SSL mode (`ssl_require=True` or `sslmode=require`).
  - `INSTALLED_APPS`: Must include `'rest_framework'`, `'corsheaders'`, and `'api'`.
  - `MIDDLEWARE`: `corsheaders.middleware.CorsMiddleware` **MUST** be placed before `django.middleware.common.CommonMiddleware`. `whitenoise.middleware.WhiteNoiseMiddleware` included for static asset handling if needed.

### 3.3 Health Check API
- Endpoint: `GET /api/health/`
- Target response: `{"status": "ok", "database": "connected", "timestamp": "<ISO_TIMESTAMP>"}`
- Purpose: Sanity check for frontend connection, CORS headers verification, and database latency/status verification.

---

## 4. Frontend Technical Architecture (React + Vite)

### 4.1 Dependencies & Setup
- **Core Framework**: React 18 / 19 via Vite (`npm create vite@latest frontend -- --template react`)
- **Routing**: `react-router-dom` (v6)
- **HTTP Client**: `axios` or native `fetch` wrapper
- **Styling**: Vanilla CSS (modular design token variables in `index.css`)

### 4.2 API Client Architecture (`src/services/api.js`)
- Uses `import.meta.env.VITE_API_BASE_URL` as base URL with fallback to `http://localhost:8000`.
- Includes status/timeout handling for backend cold-start detection (Render free tier latency).

### 4.3 Skeleton Page Architecture
- **Navbar / Header Component**: Persistent branding and route links (`/` for Route Planner, `/logs` for Log Sheets).
- **Planner Page Skeleton**: Container ready for Phase 2 Form & Leaflet map component.
- **Logs Page Skeleton**: Container ready for Phase 4 ELD Log Sheet drawing component.

---

## 5. Deployment Infrastructure & Pipeline

### 5.1 Backend (Render + Neon PostgreSQL)
- **Database**: Neon Serverless Postgres instance configured via `DATABASE_URL` (requires `sslmode=require`).
- **Render Web Service Settings**:
  - Build Command: `pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate`
  - Start Command: `gunicorn core.wsgi:application`
  - Required Environment Variables:
    - `SECRET_KEY`
    - `DEBUG` (`False`)
    - `DATABASE_URL`
    - `ALLOWED_HOSTS` (`.onrender.com`)
    - `CORS_ALLOWED_ORIGINS` (Vercel domain URL, e.g., `https://spotter-frontend.vercel.app`)

### 5.2 Frontend (Vercel)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_BASE_URL` (Render backend URL, e.g., `https://spotter-backend.onrender.com`)
- **Routing Rewrite (`vercel.json`)**:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

---

## 6. Technical Risks & Constraints

1. **Render Free Tier Spin-Down (Cold Start Delay)**:
   - Render web services go to sleep after 15 minutes of inactivity. Initial request to backend can take 30–50 seconds.
   - *Mitigation in Phase 1*: Frontend health check service should display a user-friendly loading state ("Waking up server...") during cold starts.

2. **Neon Postgres SSL Mode Enforcement**:
   - Neon requires SSL connections. Standard `dj-database-url` calls without SSL parameters fail with connection errors.
   - *Mitigation*: Ensure `ssl_require=True` is set in `dj_database_url.config(conn_max_age=600, ssl_require=True)` or `sslmode=require` is present in `DATABASE_URL`.

3. **CORS Configuration Ordering**:
   - Django `corsheaders` middleware position is strict. Placing it below `CommonMiddleware` results in silent CORS pre-flight failures on cross-origin React calls.

4. **Vite Environment Variable Naming**:
   - Variables intended for client-side access in Vite **must** start with `VITE_`. Standard process environment variables are omitted during Vite bundling.

5. **Single Page Application Routing on Vercel**:
   - Refreshing direct routes (e.g., `/logs`) on Vercel returns HTTP 404 without a `vercel.json` rewrite rule redirecting all requests to `index.html`.
