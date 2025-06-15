import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { MapView } from './components/MapView';
import { ReportForm } from './components/ReportForm';
import { MyReports } from './components/MyReports';
import { Navigation } from './components/Navigation';
import AuthCallback from './components/AuthCallback';
import { AdminPanel } from './components/AdminPanel';
import { Complaint } from './types';
import { HomePage } from './components/HomePage';
import { complaintService } from './services/complaintService';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  const isAdmin = user?.email === 'pulluriaravind@gmail.com' || user?.role === 'admin';
  
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await complaintService.getComplaints();
        setComplaints(data);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      }
    };

    fetchComplaints();
  }, []);

  const handleComplaintUpdate = async (id: string, updates: Partial<Complaint>) => {
    try {
      await complaintService.updateComplaint(id, updates);
      setComplaints(prev => 
        prev.map(complaint => 
          complaint._id === id ? { ...complaint, ...updates } : complaint
        )
      );
    } catch (error) {
      console.error('Error updating complaint:', error);
    }
  };

  const handleViewChange = (view: 'map' | 'list' | 'report') => {
    switch (view) {
      case 'map':
        navigate('/map');
        break;
      case 'report':
        navigate('/report');
        break;
      case 'list':
        navigate('/my-reports');
        break;
  }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Navigation userRole={(user?.role as 'citizen' | 'admin') || 'citizen'} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={
            <HomePage 
              onViewChange={handleViewChange} 
              complaintsCount={complaints.length}
            />
          } />
          <Route path="/map" element={<MapView />} />
          <Route path="/login" element={
            user ? <Navigate to="/" replace /> : <Login />
          } />
          <Route path="/report" element={
            <ProtectedRoute>
              <ReportForm 
                onSubmit={() => {}}
                onCancel={() => navigate('/')}
              />
            </ProtectedRoute>
          } />
          <Route path="/my-reports" element={
            <ProtectedRoute>
              <MyReports />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminPanel 
                complaints={complaints}
                onUpdateComplaint={handleComplaintUpdate}
              />
            </AdminRoute>
          } />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
    <AuthProvider>
        <AppContent />
      </AuthProvider>
      </Router>
  );
};

export default App;