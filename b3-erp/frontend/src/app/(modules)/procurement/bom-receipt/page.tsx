'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Package,
    FileText,
    Calendar,
    User,
    CheckCircle,
    Clock,
    AlertCircle,
    ShoppingCart,
} from 'lucide-react';
import { procurementBomReceiptService } from '@/services/procurement-bom-receipt.service';

interface BOMReceipt {
    id: string;
    bomCode: string;
    productName: string;
    submittedBy: string;
    submittedDate: string;
    status: 'Received' | 'PR Generated' | 'PO Created' | 'In Progress';
    itemsCount: number;
    totalValue: number;
    category: {
        accessories: number;
        fittings: number;
        materials: number;
    };
    prNumber?: string;
    poNumber?: string;
}

export default function BOMReceiptPage() {
    const [receipts, setReceipts] = useState<BOMReceipt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await procurementBomReceiptService.getReceipts();
                const mapped: BOMReceipt[] = raw.map((r) => ({
                    id: r.id,
                    bomCode: r.bomCode,
                    productName: r.productName,
                    submittedBy: r.submittedBy ?? '',
                    submittedDate: r.submittedDate
                        ? String(r.submittedDate).slice(0, 10)
                        : '',
                    status: (r.status as BOMReceipt['status']) ?? 'Received',
                    itemsCount: Number(r.itemsCount ?? 0),
                    totalValue: Number(r.totalValue ?? 0),
                    category: {
                        accessories: Number(r.accessoriesCount ?? 0),
                        fittings: Number(r.fittingsCount ?? 0),
                        materials: Number(r.materialsCount ?? 0),
                    },
                    prNumber: r.prNumber || undefined,
                    poNumber: r.poNumber || undefined,
                }));
                if (!cancelled) setReceipts(mapped);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(
                        err instanceof Error ? err.message : 'Failed to load BOM receipts',
                    );
                    setReceipts([]);
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PO Created':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'PR Generated':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'In Progress':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Received':
                return 'bg-gray-100 text-gray-800 border-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PO Created':
                return <CheckCircle className="w-4 h-4" />;
            case 'PR Generated':
                return <FileText className="w-4 h-4" />;
            case 'In Progress':
                return <Clock className="w-4 h-4" />;
            case 'Received':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const stats = {
        total: receipts.length,
        received: receipts.filter((r) => r.status === 'Received').length,
        inProgress: receipts.filter((r) => r.status === 'In Progress').length,
        completed: receipts.filter((r) => r.status === 'PO Created').length,
    };

    return (
        <div className="w-full h-screen overflow-y-auto overflow-x-hidden bg-gray-50">
            <div className="px-3 py-2 space-y-3">
                {/* Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Link
                                href="/production/bom"
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    BOM Receipt & Procurement Workflow
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Phase 4: Receive BOMs from Technical Team and initiate procurement
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total BOMs</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <Package className="w-8 h-8 text-gray-600" />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Received</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.received}</p>
                            </div>
                            <AlertCircle className="w-8 h-8 text-gray-600" />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">PO Created</p>
                                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                            </div>
                            <CheckCircle className="w-8 w-8 text-green-600" />
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                        Loading BOM receipts…
                    </div>
                )}
                {loadError && !isLoading && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        {loadError}
                    </div>
                )}
                {!isLoading && !loadError && receipts.length === 0 && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                        No BOM receipts found.
                    </div>
                )}

                {/* BOMs List */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900">Received BOMs</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {receipts.map((receipt) => (
                            <div key={receipt.id} className="p-6 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="mb-3">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {receipt.bomCode} - {receipt.productName}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                                <User className="w-4 h-4" />
                                                <span>{receipt.submittedBy}</span>
                                                <Calendar className="w-4 h-4 ml-2" />
                                                <span>{receipt.submittedDate}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-sm">
                                            <div>
                                                <p className="text-xs text-gray-500">Total Items</p>
                                                <p className="font-medium text-gray-900">{receipt.itemsCount} items</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Total Value</p>
                                                <p className="font-medium text-gray-900">₹{receipt.totalValue.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Category Breakdown</p>
                                                <p className="font-medium text-gray-900">
                                                    A: {receipt.category.accessories} | F: {receipt.category.fittings} | M: {receipt.category.materials}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">PR/PO Status</p>
                                                <p className="font-medium text-gray-900">
                                                    {receipt.prNumber && <span className="text-blue-600">{receipt.prNumber}</span>}
                                                    {receipt.poNumber && <span className="text-green-600 ml-1">→ {receipt.poNumber}</span>}
                                                    {!receipt.prNumber && !receipt.poNumber && <span className="text-gray-500">Pending</span>}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="bg-purple-50 border border-purple-200 rounded px-2 py-1 text-xs text-purple-800">
                                                🔧 {receipt.category.accessories} Accessories
                                            </div>
                                            <div className="bg-pink-50 border border-pink-200 rounded px-2 py-1 text-xs text-pink-800">
                                                🔩 {receipt.category.fittings} Fittings
                                            </div>
                                            <div className="bg-blue-50 border border-blue-200 rounded px-2 py-1 text-xs text-blue-800">
                                                📦 {receipt.category.materials} Materials
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ml-6 flex flex-col items-end gap-3">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 border ${getStatusColor(receipt.status)}`}>
                                            {getStatusIcon(receipt.status)}
                                            {receipt.status}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {receipt.status === 'Received' && (
                                                <Link
                                                    href="/procurement/requisitions/add"
                                                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium flex items-center gap-1"
                                                >
                                                    <ShoppingCart className="w-4 h-4" />
                                                    Generate PR
                                                </Link>
                                            )}
                                            {receipt.prNumber && (
                                                <Link
                                                    href={`/procurement/requisitions`}
                                                    className="px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-xs font-medium"
                                                >
                                                    View PR
                                                </Link>
                                            )}
                                            {receipt.poNumber && (
                                                <Link
                                                    href={`/procurement/purchase-orders`}
                                                    className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-xs font-medium"
                                                >
                                                    View PO
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="text-sm font-medium text-blue-900">About BOM Receipt Workflow</h3>
                            <p className="text-sm text-blue-700 mt-1">
                                Step 4.1: Receive BOMs submitted from Phase 3 (Technical Team). System tracks category breakdown
                                (Accessories, Fittings, Materials) → Generate Purchase Requisitions → Create Purchase Orders.
                                Track the complete workflow from BOM receipt to PO creation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
