# IronLog 🏋️‍♂️

**Track Your Lifts. Own Your Progress.**

IronLog is a comprehensive, full-stack workout tracker built around the core philosophy of **progressive overload**. It doesn't just act as a digital notepad; it structures your workout data to provide actionable insights, visualizes your progress dynamically, and lays the groundwork for an AI-powered coaching layer.

This repository currently reflects **Phase 1** of development: the core full-stack application.

## 🚀 Features

- **Split Builder**: Create named weekly routines (e.g., PPL, Bro Split) and assign exercises to specific days.
- **Session Logging**: Inline set-by-set logging (Weight × Reps) tailored for speed in the gym.
- **Progressive Overload Visualization**: Dynamic `recharts` graphs showing Max Weight and Volume trends over time. Includes an intelligent downsampling algorithm (e.g., 14-day macro-buckets for 1-Year views) to prevent mobile UI clutter.
- **Gamification & Insights**: Automatically tracks your 14-day consistency streaks, membership age, and mid-workout Personal Record (PR) celebrations.
- **Security First**: Granular Insecure Direct Object Reference (IDOR) protection via raw SQL `JOIN` validations ensuring data isolation.

## 🛠️ Tech Stack

**Frontend:**
- React (Vite) + TypeScript
- Tailwind CSS (highly customized aesthetic via `index.css`)
- Recharts (Data Visualization)
- React Router DOM (Global `ScrollToTop` handling)

**Backend:**
- Node.js + Express.js
- Zod (Strict server-side request validation)
- Clerk SDK (JWT Authentication)

**Database:**
- PostgreSQL (Neon Serverless DB)
- `node-postgres` (`pg`) for raw SQL queries.

## 📐 Data Model & Architecture

IronLog uses a strictly relational PostgreSQL database mapped entirely with `UUID` primary keys. 

### Core Entities:
- **`users`**: Linked to Clerk via `clerk_id`.
- **`splits` & `split_days`**: Hierarchical representation of a user's workout program. `split_days` are immutable structural nodes representing the 7 days of a week.
- **`exercises`**: A global library of movements.
- **`sessions`**: Records of actual gym visits mapped to a specific `split_day` and calendar `date`.
- **`sets`**: The atomic unit of data containing `weight_kg`, `reps`, and an auto-calculated `is_pr` boolean.

### Security & Auth Architecture:
We explicitly chose to offload identity management to **Clerk**. Every request hits an Express middleware that verifies the Clerk JWT. 
Crucially, **IDOR protection is baked into the SQL**. Because resources are deeply nested (e.g., updating a set inside a session inside a split day), raw SQL queries `JOIN` back to the `users` table or explicitly check `user_id = $1` to guarantee the authenticated user actually owns the resource they are mutating.

## 🤔 Key Engineering Decisions

1. **Raw SQL over ORMs**: We chose `node-postgres` over Prisma/TypeORM. Writing raw SQL with parameterised `$1, $2` variables guarantees we understand the query execution plan, allows for complex aggregate functions (like our PR detection logic), and prevents abstracted N+1 query problems.
2. **Recharts Downsampling**: To solve the "EKG visual clutter" problem common in fitness apps when viewing a year of daily data, we built a dynamic chunking algorithm. 1-Month views show raw daily peaks, while 6-Month and 1-Year views map data into 7-day or 14-day macro-trend buckets.
3. **Data Seeding (`insertDummy.js`)**: To effectively test the UI, we built a sophisticated seeding script that injects an entire year of daily sessions, simulating realistic progressive overload, rest days, and weight fluctuations.

## ⚙️ Local Development

1. Clone the repository.
2. Install dependencies for both client and server:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
3. Create `.env` files in both directories containing your Clerk keys and Postgres URI.
4. Run the development servers:
   ```bash
   # Terminal 1
   cd server && npm run dev
   
   # Terminal 2
   cd client && npm run dev
   ```

## 🔮 Next Steps (Phase 2)
The next phase introduces the **Agentic AI Layer**. We will build a pipeline that embeds weekly and monthly session summaries into **Qdrant**, serving as context for a Retrieval-Augmented Generation (RAG) chat pipeline, eventually fine-tuning a local Mistral 7B model to replace GPT-4o.