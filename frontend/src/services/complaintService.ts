import { Complaint } from '../types';

const API_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication token not found');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const complaintService = {
  async getComplaints(): Promise<Complaint[]> {
    const response = await fetch(`${API_URL}/complaints`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch complaints');
    }
    return response.json();
  },

  async getUserComplaints(): Promise<Complaint[]> {
    const response = await fetch(`${API_URL}/complaints/my-reports`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user complaints');
    }
    return response.json();
  },

  async createComplaint(complaintData: Omit<Complaint, '_id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Complaint> {
    console.log('Creating complaint with data:', complaintData);
    
    const response = await fetch(`${API_URL}/complaints`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(complaintData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from server:', errorData);
      throw new Error(errorData.message || 'Failed to create complaint');
    }

    const data = await response.json();
    console.log('Server response:', data);
    return data;
  },

  async updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint> {
    const response = await fetch(`${API_URL}/complaints/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('Failed to update complaint');
    }
    return response.json();
  }
}; 