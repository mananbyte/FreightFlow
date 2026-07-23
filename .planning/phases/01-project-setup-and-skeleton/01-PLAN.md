# Phase 1: Project Setup and Skeleton - Execution Plan

<must_haves>
- Django backend successfully running and returning 200 OK from `/api/health/`
- React (Vite) frontend successfully running with routing to `/` and `/logs`
- Frontend successfully calling backend health check API
- `render.yaml` and `vercel.json` deployment configs present
</must_haves>

<task>
<id>1</id>
<title>Initialize Django Backend Project & Core Config</title>
<wave>1</wave>
<depends_on></depends_on>
<files_modified>
- backend/requirements.txt
- backend/manage.py
- backend/core/settings.py
- backend/core/urls.py
- backend/.env.example
</files_modified>
<autonomous>true</autonomous>
<read_first>
- /run/media/mananbyte/A2D26E9AD26E7309/Spotter/Fullstack/.planning/phases/01-project-setup-and-skeleton/01-RESEARCH.md
- backend/core/settings.py
</read_first>
<action>
1. Create `backend` directory.
2. Create `backend/requirements.txt` containing exact packages: `Django`, `djangorestframework`, `psycopg2-binary`, `dj-database-url`, `django-cors-headers`, `gunicorn`, `python-dotenv`, `whitenoise`.
3. Scaffold a new Django project named `core` inside `backend`.
4. In `backend/core/settings.py`:
   - Setup `python-dotenv` to load `.env` variables (`SECRET_KEY`, `DEBUG`, `DATABASE_URL`, `CORS_ALLOWED_ORIGINS`, `ALLOWED_HOSTS`).
   - Add `rest_framework` and `corsheaders` to `INSTALLED_APPS`.
   - Add `corsheaders.middleware.CorsMiddleware` before `CommonMiddleware` in `MIDDLEWARE`.
   - Add `whitenoise.middleware.WhiteNoiseMiddleware` for static files.
   - Configure `DATABASES` using `dj_database_url.config(conn_max_age=600, ssl_require=True)`.
5. Create `backend/.env.example` defining keys: `SECRET_KEY`, `DEBUG`, `DATABASE_URL`, `CORS_ALLOWED_ORIGINS`, `ALLOWED_HOSTS`.
</action>
<acceptance_criteria>
- `backend/requirements.txt` contains exactly the specified packages.
- `backend/core/settings.py` includes `corsheaders.middleware.CorsMiddleware` before `CommonMiddleware`.
- `backend/core/settings.py` configures `DATABASES` with `dj_database_url` and `ssl_require=True`.
- Running `cd backend && python manage.py check` executes without errors (assuming valid env).
</acceptance_criteria>
</task>

<task>
<id>2</id>
<title>Initialize React Vite Frontend Project</title>
<wave>1</wave>
<depends_on></depends_on>
<files_modified>
- frontend/package.json
- frontend/vite.config.js
- frontend/src/main.jsx
- frontend/src/App.jsx
- frontend/index.html
</files_modified>
<autonomous>true</autonomous>
<read_first>
- /run/media/mananbyte/A2D26E9AD26E7309/Spotter/Fullstack/.planning/phases/01-project-setup-and-skeleton/01-RESEARCH.md
- frontend/package.json
- frontend/src/App.jsx
</read_first>
<action>
1. Create `frontend` directory and initialize a React 18/19 Vite project.
2. Add dependencies `react-router-dom` and `axios` to `package.json`.
3. Clean out default Vite boilerplate from `frontend/src/App.jsx`.
4. Configure React Router in `frontend/src/main.jsx` and `frontend/src/App.jsx` to prepare for routing (no routes defined yet).
</action>
<acceptance_criteria>
- `frontend/package.json` contains `react-router-dom` and `axios`.
- `frontend/src/App.jsx` is clear of Vite default logos/counter boilerplate.
</acceptance_criteria>
</task>

