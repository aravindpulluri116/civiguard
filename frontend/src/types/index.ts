export interface Complaint {
  _id: string;
  title: string;
  description: string;
  enhancedTitle?: string;
  enhancedDescription?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'resolved';
  location: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  updatedAt: string;
  userId: string;
  images?: string[];
  comments?: Comment[];
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