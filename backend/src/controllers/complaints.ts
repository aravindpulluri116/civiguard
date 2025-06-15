import { Request, Response } from 'express';
import { Complaint } from '../models/Complaint';

export const complaintsController = {
  async getComplaints(req: Request, res: Response) {
    try {
      const complaints = await Complaint.find().sort({ createdAt: -1 });
      res.json(complaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      res.status(500).json({ message: 'Error fetching complaints' });
    }
  },

  async getComplaintsForUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }
      const complaints = await Complaint.find({ userId: req.user._id }).sort({ createdAt: -1 });
      res.json(complaints);
    } catch (error) {
      console.error('Error fetching user complaints:', error);
      res.status(500).json({ message: 'Error fetching user complaints' });
    }
  },

  async createComplaint(req: Request, res: Response) {
    try {
      console.log('=== Complaint Creation Start ===');
      console.log('User from request:', req.user);
      
      if (!req.user) {
        console.error('No user found in request');
        return res.status(401).json({ message: 'User not found' });
      }

      console.log('Creating complaint for user:', req.user._id);
      console.log('Complaint data:', JSON.stringify(req.body, null, 2));

      const complaint = new Complaint({
        ...req.body,
        userId: req.user._id,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('Complaint object before save:', JSON.stringify(complaint, null, 2));

      const savedComplaint = await complaint.save();
      console.log('Saved complaint:', JSON.stringify(savedComplaint, null, 2));
      console.log('=== Complaint Creation End ===');
      
      res.status(201).json(savedComplaint);
    } catch (error) {
      console.error('Error creating complaint:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      res.status(500).json({ message: 'Error creating complaint' });
    }
  },

  async updateComplaint(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const complaint = await Complaint.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );

      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      res.json(complaint);
    } catch (error) {
      console.error('Error updating complaint:', error);
      res.status(500).json({ message: 'Error updating complaint' });
    }
  }
}; 