'use client';

import { useState, useEffect, useCallback } from 'react';
import { LogisticsService } from '@/services/logistics.service';
import { toast } from '@/hooks/use-toast';
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
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

  // Carriers data (wired to NestJS transport-companies endpoint)
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Add / Edit modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const emptyForm = {
    name: '',
    carrier_type: 'freight' as Carrier['carrier_type'],
    contact_person: '',
    contact_number: '',
    email: '',
    address: '',
    contract_type: 'Per-shipment' as Carrier['contract_type'],
    status: 'active' as Carrier['status'],
    notes: '',
  };
  const [formData, setFormData] = useState(emptyForm);

  const loadCarriers = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await LogisticsService.getTransportCompanies();
      const list = Array.isArray(res) ? res : ((res as any)?.data ?? (res as any)?.items ?? []);
      const mapped: Carrier[] = (list as any[]).map((r, i) => ({
        id: String(r.id ?? r.transportCompanyId ?? i),
        carrier_id: r.carrierId ?? r.code ?? r.transportCompanyId ?? `CAR-${i + 1}`,
        name: r.name ?? r.companyName ?? 'Unknown Carrier',
        carrier_type: (r.carrierType ?? r.transportMode ?? r.type ?? 'freight') as Carrier['carrier_type'],
        contact_person: r.contactPerson ?? r.contactName ?? '',
        contact_number: r.contactNumber ?? r.phone ?? r.contactPhone ?? '',
        email: r.email ?? r.contactEmail ?? '',
        address: r.address ?? r.city ?? '',
        on_time_percentage: Number(r.onTimePercentage ?? r.onTimeRate ?? 0),
        average_cost_per_shipment: Number(r.averageCostPerShipment ?? r.avgCost ?? 0),
        total_shipments: Number(r.totalShipments ?? 0),
        active_shipments: Number(r.activeShipments ?? 0),
        rating: Number(r.rating ?? r.performanceRating ?? 0),
        established_date: r.establishedDate ?? r.createdAt ?? '',
        service_areas: Array.isArray(r.serviceAreas) ? r.serviceAreas : (r.serviceAreas ? [r.serviceAreas] : []),
        status: (r.status ?? (r.isActive === false ? 'inactive' : 'active')) as Carrier['status'],
        contract_type: (r.contractType ?? 'Per-shipment') as Carrier['contract_type'],
        insurance_coverage: Number(r.insuranceCoverage ?? 0),
        notes: r.notes ?? '',
        last_shipment_date: r.lastShipmentDate ?? '',
      }));
      setCarriers(mapped);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load carriers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadCarriers(); }, [loadCarriers]);

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
      await loadCarriers();
      toast({ title: 'Refreshed', description: 'Carrier data reloaded from the server.', variant: 'success' });
    } catch (error) {
      toast({ title: 'Refresh failed', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const openAddForm = () => {
    setEditingCarrier(null);
    setFormData(emptyForm);
    setFormOpen(true);
  };

  const openEditForm = (carrier: Carrier) => {
    setEditingCarrier(carrier);
    setFormData({
      name: carrier.name,
      carrier_type: carrier.carrier_type,
      contact_person: carrier.contact_person,
      contact_number: carrier.contact_number,
      email: carrier.email,
      address: carrier.address,
      contract_type: carrier.contract_type,
      status: carrier.status,
      notes: carrier.notes,
    });
    setFormOpen(true);
  };

  const handleSubmitCarrier = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Validation error', description: 'Carrier name is required.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    setIsAdding(true);
    const payload = {
      name: formData.name.trim(),
      carrierType: formData.carrier_type,
      transportMode: formData.carrier_type,
      contactPerson: formData.contact_person,
      contactNumber: formData.contact_number,
      email: formData.email,
      address: formData.address,
      contractType: formData.contract_type,
      status: formData.status,
      notes: formData.notes,
    };
    try {
      if (editingCarrier) {
        await LogisticsService.updateTransportCompany(editingCarrier.id, payload);
        toast({ title: 'Carrier updated', description: `${formData.name} was updated.`, variant: 'success' });
      } else {
        await LogisticsService.createTransportCompany(payload);
        toast({ title: 'Carrier added', description: `${formData.name} was registered.`, variant: 'success' });
      }
      setFormOpen(false);
      setEditingCarrier(null);
      await loadCarriers();
    } catch (error) {
      toast({ title: editingCarrier ? 'Update failed' : 'Create failed', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
      setIsAdding(false);
    }
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
      URL.revokeObjectURL(url);

      toast({ title: 'Export complete', description: `Exported ${filteredCarriers.length} carriers to CSV.`, variant: 'success' });
    } catch (error) {
      toast({ title: 'Export failed', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleEditCarrier = (carrier: Carrier) => {
    openEditForm(carrier);
  };

  const handleDeleteCarrier = async (carrier: Carrier) => {
    if (carrier.active_shipments > 0) {
      toast({
        title: 'Cannot delete carrier',
        description: `${carrier.name} has ${carrier.active_shipments} active shipment(s). Complete or reassign them first.`,
        variant: 'destructive',
      });
      return;
    }
    const confirmDelete = window.confirm(
      `Delete carrier "${carrier.name}" (${carrier.carrier_id})?\n\nThis action cannot be undone.`
    );
    if (!confirmDelete) return;

    setDeletingId(carrier.id);
    try {
      await LogisticsService.deleteTransportCompany(carrier.id);
      toast({ title: 'Carrier deleted', description: `${carrier.name} was removed.`, variant: 'success' });
      await loadCarriers();
    } catch (error) {
      toast({ title: 'Delete failed', description: error instanceof Error ? error.message : 'Please try again.', variant: 'destructive' });
    } finally {
      setDeletingId(null);
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
            onClick={openAddForm}
            disabled={isAdding}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {isAdding ? 'Saving...' : 'Add Carrier'}
          </button>
        </div>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {loadError}
        </div>
      )}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm">
          Loading carriers...
        </div>
      )}

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
                        onClick={() => handleEditCarrier(carrier)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Edit Carrier"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteCarrier(carrier)}
                        disabled={deletingId === carrier.id}
                        className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Add / Edit Carrier Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCarrier ? `Edit Carrier — ${editingCarrier.name}` : 'Add New Carrier'}
              </h2>
              <button onClick={() => setFormOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carrier Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.carrier_type}
                    onChange={(e) => setFormData({ ...formData, carrier_type: e.target.value as Carrier['carrier_type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="courier">Courier</option>
                    <option value="freight">Freight</option>
                    <option value="air">Air</option>
                    <option value="sea">Sea</option>
                    <option value="rail">Rail</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Carrier['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
                <select
                  value={formData.contract_type}
                  onChange={(e) => setFormData({ ...formData, contract_type: e.target.value as Carrier['contract_type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="Long-term">Long-term</option>
                  <option value="Short-term">Short-term</option>
                  <option value="Per-shipment">Per-shipment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setFormOpen(false)}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCarrier}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : editingCarrier ? 'Update Carrier' : 'Create Carrier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
