---
phase: 6
title: User Management and Trip Saving
goal: Add JWT authentication, a Trip model, CRUD API, and a premium My Trips dashboard so drivers can save and revisit all their calculated routes.
wave: 3
milestone: v1.0
status: planned
---

# Phase 6 Plan: User Management and Trip Saving

## Must-Haves (Goal-Backward Verification)
- [ ] A new user can register with email + password and receive JWT tokens
- [ ] An existing user can log in and receive JWT tokens
- [ ] All trip API endpoints return 401 for unauthenticated requests
- [ ] A calculated route can be saved with a name; it persists in the database
- [ ] `/dashboard` shows a card grid of all saved trips for the logged-in user
- [ ] Unauthenticated users clicking "Continue as Guest" can access `/create-trip` to calculate routes
- [ ] Unauthenticated users are prompted to "Sign in to save" after route calculation
- [ ] Unauthenticated users visiting `/dashboard` are redirected to `/login`
- [ ] Logout clears tokens and redirects to `/login`

---

## Wave 1 — Backend Auth & Model (no frontend deps)

### Task 1.1 — Install backend packages
```
wave: 1
files_modified: [backend/requirements.txt, backend/spotter/settings.py]
```
<read_first>
- backend/requirements.txt
- backend/spotter/settings.py
</read_first>
<action>
1. Append to `backend/requirements.txt`: `djangorestframework-simplejwt>=5.3.1` and `django-cors-headers>=4.3.1`
2. In `settings.py` INSTALLED_APPS, add `'rest_framework'`, `'rest_framework_simplejwt'`, `'corsheaders'`
3. In `settings.py` MIDDLEWARE, add `'corsheaders.middleware.CorsMiddleware'` as the FIRST middleware entry
4. Add to settings.py:
   - `CORS_ALLOWED_ORIGINS = ['http://localhost:5173']`
   - `REST_FRAMEWORK = { 'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework_simplejwt.authentication.JWTAuthentication'], 'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated'] }`
   - `SIMPLE_JWT = { 'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60), 'REFRESH_TOKEN_LIFETIME': timedelta(days=7) }`
   - Add `from datetime import timedelta` at the top of settings.py
</action>
<acceptance_criteria>
- `backend/requirements.txt` contains `djangorestframework-simplejwt` and `django-cors-headers`
- `settings.py` INSTALLED_APPS contains `corsheaders` and `rest_framework_simplejwt`
- `settings.py` contains `SIMPLE_JWT` dict with `ACCESS_TOKEN_LIFETIME`
- `settings.py` contains `CORS_ALLOWED_ORIGINS`
</acceptance_criteria>

---

### Task 1.2 — Create Trip model and RegisterView
```
wave: 1
files_modified: [backend/api/models.py, backend/api/serializers.py, backend/api/views.py]
```
<read_first>
- backend/api/models.py
- backend/api/views.py
- backend/api/serializers.py (may not exist yet)
</read_first>
<action>
1. In `backend/api/models.py`, add `Trip` model:
   - Fields: `user (FK→User, CASCADE)`, `name (CharField 255)`, `created_at (auto_now_add)`, `current_location (CharField 255)`, `pickup (CharField 255)`, `dropoff (CharField 255)`, `start_time (DateTimeField)`, `cycle_hours_used (FloatField default=0.0)`, `cycle_limit (IntegerField default=70)`, `events_json (JSONField default=list)`, `daily_logs_json (JSONField default=list)`
   - Meta: `ordering = ['-created_at']`
2. Create `backend/api/serializers.py` with:
   - `TripListSerializer`: id, name, pickup, dropoff, current_location, created_at, log_days (SerializerMethodField returning `len(daily_logs_json)`)
   - `TripDetailSerializer`: all fields including events_json, daily_logs_json
   - `RegisterSerializer`: email, password (write_only), name; `create()` creates User with `username=email`
3. In `backend/api/views.py`, add:
   - `RegisterView(CreateAPIView)`: permission_classes=[AllowAny], serializer_class=RegisterSerializer
   - `TripListCreateView(ListCreateAPIView)`: permission_classes=[IsAuthenticated]; on create, set `trip.user = request.user`; use TripListSerializer for list, TripDetailSerializer for create
   - `TripDetailView(RetrieveDestroyAPIView)`: permission_classes=[IsAuthenticated]; queryset filtered to `request.user`; use TripDetailSerializer
