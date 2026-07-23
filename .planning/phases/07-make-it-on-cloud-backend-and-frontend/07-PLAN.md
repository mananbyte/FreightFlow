---
wave: 1
depends_on: "06"
files_modified:
  - backend/build.sh
  - backend/render.yaml
  - frontend/vercel.json
autonomous: true
---

# Phase 07: Cloud Deployment Setup

## Goal
Prepare the frontend and backend applications for cloud deployment on Vercel and Render respectively by configuring necessary build scripts, database services, and environment linkages.

## Tasks

```xml
<task>
  <id>1</id>
  <name>Create backend build script</name>
  <read_first>
    - backend/requirements.txt
  </read_first>
  <action>
    Create a new file `backend/build.sh` with a shell script that performs the following steps:
    1. Set `-o errexit` to exit on error.
    2. Run `pip install -r requirements.txt`.
    3. Run `python manage.py collectstatic --no-input`.
    4. Run `python manage.py migrate`.
    Also ensure this file is created with executable permissions (e.g. `chmod +x backend/build.sh`).
  </action>
  <acceptance_criteria>
    - `ls -l backend/build.sh` shows executable permissions.
    - `cat backend/build.sh` contains exactly the four steps outlined in the action.
  </acceptance_criteria>
</task>
```

```xml
<task>
  <id>2</id>
  <name>Update render.yaml for full deployment</name>
  <read_first>
    - backend/render.yaml
  </read_first>
  <action>
    Modify `backend/render.yaml` to include a PostgreSQL database service and link it to the web service:
    1. Add a new service block at the end for the database with `type: psql`, `name: spotter-db`, and `plan: free`.
    2. Under the `web` service, update the `buildCommand` to `./build.sh`.
    3. Under the `web` service's `envVars`, add `DATABASE_URL` and set its `fromDatabase` property to link to the `spotter-db` name and `url` property.
  </action>
  <acceptance_criteria>
    - `cat backend/render.yaml` contains a service of `type: psql` named `spotter-db`.
    - `cat backend/render.yaml` shows the `web` service's `buildCommand` is exactly `./build.sh`.
    - The `web` service has an env var for `DATABASE_URL` linked to `spotter-db`.
  </acceptance_criteria>
</task>
```

```xml
<task>
  <id>3</id>
  <name>Deploy and configure frontend on Vercel</name>
  <read_first>
    - frontend/vercel.json
  </read_first>
  <action>
    Deploy the frontend application to Vercel and ensure the project is correctly configured for single-page application (SPA) routing (which is handled by `vercel.json`).
  </action>
  <acceptance_criteria>
    - Frontend successfully builds on Vercel (`vite build`).
    - The live URL correctly serves the React application.
  </acceptance_criteria>
</task>
```

```xml
<task>
  <id>4</id>
  <name>Configure Environment Linkages (CORS and API URLs)</name>
  <read_first>
    - backend/render.yaml
  </read_first>
  <action>
    Establish communication between the deployed backend and frontend by configuring environment variables on their respective hosting platforms:
    1. **Vercel (Frontend):** Set `VITE_API_BASE_URL` to point to the live Render backend URL (e.g., `https://<backend-url>.onrender.com/api`).
    2. **Render (Backend):** Set the `CORS_ALLOWED_ORIGINS` environment variable to include the live Vercel frontend URL, and ensure `ALLOWED_HOSTS` includes the Render backend domain. Ensure `ORS_API_KEY` is securely added as a secret.
  </action>
  <acceptance_criteria>
    - `VITE_API_BASE_URL` on Vercel points to the valid Render backend URL.
    - `CORS_ALLOWED_ORIGINS` on Render includes the Vercel URL.
  </acceptance_criteria>
</task>
```

```xml
<task>
  <id>5</id>
  <name>Perform End-to-End Smoke Test</name>
  <action>
    Verify that the live frontend and backend are successfully communicating. This includes testing an API endpoint (e.g., logging in or retrieving a public resource) from the live Vercel frontend and ensuring the Render backend successfully responds.
  </action>
  <acceptance_criteria>
    - Application loads successfully on the Vercel URL.
    - An API request from the live frontend to the live backend completes successfully without CORS errors.
  </acceptance_criteria>
</task>
```

## Security Enforcement

<threat_model>
- **Threat:** Exposing sensitive database credentials or API keys in the configuration.
- **Mitigation:** The `render.yaml` configuration links the database URL dynamically using `fromDatabase` rather than hardcoding passwords. All sensitive keys like `ORS_API_KEY` must be configured securely in the hosting provider's dashboard via environment variables, not in code.
</threat_model>

## Verification
- [ ] `backend/build.sh` exists and is executable.
- [ ] `backend/render.yaml` defines a PostgreSQL service.
- [ ] `backend/render.yaml` configures the web service to build using `./build.sh` and link to the PostgreSQL service.
- [ ] Frontend successfully deployed to Vercel.
- [ ] `VITE_API_BASE_URL` and `CORS_ALLOWED_ORIGINS` are correctly configured.
- [ ] End-to-End smoke test passes on the live URLs.

## Must Haves
- The `build.sh` script must collect static files and run migrations.
- The `render.yaml` file must properly define the `spotter-db` and link it to the web service `DATABASE_URL`.
- The frontend and backend must be able to communicate via configured environment variables without CORS errors.
- End-to-end smoke test on live URLs must succeed.
