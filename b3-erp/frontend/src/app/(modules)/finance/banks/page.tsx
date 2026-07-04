'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, TrendingDown, DollarSign, Building2, CreditCard } from 'lucide-react';
import Link from 'next/link';

interface BankAccount {
    id: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
    accountType: string;
    currentBalance: number;
    currency: string;
    status: string;
}

export default function BankAccountsPage() {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/accounts/banks');
            const data = await response.json();
            if (data.success) {
                setAccounts(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAccountTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'savings': 'bg-green-500',
            'current': 'bg-blue-500',
            'fixed-deposit': 'bg-purple-500',
            'credit-card': 'bg-orange-500',
        };
        return colors[type] || 'bg-gray-500';
    };

    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.currentBalance), 0);

    return (
        <div className="w-full p-3">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Bank Accounts</h1>
                    <p className="text-gray-600">Manage your bank accounts and transactions</p>
                </div>
                <Link href="/finance/banks">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Bank Account
                    </Button>
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Balance</CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalBalance.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">Across all accounts</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Active Accounts</CardTitle>
                        <Building2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{accounts.filter(a => a.status === 'active').length}</div>
                        <p className="text-xs text-gray-500 mt-1">Currently active</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Credit Cards</CardTitle>
                        <CreditCard className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {accounts.filter(a => a.accountType === 'credit-card').length}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Credit card accounts</p>
                    </CardContent>
                </Card>
            </div>

            {/* Accounts List */}
            {loading ? (
                <div className="text-center py-12">Loading accounts...</div>
            ) : accounts.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-gray-500 mb-2">No bank accounts found</p>
                        <Link href="/finance/banks">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Account
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {accounts.map((account) => (
                        <Card key={account.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <CardTitle className="text-lg">{account.accountName}</CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">{account.bankName}</p>
                                    </div>
                                    <Badge className={getAccountTypeColor(account.accountType)}>
                                        {account.accountType}
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-500">A/C: {account.accountNumber}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-2">
                                    <div className="text-xs text-gray-500 mb-1">Current Balance</div>
                                    <div className="text-2xl font-bold flex items-center">
                                        {account.currency} {Number(account.currentBalance).toLocaleString()}
                                        {Number(account.currentBalance) >= 0 ? (
                                            <TrendingUp className="ml-2 h-4 w-4 text-green-600" />
                                        ) : (
                                            <TrendingDown className="ml-2 h-4 w-4 text-red-600" />
                                        )}
                                    </div>
                                </div>

                                <Link href={`/accounts/banks/${account.id}`}>
                                    <Button variant="outline" className="w-full">
                                        View Details
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
