import React from 'react';
import { FileText, Map, Shield, Users, TrendingUp, Clock } from 'lucide-react';

interface HomePageProps {
  onViewChange: (view: 'map' | 'list' | 'report') => void;
  complaintsCount: number;
}

export const HomePage: React.FC<HomePageProps> = ({ onViewChange, complaintsCount }) => {
  const stats = [
    { label: 'Total Reports', value: complaintsCount.toString(), icon: FileText, color: 'text-blue-600' },
    { label: 'Resolved Issues', value: '8', icon: Shield, color: 'text-green-600' },
    { label: 'Active Users', value: '1,247', icon: Users, color: 'text-purple-600' },
    { label: 'Avg. Response Time', value: '2.4 hrs', icon: Clock, color: 'text-orange-600' }
  ];

  const features = [
    {
      title: 'Quick Reporting',
      description: 'Submit civic issues with photos and location in seconds',
      icon: FileText,
      action: () => onViewChange('report')
    },
    {
      title: 'Live Map View',
      description: 'View all reported issues on an interactive city map',
      icon: Map,
      action: () => onViewChange('map')
    },
    {
      title: 'AI Classification',
      description: 'Smart categorization and urgency detection',
      icon: TrendingUp,
      action: () => {}
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Your Voice for a
              <span className="text-blue-600 block">Better City</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              CIVIGUARD empowers citizens to report civic issues instantly. Our AI-powered platform 
              ensures your concerns reach the right authorities for quick resolution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onViewChange('report')}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Report an Issue
              </button>
              <button
                onClick={() => onViewChange('map')}
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
              >
                View City Map
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How CIVIGUARD Works</h2>
          <p className="text-xl text-gray-600">Simple, fast, and effective civic engagement</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                onClick={feature.action}
                className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of citizens making their communities better, one report at a time.
            </p>
            <button
              onClick={() => onViewChange('report')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Start Reporting Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};