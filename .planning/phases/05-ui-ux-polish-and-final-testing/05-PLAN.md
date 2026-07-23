---
wave: 1
depends_on: []
files_modified:
  - frontend/src/contexts/ToastContext.jsx
  - frontend/src/components/Toast.css
  - frontend/src/App.jsx
  - frontend/src/components/FloatingPanel.jsx
  - frontend/src/pages/Dashboard.jsx
  - frontend/src/pages/MyTrips.jsx
  - frontend/src/pages/MyTrips.css
  - frontend/src/components/FloatingPanel.css
  - TESTING.md
  - README.md
autonomous: true
---

# Phase 5: UI/UX Polish and Final Testing - Implementation Plan

## Wave 1

### Task 1: Global Toast Notification System (D-01)
`<threat_model>`
- Risk: Unhandled errors lead to a poor user experience. Using `alert()` blocks the main thread.
- Mitigation: Implement a non-blocking UI toast system.
`</threat_model>`
`<read_first>`
- frontend/src/App.jsx
- frontend/src/components/FloatingPanel.jsx
- frontend/src/pages/Dashboard.jsx
`</read_first>`
`<action>`
1. Create `frontend/src/contexts/ToastContext.jsx` that exports a `ToastProvider` and a `useToast` hook.
2. The context should maintain an array of active toasts, rendering them absolutely positioned (top or bottom right). Use glassmorphism styling for the toast container (`backdrop-filter: blur()`, `rgba` background, `border-radius`).
3. Set auto-dismiss timeout to 3000ms.
4. Wrap `App` (in `frontend/src/App.jsx`) with `ToastProvider`.
5. Update `frontend/src/components/FloatingPanel.jsx` to replace `alert("Please select valid locations from the dropdowns.")` with the toast equivalent (e.g., `toast.error("...")`).
6. Update `frontend/src/pages/Dashboard.jsx` to replace `alert('Routing failed: ...')` with the toast equivalent.
`</action>`
`<acceptance_criteria>`
- `frontend/src/contexts/ToastContext.jsx` contains `export const ToastProvider` and `export const useToast`.
- `frontend/src/App.jsx` imports and renders `ToastProvider`.
- `frontend/src/components/FloatingPanel.jsx` does not contain `alert(`.
- `frontend/src/pages/Dashboard.jsx` does not contain `alert('Routing failed: '`.
`</acceptance_criteria>`

### Task 2: Mobile Swipeable Bottom Sheet for Floating Panel (D-02)
`<threat_model>`
- Risk: The floating panel overlaps critical UI components like maps on small screens.
- Mitigation: Convert it to a collapsible bottom sheet layout specifically on small viewports via CSS and simple touch handlers.
`</threat_model>`
`<read_first>`
- frontend/src/components/FloatingPanel.jsx
- frontend/src/components/FloatingPanel.css
- frontend/src/App.css
`</read_first>`
`<action>`
1. In `frontend/src/components/FloatingPanel.jsx`, add an inline drag handle indicator (e.g., a small wide div) visible only on mobile. Add touch event listeners (`onTouchStart`, `onTouchMove`, `onTouchEnd`) to track vertical swiping.
2. Maintain an `isCollapsed` state. When swiped down significantly, set `isCollapsed = true`. When swiped up, set `isCollapsed = false`.
3. In `frontend/src/components/FloatingPanel.css`, add a `@media (max-width: 768px)` query.
4. Within the media query, position `.floating-panel` fixed at `bottom: 0`, `left: 0`, `width: 100%`. Set its `border-radius` to `24px 24px 0 0` and remove side margins.
5. Apply dynamic styling/classes based on `isCollapsed` state to change `transform: translateY(...)` so the panel slides mostly out of view (leaving just the header/drag handle) when collapsed.
`</action>`
`<acceptance_criteria>`
- `frontend/src/components/FloatingPanel.css` contains `@media (max-width: 768px)` with `bottom: 0` for `.floating-panel`.
- `frontend/src/components/FloatingPanel.jsx` contains touch event handlers (`onTouchStart` etc.).
- `frontend/src/components/FloatingPanel.jsx` defines an `isCollapsed` state variable.
`</acceptance_criteria>`

