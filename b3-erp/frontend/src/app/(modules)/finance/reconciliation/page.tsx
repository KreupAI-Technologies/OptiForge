'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, RefreshCw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { FinanceService } from '@/services/finance.service';
import { toast } from '@/hooks/use-toast';

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
    const [loadError, setLoadError] = useState<string | null>(null);
    const [autoMatching, setAutoMatching] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [matchingId, setMatchingId] = useState<string | null>(null);

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
            setLoadError(null);
            // Bank/reconcilable accounts come from the chart of accounts.
            const raw = (await FinanceService.getChartOfAccounts()) as any[];
            const bankAccounts = (raw || [])
                .filter((a) => a?.isBankAccount || a?.isReconcilable)
                .map((a) => ({
                    id: String(a.id),
                    accountName: a.name ?? '',
                    accountNumber: a.code ?? '',
                    bankName: a.bankName ?? a.name ?? '',
                }));
            setAccounts(bankAccounts);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
            setLoadError('Failed to load bank accounts. Please try again.');
            setAccounts([]);
        }
    };

    const fetchUnreconciledTransactions = async () => {
        try {
            setLoading(true);
            setLoadError(null);
            const rows = await FinanceService.getUnreconciledBankTransactions(selectedAccount);
            const mapped: Transaction[] = (rows || []).map((t: any) => ({
                id: String(t.id),
                transactionDate: t.transactionDate ?? t.date ?? '',
                description: t.description ?? t.narration ?? '',
                debit: Number(t.debitAmount ?? t.debit ?? 0),
                credit: Number(t.creditAmount ?? t.credit ?? 0),
                balance: Number(t.balance ?? 0),
                reconciled: Boolean(t.reconciled ?? t.isMatched ?? false),
            }));
            setTransactions(mapped);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            setLoadError('Failed to load transactions for this account.');
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAutoMatch = async () => {
        if (!selectedAccount) return;
        try {
            setAutoMatching(true);
            const result = await FinanceService.autoMatchBankAccount(selectedAccount);
            toast({
                title: 'Auto-match complete',
                description: `Auto-matched ${result.matched} transaction(s).`,
                variant: 'success',
            });
            await fetchUnreconciledTransactions();
        } catch (error) {
            console.error('Auto-match failed:', error);
            toast({
                title: 'Auto-match failed',
                description: error instanceof Error ? error.message : 'Unable to run auto-match.',
                variant: 'destructive',
            });
        } finally {
            setAutoMatching(false);
        }
    };

    const handleManualMatch = async (transactionId: string) => {
        if (!selectedAccount) return;
        const journalEntryId = typeof window !== 'undefined'
            ? window.prompt('Enter the journal entry ID to match this transaction to:')
            : null;
        if (!journalEntryId) return;
        try {
            setMatchingId(transactionId);
            await FinanceService.matchBankTransaction({ transactionId, journalEntryId });
            toast({ title: 'Matched', description: 'Transaction matched successfully.', variant: 'success' });
            await fetchUnreconciledTransactions();
        } catch (error) {
            console.error('Manual match failed:', error);
            toast({
                title: 'Match failed',
                description: error instanceof Error ? error.message : 'Unable to match transaction.',
                variant: 'destructive',
            });
        } finally {
            setMatchingId(null);
        }
    };

    const handleExportReport = async () => {
        if (!selectedAccount) return;
        try {
            setExporting(true);
            const report = await FinanceService.getReconciliationReport(selectedAccount);
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `reconciliation-report-${selectedAccount}-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast({ title: 'Report exported', description: 'Reconciliation report downloaded.', variant: 'success' });
        } catch (error) {
            console.error('Export failed:', error);
            toast({
                title: 'Export failed',
                description: error instanceof Error ? error.message : 'Unable to export report.',
                variant: 'destructive',
            });
        } finally {
            setExporting(false);
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
                    <Button variant="outline" onClick={handleAutoMatch} disabled={!selectedAccount || autoMatching}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${autoMatching ? 'animate-spin' : ''}`} />
                        {autoMatching ? 'Matching...' : 'Auto Match'}
                    </Button>
                    <Button variant="outline" onClick={handleExportReport} disabled={!selectedAccount || exporting}>
                        <Download className="mr-2 h-4 w-4" />
                        {exporting ? 'Exporting...' : 'Export Report'}
                    </Button>
                </div>
            </div>

            {/* Error banner */}
            {loadError && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{loadError}</span>
                </div>
            )}

            {/* Account Selection */}
            <Card className="mb-3">
                <CardHeader>
                    <CardTitle>Select Bank Account</CardTitle>
                </CardHeader>
                <CardContent>
                    {accounts.length === 0 ? (
                        <div className="text-center py-6 text-gray-500">No bank accounts available.</div>
                    ) : (
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
                    )}
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
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={txn.reconciled || matchingId === txn.id}
                                                        onClick={() => handleManualMatch(txn.id)}
                                                    >
                                                        {matchingId === txn.id ? 'Matching...' : 'Match'}
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
