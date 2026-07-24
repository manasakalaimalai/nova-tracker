# Nova Tracker

Finance tracker for Nova Residency Cohort 0. A production-grade ledger app with sponsor tracking, dashboards, and CSV export.

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Prisma** + **Neon Postgres**
- **Tailwind CSS v3**
- **Recharts** (dashboard charts)
- Passcode-based edit mode (no auth library)

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd nova-tracker
npm install
```

### 2. Set up Neon Postgres

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (looks like `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require`)

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require"
EDIT_PASSCODE="choose-a-strong-passcode"
```

### 4. Push schema and seed

```bash
npm run db:push
npm run db:seed
```

This creates the tables and seeds the two default categories (Sponsor Payment, Miscellaneous).

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

### Edit Mode

Click the **Unlock** button in the top-right nav. Enter your `EDIT_PASSCODE`. The session persists in `sessionStorage` (per browser tab, clears on close).

When unlocked:
- **Ledger**: Add/edit/delete transactions inline
- **Sponsors**: Add sponsors, mark as received (auto-creates a credit transaction)

### Pages

| Page | Route | Description |
|---|---|---|
| Ledger | `/` | Full transaction table with filters + sort |
| Sponsors | `/sponsors` | Sponsor tracker with status badges |
| Dashboard | `/dashboard` | Charts, summaries, team stats |

### CSV Export

Click **Export CSV** on the Ledger page (or hit `/api/export` directly). No passcode needed.

### Team Members

Transactions are attributed to: **Madhu**, **Harshita**, **Inchara**

### Adding Categories

When adding a transaction, select **+ New category** from the category dropdown to create one inline without leaving the form.

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-org/nova-tracker.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. In **Environment Variables**, add:
   - `DATABASE_URL` — your Neon connection string
   - `EDIT_PASSCODE` — your chosen passcode
4. Click **Deploy**

Vercel will run `npm install` (which triggers `prisma generate` via `postinstall`) and build automatically.

### 3. First deploy: run migrations

After deploying, the schema needs to be pushed. Either:
- Run `npm run db:push` locally (it connects to the same Neon DB)
- Or use the Vercel CLI: `vercel env pull && npm run db:push`

The seed only needs to run once: `npm run db:seed`

## Database Schema

```
Transaction  ← belongs to Category, optionally Sponsor
Category     ← has many Transactions
Sponsor      ← has many Transactions
```

When a Sponsor is marked as **received**, a credit Transaction is automatically created linked to that sponsor, using the "Sponsor Payment" category.

## Development Notes

- Passcode is stored in `sessionStorage` (not localStorage) — clears on browser close
- All mutating API routes require `x-edit-passcode` header
- Numbers use Indian format: ₹1,00,000
- Fonts: **Fraunces** (serif) for headings/numbers, **Inter** for body
