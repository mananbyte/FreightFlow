# Project Context

## What This Is
A full-stack web application built with Django and React that calculates and visualizes trip route instructions and draws ELD (Electronic Logging Device) logs based on driver inputs.

## Core Value
Automate and visually represent commercial driving routes and compliance logs for property-carrying drivers.

## Target Audience
Commercial truck drivers and fleet managers tracking property-carrying operations under the 70hrs/8days rule.

## Requirements

### Validated
- ✓ High-quality UI/UX design — Phase 5

### Active
- [ ] Take inputs: Current location, Pickup location, Dropoff location, Current Cycle Used (Hrs)
- [ ] Output map showing route, stops, and rests using a free map API
- [ ] Generate and draw daily log sheets for the trip (multiple sheets for longer trips)
- [ ] Apply property-carrying driver assumptions (70hrs/8days, no adverse conditions)
- [ ] Account for fueling at least once every 1,000 miles
- [ ] Account for 1 hour for pickup and drop-off
- [ ] Deploy live hosted version (e.g., Vercel)

### Out of Scope
- Mobile native application (focusing on web app)
- Paid Map API integration
- Other driving rule sets beyond 70hrs/8days property-carrying

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Django Backend | Specified in assessment | — Pending |
| React Frontend | Specified in assessment | — Pending |
| Free Map API | Specified to keep costs 0 | — Pending |
| Glassmorphism UI | Apple-style premium aesthetics | Phase 5 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
