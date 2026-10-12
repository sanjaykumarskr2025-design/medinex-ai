/**
 * User profile and preferences routes.
 */

import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import { createUserClient, supabaseAdmin } from '../config/supabase.js';
import { validate, userProfileSchema } from '../validation/schemas.js';

const router = Router();

// GET /api/profile
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);

    let { data, error } = await db
      .from('user_profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    // If profile doesn't exist yet, create default
    if (error || !data) {
      const defaultProfile = {
        id: req.user.id,
        display_name: req.user.user_metadata?.display_name || req.user.email.split('@')[0],
        preferred_language: 'en',
        units_system: 'metric',
      };

      const { data: created, error: createErr } = await db
        .from('user_profiles')
        .insert([defaultProfile])
        .select()
        .single();

      if (createErr) {
        data = defaultProfile;
      } else {
        data = created;
      }
    }

    res.json({ profile: data, user: { email: req.user.email, id: req.user.id } });
  } catch (err) {
    next(err);
  }
});

// PUT /api/profile
router.put('/', requireAuth, validate(userProfileSchema), async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);

    const { data, error } = await db
      .from('user_profiles')
      .upsert({
        id: req.user.id,
        ...req.body,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Profile updated successfully.', profile: data });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/profile/account
router.delete('/account', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Delete user auth account using supabaseAdmin (bypasses RLS to delete auth record)
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authErr) {
      console.error('[profile] Failed to delete auth user:', authErr.message);
      return res.status(500).json({ error: 'Failed to delete account. Please contact support.' });
    }

    res.json({ message: 'Account and associated data deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
