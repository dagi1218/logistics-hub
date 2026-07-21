# Logistics Hub Project Summary

## Completed Work

- Built a Next.js + Prisma logistics tracking application.
- Implemented delivery tracking pages for dispatchers, drivers, and customers.
- Added server-side data fetching with Prisma for delivery, route, and driver entities.
- Integrated Leaflet maps for live route display and driver/customer locations.
- Added OSRM routing support to compute real-world road paths.
- Implemented a simulation controller that updates driver GPS coordinates over time.
- Added live polling on the customer tracking page with `LiveTracker`.
- Implemented server actions for updating delivery status and driver location.

## Completed Server Actions

- `updateDeliveryStatus(deliveryId, newStatus)`
  - Updates a delivery's status in the database.
  - Revalidates dispatcher and driver pages to reflect the new status.

- `updateDriverLocation(driverId, lat, lng)`
  - Updates the driver's current latitude and longitude on the user record.
  - Revalidates the dispatcher map page to refresh driver position.

## Database Schema

- `User`
  - `id`, `email`, `name`, `role`
  - `currentLat`, `currentLng`
  - Relations: `vehicle`, `routes`

- `Vehicle`
  - `id`, `licensePlate`, `model`
  - Relation: `driverId` → `User`

- `Route`
  - `id`, `date`, `isCompleted`, `driverId`
  - Relations: `driver` → `User`, `deliveries` → `Delivery[]`

- `Delivery`
  - `id`, `address`, `latitude`, `longitude`, `status`, `customerName`, `routeId`
  - Relation: `route` → `Route`

## Core Components

- `CustomerTrackMap`
  - Renders the customer delivery map with Leaflet.
  - Shows the customer pin, driver pin, and calculated route path.

- `CustomerMapWrapper`
  - Dynamically imports `CustomerTrackMap` with client-side rendering disabled on the server.

- `MapWrapper` / `LiveMap`
  - Renders dispatcher route maps and active driver locations.
  - Uses OSRM road path data for route polylines.

- `SimulationControl`
  - Starts and stops simulated driver movement along OSRM route nodes.
  - Calls `updateDriverLocation` server action on each simulated step.

- `LiveTracker`
  - Polls the page periodically to refresh data and reflect updated driver GPS.

- `StatusButton`
  - UI control for dispatchers or drivers to update delivery state.

  ## project functional and non functional requirements(useful to track our progress)

## User Groups

- Dispatchers
  - Manage delivery assignments, monitor active routes, and update delivery status.
- Drivers
  - Follow assigned routes, report location updates, and complete deliveries via a mobile app(for the future using flutter or other suitable frameworks).
- Customers
  - Track delivery progress, view estimated arrival, and confirm destination details.
- Admins
  - Manage drivers, vehicles, and route assignments.

## Functional Requirements

- Dispatcher dashboard with route and delivery monitoring.
- Driver location updates and route tracking in real time.
- Customer-facing delivery status page with map tracking.
- OSRM-based routing between driver current location and delivery destination.
- Server actions to update delivery status and driver GPS coordinates.
- Dynamic map rendering using Leaflet for customer and dispatcher views.
- Live refresh mechanism for near-real-time tracking updates.

## Non-functional Requirements

- Responsive UI that works on desktop and mobile browsers.
- Secure data access with role-based views for dispatcher, driver, and customer.
- Fast route computation and map rendering with caching for OSRM requests.
- Reliable fallback when external routing services fail.
- Maintainable Prisma schema and modular React component structure.
- Scalable architecture that can support more routes, drivers, and deliveries.

## Architecture Note

- The `/driver` experience will be implemented as a Flutter mobile app.
- The backend APIs and server actions should be designed to support both the web dashboard and the Flutter driver client.

## Current Known Issues

- Customer map route rendering must use the proper `roadPath` prop when the driver is active.
- Leaflet icon handling can fail if marker icon URLs are not set correctly.

## Future Directions

- Add a delivery history / status timeline for customers.
- Improve route rendering with multiple deliveries and optimized stop sequence.
- Add authentication and role-based access for dispatcher, driver, and customer views.
- Add better fallback handling when OSRM routing fails.
- Add unit tests for route generation, server actions, and map rendering.
- Track driver ETA and arrival notifications for customer-facing pages.
