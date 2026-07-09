'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Upload,
    ArrowRightLeft,
    Search,
    Filter,
    Check,
    X
} from 'lucide-react';
import { FinanceService, BankReconciliation, BankStatementTransaction } from '@/services/finance.service';
import { useToast } from '@/hooks/use-toast';

interface BankReconciliationViewProps {
    bankAccountId: string;
}

export function BankReconciliationView({ bankAccountId }: BankReconciliationViewProps) {
    const { toast } = useToast();
    const [reconciliation, setReconciliation] = useState<BankReconciliation | null>(null);
    const [bankTransactions, setBankTransactions] = useState<BankStatementTransaction[]>([]);
    const [bookTransactions, setBookTransactions] = useState<any[]>([]);
    const [selectedBankTxn, setSelectedBankTxn] = useState<string | null>(null);
    const [selectedBookTxn, setSelectedBookTxn] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [bankAccountId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setLoadError(null);
            // Fetch the active reconciliation for this account
            const recs = await FinanceService.getBankReconciliations(bankAccountId);
            if (recs.length > 0) {
                setReconciliation(recs[0]);
            } else {
                setReconciliation(null);
            }
        } catch (error: any) {
            setLoadError(error?.message || 'Failed to load reconciliation data');
        } finally {
            setLoading(false);
        }
    };

    // Parse a bank-statement CSV. Expects a header row with columns
    // (case-insensitive): date/transactionDate, description, debit/debitAmount,
    // credit/creditAmount, balance. Only real values from the uploaded file are used.
    const parseCsv = (text: string) => {
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) return [];
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const idx = (names: string[]) => headers.findIndex((h) => names.includes(h));
        const dateIdx = idx(['date', 'transactiondate', 'transaction date']);
        const descIdx = idx(['description', 'narration', 'particulars']);
        const debitIdx = idx(['debit', 'debitamount', 'debit amount', 'withdrawal']);
        const creditIdx = idx(['credit', 'creditamount', 'credit amount', 'deposit']);
        const balanceIdx = idx(['balance', 'closingbalance', 'closing balance']);
        const num = (v?: string) => Number((v ?? '').replace(/[^0-9.-]/g, '')) || 0;
        return lines.slice(1).map((line) => {
            const cols = line.split(',').map((c) => c.trim());
            return {
                transactionDate: dateIdx >= 0 ? cols[dateIdx] : '',
                description: descIdx >= 0 ? cols[descIdx] : '',
                debitAmount: debitIdx >= 0 ? num(cols[debitIdx]) : 0,
                creditAmount: creditIdx >= 0 ? num(cols[creditIdx]) : 0,
                balance: balanceIdx >= 0 ? num(cols[balanceIdx]) : 0,
            };
        });
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setImporting(true);
            const text = await file.text();
            const transactions = parseCsv(text);
            if (transactions.length === 0) {
                toast({ title: 'Error', description: 'No transactions found in the uploaded file', variant: 'destructive' });
                return;
            }
            await FinanceService.importBankStatement(bankAccountId, transactions);
            toast({ title: 'Success', description: 'Bank statement imported successfully' });
            loadData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to import bank statement', variant: 'destructive' });
        } finally {
            setImporting(false);
            event.target.value = '';
        }
    };

    const handleManualMatch = async () => {
        if (!selectedBankTxn || !selectedBookTxn || !reconciliation) return;

        try {
            setLoading(true);
            await FinanceService.manualMatch({
                reconciliationId: reconciliation.id,
                bankStatementId: selectedBankTxn,
                generalLedgerId: selectedBookTxn,
                matchType: 'Manual',
            });
            toast({ title: 'Matched', description: 'Transactions manually matched' });
            setSelectedBankTxn(null);
            setSelectedBookTxn(null);
            loadData();
        } catch (error) {
            toast({ title: 'Match Failed', description: 'Could not match transactions', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {loadError && (
                <div className="lg:col-span-12 bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700 flex items-center justify-between">
                    <span className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {loadError}
                    </span>
                    <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Retry
                    </Button>
                </div>
            )}
            {/* Sidebar / Controls */}
            <div className="lg:col-span-3 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Reconciliation Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="relative">
                            <input
                                type="file"
                                id="statement-upload"
                                className="hidden"
                                accept=".csv,.xlsx"
                                onChange={handleFileUpload}
                            />
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => document.getElementById('statement-upload')?.click()}
                                disabled={importing}
                            >
                                <Upload className="mr-2 h-4 w-4" />
                                {importing ? 'Importing...' : 'Upload Statement'}
                            </Button>
                        </div>
                        <Button
                            className="w-full justify-start"
                            onClick={() => reconciliation && FinanceService.runAutoMatch(reconciliation.id)}
                            disabled={!reconciliation || loading}
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Run Auto-Matching
                        </Button>
                    </CardContent>
                </Card>

                {reconciliation && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Summary</CardTitle>
                            <CardDescription>Session: {reconciliation.reconciliationNumber}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Balance per Bank</span>
                                <span className="font-semibold">${reconciliation.closingBalancePerBank.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Balance per Books</span>
                                <span className="font-semibold">${reconciliation.closingBalancePerBooks.toLocaleString()}</span>
                            </div>
                            <div className="pt-2 border-t">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium">Difference</span>
                                    <span className={`font-bold ${reconciliation.difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ${reconciliation.difference.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Main Reconciliation Area */}
            <div className="lg:col-span-9">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bank Side */}
                    <Card className="flex flex-col h-[600px]">
                        <CardHeader className="border-b bg-gray-50/50">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">Bank Statement</CardTitle>
                                <Badge variant="outline">Unmatched</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-auto">
                            <div className="divide-y">
                                {bankTransactions.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400">
                                        <p>No unmatched bank transactions</p>
                                    </div>
                                ) : (
                                    bankTransactions.map((txn) => (
                                        <div
                                            key={txn.id}
                                            className={`p-3 cursor-pointer transition-colors hover:bg-blue-50/50 ${selectedBankTxn === txn.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                            onClick={() => setSelectedBankTxn(txn.id)}
                                        >
                                            <div className="flex justify-between mb-1">
                                                <span className="text-xs text-gray-500">{new Date(txn.transactionDate).toLocaleDateString()}</span>
                                                <span className={`text-sm font-bold ${txn.creditAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {txn.creditAmount > 0 ? `+${txn.creditAmount.toLocaleString()}` : `-${txn.debitAmount.toLocaleString()}`}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium truncate">{txn.description}</p>
                                            <div className="text-[10px] text-gray-400 mt-1 uppercase">Ref: {txn.referenceNumber || 'N/A'}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Book Side */}
                    <Card className="flex flex-col h-[600px]">
                        <CardHeader className="border-b bg-gray-50/50">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">General Ledger</CardTitle>
                                <Badge variant="outline">Unreconciled</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-auto">
                            <div className="divide-y">
                                {bookTransactions.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400">
                                        <p>No unreconciled GL entries</p>
                                    </div>
                                ) : (
                                    bookTransactions.map((txn) => (
                                        <div
                                            key={txn.id}
                                            className={`p-3 cursor-pointer transition-colors hover:bg-blue-50/50 ${selectedBookTxn === txn.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                            onClick={() => setSelectedBookTxn(txn.id)}
                                        >
                                            <div className="flex justify-between mb-1">
                                                <span className="text-xs text-gray-500">{new Date(txn.postingDate).toLocaleDateString()}</span>
                                                <span className={`text-sm font-bold ${txn.creditAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {txn.creditAmount > 0 ? `+${txn.creditAmount.toLocaleString()}` : `-${txn.debitAmount.toLocaleString()}`}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium truncate">{txn.description}</p>
                                            <div className="text-[10px] text-gray-400 mt-1 uppercase">Doc: {txn.documentNumber || 'N/A'}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Bar */}
                {(selectedBankTxn || selectedBookTxn) && (
                    <div className="mt-4 p-4 bg-white border rounded-lg shadow-lg flex justify-between items-center animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-gray-500">Selected Bank Txn</span>
                                <span className="text-sm font-medium truncate max-w-[200px]">
                                    {bankTransactions.find(t => t.id === selectedBankTxn)?.description || 'None'}
                                </span>
                            </div>
                            <ArrowRightLeft className="text-gray-300" />
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-gray-500">Selected Book Txn</span>
                                <span className="text-sm font-medium truncate max-w-[200px]">
                                    {bookTransactions.find(t => t.id === selectedBookTxn)?.description || 'None'}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedBankTxn(null); setSelectedBookTxn(null); }}>
                                Cancel
                            </Button>
                            <Button size="sm" disabled={!selectedBankTxn || !selectedBookTxn} onClick={handleManualMatch}>
                                Confirm Manual Match
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
