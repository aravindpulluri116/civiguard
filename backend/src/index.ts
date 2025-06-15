import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { complaintsRouter } from './routes/complaints';
import './config/passport';

dotenv.config();

const app = express();

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civiguard')
  .then(() => {
    console.log('Successfully connected to MongoDB');
    console.log('Database name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if we can't connect to the database
  });

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/complaints', complaintsRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 