'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Star } from 'lucide-react';
import { ClickableKPICard } from '@/components/reports/ClickableKPICard';
import { fetchReportDataset } from '@/services/reports-management.service';

interface SatisfactionData {
    avgRating: number;
    totalResponses: number;
    nps: number;
    promoters: number;
    detractors: number;
    byCategory: { id: string; category: string; rating: number; responses: number }[];
    ratingDistribution: { stars: number; count: number; percentage: number }[];
}

const DEFAULT_DATA: SatisfactionData = {
    avgRating: 4.3,
    totalResponses: 245,
    nps: 42,
    promoters: 125,
    detractors: 28,
    byCategory: [
        { id: 'CAT-001', category: 'Product Quality', rating: 4.5, responses: 245 },
        { id: 'CAT-002', category: 'Delivery Time', rating: 4.2, responses: 245 },
        { id: 'CAT-003', category: 'Customer Service', rating: 4.4, responses: 245 },
        { id: 'CAT-004', category: 'Value for Money', rating: 4.1, responses: 245 },
        { id: 'CAT-005', category: 'After-Sales Support', rating: 4.3, responses: 245 },
    ],
    ratingDistribution: [
        { stars: 5, count: 125, percentage: 51.0 },
        { stars: 4, count: 72, percentage: 29.4 },
        { stars: 3, count: 20, percentage: 8.2 },
        { stars: 2, count: 15, percentage: 6.1 },
        { stars: 1, count: 13, percentage: 5.3 },
    ],
};

export default function CustomerSatisfactionReport() {
    const router = useRouter();
    const [data, setData] = useState<SatisfactionData>(DEFAULT_DATA);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const payload = await fetchReportDataset<Partial<SatisfactionData>>('after-sales.satisfaction');
                if (cancelled) return;
                if (payload) {
                    setData({
                        avgRating: Number(payload.avgRating ?? DEFAULT_DATA.avgRating),
                        totalResponses: Number(payload.totalResponses ?? DEFAULT_DATA.totalResponses),
                        nps: Number(payload.nps ?? DEFAULT_DATA.nps),
                        promoters: Number(payload.promoters ?? DEFAULT_DATA.promoters),
                        detractors: Number(payload.detractors ?? DEFAULT_DATA.detractors),
                        byCategory: Array.isArray(payload.byCategory) ? payload.byCategory : DEFAULT_DATA.byCategory,
                        ratingDistribution: Array.isArray(payload.ratingDistribution) ? payload.ratingDistribution : DEFAULT_DATA.ratingDistribution,
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
                    <h1 className="text-3xl font-bold mb-2">Customer Satisfaction Report</h1>
                    <p className="text-gray-600">Customer feedback and NPS scores</p>
                </div>
                <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
            </div>

            {isLoading && <p className="text-xs text-gray-400 mb-2">Loading latest figures…</p>}
            {loadError && <p className="text-xs text-amber-600 mb-2">Showing sample data — {loadError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                <ClickableKPICard
                    title="Avg Rating"
                    value={`${data.avgRating} / 5.0`}
                    color="green"
                    onClick={() => router.push('/reports/after-sales/satisfaction/region')}
                />
                <ClickableKPICard
                    title="Total Responses"
                    value={data.totalResponses.toString()}
                    color="blue"
                    onClick={() => router.push('/reports/after-sales/satisfaction/region?status=All')}
                />
                <ClickableKPICard
                    title="NPS Score"
                    value={data.nps.toString()}
                    color="blue"
                    onClick={() => router.push('/reports/after-sales/satisfaction/region?status=Promoter')}
                />
                <ClickableKPICard
                    title="Promoters"
                    value={data.promoters.toString()}
                    color="purple"
                    description={`${((data.promoters / data.totalResponses) * 100).toFixed(0)}%`}
                    onClick={() => router.push('/reports/after-sales/satisfaction/region?status=Promoter')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                <Card>
                    <CardHeader><CardTitle>Rating by Category</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.byCategory.map((cat) => (
                                <div key={cat.id} className="cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => router.push(`/reports/after-sales/satisfaction/region?category=${cat.category}`)}>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-medium">{cat.category}</span>
                                        <span className="font-semibold">{cat.rating} / 5.0</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(cat.rating / 5) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Rating Distribution</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.ratingDistribution.map((rating, idx) => (
                                <div key={idx} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => router.push(`/reports/after-sales/satisfaction/region?rating=${rating.stars}`)}>
                                    <div className="flex items-center gap-1 w-20">
                                        <span className="text-sm font-medium">{rating.stars}</span>
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    </div>
                                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                                        <div className={`h-3 rounded-full ${rating.stars >= 4 ? 'bg-green-600' : rating.stars === 3 ? 'bg-blue-600' : 'bg-red-600'}`} style={{ width: `${rating.percentage}%` }} />
                                    </div>
                                    <span className="text-sm w-16 text-right">{rating.count} ({rating.percentage.toFixed(0)}%)</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
