'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Navigation, Clock, Phone, User, CheckCircle, AlertTriangle, Battery, Wifi, RefreshCw, Search, Filter, Calendar, Truck, Wrench, Home, Building2, Zap, TrendingUp, X, Eye, BarChart3, Mail } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';

interface TechnicianLocation {
  id: string;
  technicianId: string;
  technicianName: string;
  phone: string;
  email: string;
  currentStatus: 'available' | 'on_job' | 'in_transit' | 'on_break' | 'offline';
  currentJob?: string;
  currentCustomer?: string;
  latitude: number;
  longitude: number;
  location: string;
  lastUpdated: string;
  batteryLevel: number;
  networkStatus: 'online' | 'offline' | 'poor';
  todayJobs: number;
  completedJobs: number;
  pendingJobs: number;
  totalDistance: number; // in km
  workingHours: number;
  nextJobLocation?: string;
  nextJobTime?: string;
  vehicleNumber?: string;
  skillSet: string[];
  rating: number;
  responseTime: number; // in minutes
}

const VALID_STATUSES = ['available', 'on_job', 'in_transit', 'on_break', 'offline'];

function mapJobToTechnician(job: any, index: number): TechnicianLocation {
  const engineer = job?.engineer || job?.assignedEngineer || job?.technician || {};
  const engineerName =
    engineer?.name ||
    job?.engineerName ||
    job?.technicianName ||
    job?.assignedTo ||
    'Unassigned';
  const engineerId =
    engineer?.id ||
    job?.engineerId ||
    job?.technicianId ||
    `TECH${String(index + 1).padStart(3, '0')}`;
  const rawStatus = String(job?.technicianStatus || engineer?.status || job?.status || 'available')
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  const currentStatus = (VALID_STATUSES.includes(rawStatus)
    ? rawStatus
    : 'on_job') as TechnicianLocation['currentStatus'];
  const network = String(job?.networkStatus || engineer?.networkStatus || 'online').toLowerCase();
  const skills =
    (Array.isArray(engineer?.skillSet) && engineer.skillSet) ||
    (Array.isArray(engineer?.skills) && engineer.skills) ||
    (Array.isArray(job?.skillSet) && job.skillSet) ||
    [];
  const location =
    job?.location ||
    job?.currentLocation ||
    job?.customer?.address ||
    job?.address ||
    '';
  return {
    id: String(job?.id ?? job?._id ?? engineerId ?? index),
    technicianId: String(engineerId),
    technicianName: String(engineerName),
    phone: engineer?.phone || job?.phone || '',
    email: engineer?.email || job?.email || '',
    currentStatus,
    currentJob: job?.jobNumber || job?.number || job?.id || undefined,
    currentCustomer: job?.customer?.name || job?.customerName || undefined,
    latitude: Number(job?.latitude ?? engineer?.latitude ?? job?.lat ?? 0) || 0,
    longitude: Number(job?.longitude ?? engineer?.longitude ?? job?.lng ?? 0) || 0,
    location: String(location),
    lastUpdated: job?.lastUpdated || job?.updatedAt || job?.updated_at || new Date().toISOString(),
    batteryLevel: Number(engineer?.batteryLevel ?? job?.batteryLevel ?? 100) || 0,
    networkStatus: (['online', 'offline', 'poor'].includes(network)
      ? network
      : 'online') as TechnicianLocation['networkStatus'],
    todayJobs: Number(engineer?.todayJobs ?? job?.todayJobs ?? 0) || 0,
    completedJobs: Number(engineer?.completedJobs ?? job?.completedJobs ?? 0) || 0,
    pendingJobs: Number(engineer?.pendingJobs ?? job?.pendingJobs ?? 0) || 0,
    totalDistance: Number(engineer?.totalDistance ?? job?.totalDistance ?? 0) || 0,
    workingHours: Number(engineer?.workingHours ?? job?.workingHours ?? 0) || 0,
    nextJobLocation: job?.nextJobLocation || undefined,
    nextJobTime: job?.nextJobTime || undefined,
    vehicleNumber: engineer?.vehicleNumber || job?.vehicleNumber || undefined,
    skillSet: (skills as any[]).map((s) => String(s)),
    rating: Number(engineer?.rating ?? job?.rating ?? 0) || 0,
    responseTime: Number(engineer?.responseTime ?? job?.responseTime ?? 0) || 0,
  };
}

