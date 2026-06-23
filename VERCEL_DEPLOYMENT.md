# Vercel Production Deployment Guide

Follow these steps to deploy **Recipe Vault** to Vercel in just a few clicks.

---

## Prerequisites

1. Ensure you have pushed your project code to a public or private **GitHub** repository.
2. Ensure you have set up a **Supabase** instance and run the schema queries in the SQL editor (refer to [SUPABASE_SETUP.md](file:///c:/Users/HP/OneDrive/Documents/recipie%20mangement%20system/SUPABASE_SETUP.md)).

---

## Step 1: Link Repository to Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Select your git provider (GitHub) and import your `recipe-vault` repository.

---

## Step 2: Configure Environment Variables

Before clicking Deploy, expand the **Environment Variables** section in the Vercel setup panel. Add the following three keys exactly as written:

| Key | Description | Example / Value |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project API URL | `https://your-proj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Anon key for browser queries | `eyJhbGciOiJIUzI1Ni...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key for backend uploads/imports | `eyJhbGciOiJIUzI1Ni...` |

---

## Step 3: Production Build Options

The framework configurations are automatically resolved:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (or resolved from `vercel.json` which executes `npm run build`)
- **Output Directory**: `.next`

---

## Step 4: Deploy and Verify

1. Click **Deploy**. Vercel will clone your GitHub repo, run typechecking, lint checks, compile CSS themes, and package routes.
2. In less than 2 minutes, you will receive a preview screenshot and a public URL (e.g. `https://recipe-vault.vercel.app`).
3. Click the link to open your live production site!

---

## Step 5: Post-Deployment Verification

1. **Verify Database Listings**: Browse to the dashboard or browse catalog. You should see the pre-seeded folders load instantly.
2. **Verify Image Uploads**: Add a recipe, upload a file from your device, and verify it uploads and renders correctly.
3. **Verify Exports**: Trigger a PDF download or a JSON backup to check that client-side download files are generated.
