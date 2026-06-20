<div align="center">

```
██╗██████╗  ██████╗ ███╗   ██╗██╗      ██████╗  ██████╗
██║██╔══██╗██╔═══██╗████╗  ██║██║     ██╔═══██╗██╔════╝
██║██████╔╝██║   ██║██╔██╗ ██║██║     ██║   ██║██║  ███╗
██║██╔══██╗██║   ██║██║╚██╗██║██║     ██║   ██║██║   ██║
██║██║  ██║╚██████╔╝██║ ╚████║███████╗╚██████╔╝╚██████╔╝
╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝ ╚═════╝  ╚═════╝
```

**Track Your Lifts. Own Your Progress.**

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

---

## What is IronLog?

IronLog is a full-stack progressive overload tracker built for lifters who take their training seriously. Most gym apps are either too simple (just a note pad) or too bloated (subscription walls, social feeds, calorie counters nobody asked for). IronLog is neither.

The core idea is simple: **every set you log becomes data, and that data tells you exactly whether you're getting stronger**. PR detection is automatic, charts are built for clarity not decoration, and the whole experience is designed around the one thing that actually builds muscle — progressive overload.

Built by a lifter, for lifters. No monetisation. No bloat.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React 19 + TypeScript + Vite 8 | Type-safe UI, fast HMR, modern bundler |
| **Styling** | TailwindCSS v4 | Custom dark-mode design system via `index.css` |
| **Charts** | Recharts 3 | AreaChart with SVG gradient fills + dynamic data bucketing |
| **Animations** | Framer Motion | Spring-physics PR toast, completion screen transitions |
| **Drag & Drop** | @dnd-kit | Exercise reordering within split days |
| **Backend** | Node.js + Express 5 | REST API, async handlers, ES modules |
| **Database** | PostgreSQL via Neon DB | Serverless Postgres — strong aggregate SQL |
| **Query Layer** | `pg` (node-postgres) | Raw parameterised SQL. No ORM — intentional |
| **Auth** | Clerk | JWT verification, OAuth, session management |
| **Validation** | Zod | Server-side schema validation on all request bodies |
| **HTTP Client** | axios + AxiosInterceptor | Auto-attaches Clerk JWT to every outbound request |

---

## Features

### 🏋️ Split Builder
- Create named weekly training splits (e.g. PPL, Upper/Lower)
- 7 days auto-created per split — tap any day to edit
- Add exercises from the library, drag-to-reorder via @dnd-kit
- Toggle individual days as rest days — they're excluded from streak calculations

### 📋 Session Logging
- Home page shows today's split day, muscle groups, exercise count
- One tap starts a workout — session created instantly, navigate to `/session/:id`
- Sets pre-filled with your previous best weight/reps
- Weight and rep changes propagate downward to all unlogged sets automatically
- Skip today with a single tap (creates `is_skipped=true` record, undoable)

### 🏆 PR Detection & Toast
- Every set insert runs `SELECT MAX(weight_kg)` for that exercise — PR detected in real time
- When a PR is hit mid-session, a sliding toast animates up from the bottom: **"🏆 New PR — Bench Press 105 kg"**
- Auto-dismisses in 3 seconds with a draining progress bar
- `is_pr` stored on the set record permanently

### 📈 Progressive Overload Charts
- Per-exercise AreaChart with custom SVG gradient fill (orange → transparent)
- Toggle between **Max Weight** and **Volume** (total kg lifted per session)
- Five time ranges: 1W / 1M / 3M / 6M / 1Y
- Dynamic downsampling keeps charts readable at scale:
  - 1W / 1M → raw daily data points
  - 3M → 3-day peak buckets
  - 6M → 7-day peak buckets
  - 1Y → 14-day peak buckets
- `outline: none` CSS prevents browser focus-ring artifacts on SVG elements

### 📅 Session History
- Paginated session list with load-more (10 per page)
- Month summary card: sessions completed, volume, PRs hit vs prior month
- All-time PR hero card per exercise with the date it was set

### 👤 Profile & Streak
- **Streak counter**: consecutive days with a logged session. Rest days don't break it — only unplanned skips do. Calculated via the active split's `is_rest` flags
- **Days showing up**: `Math.floor((now - created_at) / 86400000)` — membership age
- Monthly stats: sessions this month, sessions this week, best-ever streak

