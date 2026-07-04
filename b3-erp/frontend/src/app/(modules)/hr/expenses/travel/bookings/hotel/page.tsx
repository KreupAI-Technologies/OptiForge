'use client';

import React, { useState, useEffect } from 'react';
import { HrExpensesService } from '@/services/hr-expenses.service';
import {
    Building2,
    Search,
    Filter,
    Download,
    PlusCircle,
    Eye,
    Calendar,
    MapPin,
    Star,
    Bed,
    CheckCircle,
    XCircle,
    Clock,
    Wifi,
    Car,
    Coffee
} from 'lucide-react';

interface HotelBooking {
    id: string;
    bookingId: string;
    travelRequestId: string;
    employeeId: string;
    employeeName: string;
    department: string;
    hotelName: string;
    hotelRating: number;
    city: string;
    address: string;
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    roomType: 'Standard' | 'Deluxe' | 'Suite';
    roomCount: number;
    ratePerNight: number;
    totalAmount: number;
    status: 'Requested' | 'Confirmed' | 'Checked In' | 'Checked Out' | 'Cancelled';
    confirmationNumber: string | null;
    amenities: string[];
    bookedBy: string;
    bookingDate: string;
}

export default function HotelBookingPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [monthFilter, setMonthFilter] = useState('February 2025');

    const [bookings, setBookings] = useState<HotelBooking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
      let cancelled = false;
      (async () => {
        setIsLoading(true); setLoadError(null);
        try {
          const raw = await HrExpensesService.getBookings('hotel');
          const mapped: HotelBooking[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
          if (!cancelled) setBookings(mapped);
        } catch (err) {
          if (!cancelled) { setLoadError(err instanceof Error ? err.message : 'Failed to load'); setBookings([]); }
        } finally { if (!cancelled) setIsLoading(false); }
      })();
      return () => { cancelled = true; };
    }, []);

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = booking.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.hotelName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatCurrency = (value: number) => {
        if (value >= 100000) {
            return `₹${(value / 100000).toFixed(2)}L`;
        }
        return `₹${value.toLocaleString()}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-500/20 text-green-400';
            case 'Requested': return 'bg-yellow-500/20 text-yellow-400';
            case 'Checked In': return 'bg-blue-500/20 text-blue-400';
            case 'Checked Out': return 'bg-purple-500/20 text-purple-400';
            case 'Cancelled': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getRoomTypeColor = (roomType: string) => {
        switch (roomType) {
            case 'Suite': return 'bg-purple-500/20 text-purple-400';
            case 'Deluxe': return 'bg-blue-500/20 text-blue-400';
            case 'Standard': return 'bg-gray-500/20 text-gray-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getAmenityIcon = (amenity: string) => {
        switch (amenity) {
            case 'WiFi': return <Wifi className="w-3 h-3" />;
            case 'Parking': return <Car className="w-3 h-3" />;
            case 'Breakfast': return <Coffee className="w-3 h-3" />;
            default: return null;
        }
    };

    const totalAmount = bookings.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + b.totalAmount, 0);
    const confirmedCount = bookings.filter(b => b.status === 'Confirmed').length;
    const pendingCount = bookings.filter(b => b.status === 'Requested').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
            {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Building2 className="w-8 h-8 text-orange-500" />
                            Hotel Booking
                        </h1>
                        <p className="text-gray-400 mt-1">Manage hotel reservations and accommodations</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
                            <PlusCircle className="w-4 h-4" />
                            Book Hotel
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-orange-400 text-sm">Total Bookings</p>
                        <p className="text-3xl font-bold text-white">{bookings.length}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Confirmed</p>
                        <p className="text-3xl font-bold text-white">{confirmedCount}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Pending</p>
                        <p className="text-3xl font-bold text-white">{pendingCount}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Total Amount</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalAmount)}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by employee, booking ID, or hotel..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Requested">Requested</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Checked In">Checked In</option>
                            <option value="Checked Out">Checked Out</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <select
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="February 2025">February 2025</option>
                            <option value="March 2025">March 2025</option>
                            <option value="April 2025">April 2025</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredBookings.map((booking) => (
                        <div key={booking.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                            <div className="p-4">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    {/* Left Section - Hotel Info */}
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                                            <Building2 className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-white font-medium text-lg">{booking.hotelName}</h3>
                                                <div className="flex items-center gap-0.5">
                                                    {Array.from({ length: booking.hotelRating }).map((_, i) => (
                                                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                    ))}
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>{booking.city} • {booking.address}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-2">
                                                {booking.amenities.slice(0, 4).map((amenity, i) => (
                                                    <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">
                                                        {getAmenityIcon(amenity)}
                                                        {amenity}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Center Section - Stay Details */}
                                    <div className="flex items-center gap-6 px-4">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 mb-1">Check-in</p>
                                            <p className="text-white font-medium">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <Bed className="w-5 h-5 text-orange-400 mb-1" />
                                            <p className="text-sm text-white font-medium">{booking.nights} Night(s)</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 mb-1">Check-out</p>
                                            <p className="text-white font-medium">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {/* Right Section - Amount & Actions */}
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-white">{formatCurrency(booking.totalAmount)}</p>
                                            <div className="flex items-center justify-end gap-2 mt-1">
                                                <span className={`px-2 py-0.5 rounded text-xs ${getRoomTypeColor(booking.roomType)}`}>
                                                    {booking.roomType}
                                                </span>
                                                <span className="text-xs text-gray-400">{booking.roomCount} room(s)</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{formatCurrency(booking.ratePerNight)}/night</p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded" title="View Details">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {booking.confirmationNumber && (
                                                <button className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded" title="Download Voucher">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Section - Guest & Booking Info */}
                                <div className="mt-3 pt-3 border-t border-gray-700 flex flex-wrap items-center justify-between text-sm gap-2">
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-400">Guest: {booking.employeeName}</span>
                                        <span className="text-gray-500">|</span>
                                        <span className="text-gray-400">{booking.bookingId}</span>
                                        {booking.confirmationNumber && (
                                            <>
                                                <span className="text-gray-500">|</span>
                                                <span className="text-green-400">Conf #: {booking.confirmationNumber}</span>
                                            </>
                                        )}
                                    </div>
                                    <span className="text-gray-500">Booked: {new Date(booking.bookingDate).toLocaleDateString()} by {booking.bookedBy}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
