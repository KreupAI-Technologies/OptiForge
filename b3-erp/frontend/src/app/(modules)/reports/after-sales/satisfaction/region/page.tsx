'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReportDetailPage } from '@/components/reports/ReportDetailPage';
import { ClickableTableRow } from '@/components/reports/ClickableTableRow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { fetchDomainList } from '@/services/reports-data.service';

function SatisfactionRegionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = searchParams.get('status') || 'All';
    const category = searchParams.get('category');
    const ratingFilter = searchParams.get('rating');

    const [feedback, setFeedback] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await fetchDomainList<any>('after-sales/feedback/ratings');
                const mapped = (Array.isArray(raw) ? raw : []).map((r: any) => ({
                    id: r.id ?? r.feedbackNumber ?? '',
                    customer: r.customerName ?? '',
                    region: r.region ?? r.serviceType ?? '',
                    category: r.category ?? '',
                    rating: Number(r.rating ?? 0),
                    comment: r.comment ?? '',
                    date: r.date ? String(r.date).slice(0, 10) : (r.createdAt ? String(r.createdAt).slice(0, 10) : ''),
                }));
                if (!cancelled) setFeedback(mapped);
            } catch (e) {
                if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setFeedback([]); }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    let filteredFeedback = feedback;

    if (category) {
        filteredFeedback = filteredFeedback.filter(f => f.category === category);
    } else if (ratingFilter) {
        filteredFeedback = filteredFeedback.filter(f => f.rating === parseInt(ratingFilter));
    } else if (status === 'Promoter') {
        filteredFeedback = filteredFeedback.filter(f => f.rating >= 4);
    }

    const title = category ? `Satisfaction: ${category}` : ratingFilter ? `Satisfaction: ${ratingFilter} Stars` : `Satisfaction: ${status}`;

    return (
        <ReportDetailPage
            title={title}
            description={`Customer feedback details`}
            breadcrumbs={[
                { label: 'Reports', href: '/reports' },
                { label: 'After-Sales', href: '/reports' },
                { label: 'Customer Satisfaction', href: '/reports/after-sales/satisfaction' },
                { label: 'Details' }
            ]}
        >
            {isLoading && <div className="mb-3 rounded border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">Loading…</div>}
            {loadError && !isLoading && <div className="mb-3 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{loadError}</div>}
            <Card>
                <CardHeader>
                    <CardTitle>Feedback List</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredFeedback.map((item) => (
                                <ClickableTableRow
                                    key={item.id}
                                    onClick={() => router.push(`/after-sales-service`)}
                                >
                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-blue-600">{item.id}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.customer}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.region}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="font-semibold">{item.rating}</span>
                                            <Star className={`h-4 w-4 ${item.rating >= 4 ? 'fill-green-500 text-green-500' : item.rating >= 3 ? 'fill-yellow-500 text-yellow-500' : 'fill-red-500 text-red-500'}`} />
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                                </ClickableTableRow>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </ReportDetailPage>
    );
}

export default function SatisfactionRegionPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SatisfactionRegionContent />
        </Suspense>
    );
}
