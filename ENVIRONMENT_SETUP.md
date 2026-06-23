# Environment Setup Mappings

Recipe Vault relies on three environment variables to link the Next.js frontend, Node API routes, and the Supabase Postgres DB safely.

---

## Environment Variable Schema

Create a file named `.env.local` in the root folder of your project. Copy the template:

```ini
# 1. Public Supabase Project Endpoint
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co

# 2. Public Anon Key (Safe for Browser/Client Use)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key

# 3. Server-Only Service Role Key (NEVER expose to Client/Browser)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key
```

---

## Detailed Scopes

### 1. `NEXT_PUBLIC_SUPABASE_URL`
- **Prefix**: `NEXT_PUBLIC_` (exposes this key to the browser client runtime).
- **Scope**: Used by both server-side API routes and client-side database select operations to identify where to send requests.
- **Source**: Supabase Console Settings -> API -> Project URL.

### 2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Prefix**: `NEXT_PUBLIC_` (exposes this key to the browser client runtime).
- **Scope**: Client-safe token representing public access privileges. Fits tables with public read/write RLS policies.
- **Source**: Supabase Console Settings -> API -> anon public.

### 3. `SUPABASE_SERVICE_ROLE_KEY`
- **Prefix**: None (Only resolved in node.js runtime, invisible to browser).
- **Scope**: Superuser administrative credentials. Used by the server API route `/api/upload` to write files to storage buckets, bypassing potential standard anon limitations.
- **WARNING**: Do not commit this key to GitHub or include it in files visible to clients. Set it in Vercel's secure dashboard.
- **Source**: Supabase Console Settings -> API -> service_role (secret).

---

## Built-In Safety Fallback System

Next.js compiling commands (`npm run build`) can crash if API routes attempt to initialize database clients with dummy URLs or if keys are missing.

To solve this, our project has a built-in fallback helper inside [supabase.ts](file:///c:/Users/HP/OneDrive/Documents/recipie%20mangement%20system/src/lib/supabase.ts):
- It validates the format of `NEXT_PUBLIC_SUPABASE_URL`.
- If the variables are empty or still set to the default placeholder strings, it **logs a warning** and mounts a **mock fallback DB adapter**.
- This mock client lets the application compile without crashing and serves dummy datasets locally during testing.
- Once you add valid credentials, it automatically connects to your live Supabase database!
