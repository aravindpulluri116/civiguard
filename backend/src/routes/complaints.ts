import { Router } from 'express';
import { complaintsController } from '../controllers/complaints';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

// Get all complaints
router.get('/', isAuthenticated, complaintsController.getComplaints);

// Get all complaints for the authenticated user
router.get('/my-reports', isAuthenticated, complaintsController.getComplaintsForUser);

// Create a new complaint
router.post('/', isAuthenticated, complaintsController.createComplaint);

// Update a complaint
router.patch('/:id', isAuthenticated, complaintsController.updateComplaint);

export const complaintsRouter = router; 