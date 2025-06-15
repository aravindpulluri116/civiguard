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
      location: complaintData.location,
      email: complaintData.email,
      name: complaintData.name
    };
    
    console.log('Creating complaint with data:', JSON.stringify(cleanData, null, 2));
    
    // Ensure all required fields are present
    const requiredFields = ['title', 'description', 'category', 'priority', 'status', 'location', 'email', 'name'];
    const missingFields = requiredFields.filter(field => !cleanData[field as keyof typeof cleanData]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Ensure location has the correct format
    if (!cleanData.location.type || !Array.isArray(cleanData.location.coordinates)) {
      throw new Error('Invalid location format');
    }

    try {
      console.log('Sending request to:', `${API_URL}/complaints`);
      console.log('Request headers:', getAuthHeaders());
      
      const response = await fetch(`${API_URL}/complaints`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(cleanData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
        console.error('Error response from server:', errorData);
        throw new Error(errorData.message || 'Failed to create complaint');
      }

      const data = await response.json();
      console.log('Server response:', data);
      return data;
    } catch (error) {
      console.error('Error creating complaint:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
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