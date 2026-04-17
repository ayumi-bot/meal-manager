import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}

// ビルド時に初期化せず、実際に使われた時だけクライアントを生成する
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop: string) {
    return getClient()[prop as keyof SupabaseClient]
  }
})
