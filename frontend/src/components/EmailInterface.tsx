import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface DepartmentOfficer {
  Department: string;
  'Officer Name': string;
  Email: string;
}

export const EmailInterface: React.FC = () => {
  const [officers, setOfficers] = useState<DepartmentOfficer[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState<DepartmentOfficer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const response = await axios.get('/api/admin/officers');
        setOfficers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load officers data');
        setLoading(false);
      }
    };

    fetchOfficers();
  }, []);

  const handleSendEmail = (officer: DepartmentOfficer) => {
    const subject = encodeURIComponent('Civic Issue Update');
    const body = encodeURIComponent(
      `Dear ${officer['Officer Name']},\n\n` +
      `This is regarding the civic issues in your department (${officer.Department}).\n\n` +
      `Please review and take necessary action.\n\n` +
      `Best regards,\n` +
      `CiviGuard Admin`
    );
    
    const mailtoLink = `mailto:${officer.Email}?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
  };

  if (loading) {
    return <div className="p-4">Loading officers data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Department Officers</h2>
      <div className="grid gap-4">
        {officers.map((officer, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{officer.Department}</h3>
                <p className="text-gray-600">{officer['Officer Name']}</p>
                <p className="text-sm text-gray-500">{officer.Email}</p>
              </div>
              <button
                onClick={() => handleSendEmail(officer)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Send Email
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 