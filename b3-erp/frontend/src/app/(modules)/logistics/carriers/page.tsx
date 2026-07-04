'use client';

import { useState, useEffect } from 'react';
import { LogisticsService } from '@/services/logistics.service';
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Truck,
  Mail,
  Phone,
  Star,
  TrendingUp,
  Package,
  DollarSign,
  Award,
  Ship,
  Plane,
  Train,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Calendar,
  Users
} from 'lucide-react';

// Carrier Interface
interface Carrier {
  id: string;
  carrier_id: string;
  name: string;
  carrier_type: 'courier' | 'freight' | 'air' | 'sea' | 'rail';
  contact_person: string;
  contact_number: string;
  email: string;
  address: string;
  on_time_percentage: number;
  average_cost_per_shipment: number;
  total_shipments: number;
  active_shipments: number;
  rating: number;
  established_date: string;
  service_areas: string[];
  status: 'active' | 'inactive' | 'suspended';
  contract_type: 'Long-term' | 'Short-term' | 'Per-shipment';
  insurance_coverage: number;
  notes: string;
  last_shipment_date: string;
}

export default function LogisticsCarriersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const itemsPerPage = 10;

  // Sample carriers data
  const carriers: Carrier[] = [
    {
      id: '1',
      carrier_id: 'CAR-001',
      name: 'BlueDart Express',
      carrier_type: 'courier',
      contact_person: 'Rajesh Kumar',
      contact_number: '+91-1800-233-1234',
      email: 'support@bluedart.com',
      address: 'Mumbai, Maharashtra - 400001',
      on_time_percentage: 94.5,
      average_cost_per_shipment: 850,
      total_shipments: 1250,
      active_shipments: 45,
      rating: 4.5,
      established_date: '2020-01-15',
      service_areas: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'],
      status: 'active',
      contract_type: 'Long-term',
      insurance_coverage: 1000000,
      notes: 'Premium courier service with excellent track record',
      last_shipment_date: '2025-01-17'
    },
    {
      id: '2',
      carrier_id: 'CAR-002',
      name: 'DTDC Courier',
      carrier_type: 'courier',
      contact_person: 'Priya Sharma',
      contact_number: '+91-1860-208-8208',
      email: 'info@dtdc.com',
      address: 'Delhi, NCR - 110001',
      on_time_percentage: 88.2,
      average_cost_per_shipment: 720,
      total_shipments: 980,
      active_shipments: 32,
      rating: 4.0,
      established_date: '2019-06-20',
      service_areas: ['Delhi', 'Pune', 'Ahmedabad', 'Jaipur'],
      status: 'active',
      contract_type: 'Short-term',
      insurance_coverage: 750000,
      notes: 'Cost-effective courier option',
      last_shipment_date: '2025-01-16'
    },
    {
      id: '3',
      carrier_id: 'CAR-003',
      name: 'Delhivery',
      carrier_type: 'freight',
      contact_person: 'Amit Patel',
      contact_number: '+91-124-4643-000',
      email: 'business@delhivery.com',
      address: 'Gurgaon, Haryana - 122001',
      on_time_percentage: 91.8,
      average_cost_per_shipment: 1200,
      total_shipments: 1580,
      active_shipments: 58,
      rating: 4.8,
      established_date: '2018-03-10',
      service_areas: ['All India', 'Pan India Network'],
      status: 'active',
      contract_type: 'Long-term',
      insurance_coverage: 2000000,
      notes: 'Reliable freight and logistics partner',
      last_shipment_date: '2025-01-17'
    },
    {
      id: '4',
      carrier_id: 'CAR-004',
      name: 'FedEx India',
      carrier_type: 'air',
      contact_person: 'Sarah Johnson',
      contact_number: '+91-1800-103-9000',
      email: 'customercare@fedex.com',
      address: 'Bangalore, Karnataka - 560001',
      on_time_percentage: 96.3,
      average_cost_per_shipment: 2500,
      total_shipments: 650,
      active_shipments: 28,
      rating: 5.0,
      established_date: '2017-11-05',
      service_areas: ['International', 'Major Cities', 'Express Service'],
      status: 'active',
      contract_type: 'Per-shipment',
      insurance_coverage: 5000000,
      notes: 'Premium international and domestic air freight',
      last_shipment_date: '2025-01-17'
    },
    {
      id: '5',
      carrier_id: 'CAR-005',
      name: 'Gati-KWE',
      carrier_type: 'freight',
      contact_person: 'Vikram Singh',
      contact_number: '+91-1800-180-4284',
      email: 'support@gati.com',
      address: 'Hyderabad, Telangana - 500001',
      on_time_percentage: 85.7,
      average_cost_per_shipment: 950,
      total_shipments: 820,
      active_shipments: 22,
      rating: 3.8,
      established_date: '2020-08-12',
      service_areas: ['South India', 'East India', 'Heavy Freight'],
      status: 'active',
      contract_type: 'Short-term',
      insurance_coverage: 1500000,
      notes: 'Specialized in heavy freight',
      last_shipment_date: '2025-01-15'
    },
    {
      id: '6',
      carrier_id: 'CAR-006',
      name: 'Indian Railways Logistics',
      carrier_type: 'rail',
      contact_person: 'Manoj Kumar',
      contact_number: '+91-1800-111-321',
      email: 'cargo@indianrail.gov.in',
      address: 'New Delhi - 110001',
      on_time_percentage: 78.5,
      average_cost_per_shipment: 450,
      total_shipments: 2100,
      active_shipments: 65,
      rating: 3.5,
      established_date: '2015-01-01',
      service_areas: ['All India - Rail Network', 'Bulk Shipments'],
      status: 'active',
      contract_type: 'Long-term',
      insurance_coverage: 800000,
      notes: 'Most economical for bulk shipments',
      last_shipment_date: '2025-01-16'
    },
    {
      id: '7',
      carrier_id: 'CAR-007',
      name: 'DHL Express',
      carrier_type: 'air',
      contact_person: 'Michael Brown',
      contact_number: '+91-1800-111-345',
      email: 'india@dhl.com',
      address: 'Mumbai, Maharashtra - 400002',
      on_time_percentage: 97.2,
      average_cost_per_shipment: 3200,
      total_shipments: 420,
      active_shipments: 18,
      rating: 4.9,
      established_date: '2016-05-20',
      service_areas: ['International', 'Express Delivery', 'Door-to-Door'],
      status: 'active',
      contract_type: 'Per-shipment',
      insurance_coverage: 6000000,
      notes: 'Premium international express service',
      last_shipment_date: '2025-01-17'
    },
    {
      id: '8',
      carrier_id: 'CAR-008',
      name: 'VRL Logistics',
      carrier_type: 'freight',
      contact_person: 'Suresh Rao',
      contact_number: '+91-831-2444444',
      email: 'care@vrllogistics.com',
      address: 'Belgaum, Karnataka - 590001',
      on_time_percentage: 82.4,
      average_cost_per_shipment: 680,
      total_shipments: 1150,
      active_shipments: 38,
      rating: 3.9,
      established_date: '2019-02-15',
      service_areas: ['South India', 'West India', 'Surface Transport'],
      status: 'active',
      contract_type: 'Short-term',
      insurance_coverage: 1200000,
      notes: 'Reliable surface transport solutions',
      last_shipment_date: '2025-01-14'
    },
    {
      id: '9',
      carrier_id: 'CAR-009',
      name: 'Safexpress',
      carrier_type: 'freight',
      contact_person: 'Anita Verma',
      contact_number: '+91-1800-103-5959',
      email: 'support@safexpress.com',
      address: 'Delhi, NCR - 110020',
      on_time_percentage: 89.6,
      average_cost_per_shipment: 1050,
      total_shipments: 890,
      active_shipments: 35,
      rating: 4.2,
      established_date: '2018-09-10',
      service_areas: ['North India', 'Central India', 'Express Cargo'],
      status: 'active',
      contract_type: 'Long-term',
      insurance_coverage: 1800000,
      notes: 'Fast and secure freight forwarding',
      last_shipment_date: '2025-01-16'
    },
    {
      id: '10',
      carrier_id: 'CAR-010',
      name: 'XpressBees',
      carrier_type: 'courier',
      contact_person: 'Rohit Mehta',
      contact_number: '+91-1800-208-4000',
      email: 'support@xpressbees.com',
      address: 'Pune, Maharashtra - 411001',
      on_time_percentage: 86.3,
      average_cost_per_shipment: 590,
      total_shipments: 760,
      active_shipments: 29,
      rating: 4.1,
      established_date: '2020-11-25',
      service_areas: ['Maharashtra', 'Gujarat', 'E-commerce Logistics'],
      status: 'suspended',
      contract_type: 'Short-term',
      insurance_coverage: 500000,
      notes: 'Under review - service quality issues',
      last_shipment_date: '2025-01-10'
    }
  ];

  // Calculate stats
  const stats = {
    activeCarriers: carriers.filter(c => c.status === 'active').length,
    avgOnTimeRate: (carriers.filter(c => c.status === 'active').reduce((sum, c) => sum + c.on_time_percentage, 0) / carriers.filter(c => c.status === 'active').length).toFixed(1),
    totalShipments: carriers.reduce((sum, c) => sum + c.total_shipments, 0),
    avgCostPerShipment: Math.round(carriers.reduce((sum, c) => sum + c.average_cost_per_shipment, 0) / carriers.length),
    activeShipments: carriers.reduce((sum, c) => sum + c.active_shipments, 0),
    topRated: carriers.filter(c => c.rating >= 4.5).length
  };

  // Filter carriers
  const filteredCarriers = carriers.filter(carrier => {
    const matchesSearch =
      carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.carrier_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || carrier.carrier_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || carrier.status === statusFilter;
    const matchesRating = ratingFilter === 'all' ||
      (ratingFilter === '5' && carrier.rating === 5) ||
      (ratingFilter === '4' && carrier.rating >= 4 && carrier.rating < 5) ||
      (ratingFilter === '3' && carrier.rating >= 3 && carrier.rating < 4);

    return matchesSearch && matchesType && matchesRating && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCarriers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCarriers = filteredCarriers.slice(startIndex, startIndex + itemsPerPage);

  // Handler Functions
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Carrier data refreshed successfully!\n\nIn production, this would:\n- Fetch latest carrier data from the server\n- Update performance metrics and shipment counts\n- Refresh contract and rate information\n- Sync carrier status updates\n- Update on-time delivery statistics');
    } catch (error) {
      alert('Error refreshing carrier data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddCarrier = () => {
    setIsAdding(true);
    setTimeout(() => {
      alert('Add New Carrier Form\n\nIn production, this would:\n- Open a modal or navigate to a form page\n- Collect carrier information:\n  * Carrier name and type (courier/freight/air/sea/rail)\n  * Contact details (person, phone, email)\n  * Address and service areas\n  * Contract type and terms\n  * Insurance coverage details\n  * Rate structure and pricing\n  * Performance SLAs and expectations\n- Validate carrier information\n- Register the new carrier in the system\n- Send onboarding emails and documentation');
      setIsAdding(false);
    }, 500);
  };

  const handleExportCarriers = () => {
    setIsExporting(true);
    try {
      // Prepare CSV content with comprehensive carrier data
      const csvHeaders = [
        'Carrier ID',
        'Name',
        'Type',
        'Contact Person',
        'Contact Number',
        'Email',
        'Address',
        'Service Areas',
        'On-Time Percentage',
        'Average Cost per Shipment',
        'Total Shipments',
        'Active Shipments',
        'Rating',
        'Established Date',
        'Last Shipment Date',
        'Status',
        'Contract Type',
        'Insurance Coverage',
        'Notes'
      ].join(',');

      const csvRows = filteredCarriers.map(carrier =>
        [
          carrier.carrier_id,
          `"${carrier.name}"`,
          carrier.carrier_type,
          `"${carrier.contact_person}"`,
          carrier.contact_number,
          carrier.email,
          `"${carrier.address}"`,
          `"${carrier.service_areas.join('; ')}"`,
          carrier.on_time_percentage,
          carrier.average_cost_per_shipment,
          carrier.total_shipments,
          carrier.active_shipments,
          carrier.rating,
          carrier.established_date,
          carrier.last_shipment_date,
          carrier.status,
          carrier.contract_type,
          carrier.insurance_coverage,
          `"${carrier.notes}"`
        ].join(',')
      );

      const csvContent = [csvHeaders, ...csvRows].join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `carriers_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(`Successfully exported ${filteredCarriers.length} carriers to CSV!\n\nThe export includes:\n- Complete carrier details and contact information\n- Performance metrics and shipment statistics\n- Contract terms and insurance coverage\n- Service areas and ratings\n- Status and operational notes\n\nFile: carriers_export_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      alert('Error exporting carriers. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewCarrier = (carrier: Carrier) => {
    alert(`View Carrier Details\n\nCarrier: ${carrier.name} (${carrier.carrier_id})\nType: ${carrier.carrier_type.toUpperCase()}\nStatus: ${carrier.status.toUpperCase()}\n\nIn production, this would:\n- Navigate to carrier detail page at /logistics/carriers/${carrier.id}\n- Display comprehensive carrier information:\n  * Contact details and communication history\n  * Performance metrics and trends\n  * Complete shipment history\n  * Contract terms and rate schedules\n  * Service areas and coverage maps\n  * Quality ratings and reviews\n  * Insurance and compliance documents\n  * Recent activity and communications\n- Show performance charts and analytics\n- Display contract renewal dates and terms`);
  };

  const handleEditCarrier = (carrier: Carrier) => {
    alert(`Edit Carrier: ${carrier.name}\n\nIn production, this would:\n- Navigate to edit form at /logistics/carriers/${carrier.id}/edit\n- Pre-populate form with current carrier data:\n  * Basic info (name, type, contact details)\n  * Address and service areas\n  * Contract terms and rates\n  * Insurance coverage\n  * Performance targets and SLAs\n  * Notes and special instructions\n- Allow updating carrier information\n- Validate changes before saving\n- Update carrier records in the database\n- Send notifications about changes\n- Log audit trail of modifications`);
  };

  const handleDeleteCarrier = (carrier: Carrier) => {
    const confirmDelete = window.confirm(
      `Delete Carrier: ${carrier.name}?\n\n` +
      `Carrier ID: ${carrier.carrier_id}\n` +
      `Type: ${carrier.carrier_type}\n` +
      `Total Shipments: ${carrier.total_shipments}\n` +
      `Active Shipments: ${carrier.active_shipments}\n\n` +
      `WARNING: This action cannot be undone!\n\n` +
      `In production, this would:\n` +
      `- Check for active shipments and dependencies\n` +
      `- Require confirmation from authorized personnel\n` +
      `- Archive carrier data for historical records\n` +
      `- Reassign active shipments if necessary\n` +
      `- Update related contracts and agreements\n` +
      `- Notify relevant stakeholders\n` +
      `- Maintain audit trail\n\n` +
      `Do you want to proceed with deletion?`
    );

    if (confirmDelete) {
      if (carrier.active_shipments > 0) {
        alert(`Cannot Delete Carrier!\n\nCarrier ${carrier.name} has ${carrier.active_shipments} active shipments.\n\nPlease:\n1. Complete or reassign all active shipments\n2. Resolve pending deliveries\n3. Close out active contracts\n4. Then retry deletion\n\nAlternatively, you can suspend the carrier instead of deleting.`);
      } else {
        alert(`Carrier Deleted Successfully!\n\nCarrier ${carrier.name} (${carrier.carrier_id}) has been removed from the system.\n\nIn production:\n- Carrier data would be archived\n- Historical shipment records preserved\n- Contracts marked as terminated\n- Stakeholders notified\n- Audit log updated`);
      }
    }
  };

  // Rating stars component
  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  // Type badge component
  const TypeBadge = ({ type }: { type: Carrier['carrier_type'] }) => {
    const config = {
      courier: { icon: Package, color: 'blue', label: 'Courier' },
      freight: { icon: Truck, color: 'green', label: 'Freight' },
      air: { icon: Plane, color: 'purple', label: 'Air' },
      sea: { icon: Ship, color: 'cyan', label: 'Sea' },
      rail: { icon: Train, color: 'orange', label: 'Rail' }
    };

    const { icon: Icon, color, label } = config[type];

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800 border border-${color}-200`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: Carrier['status'] }) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      suspended: 'bg-red-100 text-red-800 border-red-200'
    };

    const icons = {
      active: CheckCircle,
      inactive: Clock,
      suspended: AlertCircle
    };

    const Icon = icons[status];

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        <Icon className="w-3 h-3" />
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logistics Carriers Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage carrier partners, performance metrics, and service agreements</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleAddCarrier}
            disabled={isAdding}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {isAdding ? 'Adding...' : 'Add Carrier'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        <div className="bg-white rounded-lg shadow p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Carriers</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.activeCarriers}</p>
              <p className="text-xs text-gray-500 mt-1">Out of {carriers.length} total</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On-Time Delivery Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.avgOnTimeRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Average across all carriers</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Shipments</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalShipments.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">All-time total</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Cost per Shipment</p>
              <p className="text-xl font-bold text-orange-900 mt-1">Rs.{stats.avgCostPerShipment}</p>
            </div>
            <DollarSign className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-3 border border-cyan-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-600">Active Shipments</p>
              <p className="text-xl font-bold text-cyan-900 mt-1">{stats.activeShipments}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-cyan-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Top-Rated Carriers</p>
              <p className="text-xl font-bold text-yellow-900 mt-1">{stats.topRated}</p>
            </div>
            <Award className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search carriers by name, ID, contact person, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Types</option>
                <option value="courier">Courier</option>
                <option value="freight">Freight</option>
                <option value="air">Air</option>
                <option value="sea">Sea</option>
                <option value="rail">Rail</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <CheckCircle className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div className="relative">
              <Star className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportCarriers}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carrier Details
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shipments
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Cost
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contract
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCarriers.map((carrier) => (
                <tr key={carrier.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{carrier.name}</div>
                        <div className="text-xs text-gray-500">{carrier.carrier_id}</div>
                        <div className="text-xs text-gray-400">{carrier.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <TypeBadge type={carrier.carrier_type} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-900">{carrier.contact_person}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{carrier.contact_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">{carrier.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        carrier.on_time_percentage >= 90 ? 'bg-green-500' :
                        carrier.on_time_percentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{carrier.on_time_percentage}%</div>
                        <div className="text-xs text-gray-500">On-time</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{carrier.total_shipments}</div>
                      <div className="text-xs text-gray-500">Total</div>
                      <div className="text-xs text-blue-600">{carrier.active_shipments} active</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-900">Rs.{carrier.average_cost_per_shipment}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <RatingStars rating={carrier.rating} />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div>
                      <div className="text-xs text-gray-900">{carrier.contract_type}</div>
                      <div className="text-xs text-gray-500">Since {carrier.established_date}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <StatusBadge status={carrier.status} />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewCarrier(carrier)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="View Carrier Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleEditCarrier(carrier)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Edit Carrier"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteCarrier(carrier)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Delete Carrier"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCarriers.length)} of {filteredCarriers.length} carriers
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
