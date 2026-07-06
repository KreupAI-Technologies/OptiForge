'use client';

import React, { useState, useEffect } from 'react';
import {
  User, Plus, Search, Edit2, Trash2, CheckCircle2, Phone, CreditCard, Award,
  Eye, X, Calendar, Mail, MapPin, FileText, Download, Filter, TrendingUp,
  Users, AlertTriangle, Clock, Star
} from 'lucide-react';
import { fleetService, Driver as ApiDriver } from '@/services/fleet.service';

interface Driver {
  id: string;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  licenseNumber: string;
  licenseType: string;
  licenseExpiry: Date;
  experience: number;
  dateOfJoining: Date;
  dateOfBirth: Date;
  emergencyContact: string;
  bloodGroup: string;
  vehicleAssigned?: string;
  rating: number;
  totalTrips: number;
  status: 'Active' | 'Inactive' | 'On Leave' | 'Suspended';
}

const mockDrivers: Driver[] = [
  {
    id: '1',
    code: 'DRV-001',
    name: 'Rajesh Kumar',
    phone: '+91-9876543210',
    email: 'rajesh.kumar@example.com',
    address: 'A-123, Transport Nagar',
    city: 'Mumbai',
    state: 'Maharashtra',
    licenseNumber: 'MH0120210012345',
    licenseType: 'Heavy Vehicle',
    licenseExpiry: new Date('2026-12-31'),
    experience: 15,
    dateOfJoining: new Date('2015-03-15'),
    dateOfBirth: new Date('1980-05-20'),
    emergencyContact: '+91-9876543211',
    bloodGroup: 'B+',
    vehicleAssigned: 'MH-01-AB-1234',
    rating: 4.8,
    totalTrips: 1250,
    status: 'Active'
  },
  {
    id: '2',
    code: 'DRV-002',
    name: 'Amit Sharma',
    phone: '+91-9876543220',
    email: 'amit.sharma@example.com',
    address: 'B-456, Sector 15',
    city: 'Delhi',
    state: 'Delhi',
    licenseNumber: 'DL0120210067890',
    licenseType: 'Heavy Vehicle',
    licenseExpiry: new Date('2027-06-30'),
    experience: 12,
    dateOfJoining: new Date('2018-01-10'),
    dateOfBirth: new Date('1985-08-15'),
    emergencyContact: '+91-9876543221',
    bloodGroup: 'O+',
    vehicleAssigned: 'DL-01-CD-5678',
    rating: 4.5,
    totalTrips: 980,
    status: 'Active'
  },
  {
    id: '3',
    code: 'DRV-003',
    name: 'Pradeep Singh',
    phone: '+91-9876543230',
    email: 'pradeep.singh@example.com',
    address: 'C-789, Industrial Area',
    city: 'Bangalore',
    state: 'Karnataka',
    licenseNumber: 'KA0120210045678',
    licenseType: 'Light Commercial',
    licenseExpiry: new Date('2025-09-15'),
    experience: 8,
    dateOfJoining: new Date('2020-07-01'),
    dateOfBirth: new Date('1990-12-10'),
    emergencyContact: '+91-9876543231',
    bloodGroup: 'A+',
    vehicleAssigned: 'KA-01-EF-9012',
    rating: 4.7,
    totalTrips: 650,
    status: 'Active'
  },
  {
    id: '4',
    code: 'DRV-004',
    name: 'Suresh Patil',
    phone: '+91-9876543240',
    email: 'suresh.patil@example.com',
    address: 'D-321, Transport Hub',
    city: 'Pune',
    state: 'Maharashtra',
    licenseNumber: 'MH0120210098765',
    licenseType: 'Heavy Vehicle',
    licenseExpiry: new Date('2025-03-20'),
    experience: 20,
    dateOfJoining: new Date('2012-05-20'),
    dateOfBirth: new Date('1975-03-25'),
    emergencyContact: '+91-9876543241',
    bloodGroup: 'AB+',
    rating: 4.9,
    totalTrips: 1800,
    status: 'On Leave'
  },
  {
    id: '5',
    code: 'DRV-005',
    name: 'Vijay Mehta',
    phone: '+91-9876543250',
    email: 'vijay.mehta@example.com',
    address: 'E-654, Highway Road',
    city: 'Ahmedabad',
    state: 'Gujarat',
    licenseNumber: 'GJ0120210011223',
    licenseType: 'Heavy Vehicle',
    licenseExpiry: new Date('2028-01-10'),
    experience: 10,
    dateOfJoining: new Date('2019-03-01'),
    dateOfBirth: new Date('1988-07-18'),
    emergencyContact: '+91-9876543251',
    bloodGroup: 'O-',
    vehicleAssigned: 'GJ-01-GH-3456',
    rating: 4.6,
    totalTrips: 820,
    status: 'Active'
  },
  {
    id: '6',
    code: 'DRV-006',
    name: 'Ramesh Gupta',
    phone: '+91-9876543260',
    email: 'ramesh.gupta@example.com',
    address: 'F-987, Logistics Park',
    city: 'Chennai',
    state: 'Tamil Nadu',
    licenseNumber: 'TN0120210033445',
    licenseType: 'Light Commercial',
    licenseExpiry: new Date('2026-08-25'),
    experience: 6,
    dateOfJoining: new Date('2021-09-15'),
    dateOfBirth: new Date('1992-11-05'),
    emergencyContact: '+91-9876543261',
    bloodGroup: 'B-',
    vehicleAssigned: 'TN-01-IJ-7890',
    rating: 4.4,
    totalTrips: 480,
    status: 'Active'
  },
  {
    id: '7',
    code: 'DRV-007',
    name: 'Anil Verma',
    phone: '+91-9876543270',
    email: 'anil.verma@example.com',
    address: 'G-147, Transport Colony',
    city: 'Hyderabad',
    state: 'Telangana',
    licenseNumber: 'TS0120210055667',
    licenseType: 'Heavy Vehicle',
    licenseExpiry: new Date('2027-04-15'),
    experience: 14,
    dateOfJoining: new Date('2016-11-01'),
    dateOfBirth: new Date('1982-09-30'),
    emergencyContact: '+91-9876543271',
    bloodGroup: 'A-',
    rating: 4.3,
    totalTrips: 1100,
    status: 'Inactive'
  },
  {
    id: '8',
    code: 'DRV-008',
    name: 'Santosh Yadav',
    phone: '+91-9876543280',
    email: 'santosh.yadav@example.com',
    address: 'H-258, Fleet Station',
    city: 'Kolkata',
    state: 'West Bengal',
    licenseNumber: 'WB0120210077889',
    licenseType: 'Heavy Vehicle',
    licenseExpiry: new Date('2025-11-30'),
    experience: 9,
    dateOfJoining: new Date('2020-02-10'),
    dateOfBirth: new Date('1989-04-12'),
    emergencyContact: '+91-9876543281',
    bloodGroup: 'O+',
    vehicleAssigned: 'WB-01-KL-2345',
    rating: 4.7,
    totalTrips: 720,
    status: 'Active'
  }
];

