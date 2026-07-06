'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HrExpensesService } from '@/services/hr-expenses.service';
import {
    PlusCircle,
    Upload,
    Calendar,
    Receipt,
    Trash2,
    FileText,
    IndianRupee,
    Building,
    Tag
} from 'lucide-react';

interface ExpenseItem {
    id: string;
    category: string;
    description: string;
    amount: number;
    date: string;
    receipt: string | null;
    vendor: string;
    project: string;
    billable: boolean;
}

export default function SubmitExpensePage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([
        {
            id: '1',
            category: '',
            description: '',
            amount: 0,
            date: '',
            receipt: null,
            vendor: '',
            project: '',
            billable: false
        }
    ]);

    const [expenseTitle, setExpenseTitle] = useState('');
    const [expenseType, setExpenseType] = useState('Regular');

    const categories = [
        'Travel - Local',
        'Travel - Outstation',
        'Meals & Entertainment',
        'Office Supplies',
        'Software & Subscriptions',
        'Equipment',
        'Communication',
        'Professional Services',
        'Training & Development',
        'Miscellaneous'
    ];

    const projects = [
        'General Operations',
        'Project Alpha',
        'Project Beta',
        'Client - ABC Corp',
        'Client - XYZ Ltd',
        'Internal R&D'
    ];

    const addExpenseItem = () => {
        const newItem: ExpenseItem = {
            id: Date.now().toString(),
            category: '',
            description: '',
            amount: 0,
            date: '',
            receipt: null,
            vendor: '',
            project: '',
            billable: false
        };
        setExpenseItems([...expenseItems, newItem]);
    };

    const removeExpenseItem = (id: string) => {
        if (expenseItems.length > 1) {
            setExpenseItems(expenseItems.filter(item => item.id !== id));
        }
    };

    const updateExpenseItem = (id: string, field: keyof ExpenseItem, value: string | number | boolean) => {
        setExpenseItems(expenseItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const totalAmount = expenseItems.reduce((sum, item) => sum + item.amount, 0);

    const handleSubmit = async (status: 'submitted' | 'draft') => {
        if (!expenseTitle.trim()) {
            alert('Please enter an expense report title.');
            return;
        }
        const validItems = expenseItems.filter(
            item => item.category && item.amount > 0
        );
        if (validItems.length === 0) {
            alert('Please add at least one expense item with a category and amount.');
            return;
        }

        const payload = {
            companyId: 'default-company-id',
            title: expenseTitle,
            expenseType,
            status,
            totalAmount,
            items: validItems,
        };

        try {
            setSubmitting(true);
            await HrExpensesService.createExpenseClaim(payload);
            alert(
                status === 'draft'
                    ? 'Expense claim saved as draft.'
                    : 'Expense claim submitted for approval.'
            );
            router.push('/hr/expenses/expense-management/my-expenses');
        } catch (err) {
            alert(
                `Failed to save expense claim: ${err instanceof Error ? err.message : 'Unknown error'}`
            );
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (value: number) => {
        return `₹${value.toLocaleString()}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
            <div className="w-full space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Receipt className="w-8 h-8 text-green-500" />
                            Submit Expense
                        </h1>
                        <p className="text-gray-400 mt-1">Create and submit expense claims for reimbursement</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleSubmit('draft')}
                            disabled={submitting}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            Save as Draft
                        </button>
                        <button
                            onClick={() => handleSubmit('submitted')}
                            disabled={submitting}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Submit for Approval
                        </button>
                    </div>
                </div>

                {/* Expense Header */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                    <h2 className="text-lg font-semibold text-white mb-4">Expense Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Expense Report Title
                            </label>
                            <input
                                type="text"
                                value={expenseTitle}
                                onChange={(e) => setExpenseTitle(e.target.value)}
                                placeholder="e.g., January 2025 Travel Expenses"
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Expense Type
                            </label>
                            <select
                                value={expenseType}
                                onChange={(e) => setExpenseType(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="Regular">Regular Expense</option>
                                <option value="Travel">Travel Expense</option>
                                <option value="Project">Project Expense</option>
                                <option value="Client">Client Billable</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Total Amount
                            </label>
                            <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                                <span className="text-2xl font-bold text-green-400">{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expense Items */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-white">Expense Items</h2>
                        <button
                            onClick={addExpenseItem}
                            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Add Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        {expenseItems.map((item, index) => (
                            <div key={item.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-medium text-gray-400">Item #{index + 1}</span>
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
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
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
                                                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Vendor/Merchant</label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                value={item.vendor}
                                                onChange={(e) => updateExpenseItem(item.id, 'vendor', e.target.value)}
                                                placeholder="Vendor name"
                                                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs text-gray-500 mb-1">Description</label>
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => updateExpenseItem(item.id, 'description', e.target.value)}
                                            placeholder="Brief description of expense"
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Project</label>
                                        <select
                                            value={item.project}
                                            onChange={(e) => updateExpenseItem(item.id, 'project', e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="">Select Project</option>
                                            {projects.map(proj => (
                                                <option key={proj} value={proj}>{proj}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Receipt</label>
                                        <div className="flex items-center gap-2">
                                            <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white text-sm transition-colors">
                                                <Upload className="w-4 h-4" />
                                                Upload
                                            </button>
                                            <label className="flex items-center gap-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg">
                                                <input
                                                    type="checkbox"
                                                    checked={item.billable}
                                                    onChange={(e) => updateExpenseItem(item.id, 'billable', e.target.checked)}
                                                    className="w-4 h-4 rounded border-gray-500 text-green-500 focus:ring-green-500 bg-gray-600"
                                                />
                                                <span className="text-xs text-gray-400">Billable</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Policy Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Submission Guidelines</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex items-start gap-2">
                                <FileText className="w-4 h-4 text-green-400 mt-0.5" />
                                <span>Attach original receipts for all expenses &gt; ₹500</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Calendar className="w-4 h-4 text-green-400 mt-0.5" />
                                <span>Submit within 30 days of expense date</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Tag className="w-4 h-4 text-green-400 mt-0.5" />
                                <span>Select appropriate category for each item</span>
                            </li>
                        </ul>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Expense Limits</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Daily Meal Limit</span>
                                <span className="text-white">₹1,500</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Local Travel (per day)</span>
                                <span className="text-white">₹2,000</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Self-Approval Limit</span>
                                <span className="text-white">₹5,000</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Approval Workflow</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs">1</div>
                                <span className="text-sm text-gray-300">Manager Approval</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs">2</div>
                                <span className="text-sm text-gray-300">Finance Review (&gt; ₹10,000)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs">3</div>
                                <span className="text-sm text-gray-300">Reimbursement Processing</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
