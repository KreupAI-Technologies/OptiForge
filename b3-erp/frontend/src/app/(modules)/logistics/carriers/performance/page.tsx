'use client';

import React, { useState } from 'react';
import {
    TrendingUp,
    Star,
    Truck,
    Clock,
    Package,
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    Search,
    Filter,
    Download,
    Calendar,
    BarChart3,
    Target,
    Award,
    XCircle
} from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';

// Mock Performance Data
const overallStats = {
    avgOnTimeDelivery: 94.2,
    avgRating: 4.5,
    totalShipments: 2847,
    activeCarriers: 12,
    topPerformer: 'Emirates Logistics'
};

const carriers = [
    {
        id: 'CAR-001',
        name: 'Emirates Logistics',
        rating: 4.8,
        onTimeDelivery: 98.5,
        damageRate: 0.2,
        avgDeliveryTime: 2.1,
        totalShipments: 542,
        activeVehicles: 28,
        costPerKg: 12.5,
        trend: 'up'
    },
    {
        id: 'CAR-002',
        name: 'Fast Track Shipping',
        rating: 4.6,
        onTimeDelivery: 96.2,
        damageRate: 0.5,
        avgDeliveryTime: 2.4,
        totalShipments: 423,
        activeVehicles: 22,
        costPerKg: 11.8,
        trend: 'up'
    },
    {
        id: 'CAR-003',
        name: 'Gulf Express',
        rating: 4.4,
        onTimeDelivery: 94.8,
        damageRate: 0.8,
        avgDeliveryTime: 2.6,
        totalShipments: 389,
        activeVehicles: 18,
        costPerKg: 10.5,
        trend: 'stable'
    },
    {
        id: 'CAR-004',
        name: 'Quick Delivery Co',
        rating: 4.2,
        onTimeDelivery: 92.1,
        damageRate: 1.2,
        avgDeliveryTime: 2.8,
        totalShipments: 356,
        activeVehicles: 15,
        costPerKg: 9.8,
        trend: 'down'
    },
    {
        id: 'CAR-005',
        name: 'Northern Logistics',
        rating: 4.5,
        onTimeDelivery: 95.5,
        damageRate: 0.6,
        avgDeliveryTime: 2.5,
        totalShipments: 412,
        activeVehicles: 20,
        costPerKg: 11.2,
        trend: 'up'
    },
    {
        id: 'CAR-006',
        name: 'Coast Shipping',
        rating: 3.9,
        onTimeDelivery: 88.3,
        damageRate: 1.8,
        avgDeliveryTime: 3.2,
        totalShipments: 287,
        activeVehicles: 12,
        costPerKg: 8.5,
        trend: 'down'
    }
];

const monthlyTrends = [
    { month: 'Aug', onTime: 92, damage: 1.2, rating: 4.3 },
    { month: 'Sep', onTime: 93, damage: 1.0, rating: 4.4 },
    { month: 'Oct', onTime: 94, damage: 0.9, rating: 4.4 },
    { month: 'Nov', onTime: 95, damage: 0.7, rating: 4.5 },
    { month: 'Dec', onTime: 93, damage: 0.8, rating: 4.4 },
    { month: 'Jan', onTime: 94, damage: 0.6, rating: 4.5 }
];

const performanceByCategory = [
    { category: 'On-Time Delivery', score: 94 },
    { category: 'Damage Prevention', score: 92 },
    { category: 'Cost Efficiency', score: 88 },
    { category: 'Communication', score: 90 },
    { category: 'Documentation', score: 95 },
    { category: 'Customer Satisfaction', score: 91 }
];

const radarData = [
    { subject: 'Timeliness', A: 98, B: 88, fullMark: 100 },
    { subject: 'Safety', A: 95, B: 82, fullMark: 100 },
    { subject: 'Cost', A: 85, B: 90, fullMark: 100 },
    { subject: 'Service', A: 92, B: 78, fullMark: 100 },
    { subject: 'Reliability', A: 96, B: 85, fullMark: 100 },
    { subject: 'Flexibility', A: 88, B: 80, fullMark: 100 }
];

