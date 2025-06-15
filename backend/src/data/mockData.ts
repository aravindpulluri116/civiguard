import { IComplaint } from '../models/Complaint';
import mongoose from 'mongoose';

export const mockComplaints: Partial<IComplaint>[] = [
  {
    title: 'Large Pothole on Main Street',
    description: 'A large pothole causing traffic issues',
    category: 'pothole',
    priority: 'high',
    status: 'pending',
    location: {
      lat: 17.3850,
      lng: 78.4867
    },
    userId: new mongoose.Types.ObjectId(),
    images: ['https://example.com/pothole1.jpg']
  },
  {
    title: 'Garbage Pile Near Park',
    description: 'Uncollected garbage for several days',
    category: 'garbage',
    priority: 'medium',
    status: 'in-progress',
    location: {
      lat: 17.3950,
      lng: 78.4967
    },
    userId: new mongoose.Types.ObjectId(),
    images: ['https://example.com/garbage1.jpg']
  },
  {
    title: 'Water Leak on Sidewalk',
    description: 'Water leaking from underground pipe',
    category: 'water_leak',
    priority: 'critical',
    status: 'pending',
    location: {
      lat: 17.3750,
      lng: 78.4767
    },
    userId: new mongoose.Types.ObjectId(),
    images: ['https://example.com/waterleak1.jpg']
  },
  {
    title: 'Street light not working',
    description: 'Street light on Pine Street has been out for several days, creating safety concerns for pedestrians at night.',
    category: 'street_light',
    priority: 'medium',
    status: 'pending',
    location: {
      lat: 40.7505,
      lng: -73.9934
    },
    userId: new mongoose.Types.ObjectId(),
    images: ['https://images.pexels.com/photos/301920/pexels-photo-301920.jpeg?auto=compress&cs=tinysrgb&w=800']
  },
  {
    title: 'Damaged sidewalk',
    description: 'Cracked and uneven sidewalk creating tripping hazard for pedestrians, especially elderly residents.',
    category: 'other',
    priority: 'low',
    status: 'pending',
    location: {
      lat: 40.7282,
      lng: -73.9942
    },
    userId: new mongoose.Types.ObjectId(),
    images: ['https://images.pexels.com/photos/1647962/pexels-photo-1647962.jpeg?auto=compress&cs=tinysrgb&w=800']
  }
]; 