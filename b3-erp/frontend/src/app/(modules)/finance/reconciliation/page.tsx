'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, RefreshCw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Transaction {
    id: string;
    transactionDate: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
    reconciled: boolean;
}

export default function BankReconciliationPage() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAccounts();
    }, []);

    useEffect(() => {
        if (selectedAccount) {
            fetchUnreconciledTransactions();
        }
    }, [selectedAccount]);

    const fetchAccounts = async () => {
        try {
            const response = await fetch('/api/accounts/banks');
            const data = await response.json();
            if (data.success) {
                setAccounts(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        }
    };

    const fetchUnreconciledTransactions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/accounts/reconciliation/unreconciled/${selectedAccount}`);
            const data = await response.json();
            if (data.success) {
                setTransactions(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAutoMatch = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/accounts/reconciliation/auto-match/${selectedAccount}`, {
                method: 'POST',
            });
            const data = await response.json();
            if (data.success) {
                alert(`Auto-matched ${data.data.matched} transactions`);
                fetchUnreconciledTransactions();
            }
        } catch (error) {
            console.error('Auto-match failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const reconciled = transactions.filter(t => t.reconciled).length;
    const unreconciled = transactions.length - reconciled;

    return (
        <div className="w-full p-3">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <div>
                    <Link href="/finance/accounting">
                        <Button variant="ghost" size="sm" className="mb-2">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Accounts
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Bank Reconciliation</h1>
                    <p className="text-gray-600">Match bank transactions with journal entries</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleAutoMatch} disabled={!selectedAccount || loading}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Auto Match
                    </Button>
                    <Button variant="outline" disabled={!selectedAccount}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Account Selection */}
            <Card className="mb-3">
                <CardHeader>
                    <CardTitle>Select Bank Account</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {accounts.map((account) => (
                            <Card
                                key={account.id}
                                className={`cursor-pointer transition-all ${selectedAccount === account.id
                                        ? 'ring-2 ring-blue-500 bg-blue-50'
                                        : 'hover:shadow-md'
                                    }`}
                                onClick={() => setSelectedAccount(account.id)}
                            >
                                <CardContent className="pt-4">
                                    <div className="font-semibold">{account.accountName}</div>
                                    <div className="text-sm text-gray-600">{account.bankName}</div>
                                    <div className="text-xs text-gray-500 mt-1">{account.accountNumber}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Summary Stats */}
            {selectedAccount && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Reconciled</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{reconciled}</div>
                            <p className="text-xs text-gray-500 mt-1">Transactions matched</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Unreconciled</CardTitle>
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{unreconciled}</div>
                            <p className="text-xs text-gray-500 mt-1">Need attention</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Transactions</CardTitle>
                            <XCircle className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{transactions.length}</div>
                            <p className="text-xs text-gray-500 mt-1">In selected period</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Transactions Table */}
            {selectedAccount && (
                <Card>
                    <CardHeader>
                        <CardTitle>Unreconciled Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8">Loading transactions...</div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
                                <p>All transactions are reconciled!</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Debit</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Credit</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Balance</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Status</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {transactions.map((txn) => (
                                            <tr key={txn.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm">
                                                    {new Date(txn.transactionDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-sm">{txn.description}</td>
                                                <td className="px-4 py-3 text-sm text-right text-red-600">
                                                    {txn.debit > 0 ? `$${Number(txn.debit).toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right text-green-600">
                                                    {txn.credit > 0 ? `$${Number(txn.credit).toLocaleString()}` : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-medium">
                                                    ${Number(txn.balance).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {txn.reconciled ? (
                                                        <Badge className="bg-green-500">Reconciled</Badge>
                                                    ) : (
                                                        <Badge variant="outline">Pending</Badge>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Button size="sm" variant="outline">
                                                        Match
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
