import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../lib/prisma.js';

describe('Users API', () => {
  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    // create a test user and get token
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      });

    accessToken = response.body.accessToken;
    userId = response.body.user.id;
  });

  describe('GET /api/users/me', () => {
    it('should return current user', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.firstName).toBe('John');
    });

    it('should reject without token', async () => {
      const response = await request(app).get('/api/users/me');

      expect(response.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by id', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update own profile', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'Jane',
          city: 'Abidjan',
        });

      expect(response.status).toBe(200);
      expect(response.body.firstName).toBe('Jane');
      expect(response.body.city).toBe('Abidjan');
    });

    it('should reject updating other user profile', async () => {
      // create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'other@example.com',
          password: 'Password123',
        });

      const otherUserId = otherUserResponse.body.user.id;

      const response = await request(app)
        .put(`/api/users/${otherUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'Hacker',
        });

      expect(response.status).toBe(403);
    });
  });
});
