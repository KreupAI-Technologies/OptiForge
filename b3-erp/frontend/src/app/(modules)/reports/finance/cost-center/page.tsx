'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { fetchDomainList } from '@/services/reports-data.service';

export default function CostCenterReport() {
    const router = useRouter();
    const [costCenters, setCostCenters] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true); setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('finance/cost-centers');
                const mapped = raw.map((r: any) => ({ id: r.costCenterCode ?? r.id, name: r.costCenterName ?? '', manager: r.managerName ?? '', budget: Number(r.budgetAmount ?? 0), actual: Number(r.actualAmount ?? 0), variance: Number(r.budgetAmount ?? 0) - Number(r.actualAmount ?? 0) }));
                if (!cancelled) setCostCenters(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setCostCenters([]); }
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
                    <h1 className="text-3xl font-bold mb-2">Cost Center Analysis</h1>
                    <p className="text-gray-600">Department-wise cost allocation and analysis</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Cost Center Performance</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Cost Center</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Manager</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Budget</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actual</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Variance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {costCenters.map((cc) => (
                                <ClickableTableRow
                                    key={cc.id}
                                    onClick={() => router.push(`/reports/finance/cost-center/details?id=${cc.id}&name=${encodeURIComponent(cc.name)}`)}
                                >
                                    <td className="px-4 py-3 text-sm font-medium text-blue-600">{cc.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{cc.manager}</td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-500">₹{cc.budget.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-900">₹{cc.actual.toLocaleString()}</td>
                                    <td className={`px-4 py-3 text-sm text-right font-medium ${cc.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {cc.variance > 0 ? '+' : ''}₹{cc.variance.toLocaleString()}
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