const statusColors = {
  'Active': 'bg-green-100 text-green-800 border-green-300',
  'Inactive': 'bg-gray-100 text-gray-800 border-gray-300',
  'On Leave': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'Suspended': 'bg-red-100 text-red-800 border-red-300'
};

export default function DriverMaster() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [licenseTypeFilter, setLicenseTypeFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  // Map backend Driver shape into the component's local Driver interface (best-effort, guarded)
  const mapApiDriver = (d: ApiDriver): Driver => ({
    id: d?.id || '',
    code: d?.employeeId || d?.id || '',
    name: d?.fullName || `${d?.firstName || ''} ${d?.lastName || ''}`.trim() || '',
    phone: d?.phone || '',
    email: d?.email || '',
    address: d?.address || '',
    city: d?.city || '',
    state: d?.state || '',
    licenseNumber: d?.licenseNumber || '',
    licenseType: d?.licenseType || '',
    licenseExpiry: d?.licenseExpiry ? new Date(d.licenseExpiry) : new Date(),
    experience: d?.experience || 0,
    dateOfJoining: d?.dateOfJoining ? new Date(d.dateOfJoining) : new Date(),
    dateOfBirth: d?.dateOfBirth ? new Date(d.dateOfBirth) : new Date(),
    emergencyContact: d?.emergencyContactPhone || '',
    bloodGroup: d?.bloodGroup || '',
    vehicleAssigned: d?.assignedVehicleNumber || undefined,
    rating: d?.rating || 0,
    totalTrips: d?.totalTrips || 0,
    status: (d?.status as Driver['status']) || 'Inactive',
  });

  const loadDrivers = async () => {
    try {
      const data = await fleetService.getAllDrivers();
      setDrivers(Array.isArray(data) ? data.map(mapApiDriver) : []);
    } catch (error) {
      console.error('Failed to load drivers:', error);
      setDrivers([]);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  // Toast auto-dismiss
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Filter drivers
  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm) ||
      driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    const matchesLicenseType = licenseTypeFilter === 'all' || driver.licenseType === licenseTypeFilter;

    return matchesSearch && matchesStatus && matchesLicenseType;
  });

  // Calculate statistics
  const stats = {
    total: drivers.length,
    active: drivers.filter(d => d.status === 'Active').length,
    onLeave: drivers.filter(d => d.status === 'On Leave').length,
    inactive: drivers.filter(d => d.status === 'Inactive').length,
    avgRating: drivers.length ? (drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1) : '0',
    totalTrips: drivers.reduce((sum, d) => sum + d.totalTrips, 0),
    expiringSoon: drivers.filter(d => {
      const daysToExpiry = Math.floor((d.licenseExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysToExpiry <= 90 && daysToExpiry > 0;
    }).length
  };

  const handleView = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowViewModal(true);
  };

  const handleEdit = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowEditModal(true);
  };

  const handleDelete = async (driver: Driver) => {
    if (confirm(`Are you sure you want to delete ${driver.name}?`)) {
      try {
        await fleetService.deleteDriver(driver.id);
        await loadDrivers();
        setToast({ message: `Driver ${driver.name} deleted successfully`, type: 'success' });
      } catch (error) {
        console.error('Failed to delete driver:', error);
        setToast({ message: `Failed to delete driver ${driver.name}`, type: 'error' });
      }
    }
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleExport = () => {
    setToast({ message: 'Exporting driver data...', type: 'info' });
  };

  return (
    <div className="p-6 max-w-[1600px]">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
          {toast.type === 'error' && <X className="w-5 h-5" />}
          {toast.type === 'info' && <AlertTriangle className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-3">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Driver Master</h2>
        <p className="text-gray-600">Manage driver personnel database and information</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2 mb-3">
        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Drivers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Leave</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.onLeave}</p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
            </div>
            <User className="h-8 w-8 text-gray-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-orange-600">{stats.avgRating}</p>
            </div>
            <Star className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Trips</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalTrips}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-red-200 p-3 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-red-600">{stats.expiringSoon}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, code, phone, or license..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showAdvancedFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </button>

            {/* Add Button */}
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Driver
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4 border-t border-gray-200">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
                <option value="Suspended">Suspended</option>
              </select>

              <select
                value={licenseTypeFilter}
                onChange={(e) => setLicenseTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All License Types</option>
                <option value="Heavy Vehicle">Heavy Vehicle</option>
                <option value="Light Commercial">Light Commercial</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDrivers.map((driver) => {
                const daysToExpiry = Math.floor((driver.licenseExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const isExpiringSoon = daysToExpiry <= 90 && daysToExpiry > 0;

                return (
                  <tr key={driver.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                          <div className="text-xs text-gray-500">{driver.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {driver.phone}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {driver.email}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm text-gray-900">{driver.licenseNumber}</div>
                      <div className="text-xs text-gray-500">{driver.licenseType}</div>
                      {isExpiringSoon && (
                        <div className="text-xs text-red-600 flex items-center gap-1 mt-1">
                          <AlertTriangle className="h-3 w-3" />
                          Expires in {daysToExpiry} days
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-sm text-gray-900">{driver.experience} years</div>
                      <div className="text-xs text-gray-500">Since {driver.dateOfJoining.getFullYear()}</div>
                    </td>
                    <td className="px-3 py-2">
                      {driver.vehicleAssigned ? (
                        <div className="text-sm text-gray-900">{driver.vehicleAssigned}</div>
                      ) : (
                        <div className="text-sm text-gray-400">Not assigned</div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-gray-900">{driver.rating}</span>
                      </div>
                      <div className="text-xs text-gray-500">{driver.totalTrips} trips</div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[driver.status]}`}>
                        {driver.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(driver)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(driver)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(driver)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredDrivers.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No drivers found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* View Driver Modal */}
      {showViewModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedDriver.name}</h2>
                <p className="text-sm text-blue-100">{selectedDriver.code}</p>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* Status and Rating */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border ${statusColors[selectedDriver.status]}`}>
                  {selectedDriver.status}
                </span>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-lg font-bold text-gray-900">{selectedDriver.rating}</span>
                  <span className="text-sm text-gray-500">({selectedDriver.totalTrips} trips)</span>
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="text-base font-medium text-gray-900">
                      {selectedDriver.dateOfBirth.toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Blood Group</p>
                    <p className="text-base font-medium text-gray-900">{selectedDriver.bloodGroup}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Joining</p>
                    <p className="text-base font-medium text-gray-900">
                      {selectedDriver.dateOfJoining.toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Experience</p>
                    <p className="text-base font-medium text-gray-900">{selectedDriver.experience} years</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-blue-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-base font-medium text-gray-900">{selectedDriver.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-base font-medium text-gray-900">{selectedDriver.email}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-base font-medium text-gray-900">
                      {selectedDriver.address}, {selectedDriver.city}, {selectedDriver.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Emergency Contact</p>
                    <p className="text-base font-medium text-gray-900">{selectedDriver.emergencyContact}</p>
                  </div>
                </div>
              </div>

              {/* License Information */}
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  License Information
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">License Number</p>
                    <p className="text-base font-medium text-gray-900">{selectedDriver.licenseNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">License Type</p>
                    <p className="text-base font-medium text-gray-900">{selectedDriver.licenseType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expiry Date</p>
                    <p className="text-base font-medium text-gray-900">
                      {selectedDriver.licenseExpiry.toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Assigned</p>
                    <p className="text-base font-medium text-gray-900">
                      {selectedDriver.vehicleAssigned || 'Not assigned'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(selectedDriver);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Driver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal Placeholder */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {showAddModal ? 'Add New Driver' : 'Edit Driver'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-center text-gray-600">Form implementation coming soon...</p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
