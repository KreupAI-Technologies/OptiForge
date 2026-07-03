'use client';

import { useState, useMemo, useEffect } from 'react';
import { BookOpen, Download, Search, Plus, FileText, Calendar, User, Tag, Eye, Star, Filter, Grid, List, BarChart3, AlertCircle } from 'lucide-react';
import { AfterSalesManagementService } from '@/services/after-sales-management.service';

interface Manual {
  id: string;
  title: string;
  productModel: string;
  description: string;
  category: string;
  author: string;
  datePublished: string;
  fileSize: string;
  format: 'pdf' | 'doc' | 'epub';
  downloads: number;
  rating: number;
  views: number;
  language: string;
  pages: number;
  versions: number;
  featured: boolean;
}

export default function ManualsPage() {
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'downloads' | 'rating'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await AfterSalesManagementService.getKnowledgeManuals();
        const mapped: Manual[] = rows.map((r) => ({
          id: r.id,
          title: r.title,
          productModel: r.productModel ?? '',
          description: r.description ?? '',
          category: r.category,
          author: r.author ?? '',
          datePublished: (r.datePublished ?? '').slice(0, 10),
          fileSize: r.fileSize ?? '',
          format: (r.format as Manual['format']) ?? 'pdf',
          downloads: r.downloads ?? 0,
          rating: Number(r.rating ?? 0),
          views: r.views ?? 0,
          language: r.language ?? 'English',
          pages: r.pages ?? 0,
          versions: r.versions ?? 1,
          featured: r.featured ?? false,
        }));
        if (!cancelled) setManuals(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load manuals');
          setManuals([]);
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

  const categories = ['Operation', 'Technical', 'Quick Start', 'Installation', 'Features', 'Troubleshooting', 'Technology', 'Optimization'];
  const formats = ['pdf', 'doc', 'epub'];

  const filteredManuals = useMemo(() => {
    let filtered = manuals.filter(manual => {
      const matchesSearch = manual.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manual.productModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manual.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || manual.category === selectedCategory;
      const matchesFormat = selectedFormat === 'all' || manual.format === selectedFormat;
      return matchesSearch && matchesCategory && matchesFormat;
    });

    // Sort
    if (sortBy === 'downloads') {
      filtered.sort((a, b) => b.downloads - a.downloads);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else {
      filtered.sort((a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime());
    }

    return filtered;
  }, [manuals, searchTerm, selectedCategory, selectedFormat, sortBy]);

  const stats = {
    total: manuals.length,
    featured: manuals.filter(m => m.featured).length,
    totalDownloads: manuals.reduce((sum, m) => sum + m.downloads, 0),
    avgRating: manuals.length
      ? (manuals.reduce((sum, m) => sum + m.rating, 0) / manuals.length).toFixed(1)
      : '0.0'
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'pdf': return 'bg-red-100 text-red-700';
      case 'doc': return 'bg-blue-100 text-blue-700';
      case 'epub': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-emerald-600" />
            Product Manuals
          </h1>
          <p className="text-gray-600 mt-1">Download and manage product documentation</p>
        </div>
        <button className="bg-emerald-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md">
          <Plus className="h-5 w-5" />
          Upload Manual
        </button>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading manuals…
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
              <p className="text-sm font-medium text-gray-600">Total Manuals</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
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
              <Star className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Downloads</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalDownloads.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Download className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.avgRating} ⭐</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-yellow-600" />
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
              placeholder="Search by title, model, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Format</label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-300"
              >
                <option value="all">All Formats</option>
                {formats.map(fmt => (
                  <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
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
                <option value="recent">Recently Updated</option>
                <option value="downloads">Most Downloaded</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  viewMode === 'grid'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Grid className="h-4 w-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List className="h-4 w-4" />
                List
              </button>
            </div>

            <div className="flex items-end">
              <button className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                <Filter className="h-4 w-4" />
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manuals Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredManuals.map((manual) => (
            <div key={manual.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-3 flex items-center justify-center h-32">
                <FileText className="h-16 w-16 text-emerald-600 opacity-50" />
              </div>

              <div className="p-6">
                {manual.featured && (
                  <div className="mb-3 inline-block bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded">
                    Featured
                  </div>
                )}

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{manual.title}</h3>

                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{manual.description}</p>

                <div className="space-y-3 mb-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Model:</span>
                    <span className="font-medium text-gray-900">{manual.productModel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pages:</span>
                    <span className="font-medium text-gray-900">{manual.pages}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Size:</span>
                    <span className="font-medium text-gray-900">{manual.fileSize}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Format:</span>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getFormatColor(manual.format)}`}>
                      {manual.format.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2 pt-4 border-t border-gray-100 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4 text-blue-600" />
                      <span className="text-gray-600">{manual.downloads}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                      <span className="text-gray-600">{manual.rating}</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredManuals.map((manual) => (
            <div key={manual.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-3 rounded-lg flex-shrink-0">
                  <FileText className="h-10 w-10 text-emerald-600" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{manual.title}</h3>
                    {manual.featured && (
                      <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded">Featured</span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{manual.description}</p>

                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-900">{manual.productModel}</span>
                    <span>{manual.pages} pages</span>
                    <span>{manual.fileSize}</span>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getFormatColor(manual.format)}`}>
                      {manual.format.toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4 text-blue-600" />
                      <span>{manual.downloads} downloads</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                      <span>{manual.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button className="ml-4 bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 flex-shrink-0">
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      )}

      {filteredManuals.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
          <BookOpen className="h-12 w-12 text-gray-300 mb-2" />
          <p className="text-gray-600 font-medium">No manuals found</p>
          <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
