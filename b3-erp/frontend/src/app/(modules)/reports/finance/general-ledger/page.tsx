'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchDomainList } from '@/services/reports-data.service';

export default function GeneralLedgerReport() {
    const router = useRouter();
    const [journalEntries, setJournalEntries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('finance/journal-entries');
                const mapped = raw.map((r: any) => ({ id: r.entryNumber ?? r.id, date: r.entryDate ?? r.date ?? '', description: r.narration ?? r.description ?? '', amount: Number(r.totalDebit ?? r.amount ?? 0), type: r.entryType ?? r.status ?? '' }));
                if (!cancelled) setJournalEntries(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setJournalEntries([]); }
            } finally { if (!cancelled) setIsLoading(false); }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="w-full p-3">
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h1 className="text-3xl font-bold mb-2">General Ledger</h1>
                    <p className="text-gray-600">Detailed transactions for all accounts</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Recent Journal Entries</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Journal ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Description</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {journalEntries.map((entry) => (
                                <ClickableTableRow
                                    key={entry.id}
                                    onClick={() => router.push(`/reports/finance/general-ledger/journal?id=${entry.id}`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{entry.id}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{entry.date}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{entry.description}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{entry.type}</td>
                                    <td className="px-4 py-3 text-sm text-right font-medium">₹{entry.amount.toLocaleString()}</td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
