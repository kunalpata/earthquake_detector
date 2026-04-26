# QuakePulse

A real-time, interactive earthquake monitoring web app powered by the USGS Earthquake Hazards Program API.

## What it is

QuakePulse visualizes global seismic activity on a live, interactive map with statistics, trend analysis, and filtering. It auto-refreshes every 60 seconds so you're always looking at current data — no API key required.

## Features

- **Interactive map** — earthquake locations as circles sized by magnitude; color-coded by magnitude or depth
- **Real-time data** — auto-refreshes every 60s from USGS feeds
- **Filters** — time range (1h / 24h / 7d / 30d), minimum magnitude slider, max depth, tsunami-only toggle
- **Statistics panel** — total events, max magnitude, average magnitude/depth, M5+ count, tsunami alerts
- **Activity trend chart** — daily event counts colored by max magnitude
- **Earthquake list** — sortable by time, magnitude, or depth; searchable by location
- **Detail popups** — magnitude, depth, relative time, felt reports, alert level, USGS link
- **Tsunami & alert indicators** — flagged in list and popup
- **Collapsible sidebar** — maximize map view when needed
- **Dark mode** — optimized dark theme throughout

## Data Source

[USGS Earthquake Hazards Program](https://earthquake.usgs.gov/) — free, no API key required.

Endpoints used:
- `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson`
- `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`
- `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson`
- `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson`

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS v4**
- **react-leaflet** — interactive map
- **Recharts** — activity trend chart
- **SWR** — data fetching with auto-refresh
- **date-fns** — date formatting

## Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To build for production:

```bash
npm run build
npm start
```

No environment variables or API keys needed.
