'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { inventoryService } from '@/services/InventoryService';
import {
    ArrowLeft,
    ShieldCheck,
    TrendingUp,
    TrendingDown,
    DollarSign,
    AlertTriangle,
    RefreshCw,
    Info,
    Sliders,
    Download,
    Save,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

interface SafetyStockItem {
    id: string;
    itemCode: string;
    itemName: string;
    category: string;
    avgDailyDemand: number;
    stdDevDemand: number;
    leadTime: number; // in days
    stdDevLeadTime: number;
    unitCost: number;
    currentSafetystock: number;
    suggestedSafetyStock?: number; // Backend recommendation, when available
    currentReorderLevel?: number;
    suggestedReorderLevel?: number;
    holdingCostRate: number; // annual percentage
}

const SafetyStockPage = () => {
    const router = useRouter();

    // State for Service Level (Target Z-score)
    // 90% = 1.28, 95% = 1.645, 99% = 2.33, 99.9% = 3.09
    const [serviceLevel, setServiceLevel] = useState<number>(95);
    const [zScore, setZScore] = useState<number>(1.645);

    // State for items (loaded from backend)
    const [items, setItems] = useState<SafetyStockItem[]>([]);

    const loadItems = async () => {
        try {
            const res = await inventoryService.getOptimization();
            const list = Array.isArray(res?.items) ? res.items : [];
            const mapped: SafetyStockItem[] = list.map((row: any, idx: number) => {
                const annualDemand = Number(row?.annualDemand) || 0;
                // Derive an approximate daily demand for the statistical model
                // (backend supplies annual demand, not daily samples).
                const avgDailyDemand = annualDemand > 0 ? annualDemand / 365 : 0;
                return {
                    id: String(row?.id ?? idx),
                    itemCode: row?.itemCode ?? '',
                    itemName: row?.itemName ?? '',
                    category: row?.category ?? '',
                    avgDailyDemand,
                    stdDevDemand: avgDailyDemand * 0.2, // conservative variability estimate
                    leadTime: Number(row?.leadTime) || 7,
                    stdDevLeadTime: Number(row?.stdDevLeadTime) || 1,
                    unitCost: Number(row?.unitCost) || 0,
                    currentSafetystock: Number(row?.currentSafetyStock) || 0,
                    suggestedSafetyStock: Number(row?.suggestedSafetyStock) || 0,
                    currentReorderLevel: Number(row?.currentReorderLevel) || 0,
                    suggestedReorderLevel: Number(row?.suggestedReorderLevel) || 0,
                    holdingCostRate: Number(row?.holdingCostRate) || 0.20,
                };
            });
            setItems(mapped);
        } catch (err) {
            console.error('Failed to load safety stock optimization data', err);
            setItems([]);
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    // Update Z-score when service level changes
    useEffect(() => {
        // Simplified lookup for demo purposes
        let z = 1.645;
        if (serviceLevel >= 99.9) z = 3.09;
        else if (serviceLevel >= 99) z = 2.33;
        else if (serviceLevel >= 98) z = 2.05;
        else if (serviceLevel >= 95) z = 1.645;
        else if (serviceLevel >= 90) z = 1.28;
        else if (serviceLevel >= 85) z = 1.04;
        else z = 0.84; // 80%

        setZScore(z);
    }, [serviceLevel]);

    const calculateRecommendedSafetyStock = (item: SafetyStockItem) => {
        // Prefer backend-suggested safety stock when available.
        if (item.suggestedSafetyStock && item.suggestedSafetyStock > 0) {
            return Math.ceil(item.suggestedSafetyStock);
        }
        // Formula: SS = Z * sqrt((AvgLeadTime * stdDevDemand^2) + (AvgDailyDemand^2 * stdDevLeadTime^2))
        const varianceDemand = Math.pow(item.stdDevDemand, 2);
        const varianceLeadTime = Math.pow(item.stdDevLeadTime, 2);
        const demandComponent = item.leadTime * varianceDemand;
        const leadTimeComponent = Math.pow(item.avgDailyDemand, 2) * varianceLeadTime;

        const combinedStdDev = Math.sqrt(demandComponent + leadTimeComponent);
        return Math.ceil(zScore * combinedStdDev);
    };

    const calculateHoldingCost = (item: SafetyStockItem, safetyStockQty: number) => {
        return (safetyStockQty * item.unitCost * item.holdingCostRate).toFixed(2);
    };

    const totalCurrentInvestment = items.reduce((acc, item) => {
        return acc + (item.currentSafetystock * item.unitCost);
    }, 0);

    const totalProjectedInvestment = items.reduce((acc, item) => {
        return acc + (calculateRecommendedSafetyStock(item) * item.unitCost);
    }, 0);

    const investmentDiff = totalProjectedInvestment - totalCurrentInvestment;

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
                        <h1 className="text-2xl font-bold text-gray-900">Safety Stock Optimization</h1>
                        <ShieldCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-gray-600">Balance inventory costs against stockout risks using statistical models</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 bg-white shadow-sm transition-all">
                        <Download className="w-4 h-4" />
                        Export Analysis
                    </button>
                    <button
                        onClick={loadItems}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Control Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Service Level Slider */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Sliders className="w-5 h-5 text-gray-500" />
                            Target Service Level
                        </h2>
                        <span className="text-2xl font-bold text-blue-600">{serviceLevel}%</span>
                    </div>

                    <input
                        type="range"
                        min="80"
                        max="99.9"
                        step="0.1"
                        value={serviceLevel}
                        onChange={(e) => setServiceLevel(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />

                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>80% (Low Priority)</span>
                        <span>90% (Standard)</span>
                        <span>95% (High)</span>
                        <span>99.9% (Critical)</span>
                    </div>

                    <div className="mt-6 bg-blue-50 p-3 rounded-lg border border-blue-100 flex gap-2 items-start">
                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">What does this mean?</p>
                            <p className="text-sm text-blue-700 mt-1">
                                A <strong>{serviceLevel}%</strong> service level means you are targeting to satisfy demand from stock without delay
                                with a <strong>{serviceLevel}%</strong> probability during the replenishment lead time.
                                Higher service levels require more safety stock.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Impact Analysis Cards */}
                <div className="space-y-2">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Safety Stock Investment</p>
                        <p className="text-2xl font-bold text-gray-900">${totalProjectedInvestment.toLocaleString()}</p>
                        <div className={`text-sm mt-1 flex items-center gap-1 ${investmentDiff >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {investmentDiff >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {investmentDiff >= 0 ? '+' : ''}${Math.abs(investmentDiff).toLocaleString()} vs Current
                        </div>
                    </div>

                    <div className={`p-5 rounded-xl shadow-sm border ${serviceLevel >= 95 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                        <p className={`text-sm font-medium mb-1 ${serviceLevel >= 95 ? 'text-green-800' : 'text-yellow-800'}`}>Stockout Risk Factor</p>
                        <p className={`text-2xl font-bold ${serviceLevel >= 95 ? 'text-green-900' : 'text-yellow-900'}`}>
                            {(100 - serviceLevel).toFixed(1)}%
                        </p>
                        <p className={`text-sm mt-1 ${serviceLevel >= 95 ? 'text-green-700' : 'text-yellow-700'}`}>
                            Probability of stockout during lead time
                        </p>
                    </div>
                </div>
            </div>

            {/* Optimization Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Optimization Recommendations</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Item</th>
                                <th className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase">Input Factors</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Current SS</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-blue-600 uppercase bg-blue-50">Recommended SS</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Est. Annual Cost</th>
                                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {items.map((item) => {
                                const recommended = calculateRecommendedSafetyStock(item);
                                const diff = recommended - item.currentSafetystock;
                                const holdingCost = calculateHoldingCost(item, recommended);

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-2">
                                            <div>
                                                <p className="font-medium text-gray-900">{item.itemName}</p>
                                                <p className="text-xs text-gray-500">{item.itemCode}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                                                    {item.category}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="text-xs text-gray-600 space-y-1">
                                                <div className="flex justify-between w-40">
                                                    <span>Avg Demand:</span>
                                                    <span className="font-medium">{item.avgDailyDemand} ± {item.stdDevDemand}</span>
                                                </div>
                                                <div className="flex justify-between w-40">
                                                    <span>Lead Time:</span>
                                                    <span className="font-medium">{item.leadTime}d ± {item.stdDevLeadTime}d</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <span className="text-sm font-medium text-gray-700">{item.currentSafetystock}</span>
                                        </td>
                                        <td className="px-3 py-2 text-right bg-blue-50/50">
                                            <div className="flex flex-col items-end">
                                                <span className="text-lg font-bold text-blue-700">{recommended}</span>
                                                {diff !== 0 && (
                                                    <span className={`text-xs ${diff > 0 ? 'text-red-500' : 'text-green-500'} flex items-center`}>
                                                        {diff > 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                        {Math.abs(diff)} units
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <span className="text-sm text-gray-600">${holdingCost}/yr</span>
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SafetyStockPage;
