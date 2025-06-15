import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Clock, AlertTriangle } from 'lucide-react';
import { Complaint } from '../types';
import { complaintService } from '../services/complaintService';

export const MyReports: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserReports = async () => {
      if (!user) return;

      try {
        const data = await complaintService.getUserComplaints();
        setComplaints(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserReports();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view your reported issues.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Reports</h1>
        
        {complaints.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">You haven't submitted any reports yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {complaints.map((complaint) => (
              <div key={complaint._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {complaint.enhancedTitle || complaint.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      complaint.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {complaint.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {complaint.enhancedDescription || complaint.description}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>Location: {complaint.location.lat.toFixed(4)}, {complaint.location.lng.toFixed(4)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Reported: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 