export default function CarrierPerformancePage() {
    const [selectedPeriod, setSelectedPeriod] = useState('6months');
    const [sortBy, setSortBy] = useState('rating');

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return 'text-green-600';
        if (rating >= 4.0) return 'text-blue-600';
        if (rating >= 3.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
            default: return <div className="w-4 h-0.5 bg-gray-400 rounded"></div>;
        }
    };

    const sortedCarriers = [...carriers].sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'onTime') return b.onTimeDelivery - a.onTimeDelivery;
        if (sortBy === 'shipments') return b.totalShipments - a.totalShipments;
        return 0;
    });

    return (
        <div className="p-6 space-y-3 text-sm font-medium">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="h-8 w-8 text-orange-600" />
                        Carrier Performance Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1 uppercase text-[10px] font-black tracking-widest leading-none">
                        Monitor and analyze carrier performance metrics
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold bg-white"
                    >
                        <option value="30days">Last 30 Days</option>
                        <option value="3months">Last 3 Months</option>
                        <option value="6months">Last 6 Months</option>
                        <option value="1year">Last Year</option>
                    </select>
                    <button onClick={() => exportToCsv('carrier-performance', sortedCarriers)} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 shadow-md font-black uppercase text-[10px] tracking-widest">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">On-Time Delivery</p>
                            <p className="text-2xl font-black text-green-600 mt-1 italic tracking-tighter">{overallStats.avgOnTimeDelivery}%</p>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Rating</p>
                            <p className="text-2xl font-black text-yellow-600 mt-1 italic tracking-tighter flex items-center gap-1">
                                {overallStats.avgRating} <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            </p>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                            <Star className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Shipments</p>
                            <p className="text-2xl font-black text-gray-900 mt-1 italic tracking-tighter">{overallStats.totalShipments.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Package className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Carriers</p>
                            <p className="text-2xl font-black text-gray-900 mt-1 italic tracking-tighter">{overallStats.activeCarriers}</p>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <Truck className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 p-3 rounded-xl text-white shadow-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Top Performer</p>
                            <p className="text-sm font-black text-white mt-1">{overallStats.topPerformer}</p>
                        </div>
                        <div className="p-2 bg-gray-800 rounded-lg text-orange-500">
                            <Award className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Performance Trend */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest italic flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-orange-600" /> Performance Trend
                        </h3>
                        <div className="flex gap-2 text-[10px]">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> On-Time %</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Rating</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={monthlyTrends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                            <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" domain={[80, 100]} />
                            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                            <Line type="monotone" dataKey="onTime" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Radar Chart */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest italic flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-orange-600" /> Performance Matrix
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9 }} />
                            <PolarRadiusAxis tick={{ fontSize: 8 }} domain={[0, 100]} />
                            <Radar name="Top Carrier" dataKey="A" stroke="#f97316" fill="#fed7aa" fillOpacity={0.6} />
                            <Radar name="Average" dataKey="B" stroke="#6b7280" fill="#e5e7eb" fillOpacity={0.4} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Carrier Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest italic flex items-center gap-2">
                        <Truck className="w-4 h-4 text-orange-600" /> Carrier Performance Ranking
                    </h3>
                    <div className="flex items-center gap-3">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold bg-white uppercase"
                        >
                            <option value="rating">Sort by Rating</option>
                            <option value="onTime">Sort by On-Time %</option>
                            <option value="shipments">Sort by Shipments</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 border-b border-gray-100">
                            <tr>
                                <th className="px-3 py-2">Rank</th>
                                <th className="px-3 py-2">Carrier</th>
                                <th className="px-3 py-2 text-center">Rating</th>
                                <th className="px-3 py-2 text-center">On-Time %</th>
                                <th className="px-3 py-2 text-center">Damage Rate</th>
                                <th className="px-3 py-2 text-center">Avg Delivery</th>
                                <th className="px-3 py-2 text-center">Shipments</th>
                                <th className="px-3 py-2 text-center">Trend</th>
                                <th className="px-3 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sortedCarriers.map((carrier, index) => (
                                <tr key={carrier.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                                    <td className="px-3 py-2">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                index === 1 ? 'bg-gray-100 text-gray-700' :
                                                    index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'
                                            }`}>
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                                                <Truck className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{carrier.name}</span>
                                                <p className="text-[10px] text-gray-400">{carrier.activeVehicles} vehicles</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <span className={`font-black ${getRatingColor(carrier.rating)} flex items-center justify-center gap-1`}>
                                            {carrier.rating} <Star className="w-3 h-3 fill-current" />
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <span className={`font-bold ${carrier.onTimeDelivery >= 95 ? 'text-green-600' : carrier.onTimeDelivery >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {carrier.onTimeDelivery}%
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <span className={`font-bold ${carrier.damageRate <= 0.5 ? 'text-green-600' : carrier.damageRate <= 1.0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {carrier.damageRate}%
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-center text-gray-600 font-bold">
                                        {carrier.avgDeliveryTime} days
                                    </td>
                                    <td className="px-3 py-2 text-center text-gray-900 font-bold">
                                        {carrier.totalShipments}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        {getTrendIcon(carrier.trend)}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <button className="text-[10px] font-black text-orange-600 hover:text-orange-700 uppercase tracking-widest flex items-center gap-1 ml-auto">
                                            View <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Performance Categories */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                {performanceByCategory.map((cat, i) => (
                    <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{cat.category}</p>
                        <div className="flex items-end justify-between">
                            <span className={`text-2xl font-black italic tracking-tighter ${cat.score >= 93 ? 'text-green-600' : cat.score >= 88 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                {cat.score}%
                            </span>
                            <div className="w-12 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${cat.score >= 93 ? 'bg-green-500' : cat.score >= 88 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${cat.score}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
