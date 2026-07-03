'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, MapPin, Navigation, CheckCircle, Clock, XCircle, Wrench, User, Phone, TrendingUp, Download, Package, BarChart3, X, AlertTriangle, Calendar, CalendarDays, Filter, ChevronLeft, ChevronRight, Grid3x3, List, UserPlus, FileEdit, Trash2, Copy, Loader2, AlertCircle } from 'lucide-react';
import { FieldServiceService, FieldServiceJob, FieldServicePriority } from '@/services/field-service.service';
import { exportToCsv } from '@/lib/export';

const fieldServiceJobsForFallback: FieldServiceJob[] = [
  {
    id: '1',
    jobNumber: 'FS-2025-000456',
    customerId: 'CUST001',
    customerName: 'Sharma Modular Kitchens Pvt Ltd',
    status: 'in_progress',
    priority: 'P1 - Critical',
    engineerId: 'ENG001',
    engineerName: 'Rajesh Kumar',
    scheduledDate: '2025-10-17',
    scheduledTimeSlot: '09:00 - 11:00',
    estimatedDuration: 2,
    actualDuration: 1.5,
    equipmentModel: 'Chimney Auto Clean 90cm',
    issueType: 'Motor Replacement',
    siteAddress: 'Shop 12, MG Road, Bangalore - 560001',
    siteContactPerson: 'Rajesh Sharma',
    siteContactPhone: '+91-98765-43210',
    checkInTime: '2025-10-17T09:15:00',
    travelDistance: 8.5,
    partsConsumed: 2,
    totalPartsValue: 8500,
    serviceReportSubmitted: false,
    customerSignature: false,
  },
  {
    id: '2',
    jobNumber: 'FS-2025-000423',
    customerId: 'CUST002',
    customerName: 'Prestige Developers Bangalore',
    status: 'dispatched',
    priority: 'P2 - High',
    engineerId: 'ENG002',
    engineerName: 'Amit Sharma',
    scheduledDate: '2025-10-17',
    scheduledTimeSlot: '11:00 - 13:00',
    estimatedDuration: 2,
    equipmentModel: 'Built-in Oven 60L',
    issueType: 'Temperature Sensor Issue',
    siteAddress: 'Flat 501, Prestige Sunrise Park, Bangalore - 560102',
    siteContactPerson: 'Suresh Menon',
    siteContactPhone: '+91-80-2345-6789',
    travelDistance: 12.3,
    partsConsumed: 0,
    totalPartsValue: 0,
    serviceReportSubmitted: false,
    customerSignature: false,
  },
  {
    id: '3',
    jobNumber: 'FS-2025-000398',
    customerId: 'CUST003',
    customerName: 'Urban Interiors & Designers',
    status: 'completed',
    priority: 'P3 - Medium',
    engineerId: 'ENG003',
    engineerName: 'Priya Patel',
    scheduledDate: '2025-10-16',
    scheduledTimeSlot: '14:00 - 16:00',
    estimatedDuration: 2,
    actualDuration: 1.8,
    equipmentModel: 'Built-in Hob 4 Burner Gas',
    issueType: 'Auto-ignition Repair',
    siteAddress: 'Showroom 3, Koramangala, Bangalore - 560095',
    siteContactPerson: 'Anita Desai',
    siteContactPhone: '+91-98123-45678',
    checkInTime: '2025-10-16T14:10:00',
    checkOutTime: '2025-10-16T15:58:00',
    travelDistance: 6.2,
    partsConsumed: 1,
    totalPartsValue: 450,
    serviceReportSubmitted: true,
    customerSignature: true,
  },
  {
    id: '4',
    jobNumber: 'FS-2025-000501',
    customerId: 'CUST004',
    customerName: 'Elite Contractors & Builders',
    status: 'scheduled',
    priority: 'P1 - Critical',
    engineerId: 'ENG001',
    engineerName: 'Rajesh Kumar',
    scheduledDate: '2025-10-17',
    scheduledTimeSlot: '13:00 - 15:00',
    estimatedDuration: 2,
    equipmentModel: 'Dishwasher 14 Place Settings',
    issueType: 'Water Leakage - Emergency',
    siteAddress: '2BHK, Elite Heights, Whitefield, Bangalore - 560066',
    siteContactPerson: 'Karan Malhotra',
    siteContactPhone: '+91-99876-54321',
    partsConsumed: 0,
    totalPartsValue: 0,
    serviceReportSubmitted: false,
    customerSignature: false,
  },
  {
    id: '5',
    jobNumber: 'FS-2025-000467',
    customerId: 'CUST005',
    customerName: 'DLF Universal Projects',
    status: 'completed',
    priority: 'P4 - Low',
    engineerId: 'ENG004',
    engineerName: 'Sanjay Gupta',
    scheduledDate: '2025-10-15',
    scheduledTimeSlot: '10:00 - 12:00',
    estimatedDuration: 2,
    actualDuration: 1.5,
    equipmentModel: 'Microwave Oven 30L',
    issueType: 'Turntable Motor Replacement',
    siteAddress: 'Villa 12, DLF Garden City, Bangalore - 560067',
    siteContactPerson: 'Vikram Singh',
    siteContactPhone: '+91-98765-12345',
    checkInTime: '2025-10-15T10:05:00',
    checkOutTime: '2025-10-15T11:35:00',
    travelDistance: 15.7,
    partsConsumed: 1,
    totalPartsValue: 1200,
    serviceReportSubmitted: true,
    customerSignature: true,
  },
  {
    id: '6',
    jobNumber: 'FS-2025-000489',
    customerId: 'CUST006',
    customerName: 'Signature Interiors Pune',
    status: 'in_progress',
    priority: 'P2 - High',
    engineerId: 'ENG005',
    engineerName: 'Neha Singh',
    scheduledDate: '2025-10-17',
    scheduledTimeSlot: '10:00 - 12:00',
    estimatedDuration: 2,
    actualDuration: 1,
    equipmentModel: 'Induction Hob 4 Burner',
    issueType: 'Cookware Detection Issue',
    siteAddress: 'Flat 302, Baner, Pune - 411045',
    siteContactPerson: 'Pooja Mehta',
    siteContactPhone: '+91-20-4567-8901',
    checkInTime: '2025-10-17T10:05:00',
    travelDistance: 10.2,
    partsConsumed: 0,
    totalPartsValue: 0,
    serviceReportSubmitted: false,
    customerSignature: false,
  },
  {
    id: '7',
    jobNumber: 'FS-2025-000512',
    customerId: 'CUST007',
    customerName: 'Royal Homes Hyderabad',
    status: 'scheduled',
    priority: 'P3 - Medium',
    engineerId: 'ENG006',
    engineerName: 'Krishna Murthy',
    scheduledDate: '2025-10-18',
    scheduledTimeSlot: '14:00 - 16:00',
    estimatedDuration: 2,
    equipmentModel: 'RO Water Purifier 10L',
    issueType: 'Filter Replacement & Service',
    siteAddress: 'Penthouse, Royal Towers, Hyderabad - 500034',
    siteContactPerson: 'Vikram Reddy',
    siteContactPhone: '+91-40-4567-8901',
    partsConsumed: 0,
    totalPartsValue: 0,
    serviceReportSubmitted: false,
    customerSignature: false,
  },
  {
    id: '8',
    jobNumber: 'FS-2025-000478',
    customerId: 'CUST008',
    customerName: 'Modern Living Ahmedabad',
    status: 'dispatched',
    priority: 'P2 - High',
    engineerId: 'ENG007',
    engineerName: 'Mehul Patel',
    scheduledDate: '2025-10-17',
    scheduledTimeSlot: '15:00 - 17:00',
    estimatedDuration: 2,
    equipmentModel: 'Chimney Curved Glass 60cm',
    issueType: 'Suction Power Reduced',
    siteAddress: 'Flat 804, SG Highway, Ahmedabad - 380015',
    siteContactPerson: 'Mehul Patel',
    siteContactPhone: '+91-79-8765-4321',
    travelDistance: 18.5,
    partsConsumed: 0,
    totalPartsValue: 0,
    serviceReportSubmitted: false,
    customerSignature: false,
  },
  {
    id: '9',
    jobNumber: 'FS-2025-000534',
    customerId: 'CUST009',
    customerName: 'Decor Studio Chennai',
    status: 'scheduled',
    priority: 'P3 - Medium',
    engineerId: 'ENG008',
    engineerName: 'Lakshmi Iyer',
    scheduledDate: '2025-10-19',
    scheduledTimeSlot: '09:00 - 11:00',
    estimatedDuration: 2,
    equipmentModel: 'Built-in Microwave',
    issueType: 'Control Panel Issue',
    siteAddress: 'Villa 23, Anna Nagar, Chennai - 600040',
    siteContactPerson: 'Lakshmi Iyer',
    siteContactPhone: '+91-44-2876-5432',
    partsConsumed: 0,
    totalPartsValue: 0,
    serviceReportSubmitted: false,
    customerSignature: false,
  },
  {
    id: '10',
    jobNumber: 'FS-2025-000445',
    customerId: 'CUST010',
    customerName: 'Cosmos Furniture Mart',
    status: 'completed',
    priority: 'P3 - Medium',
    engineerId: 'ENG003',
    engineerName: 'Priya Patel',
    scheduledDate: '2025-10-14',
    scheduledTimeSlot: '11:00 - 13:00',
    estimatedDuration: 2,
    actualDuration: 2.2,
    equipmentModel: 'Chimney Auto Clean 90cm',
    issueType: 'Filter Cleaning & Maintenance',
    siteAddress: 'Showroom, MG Road, Mumbai - 400001',
    siteContactPerson: 'Ramesh Agarwal',
    siteContactPhone: '+91-22-3456-7890',
    checkInTime: '2025-10-14T11:00:00',
    checkOutTime: '2025-10-14T13:12:00',
    travelDistance: 22.5,
    partsConsumed: 2,
    totalPartsValue: 850,
    serviceReportSubmitted: true,
    customerSignature: true,
  },
];

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-700',
  dispatched: 'bg-cyan-100 text-cyan-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusIcons = {
  scheduled: Clock,
  dispatched: Navigation,
  in_progress: Wrench,
  completed: CheckCircle,
  cancelled: XCircle,
};

