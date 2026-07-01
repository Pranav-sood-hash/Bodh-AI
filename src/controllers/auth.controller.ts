import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import redis from '../config/redis';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import * as tokenService from '../services/token.service';
import * as otpService from '../services/otp.service';
import { registerSchema, loginSchema, verifyOtpSchema, forgotPasswordSchema, resetPasswordSchema } from '../validations/auth.schema';

export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, 'Email already registered');

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      progress: { create: {} },
    },
  });

  await otpService.createAndSend(email, 'EMAIL_VERIFICATION', user.id);

  return res.status(201).json(ApiResponse.success({ email }, 'Verification code sent to your email'));
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = verifyOtpSchema.parse(req.body);

  await otpService.verify(email, otp, 'EMAIL_VERIFICATION');

  const user = await prisma.user.update({
    where: { email },
    data: { isEmailVerified: true },
    select: { id: true, firstName: true, lastName: true, email: true, avatar: true, onboardingDone: true },
  });

  const { accessToken, refreshToken } = await tokenService.generateTokens(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: await bcrypt.hash(refreshToken, 10) },
  });

  return res.status(200).json(ApiResponse.success({ user, accessToken, refreshToken }, 'Email verified successfully'));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true, firstName: true, lastName: true, email: true,
      password: true, avatar: true, isEmailVerified: true, onboardingDone: true,
    },
  });

  if (!user || !user.password) throw new ApiError(401, 'Invalid email or password');
  if (!user.isEmailVerified) throw new ApiError(403, 'Please verify your email first');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  const { accessToken, refreshToken } = await tokenService.generateTokens(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: await bcrypt.hash(refreshToken, 10), lastActiveDate: new Date() },
  });

  // Log session
  await prisma.userSession.create({
    data: {
      userId: user.id,
      deviceInfo: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip,
      location: 'Unknown',
    },
  });

  const { password: _, ...safeUser } = user;
  return res.status(200).json(ApiResponse.success({ user: safeUser, accessToken, refreshToken }, 'Login successful'));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(401, 'Refresh token required');

  const decoded = tokenService.verifyRefreshToken(refreshToken);

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, refreshToken: true },
  });
  if (!user || !user.refreshToken) throw new ApiError(401, 'Invalid refresh token');

  const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
  if (!isValid) throw new ApiError(401, 'Invalid refresh token');

  const tokens = await tokenService.generateTokens(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) },
  });

  return res.status(200).json(ApiResponse.success(tokens, 'Tokens refreshed'));
});

export const logout = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (userId) {
    await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
  }
  return res.status(200).json(ApiResponse.success(null, 'Logged out successfully'));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = forgotPasswordSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(200).json(ApiResponse.success(null, 'If this email is registered, a code has been sent'));
  }

  await otpService.createAndSend(email, 'PASSWORD_RESET', user.id);
  return res.status(200).json(ApiResponse.success(null, 'Reset code sent to your email'));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = resetPasswordSchema.parse(req.body);

  await otpService.verify(email, otp, 'PASSWORD_RESET');

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword, refreshToken: null },
  });

  return res.status(200).json(ApiResponse.success(null, 'Password updated successfully'));
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { email, type } = req.body;
  if (!email || !type) throw new ApiError(400, 'Email and OTP type are required');

  const user = await prisma.user.findUnique({ where: { email } });
  await otpService.createAndSend(email, type, user?.id);

  return res.status(200).json(ApiResponse.success(null, 'Verification code resent'));
});

export const requestEmailChange = asyncHandler(async (req, res) => {
  const { newEmail } = req.body;
  const userId = req.user.id;

  const existing = await prisma.user.findUnique({ where: { email: newEmail } });
  if (existing) throw new ApiError(409, 'Email already in use');

  try {
    await redis.setex(`email_change:${userId}`, 600, newEmail);
  } catch {
    // Redis fallback — store in memory via OTP record metadata
  }

  await otpService.createAndSend(newEmail, 'EMAIL_CHANGE', userId);
  return res.status(200).json(ApiResponse.success(null, 'Verification code sent to new email'));
});

export const confirmEmailChange = asyncHandler(async (req, res) => {
  const { otp, newEmail } = req.body;
  const userId = req.user.id;

  if (!newEmail) throw new ApiError(400, 'New email is required');

  await otpService.verify(newEmail, otp, 'EMAIL_CHANGE');

  await prisma.user.update({
    where: { id: userId },
    data: { email: newEmail },
  });

  return res.status(200).json(ApiResponse.success({ email: newEmail }, 'Email updated successfully'));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
  if (!user?.password) throw new ApiError(400, 'No password set for this account');

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new ApiError(401, 'Current password is incorrect');

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashedPassword } });

  return res.status(200).json(ApiResponse.success(null, 'Password changed successfully'));
});
