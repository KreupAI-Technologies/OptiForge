'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { inventoryService } from '@/services/InventoryService';
import {
    ArrowLeft,
    Calculator,
    TrendingDown,
    DollarSign,
    Package,
    RotateCcw,
    BarChart2,
    Download,
    Save,
    Info
} from 'lucide-react';

interface EOQItem {
    id: string;
    itemCode: string;
    itemName: string;
    category?: string;
    annualDemand: number;
    orderingCost: number; // Cost per order
    unitCost: number;
    holdingCostPercentage: number; // e.g. 0.20 for 20%
    eoq?: number; // Backend-computed EOQ, when available
    orderFrequency?: number; // annualDemand / eoq
}

const EOQPage = () => {
    const router = useRouter();

    // Calculator State
    const [demand, setDemand] = useState<number>(10000);
    const [orderCost, setOrderCost] = useState<number>(50);
    const [holdingCost, setHoldingCost] = useState<number>(2); // Annual holding cost per unit

    // Derived Values
    const [eoq, setEoq] = useState<number>(0);
    const [annualOrders, setAnnualOrders] = useState<number>(0);
    const [cycleTime, setCycleTime] = useState<number>(0); // Days
    const [totalCost, setTotalCost] = useState<number>(0);

    // Items for Simulation (loaded from backend)
    const [simulationItems, setSimulationItems] = useState<EOQItem[]>([]);

    const loadItems = async () => {
        try {
            const res = await inventoryService.getOptimization();
            const list = Array.isArray(res?.items) ? res.items : [];
            const mapped: EOQItem[] = list.map((row: any, idx: number) => {
                const annualDemand = Number(row?.annualDemand) || 0;
                const unitCost = Number(row?.unitCost) || 0;
                const eoq = Number(row?.eoq) || 0;
                const orderFrequency = eoq > 0 ? annualDemand / eoq : 0;
                return {
                    id: String(row?.id ?? idx),
                    itemCode: row?.itemCode ?? '',
                    itemName: row?.itemName ?? '',
                    category: row?.category ?? '',
                    annualDemand,
                    // Backend does not return ordering cost / holding % directly;
                    // use conventional defaults so per-item math stays sensible.
                    orderingCost: Number(row?.orderingCost) || 50,
                    unitCost,
                    holdingCostPercentage: Number(row?.holdingCostPercentage) || 0.20,
                    eoq,
                    orderFrequency,
                };
            });
            setSimulationItems(mapped);
        } catch (err) {
            console.error('Failed to load EOQ optimization data', err);
            setSimulationItems([]);
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    useEffect(() => {
        // EOQ Formula: sqrt((2 * D * S) / H)
        // D = Annual Demand
        // S = Ordering Cost (Setup cost per order)
        // H = Annual Holding Cost per unit
        if (demand > 0 && orderCost > 0 && holdingCost > 0) {
            const q = Math.sqrt((2 * demand * orderCost) / holdingCost);
            const orders = demand / q;
            const cycle = 365 / orders;

            // Total Cost = (D/Q * S) + (Q/2 * H)
            const orderingTotal = orders * orderCost;
            const holdingTotal = (q / 2) * holdingCost;
            const total = orderingTotal + holdingTotal;

            setEoq(Math.round(q));
            setAnnualOrders(Math.round(orders * 10) / 10);
            setCycleTime(Math.round(cycle));
            setTotalCost(Math.round(total));
        }
    }, [demand, orderCost, holdingCost]);

    const calculateItemEOQ = (item: EOQItem) => {
        // Prefer backend-computed EOQ when available.
        if (item.eoq && item.eoq > 0) return Math.round(item.eoq);
        const h = item.unitCost * item.holdingCostPercentage;
        if (!(h > 0)) return 0;
        const q = Math.sqrt((2 * item.annualDemand * item.orderingCost) / h);
        return Math.round(q) || 0;
    };

    const calculateItemTotalCost = (item: EOQItem) => {
        const q = calculateItemEOQ(item);
        if (!(q > 0)) return 0;
        const h = item.unitCost * item.holdingCostPercentage;
        const orderingTotal = (item.annualDemand / q) * item.orderingCost;
        const holdingTotal = (q / 2) * h;
        return Math.round(orderingTotal + holdingTotal);
    };

    return (
        <div className="w-full h-full p-3 space-y-3 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Optimization
                    </button>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-gray-900">Economic Order Quantity (EOQ)</h1>
                        <Calculator className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-gray-600">Determine the optimal order quantity to minimize total inventory costs</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 bg-white shadow-sm transition-all">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Calculator Inputs */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 lg:col-span-1 space-y-3">
                    <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">EOQ Calculator</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Annual Demand (Units)
                        </label>
                        <input
                            type="number"
                            value={demand}
                            onChange={(e) => setDemand(parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ordering Cost (Per Order)
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="number"
                                value={orderCost}
                                onChange={(e) => setOrderCost(parseFloat(e.target.value) || 0)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Includes setup, shipping, processing</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Annual Holding Cost (Per Unit)
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="number"
                                value={holdingCost}
                                onChange={(e) => setHoldingCost(parseFloat(e.target.value) || 0)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Storage, insurance, obsolescence (Annual $/unit)</p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg flex gap-3 text-sm text-blue-800">
                        <Info className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>
                            EOQ = √[(2 × D × S) / H] <br />
                            Where D = Demand, S = Ordering Cost, H = Holding Cost
                        </p>
                    </div>
                </div>

                {/* Results Dashboard */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-2 auto-rows-min">

                    {/* Main EOQ Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-md p-3 text-white md:col-span-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-blue-100 font-medium">Optimal Order Quantity (EOQ)</p>
                                <div className="text-5xl font-bold mt-2">{eoq.toLocaleString()} <span className="text-2xl font-medium opacity-80">units</span></div>
                            </div>
                            <Package className="w-12 h-12 text-blue-300 opacity-50" />
                        </div>
                        <div className="mt-6 pt-4 border-t border-blue-500/50 flex flex-wrap gap-8">
                            <div>
                                <p className="text-blue-200 text-sm">Total Annual Cost</p>
                                <p className="text-xl font-semibold">${totalCost.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-blue-200 text-sm">Holding Cost</p>
                                <p className="text-xl font-semibold">${(Math.round((eoq / 2) * holdingCost)).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-blue-200 text-sm">Ordering Cost</p>
                                <p className="text-xl font-semibold">${(Math.round(annualOrders * orderCost)).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Operational Metrics */}
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 font-medium text-sm">Orders Per Year</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{annualOrders}</p>
                            <p className="text-xs text-gray-400 mt-1">Based on annual demand</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <RotateCcw className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 font-medium text-sm">Order Cycle Time</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{cycleTime} Days</p>
                            <p className="text-xs text-gray-400 mt-1">Time between orders</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <RotateCcw className="w-6 h-6 text-green-600" />
                        </div>
                    </div>

                    {/* Cost Curve visualization placeholder - simplified */}
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 md:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">Cost Trade-off Analysis</h3>
                            <BarChart2 className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="h-40 flex items-end justify-between gap-2 px-4 pb-4 border-b border-l border-gray-300 relative">
                            {/* Just a visual CSS representation of a curve */}
                            {[...Array(20)].map((_, i) => {
                                const x = i / 19; // 0 to 1
                                // Mock curve: Total Cost Curve is somewhat parabolic
                                const y = Math.pow(x - 0.4, 2) * 50 + 20;
                                // Holding is linear up
                                const holding = x * 80 + 10;
                                // Ordering is 1/x curve
                                const ordering = (1 / (x + 0.1)) * 10;

                                return (
                                    <div key={i} className="flex flex-col justify-end h-full w-full gap-0.5 items-center group relative">
                                        <div className="w-1.5 bg-blue-500 rounded-t-sm opacity-20" style={{ height: `${y}%` }} />
                                        <div className="w-1.5 bg-green-500 rounded-t-sm opacity-20 absolute bottom-0" style={{ height: `${holding}%` }} />
                                        <div className="w-1.5 bg-purple-500 rounded-t-sm opacity-20 absolute bottom-0" style={{ height: `${ordering}%` }} />
                                    </div>
                                )
                            })}
                            <div className="absolute top-2 right-4 text-xs text-gray-500">
                                <span className="inline-block w-2 h-2 bg-blue-300 mr-1 rounded-full"></span> Total Cost <br />
                                <span className="inline-block w-2 h-2 bg-green-300 mr-1 rounded-full"></span> Holding <br />
                                <span className="inline-block w-2 h-2 bg-purple-300 mr-1 rounded-full"></span> Ordering
                            </div>
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-2">Order Quantity (Q)</p>
                    </div>
                </div>
            </div>

            {/* Simulation Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Item Simulation</h3>
                    <p className="text-sm text-gray-500">Calculate EOQ for specific inventory items</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Item</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Annual Demand</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Ordering Cost</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Holding Cost</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-blue-600 uppercase bg-blue-50">Optimal Qty (EOQ)</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Min Annual Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {simulationItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-2">
                                        <p className="font-medium text-gray-900">{item.itemName}</p>
                                        <p className="text-xs text-gray-500">{item.itemCode}</p>
                                    </td>
                                    <td className="px-3 py-2 text-right text-sm text-gray-700">
                                        {item.annualDemand.toLocaleString()}
                                    </td>
                                    <td className="px-3 py-2 text-right text-sm text-gray-700">
                                        ${item.orderingCost}
                                    </td>
                                    <td className="px-3 py-2 text-right text-sm text-gray-700">
                                        ${(item.unitCost * item.holdingCostPercentage).toFixed(2)} <span className="text-xs text-gray-400">/unit</span>
                                    </td>
                                    <td className="px-3 py-2 text-right bg-blue-50/50">
                                        <span className="text-lg font-bold text-blue-700">{calculateItemEOQ(item).toLocaleString()}</span>
                                    </td>
                                    <td className="px-3 py-2 text-right text-sm font-medium text-green-700">
                                        ${calculateItemTotalCost(item).toLocaleString()}
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

export default EOQPage;
