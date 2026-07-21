'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, DollarSign, TrendingDown, CheckCircle, XCircle, Clock } from 'lucide-react';
import { FinanceService } from '@/services/finance.service';

interface PettyCashTransaction {
    id: string;
    custodian: string;
    amount: number;
    date: string;
    purpose: string;
    category: string;
    status: string;
    receiptNumber?: string;
}

export default function PettyCashPage() {
    const [transactions, setTransactions] = useState<PettyCashTransaction[]>([]);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ amount: '', date: '', category: '', purpose: '', receiptNumber: '' });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [actionId, setActionId] = useState<string | null>(null);

    useEffect(() => {
        fetchTransactions();
        fetchBalance();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const data = await FinanceService.getPettyCashTransactions();
            setTransactions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBalance = async () => {
        try {
            const total = await FinanceService.getPettyCashBalance();
            setBalance(Number(total) || 0);
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        }
    };

    const handleSaveTransaction = async () => {
        if (!(Number(form.amount) > 0)) {
            setFormError('Please enter a valid amount');
            return;
        }
        if (!form.category) {
            setFormError('Please select a category');
            return;
        }
        setSubmitting(true);
        setFormError(null);
        try {
            await FinanceService.createPettyCashTransaction({
                amount: Number(form.amount),
                date: form.date || undefined,
                category: form.category,
                purpose: form.purpose,
                receiptNumber: form.receiptNumber || undefined,
            });
            setShowForm(false);
            setForm({ amount: '', date: '', category: '', purpose: '', receiptNumber: '' });
            await Promise.all([fetchTransactions(), fetchBalance()]);
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'Failed to save transaction');
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprove = async (id: string) => {
        setActionId(id);
        try {
            await FinanceService.approvePettyCash(id);
            await Promise.all([fetchTransactions(), fetchBalance()]);
        } catch (error) {
            console.error('Failed to approve transaction:', error);
        } finally {
            setActionId(null);
        }
    };

    const handleReject = async (id: string) => {
        setActionId(id);
        try {
            await FinanceService.rejectPettyCash(id);
            await Promise.all([fetchTransactions(), fetchBalance()]);
        } catch (error) {
            console.error('Failed to reject transaction:', error);
        } finally {
            setActionId(null);
        }
    };

    const handleReplenish = async () => {
        try {
            await FinanceService.replenishPettyCash({});
            await Promise.all([fetchTransactions(), fetchBalance()]);
        } catch (error) {
            console.error('Failed to request replenishment:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { color: string; icon: any }> = {
            pending: { color: 'bg-yellow-500', icon: Clock },
            approved: { color: 'bg-green-500', icon: CheckCircle },
            rejected: { color: 'bg-red-500', icon: XCircle },
        };
        const { color, icon: Icon } = config[status] || config.pending;
        return (
            <Badge className={color}>
                <Icon className="mr-1 h-3 w-3" />
                {status}
            </Badge>
        );
    };

    const stats = {
        total: transactions.length,
        pending: transactions.filter(t => t.status === 'pending').length,
        approved: transactions.filter(t => t.status === 'approved').length,
        spent: transactions
            .filter(t => t.status === 'approved')
            .reduce((sum, t) => sum + Number(t.amount), 0),
    };

    return (
        <div className="w-full p-3">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Petty Cash</h1>
                    <p className="text-gray-600">Track and manage petty cash expenses</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReplenish}>
                        <Plus className="mr-2 h-4 w-4" />
                        Request Replenishment
                    </Button>
                    <Button onClick={() => setShowForm(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Transaction
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Current Balance</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${balance.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">Available cash</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">${stats.spent.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">This month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Pending Approval</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Transactions</CardTitle>
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-gray-500 mt-1">All time</p>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            {loading ? (
                <div className="text-center py-12">Loading transactions...</div>
            ) : transactions.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-500 mb-2">No petty cash transactions found</p>
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Record Your First Transaction
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Custodian</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Purpose</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Receipt</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {transactions.map((txn) => (
                                        <tr key={txn.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm">
                                                {new Date(txn.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-sm">{txn.custodian}</td>
                                            <td className="px-4 py-3 text-sm">{txn.purpose}</td>
                                            <td className="px-4 py-3 text-sm">{txn.category}</td>
                                            <td className="px-4 py-3 text-sm text-right font-medium">
                                                ${Number(txn.amount).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-center text-sm">
                                                {txn.receiptNumber || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {getStatusBadge(txn.status)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {txn.status === 'pending' && (
                                                    <div className="flex gap-1 justify-center">
                                                        <Button size="sm" variant="outline" disabled={actionId === txn.id} onClick={() => handleApprove(txn.id)}>
                                                            <CheckCircle className="h-3 w-3" />
                                                        </Button>
                                                        <Button size="sm" variant="outline" disabled={actionId === txn.id} onClick={() => handleReject(txn.id)}>
                                                            <XCircle className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* New Transaction Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-2xl mx-4">
                        <CardHeader>
                            <CardTitle>Record Petty Cash Transaction</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {formError && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                        {formError}
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label>Amount</Label>
                                        <Input type="number" placeholder="0.00" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                                    </div>
                                    <div>
                                        <Label>Date</Label>
                                        <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <Label>Category</Label>
                                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="office-supplies">Office Supplies</SelectItem>
                                            <SelectItem value="refreshments">Refreshments</SelectItem>
                                            <SelectItem value="transport">Transport</SelectItem>
                                            <SelectItem value="meals">Meals</SelectItem>
                                            <SelectItem value="misc">Miscellaneous</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Purpose</Label>
                                    <Textarea rows={3} placeholder="Describe the purpose of this expense..." value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
                                </div>
                                <div>
                                    <Label>Receipt Number (Optional)</Label>
                                    <Input placeholder="Receipt #" value={form.receiptNumber} onChange={(e) => setForm({ ...form, receiptNumber: e.target.value })} />
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <Button className="flex-1" onClick={handleSaveTransaction} disabled={submitting}>
                                        {submitting ? 'Saving…' : 'Save Transaction'}
                                    </Button>
                                    <Button variant="outline" onClick={() => setShowForm(false)} disabled={submitting}>Cancel</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
