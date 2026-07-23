# Phase 6: User Management and Trip Saving

## Domain
User authentication, Trip persistence, and a My Trips dashboard for drivers.

## Locked Requirements & Decisions

### Guest Data Transition
- **Decision:** Automatically save the user's current active route to their new account after they successfully register or log in.
- **Context:** If a guest calculates a route and clicks "Sign in to save", the frontend must preserve the route data in memory/local storage during the auth flow, and POST it to the trips endpoint immediately upon successful authentication.

### Trip Naming
- **Decision:** Auto-generate a default name (e.g. "Portland → Seattle (Jul 23)"), but let the user edit it before saving.
- **Context:** The `FloatingPanel` should pre-fill the Trip Name input field based on the calculated route data.

### Session Expiry UX
- **Decision:** Show a "Session Expired" modal that prompts them to log in again without losing their page context.
- **Context:** Instead of abruptly redirecting to `/login`, the app should render a modal overlay blocking interactions until they re-authenticate, preserving any unsaved state beneath it.

## Deferred Ideas
None.

## Canonical References
- `backend/api/models.py`
- `frontend/src/api/axiosInstance.js`
- `frontend/src/components/FloatingPanel.jsx`
