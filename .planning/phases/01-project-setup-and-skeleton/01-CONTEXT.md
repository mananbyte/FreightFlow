# Phase 1: Project Setup and Skeleton - Context

**Gathered:** 2026-07-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Initial project infrastructure, framework initialization, deployment configuration.

</domain>

<decisions>
## Implementation Decisions

### Frontend Framework
- **D-01:** Vite — SPA approach, fast builds, perfect for pairing with a Django REST backend.

### Map Library
- **D-02:** React-Leaflet (OpenStreetMap) — Completely free, open-source, and perfect for simple routing and markers.

### Routing Service
- **D-03:** OpenRouteService — Better truck-specific routing (can account for weight/height), requires registering for a free API key.

### Repository Structure
- **D-04:** Monorepo (one root folder containing /backend and /frontend) — Easier to manage and deploy together.

### Monorepo Tooling
- **D-05:** Standard folders (/frontend and /backend) with no extra tooling — Simplest approach for a 2-part stack.

### Hosting Providers
- **D-06:** Vercel (Frontend) + Render (Backend) + Neon.tech Serverless Postgres (Database) — 100% free with no credit card upfront, and persists data correctly.

### Styling Approach
- **D-07:** Vanilla CSS — Maximum flexibility and control, allowing for highly custom and premium designs.

### the agent's Discretion
- State Management: The agent has flexibility to decide (likely React Context + local state).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None (brand new project).

### Established Patterns
- None (brand new project).

### Integration Points
- None (brand new project).

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 1-Project Setup and Skeleton*
*Context gathered: 2026-07-23*
