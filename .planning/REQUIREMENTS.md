# Requirements

## Epic
Route Calculation and ELD Log Generation App

## User Stories

### Core Flow
- As a driver, I want to input my current location, pickup, dropoff, and current cycle used, so that the app can plan my trip.
- As a driver, I want to see a map showing my route, stops, and rests, so I know exactly where to go and when to stop.
- As a driver, I want the app to generate my daily ELD log sheets, so that I remain compliant with the 70hrs/8days rule.

## Acceptance Criteria

- **Input Form**: Application accepts Current Location, Pickup Location, Dropoff Location, and Current Cycle Used (Hrs).
- **Map Visualization**: A map is displayed using a free Map API showing the route, along with markers for stops and rest periods.
- **Log Generation**: The app draws ELD daily log sheets. If the trip is long, it generates multiple daily sheets. The drawn log sheets **must exactly match** the reference image provided in `blank-paper-log.png` located in the root repository.
- **Rules Application**: Assumes 70hrs/8days cycle, 1 hour duration for pickup and 1 hour for drop-off.
- **Fueling Rules**: Includes fueling stop at least once every 1,000 miles.
- **Design Excellence**: UI and UX must be extremely good and aesthetically pleasing.
- **Deployment**: The application must be deployed and hosted live.

## Constraints
- **Stack**: Django (Backend), React (Frontend).
- **External Services**: Free Map API (e.g., Leaflet with OpenStreetMap or Mapbox free tier).

## Definition of Done
- Deployed live URL is accessible.
- All acceptance criteria are met.
- Source code is in GitHub repository.
