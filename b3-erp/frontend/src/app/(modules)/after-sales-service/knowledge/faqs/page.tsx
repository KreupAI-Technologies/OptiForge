'use client';

import { useState, useMemo, useEffect } from 'react';
import { HelpCircle, Search, Plus, ThumbsUp, ThumbsDown, Eye, ChevronDown, ChevronUp, Filter, TrendingUp, AlertCircle } from 'lucide-react';
import { AfterSalesManagementService } from '@/services/after-sales-management.service';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  unhelpful: number;
  views: number;
  dateCreated: string;
  featured: boolean;
  status: 'active' | 'inactive';
}

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'helpful' | 'views' | 'recent'>('helpful');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await AfterSalesManagementService.getKnowledgeFaqs();
        const mapped: FAQ[] = rows.map((r) => ({
          id: r.id,
          question: r.question,
          answer: r.answer,
          category: r.category,
          helpful: r.helpful ?? 0,
          unhelpful: r.unhelpful ?? 0,
          views: r.views ?? 0,
          dateCreated: (r.createdAt ?? '').slice(0, 10),
          featured: r.featured ?? false,
          status: (r.status as FAQ['status']) ?? 'active',
        }));
        if (!cancelled) setFaqs(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load FAQs');
          setFaqs([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = ['Warranty', 'Troubleshooting', 'Maintenance', 'Safety', 'Billing', 'Installation', 'Optimization'];

  const filteredFAQs = useMemo(() => {
    let filtered = faqs.filter(faq => {
      const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      const matchesStatus = faq.status === 'active';
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort
    if (sortBy === 'helpful') {
      filtered.sort((a, b) => b.helpful - a.helpful);
    } else if (sortBy === 'views') {
      filtered.sort((a, b) => b.views - a.views);
    } else {
      filtered.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
    }

    return filtered;
  }, [faqs, searchTerm, selectedCategory, sortBy]);

  const stats = {
    total: faqs.length,
    active: faqs.filter(f => f.status === 'active').length,
    featured: faqs.filter(f => f.featured).length,
    totalViews: faqs.reduce((sum, f) => sum + f.views, 0)
  };

  const handleHelpful = (id: string) => {
    // In a real app, this would update the database
    console.log('Marked as helpful:', id);
  };

  const handleUnhelpful = (id: string) => {
    // In a real app, this would update the database
    console.log('Marked as unhelpful:', id);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <HelpCircle className="h-8 w-8 text-emerald-600" />
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 mt-1">Browse common questions and answers</p>
        </div>
        <button className="bg-emerald-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md">
          <Plus className="h-5 w-5" />
          Add FAQ
        </button>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading FAQs…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total FAQs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <HelpCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Featured</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.featured}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.totalViews.toLocaleString()}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Eye className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-300"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-300"
              >
                <option value="helpful">Most Helpful</option>
                <option value="views">Most Viewed</option>
                <option value="recent">Recently Added</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                <Filter className="h-4 w-4" />
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-3">
        {filteredFAQs.map((faq) => (
          <div key={faq.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              className="w-full px-3 py-2 flex items-start justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  {faq.featured && (
                    <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded">Featured</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">{faq.category}</span>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {faq.views} views
                  </div>
                </div>
              </div>

              <div className="ml-6">
                {expandedId === faq.id ? (
                  <ChevronUp className="h-6 w-6 text-gray-400" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-gray-400" />
                )}
              </div>
            </button>

            {expandedId === faq.id && (
              <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-700 mb-3 leading-relaxed">{faq.answer}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">Was this helpful?</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleHelpful(faq.id)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors text-sm font-medium"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Yes ({faq.helpful})
                    </button>
                    <button
                      onClick={() => handleUnhelpful(faq.id)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors text-sm font-medium"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      No ({faq.unhelpful})
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredFAQs.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
            <HelpCircle className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-gray-600 font-medium">No FAQs found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
