'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchDomainList } from '@/services/reports-data.service';
import { exportToCsv } from '@/lib/export';

export default function TaxSummaryReport() {
    const router = useRouter();
    const [taxes, setTaxes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('finance/tax-masters');
                const mapped = raw.map((r: any) => ({
                    code: r.taxCode ?? r.id,
                    name: r.taxName ?? '',
                    collected: Number(r.collected ?? 0),
                    paid: Number(r.paid ?? 0),
                    net: Number(r.collected ?? 0) - Number(r.paid ?? 0),
                }));
                if (!cancelled) setTaxes(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setTaxes([]); }
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
                    <h1 className="text-3xl font-bold mb-2">Tax Summary</h1>
                    <p className="text-gray-600">GST/VAT collection and payment summary</p>
                </div>
                <Button variant="outline" onClick={() => exportToCsv('tax-summary', taxes)} disabled={taxes.length === 0}><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Tax Liability Summary</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Tax Code</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Description</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Collected (Output)</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Paid (Input)</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Net Payable</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {taxes.map((tax) => (
                                <ClickableTableRow
                                    key={tax.code}
                                    onClick={() => router.push(`/reports/finance/tax-summary/details?code=${tax.code}`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{tax.code}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{tax.name}</td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-900">₹{tax.collected.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-900">₹{tax.paid.toLocaleString()}</td>
                                    <td className={`px-4 py-3 text-sm text-right font-bold ${tax.net > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        ₹{Math.abs(tax.net).toLocaleString()} {tax.net > 0 ? 'Payable' : 'Credit'}
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
