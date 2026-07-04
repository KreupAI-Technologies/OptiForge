'use client';

import { useState, useMemo, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import { Building, Plus, Calendar, IndianRupee, User, MapPin, Edit2, Trash2, X, Save, AlertCircle, Download, Star, Bed } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface HotelBooking {
  id: string;
  bookingReference: string;
  travelRequestId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  hotelName: string;
  hotelChain?: string;
  confirmationNumber: string;
  location: string;
  address: string;
  roomType: 'standard' | 'deluxe' | 'executive' | 'suite';
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guests: number;
  ratePerNight: number;
  taxes: number;
  totalAmount: number;
  bookingDate: string;
  bookingSource: 'corporate-agent' | 'hotel-direct' | 'online-portal' | 'other';
  agencyName?: string;
  bookingStatus: 'confirmed' | 'pending' | 'cancelled' | 'checked-in' | 'checked-out';
  mealPlan: 'room-only' | 'breakfast' | 'half-board' | 'full-board';
  specialRequests?: string;
  cancellationPolicy: string;
  remarks?: string;
}

export default function HotelBookingPage() {
  const [bookings, setBookings] = useState<HotelBooking[]>([]);
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
  const [selectedBooking, setSelectedBooking] = useState<HotelBooking | null>(null);
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
        b.confirmationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.hotelName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => b.bookingDate.localeCompare(a.bookingDate));
  }, [bookings, filterStatus, searchQuery]);

  const stats = useMemo(() => ({
    total: bookings.length,
    confirmed: bookings.filter(b => b.bookingStatus === 'confirmed').length,
    pending: bookings.filter(b => b.bookingStatus === 'pending').length,
    cancelled: bookings.filter(b => b.bookingStatus === 'cancelled').length,
    totalSpent: bookings.filter(b => b.bookingStatus === 'confirmed').reduce((sum, b) => sum + b.totalAmount, 0),
    totalNights: bookings.filter(b => b.bookingStatus === 'confirmed').reduce((sum, b) => sum + b.nights, 0)
  }), [bookings]);

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      'checked-in': 'bg-blue-100 text-blue-800',
      'checked-out': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRoomTypeColor = (roomType: string) => {
    const colors = {
      'standard': 'bg-gray-100 text-gray-800',
      'deluxe': 'bg-blue-100 text-blue-800',
      'executive': 'bg-purple-100 text-purple-800',
      'suite': 'bg-amber-100 text-amber-800'
    };
    return colors[roomType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleDelete = (booking: HotelBooking) => {
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

  const handleDownloadVoucher = (booking: HotelBooking) => {
    toast({
      title: "Downloading Voucher",
      description: `Hotel voucher for ${booking.bookingReference} is being downloaded`
    });
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building className="h-7 w-7 text-blue-600" />
          Hotel Bookings
        </h1>
        <p className="text-sm text-gray-600 mt-1">Manage and track hotel bookings for employee travel</p>
      </div>

      {/* Info Alert */}
      <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Booking Management</h3>
            <p className="text-sm text-blue-800">
              Record hotel bookings made through corporate travel agents, hotel chains, or online portals.
              Keep track of confirmation numbers, room details, and booking status for reporting.
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
          <div className="text-sm text-gray-600 mb-1">Cancelled</div>
          <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Total Nights</div>
          <div className="text-2xl font-bold text-purple-600">{stats.totalNights}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="text-sm text-gray-600 mb-1">Total Spent</div>
          <div className="text-2xl font-bold text-blue-600">₹{(stats.totalSpent / 100000).toFixed(1)}L</div>
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
              <option value="cancelled">Cancelled</option>
              <option value="checked-in">Checked In</option>
              <option value="checked-out">Checked Out</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Search by employee, hotel, confirmation..."
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
                  <Building className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{booking.bookingReference}</h3>
                  <p className="text-sm text-gray-600">{booking.hotelName} • Confirmation: {booking.confirmationNumber}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                  {booking.bookingStatus.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
                <span className={`px-3 py-1 text-xs font-medium rounded ${getRoomTypeColor(booking.roomType)}`}>
                  {booking.roomType.charAt(0).toUpperCase() + booking.roomType.slice(1)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">₹{booking.totalAmount.toLocaleString('en-IN')}</div>
                <div className="text-xs text-gray-600">₹{booking.ratePerNight.toLocaleString('en-IN')}/night × {booking.nights} nights</div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-2">
                {/* Employee Info */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500 uppercase font-medium">Guest</span>
                  </div>
                  <p className="font-semibold text-gray-900">{booking.employeeName}</p>
                  <p className="text-sm text-gray-600">{booking.employeeCode}</p>
                  <p className="text-xs text-gray-500">{booking.department}</p>
                  <p className="text-xs text-gray-500 mt-1">{booking.guests} Guest{booking.guests !== 1 ? 's' : ''}</p>
                </div>

                {/* Hotel & Location */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500 uppercase font-medium">Hotel & Location</span>
                  </div>
                  <p className="font-semibold text-gray-900">{booking.hotelName}</p>
                  {booking.hotelChain && <p className="text-sm text-gray-600">{booking.hotelChain}</p>}
                  <p className="text-sm text-gray-600">{booking.location}</p>
                  <p className="text-xs text-gray-500">{booking.address}</p>
                </div>

                {/* Stay Details */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500 uppercase font-medium">Stay Period</span>
                  </div>
                  <p className="text-sm text-gray-900">Check-in: {booking.checkInDate}</p>
                  <p className="text-sm text-gray-900">Check-out: {booking.checkOutDate}</p>
                  <p className="text-xs text-gray-500 mt-1">{booking.nights} night{booking.nights !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-blue-600 font-medium capitalize">{booking.mealPlan.replace('-', ' ')}</p>
                </div>
              </div>

              {/* Booking Info Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Booked On</p>
                  <p className="text-sm font-semibold text-gray-900">{booking.bookingDate}</p>
                  <p className="text-xs text-gray-600 capitalize">{booking.bookingSource.replace('-', ' ')}</p>
                  {booking.agencyName && <p className="text-xs text-gray-500">{booking.agencyName}</p>}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Cancellation Policy</p>
                  <p className="text-sm text-gray-900">{booking.cancellationPolicy}</p>
                </div>
                {(booking.specialRequests || booking.remarks) && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    {booking.specialRequests && <p className="text-sm text-gray-900">{booking.specialRequests}</p>}
                    {booking.remarks && <p className="text-xs text-gray-600 mt-1">{booking.remarks}</p>}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Travel Request: <span className="text-blue-600 font-medium">{booking.travelRequestId}</span>
                </div>
                <div className="flex gap-2">
                  {booking.bookingStatus === 'confirmed' && (
                    <button
                      onClick={() => handleDownloadVoucher(booking)}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium flex items-center gap-1"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Voucher
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
          <Building className="h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600">No hotel bookings match your search criteria</p>
        </div>
      )}

      {/* Add Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">Add Hotel Booking</h2>
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

                {/* Hotel Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hotel Name</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="ITC Grand Central" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Hotel Chain (Optional)</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="ITC Hotels" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmation Number</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="ITC123456" />
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location (City)</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Bangalore" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Address</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="MG Road, Bangalore 560001" />
                  </div>
                </div>

                {/* Stay Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Check-in Date</label>
                    <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Check-out Date</label>
                    <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Nights</label>
                    <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="1" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Guests</label>
                    <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="1" />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rate Per Night (₹)</label>
                    <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Taxes & Fees (₹)</label>
                    <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Amount (₹)</label>
                    <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0" />
                  </div>
                </div>

                {/* Booking Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="standard">Standard</option>
                      <option value="deluxe">Deluxe</option>
                      <option value="executive">Executive</option>
                      <option value="suite">Suite</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Meal Plan</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="room-only">Room Only</option>
                      <option value="breakfast">Breakfast Included</option>
                      <option value="half-board">Half Board</option>
                      <option value="full-board">Full Board</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Booking Source</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="corporate-agent">Corporate Agent</option>
                      <option value="hotel-direct">Hotel Direct</option>
                      <option value="online-portal">Online Portal</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Booking Status</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Agency Name (Optional)</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="MakeMyTrip Corporate" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cancellation Policy</label>
                    <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Free cancellation up to 24 hours" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Special Requests</label>
                  <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={2} placeholder="High floor, non-smoking room, etc."></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
                  <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={2} placeholder="Any additional notes..."></textarea>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button onClick={() => setShowAddModal(false)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
                Cancel
              </button>
              <button
                onClick={() => {
                  toast({ title: "Booking Added", description: "Hotel booking has been recorded successfully" });
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
