import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../lib/prisma.js';

describe('Auth API', () => {
  beforeEach(async () => {
    // clean up users before each test
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Password123',
          role: 'advertiser',
          firstName: 'John',
          lastName: 'Doe',
        });

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.role).toBe('advertiser');
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user.passwordHash).toBeUndefined();
    });

    it('should reject duplicate email', async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        });

      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('ConflictError');
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'weak',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('ValidationError');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'not-an-email',
          password: 'Password123',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('UnauthorizedError');
    });

    it('should reject non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should refresh access token', async () => {
      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        });

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({
          refreshToken: signupResponse.body.refreshToken,
        });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      // should be different tokens
      expect(response.body.refreshToken).not.toBe(signupResponse.body.refreshToken);
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({
          refreshToken: 'invalid-token',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const signupResponse = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        });

      const response = await request(app)
        .post('/api/auth/logout')
        .send({
          refreshToken: signupResponse.body.refreshToken,
        });

      expect(response.status).toBe(200);

      // trying to use the refresh token should fail now
      const refreshResponse = await request(app)
        .post('/api/auth/refresh-token')
        .send({
          refreshToken: signupResponse.body.refreshToken,
        });

      expect(refreshResponse.status).toBe(401);
    });
  });
});
