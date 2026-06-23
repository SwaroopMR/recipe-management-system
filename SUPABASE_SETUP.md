# Supabase Integration & Setup Guide

This guide walks you through setting up a Supabase project as the backend database and storage layer for **Recipe Vault**.

---

## 1. Create a New Supabase Project

1. Go to [Supabase Console](https://supabase.com) and log in.
2. Click **New Project** and select your organization.
3. Enter `Recipe Vault` as the project name, choose a database password, and choose a region close to your target audience.
4. Wait a few minutes for the database to provision.

---

## 2. Execute SQL Database Schema

1. Once your project is ready, navigate to the **SQL Editor** tab from the left sidebar.
2. Click **New Query** to create an empty SQL editor sheet.
3. Open the file [supabase_setup.sql](file:///c:/Users/HP/OneDrive/Documents/recipie%20mangement%20system/supabase_setup.sql) in this repository, copy its entire contents, and paste it into the editor.
4. Click **Run** in the bottom-right corner to compile the queries.
5. You should see a success message. This command creates:
   - `recipes`: Holds the core recipe records (with category and difficulty constraints).
   - `collections`: Holds folder headers (pre-seeded with 4 defaults: *Healthy Recipes*, *Quick Recipes*, *Chef Picks*, *Trending Recipes*).
   - `collection_recipes`: Link junction table matching recipes and folders.
   - Database Indices on searched items to optimize loading.
   - A Trigger updating `updated_at` timestamps on recipe edits.
   - **Row Level Security (RLS) Policies** enabling anonymous CRUD access.

---

## 3. Create Public Storage Bucket

The Recipe Vault supports uploading food photos directly. We need to initialize a storage bucket:

1. Navigate to the **Storage** tab in the Supabase console.
2. Click **New Bucket** from the left navigation tree.
3. Enter exactly `recipe-images` as the bucket name.
4. **CRITICAL**: Set the toggle for **Public Bucket** to **Enabled**. (This ensures that anyone can view the images uploaded without needing login tokens).
5. Click **Save** or **Create**.

### Add Storage Access Policies
Since storage buckets have their own security layers, we need to allow anonymous file uploads and reads:
1. Inside the `recipe-images` bucket view, click on **Policies** in the sidebar.
2. Click **New Policy** under the `recipe-images` bucket.
3. Select **Allow public access to all files** (or build a custom policy: select **Insert** and **Select** checkboxes, and set target to `true` for all operations).
4. Save the policy.

---

## 4. Copy Environment Variables

1. Go to **Project Settings** (gear icon in left sidebar) -> **API**.
2. Locate the following keys:
   - **Project URL**: (e.g. `https://xyz.supabase.co`) -> maps to `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon public API key**: (starts with `eyJ...`) -> maps to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role API key** (Click reveal) -> maps to `SUPABASE_SERVICE_ROLE_KEY`
3. Paste these values inside your local [.env.local](file:///c:/Users/HP/OneDrive/Documents/recipie%20mangement%20system/.env.local) file.
