'use client';

import React, { useState, useEffect } from 'react';
import { HrExpensesService } from '@/services/hr-expenses.service';
import {
    Car,
    Search,
    Filter,
    Download,
    PlusCircle,
    Eye,
    Calendar,
    Clock,
    MapPin,
    User,
    Phone,
    CheckCircle,
    Navigation
} from 'lucide-react';

interface CabBooking {
    id: string;
    bookingId: string;
    travelRequestId: string;
    employeeId: string;
    employeeName: string;
    department: string;
    cabType: 'Sedan' | 'SUV' | 'Hatchback' | 'Premium';
    vendor: string;
    pickupLocation: string;
    dropLocation: string;
    pickupDate: string;
    pickupTime: string;
    tripType: 'One Way' | 'Round Trip' | 'Hourly';
    estimatedDistance: number;
    estimatedFare: number;
    actualFare: number | null;
    status: 'Scheduled' | 'Driver Assigned' | 'In Progress' | 'Completed' | 'Cancelled';
    driverName: string | null;
    driverPhone: string | null;
    vehicleNumber: string | null;
    bookedBy: string;
    bookingDate: string;
}

export default function CabBookingPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('upcoming');

    const [bookings, setBookings] = useState<CabBooking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
      let cancelled = false;
      (async () => {
        setIsLoading(true); setLoadError(null);
        try {
          const raw = await HrExpensesService.getBookings('cab');
          const mapped: CabBooking[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({ ...r }));
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
            booking.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
        const matchesDate = dateFilter === 'all' ||
            (dateFilter === 'upcoming' && (booking.status === 'Scheduled' || booking.status === 'Driver Assigned')) ||
            (dateFilter === 'completed' && booking.status === 'Completed');
        return matchesSearch && matchesStatus && matchesDate;
    });

    const formatCurrency = (value: number) => {
        return `₹${value.toLocaleString()}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'bg-green-500/20 text-green-400';
            case 'Driver Assigned': return 'bg-blue-500/20 text-blue-400';
            case 'In Progress': return 'bg-purple-500/20 text-purple-400';
            case 'Scheduled': return 'bg-yellow-500/20 text-yellow-400';
            case 'Cancelled': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getCabTypeColor = (cabType: string) => {
        switch (cabType) {
            case 'Premium': return 'bg-purple-500/20 text-purple-400';
            case 'SUV': return 'bg-blue-500/20 text-blue-400';
            case 'Sedan': return 'bg-green-500/20 text-green-400';
            case 'Hatchback': return 'bg-gray-500/20 text-gray-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const totalEstimatedFare = bookings.reduce((sum, b) => sum + b.estimatedFare, 0);
    const totalActualFare = bookings.filter(b => b.actualFare).reduce((sum, b) => sum + (b.actualFare || 0), 0);
    const upcomingCount = bookings.filter(b => b.status === 'Scheduled' || b.status === 'Driver Assigned').length;
    const completedCount = bookings.filter(b => b.status === 'Completed').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            {loadError && <div className="text-red-400 text-sm mb-2">{loadError}</div>}
            {isLoading && <div className="text-gray-400 text-sm mb-2">Loading...</div>}
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Car className="w-8 h-8 text-green-500" />
                            Cab Booking
                        </h1>
                        <p className="text-gray-400 mt-1">Manage ground transportation bookings</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                            <PlusCircle className="w-4 h-4" />
                            Book Cab
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Total Bookings</p>
                        <p className="text-3xl font-bold text-white">{bookings.length}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Upcoming</p>
                        <p className="text-3xl font-bold text-white">{upcomingCount}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Completed</p>
                        <p className="text-3xl font-bold text-white">{completedCount}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Total Estimated</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalEstimatedFare)}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by employee, booking ID, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Driver Assigned">Driver Assigned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="all">All Rides</option>
                            <option value="upcoming">Upcoming</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    {filteredBookings.map((booking) => (
                        <div key={booking.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
                            <div className="p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    {/* Left Section - Booking Info */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                            <Car className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-white font-medium">{booking.employeeName}</p>
                                                <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs ${getCabTypeColor(booking.cabType)}`}>
                                                    {booking.cabType}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400">{booking.bookingId} • {booking.vendor}</p>
                                            <p className="text-xs text-gray-500">{booking.tripType} • ~{booking.estimatedDistance} km</p>
                                        </div>
                                    </div>

                                    {/* Center Section - Route */}
                                    <div className="flex-1 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                <div className="w-0.5 h-8 bg-gray-600"></div>
                                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <p className="text-white text-sm">{booking.pickupLocation}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-white text-sm">{booking.dropLocation}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Section - Time & Fare */}
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <div className="flex items-center gap-1 text-gray-400">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-sm">{new Date(booking.pickupDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-white mt-1">
                                                <Clock className="w-4 h-4" />
                                                <span className="font-medium">{booking.pickupTime}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {booking.actualFare ? (
                                                <>
                                                    <p className="text-xl font-bold text-white">{formatCurrency(booking.actualFare)}</p>
                                                    <p className="text-xs text-gray-400">Est: {formatCurrency(booking.estimatedFare)}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-xl font-bold text-white">{formatCurrency(booking.estimatedFare)}</p>
                                                    <p className="text-xs text-gray-400">Estimated</p>
                                                </>
                                            )}
                                        </div>
                                        <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded" title="View Details">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Driver Info */}
                                {booking.driverName && (
                                    <div className="mt-3 pt-3 border-t border-gray-700 flex flex-wrap items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-blue-400" />
                                            <span className="text-white">{booking.driverName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-green-400" />
                                            <span className="text-gray-300">{booking.driverPhone}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Car className="w-4 h-4 text-orange-400" />
                                            <span className="text-gray-300">{booking.vehicleNumber}</span>
                                        </div>
                                        {booking.status === 'Driver Assigned' && (
                                            <button className="ml-auto flex items-center gap-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm">
                                                <Navigation className="w-4 h-4" />
                                                Track
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
