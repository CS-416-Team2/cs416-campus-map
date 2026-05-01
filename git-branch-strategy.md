# Git Branch Workflow Instructions

## Project: UML and Developments on Linux Platform

A full-stack web application for Purdue University Northwest that displays student life events with hyperlinks to the official PNW events page, suggests parking lots, and provides driving routes via Mapbox integration.

**Tech Stack:** Frontend (Next.js / React / TypeScript / Tailwind CSS / shadcn/ui), Backend (Next.js API Routes), Database (Supabase / PostgreSQL), Deployment (Vercel), OS (Ubuntu via VirtualBox)

This project uses:

- `release` → stable, production-ready code (deployed on Vercel)
- `develop` → main development branch
- `feature/...` → individual features and bug fixes

---

## 1. Clone the Repository (once)

```bash
git clone https://github.com/CS-416-Team2/cs416-campus-map.git
cd cs416-campus-map
```

---

## 2. Get the Latest Branches

```bash
git checkout release
git pull origin release
git checkout develop
git pull origin develop
```

---

## 3. Create Your Feature Branch FROM `develop`

Always branch off `develop`, NOT `release`.

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

Examples:

```bash
git checkout -b feature/event-listing
git checkout -b feature/map-markers
git checkout -b feature/parking-api
git checkout -b feature/driving-route
git checkout -b feature/supabase-schema
```

---

## 4. Push Your Branch to GitHub

```bash
git push -u origin feature/your-feature-name
```

---

## 5. Work on Your Code and Commit

```bash
git add .
git commit -m "Describe what you added/changed"
git push
```

### Commit Message Examples

```
feat: display events sorted ascending by date
feat: add hyperlink button to PNW events page
feat: render event markers with popup cards
feat: add directions API route with mapbox geocoding
feat: create events and parking_lots tables
feat: seed parking lot data with coordinates
fix: correct marker position on campus map
docs: update git-branch-strategy.md
chore: setup tailwind and shadcn/ui
```

---

## 6. Keep Your Branch Updated with `develop`

Do this often to avoid merge conflicts:

```bash
git checkout develop
git pull origin develop
git checkout feature/your-feature-name
git merge develop
```

---

## Creating a Pull Request (Feature → Develop)

1. Go to the GitHub repository
2. Click **"Compare & pull request"** (or go to **Pull Requests → New Pull Request**)
3. Set:
   - **Base branch:** `develop`
   - **Compare branch:** `feature/your-feature-name`
4. Add a title and description
5. Click **"Create Pull Request"**
6. Post the PR link in the Discord QA channel for review

---

## Merging the Pull Request

1. QA reviews and tests the changes
2. Click **"Merge Pull Request"**
3. Click **"Confirm Merge"**
4. Delete the branch after merging (recommended)

---

## Merging `develop` into `release`

When the team is ready to push stable code to production:

1. Create a Pull Request:
   - **Base:** `release`
   - **Compare:** `develop`
2. Review and approve
3. Merge on GitHub
4. Vercel automatically deploys from `release`

After merging, everyone should pull the latest:

```bash
git checkout release
git pull origin release
git checkout develop
git pull origin develop
```

---

## Branch Naming Examples

### Frontend
- `feature/event-listing`
- `feature/event-detail-view`
- `feature/map-markers`
- `feature/parking-lot-display`
- `feature/driving-route`
- `feature/mobile-layout`
- `fix/event-sort-order`

### Backend
- `feature/events-api`
- `feature/parking-api`
- `feature/directions-api`
- `fix/api-error-handling`

### Database
- `feature/supabase-schema`
- `feature/seed-event-data`
- `feature/seed-parking-data`

---

## Project Structure

```
cs416-campus-map/
├── frontend/              # Next.js application
│   ├── app/               # App Router pages and API routes
│   ├── components/        # React components
│   └── package.json
├── docs/                  # Diagrams, screenshots
├── .gitignore
├── README.md
└── git-branch-strategy.md
```

---

## Rules

- **NEVER** push directly to `release` or `develop`
- **ALWAYS** branch from `develop`
- **ALL** feature work goes into `develop` via Pull Requests
- **ONLY** `develop` gets merged into `release` when stable
- Keep your branch updated regularly to avoid conflicts
- Post all PRs in the Discord QA channel for review
- Take screenshots of your contributions for the project report
- All team members must have visible commits and pull requests on GitHub

---

Follow this workflow for all development.