<task>
<id>3</id>
<title>Create Backend API App & Health Check Endpoint</title>
<wave>2</wave>
<depends_on>1</depends_on>
<files_modified>
- backend/api/__init__.py
- backend/api/apps.py
- backend/api/views.py
- backend/api/urls.py
- backend/core/urls.py
- backend/core/settings.py
</files_modified>
<autonomous>true</autonomous>
<read_first>
- /run/media/mananbyte/A2D26E9AD26E7309/Spotter/Fullstack/.planning/phases/01-project-setup-and-skeleton/01-RESEARCH.md
- backend/core/settings.py
- backend/core/urls.py
- backend/api/views.py
</read_first>
<action>
1. Create `api` app in `backend`.
2. Add `api` to `INSTALLED_APPS` in `backend/core/settings.py`.
3. In `backend/api/views.py`, write `HealthCheckView` using Django REST framework that executes a raw database check (`SELECT 1` or ORM equivalent) and returns `{"status": "ok", "database": "connected", "timestamp": "<ISO_TIMESTAMP>"}`.
4. Create `backend/api/urls.py` and route `/health/` to `HealthCheckView`.
5. Include `api.urls` in `backend/core/urls.py` under the path `api/`.
</action>
<acceptance_criteria>
- `backend/core/settings.py` includes `'api'` in `INSTALLED_APPS`.
- `backend/api/views.py` contains `HealthCheckView` which returns `status`, `database`, and `timestamp`.
- `backend/core/urls.py` contains `path('api/', include('api.urls'))`.
- `GET /api/health/` returns 200 OK with correct JSON payload structure.
</acceptance_criteria>
</task>

<task>
<id>4</id>
<title>Frontend API Client & Skeleton Pages</title>
<wave>2</wave>
<depends_on>2</depends_on>
<files_modified>
- frontend/src/services/api.js
- frontend/src/components/Navbar.jsx
- frontend/src/pages/PlannerPage.jsx
- frontend/src/pages/LogsPage.jsx
- frontend/src/App.jsx
- frontend/.env.example
</files_modified>
<autonomous>true</autonomous>
<read_first>
- /run/media/mananbyte/A2D26E9AD26E7309/Spotter/Fullstack/.planning/phases/01-project-setup-and-skeleton/01-RESEARCH.md
- frontend/src/App.jsx
- frontend/src/services/api.js
</read_first>
<action>
1. Create `frontend/.env.example` with `VITE_API_BASE_URL=http://localhost:8000`.
2. Create `frontend/src/services/api.js` exporting an Axios instance using `import.meta.env.VITE_API_BASE_URL`.
3. Create `frontend/src/components/Navbar.jsx` with navigation links to `/` and `/logs`.
4. Create `frontend/src/pages/PlannerPage.jsx` and `frontend/src/pages/LogsPage.jsx`.
5. In `PlannerPage.jsx`, fetch `/api/health/` via `api.js` inside `useEffect`, displaying "Waking up server..." while pending, and render the API response once loaded.
6. Update `frontend/src/App.jsx` to render `Navbar` and configure routes: `/` -> `PlannerPage`, `/logs` -> `LogsPage`.
</action>
<acceptance_criteria>
- `frontend/src/services/api.js` exports an axios instance configured with `VITE_API_BASE_URL`.
- `frontend/src/App.jsx` defines `<Route path="/" />` and `<Route path="/logs" />`.
- `PlannerPage.jsx` contains logic to fetch and display the health check data.
</acceptance_criteria>
</task>

<task>
<id>5</id>
<title>Deployment Configuration files (Render & Vercel)</title>
<wave>3</wave>
<depends_on>3, 4</depends_on>
<files_modified>
- backend/render.yaml
- frontend/vercel.json
</files_modified>
<autonomous>true</autonomous>
<read_first>
- /run/media/mananbyte/A2D26E9AD26E7309/Spotter/Fullstack/.planning/phases/01-project-setup-and-skeleton/01-RESEARCH.md
- backend/render.yaml
- frontend/vercel.json
</read_first>
<action>
1. Create `backend/render.yaml` defining a web service in a Python environment. Set build command to `pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate` and start command to `gunicorn core.wsgi:application`. Add required env vars (`DATABASE_URL`, `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`).
2. Create `frontend/vercel.json` defining a `rewrites` rule that maps `/(.*)` to `/index.html` to support SPA routing.
</action>
<acceptance_criteria>
- `backend/render.yaml` contains build and start commands explicitly mapped to Python/gunicorn.
- `frontend/vercel.json` contains `{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}`.
</acceptance_criteria>
</task>
