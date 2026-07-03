'use client';

import { useState } from 'react';
import { Smartphone, Download, QrCode, CheckCircle, Clock, MapPin, Wrench, Camera, FileText, MessageSquare, Star, Battery, Wifi, RefreshCw, PlayCircle, Settings, Users, TrendingUp, Zap, Package, Shield, X, Eye, BarChart3, AlertCircle } from 'lucide-react';
import { exportToCsv } from '@/lib/export';

interface AppFeature {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'core' | 'productivity' | 'communication' | 'reporting';
  available: boolean;
}

interface AppStats {
  totalDownloads: number;
  activeUsers: number;
  avgRating: number;
  totalReviews: number;
  lastUpdate: string;
  version: string;
}

const appFeatures: AppFeature[] = [
  {
    id: '1',
    name: 'Job Management',
    description: 'View, accept, and manage service jobs in real-time',
    icon: Wrench,
    category: 'core',
    available: true
  },
  {
    id: '2',
    name: 'GPS Navigation',
    description: 'Turn-by-turn navigation to customer locations',
    icon: MapPin,
    category: 'core',
    available: true
  },
  {
    id: '3',
    name: 'Time Tracking',
    description: 'Clock in/out and track work hours automatically',
    icon: Clock,
    category: 'productivity',
    available: true
  },
  {
    id: '4',
    name: 'Parts Inventory',
    description: 'Check parts availability and request requisitions',
    icon: Package,
    category: 'core',
    available: true
  },
  {
    id: '5',
    name: 'Photo Documentation',
    description: 'Capture before/after photos and upload to job records',
    icon: Camera,
    category: 'reporting',
    available: true
  },
  {
    id: '6',
    name: 'Digital Signature',
    description: 'Collect customer signatures for job completion',
    icon: FileText,
    category: 'core',
    available: true
  },
  {
    id: '7',
    name: 'Offline Mode',
    description: 'Continue working without internet, sync when online',
    icon: Wifi,
    category: 'core',
    available: true
  },
  {
    id: '8',
    name: 'Customer Chat',
    description: 'Direct messaging with customers and support team',
    icon: MessageSquare,
    category: 'communication',
    available: true
  },
  {
    id: '9',
    name: 'Service History',
    description: 'Access complete customer and equipment service history',
    icon: FileText,
    category: 'core',
    available: true
  },
  {
    id: '10',
    name: 'Knowledge Base',
    description: 'Access troubleshooting guides and product manuals',
    icon: FileText,
    category: 'productivity',
    available: true
  },
  {
    id: '11',
    name: 'Feedback & Rating',
    description: 'Collect customer feedback and service ratings',
    icon: Star,
    category: 'reporting',
    available: true
  },
  {
    id: '12',
    name: 'Voice Commands',
    description: 'Hands-free operation with voice control',
    icon: PlayCircle,
    category: 'productivity',
    available: false
  },
  {
    id: '13',
    name: 'AR Assistance',
    description: 'Augmented reality for complex repairs (Coming Soon)',
    icon: Camera,
    category: 'productivity',
    available: false
  },
  {
    id: '14',
    name: 'Expense Tracking',
    description: 'Log expenses and submit reimbursement claims',
    icon: FileText,
    category: 'reporting',
    available: true
  },
  {
    id: '15',
    name: 'Performance Dashboard',
    description: 'View personal KPIs and performance metrics',
    icon: TrendingUp,
    category: 'reporting',
    available: true
  },
  {
    id: '16',
    name: 'Safety Checklist',
    description: 'Pre-job safety protocols and hazard reporting',
    icon: Shield,
    category: 'core',
    available: true
  }
];

const appStats: AppStats = {
  totalDownloads: 150,
  activeUsers: 142,
  avgRating: 4.7,
  totalReviews: 98,
  lastUpdate: '2025-10-15',
  version: '2.5.1'
};

