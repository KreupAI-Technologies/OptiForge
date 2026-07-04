'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchDomainList } from '@/services/reports-data.service';

export default function BudgetVsActualReport() {
    const router = useRouter();
    const [budgetItems, setBudgetItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('finance/budgets');
                const mapped = raw.map((r: any) => ({ id: r.budgetCode ?? r.id, category: r.category ?? r.budgetName ?? '', budget: Number(r.budgetAmount ?? r.amount ?? 0), actual: Number(r.actualAmount ?? 0), variance: Number(r.budgetAmount ?? r.amount ?? 0) - Number(r.actualAmount ?? 0), percent: 0 }));
                if (!cancelled) setBudgetItems(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setBudgetItems([]); }
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
                    <h1 className="text-3xl font-bold mb-2">Budget vs Actual</h1>
                    <p className="text-gray-600">Compare actual performance against budget</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Budget Variance Analysis</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Category</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Budget</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actual</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Variance</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">%</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {budgetItems.map((item) => (
                                <ClickableTableRow
                                    key={item.id}
                                    onClick={() => router.push(`/reports/finance/budget-vs-actual/variance?category=${encodeURIComponent(item.category)}`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{item.category}</td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-500">₹{item.budget.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-900">₹{item.actual.toLocaleString()}</td>
                                    <td className={`px-4 py-3 text-sm text-right font-medium ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {item.variance > 0 ? '+' : ''}₹{item.variance.toLocaleString()}
                                    </td>
                                    <td className={`px-4 py-3 text-sm text-right ${item.percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {item.percent > 0 ? '+' : ''}{item.percent}%
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
