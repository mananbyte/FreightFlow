# Phase 4: Discussion Log

## Discussion Areas Selected
1. Rendering technology
2. Multi-day navigation
3. Midnight splitting logic

## Discussion History

**Q: How should we render the 24-hour log grid and graph?**
A: (Recommended) Use SVG — It's standard for drawing precise line graphs over grids and matches paper logs perfectly.

**Q: How should we display multiple days of log sheets for long trips?**
A: (Recommended) Paginated/Tabbed view (e.g. Day 1, Day 2) — Cleaner UI, easier to focus on one day at a time.

**Q: Who should handle the logic of splitting events that cross midnight?**
A: (Recommended) Backend splits it — The Django API returns events pre-grouped by 'Day', with midnight-crossing events sliced at 23:59:59. This keeps frontend logic dumb and presentation-focused.
