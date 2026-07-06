'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, CheckCircle, XCircle } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { fetchReportDataset } from '@/services/reports-management.service';

interface QuotationAnalysisData {
    totalQuotes: number;
    totalValue: number;
    accepted: number;
    rejected: number;
    pending: number;
    conversionRate: number;
}

const DEFAULT_DATA: QuotationAnalysisData = {
    totalQuotes: 85,
    totalValue: 4500000,
    accepted: 32,
    rejected: 15,
    pending: 38,
    conversionRate: 37.6,
};

export default function QuotationAnalysisReport() {
    const router = useRouter();

    const [data, setData] = useState<QuotationAnalysisData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<QuotationAnalysisData>>('sales.quotations');
                if (cancelled) return;
                if (payload) {
                    setData({
                        totalQuotes: Number(payload.totalQuotes ?? DEFAULT_DATA.totalQuotes),
                        totalValue: Number(payload.totalValue ?? DEFAULT_DATA.totalValue),
                        accepted: Number(payload.accepted ?? DEFAULT_DATA.accepted),
                        rejected: Number(payload.rejected ?? DEFAULT_DATA.rejected),
                        pending: Number(payload.pending ?? DEFAULT_DATA.pending),
                        conversionRate: Number(payload.conversionRate ?? DEFAULT_DATA.conversionRate),
                    });
                }
            } catch (e) {
                if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load report');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="w-full p-3">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Quotation Analysis</h1>
                    <p className="text-gray-600">Track quotation status and conversion rates</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Total Quotations"
                    value={data.totalQuotes.toString()}
                    color="blue"
                    onClick={() => router.push('/reports/sales/quotations/status?status=All')}
                />
                <ClickableKPICard
                    title="Accepted"
                    value={data.accepted.toString()}
                    color="green"
                    onClick={() => router.push('/reports/sales/quotations/status?status=Accepted')}
                />
                <ClickableKPICard
                    title="Pending"
                    value={data.pending.toString()}
                    color="orange"
                    onClick={() => router.push('/reports/sales/quotations/status?status=Sent')}
                />
                <ClickableKPICard
                    title="Conversion Rate"
                    value={`${data.conversionRate}%`}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/reports/sales/quotations/status?status=Accepted')}>
                    <CardHeader><CardTitle>Won Deals</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-40 bg-green-50 rounded-lg border border-dashed border-green-200">
                            <div className="text-center">
                                <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                                <p className="text-green-700 font-medium">32 Accepted Quotes</p>
                                <p className="text-sm text-green-600">Click to view details</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/reports/sales/quotations/status?status=Expired')}>
                    <CardHeader><CardTitle>Lost/Expired Analysis</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-40 bg-red-50 rounded-lg border border-dashed border-red-200">
                            <div className="text-center">
                                <XCircle className="w-8 h-8 text-red-500 mb-2" />
                                <p className="text-red-700 font-medium">15 Lost Quotes</p>
                                <p className="text-sm text-red-600">Click to analyze reasons</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
