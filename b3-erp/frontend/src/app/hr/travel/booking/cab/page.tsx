'use client';

import { useState, useMemo, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import { Car, Plus, Calendar, IndianRupee, User, MapPin, Edit2, Trash2, X, Save, AlertCircle, Download, Navigation } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CabBooking {
  id: string;
  bookingReference: string;
  travelRequestId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  provider: 'ola' | 'uber' | 'meru' | 'corporate-taxi' | 'other';
  bookingNumber: string;
  cabType: 'sedan' | 'suv' | 'hatchback' | 'luxury';
  vehicleModel?: string;
  driverName?: string;
  driverContact?: string;
  pickupLocation: string;
  dropLocation: string;
  pickupDate: string;
  pickupTime: string;
  tripType: 'one-way' | 'round-trip' | 'hourly' | 'multi-city';
  distance: number;
  duration: string;
  baseFare: number;
  taxes: number;
  totalAmount: number;
  bookingDate: string;
  bookingSource: 'app' | 'corporate-agent' | 'phone' | 'other';
  bookingStatus: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  paymentMethod: 'corporate-account' | 'employee-paid' | 'cash';
  remarks?: string;
}

export default function CabBookingPage() {
  const [bookings, setBookings] = useState<CabBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrPagesService.travelRequests<any[]>();
        if (!cancelled) setBookings(Array.isArray(rows) ? (rows as any) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load data');
          setBookings([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<CabBooking | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.bookingStatus === filterStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => b.bookingDate.localeCompare(a.bookingDate));
  }, [bookings, filterStatus, searchQuery]);

  const stats = useMemo(() => ({
    total: bookings.length,
    confirmed: bookings.filter(b => b.bookingStatus === 'confirmed').length,
    pending: bookings.filter(b => b.bookingStatus === 'pending').length,
    completed: bookings.filter(b => b.bookingStatus === 'completed').length,
    cancelled: bookings.filter(b => b.bookingStatus === 'cancelled').length,
    totalSpent: bookings.filter(b => ['confirmed', 'completed'].includes(b.bookingStatus)).reduce((sum, b) => sum + b.totalAmount, 0)
  }), [bookings]);

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCabTypeColor = (cabType: string) => {
    const colors = {
      'hatchback': 'bg-gray-100 text-gray-800',
      'sedan': 'bg-blue-100 text-blue-800',
      'suv': 'bg-purple-100 text-purple-800',
      'luxury': 'bg-amber-100 text-amber-800'
    };
    return colors[cabType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleDelete = (booking: CabBooking) => {
    setSelectedBooking(booking);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedBooking) return;
    setBookings(bookings.filter(b => b.id !== selectedBooking.id));
    setShowDeleteModal(false);
    toast({
      title: "Booking Deleted",
      description: `${selectedBooking.bookingReference} has been removed`
    });
    setSelectedBooking(null);
  };

  const handleDownloadReceipt = (booking: CabBooking) => {
    toast({
      title: "Downloading Receipt",
      description: `Cab receipt for ${booking.bookingReference} is being downloaded`
    });
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Car className="h-7 w-7 text-blue-600" />
          Cab Bookings
        </h1>
        <p className="text-sm text-gray-600 mt-1">Manage and track cab bookings for employee travel</p>
      </div>

      {/* Info Alert */}
      <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Booking Management</h3>
            <p className="text-sm text-blue-800">
              Record cab bookings made through ride-hailing apps, corporate taxi services, or travel agents.
              Track booking details, driver information, and trip status for expense reporting.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 mb-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Total Bookings</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Confirmed</div>
          <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Completed</div>
          <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Cancelled</div>
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Total Spent</div>
          <div className="text-2xl font-bold text-blue-600">₹{(stats.totalSpent / 1000).toFixed(1)}K</div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="mb-3 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
          <div className="flex gap-2 items-center">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Search by employee, booking ref, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-80"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Booking
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-2">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{booking.bookingReference}</h3>
                  <p className="text-sm text-gray-600 capitalize">{booking.provider} • {booking.bookingNumber}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                  {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                </span>
                <span className={`px-3 py-1 text-xs font-medium rounded ${getCabTypeColor(booking.cabType)}`}>
                  {booking.cabType.toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">₹{booking.totalAmount.toLocaleString('en-IN')}</div>
                <div className="text-xs text-gray-600">{booking.distance}km • {booking.duration}</div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-2">
                {/* Employee Info */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500 uppercase font-medium">Passenger</span>
                  </div>
                  <p className="font-semibold text-gray-900">{booking.employeeName}</p>
                  <p className="text-sm text-gray-600">{booking.employeeCode}</p>
                  <p className="text-xs text-gray-500">{booking.department}</p>
                </div>

                {/* Route */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500 uppercase font-medium">Route</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">From:</p>
                      <p className="text-sm text-gray-600">{booking.pickupLocation}</p>
                    </div>
                    <Navigation className="h-4 w-4 text-blue-600 rotate-90" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">To:</p>
                      <p className="text-sm text-gray-600">{booking.dropLocation}</p>
                    </div>
                  </div>
                </div>

                {/* Trip Details */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500 uppercase font-medium">Trip Details</span>
                  </div>
                  <p className="text-sm text-gray-900">{booking.pickupDate} • {booking.pickupTime}</p>
                  <p className="text-xs text-gray-600 capitalize">{booking.tripType.replace('-', ' ')}</p>
                  {booking.vehicleModel && <p className="text-xs text-gray-500 mt-1">{booking.vehicleModel}</p>}
                </div>
              </div>

              {/* Additional Details */}
              {(booking.driverName || booking.remarks) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  {booking.driverName && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Driver Details</p>
                      <p className="text-sm font-semibold text-gray-900">{booking.driverName}</p>
                      {booking.driverContact && <p className="text-xs text-gray-600">{booking.driverContact}</p>}
                    </div>
                  )}
                  {booking.remarks && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Remarks</p>
                      <p className="text-sm text-gray-900">{booking.remarks}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Travel Request: <span className="text-blue-600 font-medium">{booking.travelRequestId}</span>
                  {' • '}
                  Payment: <span className="text-gray-900 capitalize">{booking.paymentMethod.replace('-', ' ')}</span>
                </div>
                <div className="flex gap-2">
                  {(booking.bookingStatus === 'confirmed' || booking.bookingStatus === 'completed') && (
                    <button
                      onClick={() => handleDownloadReceipt(booking)}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium flex items-center gap-1"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Receipt
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(booking)}
                    className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Car className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600">No cab bookings match your search criteria</p>
        </div>
      )}

      {/* Add Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">Add Cab Booking</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <form className="space-y-3">
                {/* Employee & Travel Request */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Travel Request ID</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="TR-2025-XXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Employee Code</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="EMPXXX" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Employee Name</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                {/* Provider & Booking Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Provider</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="ola">Ola</option>
                      <option value="uber">Uber</option>
                      <option value="meru">Meru</option>
                      <option value="corporate-taxi">Corporate Taxi</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Booking Number</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="OLA123456" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cab Type</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="hatchback">Hatchback</option>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>
                </div>

                {/* Route */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Location</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Office / Airport" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Drop Location</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Destination" />
                  </div>
                </div>

                {/* Trip Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Date</label>
                    <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Time</label>
                    <input type="time" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Trip Type</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="one-way">One Way</option>
                      <option value="round-trip">Round Trip</option>
                      <option value="hourly">Hourly Rental</option>
                      <option value="multi-city">Multi-City</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Distance (km)</label>
                    <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0" />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Base Fare (₹)</label>
                    <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Taxes (₹)</label>
                    <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Amount (₹)</label>
                    <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0" />
                  </div>
                </div>

                {/* Additional Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Booking Status</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="corporate-account">Corporate Account</option>
                      <option value="employee-paid">Employee Paid</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
                  <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Any additional notes..."></textarea>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setShowAddModal(false)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
                Cancel
              </button>
              <button
                onClick={() => {
                  toast({ title: "Booking Added", description: "Cab booking has been recorded successfully" });
                  setShowAddModal(false);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Delete Booking?</h2>
              </div>
              <p className="text-gray-600 mb-2">
                Are you sure you want to delete booking <strong>{selectedBooking.bookingReference}</strong>?
              </p>
              <p className="text-sm text-gray-500">
                This action cannot be undone. All booking details will be permanently removed.
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedBooking(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
