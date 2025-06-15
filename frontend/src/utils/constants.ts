import L from 'leaflet';

// Create custom icons for different categories
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

export const categoryIcons = {
  pothole: createIcon('#ef4444'),
  garbage: createIcon('#f97316'),
  water_leak: createIcon('#3b82f6'),
  street_light: createIcon('#eab308'),
  other: createIcon('#6b7280')
};

export const categoryOptions = [
  { value: 'pothole', label: 'Pothole' },
  { value: 'garbage', label: 'Garbage' },
  { value: 'water_leak', label: 'Water Leak' },
  { value: 'street_light', label: 'Street Light' },
  { value: 'other', label: 'Other' }
];

export const urgencyOptions = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];

export const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' }
]; 