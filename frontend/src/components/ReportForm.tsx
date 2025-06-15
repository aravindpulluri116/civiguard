import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Complaint } from '../types';
import { Camera, MapPin, Send, Loader2 } from 'lucide-react';
import { analyzeComplaint, validateComplaint, getCoordinatesFromAddress } from '../services/gemini';
import { categoryOptions, urgencyOptions } from '../data/mockData';
import { toast } from 'react-hot-toast';
import { complaintService } from '../services/complaintService';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyCo4m_8IUWaD3LsiAsHJabMYK4X-oLpt44');

interface ReportFormProps {
  onSubmit: (report: any) => void;
  onCancel: () => void;
  initialLocation?: {
    type: string;
    coordinates: [number, number];
  };
}

interface FormData {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending';
  images: string[];
  location: {
    type: string;
    coordinates: [number, number];
  };
  email: string;
  name: string;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onSubmit, onCancel, initialLocation }) => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    status: 'pending',
    images: [],
    location: {
      type: 'Point',
      coordinates: [0, 0]
    },
    email: user?.email || '',
    name: user?.name || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ category: string; priority: string; explanation: string; enhancedTitle?: string; enhancedDescription?: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationMethod, setLocationMethod] = useState<'live' | 'manual'>('live');
  const [manualAddress, setManualAddress] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-analyze when title or description changes
  useEffect(() => {
    const analyzeInput = async () => {
      if (formData.title.length > 5 && formData.description.length > 10) {
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      try {
        const uploadPromises = Array.from(files).map(async (file) => {
          // For testing, we'll just use the file name as the URL
          const imageUrl = `test-upload-${file.name}`;
          return imageUrl;
        });

        const uploadedUrls = await Promise.all(uploadPromises);
        setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
        toast.success('Images uploaded successfully!');
      } catch (error) {
        console.error('Error uploading images:', error);
        toast.error('Failed to upload images. Please try again.');
      }
    }
  };

  const handleLocationMethodChange = (method: 'live' | 'manual') => {
    setLocationMethod(method);
    setLocationError(null);
    if (method === 'live') {
      getCurrentLocation();
    } else {
      setFormData(prev => ({
        ...prev,
        location: {
          type: 'Point',
          coordinates: [0, 0]
        }
      }));
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Got location:', position.coords);
        setFormData(prev => ({
          ...prev,
          location: {
            type: 'Point',
            coordinates: [position.coords.longitude, position.coords.latitude] as [number, number]
          }
        }));
        setLocationError(null);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationError('Unable to retrieve your location. Please try manual address entry.');
        // Set default location to Hyderabad if geolocation fails
        setFormData(prev => ({
          ...prev,
          location: {
            type: 'Point',
            coordinates: [78.4867, 17.3850] as [number, number] // Hyderabad coordinates
          }
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const handleGeocodeAddress = async () => {
    if (!manualAddress.trim()) {
      setLocationError('Please enter an address');
      return;
    }

    setIsGeocoding(true);
    setLocationError(null);

    try {
      const location = await getCoordinatesFromAddress(manualAddress);
      setFormData(prev => ({
        ...prev,
        location
      }));
      setLocationError(null);
    } catch (error) {
      console.error('Error getting coordinates:', error);
      setLocationError('Error converting address to coordinates. Please try again.');
    } finally {
      setIsGeocoding(false);
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
    if (!user) {
      toast.error('Please login to submit a complaint');
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    if (!formData.priority) {
      toast.error('Please select a priority level');
      return;
    }

    // Validate location
    if (!formData.location.type || !Array.isArray(formData.location.coordinates) || formData.location.coordinates.length !== 2) {
      toast.error('Please set a valid location');
      return;
    }

    if (formData.location.coordinates[0] === 0 && formData.location.coordinates[1] === 0) {
      toast.error('Please set a location for your complaint');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create complaint data without any image-related fields
      const complaintData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        status: 'pending' as const,
        location: {
          type: 'Point',
          coordinates: formData.location.coordinates
        },
        email: user.email || formData.email,
        name: user.name || formData.name
      };

      console.log('Submitting complaint with data:', complaintData);
      const complaint = await complaintService.createComplaint(complaintData);

      toast.success('Complaint submitted successfully!');
      onSubmit(formData);
      navigate('/my-reports');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit complaint. Please try again.');
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
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="text-gray-700 font-medium">Location Method:</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="locationMethod"
                      value="live"
                      checked={locationMethod === 'live'}
                      onChange={() => handleLocationMethodChange('live')}
                    />
                    <span className="ml-2">Use Current Location</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="locationMethod"
                      value="manual"
                      checked={locationMethod === 'manual'}
                      onChange={() => handleLocationMethodChange('manual')}
                    />
                    <span className="ml-2">Enter Address</span>
                  </label>
                </div>
              </div>

              {locationMethod === 'manual' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    placeholder="Enter full address (e.g., 1600 Amphitheatre Parkway, Mountain View, CA)"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleGeocodeAddress}
                    disabled={isGeocoding}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isGeocoding ? 'Converting...' : 'Convert to Coordinates'}
                  </button>
                </div>
              )}

              {locationError && (
                <p className="text-red-500 text-sm">{locationError}</p>
              )}

              {formData.location.coordinates[0] !== 0 && formData.location.coordinates[1] !== 0 && (
                <div className="text-sm text-gray-600">
                  <p>Coordinates: {formData.location.coordinates[1]}, {formData.location.coordinates[0]}</p>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Camera className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload files</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageUpload}
                        ref={fileInputRef}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              
              {/* Image Preview */}
              {formData.images.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.images.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <div className="bg-gray-100 rounded-lg p-2">
                          <p className="text-sm text-gray-600 truncate">{imageUrl}</p>
                        </div>
                      </div>
                    ))}
                  </div>
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