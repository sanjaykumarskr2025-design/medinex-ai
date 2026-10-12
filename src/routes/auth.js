/**
 * Authentication routes.
 *
 * Handles signup, login, session validation, password reset, and logout.
 */

import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import config from '../config/env.js';
import requireAuth from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate, signupSchema, loginSchema } from '../validation/schemas.js';

const router = Router();

const supabaseAuth = createClient(config.supabase.url, config.supabase.anonKey, {
  auth: { persistSession: false },
});

// POST /api/auth/signup
router.post('/signup', authLimiter, validate(signupSchema), async (req, res, next) => {
  try {
    const { email, password, display_name } = req.body;

    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: display_name || email.split('@')[0] },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Account created successfully. Please check your email for confirmation if required.',
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json({
      message: 'Logged in successfully',
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    const client = createClient(config.supabase.url, config.supabase.anonKey, {
      global: { headers: { Authorization: `Bearer ${req.accessToken}` } },
    });
    await client.auth.signOut();
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
      redirectTo: `${config.server.corsOrigin}/login.html?reset=true`,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Password reset instructions sent to your email.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      metadata: req.user.user_metadata,
      created_at: req.user.created_at,
    },
  });
});

export default router;
