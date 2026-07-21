'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchDomainList } from '@/services/reports-data.service';
import { exportToCsv } from '@/lib/export';

export default function TrialBalanceReport() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('finance/chart-of-accounts');
                const mapped = raw.map((r: any) => ({ code: r.accountCode ?? r.id, name: r.accountName ?? '', debit: Number(r.debitBalance ?? r.debitTotal ?? 0), credit: Number(r.creditBalance ?? r.creditTotal ?? 0) }));
                if (!cancelled) setAccounts(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setAccounts([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    const totalDebit = accounts.reduce((sum, acc) => sum + acc.debit, 0);
    const totalCredit = accounts.reduce((sum, acc) => sum + acc.credit, 0);

    return (
        <div className="w-full p-3">
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Trial Balance</h1>
                    <p className="text-gray-600">Summary of all ledger account balances</p>
                </div>
                <Button variant="outline" onClick={() => exportToCsv('trial-balance', accounts)} disabled={accounts.length === 0}><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Trial Balance - January 2025</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Code</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Account Name</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Debit</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Credit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {accounts.map((acc) => (
                                <ClickableTableRow
                                    key={acc.code}
                                    onClick={() => router.push(`/reports/finance/trial-balance/ledger?code=${acc.code}&name=${encodeURIComponent(acc.name)}`)}
                                >
                                    <td className="px-4 py-3 text-sm">{acc.code}</td>
                                    <td className="px-4 py-3 text-sm font-medium">{acc.name}</td>
                                    <td className="px-4 py-3 text-sm text-right">
                                        {acc.debit > 0 ? `₹${acc.debit.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right">
                                        {acc.credit > 0 ? `₹${acc.credit.toLocaleString()}` : '-'}
                                    </td>
                                </ClickableTableRow>
                            ))}
                            <tr className="bg-blue-50 font-bold">
                                <td className="px-4 py-3" colSpan={2}>Total</td>
                                <td className="px-4 py-3 text-right text-blue-600">₹{totalDebit.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right text-green-600">₹{totalCredit.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
