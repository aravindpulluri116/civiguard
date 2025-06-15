import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from '../models/User';

// Log environment variables (remove in production)
console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID);
console.log('Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET);
console.log('Google Callback URL:', process.env.GOOGLE_CALLBACK_URL);

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing Google OAuth credentials in environment variables');
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google profile:', profile);
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: profile.emails![0].value,
            name: profile.displayName,
          });
        }

        return done(null, user);
      } catch (error) {
        console.error('Error in Google Strategy:', error);
        return done(error as Error);
      }
    }
  )
);

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-secret-key'
};

passport.use(new JwtStrategy(options, async (payload, done) => {
  try {
    const user = await User.findById(payload._id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.error('Error in deserializeUser:', error);
    done(error as Error);
  }
}); 