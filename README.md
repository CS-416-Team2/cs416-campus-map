# PNW Event Map 📍

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Mapbox](https://img.shields.io/badge/Mapbox-Maps-4264fb?style=for-the-badge&logo=mapbox)](https://mapbox.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

An interactive, high-performance campus map and event management platform for Purdue University Northwest. This application helps students discover upcoming campus activities, manage their event schedule, and navigate to campus with real-time routing and parking suggestions.

---

## 🌟 Key Features

- **Interactive Campus Explorer** — Full Mapbox integration with custom markers for events and campus buildings.
- **Smart Routing & Navigation** — Get precise driving or walking directions from your home address directly to campus events.
- **Event Management** — Browse, search, and register for student life events with one click.
- **Personalized Experience** — Save your home address to your profile for instant, one-click routing every time you plan a trip.
- **Real-Time Parking Intelligence** — Suggested parking lots appear automatically for every event, showing distance, walk time, and spot availability.
- **Mobile First Design** — Fully responsive interface optimized for student use on the go.

---

## 🛠️ Technology Stack

### Core Framework
- **[Next.js 15+](https://nextjs.org/)** — React framework for the modern web (App Router).
- **[TypeScript](https://www.typescriptlang.org/)** — Strict type safety for robust application logic.

### Data & Infrastructure
- **[Supabase](https://supabase.com/)** — PostgreSQL database with integrated Auth and real-time capabilities.
- **[Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)** — Lightweight, performant state management for map and navigation state.
- **[TanStack Query](https://tanstack.com/query/latest)** — Asynchronous state management for server data fetching.

### Mapping & UI
- **[Mapbox GL JS](https://www.mapbox.com/mapbox-gljs)** — Industry-standard vector maps and routing engine.
- **[Tailwind CSS](https://tailwindcss.com/)** — Modern utility-first styling with high performance.
- **[Lucide React](https://lucide.dev/)** — Clean, consistent iconography.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** (LTS recommended)
- **npm** (comes with Node.js)
- **Supabase Account** (to host the PostgreSQL database)
- **Mapbox Access Token** (for maps and routing)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/CS-416-Team2/cs416-campus-map.git
   cd cs416-campus-map/frontend/course_map
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the `frontend/course_map` directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Initialize the Database:**
   Import the schema found in `database/dbschema.sql` into your Supabase SQL Editor to create the necessary tables and relationships.

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application in action.

---

## 🏗️ Project Architecture

```
cs416-campus-map/
├── frontend/course_map/      # Primary Next.js Application
│   ├── app/                  # App Router pages and API routes
│   │   ├── api/              # Backend serverless functions
│   │   └── (dashboard)/      # Protected application views
│   ├── components/           # Reusable React components
│   ├── hooks/                # Custom React hooks (Auth, Map State, Directions)
│   ├── lib/                  # Utility libraries and API clients
│   └── types/                # TypeScript definitions and Database schemas
├── database/                 # SQL migration and schema scripts
├── Dockerfile                # Production container configuration
└── docker-compose.yml        # Infrastructure orchestration
```

---

## 🚢 Deployment

### Production Build
To create an optimized production build:
```bash
npm run build
npm start
```

### Infrastructure Options
- **Vercel**: The project is optimized for deployment on Vercel with automatic CI/CD.
- **Docker**: For containerized environments, use the included `Dockerfile` and `docker-compose.yml` to orchestrate the application services.

---

## 👥 Authors

Developed by **CS416 Team 2** — Purdue University Northwest.
*Purdue University Northwest · Software Engineering Course Project*

---
