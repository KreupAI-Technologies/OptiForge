'use client';

import React, { useState, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import {
    Send,
    Upload,
    Calendar,
    Receipt,
    Trash2,
    PlusCircle,
    IndianRupee,
    Plane,
    Building2,
    Car,
    Utensils,
    FileText,
    MapPin,
    Clock
} from 'lucide-react';

interface ExpenseItem {
    id: string;
    category: string;
    description: string;
    amount: number;
    date: string;
    receipt: string | null;
    vendor: string;
}

export default function SubmitTravelExpensePage() {
    const [selectedTrip, setSelectedTrip] = useState('TR-2025-001');
    const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
      let cancelled = false;
      (async () => {
        setIsLoading(true);
        setLoadError(null);
        try {
          const rows = await HrPagesService.travelRequests<any[]>();
          if (!cancelled) setExpenseItems(Array.isArray(rows) ? (rows as any) : []);
        } catch (err) {
          if (!cancelled) {
            setLoadError(err instanceof Error ? err.message : 'Failed to load data');
            setExpenseItems([]);
          }
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, []);

    const approvedTrips = [
        {
            id: 'TR-2025-001',
            purpose: 'Annual HR Conference 2025',
            destination: 'Mumbai',
            dates: 'Feb 20-23, 2025',
            advanceReceived: 45000
        },
        {
            id: 'TR-2025-002',
            purpose: 'Factory Audit - Chennai Plant',
            destination: 'Chennai',
            dates: 'Feb 25-26, 2025',
            advanceReceived: 15000
        }
    ];

    const categories = [
        { value: 'Flight', label: 'Flight', icon: Plane },
        { value: 'Hotel', label: 'Hotel/Accommodation', icon: Building2 },
        { value: 'Transport', label: 'Local Transport', icon: Car },
        { value: 'Meals', label: 'Meals', icon: Utensils },
        { value: 'Registration', label: 'Registration/Conference', icon: FileText },
        { value: 'Miscellaneous', label: 'Miscellaneous', icon: Receipt }
    ];

    const addExpenseItem = () => {
        const newItem: ExpenseItem = {
            id: Date.now().toString(),
            category: '',
            description: '',
            amount: 0,
            date: '',
            receipt: null,
            vendor: ''
        };
        setExpenseItems([...expenseItems, newItem]);
    };

    const removeExpenseItem = (id: string) => {
        if (expenseItems.length > 1) {
            setExpenseItems(expenseItems.filter(item => item.id !== id));
        }
    };

    const updateExpenseItem = (id: string, field: keyof ExpenseItem, value: string | number) => {
        setExpenseItems(expenseItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
    const selectedTripData = approvedTrips.find(t => t.id === selectedTrip);
    const advanceReceived = selectedTripData?.advanceReceived || 0;
    const balanceDue = totalExpenses - advanceReceived;

    const formatCurrency = (value: number) => {
        return `₹${value.toLocaleString()}`;
    };

    const getCategoryIcon = (category: string) => {
        const cat = categories.find(c => c.value === category);
        if (cat) {
            const Icon = cat.icon;
            return <Icon className="w-4 h-4" />;
        }
        return <Receipt className="w-4 h-4" />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Send className="w-8 h-8 text-indigo-500" />
                            Submit Travel Expense
                        </h1>
                        <p className="text-gray-400 mt-1">Create and submit travel expense claim for reimbursement</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                            Save as Draft
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                            <Send className="w-4 h-4" />
                            Submit for Approval
                        </button>
                    </div>
                </div>

                {/* Trip Selection */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-4">Select Approved Trip</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {approvedTrips.map((trip) => (
                            <div
                                key={trip.id}
                                onClick={() => setSelectedTrip(trip.id)}
                                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                                    selectedTrip === trip.id
                                        ? 'bg-indigo-500/20 border-indigo-500/50'
                                        : 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-white font-medium">{trip.purpose}</p>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {trip.destination}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {trip.dates}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Advance</p>
                                        <p className="text-indigo-400 font-medium">{formatCurrency(trip.advanceReceived)}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">{trip.id}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                        <p className="text-indigo-400 text-sm">Total Expenses</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                        <p className="text-blue-400 text-sm">Advance Received</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(advanceReceived)}</p>
                    </div>
                    <div className={`${balanceDue > 0 ? 'bg-green-500/10 border-green-500/30' : balanceDue < 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-500/10 border-gray-500/30'} border rounded-xl p-4`}>
                        <p className={`${balanceDue > 0 ? 'text-green-400' : balanceDue < 0 ? 'text-red-400' : 'text-gray-400'} text-sm`}>
                            {balanceDue > 0 ? 'To Receive' : balanceDue < 0 ? 'To Return' : 'Balance'}
                        </p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(Math.abs(balanceDue))}</p>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                        <p className="text-purple-400 text-sm">Expense Items</p>
                        <p className="text-2xl font-bold text-white">{expenseItems.length}</p>
                    </div>
                </div>

                {/* Expense Items */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-white">Expense Items</h2>
                        <button
                            onClick={addExpenseItem}
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Add Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        {expenseItems.map((item, index) => (
                            <div key={item.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                            {getCategoryIcon(item.category)}
                                        </span>
                                        <span className="text-sm font-medium text-gray-400">Item #{index + 1}</span>
                                    </div>
                                    {expenseItems.length > 1 && (
                                        <button
                                            onClick={() => removeExpenseItem(item.id)}
                                            className="p-1 hover:bg-red-500/20 text-red-400 rounded"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Category</label>
                                        <select
                                            value={item.category}
                                            onChange={(e) => updateExpenseItem(item.id, 'category', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="date"
                                                value={item.date}
                                                onChange={(e) => updateExpenseItem(item.id, 'date', e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Amount</label>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="number"
                                                value={item.amount || ''}
                                                onChange={(e) => updateExpenseItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Vendor/Merchant</label>
                                        <input
                                            type="text"
                                            value={item.vendor}
                                            onChange={(e) => updateExpenseItem(item.id, 'vendor', e.target.value)}
                                            placeholder="Vendor name"
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Description</label>
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => updateExpenseItem(item.id, 'description', e.target.value)}
                                            placeholder="Brief description of expense"
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Receipt</label>
                                        <div className="flex items-center gap-2">
                                            {item.receipt ? (
                                                <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                                                    <FileText className="w-4 h-4 text-green-400" />
                                                    <span className="text-green-400 text-sm truncate">{item.receipt}</span>
                                                </div>
                                            ) : (
                                                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white text-sm transition-colors">
                                                    <Upload className="w-4 h-4" />
                                                    Upload Receipt
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submission Guidelines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Submission Guidelines</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex items-start gap-2">
                                <Receipt className="w-4 h-4 text-indigo-400 mt-0.5" />
                                <span>Attach original receipts for all expenses</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Calendar className="w-4 h-4 text-indigo-400 mt-0.5" />
                                <span>Submit within 14 days of travel completion</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-indigo-400 mt-0.5" />
                                <span>Include boarding passes for flight claims</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Per Diem Rates</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
                                <span className="text-gray-400">Meals (Domestic)</span>
                                <span className="text-white">₹1,500/day</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
                                <span className="text-gray-400">Local Transport</span>
                                <span className="text-white">Actuals up to ₹2,000/day</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
                                <span className="text-gray-400">Incidentals</span>
                                <span className="text-white">₹500/day</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
