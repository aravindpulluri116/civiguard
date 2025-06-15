import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Complaint } from '../types';
import { Camera, MapPin, Send, Loader2 } from 'lucide-react';
import { analyzeComplaint, validateComplaint } from '../services/gemini';
import { categoryOptions, urgencyOptions } from '../data/mockData';
import { toast } from 'react-hot-toast';
import { complaintService } from '../services/complaintService';

interface ReportFormProps {
  onSubmit: (report: any) => void;
  onCancel: () => void;
  initialLocation?: { lat: number; lng: number };
}

export const ReportForm: React.FC<ReportFormProps> = ({ onSubmit, onCancel, initialLocation }) => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    status: 'pending' as const,
    images: [] as string[],
    location: initialLocation || { lat: 0, lng: 0 }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ category: string; priority: string; explanation: string; enhancedTitle?: string; enhancedDescription?: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-analyze when title or description changes
  useEffect(() => {
    const analyzeInput = async () => {
      if (formData.title.length > 5 && formData.description.length > 20) {
        setIsAnalyzing(true);
        try {
          const result = await analyzeComplaint(formData.title, formData.description);
          setAiAnalysis(result);
          setFormData(prev => ({
            ...prev,
            category: result.category,
            priority: result.priority as 'low' | 'medium' | 'high' | 'critical'
          }));
        } catch (err) {
          console.error('Error analyzing complaint:', err);
        } finally {
          setIsAnalyzing(false);
        }
      }
    };

    const timeoutId = setTimeout(analyzeInput, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData.title, formData.description]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Got location:', position.coords);
          setFormData(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          // Set default location to Hyderabad if geolocation fails
          setFormData(prev => ({
            ...prev,
            location: {
              lat: 17.3850,
              lng: 78.4867
            }
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      // Set default location to Hyderabad if geolocation is not supported
      setFormData(prev => ({
        ...prev,
        location: {
          lat: 17.3850,
          lng: 78.4867
        }
      }));
    }
  };

  // Get location on component mount
  useEffect(() => {
    if (initialLocation) {
        setFormData(prev => ({
          ...prev,
        location: initialLocation
        }));
    } else {
      getCurrentLocation();
    }
  }, [initialLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!user) {
      toast.error('Please log in to submit a report');
      return;
    }

    try {
      // Validate the complaint first
      const validation = await validateComplaint(formData.title, formData.description);
      if (!validation.isValid) {
        toast.error(validation.reason);
        setIsSubmitting(false);
        return;
      }

      // Include enhanced fields if available from AI analysis
      const submissionData = {
        ...formData,
        enhancedTitle: aiAnalysis?.enhancedTitle,
        enhancedDescription: aiAnalysis?.enhancedDescription
      };

      console.log('Submitting complaint with data:', submissionData);

      const data = await complaintService.createComplaint(submissionData);
      console.log('Received response from server:', data);
      
      onSubmit(data);
      setShowSuccess(true);
      toast.success('Report submitted successfully!');
      setTimeout(() => {
        navigate('/my-reports');
      }, 2000);
    } catch (err) {
      console.error('Error submitting complaint:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in with your Google account to report issues and help improve our community.
          </p>
          <button
            onClick={login}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted Successfully!</h2>
          <p className="text-gray-600">Thank you for helping improve our community.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Report a Civic Issue</h1>
            <p className="text-gray-600">Help us keep our community safe and well-maintained</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                name="title"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the issue"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={handleChange}
                name="description"
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please provide detailed information about the issue"
              />
            </div>

            {/* AI Analysis */}
            {isAnalyzing && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing your report...</span>
              </div>
            )}

            {aiAnalysis && !isAnalyzing && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">AI Analysis</h3>
                <p className="text-blue-700 text-sm">{aiAnalysis.explanation}</p>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={handleChange}
                name="category"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level *
              </label>
              <select
                required
                value={formData.priority}
                onChange={handleChange}
                name="priority"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {urgencyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Use Current Location</span>
                </button>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Coordinates: {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
              </div>
              {formData.location.lat === 0 && formData.location.lng === 0 && (
                <div className="mt-2 text-sm text-red-500">
                  Location not set. Please click "Use Current Location" or allow location access in your browser.
                </div>
              )}
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images (Optional)
              </label>
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 cursor-pointer">
                  <Camera className="w-4 h-4" />
                  <span>Upload Images</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {formData.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
              >
                Cancel
              </button>
            <button
              type="submit"
              disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                </>
              ) : (
                <>
                    <Send className="w-4 h-4" />
                  <span>Submit Report</span>
                </>
              )}
            </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};