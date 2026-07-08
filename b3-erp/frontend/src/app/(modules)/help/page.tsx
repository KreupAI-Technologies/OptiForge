'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { HelpCircle, BookOpen, Video, MessageCircle, Search, FileText, Loader2, AlertCircle } from 'lucide-react';
import { supportPagesService } from '@/services/support-pages.service';

interface Faq {
    id: string;
    faqId?: string;
    question: string;
    answer?: string;
    category?: string;
    views?: number;
    featured?: boolean;
}

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const rows = (await supportPagesService.getFaqs()) as Faq[];
                if (active) setFaqs(rows);
            } catch (e) {
                if (active) setError(e instanceof Error ? e.message : 'Failed to load help content');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    const filteredFaqs = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return faqs;
        return faqs.filter(
            (f) => f.question.toLowerCase().includes(q) || (f.answer || '').toLowerCase().includes(q),
        );
    }, [faqs, searchQuery]);

    // Derive browse-by-category cards from the real FAQ data.
    const categories = useMemo(() => {
        const map = new Map<string, number>();
        for (const f of faqs) {
            const cat = f.category || 'General';
            map.set(cat, (map.get(cat) || 0) + 1);
        }
        return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
    }, [faqs]);

    const popular = useMemo(
        () => [...faqs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4),
        [faqs],
    );

    const categoryColors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-red-500', 'bg-orange-500', 'bg-teal-500'];

    return (
        <div className="min-h-screen bg-gray-50 p-3">
            <div className="w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-2">
                        <HelpCircle className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">How can we help you?</h1>
                    <p className="text-gray-600 text-lg mb-8">Search our knowledge base or browse by category</p>

                    {/* Search Bar */}
                    <div className="max-w-2xl">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for help articles, guides, or tutorials..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-lg"
                            />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        <AlertCircle className="w-5 h-5" /> {error}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-12">
                    <Link href="/documentation" className="bg-white rounded-lg shadow border border-gray-200 p-3 hover:shadow-lg transition-all text-center">
                        <BookOpen className="w-12 h-12 text-blue-600 mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
                        <p className="text-sm text-gray-600">Complete system documentation and user guides</p>
                    </Link>

                    <Link href="/help" className="bg-white rounded-lg shadow border border-gray-200 p-3 hover:shadow-lg transition-all text-center">
                        <Video className="w-12 h-12 text-red-600 mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">Video Tutorials</h3>
                        <p className="text-sm text-gray-600">Step-by-step video guides and walkthroughs</p>
                    </Link>

                    <Link href="/support/incidents" className="bg-white rounded-lg shadow border border-gray-200 p-3 hover:shadow-lg transition-all text-center">
                        <MessageCircle className="w-12 h-12 text-green-600 mb-3" />
                        <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
                        <p className="text-sm text-gray-600">Get help from our support team</p>
                    </Link>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16 text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading help center…
                    </div>
                ) : (
                    <>
                        {/* Help Categories */}
                        {categories.length > 0 && (
                            <div className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">Browse by Category</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {categories.map((category, i) => (
                                        <button
                                            key={category.name}
                                            onClick={() => setSearchQuery('')}
                                            className="bg-white rounded-lg shadow border border-gray-200 p-3 hover:shadow-lg transition-all text-left"
                                        >
                                            <div className={`${categoryColors[i % categoryColors.length]} w-12 h-12 rounded-lg flex items-center justify-center mb-2`}>
                                                <HelpCircle className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                                            <p className="text-sm text-blue-600 font-medium">{category.count} article{category.count === 1 ? '' : 's'}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Popular Articles */}
                        {popular.length > 0 && (
                            <div className="mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">Popular Questions</h2>
                                <div className="bg-white rounded-lg shadow border border-gray-200 divide-y divide-gray-200">
                                    {popular.map((f) => (
                                        <div key={f.id} className="flex items-center justify-between p-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                                                <div className="min-w-0">
                                                    <h4 className="font-medium text-gray-900 truncate">{f.question}</h4>
                                                    <span className="text-sm text-gray-500">{f.category || 'General'} · {f.views || 0} views</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* FAQs */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
                            {filteredFaqs.length === 0 ? (
                                <div className="bg-white rounded-lg shadow border border-gray-200 p-6 text-center text-sm text-gray-500">
                                    {searchQuery ? `No FAQs match “${searchQuery}”.` : 'No FAQs available yet.'}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredFaqs.map((faq) => (
                                        <div key={faq.id} className="bg-white rounded-lg shadow border border-gray-200 p-3">
                                            <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                                            <p className="text-gray-600">{faq.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Contact Support */}
                <div className="mt-12 bg-blue-600 rounded-lg shadow-lg p-8 text-center text-white">
                    <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
                    <p className="mb-3">Our support team is here to assist you</p>
                    <div className="flex gap-2 justify-center">
                        <Link href="/support/incidents" className="px-3 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                            Create Support Ticket
                        </Link>
                        <a href="mailto:support@kreupai.com" className="px-3 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors">
                            Email Support
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