</action>
<acceptance_criteria>
- `backend/api/models.py` contains `class Trip(models.Model)` with all specified fields
- `backend/api/serializers.py` exists and contains `RegisterSerializer`, `TripListSerializer`, `TripDetailSerializer`
- `TripListSerializer` has a `log_days` field computed from `len(obj.daily_logs_json)`
- `backend/api/views.py` contains `RegisterView`, `TripListCreateView`, `TripDetailView`
- All trip views have `permission_classes = [IsAuthenticated]`
</acceptance_criteria>

---

### Task 1.3 — Wire URL routes and run migrations
```
wave: 1
depends_on: [1.1, 1.2]
files_modified: [backend/api/urls.py, backend/spotter/urls.py]
```
<read_first>
- backend/api/urls.py
- backend/spotter/urls.py
</read_first>
<action>
1. In `backend/api/urls.py`, add:
   - `path('register/', RegisterView.as_view())`
   - `path('trips/', TripListCreateView.as_view())`
   - `path('trips/<int:pk>/', TripDetailView.as_view())`
2. In `backend/spotter/urls.py`, add:
   - `path('api/token/', TokenObtainPairView.as_view())`
   - `path('api/token/refresh/', TokenRefreshView.as_view())`
   - Import from `rest_framework_simplejwt.views`
3. Run: `python manage.py makemigrations && python manage.py migrate`
</action>
<acceptance_criteria>
- `GET /api/trips/` without auth returns HTTP 401
- `POST /api/register/` with `{email, password, name}` returns HTTP 201
- `POST /api/token/` with valid credentials returns JSON containing `access` and `refresh` keys
- `POST /api/token/refresh/` with valid refresh token returns JSON containing `access` key
- `python manage.py migrate` exits 0 with no errors
</acceptance_criteria>

---

## Wave 2 — Frontend Auth Layer (no UI pages yet)

### Task 2.1 — Axios instance and AuthContext
```
wave: 2
files_modified: [frontend/src/api/axiosInstance.js, frontend/src/context/AuthContext.jsx]
```
<read_first>
- frontend/src/App.jsx
- frontend/src/main.jsx
</read_first>
<action>
1. Create `frontend/src/api/axiosInstance.js`:
   - Axios instance with `baseURL: 'http://127.0.0.1:8000'`
   - Request interceptor: read `localStorage.getItem('spotter_access')`, set `Authorization: Bearer <token>` header
   - Response interceptor: on 401, call `POST /api/token/refresh/` with `{refresh: localStorage.getItem('spotter_refresh')}`, on success save new access token to localStorage and retry the original request with new token; on failure clear localStorage and redirect to `/login`
2. Create `frontend/src/context/AuthContext.jsx`:
   - Context with `user` (null or decoded JWT payload), `accessToken`, `isAuthenticated` (bool)
   - `login(email, password)`: POST to `/api/token/`, save both tokens to localStorage under `spotter_access` and `spotter_refresh`, decode access token with `jwt-decode` to set user state
   - `logout()`: clear localStorage keys `spotter_access` and `spotter_refresh`, reset state
   - On mount: check localStorage for existing valid tokens; if found, restore state
3. Wrap `<App />` in `<AuthProvider>` in `frontend/src/main.jsx`
</action>
<acceptance_criteria>
- `frontend/src/api/axiosInstance.js` exists and exports a default Axios instance
- `axiosInstance.js` contains a request interceptor that reads `spotter_access` from localStorage
- `axiosInstance.js` contains a response interceptor with `status === 401` handling and token refresh logic
- `frontend/src/context/AuthContext.jsx` exports `AuthProvider` and `useAuth`
- `useAuth()` exposes `{ user, isAuthenticated, login, logout }`
- `frontend/src/main.jsx` wraps root in `<AuthProvider>`
</acceptance_criteria>

---

### Task 2.2 — ProtectedRoute and update App routing
```
wave: 2
depends_on: [2.1]
files_modified: [frontend/src/components/ProtectedRoute.jsx, frontend/src/App.jsx]
```
<read_first>
- frontend/src/App.jsx
- frontend/src/context/AuthContext.jsx
</read_first>
<action>
1. Create `frontend/src/components/ProtectedRoute.jsx`:
   - Imports `useAuth` from AuthContext and `Navigate`, `Outlet` from react-router-dom
   - If `isAuthenticated` is false: return `<Navigate to="/login" replace />`
   - Otherwise: return `<Outlet />`
