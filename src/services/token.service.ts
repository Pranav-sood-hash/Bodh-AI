import jwt from 'jsonwebtoken';
import { JWT_ACCESS_EXPIRES, JWT_REFRESH_EXPIRES } from '../config/constants';

export const generateTokens = async (userId: string) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: JWT_ACCESS_EXPIRES as any }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: JWT_REFRESH_EXPIRES as any }
  );

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string };
};

export default { generateTokens, verifyRefreshToken };
