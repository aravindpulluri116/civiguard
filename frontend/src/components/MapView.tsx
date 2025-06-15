import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { Filter, Eye, Clock, MapPin, AlertTriangle, X, Maximize2 } from 'lucide-react';
import { Complaint } from '../types';
import { categoryOptions, urgencyOptions, statusOptions } from '../data/mockData';
import { ReportForm } from './ReportForm';
import { useAuth } from '../contexts/AuthContext';
import 'leaflet/dist/leaflet.css';
import { complaintService } from '../services/complaintService';
import L from 'leaflet';
import { categoryIcons } from '../utils/constants';
import { getUrgencyColor } from '../utils/helpers';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Create custom icons for different categories
const createIcon = (color: string) => new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  `)}`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

interface MapViewProps {
  complaints?: Complaint[];
}

// Hyderabad boundaries
const HYDERABAD_BOUNDS = {
  north: 17.6,  // Northern boundary
  south: 17.2,  // Southern boundary
  east: 78.6,   // Eastern boundary
  west: 78.3    // Western boundary
};

// Predefined points of interest in Hyderabad
const HYDERABAD_POINTS = [
  {
    name: "GHMC Head Office",
    location: { lat: 17.3850, lng: 78.4867 },
    type: "government",
    description: "Greater Hyderabad Municipal Corporation Head Office"
  },
  {
    name: "Osmania General Hospital",
    location: { lat: 17.3850, lng: 78.4867 },
    type: "hospital",
    description: "Major government hospital"
  },
  {
    name: "Police Commissionerate",
    location: { lat: 17.3850, lng: 78.4867 },
    type: "police",
    description: "Hyderabad Police Commissionerate"
  },
  {
    name: "Public Works Department",
    location: { lat: 17.3850, lng: 78.4867 },
    type: "government",
    description: "PWD Office"
  },
  {
    name: "Water Board Office",
    location: { lat: 17.3850, lng: 78.4867 },
    type: "utility",
    description: "Hyderabad Metropolitan Water Supply and Sewerage Board"
  },
  {
    name: "Traffic Police HQ",
    location: { lat: 17.3850, lng: 78.4867 },
    type: "police",
    description: "Traffic Police Headquarters"
  },
  {
    name: "Fire Station HQ",
    location: { lat: 17.3850, lng: 78.4867 },
    type: "emergency",
    description: "Fire Services Headquarters"
  },
  {
    name: "Public Health Center",
    location: { lat: 17.3850, lng: 78.4867 },
    type: "hospital",
    description: "Primary Health Center"
  }
];