### 🤖 AI Coach (Phase 2 — Planned)
- RAG pipeline: weekly/exercise/monthly summaries embedded via OpenAI, stored in Qdrant (3 collections, all filtered by `user_id`)
- GPT-4o first (Phase 2a), then fine-tuned Mistral 7B via QLoRA (Phase 2b)
- Streaming responses via SSE — tokens render as they arrive
- Frontend already scaffolded: `AICoachPage`, `InsightsTab`, `ChatTab`, `ChatInputBar`

---

## Architecture

```
Page (orchestrator)          ← owns state, wires handlers
  ↓ passes props to
Component (presentational)   ← renders what it receives, no logic
  ↑ data from
Hook (data bridge)           ← calls services, manages loading/error state
  ↑ calls
Service (API layer)          ← plain async functions, axios calls to backend
  ↑ typed by
Types (contracts)            ← src/types/index.ts, shared across all layers
```

**Backend follows the same layering:**
```
Route → Controller → Service → Pool (raw SQL) → PostgreSQL
```

Every backend service function that touches the DB receives `user_id` and enforces ownership. No route can read or write another user's data.

### Project Structure

```
ironlog/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── pages/              # 12 pages — orchestrators
│   │   │   ├── HomePage.tsx
│   │   │   ├── SessionPage.tsx
│   │   │   ├── ExerciseDetailPage.tsx
│   │   │   ├── SplitDetailPage.tsx
│   │   │   ├── SplitDayDetailPage.tsx
│   │   │   └── ...
│   │   ├── components/         # Presentational, organised by feature
│   │   │   ├── Session/        # PRToast, ExerciseView, BottomNav, ...
│   │   │   ├── Home/           # HeroCard, CoachNudge, QuickStats, ...
│   │   │   ├── Splits/         # ExerciseSelectorModal, ...
│   │   │   └── ...
│   │   ├── hooks/              # Data bridges
│   │   │   ├── useSession.ts
│   │   │   ├── useHomeDashboard.ts
│   │   │   ├── useSplitDetail.ts
│   │   │   └── ...
│   │   ├── services/           # axios API calls
│   │   └── types/index.ts      # All TypeScript contracts
│   └── MASTER_LOGIC_GUIDE.md   # Architecture + implementation guide
│
├── server/                     # Express 5 backend
│   ├── controllers/            # Request/response handling
│   ├── services/               # Business logic + SQL queries
│   ├── routes/                 # Route definitions + middleware binding
│   ├── middlewares/
│   │   └── clerkAuth.middleware.js   # Verifies JWT, attaches req.user
│   └── db/
│       ├── migrations/         # 13 sequential SQL migration files
│       └── seedData/           # Exercise seed data (65 exercises)
│
├── docker-compose.yaml         # Local PostgreSQL instance
├── insertDummy.js              # Progressive overload seeding script
├── deleteDummy.js              # Cleanup seeded data
└── IronLog_PRD_v2.8.docx       # Full Product Requirements Document
```

---

## Database Schema

Seven tables. Each earns its place.

| Table | Description |
|---|---|
| `users` | App-specific data only. Auth owned by Clerk, linked via `clerk_id` |
| `splits` | Named weekly training plans. One active at a time (`is_active`) |
| `split_days` | 7 days per split. `day_of_week` is immutable. `is_rest` controls streak logic |
| `exercises` | 65 seeded exercises across 9 muscle groups. `form_guide` stored as JSONB |
| `split_day_exercises` | Junction table with `order_index` for drag-to-reorder |
| `sessions` | One gym visit. `is_skipped` + `is_completed` flags. `UNIQUE(user_id, split_day_id, date)` |
| `sets` | The atomic data unit. `weight_kg`, `reps`, `is_pr` auto-set on insert |

**Key design decisions:**
- All PKs are UUIDs (`gen_random_uuid()`)
- All timestamps are `TIMESTAMPTZ DEFAULT now()`
- `updated_at` maintained by a Postgres trigger on every table
- No ORM — raw parameterised SQL (`$1, $2`) throughout. Zero string interpolation

---

## API Reference

All routes require a valid Clerk JWT except `GET /api/exercises`.

