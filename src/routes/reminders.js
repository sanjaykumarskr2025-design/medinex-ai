/**
 * Reminders CRUD routes.
 *
 * Scoped to req.user.id.
 */

import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import { createUserClient } from '../config/supabase.js';
import { validate, reminderSchema } from '../validation/schemas.js';

const router = Router();

// GET /api/reminders
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const { active } = req.query;

    let query = db.from('reminders').select('*').order('due_date', { ascending: true });

    if (active === 'true') {
      query = query.eq('is_completed', false);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ reminders: data || [] });
  } catch (err) {
    next(err);
  }
});

// POST /api/reminders
router.post('/', requireAuth, validate(reminderSchema), async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const payload = { ...req.body, user_id: req.user.id };

    const { data, error } = await db
      .from('reminders')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Reminder created successfully.', reminder: data });
  } catch (err) {
    next(err);
  }
});

// PUT /api/reminders/:id
router.put('/:id', requireAuth, validate(reminderSchema), async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const { id } = req.params;

    const { data, error } = await db
      .from('reminders')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Reminder not found.' });
    }

    res.json({ message: 'Reminder updated successfully.', reminder: data });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/reminders/:id/complete
router.patch('/:id/complete', requireAuth, async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const { id } = req.params;
    const { is_completed } = req.body;

    const { data, error } = await db
      .from('reminders')
      .update({ is_completed: is_completed !== undefined ? is_completed : true })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Reminder not found.' });
    }

    res.json({ message: 'Reminder status updated.', reminder: data });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/reminders/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const { id } = req.params;

    const { error, count } = await db
      .from('reminders')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error || count === 0) {
      return res.status(404).json({ error: 'Reminder not found.' });
    }

    res.json({ message: 'Reminder deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
