# CS416 Campus Map

An interactive student life events website for Purdue University Northwest — browse events, get driving directions, and find parking.

> **CS416 Software Engineering — Course Project 3**
> Purdue University Northwest · Team 2

---

## Project Overview

A full-stack web application that displays upcoming student life events at Purdue University Northwest. Students can browse events sorted by date, click through to the official PNW events page, view suggested parking lots near the event location, and get driving directions from their home address to campus using an interactive Mapbox map.

---

## Business Scenario

The team operates as a simulated software company hired by Purdue University Northwest to build a student-facing events website. Requirements were gathered through a Google Forms survey distributed to students on campus. The application is designed to help students discover events and navigate to campus, while linking to the university's official page for full event details.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes (Node.js) |
| Database | Supabase (PostgreSQL) |
| Maps & Routing | Mapbox GL JS, react-map-gl, Mapbox Directions API, Mapbox Geocoding API |
| State Management | Zustand |
| Data Fetching | TanStack React Query |
| Validation | Zod |
| Deployment | Vercel |
| Version Control | GitHub ([branching strategy](git-branch-strategy.md)) |

---

## Features

- **Event Listing** — Browse all student life events sorted in ascending order by date
- **Event Hyperlinks** — Each event links directly to the official PNW events page in a new tab
- **Interactive Campus Map** — Mapbox map centered on PNW with clickable event markers and popup cards
- **Driving Directions** — Enter a home address or city and see the driving route to campus with distance and estimated time
- **Parking Lot Suggestions** — View nearby parking lots color-coded by type (student, visitor, faculty) when selecting an event
- **Event Search & Filter** — Search events by name and filter by category
- **Event Schedule** — View upcoming events on a calendar
- **Mobile Responsive** — Optimized for phone screens based on student survey feedback
- **Input Validation** — API requests validated with Zod schemas before database queries

---

## Project Structure

```
cs416-campus-map/
├── frontend/
│   ├── app/
│   │   ├── api/                  # Next.js API routes
│   │   │   ├── events/           # GET events sorted by date
│   │   │   ├── parking/          # GET nearest parking lots
│   │   │   └── directions/       # GET driving route via Mapbox
│   │   ├── (dashboard)/          # Authenticated layout
│   │   │   ├── events/           # Events listing page
│   │   │   ├── map/              # Interactive map page
│   │   │   ├── mapRouting/       # Driving directions page
│   │   │   └── eventSchedule/    # Event calendar page
│   │   └── layout.tsx
│   ├── components/
│   │   ├── map/                  # MapContainer, MapMarker, RouteOverlay
│   │   ├── events/               # EventCard, EventFilters, ParkingSuggestions
│   │   └── layout/               # Sidebar, Navbar, MobileNav
│   ├── data/                     # Mock/seed data
│   ├── lib/                      # Supabase client, utilities
│   └── package.json
├── docs/                         # UML diagrams, screenshots
├── .gitignore
├── README.md
└── git-branch-strategy.md
```

---

## Database Schema

### `events`

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| name | text (NOT NULL) | Event name |
| description | text | Event description |
| start_date | timestamp (NOT NULL) | Event start date |
| end_date | timestamp | Event end date |
| latitude | float | Event location latitude |
| longitude | float | Event location longitude |
| location | text | Building or venue name |
| category | text | Event category |
| image_url | text | Event image |
| url | text | Hyperlink to official PNW events page |

### `parking_lots`

| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| name | text (NOT NULL) | Lot name |
| latitude | float (NOT NULL) | Lot latitude |
| longitude | float (NOT NULL) | Lot longitude |
| capacity | integer | Estimated max capacity |
| buildings_nearby | text | Closest campus buildings |
| lot_type | text | student, visitor, or faculty |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | Returns all events sorted ascending by date |
| GET | `/api/parking?eventId=` | Returns nearest parking lots to an event location |
| GET | `/api/directions?from=` | Geocodes address and returns driving route via Mapbox Directions API |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A Supabase project with the tables above created
- A Mapbox access token

### Installation

1. Clone the repository:

```bash
git clone https://github.com/CS-416-Team2/cs416-campus-map.git
cd cs416-campus-map/frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deployment

The application is deployed on Vercel. Pushing to the `release` branch triggers an automatic build and deployment.

---

## Authors

Developed by **CS416 Team 2** — Purdue University Northwest
