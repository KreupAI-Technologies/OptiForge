'use client';

import React, { useState, useEffect } from 'react';
import {
    Package,
    Search,
    Filter,
    MapPin,
    Clock,
    AlertTriangle,
    ArrowRight,
    Truck,
    BarChart2
} from 'lucide-react';
import { inventoryService } from '@/services/InventoryService';

interface TrackingItem {
    id: string;
    sku: string;
    name: string;
    batchNumber: string;
    location: string;
    quantity: number;
    status: 'In Stock' | 'Low Stock' | 'In Transit' | 'Expired';
    expiryDate: string;
    lastMovement: string;
}

export default function InventoryTrackingPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Tracking view shows batch-tracked stock (batch number, location, expiry,
    // movement) so it is wired to the batch-numbers endpoint.
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await inventoryService.getBatchNumbers();
                const mapped = raw.map((b: any, idx: number) => {
                    const qty = Number(b.availableQuantity ?? b.initialQuantity ?? 0);
                    let status: TrackingItem['status'] = 'In Stock';
                    if (b.isExpired || b.status === 'Expired') status = 'Expired';
                    else if (b.status === 'Quarantine' || b.status === 'Recalled') status = 'In Transit';
                    else if (qty <= 0) status = 'Low Stock';
                    return {
                        id: b.id ?? String(idx),
                        sku: b.itemCode ?? '',
                        name: b.itemName ?? '',
                        batchNumber: b.batchNumber ?? '',
                        location: b.warehouseName ?? b.locationName ?? '',
                        quantity: qty,
                        status,
                        expiryDate: b.expiryDate ?? '',
                        lastMovement: b.updatedAt ?? b.receiptDate ?? b.createdAt ?? '',
                    };
                });
                if (!cancelled) setItems(mapped);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load tracking items');
                    setItems([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'In Stock': return 'bg-green-500/20 text-green-400';
            case 'Low Stock': return 'bg-yellow-500/20 text-yellow-400';
            case 'In Transit': return 'bg-blue-500/20 text-blue-400';
            case 'Expired': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-3">
            <div className="w-full space-y-3">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <MapPin className="w-8 h-8 text-blue-500" />
                            Inventory Tracking
                        </h1>
                        <p className="text-gray-400 mt-1">Real-time tracking of stock movements, locations, and status.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            <BarChart2 className="w-4 h-4" />
                            Reports
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg shadow-blue-900/20">
                            <Truck className="w-4 h-4" />
                            Record Movement
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 border border-gray-700 flex flex-wrap gap-2 items-center">
                    <div className="flex-1 min-w-[300px] relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, SKU, or batch..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="In Stock">In Stock</option>
                            <option value="Low Stock">Low Stock</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Expired">Expired</option>
                        </select>
                    </div>
                </div>

                {/* Items Table */}
                <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-900/50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Item Details</th>
                                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Batch & Location</th>
                                    <th className="px-3 py-2 text-right text-sm font-semibold text-gray-300">Quantity</th>
                                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-3 py-2 text-left text-sm font-semibold text-gray-300">Last Movement</th>
                                    <th className="px-3 py-2 text-center text-sm font-semibold text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-700/50 transition-colors">
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-700 rounded-lg">
                                                    <Package className="w-5 h-5 text-blue-400" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{item.name}</div>
                                                    <div className="text-xs text-gray-400 font-mono">{item.sku}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="text-sm text-gray-300">{item.location}</div>
                                            <div className="text-xs text-gray-500 font-mono">Batch: {item.batchNumber}</div>
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono text-white">
                                            {item.quantity}
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {item.lastMovement}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-center">
                                            <button className="text-blue-400 hover:text-blue-300">
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
