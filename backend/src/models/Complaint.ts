import mongoose, { Document } from 'mongoose';

export interface IComplaint extends Document {
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
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  images?: string[];
  comments?: Array<{
    userId: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }>;
}

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  enhancedTitle: {
    type: String
  },
  enhancedDescription: {
    type: String
  },
  category: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending'
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    type: String
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export const Complaint = mongoose.model<IComplaint>('Complaint', complaintSchema); 