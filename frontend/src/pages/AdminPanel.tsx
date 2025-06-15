import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { EmailInterface } from '../components/EmailInterface';

interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface DepartmentOfficer {
  Department: string;
  'Officer Name': string;
  Email: string;
}

export const AdminPanel: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [officers, setOfficers] = useState<DepartmentOfficer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    console.log('AdminPanel mounted');
    fetchComplaints();
    fetchOfficers();
  }, []);

  const fetchComplaints = async () => {
    try {
      console.log('Fetching complaints...');
      const response = await axios.get('http://localhost:5000/api/complaints');
      console.log('Complaints response:', response.data);
      setComplaints(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to load complaints');
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/officers');
      setOfficers(response.data);
    } catch (err) {
      console.error('Error fetching officers:', err);
    }
  };

  const handleStatusChange = async (complaintId: string, newStatus: string) => {
    try {
      await axios.put(`http://localhost:5000/api/complaints/${complaintId}`, { status: newStatus });
      fetchComplaints();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleSendEmail = () => {
    window.location.href = "https://gmail.com";
  };

  console.log('Current complaints state:', complaints);
  console.log('Current officers state:', officers);
  console.log('Loading state:', loading);
  console.log('Error state:', error);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading complaints...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        {/* Department Officers Section */}
        <div className="mb-8">
          <EmailInterface />
        </div>

        {/* Complaints Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Complaints</h2>
          </div>
          <div className="divide-y">
            {complaints.length === 0 ? (
              <div className="p-4 text-gray-500">No complaints found</div>
            ) : (
              complaints.map(complaint => (
                <div key={complaint._id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{complaint.title}</h3>
                      <p className="text-gray-600 mt-1">{complaint.description}</p>
                      <div className="mt-2 space-x-2">
                        <span className="inline-block px-2 py-1 text-sm bg-gray-100 rounded">
                          {complaint.category}
                        </span>
                        <span className="inline-block px-2 py-1 text-sm bg-gray-100 rounded">
                          {complaint.priority}
                        </span>
                        <span className="inline-block px-2 py-1 text-sm bg-gray-100 rounded">
                          {complaint.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Reported by: {complaint.user.name} ({complaint.user.email})
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <select
                        value={complaint.status}
                        onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                        className="border rounded px-2 py-1 bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <a
                        href="https://gmail.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition-colors whitespace-nowrap inline-block"
                      >
                        Notify Department
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 