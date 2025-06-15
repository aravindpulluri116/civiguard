import { Complaint } from '../types';

const API_URL = 'http://localhost:5000/api';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const complaintService = {
  async getComplaints(): Promise<Complaint[]> {
    try {
      const response = await fetch(`${API_URL}/complaints`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error('Failed to fetch complaints');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching complaints:', error);
      return []; // Return empty array if there's an error
    }
  },

  async getPublicComplaints(): Promise<Complaint[]> {
    const response = await fetch(`${API_URL}/complaints/public`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch public complaints');
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

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.imageUrl;
  },

  async createComplaint(complaintData: Omit<Complaint, '_id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<Complaint> {
    // Create a clean data object without any image-related fields
    const cleanData = {
      title: complaintData.title,
      description: complaintData.description,
      category: complaintData.category,
      priority: complaintData.priority,
      status: 'pending',
      location: {
        lat: parseFloat(complaintData.location.coordinates[0].toString()),
        lng: parseFloat(complaintData.location.coordinates[1].toString())
      },
      email: complaintData.email,
      name: complaintData.name,
      images: []
    };

    // Log the data being sent
    console.log('Sending complaint data:', JSON.stringify(cleanData, null, 2));
    
    try {
      const response = await fetch(`${API_URL}/complaints`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
        console.error('Error response from server:', errorData);
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        throw new Error(errorData.message || 'Failed to create complaint');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating complaint:', error);
      throw error;
    }
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