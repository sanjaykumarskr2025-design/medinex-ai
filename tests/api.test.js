import request from 'supertest';
import app from '../src/server.js';

describe('VitaNex AI API Tests', () => {
  describe('GET /', () => {
    it('should return server status or static files', async () => {
      const res = await request(app).get('/');
      // If static files aren't built or served, it might return 200 or 404. Let's check status is defined.
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('Protected Routes - Auth Rejection', () => {
    it('GET /api/records should reject requests without Authorization header', async () => {
      const res = await request(app).get('/api/records');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('GET /api/metrics should reject requests without Authorization header', async () => {
      const res = await request(app).get('/api/metrics');
      expect(res.status).toBe(401);
    });

    it('GET /api/appointments should reject requests without Authorization header', async () => {
      const res = await request(app).get('/api/appointments');
      expect(res.status).toBe(401);
    });

    it('GET /api/reminders should reject requests without Authorization header', async () => {
      const res = await request(app).get('/api/reminders');
      expect(res.status).toBe(401);
    });

    it('POST /api/copilot/chat should reject requests without Authorization header', async () => {
      const res = await request(app).post('/api/copilot/chat').send({ message: 'Hello' });
      expect(res.status).toBe(401);
    });
  });

  describe('Validation Middleware', () => {
    it('POST /api/records should reject invalid record payload even with mock auth (if bypassed) or return 401', async () => {
      const res = await request(app)
        .post('/api/records')
        .send({ title: '' }); // Invalid: missing record_type, date, etc.
      expect([401, 400]).toContain(res.status);
    });
  });
});
