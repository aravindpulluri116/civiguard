export interface Complaint {
  _id: string;
  title: string;
  description: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  status: 'pending' | 'in-progress' | 'resolved';
  category: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  email: string;
  name: string;
  imageUrl?: string;
  images?: string[];
  department?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  comments?: Array<{
    text: string;
    userId: string;
    createdAt: string;
  }>;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'citizen' | 'admin' | 'authority';
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}