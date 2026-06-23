import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return (
    !!supabaseUrl &&
    supabaseUrl !== "https://your-supabase-project.supabase.co" &&
    !!supabaseAnonKey &&
    !supabaseAnonKey.includes("your-anon-key")
  );
};

// Helper to mock chained Supabase query builder responses
const mockQueryChain = (data: any, error: any = null) => {
  const promise = Promise.resolve({ data, error }) as any;
  const chainFn = () => mockQueryChain(data, error);
  
  promise.select = chainFn;
  promise.order = chainFn;
  promise.eq = chainFn;
  promise.ilike = chainFn;
  promise.or = chainFn;
  promise.range = chainFn;
  promise.limit = chainFn;
  
  promise.single = () => Promise.resolve({ data: Array.isArray(data) ? data[0] || null : data, error });
  promise.maybeSingle = () => Promise.resolve({ data: Array.isArray(data) ? data[0] || null : data, error });
  
  return promise;
};

// Create safe fallback mock client if credentials are not ready
const createFallbackClient = () => {
  console.warn("Supabase credentials not configured in .env.local. Running in fallback mode.");
  return {
    from: (table: string) => ({
      select: () => mockQueryChain([]),
      insert: (data: any) => mockQueryChain({ id: "00000000-0000-0000-0000-000000000000", ...data }),
      update: (data: any) => mockQueryChain({ id: "00000000-0000-0000-0000-000000000000", ...data }),
      delete: () => mockQueryChain(null),
    }),
    storage: {
      from: (bucket: string) => ({
        upload: () => Promise.resolve({ data: { path: "fallback.png" }, error: null }),
        getPublicUrl: (path: string) => ({ data: { publicUrl: `/fallback-image.png` } }),
        remove: () => Promise.resolve({ error: null }),
      }),
    },
  } as any;
};

// Export normal browser-safe client
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createFallbackClient();

// Export admin/service-role client for backend API routes
export const supabaseAdmin = isSupabaseConfigured() && supabaseServiceKey && !supabaseServiceKey.includes("your-service-role-key")
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : supabase;
