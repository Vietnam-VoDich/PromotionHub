import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import type { SignupInput, LoginInput, RefreshTokenInput } from '../schemas/auth.schema.js';

export const authController = {
  async signup(
    req: Request<unknown, unknown, SignupInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.signup(req.body);

      res.status(201).json({
        message: 'User created successfully',
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  },

  async login(
    req: Request<unknown, unknown, LoginInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await authService.login(req.body);

      res.json({
        message: 'Login successful',
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(
    req: Request<unknown, unknown, RefreshTokenInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tokens = await authService.refreshToken(req.body.refreshToken);

      res.json({
        message: 'Token refreshed successfully',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(
    req: Request<unknown, unknown, RefreshTokenInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await authService.logout(req.body.refreshToken);

      res.json({
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        res.status(400).json({ error: 'Token invalide' });
        return;
      }

      const user = await authService.verifyEmail(token);

      res.json({
        message: 'Email vérifié avec succès',
        user,
      });
    } catch (error) {
      next(error);
    }
  },

  async resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email requis' });
        return;
      }

      await authService.resendVerificationEmail(email);

      res.json({
        message: 'Si un compte existe avec cet email, un lien de vérification a été envoyé',
      });
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email requis' });
        return;
      }

      await authService.requestPasswordReset(email);

      res.json({
        message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé',
      });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        res.status(400).json({ error: 'Token et mot de passe requis' });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
        return;
      }

      await authService.resetPassword(token, password);

      res.json({
        message: 'Mot de passe réinitialisé avec succès',
      });
    } catch (error) {
      next(error);
    }
  },
};
