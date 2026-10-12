/**
 * Appointments CRUD routes.
 *
 * Scoped to req.user.id.
 */

import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import { createUserClient } from '../config/supabase.js';
import { validate, appointmentSchema } from '../validation/schemas.js';

const router = Router();

// GET /api/appointments
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const { status, upcoming } = req.query;

    let query = db.from('appointments').select('*').order('appointment_date', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    if (upcoming === 'true') {
      query = query.gte('appointment_date', new Date().toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ appointments: data || [] });
  } catch (err) {
    next(err);
  }
});

// POST /api/appointments
router.post('/', requireAuth, validate(appointmentSchema), async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const payload = { ...req.body, user_id: req.user.id };

    const { data, error } = await db
      .from('appointments')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Appointment scheduled successfully.', appointment: data });
  } catch (err) {
    next(err);
  }
});

// PUT /api/appointments/:id
router.put('/:id', requireAuth, validate(appointmentSchema), async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const { id } = req.params;

    const { data, error } = await db
      .from('appointments')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Appointment not found or unauthorized.' });
    }

    res.json({ message: 'Appointment updated successfully.', appointment: data });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/appointments/:id/status
router.patch('/:id/status', requireAuth, async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const { id } = req.params;
    const { status } = req.body;

    if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const { data, error } = await db
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    res.json({ message: 'Appointment status updated.', appointment: data });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const { id } = req.params;

    const { error, count } = await db
      .from('appointments')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error || count === 0) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    res.json({ message: 'Appointment deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
