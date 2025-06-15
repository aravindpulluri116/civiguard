import React from 'react';
import { Shield, Map, FileText, Settings, Bell, LogOut, LogIn, List } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  userRole: 'citizen' | 'admin';
}

export const Navigation: React.FC<NavigationProps> = ({ userRole }) => {
  const { user, login, logout } = useAuth();
  const location = useLocation();

  const isAdmin = user?.email === 'pulluriaravind@gmail.com' || userRole === 'admin';

  const navItems = [
    { id: 'home', label: 'Home', icon: Shield, path: '/' },
    { id: 'report', label: 'Report Issue', icon: FileText, path: '/report' },
    { id: 'map', label: 'Map View', icon: Map, path: '/map' },
    ...(user ? [{ id: 'my-reports', label: 'My Reports', icon: List, path: '/my-reports' }] : []),
    ...(isAdmin ? [
      { id: 'admin', label: 'Admin Panel', icon: Settings, path: '/admin' },
      { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' }
    ] : [])
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">CIVIGUARD</span>
          </div>
          
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={user ? logout : login}
              className="ml-4 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
            >
              {user ? (
                <>
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Login</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};