const priorityColors = {
  'P1 - Critical': 'bg-red-100 text-red-700 border-red-300',
  'P2 - High': 'bg-orange-100 text-orange-700 border-orange-300',
  'P3 - Medium': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'P4 - Low': 'bg-blue-100 text-blue-700 border-blue-300',
};

export default function FieldServicePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [engineerFilter, setEngineerFilter] = useState<string>('all');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<FieldServiceJob | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Data fetching states
  const [fieldServiceJobs, setFieldServiceJobs] = useState<FieldServiceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch field service jobs on mount
  useEffect(() => {
    const fetchFieldServiceJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await FieldServiceService.getAllFieldServiceJobs();
        setFieldServiceJobs(data);
      } catch (err) {
        setError('Failed to load field service jobs. Please try again.');
        console.error('Error fetching field service jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFieldServiceJobs();
  }, []);

  // New job form state
  const [newJob, setNewJob] = useState({
    customerName: '',
    priority: 'P3 - Medium' as FieldServicePriority,
    engineerName: '',
    scheduledDate: '',
    scheduledTimeSlot: '',
    equipmentModel: '',
    issueType: '',
    siteAddress: '',
    siteContactPerson: '',
    siteContactPhone: '',
  });

  // Toast auto-dismiss
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
        setPriorityFilter('all');
        setToast({ message: `Showing all ${stats.totalJobs} jobs`, type: 'info' });
        break;
      case 'scheduled':
        setStatusFilter('scheduled');
        setToast({ message: `${stats.scheduledJobs} jobs scheduled`, type: 'info' });
        break;
      case 'dispatched':
        setStatusFilter('dispatched');
        setToast({ message: `${stats.dispatchedJobs} jobs dispatched`, type: 'info' });
        break;
      case 'in_progress':
        setStatusFilter('in_progress');
        setToast({ message: `${stats.inProgressJobs} jobs in progress`, type: 'info' });
        break;
      case 'completed':
        setStatusFilter('completed');
        setToast({ message: `${stats.completedJobs} jobs completed`, type: 'success' });
        break;
      case 'avgtime':
        setToast({ message: `Average job duration: ${stats.avgJobDuration.toFixed(1)} hours`, type: 'info' });
        break;
      case 'parts':
        setToast({ message: `Total parts value: ${formatCurrency(stats.totalPartsValue)}`, type: 'info' });
        break;
    }
  };

  const handleJobRowClick = (job: FieldServiceJob) => {
    setSelectedJob(job);
  };

  const handleSelectJob = (jobId: string, e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newSelection = new Set(selectedJobs);
    if (newSelection.has(jobId)) {
      newSelection.delete(jobId);
    } else {
      newSelection.add(jobId);
    }
    setSelectedJobs(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedJobs.size === paginatedJobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(paginatedJobs.map(job => job.id)));
    }
  };

  const handleBulkAction = (action: string) => {
    const count = selectedJobs.size;
    switch (action) {
      case 'assign':
        setToast({ message: `Assigning ${count} jobs to engineer...`, type: 'info' });
        break;
      case 'reschedule':
        setToast({ message: `Rescheduling ${count} jobs...`, type: 'info' });
        break;
      case 'cancel':
        setToast({ message: `Cancelling ${count} jobs...`, type: 'info' });
        break;
      case 'export':
        exportToCsv('field-service-jobs', fieldServiceJobs.filter(job => selectedJobs.has(job.id)));
        setToast({ message: `Exporting ${count} jobs...`, type: 'success' });
        break;
    }
    setSelectedJobs(new Set());
    setShowBulkActionsModal(false);
  };

  const handleCreateJob = () => {
    setToast({ message: 'Job created successfully!', type: 'success' });
    setShowCreateJobModal(false);
    setNewJob({
      customerName: '',
      priority: 'P3 - Medium',
      engineerName: '',
      scheduledDate: '',
      scheduledTimeSlot: '',
      equipmentModel: '',
      issueType: '',
      siteAddress: '',
      siteContactPerson: '',
      siteContactPhone: '',
    });
  };

  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendarDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCalendarDate(newDate);
  };

  // Filter jobs
  const filteredJobs = fieldServiceJobs.filter((job) => {
    const matchesSearch =
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.engineerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.equipmentModel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
    const matchesEngineer = engineerFilter === 'all' || job.engineerName === engineerFilter;

    // Date range filter
    let matchesDateRange = true;
    if (dateRangeStart && dateRangeEnd) {
      const jobDate = new Date(job.scheduledDate);
      const startDate = new Date(dateRangeStart);
      const endDate = new Date(dateRangeEnd);
      matchesDateRange = jobDate >= startDate && jobDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesEngineer && matchesDateRange;
  });

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate statistics
  const jobsWithDuration = fieldServiceJobs.filter(j => j.actualDuration);
  const stats = {
    totalJobs: fieldServiceJobs.length,
    scheduledJobs: fieldServiceJobs.filter(j => j.status === 'scheduled').length,
    dispatchedJobs: fieldServiceJobs.filter(j => j.status === 'dispatched').length,
    inProgressJobs: fieldServiceJobs.filter(j => j.status === 'in_progress').length,
    completedJobs: fieldServiceJobs.filter(j => j.status === 'completed').length,
    avgJobDuration: jobsWithDuration.length > 0
      ? jobsWithDuration.reduce((sum, j) => sum + (j.actualDuration || 0), 0) / jobsWithDuration.length
      : 0,
    totalPartsValue: fieldServiceJobs.reduce((sum, j) => sum + j.totalPartsValue, 0),
  };

  // Get unique engineers
  const uniqueEngineers = Array.from(new Set(fieldServiceJobs.filter(j => j.engineerName).map(j => j.engineerName)));

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getJobsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return fieldServiceJobs.filter(job => job.scheduledDate === dateStr);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 w-full flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading field service jobs...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 w-full flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-gray-900 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Field Service Jobs</h1>
          <p className="text-gray-600">Manage engineer dispatch and on-site service operations</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateJobModal(true)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create Job
          </button>
          <button
            onClick={() => setShowAnalyticsModal(true)}
            className="bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2 mb-3">
        <button
          onClick={() => handleStatsCardClick('total')}
          className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-blue-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
              <p className="text-xs text-blue-600 mt-1">View all</p>
            </div>
            <Wrench className="h-8 w-8 text-blue-600" />
          </div>
        </button>

        <button
          onClick={() => handleStatsCardClick('scheduled')}
          className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-blue-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">{stats.scheduledJobs}</p>
              <p className="text-xs text-blue-600 mt-1">Click to filter</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </button>

        <button
          onClick={() => handleStatsCardClick('dispatched')}
          className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-cyan-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dispatched</p>
              <p className="text-2xl font-bold text-cyan-600">{stats.dispatchedJobs}</p>
              <p className="text-xs text-cyan-600 mt-1">Click to filter</p>
            </div>
            <Navigation className="h-8 w-8 text-cyan-600" />
          </div>
        </button>

        <button
          onClick={() => handleStatsCardClick('in_progress')}
          className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-purple-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-purple-600">{stats.inProgressJobs}</p>
              <p className="text-xs text-purple-600 mt-1">Click to filter</p>
            </div>
            <Wrench className="h-8 w-8 text-purple-600" />
          </div>
        </button>

        <button
          onClick={() => handleStatsCardClick('completed')}
          className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-green-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedJobs}</p>
              <p className="text-xs text-green-600 mt-1">Click to filter</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </button>

        <button
          onClick={() => handleStatsCardClick('avgtime')}
          className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-orange-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Time</p>
              <p className="text-2xl font-bold text-orange-600">{stats.avgJobDuration.toFixed(1)}h</p>
              <p className="text-xs text-orange-600 mt-1">Duration info</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </button>

        <button
          onClick={() => handleStatsCardClick('parts')}
          className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-purple-500 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Parts Value</p>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(stats.totalPartsValue)}</p>
              <p className="text-xs text-purple-600 mt-1">Total value</p>
            </div>
            <Package className="h-8 w-8 text-purple-600" />
          </div>
        </button>
      </div>

      {/* Filters, View Mode Toggle, and Bulk Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <div className="flex flex-col gap-2">
          {/* Top Row: Search, View Toggle, Bulk Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by job number, customer, engineer, or equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <List className="h-4 w-4" />
                List
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <CalendarDays className="h-4 w-4" />
                Calendar
              </button>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${showAdvancedFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>

            {/* Bulk Actions */}
            {selectedJobs.size > 0 && (
              <button
                onClick={() => setShowBulkActionsModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <FileEdit className="h-4 w-4" />
                Bulk Actions ({selectedJobs.size})
              </button>
            )}
          </div>

          {/* Advanced Filters Row */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 pt-4 border-t border-gray-200">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="dispatched">Dispatched</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Priority</option>
                <option value="P1 - Critical">P1 - Critical</option>
                <option value="P2 - High">P2 - High</option>
                <option value="P3 - Medium">P3 - Medium</option>
                <option value="P4 - Low">P4 - Low</option>
              </select>

              {/* Engineer Filter */}
              <select
                value={engineerFilter}
                onChange={(e) => setEngineerFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Engineers</option>
                {uniqueEngineers.map(engineer => (
                  <option key={engineer} value={engineer}>{engineer}</option>
                ))}
              </select>

              {/* Date Range Start */}
              <input
                type="date"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
                placeholder="Start Date"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />

              {/* Date Range End */}
              <input
                type="date"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
                placeholder="End Date"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Content - List or Calendar View */}
      {viewMode === 'list' ? (
        <>
          {/* Field Service Jobs Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={selectedJobs.size === paginatedJobs.length && paginatedJobs.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Details
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority & Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipment & Issue
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engineer
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location & Contact
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parts & Report
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedJobs.map((job) => {
                    const StatusIcon = statusIcons[job.status];
                    return (
                      <tr
                        key={job.id}
                        onClick={() => handleJobRowClick(job)}
                        className="hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedJobs.has(job.id)}
                            onChange={(e) => handleSelectJob(job.id, e)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{job.jobNumber}</span>
                            <span className="text-sm text-gray-600">{job.customerName}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border w-fit ${priorityColors[job.priority]}`}>
                              {job.priority}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium w-fit ${statusColors[job.status]}`}>
                              <StatusIcon className="h-3 w-3" />
                              {job.status.replace('_', ' ').charAt(0).toUpperCase() + job.status.slice(1).replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-900">{job.equipmentModel}</span>
                            <span className="text-xs text-gray-600">{job.issueType}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col text-sm">
                            <span className="text-gray-900">
                              {new Date(job.scheduledDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short'
                              })}
                            </span>
                            <span className="text-xs text-gray-600">{job.scheduledTimeSlot}</span>
                            {job.actualDuration && (
                              <span className="text-xs text-green-600">Done in {job.actualDuration}h</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          {job.engineerName ? (
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-gray-400" />
                                <span className="text-sm text-gray-900">{job.engineerName}</span>
                              </div>
                              {job.checkInTime && !job.checkOutTime && (
                                <span className="text-xs text-green-600">Checked In</span>
                              )}
                              {job.checkOutTime && (
                                <span className="text-xs text-gray-600">Checked Out</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Unassigned</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col max-w-xs">
                            <div className="flex items-start gap-1">
                              <MapPin className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-gray-600 truncate">{job.siteAddress}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-600">{job.siteContactPerson}</span>
                            </div>
                            {job.travelDistance && (
                              <span className="text-xs text-blue-600 mt-1">{job.travelDistance} km</span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col">
                            {job.partsConsumed > 0 ? (
                              <span className="text-sm text-gray-900">{job.partsConsumed} parts</span>
                            ) : (
                              <span className="text-sm text-gray-400">No parts</span>
                            )}
                            {job.totalPartsValue > 0 && (
                              <span className="text-xs text-gray-600">{formatCurrency(job.totalPartsValue)}</span>
                            )}
                            {job.serviceReportSubmitted ? (
                              <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
                                <CheckCircle className="h-3 w-3" />
                                Report Submitted
                              </span>
                            ) : job.status === 'completed' ? (
                              <span className="text-xs text-orange-600 mt-1">Report Pending</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/after-sales-service/field-service/view/${job.id}`);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/after-sales-service/field-service/edit/${job.id}`);
                              }}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit Job"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredJobs.length)} of {filteredJobs.length} jobs
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Calendar View */
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold text-gray-900">
              {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => navigateCalendar('prev')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCalendarDate(new Date())}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateCalendar('next')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-700 py-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {(() => {
              const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(calendarDate);
              const days = [];

              // Empty cells for days before month starts
              for (let i = 0; i < startingDayOfWeek; i++) {
                days.push(<div key={`empty-${i}`} className="aspect-square border border-gray-200 rounded-lg bg-gray-50"></div>);
              }

              // Days of the month
              for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const jobsForDay = getJobsForDate(date);
                const isToday = new Date().toDateString() === date.toDateString();

                days.push(
                  <div
                    key={day}
                    className={`aspect-square border rounded-lg p-2 hover:shadow-md transition-shadow ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                      }`}
                  >
                    <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                      {day}
                    </div>
                    <div className="space-y-1 overflow-y-auto max-h-24">
                      {jobsForDay.map(job => (
                        <div
                          key={job.id}
                          onClick={() => setSelectedJob(job)}
                          className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${statusColors[job.status]}`}
                          title={`${job.jobNumber} - ${job.customerName}`}
                        >
                          <div className="font-medium truncate">{job.jobNumber}</div>
                          <div className="truncate">{job.scheduledTimeSlot}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return days;
            })()}
          </div>

          {/* Calendar Legend */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusColors).map(([status, colorClass]) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${colorClass}`}></div>
                  <span className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50" onClick={() => setSelectedJob(null)}>
          <div className="bg-white rounded-lg  w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className={`sticky top-0 bg-gradient-to-r ${selectedJob.status === 'completed' ? 'from-green-600 to-emerald-600' :
                selectedJob.status === 'in_progress' ? 'from-purple-600 to-pink-600' :
                  selectedJob.status === 'dispatched' ? 'from-cyan-600 to-blue-600' :
                    'from-blue-600 to-indigo-600'
              } px-3 py-2 flex items-center justify-between`}>
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedJob.jobNumber}</h2>
                <p className="text-sm text-white/90">{selectedJob.customerName}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Status and Priority */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${statusColors[selectedJob.status]}`}>
                  {(() => {
                    const StatusIcon = statusIcons[selectedJob.status];
                    return <StatusIcon className="h-4 w-4" />;
                  })()}
                  {selectedJob.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border ${priorityColors[selectedJob.priority]}`}>
                  {selectedJob.priority}
                </span>
              </div>

              {/* Equipment and Issue */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Equipment & Issue</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Equipment Model</p>
                    <p className="text-base font-medium text-gray-900">{selectedJob.equipmentModel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Issue Type</p>
                    <p className="text-base font-medium text-gray-900">{selectedJob.issueType}</p>
                  </div>
                </div>
              </div>

              {/* Schedule Information */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Schedule Information
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Scheduled Date</p>
                    <p className="text-base font-medium text-gray-900">
                      {new Date(selectedJob.scheduledDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time Slot</p>
                    <p className="text-base font-medium text-gray-900">{selectedJob.scheduledTimeSlot}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="text-base font-medium text-gray-900">
                      {selectedJob.actualDuration ? `${selectedJob.actualDuration}h (Actual)` : `${selectedJob.estimatedDuration}h (Est.)`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Engineer Information */}
              {selectedJob.engineerName && (
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    Engineer Details
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-600">Assigned Engineer</p>
                      <p className="text-base font-medium text-gray-900">{selectedJob.engineerName}</p>
                      <p className="text-sm text-gray-600">ID: {selectedJob.engineerId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Check-in Status</p>
                      {selectedJob.checkInTime && (
                        <div className="space-y-1">
                          <p className="text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            In: {new Date(selectedJob.checkInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {selectedJob.checkOutTime && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Out: {new Date(selectedJob.checkOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      )}
                      {!selectedJob.checkInTime && (
                        <p className="text-sm text-gray-500">Not checked in yet</p>
                      )}
                    </div>
                  </div>
                  {selectedJob.travelDistance && (
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <p className="text-sm text-gray-600">Travel Distance</p>
                      <p className="text-base font-medium text-purple-600">{selectedJob.travelDistance} km</p>
                    </div>
                  )}
                </div>
              )}

              {/* Site Information */}
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  Site Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Site Address</p>
                    <p className="text-base font-medium text-gray-900">{selectedJob.siteAddress}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-600">Contact Person</p>
                      <p className="text-base font-medium text-gray-900">{selectedJob.siteContactPerson}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact Phone</p>
                      <p className="text-base font-medium text-gray-900 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-emerald-600" />
                        {selectedJob.siteContactPhone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parts and Service Report */}
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-600" />
                  Parts & Service Report
                </h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Parts Consumed</p>
                    <p className="text-2xl font-bold text-orange-600">{selectedJob.partsConsumed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Parts Value</p>
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(selectedJob.totalPartsValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Service Report</p>
                    {selectedJob.serviceReportSubmitted ? (
                      <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
                        <CheckCircle className="h-4 w-4" />
                        Submitted
                      </p>
                    ) : (
                      <p className="text-sm text-orange-600 flex items-center gap-1 mt-2">
                        <Clock className="h-4 w-4" />
                        Pending
                      </p>
                    )}
                  </div>
                </div>
                {selectedJob.customerSignature && (
                  <div className="pt-3 border-t border-orange-200">
                    <p className="text-sm text-green-600 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Customer signature obtained
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedJob(null);
                    router.push(`/after-sales-service/field-service/edit/${selectedJob.id}`);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Job Modal */}
      {showCreateJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Create New Field Service Job</h2>
                <p className="text-sm text-blue-100">Fill in the details to create a new service job</p>
              </div>
              <button
                onClick={() => setShowCreateJobModal(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <form className="space-y-3">
                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                      <input
                        type="text"
                        value={newJob.customerName}
                        onChange={(e) => setNewJob({ ...newJob, customerName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter customer name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                      <select
                        value={newJob.priority}
                        onChange={(e) => setNewJob({ ...newJob, priority: e.target.value as FieldServiceJob['priority'] })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="P1 - Critical">P1 - Critical</option>
                        <option value="P2 - High">P2 - High</option>
                        <option value="P3 - Medium">P3 - Medium</option>
                        <option value="P4 - Low">P4 - Low</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Schedule Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date *</label>
                      <input
                        type="date"
                        value={newJob.scheduledDate}
                        onChange={(e) => setNewJob({ ...newJob, scheduledDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot *</label>
                      <input
                        type="text"
                        value={newJob.scheduledTimeSlot}
                        onChange={(e) => setNewJob({ ...newJob, scheduledTimeSlot: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 09:00 - 11:00"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Equipment & Issue */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Equipment & Issue</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Model *</label>
                      <input
                        type="text"
                        value={newJob.equipmentModel}
                        onChange={(e) => setNewJob({ ...newJob, equipmentModel: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter equipment model"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type *</label>
                      <input
                        type="text"
                        value={newJob.issueType}
                        onChange={(e) => setNewJob({ ...newJob, issueType: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter issue description"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Site Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Site Information</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Site Address *</label>
                      <textarea
                        value={newJob.siteAddress}
                        onChange={(e) => setNewJob({ ...newJob, siteAddress: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                        placeholder="Enter complete site address"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                        <input
                          type="text"
                          value={newJob.siteContactPerson}
                          onChange={(e) => setNewJob({ ...newJob, siteContactPerson: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Contact person name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone *</label>
                        <input
                          type="tel"
                          value={newJob.siteContactPhone}
                          onChange={(e) => setNewJob({ ...newJob, siteContactPhone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+91-XXXXX-XXXXX"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Engineer Assignment */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Engineer Assignment</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign Engineer (Optional)</label>
                    <select
                      value={newJob.engineerName}
                      onChange={(e) => setNewJob({ ...newJob, engineerName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select an engineer (optional)</option>
                      {uniqueEngineers.map(engineer => (
                        <option key={engineer} value={engineer}>{engineer}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateJobModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateJob}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Modal */}
      {showBulkActionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Bulk Actions</h2>
                <p className="text-sm text-purple-100">{selectedJobs.size} jobs selected</p>
              </div>
              <button
                onClick={() => setShowBulkActionsModal(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              <button
                onClick={() => handleBulkAction('assign')}
                className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-3"
              >
                <UserPlus className="h-5 w-5" />
                <span className="font-medium">Assign to Engineer</span>
              </button>

              <button
                onClick={() => handleBulkAction('reschedule')}
                className="w-full px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors flex items-center gap-3"
              >
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Reschedule Jobs</span>
              </button>

              <button
                onClick={() => handleBulkAction('export')}
                className="w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-3"
              >
                <Download className="h-5 w-5" />
                <span className="font-medium">Export Selected</span>
              </button>

              <button
                onClick={() => handleBulkAction('cancel')}
                className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-3"
              >
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Cancel Jobs</span>
              </button>
            </div>

            <div className="px-3 py-2 bg-gray-50 border-t flex justify-end">
              <button
                onClick={() => setShowBulkActionsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal - Keep existing implementation */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg  w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="h-7 w-7" />
                  Field Service Analytics
                </h2>
                <p className="text-sm text-blue-100 mt-1">Comprehensive insights into field service operations</p>
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
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Overview
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="text-sm text-gray-600 mb-1">Total Jobs</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.totalJobs}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-gray-600 mb-1">Completion Rate</div>
                    <div className="text-3xl font-bold text-green-600">
                      {((stats.completedJobs / stats.totalJobs) * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-orange-200">
                    <div className="text-sm text-gray-600 mb-1">Avg Duration</div>
                    <div className="text-3xl font-bold text-orange-600">{stats.avgJobDuration.toFixed(1)}h</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-purple-200">
                    <div className="text-sm text-gray-600 mb-1">Parts Value</div>
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalPartsValue)}</div>
                  </div>
                </div>
              </div>

              {/* Status Distribution */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Status Distribution</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Scheduled', count: stats.scheduledJobs, color: 'blue', icon: Clock },
                    { label: 'Dispatched', count: stats.dispatchedJobs, color: 'cyan', icon: Navigation },
                    { label: 'In Progress', count: stats.inProgressJobs, color: 'purple', icon: Wrench },
                    { label: 'Completed', count: stats.completedJobs, color: 'green', icon: CheckCircle },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="bg-gray-50 rounded-lg p-3 text-center">
                        <Icon className={`h-8 w-8 text-${item.color}-600 mb-2`} />
                        <div className={`text-3xl font-bold text-${item.color}-600 mb-1`}>{item.count}</div>
                        <div className="text-sm text-gray-600">{item.label}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                          <div
                            className={`bg-${item.color}-600 h-2 rounded-full transition-all`}
                            style={{ width: `${(item.count / stats.totalJobs) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {((item.count / stats.totalJobs) * 100).toFixed(0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Priority Analysis */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Priority Breakdown</h3>
                  <div className="space-y-3">
                    {['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low'].map((priority) => {
                      const count = fieldServiceJobs.filter(j => j.priority === priority).length;
                      const colorMap: Record<string, string> = {
                        'P1 - Critical': 'red',
                        'P2 - High': 'orange',
                        'P3 - Medium': 'yellow',
                        'P4 - Low': 'blue'
                      };
                      const color = colorMap[priority];
                      return (
                        <div key={priority}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">{priority}</span>
                            <span className={`text-sm font-bold text-${color}-600`}>{count} jobs</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`bg-${color}-600 h-3 rounded-full transition-all`}
                              style={{ width: `${(count / stats.totalJobs) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Engineer Performance</h3>
                  <div className="space-y-3">
                    {Array.from(new Set(fieldServiceJobs.filter(j => j.engineerName).map(j => j.engineerName))).map((engineer) => {
                      const engineerJobs = fieldServiceJobs.filter(j => j.engineerName === engineer);
                      const completed = engineerJobs.filter(j => j.status === 'completed').length;
                      return (
                        <div key={engineer} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-900">{engineer}</span>
                            </div>
                            <span className="text-sm font-bold text-green-600">{completed}/{engineerJobs.length}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${(completed / engineerJobs.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Parts Consumption Analysis */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  Parts Consumption Analysis
                </h3>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 text-center">
                    <div className="text-sm text-gray-600 mb-1">Total Parts Used</div>
                    <div className="text-3xl font-bold text-purple-600">
                      {fieldServiceJobs.reduce((sum, j) => sum + j.partsConsumed, 0)}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 text-center">
                    <div className="text-sm text-gray-600 mb-1">Jobs with Parts</div>
                    <div className="text-3xl font-bold text-purple-600">
                      {fieldServiceJobs.filter(j => j.partsConsumed > 0).length}
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 text-center">
                    <div className="text-sm text-gray-600 mb-1">Total Value</div>
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalPartsValue)}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200 text-center">
                    <div className="text-sm text-gray-600 mb-1">Avg Value/Job</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(stats.totalPartsValue / fieldServiceJobs.filter(j => j.partsConsumed > 0).length || 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Report Status */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Report Status</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="text-sm text-gray-600 mb-2">Reports Submitted</div>
                    <div className="text-3xl font-bold text-green-600">
                      {fieldServiceJobs.filter(j => j.serviceReportSubmitted).length}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {((fieldServiceJobs.filter(j => j.serviceReportSubmitted).length / stats.completedJobs) * 100).toFixed(0)}% of completed
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <div className="text-sm text-gray-600 mb-2">Reports Pending</div>
                    <div className="text-3xl font-bold text-orange-600">
                      {fieldServiceJobs.filter(j => j.status === 'completed' && !j.serviceReportSubmitted).length}
                    </div>
                    <div className="text-xs text-orange-600 mt-1">Awaiting submission</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="text-sm text-gray-600 mb-2">Customer Signatures</div>
                    <div className="text-3xl font-bold text-blue-600">
                      {fieldServiceJobs.filter(j => j.customerSignature).length}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {((fieldServiceJobs.filter(j => j.customerSignature).length / stats.completedJobs) * 100).toFixed(0)}% of completed
                    </div>
                  </div>
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
                  onClick={() => exportToCsv('field-service-jobs', filteredJobs)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
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
