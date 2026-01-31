import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { prisma } from '../lib/prisma.js';
import { logger } from '../utils/logger.js';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const FACEBOOK_CALLBACK_URL = process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/api/auth/facebook/callback';

// Google OAuth Strategy
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email provided by Google'), undefined);
          }

          // Check if user exists with this Google ID
          let user = await prisma.user.findUnique({
            where: { googleId: profile.id },
          });

          if (!user) {
            // Check if user exists with this email
            user = await prisma.user.findUnique({
              where: { email },
            });

            if (user) {
              // Link Google account to existing user
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  googleId: profile.id,
                  avatarUrl: user.avatarUrl || profile.photos?.[0]?.value,
                  emailVerified: true,
                },
              });
              logger.info({ userId: user.id }, 'Linked Google account to existing user');
            } else {
              // Create new user
              user = await prisma.user.create({
                data: {
                  email,
                  googleId: profile.id,
                  firstName: profile.name?.givenName,
                  lastName: profile.name?.familyName,
                  avatarUrl: profile.photos?.[0]?.value,
                  authProvider: 'google',
                  emailVerified: true,
                  verified: true,
                },
              });
              logger.info({ userId: user.id }, 'Created new user via Google OAuth');
            }
          }

          return done(null, user);
        } catch (error) {
          logger.error({ error }, 'Google OAuth error');
          return done(error as Error, undefined);
        }
      }
    )
  );
  logger.info('Google OAuth strategy configured');
} else {
  logger.warn('Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

// Facebook OAuth Strategy
if (FACEBOOK_APP_ID && FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: FACEBOOK_APP_ID,
        clientSecret: FACEBOOK_APP_SECRET,
        callbackURL: FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email provided by Facebook'), undefined);
          }

          // Check if user exists with this Facebook ID
          let user = await prisma.user.findUnique({
            where: { facebookId: profile.id },
          });

          if (!user) {
            // Check if user exists with this email
            user = await prisma.user.findUnique({
              where: { email },
            });

            if (user) {
              // Link Facebook account to existing user
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  facebookId: profile.id,
                  avatarUrl: user.avatarUrl || profile.photos?.[0]?.value,
                  emailVerified: true,
                },
              });
              logger.info({ userId: user.id }, 'Linked Facebook account to existing user');
            } else {
              // Create new user
              user = await prisma.user.create({
                data: {
                  email,
                  facebookId: profile.id,
                  firstName: profile.name?.givenName,
                  lastName: profile.name?.familyName,
                  avatarUrl: profile.photos?.[0]?.value,
                  authProvider: 'facebook',
                  emailVerified: true,
                  verified: true,
                },
              });
              logger.info({ userId: user.id }, 'Created new user via Facebook OAuth');
            }
          }

          return done(null, user);
        } catch (error) {
          logger.error({ error }, 'Facebook OAuth error');
          return done(error as Error, undefined);
        }
      }
    )
  );
  logger.info('Facebook OAuth strategy configured');
} else {
  logger.warn('Facebook OAuth not configured - missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET');
}

// Serialize user for session (not used with JWT but required by Passport)
passport.serializeUser((user: Express.User, done) => {
  done(null, (user as { id: string }).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
