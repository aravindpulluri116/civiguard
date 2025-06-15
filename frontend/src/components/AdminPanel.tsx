import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Filter,
  Download,
  Eye,
  MessageSquare,
  Calendar,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import { Complaint } from '../types';
import { categoryOptions, urgencyOptions, statusOptions } from '../data/mockData';
import toast from 'react-hot-toast';

interface AdminPanelProps {
  complaints: Complaint[];
  onUpdateComplaint: (id: string, updates: Partial<Complaint>) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ complaints, onUpdateComplaint }) => {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    status: '',
    dateRange: 'all'
  });

  const filteredComplaints = complaints.filter(complaint => {
    const dateFilter = filters.dateRange === 'all' ? true : 
      new Date(complaint.createdAt) >= new Date(Date.now() - parseInt(filters.dateRange) * 24 * 60 * 60 * 1000);
    return (
      dateFilter &&
      (!filters.category || complaint.category === filters.category) &&
      (!filters.priority || complaint.priority === filters.priority) &&
      (!filters.status || complaint.status === filters.status)
    );
  });

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    inProgress: complaints.filter(c => c.status === 'in-progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    critical: complaints.filter(c => c.priority === 'critical').length
  };

  const handleStatusUpdate = (complaintId: string, newStatus: Complaint['status']) => {
    try {
    onUpdateComplaint(complaintId, { 
      status: newStatus, 
        updatedAt: new Date().toISOString()
    });
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: Complaint['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Complaint['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage and monitor civic complaints</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.resolved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.critical}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              {urgencyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Complaints ({filteredComplaints.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {complaint.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {complaint.description.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {complaint.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative">
                      <select
                        value={complaint.status}
                          onChange={(e) => handleStatusUpdate(complaint._id, e.target.value as Complaint['status'])}
                          className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(complaint.status)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(complaint.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedComplaint(complaint)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900"
                      >
                        <MessageSquare className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{selectedComplaint.title}</h3>
                <button
                  onClick={() => setSelectedComplaint(null)}
                className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                ×
                </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="mt-1 text-gray-900">{selectedComplaint.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Category</h4>
                  <p className="mt-1 text-gray-900">{selectedComplaint.category}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Priority</h4>
                  <p className="mt-1 text-gray-900">{selectedComplaint.priority}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p className="mt-1 text-gray-900">{selectedComplaint.status}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Submitted</h4>
                  <p className="mt-1 text-gray-900">{formatDate(selectedComplaint.createdAt)}</p>
                </div>
              </div>
              {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Images</h4>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    {selectedComplaint.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Complaint ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};