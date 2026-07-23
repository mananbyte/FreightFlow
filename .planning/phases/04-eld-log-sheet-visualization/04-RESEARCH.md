# Phase 4: ELD Log Sheet Visualization - Research & Planning

## Objective
The goal of this phase is to visually draw the ELD daily log sheets based on the events calculated in Phase 3. The UI must render a 24-hour timeline with 4 status lines (Off Duty, Sleeper Berth, Driving, On Duty Not Driving) and exactly replicate the `blank-paper-log.png` reference image.

## Key Insights from Context & Requirements
- **Rendering Technology**: **SVG** is chosen for drawing precise line graphs over grids. This allows perfectly matching the paper logs.
- **Midnight Splitting Logic**: The backend (Django API) handles splitting events that cross midnight. It returns events pre-grouped by 'Day', so the frontend remains presentation-focused and "dumb".
- **Multi-day Navigation**: A **Paginated or Tabbed view** (e.g., Day 1, Day 2) will be used to show one day at a time, keeping the UI clean.
- **Fidelity**: The drawn log sheets **must exactly match** `blank-paper-log.png` located in the root repository.
- **Frameworks**: React (Frontend) using Custom CSS (Glassmorphism design, no component/icon libraries as specified).

## UI Specifications (from 04-UI-SPEC.md)
- **Typography**: Inter font.
- **Colors**:
  - Dominant (60%): `#F3F4F6` (App background)
  - Secondary (30%): `rgba(255, 255, 255, 0.85)` (Glassmorphic cards, log sheet background)
  - Primary (Accent): `#4F46E5` (Primary actions, focus borders)
  - Text: Main `#111827`, Muted `#6B7280`
  - Event Colors for Log Sheet: Pickup (`#10B981`), Dropoff (`#EF4444`), Fuel (`#F59E0B`), Break 30m (`#FBBF24`), Rest 10h (`#3B82F6`), Rest 34h (`#8B5CF6`).
- **Copywriting**:
  - Primary CTA: "Draw Log Sheet"
  - Empty state heading: "No Route Calculated"
  - Empty state body: "Please calculate a route to view the ELD log sheet."

## Actionable Execution Plan
1. **SVG Structure Definition**:
   - Create the base SVG grid representing the 24-hour timeline and the 4 status rows (Off Duty, Sleeper Berth, Driving, On Duty).
   - Use aspect ratios and grid markings matching `blank-paper-log.png`.
2. **React Component (`ELDLogSheet`)**:
   - Accept a single "Day" object with its pre-sliced events from the backend.
   - Map event types to the 4 y-axis status levels.
   - Render continuous `<polyline>` elements mapping start and end times to X-coordinates on the 24-hour grid.
3. **Tabbed Day Navigation**:
   - Implement a parent `ELDLogViewer` component.
   - Track the currently selected day tab.
   - Display the corresponding `ELDLogSheet` child component.
4. **Styling Application**:
   - Apply the custom glassmorphism CSS, typography (Inter), and the specified color palettes.

## Skills / Best Practices
- The frontend should strictly avoid complex date math for midnight crossovers. Trust the API's pre-grouped `Day` objects.
