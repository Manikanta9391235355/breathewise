# Munim — Vercel & Supabase Deployment Guide

This guide explains how to deploy Munim on **Vercel** with full FastAPI serverless support, automated database seeding, and optional **Supabase PostgreSQL** integration.

---

## 1. Is Only Vercel Enough, or Do You Need Supabase?

| Option | Setup Required | Pros | Cons / Limitations |
| :--- | :--- | :--- | :--- |
| **Option A: Vercel Alone (Default SQLite)** | **Zero extra setup.** Just connect your GitHub repo to Vercel and deploy. | Boots instantly. Reads synthetic data, answers Telugu/Hindi voice queries with Sarvam AI, and displays all KPI cards. | Vercel's serverless containers have an ephemeral filesystem. Mutations (like simulated live payments or uploaded files) live in `/tmp` and reset when the serverless container spins down. |
| **Option B: Vercel + Supabase (Recommended for Production)** | Create a free database at [supabase.com](https://supabase.com) and paste `DATABASE_URL` in Vercel. | 100% persistent. Live payments, approvals, and uploaded CSVs are saved permanently in PostgreSQL across all sessions and judges. | Requires a free Supabase account (takes 60 seconds). |

> **Recommendation**: Start by deploying **Option A** on Vercel so your live URL is up immediately. Then, whenever you have 2 minutes, create a free database on Supabase and add `DATABASE_URL` in Vercel to upgrade to permanent persistence without changing any code!

---

## 2. Project Files Configured for Vercel

The repository is pre-configured with everything Vercel needs:

1. **[`vercel.json`](file:///d:/content/vercel.json)**:
   - Builds frontend with `npm run build --prefix frontend`.
   - Serves static assets from `frontend/dist` on Vercel's Edge CDN.
   - Routes `/api/(.*)` to the Python Serverless function at `api/index.py`.
2. **[`api/index.py`](file:///d:/content/api/index.py)**:
   - Python serverless entrypoint exporting the FastAPI `app`.
3. **[`requirements.txt`](file:///d:/content/requirements.txt)**:
   - Dependencies installed automatically by Vercel's Python runtime (including `psycopg2-binary` for Supabase).
4. **[`backend/app/database.py`](file:///d:/content/backend/app/database.py)**:
   - Detects Vercel's environment (`VERCEL=1`) and automatically uses `/tmp/munim.db` for writable SQLite, or connects to PostgreSQL if `DATABASE_URL` is set.
   - Runs auto-seeding on first boot so all 8,296 records are loaded automatically!

---

## 3. Step-by-Step Deployment Instructions

### Method 1: Deploy via Vercel Web Dashboard (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Configure Munim for Vercel and Supabase deployment"
   git push origin main
   ```
2. **Open Vercel Dashboard**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your GitHub repository (`munim` / `content`).
3. **Configure Environment Variables** in Vercel:
   Under **Environment Variables**, add:
   - `SARVAM_API_KEY`: `your_sarvam_api_key_here`
   - `SECRET_KEY`: `munim-paytm-hackathon-2026-secret-key`
   - *(Optional for Supabase)* `DATABASE_URL`: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
4. **Click Deploy**:
   Vercel will:
   - Run `npm run build --prefix frontend` (producing the optimized React SPA).
   - Install Python dependencies from `requirements.txt`.
   - Provide you with a live HTTPS URL (e.g., `https://munim-merchant-ai.vercel.app`).

---

### Method 2: Deploy via Vercel CLI

From your project root directory:

```bash
# 1. Login to Vercel
npx vercel login

# 2. Deploy preview
npx vercel

# 3. Add Environment Variables (when prompted or via web)
npx vercel env add SARVAM_API_KEY production

# 4. Deploy to Production
npx vercel --prod
```

---

## 4. Connecting Supabase PostgreSQL (Optional, 60 Seconds)

1. Go to [supabase.com](https://supabase.com) and click **New project**.
2. Name it `munim-db` and set a database password.
3. In **Project Settings** > **Database** > **Connection string**, select **URI**.
4. Copy the URI string:
   ```
   postgresql://postgres.[REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```
5. In **Vercel** > **Project Settings** > **Environment Variables**:
   - Add `DATABASE_URL` with that value.
6. Trigger a redeploy in Vercel.
7. Munim will automatically create the PostgreSQL tables and seed all demo data!