const _unusedMockTechnicians: TechnicianLocation[] = [
  {
    id: '1',
    technicianId: 'TECH001',
    technicianName: 'Suresh Patel',
    phone: '+91-98765-43210',
    email: 'suresh.patel@company.com',
    currentStatus: 'on_job',
    currentJob: 'SR-2025-145',
    currentCustomer: 'Sharma Modular Kitchens Pvt Ltd',
    latitude: 19.0760,
    longitude: 72.8777,
    location: 'Andheri West, Mumbai',
    lastUpdated: '2025-10-23T14:25:00',
    batteryLevel: 78,
    networkStatus: 'online',
    todayJobs: 5,
    completedJobs: 3,
    pendingJobs: 2,
    totalDistance: 32.5,
    workingHours: 6.5,
    nextJobLocation: 'Bandra East',
    nextJobTime: '15:30',
    vehicleNumber: 'MH-02-AB-1234',
    skillSet: ['Plumbing', 'Installation', 'Repair'],
    rating: 4.8,
    responseTime: 15
  },
  {
    id: '2',
    technicianId: 'TECH002',
    technicianName: 'Rajesh Kumar',
    phone: '+91-98765-43211',
    email: 'rajesh.kumar@company.com',
    currentStatus: 'in_transit',
    currentJob: 'SR-2025-148',
    currentCustomer: 'Kitchen World Pvt Ltd',
    latitude: 19.1136,
    longitude: 72.8697,
    location: 'Malad West, Mumbai',
    lastUpdated: '2025-10-23T14:28:00',
    batteryLevel: 92,
    networkStatus: 'online',
    todayJobs: 4,
    completedJobs: 2,
    pendingJobs: 2,
    totalDistance: 28.3,
    workingHours: 5.2,
    nextJobLocation: 'Goregaon West',
    nextJobTime: '15:00',
    vehicleNumber: 'MH-02-CD-5678',
    skillSet: ['Electrical', 'Hardware', 'Installation'],
    rating: 4.6,
    responseTime: 20
  },
  {
    id: '3',
    technicianId: 'TECH003',
    technicianName: 'Vikram Singh',
    phone: '+91-98765-43212',
    email: 'vikram.singh@company.com',
    currentStatus: 'available',
    latitude: 19.2183,
    longitude: 72.9781,
    location: 'Thane West, Mumbai',
    lastUpdated: '2025-10-23T14:30:00',
    batteryLevel: 65,
    networkStatus: 'online',
    todayJobs: 6,
    completedJobs: 4,
    pendingJobs: 2,
    totalDistance: 45.2,
    workingHours: 7.0,
    nextJobLocation: 'Dombivli',
    nextJobTime: '16:00',
    vehicleNumber: 'MH-04-EF-9012',
    skillSet: ['Carpentry', 'Installation', 'Repair'],
    rating: 4.9,
    responseTime: 12
  },
  {
    id: '4',
    technicianId: 'TECH004',
    technicianName: 'Rahul Verma',
    phone: '+91-98765-43213',
    email: 'rahul.verma@company.com',
    currentStatus: 'on_job',
    currentJob: 'SR-2025-142',
    currentCustomer: 'Modern Kitchen Solutions',
    latitude: 19.1197,
    longitude: 72.9081,
    location: 'Powai, Mumbai',
    lastUpdated: '2025-10-23T14:27:00',
    batteryLevel: 45,
    networkStatus: 'online',
    todayJobs: 4,
    completedJobs: 2,
    pendingJobs: 2,
    totalDistance: 38.7,
    workingHours: 6.0,
    nextJobLocation: 'Vikhroli',
    nextJobTime: '16:30',
    vehicleNumber: 'MH-03-GH-3456',
    skillSet: ['Electronics', 'Appliances', 'Troubleshooting'],
    rating: 4.7,
    responseTime: 18
  },
  {
    id: '5',
    technicianId: 'TECH005',
    technicianName: 'Amit Shah',
    phone: '+91-98765-43214',
    email: 'amit.shah@company.com',
    currentStatus: 'on_break',
    latitude: 18.9220,
    longitude: 72.8347,
    location: 'Worli, Mumbai',
    lastUpdated: '2025-10-23T14:15:00',
    batteryLevel: 88,
    networkStatus: 'online',
    todayJobs: 3,
    completedJobs: 3,
    pendingJobs: 0,
    totalDistance: 22.4,
    workingHours: 4.5,
    vehicleNumber: 'MH-01-IJ-7890',
    skillSet: ['General Service', 'Maintenance', 'Installation'],
    rating: 4.5,
    responseTime: 25
  },
  {
    id: '6',
    technicianId: 'TECH006',
    technicianName: 'Anita Reddy',
    phone: '+91-98765-43215',
    email: 'anita.reddy@company.com',
    currentStatus: 'offline',
    latitude: 18.9067,
    longitude: 72.8147,
    location: 'Parel, Mumbai',
    lastUpdated: '2025-10-23T13:45:00',
    batteryLevel: 15,
    networkStatus: 'offline',
    todayJobs: 2,
    completedJobs: 2,
    pendingJobs: 0,
    totalDistance: 18.9,
    workingHours: 3.5,
    vehicleNumber: 'MH-02-KL-2345',
    skillSet: ['Quality Check', 'Installation', 'Customer Service'],
    rating: 4.8,
    responseTime: 15
  },
  {
    id: '7',
    technicianId: 'TECH007',
    technicianName: 'Priya Desai',
    phone: '+91-98765-43216',
    email: 'priya.desai@company.com',
    currentStatus: 'in_transit',
    currentJob: 'SR-2025-151',
    currentCustomer: 'Elite Kitchen Designs',
    latitude: 19.0330,
    longitude: 73.0297,
    location: 'Vashi, Navi Mumbai',
    lastUpdated: '2025-10-23T14:29:00',
    batteryLevel: 72,
    networkStatus: 'online',
    todayJobs: 5,
    completedJobs: 3,
    pendingJobs: 2,
    totalDistance: 55.3,
    workingHours: 6.8,
    nextJobLocation: 'Panvel',
    nextJobTime: '15:45',
    vehicleNumber: 'MH-06-MN-6789',
    skillSet: ['Advanced Repair', 'Electronics', 'Diagnostics'],
    rating: 4.9,
    responseTime: 10
  },
  {
    id: '8',
    technicianId: 'TECH008',
    technicianName: 'Meena Iyer',
    phone: '+91-98765-43217',
    email: 'meena.iyer@company.com',
    currentStatus: 'available',
    latitude: 19.0176,
    longitude: 72.8562,
    location: 'Dadar, Mumbai',
    lastUpdated: '2025-10-23T14:30:00',
    batteryLevel: 95,
    networkStatus: 'online',
    todayJobs: 4,
    completedJobs: 3,
    pendingJobs: 1,
    totalDistance: 26.7,
    workingHours: 5.5,
    nextJobLocation: 'Matunga',
    nextJobTime: '15:15',
    vehicleNumber: 'MH-01-OP-4567',
    skillSet: ['Installation', 'Training', 'Customer Support'],
    rating: 4.7,
    responseTime: 16
  }
];

