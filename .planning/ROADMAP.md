# Project Roadmap

## Phase 1: Project Setup and Skeleton
**Goal:** Initialize Django backend and React frontend, and deploy the skeleton app.
- Initialize Django project with REST Framework.
- Initialize React app (Vite or Next.js/Create React App) with TailwindCSS or custom CSS setup.
- Set up routing and basic skeleton pages.
- Set up continuous deployment pipeline (e.g., frontend to Vercel, backend to Render/Heroku).

## Phase 2: Route Calculation and Map API Integration
**Goal:** Accept user inputs and visualize the route using a free Map API.
- Create UI form for inputs (Current Location, Pickup, Dropoff, Current Cycle).
- Integrate free Map API (e.g., OpenRouteService, OSRM, or Google Maps with free tier) to calculate route distance, path, and time.
- Display map with start, end, and route path on the frontend.

## Phase 3: ELD Logic and Stop Calculation
**Goal:** Implement the logic to calculate driving hours, rests, and fueling stops based on the 70hr/8day rule.
- Develop backend logic to process route duration and distance.
- Insert fueling stops every 1000 miles.
- Apply Hours of Service rules (11-hour driving limit, 14-hour shift limit, 10-hour off-duty, 30-minute breaks) and account for current cycle used.
- Account for 1 hour at pickup and 1 hour at drop-off.
- Generate a chronologically ordered list of events (driving, on-duty, off-duty, sleeper berth) with timestamps and durations.

## Phase 4: ELD Log Sheet Visualization
**Goal:** Visually draw the ELD daily log sheets based on the calculated events.
- Create a React component to render the ELD log grid (24-hour timeline with 4 status lines: Off Duty, Sleeper Berth, Driving, On Duty Not Driving). This UI must exactly replicate the `blank-paper-log.png` reference image.
- Draw the line graph dynamically based on the event list generated in Phase 3.
- Handle pagination or multiple sheets for multi-day trips.

## Phase 5: UI/UX Polish and Final Testing
**Goal:** Ensure the app looks premium and works flawlessly.
- Apply modern, aesthetic styling to the entire application.
- Add loading states, error handling, and smooth transitions.
- Test end-to-end flow to verify accuracy of calculations and visualization.
- Verify production deployment works correctly and prepare codebase for final GitHub sharing.
