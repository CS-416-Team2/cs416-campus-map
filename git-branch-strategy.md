# Git Branch Workflow Instructions

## Project: PNW Student Life Events Website

A full-stack web application for Purdue University Northwest that displays student life events, handles event registration, suggests parking lots, and provides driving routes via map integration.

**Tech Stack:** Frontend (React/Next.js), Backend (Node.js/Python/Flask), Database (MySQL), Containerization (Docker), OS (Ubuntu via VirtualBox)

This project uses:

- `main` → stable, production-ready code
- `develop` → main development branch
- `feature/...` → individual features and bug fixes

---

## 1. Clone the Repository (once)

```bash
git clone <REPO_URL>
cd <REPO_NAME>
```

---

## 2. Get the Latest Branches

```bash
git checkout main
git pull origin main
git checkout develop
git pull origin develop
```

---

## 3. Create Your Feature Branch FROM `develop`

Always branch off `develop`, NOT `main`.

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

Examples:

```bash
git checkout -b feature/event-listing-page
git checkout -b feature/student-registration-api
git checkout -b feature/parking-lot-search
git checkout -b feature/driving-route-map
git checkout -b feature/mysql-schema
git checkout -b feature/docker-setup
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
feat: add event listing page with ascending date sort
feat: create student registration API endpoint
feat: integrate OpenStreetMap for driving routes
fix: correct MySQL connection timeout issue
docs: add API endpoint documentation
chore: update Docker Compose configuration
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

---

## Merging the Pull Request

1. Review changes
2. Click **"Merge Pull Request"**
3. Click **"Confirm Merge"**
4. Delete the branch after merging (recommended)

---

## Merging `develop` into `main`

When the team is ready to push stable code to production:

1. Create a Pull Request:
   - **Base:** `main`
   - **Compare:** `develop`
2. Review and approve
3. Merge on GitHub

After merging, everyone should pull the latest:

```bash
git checkout main
git pull origin main
git checkout develop
git pull origin develop
```

---

## Branch Naming Examples

### Frontend
- `feature/event-listing-page`
- `feature/event-detail-modal`
- `feature/student-registration-form`
- `feature/parking-lot-display`
- `feature/driving-route-map`
- `fix/event-sort-order`

### Backend
- `feature/events-api`
- `feature/registration-api`
- `feature/parking-api`
- `feature/map-api-integration`
- `fix/db-connection-error`

### Database
- `feature/mysql-schema`
- `feature/seed-event-data`

### DevOps
- `feature/docker-compose`
- `feature/dockerfile-frontend`
- `feature/dockerfile-backend`
- `chore/update-docker-config`

---

## Project Structure

```
student-life-events/
├── frontend/              # Frontend application
├── backend/               # Backend API server
├── database/              # MySQL schema, migrations, seed data
├── .gitignore
├── README.md
└── git-branch-strategy.md
```

---

## Rules

- **NEVER** push directly to `main` or `develop`
- **ALWAYS** branch from `develop`
- **ALL** feature work goes into `develop` via Pull Requests
- **ONLY** `develop` gets merged into `main` when stable
- Keep your branch updated regularly to avoid conflicts
- Take screenshots of your contributions for the project report
- All team members must have visible commits and pull requests on GitHub

---

Follow this workflow for all development.
