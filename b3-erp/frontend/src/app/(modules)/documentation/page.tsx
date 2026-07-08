'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, FileText, Search, ChevronRight, Download, Loader2, AlertCircle } from 'lucide-react';
import { DocumentationService, DocArticle } from '@/services/documentation.service';

export default function DocumentationPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [articles, setArticles] = useState<DocArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const rows = await DocumentationService.getArticles();
                if (active) setArticles(rows);
            } catch (e) {
                if (active) setError(e instanceof Error ? e.message : 'Failed to load documentation');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return articles;
        return articles.filter(
            (a) =>
                a.title.toLowerCase().includes(q) ||
                (a.body || '').toLowerCase().includes(q) ||
                (a.tags || '').toLowerCase().includes(q),
        );
    }, [articles, searchQuery]);

    const grouped = useMemo(() => {
        const map = new Map<string, DocArticle[]>();
        for (const a of filtered) {
            const cat = a.category || 'General';
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat)!.push(a);
        }
        return Array.from(map.entries());
    }, [filtered]);

    return (
        <div className="min-h-screen bg-gray-50 p-3">
            <div className="w-full">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
                            <p className="text-gray-600">Complete guides and references for OptiForge ERP</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search documentation..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Quick Access Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-12">
                    <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
                        <h3 className="font-semibold text-gray-900 mb-2">Categories</h3>
                        <p className="text-2xl font-bold text-blue-600 mb-2">{loading ? '—' : grouped.length}</p>
                        <p className="text-sm text-gray-600">Topic areas covered</p>
                    </div>

                    <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
                        <h3 className="font-semibold text-gray-900 mb-2">Total Articles</h3>
                        <p className="text-2xl font-bold text-green-600 mb-2">{loading ? '—' : articles.length}</p>
                        <p className="text-sm text-gray-600">Comprehensive coverage</p>
                    </div>

                    <div className="bg-white rounded-lg shadow border border-gray-200 p-3">
                        <h3 className="font-semibold text-gray-900 mb-2">Download PDF</h3>
                        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                            <Download className="w-4 h-4" />
                            Full Documentation
                        </button>
                    </div>
                </div>

                {/* Documentation Sections */}
                {loading ? (
                    <div className="flex items-center justify-center py-16 text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading documentation…
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        <AlertCircle className="w-5 h-5" /> {error}
                    </div>
                ) : grouped.length === 0 ? (
                    <div className="py-16 text-center text-gray-500">
                        {searchQuery ? `No articles match “${searchQuery}”.` : 'No documentation articles available yet.'}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {grouped.map(([category, docs]) => (
                            <div key={category}>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{category}</h2>
                                <div className="bg-white rounded-lg shadow border border-gray-200 divide-y divide-gray-200">
                                    {docs.map((doc) => (
                                        <Link
                                            key={doc.id}
                                            href={`/documentation/${doc.slug}`}
                                            className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                                                <div className="min-w-0">
                                                    <h4 className="font-medium text-gray-900 truncate">{doc.title}</h4>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {doc.tags ? doc.tags.split(',').slice(0, 3).join(' · ') : category}
                                                    </p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Help Section */}
                <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-center text-white">
                    <h3 className="text-2xl font-bold mb-2">Need Additional Help?</h3>
                    <p className="mb-3">Visit our help center or contact support for personalized assistance</p>
                    <Link
                        href="/help"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                    >
                        Visit Help Center
                    </Link>
                </div>
            </div>
        </div>
    );
}