```
Splits
  POST   /api/splits                       Create split (auto-creates 7 days)
  GET    /api/splits                       Get all splits for user
  GET    /api/splits/:id                   Get split with nested days + exercises
  PUT    /api/splits/:id                   Rename split
  DELETE /api/splits/:id                   Delete split
  PATCH  /api/splits/:id/activate          Set as active split

Split Days
  PATCH  /api/split-days/:id               Update label or is_rest

Split Day Exercises
  POST   /api/split-day-exercises          Add exercise to day
  DELETE /api/split-day-exercises/:id      Remove exercise
  PATCH  /api/split-day-exercises/:id      Reorder (update order_index)

Exercises
  GET    /api/exercises                    List all (?muscle_group= ?equipment=)
  GET    /api/exercises/:id                Exercise detail + form guide
  GET    /api/exercises/:id/progress       Max weight + volume per session over time
  POST   /api/exercises                    Create custom exercise

Sessions
  POST   /api/sessions                     Start session { split_day_id, date, is_skipped? }
  GET    /api/sessions                     All sessions for user
  GET    /api/sessions/history             Paginated (?limit=10&offset=0)
  GET    /api/sessions/summary             Month summary (?month=YYYY-MM)
  GET    /api/sessions/missed              Missed training days
  GET    /api/sessions/:id                 Session + nested sets
  PATCH  /api/sessions/:id/complete        Mark session done
  DELETE /api/sessions/:id                 Delete (used for undo-skip)

Sets
  POST   /api/sets                         Log set — PR auto-detected on insert
  PUT    /api/sets/:id                     Update weight/reps
  DELETE /api/sets/:id                     Delete set

Users
  GET    /api/users/me                     Current user profile
  PATCH  /api/users/me                     Update name / picture / workout time
  GET    /api/users/me/stats               Streak, monthly sessions, best streak
```

---

## Security

| Concern | Implementation |
|---|---|
| **SQL injection** | Parameterised queries (`$1, $2`) throughout. Zero string interpolation in SQL |
| **Auth** | Clerk JWT verified via `ClerkExpressRequireAuth()` on every protected route |
| **IDOR** | Every DB query enforces `user_id = req.user.id` — directly or via JOIN |
| **Input validation** | Zod validates all request bodies server-side. Invalid input → 400 before any DB call |
| **CORS** | Explicit origin whitelist. Never `cors()` with no config |
| **Secrets** | All in `.env`, never committed. `.env.example` committed instead |
| **Error responses** | No stack traces or DB errors exposed to the client |

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL (local via Docker, or a Neon DB connection string)

### 1. Clone & install

```bash
git clone https://github.com/your-username/ironlog.git
cd ironlog

# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 2. Environment variables

**`server/.env`**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ironlog
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
PORT=5001
CLIENT_URL=http://localhost:5173
```

**`client/.env`**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:5001
```

### 3. Database setup

```bash
# Start local Postgres via Docker
docker-compose up -d

# Run migrations (from repo root)
node runMigration.js
```

### 4. (Optional) Seed dummy data

```bash
# Inject realistic progressive overload data to test charts
node insertDummy.js

# Remove it when done
node deleteDummy.js
```

### 5. Run

```bash
# Backend (from /server)
npm run dev          # nodemon — hot reload

# Frontend (from /client)
npm run dev          # Vite — http://localhost:5173
```

---

## Deployment

| Service | What it hosts | Free tier |
|---|---|---|
| [Railway](https://railway.app) | Express backend | ✅ 500 hrs/month |
| [Neon](https://neon.tech) | PostgreSQL | ✅ 0.5 GB storage |
| [Vercel](https://vercel.com) | React frontend | ✅ Unlimited |
| [Clerk](https://clerk.com) | Auth | ✅ 10,000 MAU |

See [DEPLOY.md](./DEPLOY.md) for step-by-step instructions.

---

## What I Learned Building This

This project was built as a deep learning exercise — not to ship fast, but to understand every layer of the stack fluently.

**Full-stack fundamentals:** Why parameterised SQL prevents injection at the driver level. How Clerk's JWT middleware chain works. What `ON DELETE CASCADE` actually does in Postgres. How to write aggregate queries (`GROUP BY`, `MAX`, `SUM`) that answer real product questions. How Express middleware order matters for async error handling.

**Frontend patterns:** The page → component → hook → service architecture and why it keeps complexity manageable. How to use `useCallback` to prevent effect re-runs. How Recharts SVG rendering works under the hood and why `outline: none` is needed on chart wrappers.

**Data modelling:** Why `UNIQUE(user_id, split_day_id, date)` prevents ghost sessions. Why `is_rest` belongs on `split_days` not on `sessions`. Why storing `user_id` directly on `sets` speeds up queries without violating normalisation.

The goal was to be able to explain every file, every query, and every design decision without hesitation — not just that it works, but why.

---

<div align="center">
<sub>Built with obsession by Aadish · June 2026</sub>
</div>