export default function TechnicianTrackingPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTechnician, setSelectedTechnician] = useState<TechnicianLocation | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedMapTech, setSelectedMapTech] = useState<TechnicianLocation | null>(null);
  const [technicians, setTechnicians] = useState<TechnicianLocation[]>([]);

  // Load technicians (derived from field-service jobs) from API
  useEffect(() => {
    (async () => {
      try {
        const raw = await AfterSalesPagesService.fieldJobs();
        setTechnicians(Array.isArray(raw) ? raw.map(mapJobToTechnician) : []);
      } catch {
        setTechnicians([]);
      }
    })();
  }, []);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Toast notification auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handler functions
  const handleStatsCardClick = (type: string) => {
    switch (type) {
      case 'total':
        setStatusFilter('all');
        setToast({ message: 'Showing all technicians', type: 'info' });
        break;
      case 'active':
        setStatusFilter('all');
        const activeList = technicians.filter(t => t.currentStatus === 'on_job' || t.currentStatus === 'in_transit');
        setToast({ message: `${activeList.length} active technicians found`, type: 'info' });
        break;
      case 'available':
        setStatusFilter('available');
        setToast({ message: `${availableTechnicians} technicians available for assignment`, type: 'success' });
        break;
      case 'jobs':
        setToast({ message: `${totalJobsToday} jobs scheduled for today`, type: 'info' });
        break;
      case 'completed':
        setToast({ message: `${completedJobsToday} jobs completed today`, type: 'success' });
        break;
      case 'response':
        setToast({ message: `Average response time: ${avgResponseTime} minutes`, type: 'info' });
        break;
    }
  };

  const handleMapTechClick = (tech: TechnicianLocation, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMapTech(tech);
    setSelectedTechnician(tech);
  };

  // Filter technicians
  const filteredTechnicians = technicians.filter(tech => {
    const matchesSearch = tech.technicianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.technicianId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tech.currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const totalTechnicians = technicians.length;
  const activeTechnicians = technicians.filter(t => t.currentStatus === 'on_job' || t.currentStatus === 'in_transit').length;
  const availableTechnicians = technicians.filter(t => t.currentStatus === 'available').length;
  const totalJobsToday = technicians.reduce((sum, t) => sum + t.todayJobs, 0);
  const completedJobsToday = technicians.reduce((sum, t) => sum + t.completedJobs, 0);
  const avgResponseTime = totalTechnicians ? Math.round(technicians.reduce((sum, t) => sum + t.responseTime, 0) / totalTechnicians) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'on_job': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'on_break': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'offline': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'on_job': return <Wrench className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'on_break': return <Clock className="h-4 w-4" />;
      case 'offline': return <AlertTriangle className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-600';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTimeSinceUpdate = (lastUpdated: string) => {
    const diff = currentTime.getTime() - new Date(lastUpdated).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {toast.type === 'info' && <AlertTriangle className="w-5 h-5" />}
          {toast.type === 'error' && <X className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Navigation className="h-8 w-8 text-emerald-600" />
            Technician Tracking
          </h1>
          <p className="text-gray-600 mt-1">Real-time GPS tracking and monitoring of field technicians</p>
        </div>
        <button
          onClick={() => setShowAnalyticsModal(true)}
          className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg"
        >
          <BarChart3 className="w-5 h-5" />
          View Analytics
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mb-3">
        <button
          onClick={() => handleStatsCardClick('total')}
          className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-blue-500 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Technicians</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalTechnicians}</p>
              <p className="text-xs text-blue-600 mt-1">Click to view all</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => handleStatsCardClick('active')}
          className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-blue-500 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{activeTechnicians}</p>
              <p className="text-xs text-blue-600 mt-1">On job/in transit</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => handleStatsCardClick('available')}
          className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-green-500 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{availableTechnicians}</p>
              <p className="text-xs text-green-600 mt-1">Click to filter</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => handleStatsCardClick('jobs')}
          className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-purple-500 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jobs Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalJobsToday}</p>
              <p className="text-xs text-purple-600 mt-1">Click for details</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Wrench className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => handleStatsCardClick('completed')}
          className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-emerald-500 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{completedJobsToday}</p>
              <p className="text-xs text-emerald-600 mt-1">Click for summary</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => handleStatsCardClick('response')}
          className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-orange-500 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{avgResponseTime}m</p>
              <p className="text-xs text-orange-600 mt-1">Team average</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="on_job">On Job</option>
              <option value="in_transit">In Transit</option>
              <option value="on_break">On Break</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map Placeholder & Technicians List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Map View */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-3 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Live Map View
                </h3>
                <button className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm flex items-center gap-2 transition-colors">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>
            <div className="relative h-[600px] bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
              {/* Placeholder for actual map integration */}
              <div className="text-center">
                <MapPin className="h-16 w-16 text-emerald-600 mb-2" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Interactive Map View</h3>
                <p className="text-gray-600 mb-2">Integrate with Google Maps, Mapbox, or OpenStreetMap</p>
                <div className="grid grid-cols-3 gap-2 max-w-md">
                  {technicians.slice(0, 6).map((tech) => (
                    <button
                      key={tech.id}
                      onClick={(e) => handleMapTechClick(tech, e)}
                      className="bg-white p-3 rounded-lg border-2 border-gray-200 shadow-sm hover:border-emerald-500 hover:shadow-lg transition-all text-left"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(tech.currentStatus)}
                        <span className="text-xs font-medium text-gray-900">{tech.technicianName.split(' ')[0]}</span>
                        <Eye className="w-3 h-3 text-gray-400 ml-auto" />
                      </div>
                      <div className="text-xs text-gray-600">{tech.location.split(',')[0]}</div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusColor(tech.currentStatus)}`}>
                        {tech.currentStatus.replace('_', ' ').toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technicians List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="bg-gray-50 border-b border-gray-200 p-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" />
                Technicians ({filteredTechnicians.length})
              </h3>
            </div>
            <div className="overflow-y-auto max-h-[600px] divide-y divide-gray-200">
              {filteredTechnicians.map((tech) => (
                <div
                  key={tech.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedTechnician?.id === tech.id ? 'bg-emerald-50 border-l-4 border-emerald-600' : ''
                  }`}
                  onClick={() => setSelectedTechnician(tech)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900">{tech.technicianName}</div>
                      <div className="text-xs text-gray-500">{tech.technicianId}</div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(tech.currentStatus)}`}>
                      {getStatusIcon(tech.currentStatus)}
                      {tech.currentStatus.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{tech.location}</span>
                    </div>

                    {tech.currentJob && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Wrench className="h-3 w-3" />
                        <span className="truncate">{tech.currentJob} - {tech.currentCustomer}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Battery className={`h-3 w-3 ${getBatteryColor(tech.batteryLevel)}`} />
                          <span className={getBatteryColor(tech.batteryLevel)}>{tech.batteryLevel}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Wifi className={`h-3 w-3 ${tech.networkStatus === 'online' ? 'text-green-600' : 'text-red-600'}`} />
                          <span className={tech.networkStatus === 'online' ? 'text-green-600' : 'text-red-600'}>
                            {tech.networkStatus}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="h-3 w-3" />
                        {getTimeSinceUpdate(tech.lastUpdated)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="text-xs">
                        <span className="font-medium text-emerald-600">{tech.completedJobs}</span>
                        <span className="text-gray-500"> / {tech.todayJobs} jobs</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {tech.totalDistance.toFixed(1)} km
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Technician Info Modal */}
      {selectedTechnician && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className={`sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2 flex items-center justify-between`}>
              <div>
                <h2 className="text-xl font-bold text-white">{selectedTechnician.technicianName}</h2>
                <p className="text-sm text-emerald-100">{selectedTechnician.technicianId}</p>
              </div>
              <button
                onClick={() => setSelectedTechnician(null)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Status & Location */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(selectedTechnician.currentStatus)}`}>
                    {getStatusIcon(selectedTechnician.currentStatus)}
                    {selectedTechnician.currentStatus.replace('_', ' ').toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Battery className={`h-5 w-5 ${getBatteryColor(selectedTechnician.batteryLevel)}`} />
                      <span className={`font-medium ${getBatteryColor(selectedTechnician.batteryLevel)}`}>
                        {selectedTechnician.batteryLevel}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wifi className={`h-5 w-5 ${selectedTechnician.networkStatus === 'online' ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`font-medium ${selectedTechnician.networkStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedTechnician.networkStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">Current Location</div>
                      <div className="text-sm text-gray-600">{selectedTechnician.location}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Last updated: {getTimeSinceUpdate(selectedTechnician.lastUpdated)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Job */}
              {selectedTechnician.currentJob && (
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Job</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">{selectedTechnician.currentJob}</span>
                    </div>
                    <div className="text-sm text-blue-700">
                      <Building2 className="h-4 w-4 inline mr-2" />
                      {selectedTechnician.currentCustomer}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact & Vehicle */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      {selectedTechnician.phone}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 truncate">
                      <User className="h-4 w-4" />
                      {selectedTechnician.email}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Vehicle</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="h-4 w-4" />
                    {selectedTechnician.vehicleNumber}
                  </div>
                </div>
              </div>

              {/* Today's Stats */}
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Today's Performance</h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">{selectedTechnician.todayJobs}</div>
                    <div className="text-xs text-gray-600">Total Jobs</div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-emerald-600">{selectedTechnician.completedJobs}</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedTechnician.pendingJobs}</div>
                    <div className="text-xs text-gray-600">Pending</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-orange-600">{selectedTechnician.totalDistance.toFixed(1)}</div>
                    <div className="text-xs text-gray-600">Distance (km)</div>
                  </div>
                </div>
              </div>

              {/* Skills & Rating */}
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Skills & Performance</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedTechnician.skillSet.map((skill, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium">Rating:</span>
                    <span className="text-lg font-bold text-emerald-600">{selectedTechnician.rating}/5.0</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Avg Response:</span>
                    <span className="text-lg font-bold text-blue-600">{selectedTechnician.responseTime}m</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedTechnician(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => window.location.href = `tel:${selectedTechnician.phone}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Call Technician
                </button>
                <button
                  onClick={() => router.push(`/after-sales-service/field-service/view/${selectedTechnician.technicianId}`)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  View Full Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg  w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="h-7 w-7" />
                  Team Analytics & Performance
                </h2>
                <p className="text-sm text-emerald-100 mt-1">Comprehensive insights into field technician operations</p>
              </div>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Overview Stats */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Team Overview
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-white rounded-lg p-3 border border-emerald-200">
                    <div className="text-sm text-gray-600 mb-1">Total Technicians</div>
                    <div className="text-3xl font-bold text-gray-900">{totalTechnicians}</div>
                    <div className="text-xs text-emerald-600 mt-1">Active team members</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="text-sm text-gray-600 mb-1">Total Distance</div>
                    <div className="text-3xl font-bold text-blue-600">
                      {technicians.reduce((sum, t) => sum + t.totalDistance, 0).toFixed(1)} km
                    </div>
                    <div className="text-xs text-blue-600 mt-1">Covered today</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-purple-200">
                    <div className="text-sm text-gray-600 mb-1">Working Hours</div>
                    <div className="text-3xl font-bold text-purple-600">
                      {technicians.reduce((sum, t) => sum + t.workingHours, 0).toFixed(1)}h
                    </div>
                    <div className="text-xs text-purple-600 mt-1">Total logged today</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-orange-200">
                    <div className="text-sm text-gray-600 mb-1">Avg Rating</div>
                    <div className="text-3xl font-bold text-orange-600">
                      {(totalTechnicians ? technicians.reduce((sum, t) => sum + t.rating, 0) / totalTechnicians : 0).toFixed(1)}
                    </div>
                    <div className="text-xs text-orange-600 mt-1">Out of 5.0</div>
                  </div>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  Status Distribution
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { status: 'available', label: 'Available', count: technicians.filter(t => t.currentStatus === 'available').length, color: 'green' },
                    { status: 'on_job', label: 'On Job', count: technicians.filter(t => t.currentStatus === 'on_job').length, color: 'blue' },
                    { status: 'in_transit', label: 'In Transit', count: technicians.filter(t => t.currentStatus === 'in_transit').length, color: 'yellow' },
                    { status: 'on_break', label: 'On Break', count: technicians.filter(t => t.currentStatus === 'on_break').length, color: 'orange' },
                    { status: 'offline', label: 'Offline', count: technicians.filter(t => t.currentStatus === 'offline').length, color: 'gray' },
                  ].map((item) => (
                    <div key={item.status} className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className={`text-3xl font-bold text-${item.color}-600 mb-1`}>{item.count}</div>
                      <div className="text-sm text-gray-600">{item.label}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                          className={`bg-${item.color}-600 h-2 rounded-full transition-all`}
                          style={{ width: `${(item.count / totalTechnicians) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {((item.count / totalTechnicians) * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-emerald-600" />
                    Job Completion Analysis
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Completed Jobs</span>
                        <span className="text-sm font-bold text-emerald-600">{completedJobsToday} / {totalJobsToday}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-emerald-600 h-3 rounded-full transition-all"
                          style={{ width: `${(completedJobsToday / totalJobsToday) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {((completedJobsToday / totalJobsToday) * 100).toFixed(1)}% completion rate
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Pending Jobs</span>
                        <span className="text-sm font-bold text-blue-600">
                          {technicians.reduce((sum, t) => sum + t.pendingJobs, 0)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${(technicians.reduce((sum, t) => sum + t.pendingJobs, 0) / totalJobsToday) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200 mt-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Top Performers Today</div>
                      {technicians
                        .sort((a, b) => b.completedJobs - a.completedJobs)
                        .slice(0, 3)
                        .map((tech, index) => (
                          <div key={tech.id} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-400' : 'text-orange-600'}`}>
                                #{index + 1}
                              </span>
                              <span className="text-sm font-medium text-gray-900">{tech.technicianName}</span>
                            </div>
                            <span className="text-sm font-bold text-emerald-600">{tech.completedJobs} jobs</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-emerald-600" />
                    Response Time Analysis
                  </h3>
                  <div className="space-y-2">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="text-sm text-gray-600 mb-1">Team Average</div>
                      <div className="text-3xl font-bold text-blue-600">{avgResponseTime} min</div>
                      <div className="text-xs text-blue-600 mt-1">Average response time</div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-3">Response Time Distribution</div>
                      {[
                        { range: '< 15 min', count: technicians.filter(t => t.responseTime < 15).length, color: 'green' },
                        { range: '15-20 min', count: technicians.filter(t => t.responseTime >= 15 && t.responseTime <= 20).length, color: 'yellow' },
                        { range: '> 20 min', count: technicians.filter(t => t.responseTime > 20).length, color: 'red' },
                      ].map((item) => (
                        <div key={item.range} className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">{item.range}</span>
                            <span className="text-sm font-bold text-gray-900">{item.count} techs</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`bg-${item.color}-600 h-2 rounded-full transition-all`}
                              style={{ width: `${(item.count / totalTechnicians) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200 mt-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Fastest Responders</div>
                      {technicians
                        .sort((a, b) => a.responseTime - b.responseTime)
                        .slice(0, 3)
                        .map((tech, index) => (
                          <div key={tech.id} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                              <span className="text-sm font-medium text-gray-900">{tech.technicianName}</span>
                            </div>
                            <span className="text-sm font-bold text-orange-600">{tech.responseTime}m</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Distance & Skills Analysis */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-emerald-600" />
                    Distance Traveled
                  </h3>
                  <div className="space-y-3">
                    {technicians
                      .sort((a, b) => b.totalDistance - a.totalDistance)
                      .map((tech) => (
                        <div key={tech.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 mb-1">{tech.technicianName}</div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 h-2 rounded-full transition-all"
                                style={{ width: `${(tech.totalDistance / (Math.max(...technicians.map(t => t.totalDistance), 1) || 1)) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-emerald-600 ml-4">{tech.totalDistance.toFixed(1)} km</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-emerald-600" />
                    Skills Distribution
                  </h3>
                  <div className="space-y-3">
                    {Array.from(new Set(technicians.flatMap(t => t.skillSet))).map((skill) => {
                      const count = technicians.filter(t => t.skillSet.includes(skill)).length;
                      return (
                        <div key={skill} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 mb-1">{skill}</div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                                style={{ width: `${(count / totalTechnicians) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-purple-600 ml-4">{count} techs</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Technician Ratings */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Technician Ratings
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {technicians
                    .sort((a, b) => b.rating - a.rating)
                    .map((tech) => (
                      <div key={tech.id} className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-lg p-3 border border-gray-200">
                        <div className="text-sm font-medium text-gray-900 mb-2 truncate">{tech.technicianName}</div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-2xl font-bold text-emerald-600">{tech.rating}</div>
                          <div className="text-xs text-gray-600">/ 5.0</div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 h-2 rounded-full transition-all"
                            style={{ width: `${(tech.rating / 5) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">{tech.completedJobs} jobs completed</div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => exportToCsv('technician-tracking', filteredTechnicians)}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
