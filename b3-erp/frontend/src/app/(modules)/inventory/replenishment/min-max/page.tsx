'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { inventoryService } from '@/services/InventoryService';
import {
    ArrowLeft,
    Search,
    TrendingUp,
    TrendingDown,
    Edit,
    Save,
    X,
    AlertCircle,
    Calculator,
    Download,
    Upload,
    RefreshCcw,
    Check
} from 'lucide-react';

interface MinMaxSetting {
    id: string;
    itemCode: string;
    itemName: string;
    category: string;
    currentStock: number;
    minLevel: number;
    maxLevel: number;
    reorderPoint: number;
    uom: string;
    location: string;
    leadTimeDays: number;
    avgDailyUsage: number;
    safetyStock: number;
}

const MinMaxPlanningPage = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Partial<MinMaxSetting>>({});

    // Data loaded from backend
    const [items, setItems] = useState<MinMaxSetting[]>([]);

    const loadItems = async () => {
        try {
            const res = await inventoryService.getOptimization();
            const list = Array.isArray(res?.items) ? res.items : [];
            const mapped: MinMaxSetting[] = list.map((row: any, idx: number) => {
                const annualDemand = Number(row?.annualDemand) || 0;
                const avgDailyUsage = annualDemand > 0 ? Math.round(annualDemand / 365) : 0;
                return {
                    id: String(row?.id ?? idx),
                    itemCode: row?.itemCode ?? '',
                    itemName: row?.itemName ?? '',
                    category: row?.category ?? '',
                    currentStock: Number(row?.currentQty) || 0,
                    minLevel: Number(row?.minLevel) || 0,
                    maxLevel: Number(row?.maxLevel) || 0,
                    reorderPoint: Number(row?.suggestedReorderLevel) ||
                        Number(row?.currentReorderLevel) || 0,
                    uom: row?.uom ?? 'Units',
                    location: row?.warehouse ?? '',
                    leadTimeDays: Number(row?.leadTimeDays) || 7,
                    avgDailyUsage,
                    safetyStock: Number(row?.suggestedSafetyStock) ||
                        Number(row?.currentSafetyStock) || 0,
                };
            });
            setItems(mapped);
        } catch (err) {
            console.error('Failed to load min/max optimization data', err);
            setItems([]);
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    const handleEdit = (item: MinMaxSetting) => {
        setEditingId(item.id);
        setEditValues({
            minLevel: item.minLevel,
            maxLevel: item.maxLevel,
            reorderPoint: item.reorderPoint,
            safetyStock: item.safetyStock
        });
    };

    const handleSave = (id: string) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, ...editValues } : item
        ));
        setEditingId(null);
        setEditValues({});
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValues({});
    };

    const calculateSuggestedLevels = (item: MinMaxSetting) => {
        // Basic calculation logic
        // Min = (Avg Daily Usage * Lead Time) + Safety Stock
        // Max = Min + (Avg Daily Usage * 30) // Assuming monthly replenishment cycle
        // Reorder Point = (Avg Daily Usage * Lead Time) + Safety Stock

        const suggestedMin = Math.ceil((item.avgDailyUsage * item.leadTimeDays) + item.safetyStock);
        const suggestedMax = Math.ceil(suggestedMin + (item.avgDailyUsage * 30));
        const suggestedReorder = suggestedMin; // Usually same as Min or slightly higher

        setEditValues({
            ...editValues,
            minLevel: suggestedMin,
            maxLevel: suggestedMax,
            reorderPoint: suggestedReorder,
            safetyStock: item.safetyStock
        });
    };

    const filteredItems = items.filter(item =>
        item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full h-full p-3 space-y-3">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Replenishment
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Min/Max Planning</h1>
                    <p className="text-gray-600">Configure safety stock, reorder points, and maximum inventory levels</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 bg-white shadow-sm transition-all">
                        <Upload className="w-4 h-4" />
                        Import
                    </button>
                    <button
                        onClick={loadItems}
                        className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 shadow-sm transition-all"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by code, product name, or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item Details</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usage Stats</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Min Level</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Max Level</th>
                                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reorder Point</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-2">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{item.itemName}</span>
                                            <span className="text-xs text-gray-500">{item.itemCode}</span>
                                            <span className="text-xs text-blue-600 mt-1">{item.category}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between gap-2">
                                                <span className="text-gray-500">Lead Time:</span>
                                                <span className="font-medium">{item.leadTimeDays} days</span>
                                            </div>
                                            <div className="flex justify-between gap-2">
                                                <span className="text-gray-500">Daily Usage:</span>
                                                <span className="font-medium">{item.avgDailyUsage} {item.uom}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Min Level */}
                                    <td className="px-3 py-2">
                                        {editingId === item.id ? (
                                            <input
                                                type="number"
                                                value={editValues.minLevel}
                                                onChange={(e) => setEditValues({ ...editValues, minLevel: parseInt(e.target.value) || 0 })}
                                                className="w-20 px-2 py-1 border border-blue-500 rounded text-sm focus:outline-none"
                                            />
                                        ) : (
                                            <span className="text-sm font-medium text-gray-900">{item.minLevel} {item.uom}</span>
                                        )}
                                    </td>

                                    {/* Max Level */}
                                    <td className="px-3 py-2">
                                        {editingId === item.id ? (
                                            <input
                                                type="number"
                                                value={editValues.maxLevel}
                                                onChange={(e) => setEditValues({ ...editValues, maxLevel: parseInt(e.target.value) || 0 })}
                                                className="w-20 px-2 py-1 border border-blue-500 rounded text-sm focus:outline-none"
                                            />
                                        ) : (
                                            <span className="text-sm font-medium text-gray-900">{item.maxLevel} {item.uom}</span>
                                        )}
                                    </td>

                                    {/* Reorder Point */}
                                    <td className="px-3 py-2">
                                        {editingId === item.id ? (
                                            <div className="flex flex-col gap-1">
                                                <input
                                                    type="number"
                                                    value={editValues.reorderPoint}
                                                    onChange={(e) => setEditValues({ ...editValues, reorderPoint: parseInt(e.target.value) || 0 })}
                                                    className="w-20 px-2 py-1 border border-blue-500 rounded text-sm focus:outline-none"
                                                />
                                                <button
                                                    onClick={() => calculateSuggestedLevels(item)}
                                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                    title="Calculate based on usage"
                                                >
                                                    <RefreshCcw className="w-3 h-3" /> Auto
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-sm font-medium text-gray-900">{item.reorderPoint} {item.uom}</span>
                                        )}
                                    </td>

                                    <td className="px-3 py-2 text-right">
                                        {editingId === item.id ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleSave(item.id)}
                                                    className="p-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    className="p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MinMaxPlanningPage;
