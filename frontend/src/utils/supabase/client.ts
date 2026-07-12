export function createClient() {
  return createMockSupabaseClient();
}

export function createMockSupabaseClient(): any {
  const ok: any = { data: [], error: null };
  const user: any = { id: "mock-admin", email: "design@proov.local", user_metadata: { full_name: "Design Mode" } };
  const chain: any = {
    select: (..._args: any[]) => chain,
    insert: (..._args: any[]) => chain,
    update: (..._args: any[]) => chain,
    upsert: (..._args: any[]) => chain,
    delete: (..._args: any[]) => chain,
    eq: (..._args: any[]) => chain,
    neq: (..._args: any[]) => chain,
    ilike: (..._args: any[]) => chain,
    order: (..._args: any[]) => chain,
    limit: (..._args: any[]) => chain,
    single: async () => ({ data: null, error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    then: (resolve: (value: typeof ok) => unknown) => Promise.resolve(ok).then(resolve),
  };
  return {
    auth: {
      getUser: async () => ({ data: { user }, error: null }),
      signInWithPassword: async (..._args: any[]) => ({ data: { user, session: { access_token: "mock-token" } }, error: null }),
      signInWithOAuth: async (..._args: any[]) => ({ data: { url: "/dashboard" }, error: null }),
      signUp: async (..._args: any[]) => ({ data: { user, session: { access_token: "mock-token" } }, error: null }),
      signOut: async () => ({ error: null }),
      exchangeCodeForSession: async (..._args: any[]) => ({ data: { user, session: { access_token: "mock-token" } }, error: null }),
    },
    from: (..._args: any[]) => chain,
    rpc: async (..._args: any[]) => ({ data: null, error: null }),
    storage: {
      from: (..._args: any[]) => ({
        upload: async (..._uploadArgs: any[]) => ({ data: { path: "mock-upload" }, error: null }),
        getPublicUrl: (..._urlArgs: any[]) => ({ data: { publicUrl: "/assets/baseball_jersey.png" } }),
      }),
    },
  };
}
