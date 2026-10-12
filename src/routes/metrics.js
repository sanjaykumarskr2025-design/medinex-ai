/**
 * Health metrics and analytics routes.
 *
 * Provides historical series data for Chart.js and aggregated dashboard statistics.
 */

import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import { createUserClient } from '../config/supabase.js';
import { validate, healthMetricSchema } from '../validation/schemas.js';

const router = Router();

// GET /api/metrics
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const { type, from, to, limit = 50 } = req.query;

    let query = db.from('health_metrics').select('*').order('recorded_at', { ascending: true });

    if (type) {
      query = query.eq('metric_type', type);
    }

    if (from) {
      query = query.gte('recorded_at', from);
    }

    if (to) {
      query = query.lte('recorded_at', to);
    }

    query = query.limit(parseInt(limit, 10));

    const { data, error } = await query;

    if (error) throw error;

    res.json({ metrics: data || [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/metrics/summary
router.get('/summary', requireAuth, async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);

    const { data, error } = await db
      .from('health_metrics')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const metrics = data || [];
    const summary = {};

    // Group latest values by metric type
    metrics.forEach((m) => {
      if (!summary[m.metric_type]) {
        summary[m.metric_type] = {
          latest: m.value,
          unit: m.unit,
          recorded_at: m.recorded_at,
          history: [],
        };
      }
      summary[m.metric_type].history.push({ value: m.value, recorded_at: m.recorded_at });
    });

    res.json({ summary });
  } catch (err) {
    next(err);
  }
});

// POST /api/metrics
router.post('/', requireAuth, validate(healthMetricSchema), async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const payload = { ...req.body, user_id: req.user.id };

    const { data, error } = await db
      .from('health_metrics')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Metric recorded successfully.', metric: data });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/metrics/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const { id } = req.params;

    const { error, count } = await db
      .from('health_metrics')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error || count === 0) {
      return res.status(404).json({ error: 'Metric not found.' });
    }

    res.json({ message: 'Metric deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
