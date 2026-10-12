/**
 * Health records CRUD routes.
 *
 * All actions are scoped strictly to req.user.id using createUserClient.
 */

import { Router } from 'express';
import requireAuth from '../middleware/auth.js';
import { createUserClient } from '../config/supabase.js';
import { validate, healthRecordSchema } from '../validation/schemas.js';

const router = Router();

// GET /api/records
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const { type, search, sort = 'date', order = 'desc', page = 1, limit = 20 } = req.query;

    let query = db.from('health_records').select('*', { count: 'exact' });

    if (type) {
      query = query.eq('type', type);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,notes.ilike.%${search}%`);
    }

    const ascending = order === 'asc';
    query = query.order(sort, { ascending });

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    query = query.range(offset, offset + parseInt(limit, 10) - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      records: data || [],
      pagination: {
        total: count || 0,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/records/:id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const { id } = req.params;

    const { data, error } = await db
      .from('health_records')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Health record not found.' });
    }

    res.json({ record: data });
  } catch (err) {
    next(err);
  }
});

// POST /api/records
router.post('/', requireAuth, validate(healthRecordSchema), async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const payload = {
      ...req.body,
      user_id: req.user.id, // enforced by server
    };

    const { data, error } = await db
      .from('health_records')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Health record created successfully.', record: data });
  } catch (err) {
    next(err);
  }
});

// PUT /api/records/:id
router.put('/:id', requireAuth, validate(healthRecordSchema), async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const { id } = req.params;

    const { data, error } = await db
      .from('health_records')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({ error: 'Record not found or unauthorized.' });
    }

    res.json({ message: 'Health record updated successfully.', record: data });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/records/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const { id } = req.params;

    const { error, count } = await db
      .from('health_records')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error || count === 0) {
      return res.status(404).json({ error: 'Record not found or already deleted.' });
    }

    res.json({ message: 'Health record deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/records/export/:format
router.get('/export/:format', requireAuth, async (req, res, next) => {
  try {
    const db = createUserClient(req.accessToken);
    const { format } = req.params;

    const { data, error } = await db
      .from('health_records')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    const records = data || [];

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="medinex-health-records.json"');
      return res.send(JSON.stringify(records, null, 2));
    }

    if (format === 'csv') {
      const headers = ['id', 'type', 'title', 'date', 'notes'];
      const rows = records.map((r) =>
        [r.id, r.type, `"${(r.title || '').replace(/"/g, '""')}"`, r.date, `"${(r.notes || '').replace(/"/g, '""')}"`].join(',')
      );
      const csv = [headers.join(','), ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="medinex-health-records.csv"');
      return res.send(csv);
    }

    res.status(400).json({ error: 'Unsupported export format. Use json or csv.' });
  } catch (err) {
    next(err);
  }
});

export default router;
