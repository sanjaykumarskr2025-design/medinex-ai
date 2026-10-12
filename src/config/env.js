/**
 * Environment configuration loader.
 *
 * Centralizes all env-var access so the rest of the app never touches
 * process.env directly. Missing required vars cause an immediate,
 * descriptive crash at startup rather than a cryptic runtime error.
 */

import 'dotenv/config';

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(
    `[medinex] Fatal: missing required environment variables: ${missing.join(', ')}\n` +
    'Copy .env.example to .env and fill in the values.'
  );
  process.exit(1);
}

const config = Object.freeze({
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  ai: {
    provider: (process.env.AI_PROVIDER || 'demo').toLowerCase(),
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'claude-sonnet-5',
  },
  server: {
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  isDev() {
    return this.server.nodeEnv === 'development';
  },
});

export default config;
