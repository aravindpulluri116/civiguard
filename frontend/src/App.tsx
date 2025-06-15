import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  
  return (user?.email === 'pulluriaravind@gmail.com' || user?.role === 'admin') ? 
    <>{children}</> : 
    <Navigate to="/" replace />;
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [view, setView] = useState<'map' | 'list' | 'report'>('list');
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await complaintService.getComplaints();
        setComplaints(data);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setIsLoadingComplaints(false);
      }
    };

    fetchComplaints();
  }, []);

  const handleComplaintUpdate = async (id: string, updates: Partial<Complaint>) => {
    try {
      const updatedComplaint = await complaintService.updateComplaint(id, updates);
      setComplaints(prevComplaints =>
        prevComplaints.map(complaint =>
          complaint._id === id ? updatedComplaint : complaint
        )
      );
    } catch (error) {
      console.error('Error updating complaint:', error);
    }
  };

  if (isLoading || isLoadingComplaints) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Navigation userRole={(user?.role as 'citizen' | 'admin') || 'citizen'} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={
            <HomePage 
              onViewChange={setView} 
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
                onCancel={() => {}}
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
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;