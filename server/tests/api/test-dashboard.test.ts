import { describe, it } from 'vitest';
import { app } from './src/app.js';
import supertest from 'supertest';
import { createTestUser, createTestSession, authCookie } from './tests/setup.js';

describe('dashboard', () => {
  it('debugs 500', async () => {
    const user = await createTestUser({ name: 'Dashboard User' });
    const userToken = await createTestSession(user.id);

    const request = supertest(app);
    const res = await request.get(`/api/v1/dashboard/stats`)
      .set('Cookie', authCookie(userToken));
    
    console.log('STATUS:', res.status);
    console.log('BODY:', JSON.stringify(res.body, null, 2));
  });
});