// Component to handle map bounds
const MapBounds = ({ complaints }: { complaints: Complaint[] }) => {
  const map = useMap();

  useEffect(() => {
    if (complaints.length > 0) {
      const bounds = new LatLngBounds(
        complaints.map(complaint => [complaint.location.lat, complaint.location.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [complaints, map]);

  return null;
};

// Component for the Show all markers button
const ShowAllMarkersButton = ({ complaints }: { complaints: Complaint[] }) => {
  const map = useMap();

  if (complaints.length === 0) return null;

  return (
    <button
      onClick={() => {
        const bounds = new LatLngBounds(
          complaints.map(complaint => [complaint.location.lat, complaint.location.lng])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }}
      className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-lg shadow-lg hover:bg-gray-100"
      title="Show all markers"
    >
      <Maximize2 className="h-5 w-5" />
    </button>
  );
};

// Mock complaints in Hyderabad
const mockComplaints: Complaint[] = [
  {
    _id: '1',
    title: 'Pothole on Main Road',
    description: 'Large pothole causing traffic issues',
    category: 'pothole',
    priority: 'high',
    status: 'pending',
    location: {
      lat: 17.3850,
      lng: 78.4867
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: '1'
  },
  {
    _id: '2',
    title: 'Garbage Pile',
    description: 'Uncleared garbage for 3 days',
    category: 'garbage',
    priority: 'medium',
    status: 'pending',
    location: {
      lat: 17.3950,
      lng: 78.4767
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: '1'
  },
  {
    _id: '3',
    title: 'Water Leak',
    description: 'Water leaking from main pipe',
    category: 'water_leak',
    priority: 'critical',
    status: 'in-progress',
    location: {
      lat: 17.3750,
      lng: 78.4967
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: '1'
  },
  {
    _id: '4',
    title: 'Street Light Not Working',
    description: 'Street light not working for 2 days',
    category: 'street_light',
    priority: 'medium',
    status: 'pending',
    location: {
      lat: 17.4050,
      lng: 78.4667
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: '1'
  }
];

export const MapView: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    priority: 'all',
    status: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([17.3850, 78.4867]); // Default to Hyderabad center
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const data = user 
          ? await complaintService.getComplaints()
          : await complaintService.getPublicComplaints();
        setComplaints(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setError('Failed to load complaints. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [user]);

  // Get user's current location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log('Got user location:', lat, lng);
          setUserLocation([lat, lng]);
          setLocationError(null);
          setShowLocationPrompt(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Location access denied. Using default location.");
          // Fallback to Hyderabad coordinates
          setUserLocation([17.385000, 78.486700]);
          setShowLocationPrompt(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser. Using default location.");
      setUserLocation([17.385000, 78.486700]);
      setShowLocationPrompt(false);
    }
  }, []);

  const isWithinHyderabad = (lat: number, lng: number): boolean => {
    return (
      lat >= HYDERABAD_BOUNDS.south &&
      lat <= HYDERABAD_BOUNDS.north &&
      lng >= HYDERABAD_BOUNDS.west &&
      lng <= HYDERABAD_BOUNDS.east
    );
  };

  const filteredComplaints = complaints.filter(complaint => {
    // Ensure location coordinates are numbers
    const lat = Number(complaint.location.lat);
    const lng = Number(complaint.location.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates for complaint:', complaint._id, complaint.location);
      return false;
    }

    // Filter by Hyderabad boundaries
    if (!isWithinHyderabad(lat, lng)) {
      return false;
    }

    // Apply other filters if they exist
    if (filters.category && filters.category !== 'all' && complaint.category !== filters.category) {
      return false;
    }
    if (filters.priority && filters.priority !== 'all' && complaint.priority !== filters.priority) {
      return false;
    }
    return true;
  });

  const renderPopup = (complaint: Complaint) => (
    <div className="p-4 max-w-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {complaint.enhancedTitle || complaint.title}
      </h3>
      <p className="text-gray-600 mb-4">
        {complaint.enhancedDescription || complaint.description}
      </p>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {new Date(complaint.createdAt).toLocaleDateString()}
        </span>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
          complaint.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {complaint.status}
        </span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-red-500">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="flex-1 relative">
        {!loading && (
          <>
            <MapContainer
              center={userLocation}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* User Location Marker */}
              <Marker
                position={userLocation}
                icon={L.divIcon({
                  className: 'user-location-marker',
                  html: '<div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white"></div>'
                })}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-medium">Your Location</h3>
                    <p className="text-sm text-gray-600">
                      {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>

              {/* Predefined Points of Interest */}
              {HYDERABAD_POINTS.map((point, index) => (
                <Marker
                  key={`poi-${index}`}
                  position={[point.location.lat, point.location.lng]}
                  icon={L.divIcon({
                    className: 'poi-marker',
                    html: `<div class="w-4 h-4 bg-green-600 rounded-full border-2 border-white"></div>`
                  })}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-gray-900">{point.name}</h3>
                      <p className="text-sm text-gray-600">{point.description}</p>
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        {point.type}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Complaint Markers */}
              {filteredComplaints.map(complaint => {
                const lat = Number(complaint.location.lat);
                const lng = Number(complaint.location.lng);
                
                if (isNaN(lat) || isNaN(lng)) {
                  console.error('Invalid coordinates for complaint:', complaint._id, complaint.location);
                  return null;
                }

                return (
                  <Marker
                    key={complaint._id}
                    position={[lat, lng]}
                    icon={categoryIcons[complaint.category as keyof typeof categoryIcons] || categoryIcons.other}
                    eventHandlers={{
                      click: () => setSelectedComplaint(complaint)
                    }}
                  >
                    <Popup>
                      {renderPopup(complaint)}
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Location Error Toast */}
            {locationError && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded shadow-lg z-50">
                {locationError}
                <button 
                  onClick={() => setLocationError(null)}
                  className="ml-2 text-yellow-700 hover:text-yellow-900"
                >
                  ×
                </button>
              </div>
            )}

            {/* Location Permission Prompt */}
            {showLocationPrompt && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-md">
                <h3 className="font-medium mb-2">Enable Location Access</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Allow location access to see issues near you. You can change this later in your browser settings.
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowLocationPrompt(false);
                      setUserLocation([17.385000, 78.486700]);
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Use Default Location
                  </button>
                  <button
                    onClick={() => {
                      setShowLocationPrompt(false);
                      // Retry getting location
                      if ("geolocation" in navigator) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            setUserLocation([position.coords.latitude, position.coords.longitude]);
                            setLocationError(null);
                          },
                          (error) => {
                            setLocationError("Location access denied. Using default location.");
                            setUserLocation([17.385000, 78.486700]);
                          }
                        );
                      }
                    }}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Enable Location
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Report Button */}
        {user && (
          <button
            onClick={() => setShowReportForm(true)}
            className="absolute bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          >
            Report Issue
          </button>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Issues</h2>
            
            {/* Filters */}
          <div className="space-y-2 mb-4">
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
              <option value="all">All Categories</option>
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              
              <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              <option value="all">All Priorities</option>
                {urgencyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              <option value="all">All Statuses</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

          {/* Issues List */}
          <div className="space-y-4">
            {filteredComplaints.map(complaint => (
              <div
                key={complaint._id}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 cursor-pointer transition-colors"
                onClick={() => setSelectedComplaint(complaint)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{complaint.enhancedTitle || complaint.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{complaint.enhancedDescription || complaint.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(complaint.priority)}`}>
                    {complaint.priority}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(complaint.createdAt).toLocaleDateString()}
          </div>
              </div>
            ))}
          </div>
        </div>
            </div>

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Report an Issue</h2>
              <button
                onClick={() => setShowReportForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <ReportForm
              onSubmit={(report) => {
                setComplaints(prev => [...prev, report]);
                setShowReportForm(false);
              }}
              onCancel={() => setShowReportForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};