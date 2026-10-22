import type { SupabaseClient } from "@supabase/supabase-js";

const INSTAGRAM_HOST = "https://graph.instagram.com";
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 500;
const RETRYABLE_STATUSES = new Set([429, 502]);
const REFRESH_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

type FetchFn = typeof fetch;

type TokenRow = {
  access_token: string;
  ig_user_id: string;
  expires_at: string;
};

type MediaItem = {
  id: string;
  caption?: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function refreshTokenIfNeeded(
  supabase: SupabaseClient,
  fetchFn: FetchFn = fetch
): Promise<{ token: string; igUserId: string }> {
  const { data, error } = await supabase
    .from("instagram_token")
    .select("access_token, ig_user_id, expires_at")
    .eq("id", 1)
    .single();

  if (error || !data) {
    throw new Error("Instagram token not found — connect Instagram from /admin/dashboard first");
  }

  const row = data as TokenRow;
  const expiresAt = new Date(row.expires_at).getTime();

  if (expiresAt - Date.now() > REFRESH_WINDOW_MS) {
    return { token: row.access_token, igUserId: row.ig_user_id };
  }

  const res = await fetchFn(
    `${INSTAGRAM_HOST}/refresh_access_token?grant_type=ig_refresh_token&access_token=${row.access_token}`
  );

  if (!res.ok) {
    // A failed refresh shouldn't block today's sync — the current token may still be valid
    // until it actually expires. The next sync run will try refreshing again.
    return { token: row.access_token, igUserId: row.ig_user_id };
  }

  const refreshed = (await res.json()) as { access_token: string; expires_in: number };
  const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

  const { error: updateError } = await supabase
    .from("instagram_token")
    .update({
      access_token: refreshed.access_token,
      expires_at: newExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (updateError) throw updateError;

  return { token: refreshed.access_token, igUserId: row.ig_user_id };
}

export async function fetchInstagramMediaWithRetry(
  token: string,
  igUserId: string,
  fetchFn: FetchFn = fetch
) {
  const url = `${INSTAGRAM_HOST}/v23.0/${igUserId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=12&access_token=${token}`;
  let lastError = "Unknown error";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetchFn(url);

    if (res.ok) {
      return { ok: true as const, data: (await res.json()) as { data: MediaItem[] } };
    }

    if (!RETRYABLE_STATUSES.has(res.status) || attempt === MAX_ATTEMPTS) {
      return { ok: false as const, error: `Instagram API error (${res.status})` };
    }

    lastError = `Instagram API error (${res.status})`;
    await sleep(BASE_DELAY_MS * 2 ** (attempt - 1));
  }

  return { ok: false as const, error: lastError };
}

export async function syncInstagramFeed(supabase: SupabaseClient, fetchFn: FetchFn = fetch) {
  const { token, igUserId } = await refreshTokenIfNeeded(supabase, fetchFn);
  const result = await fetchInstagramMediaWithRetry(token, igUserId, fetchFn);

  if (!result.ok) throw new Error(result.error);

  const items = result.data.data ?? [];
  const now = new Date().toISOString();

  const rows = items.map((post, i) => ({
    media_id: post.id,
    caption: post.caption ?? null,
    media_type: post.media_type,
    media_url: post.media_url,
    thumbnail_url: post.thumbnail_url ?? null,
    permalink: post.permalink,
    posted_at: post.timestamp,
    cached_at: now,
    sort_order: i,
  }));

  if (rows.length > 0) {
    const { error: upsertError } = await supabase.from("instagram_posts").upsert(rows);
    if (upsertError) throw upsertError;

    const keepIds = rows.map((r) => r.media_id);
    const { error: deleteError } = await supabase
      .from("instagram_posts")
      .delete()
      .not("media_id", "in", `(${keepIds.join(",")})`);
    if (deleteError) throw deleteError;
  }

  return { synced: rows.length };
}
