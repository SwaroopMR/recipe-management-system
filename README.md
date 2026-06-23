# Recipe Vault

Recipe Vault is a production-ready, full-stack digital cookbook. It transitions a legacy Java console recipe database into a beautiful, account-free web application built using **Next.js 15**, **Tailwind CSS v4**, **Framer Motion**, **React Query**, and **Supabase**.

Discover, organize, and preserve your favorite recipes instantly.

---

## 🌟 Key Features

- **Gourmet Cataloging**: Browse recipes in responsive Grid or List views.
- **Advanced Filtering**: Combine instant search queries with multi-selectors for Category, Difficulty, Cuisine, and Prep/Cook time ranges.
- **Dynamic Checklists**: Tick off ingredients and cross out cooking steps dynamically on details pages.
- **Local Favorites**: Save recipes to your browser using account-free `localStorage` syncing.
- **Custom Collections**: Group recipes into folder collections like *Chef Picks* or *Healthy Recipes*.
- **Data Imports/Exports**: Back up or import datasets to/from standard JSON/CSV files.
- **Surprise Me**: Roll a random recipe with an animated slot-machine spinner.
- **PDF & Print Exports**: Download clean, formatted cooking pages or trigger browser print styling (excluding header navbar layout).
- **SEO & Schema Compliance**: Fully optimized page metadata, Open Graph cards, sitemaps, and structured JSON-LD recipe markups.

---

## 🛠️ Technology Stack

- **Core**: Next.js 15 (App Router), React, TypeScript.
- **Styling**: Tailwind CSS v4, global CSS variables, Outfit typography, Framer Motion.
- **Client Queries**: React Query (TanStack Query) for API caching.
- **Database**: PostgreSQL (Supabase DB).
- **Storage**: Supabase Storage buckets for uploaded files.
- **Validation**: Zod schema validation.
- **Linting & Code Checks**: ESLint.

---

## 📂 Project Structure

```text
/
├── .github/workflows/
│   └── ci-cd.yml             # GitHub Actions CI/CD verify workflow
├── public/
│   ├── robots.txt            # Search engine web crawler policies
│   └── sitemap.xml           # Dynamic sitemap index
├── src/
│   ├── app/
│   │   ├── api/              # Next.js API Routes (Recipes CRUD, upload, collections, import)
│   │   ├── dashboard/        # KPI analytics and newest widgets
│   │   ├── recipes/          # Catalog browsing, dynamic new/edit forms, details page
│   │   ├── collections/      # Folder directories and memberships
│   │   ├── favorites/        # Local storage favorites grid
│   │   ├── layout.tsx        # Master HTML layout, Outfit font, and provider wrapper
│   │   ├── page.tsx          # Landing showcase page
│   │   └── globals.css       # Core theme variables, custom scrollbars, print rules
│   ├── components/
│   │   ├── ui/               # Card, Button, Input, Dialog, Skeleton building blocks
│   │   ├── navbar.tsx        # Responsive navigation header
│   │   └── ...               # Filter, metrics, random, export utilities
│   ├── context/
│   │   └── favorites-context.tsx  # Browser local storage sync provider
│   └── lib/
│       ├── supabase.ts       # Supabase browser/admin client safety wraps
│       └── zod-schemas.ts    # Zod models for validation
├── tailwind.config.ts        # Styling adjustments
├── vercel.json               # Vercel deployment options
├── supabase_setup.sql        # Database schema queries
├── SUPABASE_SETUP.md         # Database schema setup instructions
├── VERCEL_DEPLOYMENT.md      # Vercel deployment configurations
└── ENVIRONMENT_SETUP.md      # Environment variable keys scopes guide
```

---

## 🚀 Getting Started

### 1. Clone the repository and install dependencies
```bash
npm install
```

### 2. Configure Database & Environment variables
1. Review [SUPABASE_SETUP.md](file:///c:/Users/HP/OneDrive/Documents/recipie%20mangement%20system/SUPABASE_SETUP.md) to initialize your Supabase instance, execute the PostgreSQL schema queries, and set up the public `recipe-images` storage bucket.
2. Review [ENVIRONMENT_SETUP.md](file:///c:/Users/HP/OneDrive/Documents/recipie%20mangement%20system/ENVIRONMENT_SETUP.md) and copy the project credentials into your `.env.local` file.

### 3. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application!

---

## 🐳 Verification and Production Compilation

Ensure your code compiles cleanly before push or deploy:
```bash
# Verify static code check lints
npm run lint

# Verify type compile checks
npx tsc --noEmit

# Verify production builds pack
npm run build
```

---

## 📄 License & Collaboration

- Detailed contribution guidelines can be found in [CONTRIBUTING.md](file:///c:/Users/HP/OneDrive/Documents/recipie%20mangement%20system/CONTRIBUTING.md).
- Distributed under the MIT License. See [LICENSE](file:///c:/Users/HP/OneDrive/Documents/recipie%20mangement%20system/LICENSE) for more information.
