import { Complaint } from '../types';

export const mockComplaints: Complaint[] = [
  {
    _id: '1',
    title: 'Large Pothole on Main Street',
    description: 'A large pothole causing traffic issues',
    category: 'pothole',
    priority: 'high',
    status: 'pending',
    location: {
      lat: 17.3850,
      lng: 78.4867
    },
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
    userId: 'user1',
    images: ['https://example.com/pothole1.jpg']
  },
  {
    _id: '2',
    title: 'Garbage Pile Near Park',
    description: 'Uncollected garbage for several days',
    category: 'garbage',
    priority: 'medium',
    status: 'in-progress',
    location: {
      lat: 17.3950,
      lng: 78.4967
    },
    createdAt: '2024-03-14T15:30:00Z',
    updatedAt: '2024-03-15T09:00:00Z',
    userId: 'user2',
    images: ['https://example.com/garbage1.jpg']
  },
  {
    _id: '3',
    title: 'Water Leak on Sidewalk',
    description: 'Water leaking from underground pipe',
    category: 'water_leak',
    priority: 'critical',
    status: 'pending',
    location: {
      lat: 17.3750,
      lng: 78.4767
    },
    createdAt: '2024-03-15T08:00:00Z',
    updatedAt: '2024-03-15T08:00:00Z',
    userId: 'user3',
    images: ['https://example.com/waterleak1.jpg']
  },
  {
    _id: '4',
    title: 'Street light not working',
    description: 'Street light on Pine Street has been out for several days, creating safety concerns for pedestrians at night.',
    category: 'street_light',
    priority: 'medium',
    status: 'pending',
    location: {
      lat: 40.7505,
      lng: -73.9934
    },
    createdAt: '2024-01-16T19:45:00Z',
    updatedAt: '2024-01-16T19:45:00Z',
    userId: 'user4',
    images: ['https://images.pexels.com/photos/301920/pexels-photo-301920.jpeg?auto=compress&cs=tinysrgb&w=800']
  },
  {
    _id: '5',
    title: 'Damaged sidewalk',
    description: 'Cracked and uneven sidewalk creating tripping hazard for pedestrians, especially elderly residents.',
    category: 'other',
    priority: 'low',
    status: 'pending',
    location: {
      lat: 40.7282,
      lng: -73.9942
    },
    createdAt: '2024-01-16T12:00:00Z',
    updatedAt: '2024-01-16T12:00:00Z',
    userId: 'user5',
    images: ['https://images.pexels.com/photos/1647962/pexels-photo-1647962.jpeg?auto=compress&cs=tinysrgb&w=800']
  }
];

export const categoryOptions = [
  { value: 'pothole', label: 'Pothole', color: 'bg-red-500' },
  { value: 'garbage', label: 'Garbage', color: 'bg-yellow-500' },
  { value: 'water_leak', label: 'Water Leak', color: 'bg-blue-500' },
  { value: 'street_light', label: 'Street Light', color: 'bg-purple-500' },
  { value: 'other', label: 'Other', color: 'bg-gray-500' }
];

export const urgencyOptions = [
  { value: 'critical', label: 'Critical', color: 'bg-red-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'low', label: 'Low', color: 'bg-green-500' }
];

export const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' }
];