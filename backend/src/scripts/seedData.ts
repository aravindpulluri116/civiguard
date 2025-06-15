import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Complaint } from '../models/Complaint';
import { mockComplaints } from '../data/mockData';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civiguard');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Complaint.deleteMany({});
    console.log('Cleared existing complaints');

    // Insert mock data
    const complaints = await Complaint.insertMany(mockComplaints);
    console.log(`Inserted ${complaints.length} complaints`);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedDatabase(); 