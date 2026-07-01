import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import redis from '../config/redis';
import * as emailService from './email.service';
import { ApiError } from '../utils/apiResponse';
import { logger } from '../utils/logger';

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

const generateSecureOTP = (): string => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 900000 + 100000);
};

export const createAndSend = async (
  email: string,
  type: string,
  userId?: string,
  extraData?: Record<string, string>
) => {
  const cooldownKey = `otp_cooldown:${email}:${type}`;
  try {
    const onCooldown = await redis.get(cooldownKey);
    if (onCooldown) {
      const ttl = await redis.ttl(cooldownKey);
      throw new ApiError(429, `Please wait ${ttl} seconds before requesting another code.`);
    }
  } catch (err: any) {
    if (err.message.includes('Please wait')) throw err;
    // Redis is down, ignore rate limiting
  }

  await prisma.oTP.deleteMany({
    where: { email, type: type as any, used: false }
  });

  const otp = generateSecureOTP();
  if (process.env.NODE_ENV === 'development') {
    logger.info(`[DEV OTP] OTP for ${email} (${type}) is: ${otp}`);
  }
  const hashedOtp = await bcrypt.hash(otp, 10);

  await prisma.oTP.create({
    data: {
      email,
      userId,
      hashedOtp,
      type: type as any,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000)
    }
  });
  try {
    await redis.setex(cooldownKey, RESEND_COOLDOWN_SECONDS, '1');
  } catch (err) {
    // Ignore Redis error
  }
  let firstName = 'there';
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { firstName: true } });
    if (user) firstName = user.firstName;
  }

  switch (type) {
    case 'EMAIL_VERIFICATION':
      await emailService.sendEmailVerification(email, otp, firstName);
      break;
    case 'PASSWORD_RESET':
      await emailService.sendPasswordReset(email, otp, firstName);
      break;
    case 'EMAIL_CHANGE':
      await emailService.sendEmailChangeVerification(email, otp, firstName);
      break;
    case 'LOGIN_VERIFICATION':
      await emailService.sendLoginVerification(email, otp, firstName, extraData?.deviceInfo || 'Unknown device');
      break;
    default:
      throw new ApiError(400, `Unknown OTP type: ${type}`);
  }
};

export const verify = async (email: string, otp: string, type: string): Promise<void> => {
  const record = await prisma.oTP.findFirst({
    where: {
      email,
      type: type as any,
      used: false,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!record) {
    throw new ApiError(400, 'Code expired or not found. Please request a new one.');
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await prisma.oTP.delete({ where: { id: record.id } });
    throw new ApiError(400, 'Too many failed attempts. Please request a new code.');
  }

  const isValid = await bcrypt.compare(otp, record.hashedOtp);

  if (!isValid) {
    await prisma.oTP.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } }
    });
    
    const remaining = MAX_ATTEMPTS - record.attempts - 1;
    throw new ApiError(400, `Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
  }

  await prisma.oTP.update({
    where: { id: record.id },
    data: { used: true }
  });
};

export const getCooldownStatus = async (email: string, type: string): Promise<number> => {
  try {
    const ttl = await redis.ttl(`otp_cooldown:${email}:${type}`);
    return ttl > 0 ? ttl : 0;
  } catch (err) {
    return 0;
  }
};
