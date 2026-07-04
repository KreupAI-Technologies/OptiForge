'use client';

import React, { useState, useEffect } from 'react';
import { HrExpensesService } from '@/services/hr-expenses.service';
import {
    Plane,
    Search,
    Filter,
    Download,
    PlusCircle,
    Eye,
    Calendar,
    Clock,
    MapPin,
    Users,
    Ticket,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';

interface FlightBooking {
    id: string;
    bookingId: string;
    travelRequestId: string;
    employeeId: string;
    employeeName: string;
    department: string;
    airline: string;
    flightNumber: string;
    fromAirport: string;
    toAirport: string;
    departureDate: string;
    departureTime: string;
    arrivalTime: string;
    class: 'Economy' | 'Premium Economy' | 'Business';
    fare: number;
    status: 'Pending' | 'Confirmed' | 'Ticketed' | 'Cancelled' | 'Completed';
    pnr: string | null;
    bookedBy: string;
    bookingDate: string;
}

export default function FlightBookingPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [monthFilter, setMonthFilter] = useState('February 2025');

    const bookings: FlightBooking[] = [
        {
            id: '1',
            bookingId: 'FB-2025-001',
            travelRequestId: 'TR-2025-001',
            employeeId: 'EMP001',
            employeeName: 'Sarah Johnson',
            department: 'Human Resources',
            airline: 'IndiGo',
            flightNumber: '6E 234',
            fromAirport: 'BLR',
            toAirport: 'BOM',
            departureDate: '2025-02-20',
            departureTime: '08:30',
            arrivalTime: '10:15',
            class: 'Economy',
            fare: 8500,
            status: 'Ticketed',
            pnr: 'ABC123',
            bookedBy: 'Travel Desk',
            bookingDate: '2025-02-10'
        },
        {
            id: '2',
            bookingId: 'FB-2025-002',
            travelRequestId: 'TR-2025-001',
            employeeId: 'EMP001',
            employeeName: 'Sarah Johnson',
            department: 'Human Resources',
            airline: 'IndiGo',
            flightNumber: '6E 567',
            fromAirport: 'BOM',
            toAirport: 'BLR',
            departureDate: '2025-02-23',
            departureTime: '19:45',
            arrivalTime: '21:30',
            class: 'Economy',
            fare: 7800,
            status: 'Ticketed',
            pnr: 'XYZ456',
            bookedBy: 'Travel Desk',
            bookingDate: '2025-02-10'
        },
        {
            id: '3',
            bookingId: 'FB-2025-003',
            travelRequestId: 'TR-2025-002',
            employeeId: 'EMP002',
            employeeName: 'Michael Chen',
            department: 'Production',
            airline: 'Air India',
            flightNumber: 'AI 505',
            fromAirport: 'BLR',
            toAirport: 'MAA',
            departureDate: '2025-02-25',
            departureTime: '07:00',
            arrivalTime: '08:00',
            class: 'Economy',
            fare: 4500,
            status: 'Confirmed',
            pnr: null,
            bookedBy: 'Self',
            bookingDate: '2025-02-11'
        },
        {
            id: '4',
            bookingId: 'FB-2025-004',
            travelRequestId: 'TR-2025-003',
            employeeId: 'EMP006',
            employeeName: 'Robert Martinez',
            department: 'IT',
            airline: 'Singapore Airlines',
            flightNumber: 'SQ 508',
            fromAirport: 'BLR',
            toAirport: 'SIN',
            departureDate: '2025-03-10',
            departureTime: '14:30',
            arrivalTime: '21:15',
            class: 'Business',
            fare: 85000,
            status: 'Pending',
            pnr: null,
            bookedBy: 'Travel Desk',
            bookingDate: '2025-02-12'
        },
        {
            id: '5',
            bookingId: 'FB-2025-005',
            travelRequestId: 'TR-2025-004',
            employeeId: 'EMP010',
            employeeName: 'Priya Sharma',
            department: 'Sales',
            airline: 'Vistara',
            flightNumber: 'UK 815',
            fromAirport: 'BLR',
            toAirport: 'DEL',
            departureDate: '2025-02-18',
            departureTime: '06:15',
            arrivalTime: '09:00',
            class: 'Premium Economy',
            fare: 12500,
            status: 'Ticketed',
            pnr: 'VIS789',
            bookedBy: 'Travel Desk',
            bookingDate: '2025-02-09'
        }
    ];

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = booking.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.flightNumber.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const formatCurrency = (value: number) => {
        return `₹${value.toLocaleString()}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Ticketed': return 'bg-green-500/20 text-green-400';
            case 'Confirmed': return 'bg-blue-500/20 text-blue-400';
            case 'Pending': return 'bg-yellow-500/20 text-yellow-400';
            case 'Cancelled': return 'bg-red-500/20 text-red-400';
            case 'Completed': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const getClassColor = (flightClass: string) => {
        switch (flightClass) {
            case 'Business': return 'bg-purple-500/20 text-purple-400';
            case 'Premium Economy': return 'bg-blue-500/20 text-blue-400';
            case 'Economy': return 'bg-gray-500/20 text-gray-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    const totalFare = bookings.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + b.fare, 0);
    const ticketedCount = bookings.filter(b => b.status === 'Ticketed').length;
    const pendingCount = bookings.filter(b => b.status === 'Pending' || b.status === 'Confirmed').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Plane className="w-8 h-8 text-sky-500" />
                            Flight Booking
                        </h1>
                        <p className="text-gray-400 mt-1">Manage flight reservations and tickets</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors">
                            <PlusCircle className="w-4 h-4" />
                            Book Flight
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4">
                        <p className="text-sky-400 text-sm">Total Bookings</p>
                        <p className="text-3xl font-bold text-white">{bookings.length}</p>
                    </div>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <p className="text-green-400 text-sm">Ticketed</p>
                        <p className="text-3xl font-bold text-white">{ticketedCount}</p>
                    </div>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <p className="text-yellow-400 text-sm">Pending</p>
                        <p className="text-3xl font-bold text-white">{pendingCount}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Total Fare</p>
                        <p className="text-3xl font-bold text-white">{formatCurrency(totalFare)}</p>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by employee, booking ID, or flight number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            <option value="all">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Ticketed">Ticketed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <select
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    {/* Left Section - Employee & Flight Info */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                                            <Plane className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-white font-medium">{booking.employeeName}</p>
                                                <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400">{booking.bookingId} • {booking.travelRequestId}</p>
                                            <p className="text-xs text-gray-500">{booking.department}</p>
                                        </div>
                                    </div>

                                    {/* Center Section - Flight Details */}
                                    <div className="flex-1 flex items-center justify-center gap-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-white">{booking.fromAirport}</p>
                                            <p className="text-sm text-gray-400">{booking.departureTime}</p>
                                        </div>
                                        <div className="flex flex-col items-center px-4">
                                            <p className="text-xs text-gray-500 mb-1">{booking.airline} • {booking.flightNumber}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                                                <div className="w-24 h-0.5 bg-gray-600 relative">
                                                    <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
                                                </div>
                                                <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(booking.departureDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-white">{booking.toAirport}</p>
                                            <p className="text-sm text-gray-400">{booking.arrivalTime}</p>
                                        </div>
                                    </div>

                                    {/* Right Section - Fare & Actions */}
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-white">{formatCurrency(booking.fare)}</p>
                                            <span className={`px-2 py-0.5 rounded text-xs ${getClassColor(booking.class)}`}>
                                                {booking.class}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <button className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded" title="View Details">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {booking.pnr && (
                                                <button className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded" title="Download Ticket">
                                                    <Ticket className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* PNR & Booking Info */}
                                <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-4">
                                        {booking.pnr ? (
                                            <span className="text-green-400">PNR: {booking.pnr}</span>
                                        ) : (
                                            <span className="text-yellow-400">PNR: Awaiting confirmation</span>
                                        )}
                                        <span className="text-gray-500">|</span>
                                        <span className="text-gray-400">Booked by: {booking.bookedBy}</span>
                                    </div>
                                    <span className="text-gray-500">Booking Date: {new Date(booking.bookingDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
