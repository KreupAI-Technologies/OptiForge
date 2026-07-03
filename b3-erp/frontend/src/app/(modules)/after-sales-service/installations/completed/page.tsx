'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Star,
  Trophy,
  FileText,
  Clock,
  Users,
  Package,
  Award,
  TrendingUp,
  CheckSquare,
  Wrench,
  ThumbsUp,
  AlertCircle,
  ExternalLink,
  Truck,
  Building,
  Timer,
  CalendarDays
} from 'lucide-react';
import { exportToCsv } from '@/lib/export';

interface CompletedInstallation {
  id: string;
  installationNumber: string;
  customer: {
    name: string;
    company: string;
    phone: string;
    email: string;
    address: string;
    contactPerson: string;
    alternatePhone?: string;
  };
  product: {
    name: string;
    model: string;
    serialNumber: string;
    category: string;
    warrantyType: 'Standard' | 'Extended' | 'Premium';
    value: number;
  };
  installation: {
    type: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    complexity: 'Simple' | 'Moderate' | 'Complex' | 'Highly Complex';
    plannedDuration: string;
    actualDuration: string;
    requirements: string[];
    specialInstructions?: string;
  };
  completion: {
    completedDate: string;
    completedTime: string;
    completedBy: {
      name: string;
      id: string;
      role: string;
    };
    qualityScore: number; // 1-5 stars
    onTimeCompletion: boolean;
    customerSatisfaction: number; // 1-5 stars
    testingResults: 'Passed' | 'Passed with Notes' | 'Failed';
    documentation: {
      installationReport: boolean;
      customerTraining: boolean;
      warrantyDocuments: boolean;
      maintenanceGuide: boolean;
      photos: number;
    };
  };
  location: {
    siteType: string;
    accessRequirements: string;
    parkingAvailable: boolean;
    elevatorAccess: boolean;
    specialAccess: string;
  };
  team: {
    lead: {
      name: string;
      id: string;
      phone: string;
      expertise: string[];
    };
    members: Array<{
      name: string;
      id: string;
      role: string;
    }>;
    totalMembers: number;
  };
  customerFeedback?: {
    rating: number;
    comments: string;
    wouldRecommend: boolean;
  };
  followUp: {
    warrantyStartDate: string;
    nextMaintenanceDate: string;
    supportContactAssigned: string;
  };
  attachments: number;
  notes: string;
  issues?: string[];
  resolutions?: string[];
}

const CompletedInstallationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterTechnician, setFilterTechnician] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [filterComplexity, setFilterComplexity] = useState('');
  const [selectedInstallation, setSelectedInstallation] = useState<CompletedInstallation | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleStatsCardClick = (type: string) => {
    switch (type) {
      case 'total':
        setFilterRating('');
        setFilterComplexity('');
        setToast({ message: `Showing all ${stats.totalCompleted} completed installations`, type: 'info' });
        break;
      case 'satisfaction':
        setToast({ message: `Average customer satisfaction: ${stats.avgSatisfaction}/5`, type: 'info' });
        break;
      case 'ontime':
        setToast({ message: `${stats.onTimeRate}% of installations completed on time`, type: 'success' });
        break;
      case 'quality':
        setToast({ message: `Average quality score: ${stats.avgQualityScore}/5`, type: 'info' });
        break;
    }
  };

  const completedInstallations: CompletedInstallation[] = [
    {
      id: '1',
      installationNumber: 'INST-2024-0001',
      customer: {
        name: 'Marcus Johnson',
        company: 'TechFlow Industries',
        phone: '+1-555-0101',
        email: 'marcus.johnson@techflow.com',
        address: '101 Innovation Drive, Tech Valley, CA 95014',
        contactPerson: 'Marcus Johnson',
        alternatePhone: '+1-555-0102'
      },
      product: {
        name: 'Industrial Automation System',
        model: 'IAS-5000X',
        serialNumber: 'IAS-5000X-2024-001',
        category: 'Automation',
        warrantyType: 'Premium',
        value: 125000
      },
      installation: {
        type: 'New Installation',
        priority: 'High',
        complexity: 'Highly Complex',
        plannedDuration: '3 days',
        actualDuration: '2.5 days',
        requirements: [
          'Clean room environment',
          'Compressed air supply',
          'Dedicated electrical circuit',
          'Network connectivity',
          'Safety lockout procedures'
        ],
        specialInstructions: 'Installation completed during weekend shutdown as planned'
      },
      completion: {
        completedDate: '2024-10-15',
        completedTime: '16:30',
        completedBy: {
          name: 'Sarah Wilson',
          id: 'TECH-001',
          role: 'Senior Installation Engineer'
        },
        qualityScore: 5,
        onTimeCompletion: true,
        customerSatisfaction: 5,
        testingResults: 'Passed',
        documentation: {
          installationReport: true,
          customerTraining: true,
          warrantyDocuments: true,
          maintenanceGuide: true,
          photos: 24
        }
      },
      location: {
        siteType: 'Manufacturing Facility',
        accessRequirements: 'Security clearance required',
        parkingAvailable: true,
        elevatorAccess: true,
        specialAccess: 'Safety equipment mandatory'
      },
      team: {
        lead: {
          name: 'Sarah Wilson',
          id: 'TECH-001',
          phone: '+1-555-0201',
          expertise: ['Automation Systems', 'Network Integration', 'Safety Protocols']
        },
        members: [
          { name: 'Mike Chen', id: 'TECH-002', role: 'Electrical Specialist' },
          { name: 'David Rodriguez', id: 'TECH-003', role: 'Network Engineer' }
        ],
        totalMembers: 3
      },
      customerFeedback: {
        rating: 5,
        comments: 'Exceptional service! The team was professional, efficient, and completed the installation ahead of schedule. The system is running perfectly.',
        wouldRecommend: true
      },
      followUp: {
        warrantyStartDate: '2024-10-15',
        nextMaintenanceDate: '2024-11-15',
        supportContactAssigned: 'Sarah Wilson'
      },
      attachments: 8,
      notes: 'Outstanding performance by the team. Customer extremely satisfied. No issues encountered.',
      issues: [],
      resolutions: []
    },
    {
      id: '2',
      installationNumber: 'INST-2024-0002',
      customer: {
        name: 'Jennifer Lee',
        company: 'Urban Kitchen Solutions',
        phone: '+1-555-0103',
        email: 'jennifer.lee@urbankitchen.com',
        address: '456 Culinary Plaza, Downtown, NY 10001',
        contactPerson: 'Jennifer Lee',
        alternatePhone: '+1-555-0104'
      },
      product: {
        name: 'Commercial Kitchen Package',
        model: 'CKP-2000',
        serialNumber: 'CKP-2000-2024-002',
        category: 'Kitchen Equipment',
        warrantyType: 'Standard',
        value: 45000
      },
      installation: {
        type: 'Equipment Upgrade',
        priority: 'Medium',
        complexity: 'Complex',
        plannedDuration: '2 days',
        actualDuration: '2.5 days',
        requirements: [
          'Gas line modifications',
          'Electrical upgrades',
          'Ventilation system integration',
          'Water line connections'
        ],
        specialInstructions: 'Work around business hours to minimize disruption'
      },
      completion: {
        completedDate: '2024-10-18',
        completedTime: '18:45',
        completedBy: {
          name: 'Robert Kim',
          id: 'TECH-004',
          role: 'Kitchen Installation Specialist'
        },
        qualityScore: 4,
        onTimeCompletion: false,
        customerSatisfaction: 4,
        testingResults: 'Passed with Notes',
        documentation: {
          installationReport: true,
          customerTraining: true,
          warrantyDocuments: true,
          maintenanceGuide: true,
          photos: 18
        }
      },
      location: {
        siteType: 'Restaurant Kitchen',
        accessRequirements: 'Business hours coordination',
        parkingAvailable: false,
        elevatorAccess: false,
        specialAccess: 'Loading dock access only'
      },
      team: {
        lead: {
          name: 'Robert Kim',
          id: 'TECH-004',
          phone: '+1-555-0204',
          expertise: ['Kitchen Equipment', 'Gas Systems', 'Ventilation']
        },
        members: [
          { name: 'Lisa Thompson', id: 'TECH-005', role: 'Electrical Technician' },
          { name: 'Carlos Martinez', id: 'TECH-006', role: 'Plumbing Specialist' }
        ],
        totalMembers: 3
      },
      customerFeedback: {
        rating: 4,
        comments: 'Very good work overall. Installation took a bit longer than expected but the final result exceeded our expectations. Team was very professional.',
        wouldRecommend: true
      },
      followUp: {
        warrantyStartDate: '2024-10-18',
        nextMaintenanceDate: '2024-01-18',
        supportContactAssigned: 'Robert Kim'
      },
      attachments: 6,
      notes: 'Minor delays due to unexpected gas line complications. Customer satisfied with final outcome.',
      issues: ['Gas line positioning required adjustment', 'Ventilation duct clearance issue'],
      resolutions: ['Gas line rerouted with customer approval', 'Duct modified to meet clearance requirements']
    },
    {
      id: '3',
      installationNumber: 'INST-2024-0003',
      customer: {
        name: 'Ahmed Hassan',
        company: 'Hassan Manufacturing',
        phone: '+1-555-0105',
        email: 'ahmed.hassan@hassanmfg.com',
        address: '789 Industrial Blvd, Manufacturing District, TX 75201',
        contactPerson: 'Ahmed Hassan',
        alternatePhone: '+1-555-0106'
      },
      product: {
        name: 'Precision Machinery Set',
        model: 'PMS-3000',
        serialNumber: 'PMS-3000-2024-003',
        category: 'Manufacturing',
        warrantyType: 'Extended',
        value: 180000
      },
      installation: {
        type: 'New Installation',
        priority: 'Critical',
        complexity: 'Highly Complex',
        plannedDuration: '5 days',
        actualDuration: '4 days',
        requirements: [
          'Foundation preparation',
          'Precision alignment',
          'Calibration equipment',
          'Environmental controls',
          'Safety systems integration'
        ]
      },
      completion: {
        completedDate: '2024-10-12',
        completedTime: '14:20',
        completedBy: {
          name: 'Maria Gonzalez',
          id: 'TECH-007',
          role: 'Principal Engineering Specialist'
        },
        qualityScore: 5,
        onTimeCompletion: true,
        customerSatisfaction: 5,
        testingResults: 'Passed',
        documentation: {
          installationReport: true,
          customerTraining: true,
          warrantyDocuments: true,
          maintenanceGuide: true,
          photos: 31
        }
      },
      location: {
        siteType: 'Manufacturing Floor',
        accessRequirements: 'Safety certification required',
        parkingAvailable: true,
        elevatorAccess: true,
        specialAccess: 'Crane access available'
      },
      team: {
        lead: {
          name: 'Maria Gonzalez',
          id: 'TECH-007',
          phone: '+1-555-0207',
          expertise: ['Precision Machinery', 'Calibration', 'Quality Systems']
        },
        members: [
          { name: 'James Wilson', id: 'TECH-008', role: 'Mechanical Engineer' },
          { name: 'Anna Peterson', id: 'TECH-009', role: 'Calibration Specialist' },
          { name: 'Tony Singh', id: 'TECH-010', role: 'Safety Systems Expert' }
        ],
        totalMembers: 4
      },
      customerFeedback: {
        rating: 5,
        comments: 'Absolutely outstanding! The team exceeded all expectations. Installation was completed ahead of schedule and the machinery is performing beyond specifications.',
        wouldRecommend: true
      },
      followUp: {
        warrantyStartDate: '2024-10-12',
        nextMaintenanceDate: '2024-11-12',
        supportContactAssigned: 'Maria Gonzalez'
      },
      attachments: 12,
      notes: 'Exemplary installation. Team performance exceptional. Customer delighted with early completion and superior quality.',
      issues: [],
      resolutions: []
    }
  ];

  const filteredInstallations = completedInstallations.filter(installation => {
    const matchesSearch = installation.installationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         installation.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         installation.customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         installation.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPeriod = !filterPeriod || true; // Add date filtering logic if needed
    const matchesTechnician = !filterTechnician || installation.completion.completedBy.name.includes(filterTechnician);
    const matchesRating = !filterRating || installation.completion.customerSatisfaction.toString() === filterRating;
    const matchesComplexity = !filterComplexity || installation.installation.complexity === filterComplexity;
    
    return matchesSearch && matchesPeriod && matchesTechnician && matchesRating && matchesComplexity;
  });

  const stats = {
    totalCompleted: completedInstallations.length,
    avgSatisfaction: (completedInstallations.reduce((sum, inst) => sum + inst.completion.customerSatisfaction, 0) / completedInstallations.length).toFixed(1),
    onTimeRate: ((completedInstallations.filter(inst => inst.completion.onTimeCompletion).length / completedInstallations.length) * 100).toFixed(0),
    avgQualityScore: (completedInstallations.reduce((sum, inst) => sum + inst.completion.qualityScore, 0) / completedInstallations.length).toFixed(1)
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Highly Complex': return 'bg-purple-100 text-purple-700';
      case 'Complex': return 'bg-red-100 text-red-700';
      case 'Moderate': return 'bg-yellow-100 text-yellow-700';
      case 'Simple': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
            Completed Installations
          </h1>
          <p className="text-sm text-gray-500 mt-1">Installation jobs completed successfully</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {viewMode === 'list' ? 'Grid View' : 'List View'}
          </button>
          <button onClick={() => exportToCsv('completed-installations', filteredInstallations)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalCompleted}</p>
            </div>
            <Trophy className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Satisfaction</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-yellow-600">{stats.avgSatisfaction}</p>
                <div className="flex">
                  {renderStars(Math.round(parseFloat(stats.avgSatisfaction)))}
                </div>
              </div>
            </div>
            <ThumbsUp className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On-Time Rate</p>
              <p className="text-2xl font-bold text-blue-600">{stats.onTimeRate}%</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Quality Score</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-purple-600">{stats.avgQualityScore}</p>
                <div className="flex">
                  {renderStars(Math.round(parseFloat(stats.avgQualityScore)))}
                </div>
              </div>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by installation number, customer, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pt-4 border-t border-gray-200">
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Periods</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>

            <select
              value={filterTechnician}
              onChange={(e) => setFilterTechnician(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Technicians</option>
              <option value="Sarah Wilson">Sarah Wilson</option>
              <option value="Robert Kim">Robert Kim</option>
              <option value="Maria Gonzalez">Maria Gonzalez</option>
            </select>

            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              value={filterComplexity}
              onChange={(e) => setFilterComplexity(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Complexity</option>
              <option value="Simple">Simple</option>
              <option value="Moderate">Moderate</option>
              <option value="Complex">Complex</option>
              <option value="Highly Complex">Highly Complex</option>
            </select>
          </div>
        )}
      </div>

      {/* Installations List/Grid */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-3 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Completed Installations ({filteredInstallations.length})
          </h2>
        </div>

        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installation</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInstallations.map((installation) => (
                  <tr key={installation.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{installation.installationNumber}</span>
                          {installation.completion.onTimeCompletion && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(installation.installation.priority)}`}>
                            {installation.installation.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getComplexityColor(installation.installation.complexity)}`}>
                            {installation.installation.complexity}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{installation.customer.name}</div>
                        <div className="text-sm text-gray-500">{installation.customer.company}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Phone className="h-3 w-3" />
                          {installation.customer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{installation.product.name}</div>
                        <div className="text-sm text-gray-500">{installation.product.model}</div>
                        <div className="text-xs text-gray-500 mt-1">${installation.product.value.toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <Calendar className="h-3 w-3" />
                          {installation.completion.completedDate}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <Clock className="h-3 w-3" />
                          {installation.completion.completedTime}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Duration: {installation.installation.actualDuration}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div>
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <User className="h-3 w-3" />
                          {installation.completion.completedBy.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{installation.completion.completedBy.role}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Users className="h-3 w-3" />
                          {installation.team.totalMembers} members
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">Quality:</span>
                          <div className="flex">
                            {renderStars(installation.completion.qualityScore)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500">Customer:</span>
                          <div className="flex">
                            {renderStars(installation.completion.customerSatisfaction)}
                          </div>
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          {installation.completion.testingResults}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedInstallation(installation)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                         
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md"
                         
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-md"
                         
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
            {filteredInstallations.map((installation) => (
              <div key={installation.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{installation.installationNumber}</h3>
                    <p className="text-sm text-gray-500">{installation.customer.company}</p>
                  </div>
                  {installation.completion.onTimeCompletion && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                </div>

                <div className="space-y-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{installation.product.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{installation.completion.completedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{installation.completion.completedBy.name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex">
                    {renderStars(installation.completion.customerSatisfaction)}
                  </div>
                  <span className="text-sm font-medium text-green-600">{installation.completion.testingResults}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedInstallation(installation)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    View Details
                  </button>
                  <button
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                   
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Installation Details Modal */}
      {selectedInstallation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Installation Details</h2>
              <button
                onClick={() => setSelectedInstallation(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ExternalLink className="h-5 w-5 transform rotate-45" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Installation Information</h3>
                  <div className="space-y-2">
                    <div><strong>Number:</strong> {selectedInstallation.installationNumber}</div>
                    <div><strong>Type:</strong> {selectedInstallation.installation.type}</div>
                    <div className="flex items-center gap-2">
                      <strong>Priority:</strong>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(selectedInstallation.installation.priority)}`}>
                        {selectedInstallation.installation.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <strong>Complexity:</strong>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getComplexityColor(selectedInstallation.installation.complexity)}`}>
                        {selectedInstallation.installation.complexity}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Completion Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <strong>Completed:</strong>
                      <span>{selectedInstallation.completion.completedDate} at {selectedInstallation.completion.completedTime}</span>
                      {selectedInstallation.completion.onTimeCompletion && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div><strong>Duration:</strong> {selectedInstallation.installation.actualDuration} (Planned: {selectedInstallation.installation.plannedDuration})</div>
                    <div><strong>Completed By:</strong> {selectedInstallation.completion.completedBy.name}</div>
                    <div><strong>Testing:</strong> <span className="text-green-600 font-medium">{selectedInstallation.completion.testingResults}</span></div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <div><strong>Name:</strong> {selectedInstallation.customer.name}</div>
                    <div><strong>Company:</strong> {selectedInstallation.customer.company}</div>
                    <div><strong>Phone:</strong> {selectedInstallation.customer.phone}</div>
                    <div><strong>Email:</strong> {selectedInstallation.customer.email}</div>
                  </div>
                  <div>
                    <div><strong>Address:</strong> {selectedInstallation.customer.address}</div>
                    <div><strong>Contact Person:</strong> {selectedInstallation.customer.contactPerson}</div>
                    {selectedInstallation.customer.alternatePhone && (
                      <div><strong>Alt. Phone:</strong> {selectedInstallation.customer.alternatePhone}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Product Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <div><strong>Product:</strong> {selectedInstallation.product.name}</div>
                    <div><strong>Model:</strong> {selectedInstallation.product.model}</div>
                    <div><strong>Serial Number:</strong> {selectedInstallation.product.serialNumber}</div>
                  </div>
                  <div>
                    <div><strong>Category:</strong> {selectedInstallation.product.category}</div>
                    <div><strong>Warranty:</strong> {selectedInstallation.product.warrantyType}</div>
                    <div><strong>Value:</strong> ${selectedInstallation.product.value.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Ratings and Quality */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Quality Assessment</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Quality Score:</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {renderStars(selectedInstallation.completion.qualityScore)}
                        </div>
                        <span className="text-sm font-medium">{selectedInstallation.completion.qualityScore}/5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Customer Satisfaction:</span>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {renderStars(selectedInstallation.completion.customerSatisfaction)}
                        </div>
                        <span className="text-sm font-medium">{selectedInstallation.completion.customerSatisfaction}/5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>On-Time Completion:</span>
                      <span className={`text-sm font-medium ${selectedInstallation.completion.onTimeCompletion ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedInstallation.completion.onTimeCompletion ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Documentation</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedInstallation.completion.documentation).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        {typeof value === 'boolean' ? (
                          <>
                            {value ? (
                              <CheckSquare className="h-4 w-4 text-green-600" />
                            ) : (
                              <div className="h-4 w-4 border border-gray-300 rounded"></div>
                            )}
                            <span className={`text-sm ${value ? 'text-green-600' : 'text-gray-600'}`}>
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckSquare className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">
                              Photos: {value} images
                            </span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Team Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Installation Team</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Team Lead</h4>
                    <div className="space-y-1">
                      <div><strong>Name:</strong> {selectedInstallation.team.lead.name}</div>
                      <div><strong>ID:</strong> {selectedInstallation.team.lead.id}</div>
                      <div><strong>Phone:</strong> {selectedInstallation.team.lead.phone}</div>
                      <div><strong>Expertise:</strong> {selectedInstallation.team.lead.expertise.join(', ')}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Team Members ({selectedInstallation.team.totalMembers})</h4>
                    <div className="space-y-2">
                      {selectedInstallation.team.members.map((member, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{member.name}</span>
                          <span className="text-gray-500">{member.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Feedback */}
              {selectedInstallation.customerFeedback && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Feedback</h3>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex">
                        {renderStars(selectedInstallation.customerFeedback.rating)}
                      </div>
                      <span className={`text-sm font-medium ${selectedInstallation.customerFeedback.wouldRecommend ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedInstallation.customerFeedback.wouldRecommend ? 'Would Recommend' : 'Would Not Recommend'}
                      </span>
                    </div>
                    <p className="text-gray-700 italic">"{selectedInstallation.customerFeedback.comments}"</p>
                  </div>
                </div>
              )}

              {/* Issues and Resolutions */}
              {selectedInstallation.issues && selectedInstallation.issues.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Issues & Resolutions</h3>
                  <div className="space-y-3">
                    {selectedInstallation.issues.map((issue, index) => (
                      <div key={index} className="bg-yellow-50 p-3 rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <span className="text-sm font-medium text-yellow-800">Issue:</span>
                        </div>
                        <p className="text-sm text-yellow-700 mb-2">{issue}</p>
                        {selectedInstallation.resolutions && selectedInstallation.resolutions[index] && (
                          <>
                            <div className="flex items-start gap-2 mb-1">
                              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                              <span className="text-sm font-medium text-green-800">Resolution:</span>
                            </div>
                            <p className="text-sm text-green-700">{selectedInstallation.resolutions[index]}</p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Follow-up & Warranty</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <strong>Warranty Start:</strong>
                    <div className="text-sm text-gray-600">{selectedInstallation.followUp.warrantyStartDate}</div>
                  </div>
                  <div>
                    <strong>Next Maintenance:</strong>
                    <div className="text-sm text-gray-600">{selectedInstallation.followUp.nextMaintenanceDate}</div>
                  </div>
                  <div>
                    <strong>Support Contact:</strong>
                    <div className="text-sm text-gray-600">{selectedInstallation.followUp.supportContactAssigned}</div>
                  </div>
                </div>
              </div>

              {selectedInstallation.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-700">{selectedInstallation.notes}</p>
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

export default CompletedInstallationsPage;