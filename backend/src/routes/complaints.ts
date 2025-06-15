import express from 'express';
import { complaintsController } from '../controllers/complaints';
import { isAuthenticated } from '../middleware/auth';
import { Complaint, IComplaint } from '../models/Complaint';
import { User, IUser } from '../models/User';

const router = express.Router();

interface PopulatedComplaint extends Omit<IComplaint, 'userId'> {
  userId: IUser;
}

// Public route to get all public complaints
router.get('/public', async (req, res) => {
  try {
    const complaints = await Complaint.find({ isPublic: true })
      .populate<{ userId: IUser }>('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    
    // Transform the data to match the frontend's expected format
    const transformedComplaints = complaints.map(complaint => ({
      ...complaint.toObject(),
      user: complaint.userId ? {
        _id: complaint.userId._id,
        name: complaint.userId.name,
        email: complaint.userId.email
      } : undefined
    }));
    
    res.json(transformedComplaints);
  } catch (error) {
    console.error('Error fetching public complaints:', error);
    res.status(500).json({ message: 'Error fetching public complaints' });
  }
});

// Protected routes
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate<{ userId: IUser }>('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    
    // Transform the data to match the frontend's expected format
    const transformedComplaints = complaints.map(complaint => ({
      ...complaint.toObject(),
      user: complaint.userId ? {
        _id: complaint.userId._id,
        name: complaint.userId.name,
        email: complaint.userId.email
      } : undefined
    }));
    
    res.json(transformedComplaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ message: 'Error fetching complaints' });
  }
});

// Get all complaints for the authenticated user
router.get('/my-reports', isAuthenticated, complaintsController.getComplaintsForUser);

// Create a new complaint
router.post('/', isAuthenticated, complaintsController.createComplaint);

// Update a complaint
router.patch('/:id', isAuthenticated, complaintsController.updateComplaint);

export const complaintsRouter = router; 