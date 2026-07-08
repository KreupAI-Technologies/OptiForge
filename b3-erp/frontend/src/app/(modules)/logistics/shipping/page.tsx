'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  Building,
  Weight,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  FileText,
  Phone,
  Mail,
  Navigation,
  BoxSelect,
  Archive,
  X,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { shipmentService, Shipment, CreateShipmentDto } from '@/services/shipment.service';

// ShipmentOrder Interface for UI display
interface ShipmentOrder {
  id: string;
  shipment_id: string;
  order_number: string;
  customer_name: string;
  customer_contact: string;
  customer_email: string;
  origin: string;
  destination: string;
  carrier_name: string;
  carrier_contact: string;
  shipped_date: string;
  expected_delivery: string;
  actual_delivery?: string;
  weight_kg: number;
  dimensions: string;
  tracking_number: string;
  status: 'pending' | 'picked' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
  shipping_cost: number;
  insurance_value: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
  payment_method: string;
  created_by: string;
}

// Helper function to map service shipment to UI format
const mapServiceShipmentToUI = (shipment: Shipment): ShipmentOrder => {
  const statusMap: Record<Shipment['status'], ShipmentOrder['status']> = {
    'Draft': 'pending',
    'Pending': 'pending',
    'Dispatched': 'picked',
    'In Transit': 'in_transit',
    'Delivered': 'delivered',
    'Cancelled': 'cancelled',
    'Returned': 'delayed'
  };

  const priorityMap: Record<Shipment['priority'], ShipmentOrder['priority']> = {
    'Low': 'low',
    'Normal': 'medium',
    'High': 'high',
    'Urgent': 'urgent'
  };

  return {
    id: shipment.id,
    shipment_id: shipment.shipmentNumber,
    order_number: shipment.orderNumber || shipment.shipmentNumber,
    customer_name: shipment.customerName,
    customer_contact: '+91-9876543210',
    customer_email: `contact@${shipment.customerName.toLowerCase().replace(/\s+/g, '')}.com`,
    origin: 'Mumbai, Maharashtra',
    destination: `${shipment.city}, ${shipment.state}`,
    carrier_name: shipment.carrierName || 'Not Assigned',
    carrier_contact: '+91-1800-123-4567',
    shipped_date: shipment.shipmentDate,
    expected_delivery: shipment.expectedDeliveryDate,
    actual_delivery: shipment.actualDeliveryDate,
    weight_kg: shipment.totalWeight,
    dimensions: `${Math.round(shipment.totalVolume || 1 * 30)}x${Math.round((shipment.totalVolume || 1) * 20)}x${Math.round((shipment.totalVolume || 1) * 15)} cm`,
    tracking_number: shipment.trackingNumber || `TRK${shipment.id.replace(/\D/g, '')}`,
    status: statusMap[shipment.status] || 'pending',
    shipping_cost: shipment.shippingCost || 0,
    insurance_value: (shipment.shippingCost || 0) * 10,
    priority: priorityMap[shipment.priority] || 'medium',
    notes: shipment.notes || '',
    payment_method: 'Credit',
    created_by: 'System'
  };
};

