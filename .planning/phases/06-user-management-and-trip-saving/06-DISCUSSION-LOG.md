# Phase 6 Discussion Log

### Area: Guest Data Transition
- **Options presented:**
  1. Yes, automatically save their current active route to their new account after they register/login.
  2. No, clear the map and make them start fresh after logging in.
  3. Prompt them after login: "You have an unsaved route, would you like to save it?"
- **User selected:** Yes, automatically save their current active route to their new account after they register/login.
- **Notes:** Requires frontend state preservation during auth flow.

### Area: Trip Naming
- **Options presented:**
  1. Auto-generate it (e.g. "Portland → Seattle (Jul 23)"), but let them edit it before saving.
  2. Auto-generate and save immediately; they can edit it later in the dashboard.
  3. Leave the input blank and force them to type a name.
- **User selected:** Auto-generate it (e.g. "Portland → Seattle (Jul 23)"), but let them edit it before saving.
- **Notes:** Pre-fill input with route metadata.

### Area: Session Expiry UX
- **Options presented:**
  1. Show a "Session Expired" modal that prompts them to log in again without losing their page context.
  2. Abruptly redirect them to the `/login` page with an error banner at the top.
  3. Silently log them out, but keep them on the page (if it's a public page like `/create-trip`).
- **User selected:** Show a "Session Expired" modal that prompts them to log in again without losing their page context.
- **Notes:** Blocking modal overlay for re-auth.
