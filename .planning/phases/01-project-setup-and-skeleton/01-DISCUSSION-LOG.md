# Phase 1: Project Setup and Skeleton - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-23
**Phase:** 1-Project Setup and Skeleton
**Areas discussed:** Frontend framework, Repository structure, Hosting providers, Styling approach

---

## Frontend Framework

| Option | Description | Selected |
|--------|-------------|----------|
| Vite | SPA approach, fast builds, perfect for pairing with a Django REST backend | ✓ |
| Next.js App Router | Full-stack React framework, good for SEO, but adds backend complexity you might not need with Django | |
| You decide | | |

**User's choice:** Vite
**Notes:** 

---

## State Management

| Option | Description | Selected |
|--------|-------------|----------|
| React Context + local state | Simplest approach, enough for a form and map visualization | |
| Zustand | Lightweight global state management, great if state gets complex across components | |
| Redux Toolkit | Heavy-duty state management | |
| You decide | | ✓ |

**User's choice:** You decide
**Notes:** User asked "what is meant by state", and after explanation chose "Let me (the agent) decide as we build".

---

## Map Library

| Option | Description | Selected |
|--------|-------------|----------|
| React-Leaflet | Completely free, open-source, and perfect for simple routing and markers | ✓ |
| Mapbox GL JS | Looks more premium, but requires making an account for an API key | |
| You decide | | |

**User's choice:** React-Leaflet
**Notes:** 

---

## Routing Service

| Option | Description | Selected |
|--------|-------------|----------|
| OSRM | Completely free, no API key needed, good enough for most truck routing demo apps | |
| OpenRouteService | Better truck-specific routing, but requires registering for a free API key | ✓ |
| You decide | | |

**User's choice:** OpenRouteService
**Notes:** 

---

## Repository Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Monorepo | one root folder containing /backend and /frontend | ✓ |
| Separate directories | Completely decoupled, might be slightly harder to manage locally | |
| You decide | | |

**User's choice:** Monorepo
**Notes:** 

---

## Monorepo Tooling

| Option | Description | Selected |
|--------|-------------|----------|
| Standard folders | Simplest approach for a 2-part stack | ✓ |
| Turborepo | Adds caching and unified commands, but maybe overkill here | |
| You decide | | |

**User's choice:** Standard folders
**Notes:** 

---

## Hosting Providers

| Option | Description | Selected |
|--------|-------------|----------|
| Vercel + Render + Neon | 100% free with no credit card | ✓ |
| PythonAnywhere | Free for backend without card but less automated | |
| You decide | | |

**User's choice:** Vercel + Render + Neon
**Notes:** User explicitly asked "which backend service doesot require any card" and chose option 1 after explanation.

---

## Styling Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Vanilla CSS | Maximum flexibility and control, allowing for highly custom and premium designs | ✓ |
| TailwindCSS | Utility-first CSS framework, faster prototyping but can lead to cluttered HTML | |
| You decide | | |

**User's choice:** Vanilla CSS
**Notes:** 

---

## the agent's Discretion

State Management (likely React Context + local state)

## Deferred Ideas

None