export default function LogisticsShippingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentOrder | null>(null);
  const [updateFormData, setUpdateFormData] = useState({
    status: '' as ShipmentOrder['status'],
    notes: ''
  });
  const [createFormData, setCreateFormData] = useState({
    order_number: '',
    customer_name: '',
    customer_contact: '',
    customer_email: '',
    origin: '',
    destination: '',
    carrier_name: '',
    carrier_contact: '',
    shipped_date: new Date().toISOString().split('T')[0],
    expected_delivery: '',
    weight_kg: 0,
    dimensions: '',
    shipping_cost: 0,
    insurance_value: 0,
    priority: 'medium' as ShipmentOrder['priority'],
    payment_method: 'prepaid',
    notes: ''
  });

  // State for shipment orders loaded from service
  const [shipmentOrders, setShipmentOrders] = useState<ShipmentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reloadShipments = async () => {
    const { data: shipments } = await shipmentService.getAllShipments();
    setShipmentOrders(shipments.map(mapServiceShipmentToUI));
  };

  // Load shipments from service
  useEffect(() => {
    const loadShipments = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const { data: shipments } = await shipmentService.getAllShipments();
        const mappedShipments = shipments.map(mapServiceShipmentToUI);
        setShipmentOrders(mappedShipments);
      } catch (error) {
        console.error('Error loading shipments:', error);
        setLoadError('Failed to load shipments. Please try again.');
        toast({
          title: "Error",
          description: "Failed to load shipments. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadShipments();
  }, []);

  // Calculate stats
  const stats = {
    pending: shipmentOrders.filter(s => s.status === 'pending').length,
    inTransit: shipmentOrders.filter(s => s.status === 'in_transit').length,
    deliveredToday: shipmentOrders.filter(s =>
      s.status === 'delivered' && s.actual_delivery === '2025-01-17'
    ).length,
    delayed: shipmentOrders.filter(s => s.status === 'delayed').length,
    totalShipments: shipmentOrders.length,
    totalValue: shipmentOrders.reduce((sum, s) => sum + s.shipping_cost, 0),
    avgWeight: (shipmentOrders.reduce((sum, s) => sum + s.weight_kg, 0) / shipmentOrders.length).toFixed(1)
  };

  // Get unique destinations for filter
  const destinations = Array.from(new Set(shipmentOrders.map(s => s.destination)));

  // Filter shipments
  const filteredShipments = shipmentOrders.filter(shipment => {
    const matchesSearch =
      shipment.shipment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.tracking_number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    const matchesDestination = destinationFilter === 'all' || shipment.destination === destinationFilter;
    const matchesPriority = priorityFilter === 'all' || shipment.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesDestination && matchesPriority;
  });

  // Pagination
  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShipments = filteredShipments.slice(startIndex, startIndex + itemsPerPage);

  // Status badge component
  const StatusBadge = ({ status }: { status: ShipmentOrder['status'] }) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      picked: 'bg-blue-100 text-blue-800 border-blue-200',
      in_transit: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      delayed: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const icons = {
      pending: Clock,
      picked: Package,
      in_transit: Truck,
      delivered: CheckCircle,
      delayed: AlertCircle,
      cancelled: AlertCircle
    };

    const Icon = icons[status];

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  // Priority badge component
  const PriorityBadge = ({ priority }: { priority: ShipmentOrder['priority'] }) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800 border-gray-200',
      medium: 'bg-blue-100 text-blue-800 border-blue-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const handleCreateShipment = () => {
    setShowCreateModal(true);
  };

  const resetCreateForm = () => {
    setCreateFormData({
      order_number: '',
      customer_name: '',
      customer_contact: '',
      customer_email: '',
      origin: '',
      destination: '',
      carrier_name: '',
      carrier_contact: '',
      shipped_date: new Date().toISOString().split('T')[0],
      expected_delivery: '',
      weight_kg: 0,
      dimensions: '',
      shipping_cost: 0,
      insurance_value: 0,
      priority: 'medium',
      payment_method: 'prepaid',
      notes: ''
    });
  };

  // Map UI priority back to the service priority enum
  const toServicePriority = (p: ShipmentOrder['priority']): Shipment['priority'] => {
    switch (p) {
      case 'low': return 'Low';
      case 'high': return 'High';
      case 'urgent': return 'Urgent';
      default: return 'Normal';
    }
  };

  const handleSubmitCreate = async () => {
    // Parse "City, State" destination into the DTO fields
    const [destCity = '', destState = ''] = createFormData.destination.split(',').map(s => s.trim());
    const payload: CreateShipmentDto = {
      customerId: '',
      customerName: createFormData.customer_name,
      deliveryAddress: createFormData.destination,
      city: destCity,
      state: destState,
      postalCode: '',
      country: 'India',
      expectedDeliveryDate: createFormData.expected_delivery,
      priority: toServicePriority(createFormData.priority),
      items: [
        {
          productId: '',
          productCode: createFormData.order_number || 'SHIP-ITEM',
          productName: createFormData.order_number || 'Shipment',
          quantity: 1,
          uom: 'PCS',
          weight: Number(createFormData.weight_kg) || 0,
        },
      ],
      notes: createFormData.notes || undefined,
    };

    setIsSubmitting(true);
    try {
      await shipmentService.createShipment(payload);
      toast({
        title: "Shipment Created",
        description: `New shipment for ${createFormData.customer_name || 'customer'} has been created successfully.`,
        variant: "success"
      });
      setShowCreateModal(false);
      resetCreateForm();
      await reloadShipments();
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast({ title: "Error", description: "Failed to create shipment. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (shipment: ShipmentOrder) => {
    setSelectedShipment(shipment);
    setShowDetailsModal(true);
  };

  const handleTrackShipment = (shipment: ShipmentOrder) => {
    setSelectedShipment(shipment);
    setShowTrackModal(true);
  };

  const handleUpdateStatus = (shipment: ShipmentOrder) => {
    setSelectedShipment(shipment);
    setUpdateFormData({
      status: shipment.status,
      notes: ''
    });
    setShowUpdateModal(true);
  };

  const handleExport = () => {
    if (filteredShipments.length === 0) {
      toast({ title: "Nothing to export", description: "No shipments match the current filters." });
      return;
    }
    const headers = [
      'Shipment ID', 'Order Number', 'Customer', 'Origin', 'Destination',
      'Carrier', 'Shipped Date', 'Expected Delivery', 'Actual Delivery',
      'Weight (kg)', 'Tracking Number', 'Status', 'Priority', 'Shipping Cost', 'Payment Method'
    ];
    const rows = filteredShipments.map(s => [
      s.shipment_id, s.order_number, s.customer_name, s.origin, s.destination,
      s.carrier_name, s.shipped_date, s.expected_delivery, s.actual_delivery || 'N/A',
      s.weight_kg, s.tracking_number, s.status, s.priority, s.shipping_cost, s.payment_method
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v ?? '')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shipments_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Export complete", description: `${filteredShipments.length} shipments exported to CSV.`, variant: "success" });
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await reloadShipments();
      toast({
        title: "Data Refreshed",
        description: "Shipment data has been updated."
      });
    } catch (error) {
      console.error('Error refreshing shipments:', error);
      toast({
        title: "Error",
        description: "Failed to refresh shipments.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (shipment: ShipmentOrder) => {
    if (!confirm(`Are you sure you want to delete shipment ${shipment.shipment_id}?`)) return;
    setIsSubmitting(true);
    try {
      await shipmentService.deleteShipment(shipment.id);
      toast({
        title: "Shipment Deleted",
        description: `Shipment ${shipment.shipment_id} has been deleted.`,
        variant: "success"
      });
      await reloadShipments();
    } catch (error) {
      console.error('Error deleting shipment:', error);
      toast({ title: "Error", description: "Failed to delete shipment.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;
    setIsSubmitting(true);
    try {
      const target = updateFormData.status;
      if (target === 'picked') {
        // "Picked" maps to Dispatched in the service model
        await shipmentService.dispatchShipment(selectedShipment.id);
      } else if (target === 'delivered') {
        await shipmentService.deliverShipment(selectedShipment.id);
      } else {
        const serviceStatusMap: Record<ShipmentOrder['status'], Shipment['status']> = {
          pending: 'Pending',
          picked: 'Dispatched',
          in_transit: 'In Transit',
          delivered: 'Delivered',
          delayed: 'Returned',
          cancelled: 'Cancelled',
        };
        await shipmentService.updateShipment(selectedShipment.id, {
          status: serviceStatusMap[target],
          notes: updateFormData.notes || undefined,
        });
      }
      toast({
        title: "Status Updated",
        description: `Shipment ${selectedShipment.shipment_id} status updated to ${updateFormData.status}.`,
        variant: "success"
      });
      setShowUpdateModal(false);
      await reloadShipments();
    } catch (error) {
      console.error('Error updating shipment status:', error);
      toast({ title: "Error", description: "Failed to update shipment status.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logistics Shipping Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track all shipment orders across your supply chain</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={handleCreateShipment}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Shipment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="bg-white rounded-lg shadow p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Shipments</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pending}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting pickup</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.inTransit}</p>
              <p className="text-xs text-gray-500 mt-1">On the way</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.deliveredToday}</p>
              <p className="text-xs text-gray-500 mt-1">Completed</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delayed</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.delayed}</p>
              <p className="text-xs text-gray-500 mt-1">Needs attention</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Shipments</p>
              <p className="text-xl font-bold text-blue-900 mt-1">{stats.totalShipments}</p>
            </div>
            <Archive className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Shipping Value</p>
              <p className="text-xl font-bold text-green-900 mt-1">Rs.{stats.totalValue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Weight</p>
              <p className="text-xl font-bold text-orange-900 mt-1">{stats.avgWeight} kg</p>
            </div>
            <Weight className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search shipments by ID, order, customer, tracking..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="picked">Picked</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="delayed">Delayed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className="relative">
              <BoxSelect className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shipment Details
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Carrier
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight & Dimensions
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                      <span className="text-gray-500">Loading shipments...</span>
                    </div>
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                      <span className="text-red-500">{loadError}</span>
                      <button
                        onClick={handleRefresh}
                        className="mt-2 text-blue-600 hover:text-blue-700"
                      >
                        Try again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : paginatedShipments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-gray-500">No shipments found</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{shipment.shipment_id}</div>
                        <div className="text-xs text-gray-500">Order: {shipment.order_number}</div>
                        <div className="text-xs text-gray-400">Track: {shipment.tracking_number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900">{shipment.customer_name}</div>
                        <div className="text-xs text-gray-500">{shipment.customer_contact}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-start gap-2">
                      <Navigation className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-xs text-gray-600">From: {shipment.origin}</div>
                        <div className="text-xs text-blue-600">To: {shipment.destination}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900">{shipment.carrier_name}</div>
                        <div className="text-xs text-gray-500">{shipment.carrier_contact}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        Shipped: {shipment.shipped_date}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Clock className="w-3 h-3" />
                        Expected: {shipment.expected_delivery}
                      </div>
                      {shipment.actual_delivery && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Delivered: {shipment.actual_delivery}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Weight className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900">{shipment.weight_kg} kg</div>
                        <div className="text-xs text-gray-500">{shipment.dimensions}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <PriorityBadge priority={shipment.priority} />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <StatusBadge status={shipment.status} />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Rs.{shipment.shipping_cost}</div>
                        <div className="text-xs text-gray-500">{shipment.payment_method}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(shipment)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleTrackShipment(shipment)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Track Shipment"
                      >
                        <Navigation className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(shipment)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Update Status"
                      >
                        <Edit2 className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(shipment)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete"
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
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredShipments.length)} of {filteredShipments.length} shipments
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

      {/* View Details Modal */}
      {showDetailsModal && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full  max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-3 py-2 flex items-center justify-between rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <Package className="h-6 w-6" />
                <h2 className="text-xl font-bold">Shipment Details</h2>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Header */}
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedShipment.shipment_id}</h3>
                  <p className="text-gray-600">Order: {selectedShipment.order_number}</p>
                  <p className="text-sm text-gray-500 mt-1">Tracking: {selectedShipment.tracking_number}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={selectedShipment.status} />
                  <div className="mt-2">
                    <PriorityBadge priority={selectedShipment.priority} />
                  </div>
                </div>
              </div>

              {/* Customer & Carrier Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Customer Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-blue-600">Customer Name</p>
                      <p className="font-medium text-blue-900">{selectedShipment.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Contact</p>
                      <p className="font-medium text-blue-900 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedShipment.customer_contact}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Email</p>
                      <p className="font-medium text-blue-900 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedShipment.customer_email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-5 border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-purple-600" />
                    Carrier Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-purple-600">Carrier Name</p>
                      <p className="font-medium text-purple-900">{selectedShipment.carrier_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-600">Contact</p>
                      <p className="font-medium text-purple-900 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedShipment.carrier_contact}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div className="mb-3 bg-green-50 rounded-lg p-5 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-green-600" />
                  Shipping Route
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-green-600">Origin</p>
                    <p className="font-medium text-green-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedShipment.origin}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600">Destination</p>
                    <p className="font-medium text-green-900 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedShipment.destination}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="mb-3 bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  Timeline
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Shipped Date</p>
                    <p className="font-medium text-gray-900">{selectedShipment.shipped_date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Expected Delivery</p>
                    <p className="font-medium text-blue-700">{selectedShipment.expected_delivery}</p>
                  </div>
                  {selectedShipment.actual_delivery && (
                    <div>
                      <p className="text-xs text-gray-500">Actual Delivery</p>
                      <p className="font-medium text-green-700">{selectedShipment.actual_delivery}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipment Details */}
              <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <div className="flex items-center gap-3">
                    <Weight className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="text-xs text-orange-600">Weight</p>
                      <p className="text-xl font-bold text-orange-900">{selectedShipment.weight_kg} kg</p>
                    </div>
                  </div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                  <div className="flex items-center gap-3">
                    <BoxSelect className="h-8 w-8 text-indigo-600" />
                    <div>
                      <p className="text-xs text-indigo-600">Dimensions</p>
                      <p className="text-sm font-bold text-indigo-900">{selectedShipment.dimensions}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-xs text-green-600">Shipping Cost</p>
                      <p className="text-xl font-bold text-green-900">Rs.{selectedShipment.shipping_cost.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insurance & Payment */}
              <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <p className="text-sm text-yellow-700 mb-2">Insurance Value</p>
                  <p className="text-2xl font-bold text-yellow-900">Rs.{selectedShipment.insurance_value.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-sm text-gray-700 mb-2">Payment Method</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedShipment.payment_method}</p>
                </div>
              </div>

              {/* Notes */}
              {selectedShipment.notes && (
                <div className="mb-3 bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Notes
                  </h4>
                  <p className="text-sm text-blue-800">{selectedShipment.notes}</p>
                </div>
              )}

              {/* Created By */}
              <div className="mb-3 text-sm text-gray-600">
                Created by: <span className="font-medium text-gray-900">{selectedShipment.created_by}</span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleTrackShipment(selectedShipment)}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
                >
                  <Navigation className="h-5 w-5" />
                  Track Shipment
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Track Shipment Modal */}
      {showTrackModal && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2 flex items-center justify-between rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <Navigation className="h-6 w-6" />
                <h2 className="text-xl font-bold">Track Shipment</h2>
              </div>
              <button onClick={() => setShowTrackModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Shipment Info */}
              <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-bold text-purple-900 mb-2">{selectedShipment.shipment_id}</h3>
                <p className="text-sm text-purple-700">Tracking: {selectedShipment.tracking_number}</p>
                <p className="text-sm text-purple-700 mt-1">
                  {selectedShipment.origin} → {selectedShipment.destination}
                </p>
              </div>

              {/* Current Status */}
              <div className="mb-3 p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300">
                <p className="text-sm font-medium text-gray-700 mb-3">Current Status</p>
                <div className="flex items-center gap-3">
                  <StatusBadge status={selectedShipment.status} />
                  <div>
                    <p className="text-lg font-bold text-blue-900">
                      {selectedShipment.status.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-xs text-blue-700">
                      Expected delivery: {selectedShipment.expected_delivery}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="mb-3">
                <h4 className="font-semibold text-gray-900 mb-2">Tracking Timeline</h4>
                <div className="space-y-2">
                  {/* Timeline items - simulated based on status */}
                  <div className="flex gap-2">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${selectedShipment.status !== 'pending' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div className="w-0.5 h-12 bg-gray-300" />
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-semibold text-gray-900">Order Confirmed</p>
                      <p className="text-sm text-gray-600">{selectedShipment.shipped_date}</p>
                      <p className="text-xs text-gray-500">Shipment created and confirmed</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${selectedShipment.status === 'picked' || selectedShipment.status === 'in_transit' || selectedShipment.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div className="w-0.5 h-12 bg-gray-300" />
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-semibold text-gray-900">Picked Up</p>
                      <p className="text-sm text-gray-600">Carrier: {selectedShipment.carrier_name}</p>
                      <p className="text-xs text-gray-500">Package picked up from origin</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${selectedShipment.status === 'in_transit' || selectedShipment.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div className="w-0.5 h-12 bg-gray-300" />
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-semibold text-gray-900">In Transit</p>
                      <p className="text-sm text-gray-600">En route to destination</p>
                      <p className="text-xs text-gray-500">Package is on the way</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${selectedShipment.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Delivered</p>
                      <p className="text-sm text-gray-600">
                        {selectedShipment.actual_delivery ? selectedShipment.actual_delivery : 'Expected: ' + selectedShipment.expected_delivery}
                      </p>
                      <p className="text-xs text-gray-500">Package delivered to customer</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Carrier Info */}
              <div className="mb-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-gray-600" />
                  Carrier Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Carrier</p>
                    <p className="font-medium text-gray-900">{selectedShipment.carrier_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Contact</p>
                    <p className="font-medium text-gray-900">{selectedShipment.carrier_contact}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowTrackModal(false);
                    handleUpdateStatus(selectedShipment);
                  }}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
                >
                  Update Status
                </button>
                <button
                  onClick={() => setShowTrackModal(false)}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateModal && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 flex items-center justify-between rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <Edit2 className="h-6 w-6" />
                <h2 className="text-xl font-bold">Update Shipment Status</h2>
              </div>
              <button onClick={() => setShowUpdateModal(false)} className="text-white hover:bg-white/20 rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-900 mb-2">{selectedShipment.shipment_id}</h3>
                <p className="text-sm text-green-700">Order: {selectedShipment.order_number}</p>
                <p className="text-sm text-green-700">Customer: {selectedShipment.customer_name}</p>
              </div>

              <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 mb-2">Current Status</p>
                <StatusBadge status={selectedShipment.status} />
              </div>

              <form onSubmit={handleSubmitUpdate} className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={updateFormData.status}
                    onChange={(e) => setUpdateFormData({...updateFormData, status: e.target.value as ShipmentOrder['status']})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select new status</option>
                    <option value="pending">Pending</option>
                    <option value="picked">Picked</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Notes
                  </label>
                  <textarea
                    value={updateFormData.notes}
                    onChange={(e) => setUpdateFormData({...updateFormData, notes: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={4}
                    placeholder="Add any notes or remarks about this status update..."
                  />
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-900">Status Update</p>
                      <p className="text-xs text-green-800 mt-1">
                        This will update the shipment status and notify relevant parties about the change.
                        Customers will be able to track this update.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting ? 'Updating...' : 'Update Status'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUpdateModal(false)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Shipment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 flex items-center justify-between rounded-t-lg z-10">
              <div>
                <h2 className="text-xl font-bold">Create New Shipment</h2>
                <p className="text-sm text-blue-100 mt-1">Enter shipment details to create a new order</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3">
              {/* Customer Information */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createFormData.order_number}
                      onChange={(e) => setCreateFormData({...createFormData, order_number: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., ORD-10234"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createFormData.customer_name}
                      onChange={(e) => setCreateFormData({...createFormData, customer_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Tata Steel Ltd"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={createFormData.customer_contact}
                      onChange={(e) => setCreateFormData({...createFormData, customer_contact: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+91-9876543210"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={createFormData.customer_email}
                      onChange={(e) => setCreateFormData({...createFormData, customer_email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="customer@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Shipment Details */}
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Shipment Details
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Origin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createFormData.origin}
                      onChange={(e) => setCreateFormData({...createFormData, origin: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Mumbai, Maharashtra"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destination <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createFormData.destination}
                      onChange={(e) => setCreateFormData({...createFormData, destination: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Jamshedpur, Jharkhand"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={createFormData.weight_kg}
                      onChange={(e) => setCreateFormData({...createFormData, weight_kg: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 250.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dimensions (L x W x H) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createFormData.dimensions}
                      onChange={(e) => setCreateFormData({...createFormData, dimensions: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., 120x80x60 cm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={createFormData.priority}
                      onChange={(e) => setCreateFormData({...createFormData, priority: e.target.value as ShipmentOrder['priority']})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={createFormData.payment_method}
                      onChange={(e) => setCreateFormData({...createFormData, payment_method: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="prepaid">Prepaid</option>
                      <option value="cod">Cash on Delivery (COD)</option>
                      <option value="credit">Credit Account</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Carrier Information */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Carrier Information
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carrier Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createFormData.carrier_name}
                      onChange={(e) => setCreateFormData({...createFormData, carrier_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., BlueDart Express"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carrier Contact <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={createFormData.carrier_contact}
                      onChange={(e) => setCreateFormData({...createFormData, carrier_contact: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+91-1800-233-1234"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dates and Financial */}
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Dates & Financial Details
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipped Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={createFormData.shipped_date}
                      onChange={(e) => setCreateFormData({...createFormData, shipped_date: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Delivery <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={createFormData.expected_delivery}
                      onChange={(e) => setCreateFormData({...createFormData, expected_delivery: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping Cost (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={createFormData.shipping_cost}
                      onChange={(e) => setCreateFormData({...createFormData, shipping_cost: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., 12500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Insurance Value (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={createFormData.insurance_value}
                      onChange={(e) => setCreateFormData({...createFormData, insurance_value: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="e.g., 500000"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={createFormData.notes}
                  onChange={(e) => setCreateFormData({...createFormData, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter any special instructions or notes..."
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">Important Information</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• A tracking number will be automatically generated after creation</li>
                      <li>• Both customer and carrier will receive email notifications</li>
                      <li>• Ensure all contact information is accurate for smooth delivery</li>
                      <li>• Insurance value should reflect the actual value of goods being shipped</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-3 py-2 flex justify-end gap-3 rounded-b-lg border-t">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCreate}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
                {isSubmitting ? 'Creating...' : 'Create Shipment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
