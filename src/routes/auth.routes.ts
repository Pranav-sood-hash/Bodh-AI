import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import bcrypt from 'bcryptjs';
import {
  register, verifyEmail, login, refreshAccessToken, logout,
  forgotPassword, resetPassword, resendOtp, requestEmailChange,
  confirmEmailChange, changePassword
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { authLimiter } from '../middleware/rateLimit.middleware';
import { registerSchema, loginSchema, verifyOtpSchema, forgotPasswordSchema, resetPasswordSchema } from '../validations/auth.schema';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/verify-email', authLimiter, validate(verifyOtpSchema), verifyEmail);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);
router.post('/resend-otp', authLimiter, resendOtp);

// Protected auth endpoints
router.post('/change-email/request', authenticate, requestEmailChange);
router.post('/change-email/verify', authenticate, confirmEmailChange);
router.post('/change-password', authenticate, changePassword);

// INITIATE GOOGLE LOGIN
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    prompt: 'select_account'
  })
);

// GOOGLE CALLBACK
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:8080'}/login?error=google_auth_failed`
  }),
  async (req, res) => {
    try {
      const user = req.user as any;

      const accessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d' }
      );

      const hashedRefresh = await bcrypt.hash(refreshToken, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          refreshToken: hashedRefresh,
          lastActiveDate: new Date()
        }
      });

      await prisma.userSession.create({
        data: {
          userId: user.id,
          deviceInfo: req.headers['user-agent'] || '',
          ipAddress: req.ip || '',
          location: 'Unknown'
        }
      });

      const redirectUrl = new URL(`${process.env.CLIENT_URL || 'http://localhost:8080'}/auth/callback`);
      redirectUrl.searchParams.set('accessToken', accessToken);
      redirectUrl.searchParams.set('refreshToken', refreshToken);
      redirectUrl.searchParams.set('onboarding', user.onboardingDone ? 'false' : 'true');

      res.redirect(redirectUrl.toString());
    } catch (err) {
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:8080'}/login?error=auth_callback_failed`);
    }
  }
);

export default router;
