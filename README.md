# CS416 Campus Map

PLACEHOLDER

> **CS416 Software Engineering — Group Project 3**
> Purdue University Northwest · Team 2


---

## Project Overview

PLACEHOLDER

---

## Business Scenario

PLACEHOLDER

---

## Tech Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Frontend      | PLACEHOLDER |
| Backend       | PLACEHOLDER               |
| Database      | PLACEHOLDER                               |
| Authentication          | PLACEHOLDER |
| Containerization | Docker (Ubuntu 24.04)            |
| Version Control | GitHub ([branching strategy](git-branch-strategy.md)) |

---

## Features

- **Full CRUD** — Create, read, update, and delete courses, assignments, students, and grades
- **CSV Grade Import** — Upload a CSV file to bulk-import student grades into an assignment
- **Per-User Data Isolation** — Each instructor only sees courses and students they own
- **Enrollment Management** — Enroll and unenroll students across multiple courses
- **Custom Sorting** — Student data sorted by score using a custom bubble sort implementation
- **Analytics Dashboard** — View class averages, passing rates, highest scores, and enrollment counts
- **Input Validation** — Frontend schemas validated with Zod; backend enforces score range and required fields
- **Authentication** — Secure instructor login with bcrypt-hashed passwords and session-based auth via NextAuth.js
- **Docker Compose** — Full three-service stack (MySQL, Flask, Next.js) for one-command deployment

---

## Project Structure

```
PLACEHOLDER
```

---

## Database Schema

PLACEHOLDER

---

## API Endpoints

PLACEHOLDER

---

## Getting Started

### Prerequisites

PLACEHOLDER

### Option A: Docker Compose (Recommended)

1. Clone the repository:

```bash
git clone https://github.com/CS-416-Team2/CS416-Course-Dashboard.git
cd CS416-Course-Dashboard
```

PLACEHOLDER

PLACEHOLDER

PLACEHOLDER



---

## Authors

Developed by **CS416 Team 2** — Purdue University Northwest
