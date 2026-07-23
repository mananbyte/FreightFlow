# Phase 6: User Management, Trip Saving & My Trips — Technical Research

## 1. Required Packages

### Backend (add to requirements.txt)
```
djangorestframework-simplejwt>=5.3.1
django-cors-headers>=4.3.1
```

### Frontend (npm install)
```
axios>=1.6.8
jwt-decode>=4.0.0
```
`react-router-dom` is already installed. `lucide-react` for premium icons.

---

## 2. Django Model Definitions

```python
# backend/api/models.py
from django.db import models
from django.contrib.auth.models import User

class Trip(models.Model):
    user             = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trips')
    name             = models.CharField(max_length=255)
    created_at       = models.DateTimeField(auto_now_add=True)

    # Route summary (for card display)
    current_location = models.CharField(max_length=255)
    pickup           = models.CharField(max_length=255)
    dropoff          = models.CharField(max_length=255)
    start_time       = models.DateTimeField()

    # ELD calculation inputs
    cycle_hours_used = models.FloatField(default=0.0)
    cycle_limit      = models.IntegerField(default=70)   # 60 or 70

    # Full computed output (stored as JSON)
    events_json      = models.JSONField(default=list)
    daily_logs_json  = models.JSONField(default=list)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.user.email})"
```

---

## 3. API Endpoint Design

### Auth
| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/api/register/` | None | `{email, password, name}` | `{id, email, name}` |
| POST | `/api/token/` | None | `{username, password}` | `{access, refresh}` |
| POST | `/api/token/refresh/` | None | `{refresh}` | `{access}` |

### Trips
| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| GET | `/api/trips/` | Bearer | — | `[{id, name, pickup, dropoff, created_at, log_days}]` |
| POST | `/api/trips/` | Bearer | Full trip payload | `{id, ...}` 201 |
| GET | `/api/trips/{id}/` | Bearer | — | Full trip data |
| DELETE | `/api/trips/{id}/` | Bearer | — | 204 |

---

## 4. JWT Auth Flow

```
[Browser]                                [Django API]
   |                                          |
   |-- POST /api/token/ (email+password) ---> |
   |<-- {access: "...", refresh: "..."}  ---- |
   |                                          |
   | Store tokens in localStorage             |
   |                                          |
   |-- GET /api/trips/ (Bearer access) -----> |
   |<-- 200 [trips array] ------------------- |
   |                                          |
   ... access expires (15 min) ...            |
   |                                          |
   |-- GET /api/trips/ → Axios interceptor    |
   |      detects 401                         |
   |-- POST /api/token/refresh/ -----------> |
   |<-- {access: "new_token"} -------------- |
   |   saves to localStorage                  |
   |-- Retry original request with new token  |
   |<-- 200 [trips array] ------------------- |
```

---

## 5. Frontend Routing Structure (React Router v6)

```
/ (index)              → redirect: if auth → /dashboard, else → /login
/login                 → Login page (public)
/register              → Register page (public)
/create-trip           → Route calculator + map (public, guests can access)
/dashboard             → My Trips page (protected)
/trips/:id/logs        → ELD log sheet for saved trip (protected)
```

**ProtectedRoute component:** checks `localStorage` for valid JWT token. If missing/expired → redirects to `/login`.
**Guest Flow:** The login page includes a "Continue as Guest" link to `/create-trip`. Unauthenticated users can calculate routes, but the "Save Trip" button prompts them to sign in.

---

## 6. My Trips Page Component Architecture

```
<MyTrips>
  ├── <DashboardNav>          — Logo + user email + Logout button
  ├── <DashboardHeader>       — "My Trips" title + "Create New Trip" button
  ├── <TripsGrid>             — CSS Grid: 3 cols → 2 → 1 responsive
  │   └── <TripCard> × N
  │       ├── CardBadge       — "Route Ready" or date badge top-right
  │       ├── RouteSection    — Pickup → Dropoff with arrow icon
  │       ├── StatsRow        — Cycle used | Days in log | Distance
  │       └── CardActions     — "View Logs" btn + delete icon
  └── <EmptyState>            — shown when trips=[] with CTA
```

---

## 7. State Management & Token Storage

- **AuthContext** (`src/context/AuthContext.jsx`): Wraps the entire app, exposes `user`, `accessToken`, `login()`, `logout()`, `isAuthenticated`.
- **`src/api/axiosInstance.js`**: Axios instance with base URL. Request interceptor attaches `Authorization: Bearer <token>`. Response interceptor: on 401 → calls `/api/token/refresh/` → retries with new token → on second failure → `logout()`.
- **localStorage keys**: `spotter_access` and `spotter_refresh`.

---

## 8. Security Considerations

| Risk | Mitigation |
|------|-----------|
| XSS stealing localStorage tokens | React auto-escapes output; never use `dangerouslySetInnerHTML`; CSP headers |
| Expired access tokens | Axios response interceptor auto-refreshes silently |
| CSRF on refresh endpoint | SimpleJWT uses Bearer header (not cookies) so CSRF not applicable |
| Token leakage on logout | Clear both tokens from localStorage; call `/api/token/blacklist/` if blacklist enabled |
| CORS | `CORS_ALLOWED_ORIGINS = ['http://localhost:5173']` only; no wildcard |

---

## 9. Recommended Premium UX Patterns

### TripCard glassmorphism spec:
```css
background: rgba(255, 255, 255, 0.55);
backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.7);
border-radius: 20px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.8);
transition: transform 0.25s ease, box-shadow 0.25s ease;
```

### Card hover:
```css
transform: translateY(-4px) scale(1.01);
box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.8);
```

### Loading skeleton: animated shimmer bars using CSS `@keyframes shimmer` instead of a library.

### Empty state: large SVG truck illustration + "No trips yet" heading + "Create your first trip" CTA button in `--primary` blue.
