import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {

        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { googleId: profile.id },
              { email: profile.emails ? profile.emails[0].value : '' }
            ]
          },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              password: "",
              email: profile.emails ? profile.emails[0].value : '',
              name: profile.displayName,
            },
          });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        return done(null, { token });
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

export default passport;