/**
 * Authentication middleware.
 *
 * Verifies incoming JWTs against Supabase Auth and attaches the
 * authenticated user object to the request. Downstream handlers
 * should always read ownership from req.user.id rather than
 * trusting any user_id field sent by the client.
 */

import { createClient } from '@supabase/supabase-js';
import config from '../config/env.js';

// A lightweight client used only for token verification
const authVerifier = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export default async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = header.slice(7); // strip "Bearer "

  try {
    const { data, error } = await authVerifier.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
    }

    // Attach verified identity — this is the single source of truth for "who is calling"
    req.user = data.user;
    req.accessToken = token;
    next();
  } catch (err) {
    // Network issue talking to Supabase — don't leak details
    console.error('[auth] verification failed:', err.message);
    return res.status(500).json({ error: 'Unable to verify your session right now.' });
  }
}
