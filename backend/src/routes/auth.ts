import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/login'
  }),
  (req, res) => {
    try {
      const user = req.user as IUser;
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '7d',
      });

      // Redirect to frontend with token
      res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Error in callback:', error);
      res.redirect('http://localhost:5173/login?error=auth_failed');
    }
  }
);

// Get current user
router.get('/me', isAuthenticated, (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    res.json({
      _id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

export { router as authRouter }; 