2. Update `frontend/src/App.jsx` routes:
   - Public: `/login` → `<Login />`, `/register` → `<Register />`, `/create-trip` → existing Dashboard/map page
   - Protected (wrapped in `<ProtectedRoute>`): `/dashboard` → `<MyTrips />`, `/trips/:id/logs` → `<DriverLog />`
   - Default `/` → `<Navigate to="/dashboard" replace />` (will redirect to login if not auth'd)
</action>
<acceptance_criteria>
- `frontend/src/components/ProtectedRoute.jsx` exists and uses `useAuth().isAuthenticated`
- Visiting `/dashboard` without tokens in localStorage redirects to `/login`
- Visiting `/dashboard` with valid tokens in localStorage renders the My Trips page
- App.jsx route structure has both public and protected route groups
</acceptance_criteria>

---

## Wave 3 — UI Pages (Login, Register, My Trips) + Save Trip

### Task 3.1 — Login and Register pages
```
wave: 3
files_modified: [frontend/src/pages/Login.jsx, frontend/src/pages/Login.css, frontend/src/pages/Register.jsx]
```
<read_first>
- frontend/src/App.css (design tokens: --primary, --surface, --bg-gradient, --glass-blur, --border, --shadow-lg)
- frontend/src/pages/DriverLog.css (for style reference)
</read_first>
<action>
1. Create `frontend/src/pages/Login.jsx`:
   - Centered glass card on the gradient background
   - Fields: Email, Password (controlled inputs)
   - "Sign In" button with `--primary` blue styling and hover lift effect
   - "Continue as Guest" button (secondary/outline styling) that navigates to `/create-trip`
   - Error message display (red, beneath button) on failed login
   - Link to `/register`
   - On submit: calls `login(email, password)` from useAuth; on success navigate to `/dashboard`
2. Create `frontend/src/pages/Login.css` with glassmorphism card:
   - Card: `background: rgba(255,255,255,0.25)`, `backdrop-filter: blur(40px)`, `border-radius: 24px`, `border: 1px solid rgba(255,255,255,0.5)`, `box-shadow: var(--shadow-lg)`, padding `48px`
   - Input styles matching App.css (white bg, soft border, focus glow)
3. Create `frontend/src/pages/Register.jsx`:
   - Fields: Full Name, Email, Password, Confirm Password
   - POST to `/api/register/`, then auto-login with returned credentials
   - Link back to `/login`
   - Same glassmorphism card styling as Login
</action>
<acceptance_criteria>
- `/login` renders a centered glass card with Email, Password inputs and Sign In button
- Submitting valid credentials navigates to `/dashboard`
- Submitting invalid credentials shows an inline error message without page reload
- `/register` renders a form with Name, Email, Password, Confirm Password fields
- Successful registration automatically logs the user in and navigates to `/dashboard`
- Both pages are styled with glassmorphism matching the app theme
</acceptance_criteria>

---

### Task 3.2 — My Trips (Dashboard) page
```
wave: 3
depends_on: [2.2, 3.1]
files_modified: [frontend/src/pages/MyTrips.jsx, frontend/src/pages/MyTrips.css]
```
<read_first>
- frontend/src/api/axiosInstance.js
- frontend/src/context/AuthContext.jsx
- frontend/src/App.css (design tokens)
- frontend/src/pages/DriverLog.css (card style reference)
</read_first>
<action>
1. Create `frontend/src/pages/MyTrips.jsx`:
   - On mount: `GET /api/trips/` via axiosInstance, store in `trips` state
   - While loading: show 3 skeleton shimmer cards
   - `DashboardNav`: top bar with "Spotter" logo on left, user email + "Logout" button on right. Logout calls `useAuth().logout()` then navigate to `/login`
   - `DashboardHeader`: heading "My Trips" and "+ Create New Trip" button that navigates to `/create-trip`
   - `TripsGrid`: CSS Grid, 3 cols at >900px, 2 cols at >600px, 1 col mobile
   - `TripCard` per trip:
     - Top: trip name (bold, 17px) + relative date ("2 days ago") top-right in muted color
     - Route row: `{pickup}` arrow icon `{dropoff}` in dark text
     - Stats row: "📅 {log_days} days" | "🔄 {cycle_hours_used}h used" in `--text-muted` color
     - Footer: "View Logs" button (primary blue, small) + trash icon delete button (red on hover)
     - Hover: `translateY(-4px)` + stronger shadow
   - `EmptyState`: large truck SVG, "No trips saved yet", "Plan your first route →" button
   - Delete: on trash click, `DELETE /api/trips/{id}/`, remove from list with smooth fade-out
2. Create `frontend/src/pages/MyTrips.css`:
   - `.dashboard-nav`: height 64px, glassmorphic top bar, `position: sticky; top: 0; z-index: 100`
   - `.trips-grid`: `display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px`
   - `.trip-card`: glassmorphism per spec (bg rgba(255,255,255,0.55), backdrop blur 20px, border-radius 20px, shadow, hover lift)
   - `.skeleton`: animated shimmer `@keyframes shimmer` using `background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)` with `background-size: 200% 100%`
</action>
<acceptance_criteria>
- `/dashboard` shows a sticky glassmorphic nav bar with user email and Logout button
- Trip cards render with name, pickup→dropoff route, days count, and cycle hours used
- Clicking "View Logs" navigates to `/trips/{id}/logs`
- Clicking delete removes the trip from the list without page reload
- Empty state is shown when the user has no saved trips
- Loading state shows 3 skeleton shimmer cards while the API call is in-flight
- Grid is responsive: 3 cols on desktop, 2 on tablet, 1 on mobile
</acceptance_criteria>

---

### Task 3.3 — Save Trip flow on Create Trip page
```
wave: 3
depends_on: [2.1]
files_modified: [frontend/src/components/FloatingPanel.jsx, frontend/src/components/FloatingPanel.css]
```
<read_first>
- frontend/src/components/FloatingPanel.jsx
- frontend/src/components/FloatingPanel.css
- frontend/src/api/axiosInstance.js
</read_first>
<action>
1. In `FloatingPanel.jsx`, check `isAuthenticated` from `useAuth()`
   - After a successful route calculation (when the success banner is shown):
   - If `isAuthenticated`: Render a text input "Trip Name" (placeholder: e.g., "Chicago → Denver Run") and a "Save Trip" button
     - On save: POST to `/api/trips/` via axiosInstance with body...
     - On success: show a small inline "✓ Trip saved!" confirmation message in green; button becomes disabled
     - On error: show "Failed to save"
   - If `!isAuthenticated`: Render a "Sign in to save your trips" message with a button linking to `/login`
2. Style the save section in `FloatingPanel.css`:
   - `save-trip-section`: subtle separator line on top, padding-top 16px
   - Trip name input: matching existing glass input style
   - "Save Trip" button: secondary style (outlined, `--primary` border, white bg, primary text), distinct from the primary "View ELD Log Sheet" button
   - Confirmation message: small, `#10B981` green, with a checkmark
</action>
<acceptance_criteria>
- After route calculation, a "Trip Name" input and "Save Trip" button appear in the floating panel
- Submitting the save form POSTs to `/api/trips/` with all required fields
- On success, an inline "✓ Trip saved!" confirmation is shown; the save button becomes disabled
- On error (e.g., not logged in), an error message is shown inline
- The save section is visually distinct from but harmonious with the existing panel design
</acceptance_criteria>

---

### Task 3.4 — Trip Detail page (load saved trip into DriverLog)
```
wave: 3
depends_on: [3.2]
files_modified: [frontend/src/pages/DriverLog.jsx]
```
<read_first>
- frontend/src/pages/DriverLog.jsx
- frontend/src/api/axiosInstance.js
</read_first>
<action>
1. In `DriverLog.jsx`, detect the route param `id` from `useParams()`
2. If `id` is present: on mount, fetch `GET /api/trips/{id}/` via axiosInstance, extract `daily_logs_json` and set as the data source instead of `location.state.dailyLogs`
3. Show a loading spinner while the trip is being fetched
4. If fetch fails (404 or 401): show an error card "Trip not found or access denied" with a "Back to My Trips" button
5. "Back" link: if came from a saved trip → navigate to `/dashboard`; if came from fresh calculation → navigate to `/`
</action>
<acceptance_criteria>
- Navigating to `/trips/1/logs` fetches the trip from the API and renders the ELD log sheet
- A loading state is shown while the fetch is in-flight
- A 404 or 401 from the API renders an error card with a back button
- The "Back" button navigates to `/dashboard` when loading a saved trip
</acceptance_criteria>

---

## Verification Gates

After all tasks are complete, verify:

1. **Auth flow**: Register → Login → JWT stored in localStorage → protected routes accessible
2. **Token refresh**: Manually expire (or shorten to 1 min) access token → navigate → auto-refresh works silently
3. **Save trip**: Calculate Portland→DC → Save as "Cross Country Run" → appears in My Trips
4. **View saved trip**: Click "View Logs" on a saved card → ELD log sheet loads from DB data
5. **Delete trip**: Delete a trip → card disappears from grid; DB record deleted (verify via Django admin)
6. **Logout**: Logout → localStorage cleared → /dashboard redirects to /login → back button can't bypass
