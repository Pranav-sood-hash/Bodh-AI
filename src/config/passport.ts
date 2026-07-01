import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './db';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;
        const firstName = profile.name?.givenName || '';
        const lastName = profile.name?.familyName || '';
        const googleId = profile.id;

        if (!email) {
          return done(new Error('No email from Google'), undefined);
        }

        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { googleId },
              { email }
            ]
          }
        });

        if (user) {
          if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                googleId,
                avatar: user.avatar || avatar,
                isEmailVerified: true
              }
            });
          }
        } else {
          user = await prisma.user.create({
            data: {
              firstName,
              lastName,
              email,
              googleId,
              avatar,
              isEmailVerified: true,
              progress: { create: {} }
            }
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);

export default passport;
