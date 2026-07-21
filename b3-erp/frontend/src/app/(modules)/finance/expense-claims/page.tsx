'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Upload, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { FinanceService } from '@/services/finance.service';

interface ExpenseClaim {
    id: string;
    claimNumber: string;
    employeeName: string;
    claimDate: string;
    totalAmount: number;
    category: string;
    status: string;
    description: string;
}

export default function ExpenseClaimsPage() {
    const [claims, setClaims] = useState<ExpenseClaim[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState('all');
    const [form, setForm] = useState({ category: '', amount: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmitClaim = async () => {
        if (!form.category) {
            setFormError('Please select a category');
            return;
        }
        if (!(Number(form.amount) > 0)) {
            setFormError('Please enter a valid amount');
            return;
        }
        setSubmitting(true);
        setFormError(null);
        try {
            await FinanceService.createExpenseClaim({
                category: form.category,
                totalAmount: Number(form.amount),
                description: form.description,
            });
            setShowForm(false);
            setForm({ category: '', amount: '', description: '' });
            await fetchClaims();
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'Failed to submit claim');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const data = await FinanceService.getExpenseClaims();
            setClaims(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch claims:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { color: string; icon: any }> = {
            draft: { color: 'bg-gray-500', icon: Clock },
            pending: { color: 'bg-yellow-500', icon: Clock },
            approved: { color: 'bg-green-500', icon: CheckCircle },
            rejected: { color: 'bg-red-500', icon: XCircle },
            paid: { color: 'bg-blue-500', icon: CheckCircle },
        };
        const { color, icon: Icon } = config[status] || config.draft;
        return (
            <Badge className={color}>
                <Icon className="mr-1 h-3 w-3" />
                {status}
            </Badge>
        );
    };

    const filteredClaims = filter === 'all' ? claims : claims.filter(c => c.status === filter);

    const stats = {
        total: claims.length,
        pending: claims.filter(c => c.status === 'pending').length,
        approved: claims.filter(c => c.status === 'approved').length,
        totalAmount: claims.reduce((sum, c) => sum + Number(c.totalAmount), 0),
    };

    return (
        <div className="w-full p-3">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Expense Claims</h1>
                    <p className="text-gray-600">Submit and manage employee expense claims</p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Expense Claim
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Claims</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-gray-500 mt-1">All time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                        <p className="text-xs text-gray-500 mt-1">This month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalAmount.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">Total claimed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-3">
                {['all', 'draft', 'pending', 'approved', 'rejected', 'paid'].map((status) => (
                    <Button
                        key={status}
                        variant={filter === status ? 'default' : 'outline'}
                        onClick={() => setFilter(status)}
                        size="sm"
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                ))}
            </div>

            {/* Claims List */}
            {loading ? (
                <div className="text-center py-12">Loading claims...</div>
            ) : filteredClaims.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-500 mb-2">No expense claims found</p>
                        <Button onClick={() => setShowForm(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Submit Your First Claim
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Claim #</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Employee</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Status</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredClaims.map((claim) => (
                                        <tr key={claim.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-medium">{claim.claimNumber}</td>
                                            <td className="px-4 py-3 text-sm">{claim.employeeName}</td>
                                            <td className="px-4 py-3 text-sm">{claim.category}</td>
                                            <td className="px-4 py-3 text-sm">
                                                {new Date(claim.claimDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right font-medium">
                                                ${Number(claim.totalAmount).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {getStatusBadge(claim.status)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Link href={`/finance/expense-claims/${claim.id}`}>
                                                    <Button size="sm" variant="outline">
                                                        View
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Quick Submit Form Modal (simplified) */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-2xl mx-4">
                        <CardHeader>
                            <CardTitle>Submit New Expense Claim</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {formError && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                        {formError}
                                    </div>
                                )}
                                <div>
                                    <Label>Category</Label>
                                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="travel">Travel</SelectItem>
                                            <SelectItem value="meals">Meals</SelectItem>
                                            <SelectItem value="accommodation">Accommodation</SelectItem>
                                            <SelectItem value="supplies">Supplies</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Amount</Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        rows={3}
                                        placeholder="Describe your expense..."
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Receipts</Label>
                                    <div className="border-2 border-dashed rounded-lg p-3 text-center">
                                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600">Click to upload receipts</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <Button className="flex-1" onClick={handleSubmitClaim} disabled={submitting}>
                                        {submitting ? 'Submitting…' : 'Submit Claim'}
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
