/**
 * Supabase client factory.
 *
 * Two access tiers:
 *  - supabaseAdmin: bypasses RLS via the service-role key.
 *    Used only for privileged server operations (account deletion, etc.).
 *  - createUserClient(token): builds a short-lived client that
 *    carries the caller's JWT so RLS policies apply normally.
 */

import { createClient } from '@supabase/supabase-js';
import config from './env.js';

// Admin-level client — keep usage tightly scoped
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey || config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Build a Supabase client that acts as a specific authenticated user.
 * Every DB query through this client respects row-level security.
 */
export function createUserClient(accessToken) {
  return createClient(config.supabase.url, config.supabase.anonKey, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
