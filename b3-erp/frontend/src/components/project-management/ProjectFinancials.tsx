'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';
import { projectFinancialsApi } from '@/services/api';
import { Download, Plus, Filter, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';

interface ProjectFinancialsProps {
    projectId: string;
}

const ProjectFinancials: React.FC<ProjectFinancialsProps> = ({ projectId }) => {
    const [financials, setFinancials] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showTxModal, setShowTxModal] = useState(false);
    const [txType, setTxType] = useState<'expense' | 'income'>('expense');
    const [txAmount, setTxAmount] = useState('');
    const [txCategory, setTxCategory] = useState('');
    const [txDescription, setTxDescription] = useState('');
    const [savingTx, setSavingTx] = useState(false);

    const fetchFinancials = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await projectFinancialsApi.getFinancials(projectId);

            if (response.success) {
                const data: any = response.data || {};
                setFinancials({
                    budget: data.budget ?? 0,
                    totalIncome: data.totalIncome ?? 0,
                    totalExpenditure: data.totalExpenditure ?? 0,
                    margin: data.margin ?? 0,
                    expensesByCategory: data.expensesByCategory ?? [],
                    monthlyTrend: data.monthlyTrend ?? [],
                    recentTransactions: data.recentTransactions ?? [],
                });
            }
        } catch (err) {
            console.error('Failed to fetch financials:', err);
            setError('Failed to load financial data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinancials();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    const handleExportReport = () => {
        if (!financials) return;
        const rows: string[][] = [];
        rows.push(['Metric', 'Value']);
        rows.push(['Budget', String(financials.budget)]);
        rows.push(['Total Income', String(financials.totalIncome)]);
        rows.push(['Total Expenditure', String(financials.totalExpenditure)]);
        rows.push(['Net Margin', String(financials.margin)]);
        rows.push([]);
        rows.push(['Category', 'Amount']);
        (financials.expensesByCategory ?? []).forEach((c: any) => {
            rows.push([String(c.name ?? ''), String(c.value ?? '')]);
        });
        rows.push([]);
        rows.push(['Date', 'Description', 'Category', 'Status', 'Amount']);
        (financials.recentTransactions ?? []).forEach((t: any) => {
            rows.push([
                String(t.date ?? ''),
                String(t.description ?? ''),
                String(t.category ?? ''),
                String(t.status ?? ''),
                String(t.amount ?? ''),
            ]);
        });
        const csv = rows
            .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `financial-report-${projectId}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleSaveTransaction = async () => {
        const amount = parseFloat(txAmount);
        if (isNaN(amount) || amount <= 0) return;
        setSavingTx(true);
        try {
            if (txType === 'expense') {
                await projectFinancialsApi.trackExpense(projectId, amount, txCategory || 'General', txDescription);
            } else {
                await projectFinancialsApi.trackIncome(projectId, amount, txCategory || 'General', txDescription);
            }
            setShowTxModal(false);
            setTxAmount('');
            setTxCategory('');
            setTxDescription('');
            await fetchFinancials();
        } catch (err) {
            console.error('Failed to save transaction:', err);
        } finally {
            setSavingTx(false);
        }
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !financials) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-500 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
                    {error || 'No financial data available'}
                </div>
            </div>
        );
    }

    const COLORS = financials.expensesByCategory.map((item: any) => item.color);

    return (
        <div className="space-y-3 animate-in fade-in duration-500">
            {/* Action Toolbar */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Financial Overview</h2>
                    <p className="text-sm text-gray-500">Track project budget, expenses, and profitability</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="flex items-center gap-2" onClick={handleExportReport}>
                        <Download className="w-4 h-4" />
                        Export Report
                    </Button>
                    <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowTxModal(true)}>
                        <Plus className="w-4 h-4" />
                        Add Transaction
                    </Button>
                </div>
            </div>

            {showTxModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="px-4 py-3 border-b">
                            <h3 className="font-semibold text-lg">Add Transaction</h3>
                        </div>
                        <div className="p-4 space-y-3">
                            <div>
                                <label className="text-sm font-medium">Type</label>
                                <select
                                    value={txType}
                                    onChange={(e) => setTxType(e.target.value as 'expense' | 'income')}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Amount (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={txAmount}
                                    onChange={(e) => setTxAmount(e.target.value)}
                                    placeholder="0"
                                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">{txType === 'expense' ? 'Category' : 'Source'}</label>
                                <input
                                    type="text"
                                    value={txCategory}
                                    onChange={(e) => setTxCategory(e.target.value)}
                                    placeholder={txType === 'expense' ? 'e.g. Materials' : 'e.g. Milestone Payment'}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    value={txDescription}
                                    onChange={(e) => setTxDescription(e.target.value)}
                                    rows={2}
                                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="px-4 py-3 border-t flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setShowTxModal(false)} disabled={savingTx}>
                                Cancel
                            </Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={handleSaveTransaction}
                                disabled={savingTx || !txAmount || parseFloat(txAmount) <= 0}
                            >
                                {savingTx ? 'Saving…' : 'Save Transaction'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
                            <Wallet className="w-4 h-4" /> Total Budget
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">₹{financials.budget.toLocaleString()}</div>
                        <p className="text-xs text-blue-600 mt-1 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" /> +2.5% from initial
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-white border-red-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                            <TrendingDown className="w-4 h-4" /> Total Expenditure
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">₹{financials.totalExpenditure.toLocaleString()}</div>
                        <div className="w-full bg-red-100 h-1.5 mt-2 rounded-full overflow-hidden">
                            <div
                                className="bg-red-500 h-full rounded-full"
                                style={{ width: `${(financials.totalExpenditure / financials.budget) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {((financials.totalExpenditure / financials.budget) * 100).toFixed(1)}% of budget utilized
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" /> Total Income
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">₹{financials.totalIncome.toLocaleString()}</div>
                        <p className="text-xs text-green-600 mt-1 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" /> On track
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-600 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Net Margin
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${financials.margin >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                            ₹{financials.margin.toLocaleString()}
                        </div>
                        <p className="text-xs text-purple-600 mt-1">
                            {((financials.margin / financials.totalIncome) * 100).toFixed(1)}% Profit Margin
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Cash Flow Analysis</CardTitle>
                        <CardDescription>Monthly income vs expenses breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financials.monthlyTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                                <Tooltip
                                    formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="income" fill="#10b981" name="Income" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" fill="#ef4444" name="Expenditure" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Cumulative Cash Flow</CardTitle>
                        <CardDescription>Net cash position over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={financials.monthlyTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorCashFlow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                                <Tooltip
                                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Net Cash Flow']}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="cashFlow" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCashFlow)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <Card className="lg:col-span-1 shadow-sm">
                    <CardHeader>
                        <CardTitle>Expense Distribution</CardTitle>
                        <CardDescription>Breakdown by category</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={financials.expensesByCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {financials.expensesByCategory.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Latest financial activities</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">View All</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-lg">Date</th>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right rounded-r-lg">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {financials.recentTransactions.map((tx: any) => (
                                        <tr key={tx.id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900">{tx.date}</td>
                                            <td className="px-4 py-3">{tx.description}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                                    {tx.category}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${tx.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className={`px-4 py-3 text-right font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProjectFinancials;
