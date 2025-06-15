import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { User, IUser } from '../models/User';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  console.log('=== Authentication Check Start ===');
  console.log('Headers:', req.headers);
  
  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      console.error('Authentication error:', err);
      return next(err);
    }
    if (!user) {
      console.error('No user found in authentication');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    console.log('User authenticated:', user);
    req.user = user;
    console.log('=== Authentication Check End ===');
    next();
  })(req, res, next);
}; 