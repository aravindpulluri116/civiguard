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

// Map bounds for Hyderabad
const HYDERABAD_BOUNDS = {
  north: 17.5,
  south: 17.3,
  east: 78.6,
  west: 78.4
};

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

export const MapView: React.FC<MapViewProps> = ({ complaints: initialComplaints = [] }) => {
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    priority: 'all',
    status: 'all'
  });
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Get user's current location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback to Hyderabad coordinates
          setUserLocation([17.385000, 78.486700]);
        }
      );
    } else {
      // Fallback to Hyderabad coordinates if geolocation is not supported
      setUserLocation([17.385000, 78.486700]);
    }
  }, []);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await complaintService.getComplaints();
        setComplaints(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch complaints');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const filteredComplaints = complaints.filter(complaint => {
    return (
      (filters.category === 'all' || complaint.category === filters.category) &&
      (filters.priority === 'all' || complaint.priority === filters.priority) &&
      (filters.status === 'all' || complaint.status === filters.status)
    );
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
    <div className="flex h-screen">
      <div className="flex-1 relative">
        {userLocation && (
          <MapContainer
            center={userLocation}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Auto-fit bounds when complaints change */}
            <MapBounds complaints={filteredComplaints} />

            {/* Add user location marker */}
            <Marker
              position={userLocation}
              icon={L.divIcon({
                className: 'user-location-marker',
                html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
              })}
            />

            {filteredComplaints.map(complaint => {
              // Ensure location coordinates are numbers
              const lat = Number(complaint.location.lat);
              const lng = Number(complaint.location.lng);
              
              if (isNaN(lat) || isNaN(lng)) {
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