export default function MobileAppPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showQRCode, setShowQRCode] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<AppFeature | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFeatureClick = (feature: AppFeature) => {
    setSelectedFeature(feature);
    setShowFeatureModal(true);
  };

  const handleDownloadClick = (platform: string) => {
    showToast(`Initiating ${platform} app download...`, 'success');
  };

  const filteredFeatures = selectedCategory === 'all'
    ? appFeatures
    : appFeatures.filter(f => f.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'bg-blue-100 text-blue-700';
      case 'productivity': return 'bg-purple-100 text-purple-700';
      case 'communication': return 'bg-green-100 text-green-700';
      case 'reporting': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Smartphone className="h-8 w-8 text-emerald-600" />
          Technician Mobile App
        </h1>
        <p className="text-gray-600 mt-1">Download and manage the field service mobile application</p>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {toast.type === 'error' && <X className="w-5 h-5" />}
          {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mb-3">
        <button
          onClick={() => setShowDownloadModal(true)}
          className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-blue-500 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Downloads</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{appStats.totalDownloads}</p>
              <p className="text-xs text-blue-600 mt-1">Click for details</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => setShowAnalyticsModal(true)}
          className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-green-500 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{appStats.activeUsers}</p>
              <p className="text-xs text-green-600 mt-1">View analytics</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => setShowReviewsModal(true)}
          className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-yellow-500 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2 flex items-center gap-1">
                {appStats.avgRating}
                <Star className="h-6 w-6 fill-yellow-600 text-yellow-600" />
              </p>
              <p className="text-xs text-yellow-600 mt-1">View reviews</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => setShowReviewsModal(true)}
          className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-purple-500 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reviews</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{appStats.totalReviews}</p>
              <p className="text-xs text-purple-600 mt-1">Read reviews</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => showToast(`Current version: ${appStats.version}`, 'info')}
          className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-emerald-500 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Version</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{appStats.version}</p>
              <p className="text-xs text-emerald-600 mt-1">Latest version</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <Zap className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => showToast(`Last updated: ${new Date(appStats.lastUpdate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 'info')}
          className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-orange-500 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Update</p>
              <p className="text-lg font-bold text-gray-900 mt-2">
                {new Date(appStats.lastUpdate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </p>
              <p className="text-xs text-orange-600 mt-1">View changelog</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <RefreshCw className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </button>
      </div>

      {/* Download Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg p-8 mb-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white p-3 rounded-2xl shadow-lg">
              <Smartphone className="h-16 w-16 text-emerald-600" />
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-2">Download Technician App</h2>
              <p className="text-emerald-100 mb-2 max-w-2xl">
                Empower your field technicians with our mobile app. Manage jobs, track time, access customer information, and provide excellent service on the go.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">iOS & Android</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                  <Wifi className="h-5 w-5" />
                  <span className="font-medium">Offline Capable</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                  <Battery className="h-5 w-5" />
                  <span className="font-medium">Battery Optimized</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowQRCode(true)}
              className="bg-white text-emerald-600 px-3 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-colors flex items-center gap-2 shadow-md"
            >
              <QrCode className="h-5 w-5" />
              Show QR Code
            </button>
            <button
              onClick={() => handleDownloadClick('iOS')}
              className="bg-black text-white px-3 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center gap-2 shadow-md"
            >
              <Download className="h-5 w-5" />
              Download for iOS
            </button>
            <button
              onClick={() => handleDownloadClick('Android')}
              className="bg-black text-white px-3 py-2 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center gap-2 shadow-md"
            >
              <Download className="h-5 w-5" />
              Download for Android
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter by Category:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Features
            </button>
            <button
              onClick={() => setSelectedCategory('core')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'core'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Core
            </button>
            <button
              onClick={() => setSelectedCategory('productivity')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'productivity'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Productivity
            </button>
            <button
              onClick={() => setSelectedCategory('communication')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'communication'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Communication
            </button>
            <button
              onClick={() => setSelectedCategory('reporting')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'reporting'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Reporting
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-3">
        <h2 className="text-xl font-bold text-gray-900 mb-2">App Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredFeatures.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => handleFeatureClick(feature)}
                className={`bg-white rounded-lg border-2 border-gray-200 p-3 shadow-sm hover:shadow-lg hover:border-emerald-500 transition-all text-left ${
                  !feature.available ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-3 rounded-lg ${
                    feature.category === 'core' ? 'bg-blue-100' :
                    feature.category === 'productivity' ? 'bg-purple-100' :
                    feature.category === 'communication' ? 'bg-green-100' :
                    'bg-orange-100'
                  }`}>
                    <IconComponent className={`h-6 w-6 ${
                      feature.category === 'core' ? 'text-blue-600' :
                      feature.category === 'productivity' ? 'text-purple-600' :
                      feature.category === 'communication' ? 'text-green-600' :
                      'text-orange-600'
                    }`} />
                  </div>
                  {feature.available ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-yellow-600" />
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{feature.description}</p>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(feature.category)}`}>
                    {feature.category.toUpperCase()}
                  </span>
                  {!feature.available ? (
                    <span className="text-xs font-medium text-yellow-600">Coming Soon</span>
                  ) : (
                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Details
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* App Screenshots Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-3 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-3">App Screenshots</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { title: 'Job Dashboard', color: 'from-blue-400 to-blue-600' },
            { title: 'Navigation', color: 'from-green-400 to-green-600' },
            { title: 'Parts Inventory', color: 'from-purple-400 to-purple-600' },
            { title: 'Customer Signature', color: 'from-orange-400 to-orange-600' }
          ].map((screen, index) => (
            <div key={index} className="relative">
              <div className="bg-gray-900 rounded-2xl p-3 shadow-xl">
                <div className={`bg-gradient-to-br ${screen.color} rounded-lg aspect-[9/16] flex items-center justify-center`}>
                  <div className="text-center text-white">
                    <Smartphone className="h-12 w-12 mb-2 opacity-50" />
                    <p className="text-sm font-medium opacity-75">{screen.title}</p>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-3 font-medium">{screen.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* App Management Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* System Requirements */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-600" />
            System Requirements
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">iOS Version</span>
              <span className="text-sm font-medium text-gray-900">13.0 or later</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Android Version</span>
              <span className="text-sm font-medium text-gray-900">8.0 (Oreo) or later</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Storage Required</span>
              <span className="text-sm font-medium text-gray-900">~250 MB</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">RAM Required</span>
              <span className="text-sm font-medium text-gray-900">2 GB minimum</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">GPS Required</span>
              <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Yes
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Camera Required</span>
              <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Yes
              </span>
            </div>
          </div>
        </div>

        {/* What's New */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-emerald-600" />
            What's New in v{appStats.version}
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Enhanced Offline Mode</p>
                <p className="text-xs text-gray-600">Work seamlessly without internet connectivity</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Performance Improvements</p>
                <p className="text-xs text-gray-600">50% faster app launch and sync times</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Battery Optimization</p>
                <p className="text-xs text-gray-600">Reduced battery consumption by 30%</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">New Safety Features</p>
                <p className="text-xs text-gray-600">Pre-job safety checklists and hazard reporting</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">UI/UX Enhancements</p>
                <p className="text-xs text-gray-600">Redesigned job dashboard with better navigation</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Bug Fixes</p>
                <p className="text-xs text-gray-600">Various bug fixes and stability improvements</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan to Download</h2>
            <p className="text-gray-600 mb-3">Scan this QR code with your mobile device to download the app</p>
            
            {/* QR Code Placeholder */}
            <div className="bg-white border-4 border-gray-200 rounded-lg p-8 mb-3 inline-block">
              <div className="w-64 h-64 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="h-32 w-32 text-emerald-600 mb-2" />
                  <p className="text-sm text-gray-600">QR Code</p>
                  <p className="text-xs text-gray-500 mt-2">Scan with camera app</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Smartphone className="h-4 w-4" />
                <span>iOS & Android</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Download className="h-4 w-4" />
                <span>Free Download</span>
              </div>
            </div>

            <button
              onClick={() => setShowQRCode(false)}
              className="w-full bg-emerald-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Feature Details Modal */}
      {showFeatureModal && selectedFeature && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className={`px-3 py-2 border-b sticky top-0 z-10 ${
              selectedFeature.category === 'core' ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200' :
              selectedFeature.category === 'productivity' ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' :
              selectedFeature.category === 'communication' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' :
              'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {(() => {
                      const IconComponent = selectedFeature.icon;
                      return (
                        <div className={`p-2 rounded-lg ${
                          selectedFeature.category === 'core' ? 'bg-blue-100' :
                          selectedFeature.category === 'productivity' ? 'bg-purple-100' :
                          selectedFeature.category === 'communication' ? 'bg-green-100' :
                          'bg-orange-100'
                        }`}>
                          <IconComponent className={`h-6 w-6 ${
                            selectedFeature.category === 'core' ? 'text-blue-600' :
                            selectedFeature.category === 'productivity' ? 'text-purple-600' :
                            selectedFeature.category === 'communication' ? 'text-green-600' :
                            'text-orange-600'
                          }`} />
                        </div>
                      );
                    })()}
                    <h2 className="text-xl font-bold text-gray-900">{selectedFeature.name}</h2>
                    {selectedFeature.available ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{selectedFeature.description}</p>
                </div>
                <button
                  onClick={() => setShowFeatureModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Feature Details */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Feature Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Category</span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedFeature.category)}`}>
                      {selectedFeature.category.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Availability</span>
                    <span className={`text-sm font-semibold ${selectedFeature.available ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedFeature.available ? '✓ Available Now' : '⏱ Coming Soon'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Platform Support</span>
                    <span className="text-sm font-semibold text-gray-900">iOS & Android</span>
                  </div>
                </div>
              </div>

              {/* Key Benefits */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Key Benefits
                </h3>
                <div className="space-y-2">
                  {selectedFeature.id === '1' && (
                    <>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Real-time job status updates and notifications</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Accept or decline job assignments instantly</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">View complete job details including customer info and requirements</span>
                      </div>
                    </>
                  )}
                  {selectedFeature.id === '2' && (
                    <>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Turn-by-turn navigation to customer locations</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Optimized route planning for multiple jobs</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Real-time traffic updates and alternative routes</span>
                      </div>
                    </>
                  )}
                  {selectedFeature.id === '3' && (
                    <>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Automatic clock-in when arriving at job site</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Track break times and overtime hours</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Generate accurate timesheets automatically</span>
                      </div>
                    </>
                  )}
                  {!['1', '2', '3'].includes(selectedFeature.id) && (
                    <>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Improve efficiency and productivity</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Reduce manual paperwork and errors</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Enhance customer satisfaction</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Usage Statistics */}
              {selectedFeature.available && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Usage Statistics
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900">{Math.floor(Math.random() * 40) + 60}%</div>
                      <div className="text-xs text-blue-600 mt-1">Adoption Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900">{Math.floor(Math.random() * 500) + 500}</div>
                      <div className="text-xs text-blue-600 mt-1">Daily Uses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900">4.{Math.floor(Math.random() * 3) + 6}</div>
                      <div className="text-xs text-blue-600 mt-1">User Rating</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Requirements */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Requirements & Permissions
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  {['1', '2', '9'].includes(selectedFeature.id) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <span>Location access required</span>
                    </div>
                  )}
                  {['5', '13'].includes(selectedFeature.id) && (
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-purple-600" />
                      <span>Camera access required</span>
                    </div>
                  )}
                  {['7'].includes(selectedFeature.id) && (
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-purple-600" />
                      <span>Works offline, syncs when online</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-purple-600" />
                    <span>iOS 13.0+ or Android 8.0+</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-3 py-2 bg-gray-50 border-t flex items-center justify-end gap-3">
              {selectedFeature.available ? (
                <button
                  onClick={() => {
                    setShowFeatureModal(false);
                    setShowQRCode(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Download App
                </button>
              ) : (
                <button
                  onClick={() => {
                    showToast(`${selectedFeature.name} is coming soon!`, 'info');
                    setShowFeatureModal(false);
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Notify Me
                </button>
              )}
              <button
                onClick={() => setShowFeatureModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 px-3 py-2 border-b border-green-200 sticky top-0 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-bold text-gray-900">User Analytics Dashboard</h2>
                  </div>
                  <p className="text-sm text-gray-600">Active user engagement and performance metrics</p>
                </div>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-blue-700">Daily Active Users</div>
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-900">128</div>
                  <div className="text-xs text-blue-600 mt-1">+12% from last week</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border-2 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-green-700">Avg Session Time</div>
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-900">4.2h</div>
                  <div className="text-xs text-green-600 mt-1">Per technician/day</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-purple-700">Jobs Completed</div>
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-purple-900">2,847</div>
                  <div className="text-xs text-purple-600 mt-1">This month</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 border-2 border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-orange-700">App Rating</div>
                    <Star className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold text-orange-900">{appStats.avgRating}</div>
                  <div className="text-xs text-orange-600 mt-1">Based on {appStats.totalReviews} reviews</div>
                </div>
              </div>

              {/* Usage Trends */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Usage Trends (Last 7 Days)
                </h3>
                <div className="space-y-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                    const value = Math.floor(Math.random() * 30) + 70;
                    return (
                      <div key={day}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-blue-700 font-medium">{day}</span>
                          <span className="font-semibold text-blue-900">{value} users</span>
                        </div>
                        <div className="w-full bg-blue-100 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Feature Adoption */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Feature Adoption Rate
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'Job Management', rate: 95 },
                    { name: 'GPS Navigation', rate: 88 },
                    { name: 'Time Tracking', rate: 92 },
                    { name: 'Photo Documentation', rate: 76 },
                    { name: 'Digital Signature', rate: 84 }
                  ].map((feature) => (
                    <div key={feature.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-purple-700 font-medium">{feature.name}</span>
                        <span className="font-semibold text-purple-900">{feature.rate}%</span>
                      </div>
                      <div className="w-full bg-purple-100 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ width: `${feature.rate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-green-700 font-medium mb-2">Avg Jobs/Technician</div>
                    <div className="text-3xl font-bold text-green-900 mb-1">6.8</div>
                    <div className="text-xs text-green-600">Per day</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-green-700 font-medium mb-2">First-Time Fix Rate</div>
                    <div className="text-3xl font-bold text-green-900 mb-1">87%</div>
                    <div className="text-xs text-green-600">Industry avg: 75%</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-green-700 font-medium mb-2">Response Time</div>
                    <div className="text-3xl font-bold text-green-900 mb-1">2.4h</div>
                    <div className="text-xs text-green-600">Average</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-green-700 font-medium mb-2">Customer Satisfaction</div>
                    <div className="text-3xl font-bold text-green-900 mb-1">4.6</div>
                    <div className="text-xs text-green-600">Out of 5.0</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-3 py-2 bg-gray-50 border-t flex items-center justify-end gap-3">
              <button
                onClick={() => { exportToCsv('mobile-app-features', filteredFeatures); showToast('Exporting analytics data...', 'success'); }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Export Report
              </button>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      {showReviewsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 px-3 py-2 border-b border-yellow-200 sticky top-0 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
                    <h2 className="text-xl font-bold text-gray-900">User Reviews & Ratings</h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Average Rating:</span>
                    <span className="text-2xl font-bold text-yellow-600 flex items-center gap-1">
                      {appStats.avgRating}
                      <Star className="h-5 w-5 fill-yellow-600 text-yellow-600" />
                    </span>
                    <span className="text-gray-600">({appStats.totalReviews} reviews)</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowReviewsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Rating Distribution */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-5 border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Rating Distribution
                </h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const percentage = rating === 5 ? 65 : rating === 4 ? 25 : rating === 3 ? 7 : rating === 2 ? 2 : 1;
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16">
                          <span className="text-sm font-medium text-gray-700">{rating}</span>
                          <Star className="h-4 w-4 fill-yellow-600 text-yellow-600" />
                        </div>
                        <div className="flex-1 bg-yellow-100 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-12 text-right">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Reviews */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Recent Reviews
                </h3>
                <div className="space-y-2">
                  {[
                    {
                      name: 'Rajesh Kumar',
                      rating: 5,
                      date: '2 days ago',
                      review: 'Excellent app! Makes my daily work so much easier. GPS navigation and job management features are top-notch. Highly recommended for field technicians.',
                      helpful: 24
                    },
                    {
                      name: 'Priya Sharma',
                      rating: 5,
                      date: '5 days ago',
                      review: 'Love the offline mode! I can work in areas with poor connectivity and everything syncs automatically when I\'m back online. Time tracking is very accurate too.',
                      helpful: 18
                    },
                    {
                      name: 'Amit Patel',
                      rating: 4,
                      date: '1 week ago',
                      review: 'Great app overall. The photo documentation and digital signature features save a lot of time. Would love to see AR assistance feature soon!',
                      helpful: 15
                    },
                    {
                      name: 'Sneha Reddy',
                      rating: 5,
                      date: '1 week ago',
                      review: 'Very user-friendly interface. Customer chat feature is particularly useful for quick clarifications. Battery optimization is impressive!',
                      helpful: 12
                    },
                    {
                      name: 'Vikram Singh',
                      rating: 4,
                      date: '2 weeks ago',
                      review: 'Good app with useful features. The knowledge base helps a lot during complex repairs. Performance has improved significantly in recent updates.',
                      helpful: 9
                    }
                  ].map((review, index) => (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-gray-900">{review.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-600 text-yellow-600'
                                      : 'fill-gray-200 text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{review.review}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <button className="flex items-center gap-1 hover:text-green-600 transition-colors">
                          <CheckCircle className="h-3 w-3" />
                          <span>Helpful ({review.helpful})</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-3 py-2 bg-gray-50 border-t flex items-center justify-end gap-3">
              <button
                onClick={() => showToast('Opening review submission form...', 'info')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Write a Review
              </button>
              <button
                onClick={() => setShowReviewsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Instructions Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-teal-50 px-3 py-2 border-b border-blue-200 sticky top-0 z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Download className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">Download Instructions</h2>
                  </div>
                  <p className="text-sm text-gray-600">Complete download history and installation guide</p>
                </div>
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Download Stats */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Download Statistics
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-sm text-blue-600 font-medium mb-1">Total Downloads</div>
                    <div className="text-3xl font-bold text-blue-900">{appStats.totalDownloads}</div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-600 font-medium mb-1">iOS Downloads</div>
                    <div className="text-3xl font-bold text-blue-900">{Math.floor(appStats.totalDownloads * 0.58)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-600 font-medium mb-1">Android Downloads</div>
                    <div className="text-3xl font-bold text-blue-900">{Math.floor(appStats.totalDownloads * 0.42)}</div>
                  </div>
                </div>
              </div>

              {/* iOS Installation */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  iOS Installation Steps
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-700 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Open App Store</p>
                      <p className="text-xs text-gray-600">Search for "Technician Mobile App" or scan QR code</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-700 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Tap "Get" or "Download"</p>
                      <p className="text-xs text-gray-600">You may need to authenticate with Face ID, Touch ID, or password</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-700 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Wait for installation</p>
                      <p className="text-xs text-gray-600">The app will automatically install (requires ~250 MB)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-700 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm">
                      4
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Launch and log in</p>
                      <p className="text-xs text-gray-600">Use your company credentials to access the app</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Android Installation */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Android Installation Steps
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Open Google Play Store</p>
                      <p className="text-xs text-gray-600">Search for "Technician Mobile App" or scan QR code</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Tap "Install"</p>
                      <p className="text-xs text-gray-600">Review and accept the required permissions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Wait for download</p>
                      <p className="text-xs text-gray-600">Installation starts automatically after download completes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 text-green-700 font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm">
                      4
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Open and log in</p>
                      <p className="text-xs text-gray-600">Use your company credentials to access the app</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Troubleshooting */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-5 border border-orange-200">
                <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Troubleshooting Tips
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Ensure you have stable internet connection for download</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Check that you have at least 500 MB free storage space</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Update your OS to the latest version for best compatibility</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Contact IT support if you face any installation issues</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-3 py-2 bg-gray-50 border-t flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDownloadModal(false);
                  setShowQRCode(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Show QR Code
              </button>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
