'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Filter } from 'lucide-react';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { FinanceService } from '@/services/finance.service';

interface LedgerTransaction {
    id: string;
    date: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
}

export default function AccountLedgerPage() {
    const params = useParams();
    const router = useRouter();
    const accountId = params.id as string;

    const [account, setAccount] = useState<{ id: string; code: string; name: string; type: string; balance: number }>({
        id: accountId,
        code: '',
        name: '',
        type: '',
        balance: 0,
    });
    const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
    const [totalDebits, setTotalDebits] = useState(0);
    const [totalCredits, setTotalCredits] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const [accounts, txnRes] = await Promise.all([
                    FinanceService.getChartOfAccounts() as Promise<any[]>,
                    FinanceService.getAccountTransactions(accountId) as Promise<any>,
                ]);
                const match = (accounts ?? []).find((a) => a.id === accountId);
                const typeMap: Record<string, string> = {
                    Asset: 'Asset', Liability: 'Liability', Equity: 'Equity',
                    Revenue: 'Income', Income: 'Income', Expense: 'Expense',
                };
                const rows: any[] = Array.isArray(txnRes?.transactions)
                    ? txnRes.transactions
                    : Array.isArray(txnRes)
                        ? txnRes
                        : [];
                let running = 0;
                const mapped: LedgerTransaction[] = rows.map((t, i) => {
                    const debit = Number(t.debit ?? t.debitAmount ?? 0);
                    const credit = Number(t.credit ?? t.creditAmount ?? 0);
                    running = running + debit - credit;
                    return {
                        id: t.id ?? t.reference ?? t.journalEntryNumber ?? `TX-${i}`,
                        date: t.date ?? t.transactionDate ?? t.postingDate ?? '',
                        description: t.description ?? t.narration ?? '-',
                        debit,
                        credit,
                        balance: Number(t.balance ?? t.runningBalance ?? running),
                    };
                });
                if (!cancelled) {
                    setAccount({
                        id: accountId,
                        code: txnRes?.accountCode ?? match?.accountCode ?? '',
                        name: txnRes?.accountName ?? match?.accountName ?? 'Account',
                        type: typeMap[match?.accountType] ?? String(match?.accountType ?? ''),
                        balance: Number(
                            match?.currentBalance ?? txnRes?.summary?.netBalance ?? 0,
                        ),
                    });
                    setTransactions(mapped);
                    setTotalDebits(Number(txnRes?.summary?.totalDebit ?? mapped.reduce((s, t) => s + t.debit, 0)));
                    setTotalCredits(Number(txnRes?.summary?.totalCredit ?? mapped.reduce((s, t) => s + t.credit, 0)));
                }
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load account ledger');
                    setTransactions([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [accountId]);

    return (
        <div className="w-full p-3">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <h1 className="text-3xl font-bold">{account.code} - {account.name}</h1>
                    <p className="text-gray-600">Account Ledger View</p>
                    {isLoading && (
                        <p className="mt-1 text-sm text-blue-600">Loading account ledger…</p>
                    )}
                    {loadError && !isLoading && (
                        <p className="mt-1 text-sm text-red-600">{loadError}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Filter className="mr-2 h-4 w-4" />Filter</Button>
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Current Balance</p>
                        <p className="text-2xl font-bold text-blue-600">₹{account.balance.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Total Debits (This Month)</p>
                        <p className="text-2xl font-bold text-green-600">₹{totalDebits.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-gray-600">Total Credits (This Month)</p>
                        <p className="text-2xl font-bold text-red-600">₹{totalCredits.toLocaleString()}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Transactions</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Ref #</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Description</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Debit</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Credit</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {transactions.map((tx) => (
                                <ClickableTableRow
                                    key={tx.id}
                                    onClick={() => router.push(`/accounts/journal/${tx.id}`)}
                                >
                                    <td className="px-4 py-3 text-sm">{tx.date}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{tx.id}</td>
                                    <td className="px-4 py-3 text-sm">{tx.description}</td>
                                    <td className="px-4 py-3 text-sm text-right text-green-600">
                                        {tx.debit > 0 ? `₹${tx.debit.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-red-600">
                                        {tx.credit > 0 ? `₹${tx.credit.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-semibold">
                                        ₹{tx.balance.toLocaleString()}
                                    </td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
