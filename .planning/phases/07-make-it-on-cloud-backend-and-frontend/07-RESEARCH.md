# Phase 07 Research: Cloud Deployment

## Current Configuration Status

**Frontend (React/Vite)**
- `vercel.json` exists with SPA routing configured (`rewrites` to `index.html`).
- `package.json` has the correct `build` script (`vite build`).
- `src/api/client.js` uses `import.meta.env.VITE_API_BASE_URL` with a fallback to localhost.

**Backend (Django)**
- `render.yaml` exists for Render deployment but lacks a PostgreSQL database definition and the `buildCommand` is incomplete.
- `requirements.txt` includes necessary production packages: `gunicorn`, `whitenoise`, `psycopg2-binary`, `dj-database-url`.
- `core/settings.py` is well-configured for production:
  - Uses `dj_database_url` for flexible database connections.
  - `DEBUG`, `SECRET_KEY`, `ALLOWED_HOSTS`, and `CORS_ALLOWED_ORIGINS` are dynamically loaded from environment variables.
  - `whitenoise` is configured in `MIDDLEWARE` for serving static files.

## What is Missing / Needs to be Addressed in the Plan

1. **Backend Build Process (`render.yaml`)**:
   - The current `buildCommand` in `render.yaml` is only `"pip install -r requirements.txt"`.
   - **Action Needed**: Create a `build.sh` script (or update `buildCommand`) to execute:
     - `pip install -r requirements.txt`
     - `python manage.py collectstatic --no-input`
     - `python manage.py migrate`

2. **Database Provisioning (Render PostgreSQL)**:
   - `render.yaml` only defines a `web` service. It does not define a `psql` service.
   - **Action Needed**: Add a database component to `render.yaml` and reference its connection string in the web service's `DATABASE_URL` environment variable, or outline manual database creation in Render.

3. **Environment Variable Linkage**:
   - **Vercel (Frontend)**: Must set `VITE_API_BASE_URL` to point to the backend URL on Render (e.g., `https://spotter-backend.onrender.com/api`).
   - **Render (Backend)**:
     - `ALLOWED_HOSTS` must include the Render backend domain.
     - `CORS_ALLOWED_ORIGINS` must include the Vercel frontend URL.
     - `ORS_API_KEY` needs to be securely added to Render secrets.

## Summary of Execution Steps for Phase 07 Plan

1. Update `render.yaml` to include a PostgreSQL database service and link it to the web service.
2. Create a `build.sh` script in the `backend` directory to handle installation, static collection, and migrations.
3. Update `render.yaml` `buildCommand` to use `./build.sh`.
4. Deploy the backend to Render.
5. Deploy the frontend to Vercel, injecting the resulting Render backend URL into the environment.
6. Configure Render's `CORS_ALLOWED_ORIGINS` with the resulting Vercel URL.
7. Perform an end-to-end smoke test on the live URLs.
