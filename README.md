# JobLinker

A full-stack job board platform connecting candidates, recruiters, and administrators — built with **React 19 + TypeScript** on the front end and **Express 5 + PostgreSQL** on the back end, following a clean layered architecture.

![CI](https://github.com/th23mer/JobLinker/actions/workflows/accessibility.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Features

**For candidates**
- Browse and search job offers by category, specialty, contract type, and city
- Apply to offers with drag-and-drop CV upload (PDF)
- Personal dashboard to track application status
- Guided profile completion (skills, education, experience, motivation letter)

**For recruiters**
- Dashboard with live stats (offers, applications, pending reviews)
- Multi-step offer creation form with validation
- Review applicants in a full-page candidate details view, download CVs
- Accept / reject applications — candidates are notified by email

**For administrators**
- Moderate the platform: every offer goes through an admin review before publication
- Approve or suspend recruiter accounts
- Manage categories and specialties

**Platform**
- 🔐 JWT authentication with role-based access control (candidate / recruiter / admin)
- 🌍 Bilingual UI — French & English, persisted per user
- ✉️ Transactional emails (application updates, password reset) via Nodemailer
- ♿ Accessibility budget enforced in CI with Lighthouse (score ≥ 90)

## 🛠️ Tech stack

| Layer | Technologies |
|---|---|
| Front end | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui (Radix), React Router 7 |
| Back end | Node.js, Express 5, TypeScript, JWT, bcrypt, Multer, Nodemailer |
| Database | PostgreSQL (`pg` driver, raw SQL — no ORM) |
| CI | GitHub Actions + Lighthouse CI (accessibility) |

## 🏗️ Architecture

The server follows a layered architecture with dependency inversion — every layer depends on interfaces, not implementations, and dependencies are wired once at startup:

```
Routes → Controllers → Services → Repositories → PostgreSQL
                          ↑            ↑
                   interfaces/services  interfaces/repositories
```

```
├── client/                  # React SPA (Vite)
│   └── src/
│       ├── pages/           # Landing, Offres, dashboards (candidate/recruiter/admin)…
│       ├── components/      # Feature components + shadcn/ui primitives
│       ├── context/         # Auth, language, profile modals
│       ├── hooks/           # useProfile, useTranslation
│       └── services/api.ts  # Typed API client
└── server/                  # Express REST API
    └── src/
        ├── routes/          # Route factories per resource
        ├── controllers/     # HTTP layer
        ├── services/        # Business logic (+ Mailer)
        ├── repositories/    # SQL data access
        ├── interfaces/      # Entities & layer contracts
        ├── middleware/      # Auth (JWT), uploads (Multer), error handler
        └── schema.sql       # Database schema
```

## 🚀 Getting started

**Prerequisites:** Node.js 20+, PostgreSQL 14+

### 1. Database

```bash
cd server
cp .env.example .env          # then edit DB credentials & JWT secret
node create-db.js             # creates the project_db database
psql -U postgres -d project_db -f src/schema.sql
```

### 2. Back end

```bash
cd server
npm install
npm run seed:demo             # optional: demo data with sample accounts & CVs
npm run dev                   # → http://localhost:3000
```

### 3. Front end

```bash
cd client
npm install
npm run dev                   # → http://localhost:5173 (proxies /api to :3000)
```

### Demo accounts

After `npm run seed:demo` (password for all accounts: `password123`):

| Role | Email |
|---|---|
| Admin | `admin@joblinker.test` |
| Recruiter | `recruteur.tech@joblinker.test` |
| Candidate | `khaled.hachicha@joblinker.test` |

## 📡 API overview

| Resource | Base route | Highlights |
|---|---|---|
| Auth | `/api/auth` | register, login, password reset |
| Offers | `/api/offres` | CRUD, filtering, admin validation workflow |
| Applications | `/api/candidatures` | apply with CV upload, status transitions + email |
| Candidates | `/api/candidats` | profile, skills, CV management |
| Recruiters | `/api/recruteurs` | profile, account approval |
| Categories / Specialties | `/api/categories`, `/api/specialites` | taxonomy management |

Health check: `GET /api/health`

## 📄 License

[MIT](LICENSE)
