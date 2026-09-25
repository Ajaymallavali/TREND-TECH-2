# TREND-TECH

A production-grade **shopping intelligence and price-comparison platform** built on the MERN stack — search products, compare prices across stores, view historical price trends, get deal scores, track products, and receive price-drop alerts.

> Original product, original design. Not affiliated with or copying any existing marketplace-intelligence brand. Marketplace data in development mode is served through **mock adapters** and clearly labeled as such — see [Data Integrity](#data-integrity).

## Stack

- **Frontend:** React + Vite, React Router, Tailwind CSS, TanStack Query, Zustand, Recharts, React Hook Form + Zod, Framer Motion
- **Backend:** Node.js + Express, MongoDB + Mongoose, Redis + BullMQ, JWT (access + rotating refresh), Argon2, Zod, Helmet
- **Infra:** Docker Compose (Mongo + Redis), GitHub Actions CI

## Project layout

```
TREND-TECH/
├── client/    # React app
├── server/    # Express API
├── shared/    # types/constants shared across client & server (added as needed)
├── docker-compose.yml
└── .env.example
```

## Getting started

```bash
cp .env.example server/.env      # fill in real secrets before running
docker compose up -d             # starts MongoDB + Redis
npm install                      # installs client + server workspaces
npm run dev:server               # http://localhost:5000
npm run dev:client               # http://localhost:5173
```

Health check: `GET /api/health`

## Data integrity

The platform never presents mock data as if it were live. Every price surfaces one of:

- `Live Price` — fetched from a real, authorized source
- `Mock Price` — from the seeded development dataset
- `Last Updated <timestamp>`
- `Unavailable`

Marketplace adapters never bypass CAPTCHAs, robots.txt, authentication, or other access controls. Production integrations must use authorized APIs, affiliate feeds, or licensed data providers.

## Build phases

This project is being built incrementally, per phase, with tests and verification between each. Status:

- [x] **Phase 1 — Project setup:** MERN scaffold, Tailwind, JWT auth (register/login/refresh/logout/forgot-reset/change password), RBAC middleware, rate limiting, security middleware, structured logging, health check, Docker Compose, CI
- [ ] Phase 2 — Core database models (Product, Marketplace, MarketplaceProduct, PriceHistory)
- [ ] Phase 3 — Marketplace adapter system
- [ ] Phase 4 — Product search
- [ ] Phase 5 — Product details
- [ ] Phase 6 — Price comparison
- [ ] Phase 7 — Price history
- [ ] Phase 8 — Watchlist
- [ ] Phase 9 — Price alerts
- [ ] Phase 10 — Redis + BullMQ workers
- [ ] Phase 11 — Coupons
- [ ] Phase 12 — Deals
- [ ] Phase 13 — Recommendations / lookalikes
- [ ] Phase 14 — User dashboard
- [ ] Phase 15 — Admin dashboard
- [ ] Phase 16 — Analytics
- [ ] Phase 17 — Testing
- [ ] Phase 18 — Performance optimization
- [ ] Phase 19 — Security hardening
- [ ] Phase 20 — Deployment + CI/CD polish

## Auth API (Phase 1)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account, sets auth cookies |
| POST | `/api/auth/login` | — | Log in, sets auth cookies |
| POST | `/api/auth/refresh` | refresh cookie | Rotates access + refresh tokens |
| POST | `/api/auth/logout` | refresh cookie (optional) | Clears session |
| GET  | `/api/auth/me` | access | Current user |
| POST | `/api/auth/forgot-password` | — | Issues reset token (emailed in prod) |
| POST | `/api/auth/reset-password` | — | Consumes reset token |
| POST | `/api/auth/change-password` | access | Changes password |

Security notes: passwords hashed with **Argon2**; refresh tokens are **rotated on every use** and stored server-side only as a SHA-256 hash; failed logins **lock the account for 15 minutes** after 5 attempts; all responses use the standard `{ success, data, message }` / `{ success, error: { code, message } }` envelope.

## Phase 1 — Reliable local setup

1. Use Node.js 20 LTS or newer.
2. Install dependencies from the repository root:

```bash
npm install
```

3. Copy `.env.example` to `.env` at the repository root (or to the server working directory if running the server directly) and replace the JWT and cookie secrets with long random values.
4. Start MongoDB and Redis:

```bash
npm run docker:up
```

5. Start the API:

```bash
npm run dev:server
```

6. In another terminal start the client:

```bash
npm run dev:client
```

7. Open `http://localhost:5173`.

### Authentication routes

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password?token=...`
- `/dashboard`

In development, the forgot-password endpoint returns the generated reset token in its response to make local testing possible. Do not expose that development-only behavior in production; production should deliver the reset link through SMTP/queue infrastructure.