### Task 3: Guided Empty State for My Trips (D-03)
`<threat_model>`
- Risk: Users landing on the "My Trips" page without prior activity feel lost without a clear call-to-action.
- Mitigation: Provide a rich empty state featuring a recognizable illustration and a clear CTA directing them to calculate a route.
`</threat_model>`
`<read_first>`
- frontend/src/pages/MyTrips.jsx
- frontend/src/pages/MyTrips.css
`</read_first>`
`<action>`
1. In `frontend/src/pages/MyTrips.jsx`, locate the `.no-trips` div.
2. Replace the `span.no-trips-icon` with an inline SVG illustration of a parked truck or highway. Apply CSS classes to style it (e.g., `.empty-illustration`).
3. Update the `<h2>` text inside `.no-trips` to exactly `Your journey starts here`.
4. Update the `<Link>` element text to exactly `Calculate your first route!` and give it the `btn-primary` class to make it stand out.
5. Update `frontend/src/pages/MyTrips.css` to add styling for `.empty-illustration` (e.g., max-width, margin-bottom, color tinting using primary variables if appropriate).
`</action>`
`<acceptance_criteria>`
- `frontend/src/pages/MyTrips.jsx` contains the text `Your journey starts here`.
- `frontend/src/pages/MyTrips.jsx` contains an inline `<svg>` element within the empty state condition.
- `frontend/src/pages/MyTrips.jsx` contains `<Link to="/" className="btn-primary">Calculate your first route!</Link>`.
`</acceptance_criteria>`

## Wave 2

### Task 4: UI Edge Cases and End-to-End Testing
`<threat_model>`
- Risk: Changes in UI (toast, bottom sheet) may break on specific breakpoints or the timeout logic might fail. Core calculations might have regressed.
- Mitigation: Write and run end-to-end tests covering calculation accuracy, log visualization, responsive breakpoints, and toast timeout logic.
`</threat_model>`
`<action>`
1. Document manual end-to-end testing procedures and results in `TESTING.md`.
2. Ensure tests verify the full trip calculation flow from the map to the accuracy of the ELD log visualizations.
3. Test UI edge cases: Verify the mobile bottom sheet behaves correctly at the 768px breakpoint.
4. Test the 3-second timeout logic for the newly implemented toast notifications to ensure they dismiss automatically.
`</action>`
`<acceptance_criteria>`
- `TESTING.md` is created and details the end-to-end flow test for calculation accuracy and ELD visualization.
- `TESTING.md` includes test cases for responsive breakpoints (desktop vs. mobile) and the toast notifications 3-second timeout logic.
- All documented manual test scenarios pass successfully.
`</acceptance_criteria>`

### Task 5: Production Deployment and Codebase Preparation
`<threat_model>`
- Risk: The application fails in a production environment due to environment variables or build configurations. The repository is not ready for public sharing.
- Mitigation: Verify the deployment pipeline, clean up the codebase, and finalize setup instructions.
`</threat_model>`
`<read_first>`
- README.md
`</read_first>`
`<action>`
1. Verify the production deployment works correctly and all environment variables are properly set across frontend and backend.
2. Clean up the codebase by removing unused variables, `console.log` statements, and dead code.
3. Update `README.md` with clear instructions on how to set up, run, and deploy the project locally and in production.
`</action>`
`<acceptance_criteria>`
- Production deployment is verified and fully functional.
- Codebase is cleaned of dead code and debug statements.
- `README.md` is updated with comprehensive setup and deployment instructions for GitHub sharing.
`</acceptance_criteria>`

## Verification
- All files listed in `files_modified` are present and updated as expected.
- App continues to compile without issues (`npm run build`).
- End-to-end tests and UI edge case tests pass successfully.
- Production deployment is verified and functional.

## must_haves
- Toast notifications implemented and replace alerts.
- Mobile bottom sheet supports swiping.
- My Trips empty state uses correct copywriting and an SVG illustration.
- End-to-end flow tested for calculation and visualization accuracy.
- UI edge cases tested (responsive breakpoints, toast timeout).
- Production deployment verified and codebase prepared for final GitHub sharing.
