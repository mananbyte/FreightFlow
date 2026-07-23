# Phase 4: eld-log-sheet-visualization

## Domain
Visually draw the ELD daily log sheets based on the calculated events from the route.

## Decisions

### Rendering technology
- Use SVG — It's standard for drawing precise line graphs over grids and matches paper logs perfectly.

### Multi-day navigation
- Paginated/Tabbed view (e.g. Day 1, Day 2) — Cleaner UI, easier to focus on one day at a time.

### Midnight splitting logic
- Backend splits it — The Django API returns events pre-grouped by 'Day', with midnight-crossing events sliced at midnight. This keeps frontend logic dumb and presentation-focused.

## Canonical Refs
- ROADMAP.md: "Visually draw the ELD daily log sheets based on the calculated events."
- 04-UI-SPEC.md: "UI design contract for Phase 4"
- blank-paper-log.png: "Reference image for the UI to exactly replicate"
