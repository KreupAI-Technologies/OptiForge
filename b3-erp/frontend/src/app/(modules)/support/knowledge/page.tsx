'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, Trash2, BookOpen, FileText, Video, Download, ThumbsUp, MessageCircle, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Tag, User, Calendar, Star, AlertCircle } from 'lucide-react';
import { KnowledgeBaseService } from '@/services/support.service';

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-1';

interface KnowledgeArticle {
  id: string;
  articleId: string;
  title: string;
  summary: string;
  content: string;
  category: 'how_to' | 'troubleshooting' | 'faq' | 'best_practices' | 'documentation' | 'video_tutorial';
  subcategory: string;
  author: string;
  status: 'draft' | 'published' | 'archived' | 'under_review';
  views: number;
  likes: number;
  comments: number;
  helpful: number;
  notHelpful: number;
  tags: string[];
  createdDate: string;
  updatedDate: string;
  publishedDate?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;
  attachments: number;
  relatedArticles: number;
}


const categoryColors = {
  how_to: 'bg-blue-100 text-blue-700',
  troubleshooting: 'bg-orange-100 text-orange-700',
  faq: 'bg-green-100 text-green-700',
  best_practices: 'bg-purple-100 text-purple-700',
  documentation: 'bg-gray-100 text-gray-700',
  video_tutorial: 'bg-pink-100 text-pink-700',
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-red-100 text-red-700',
  under_review: 'bg-yellow-100 text-yellow-700',
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-orange-100 text-orange-700',
};

export default function KnowledgePage() {
  const router = useRouter();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof KnowledgeArticle | null>('views');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const itemsPerPage = 10;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // KnowledgeBaseService returns { data: KnowledgeArticle[] } in the
        // service's own shape; map defensively to this page's model.
        const res = (await KnowledgeBaseService.getArticles(COMPANY_ID, { limit: 500 })) as any;
        const raw: any[] = Array.isArray(res) ? res : (res?.data ?? res?.articles ?? []);
        const catMap: Record<string, KnowledgeArticle['category']> = {
          how_to: 'how_to', troubleshooting: 'troubleshooting', faq: 'faq',
          best_practices: 'best_practices', documentation: 'documentation',
          video_tutorial: 'video_tutorial',
        };
        const statusMap: Record<string, KnowledgeArticle['status']> = {
          draft: 'draft', published: 'published', archived: 'archived',
          under_review: 'under_review',
        };
        const toDate = (d: any) => (d ? String(d).slice(0, 10) : '');
        const mapped: KnowledgeArticle[] = raw.map((a) => ({
          id: String(a.id ?? ''),
          articleId: a.articleNumber ?? a.articleId ?? '',
          title: a.title ?? '',
          summary: a.summary ?? '',
          content: a.content ?? '',
          category: catMap[(a.category ?? '').toString().toLowerCase()] ?? 'documentation',
          subcategory: a.subcategory ?? '',
          author: a.authorName ?? a.author ?? '',
          status: statusMap[a.status] ?? 'draft',
          views: Number(a.viewCount ?? a.views ?? 0),
          likes: Number(a.likes ?? 0),
          comments: Number(Array.isArray(a.comments) ? a.comments.length : a.comments ?? 0),
          helpful: Number(a.helpfulCount ?? a.helpful ?? 0),
          notHelpful: Number(a.notHelpfulCount ?? a.notHelpful ?? 0),
          tags: Array.isArray(a.tags) ? a.tags : [],
          createdDate: toDate(a.createdAt ?? a.createdDate),
          updatedDate: toDate(a.updatedAt ?? a.updatedDate),
          publishedDate: a.publishedDate ? toDate(a.publishedDate) : undefined,
          difficulty: a.difficulty ?? 'beginner',
          estimatedReadTime: Number(a.estimatedReadTime ?? 0),
          attachments: Number(
            a.attachments && typeof a.attachments === 'object'
              ? Object.keys(a.attachments).length
              : a.attachments ?? 0,
          ),
          relatedArticles: Number(
            Array.isArray(a.relatedArticles) ? a.relatedArticles.length : a.relatedArticles ?? 0,
          ),
        }));
        if (!cancelled) setArticles(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load knowledge articles');
          setArticles([]);
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

  const handleSort = (field: keyof KnowledgeArticle) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  let filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      article.articleId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    const matchesDifficulty = difficultyFilter === 'all' || article.difficulty === difficultyFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesDifficulty;
  });

  if (sortField) {
    filteredArticles = [...filteredArticles].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue !== undefined && bValue !== undefined && aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue !== undefined && bValue !== undefined && aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: articles.length,
    published: articles.filter((a) => a.status === 'published').length,
    totalViews: articles.reduce((sum, a) => sum + a.views, 0),
    avgHelpful: articles.length
      ? Math.round(articles.reduce((sum, a) => sum + (a.helpful / (a.helpful + a.notHelpful || 1) * 100), 0) / articles.length)
      : 0,
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      setArticles(articles.filter((a) => a.id !== id));
    }
  };

  const handleExport = () => {
    alert('Exporting knowledge base to PDF...');
    console.log('Exporting articles:', filteredArticles);
  };

  const getHelpfulPercentage = (helpful: number, notHelpful: number) => {
    const total = helpful + notHelpful;
    if (total === 0) return 0;
    return Math.round((helpful / total) * 100);
  };

  return (
    <div className="w-full min-h-screen px-3 py-2 w-full max-w-full">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading knowledge articles…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && articles.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No knowledge articles found.
        </div>
      )}
      <div className="mb-3 flex items-start gap-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Articles</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Published</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.published}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Views</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{stats.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Avg Helpful</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.avgHelpful}%</p>
              </div>
              <ThumbsUp className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push('/support/knowledge/add')}
          className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-fit flex-shrink-0"
        >
          <Plus className="h-5 w-5" />
          <span>New Article</span>
        </button>
      </div>

      <div className="mb-3">
        <div className="flex gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles by title, summary, tags, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>Export</span>
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="how_to">How To</option>
                <option value="troubleshooting">Troubleshooting</option>
                <option value="faq">FAQ</option>
                <option value="best_practices">Best Practices</option>
                <option value="documentation">Documentation</option>
                <option value="video_tutorial">Video Tutorial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="under_review">Under Review</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setCategoryFilter('all');
                  setStatusFilter('all');
                  setDifficultyFilter('all');
                }}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('articleId')}>
                  <div className="flex items-center space-x-1">
                    <span>Article #</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('views')}>
                  <div className="flex items-center space-x-1">
                    <span>Views</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort('updatedDate')}>
                  <div className="flex items-center space-x-1">
                    <span>Updated</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedArticles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-blue-600">{article.articleId}</div>
                    <div className="text-xs text-gray-500">{article.author}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 max-w-xs">{article.title}</div>
                    <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">{article.summary}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {article.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[article.category]}`}>
                      {article.category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{article.subcategory}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[article.status]}`}>
                      {article.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${difficultyColors[article.difficulty]}`}>
                      {article.difficulty.charAt(0).toUpperCase() + article.difficulty.slice(1)}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{article.estimatedReadTime} min read</div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{article.views.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-700 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {article.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {article.comments}
                      </span>
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      {getHelpfulPercentage(article.helpful, article.notHelpful)}% helpful
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-700">{article.updatedDate}</div>
                    {article.publishedDate && (
                      <div className="text-xs text-gray-500 mt-1">Pub: {article.publishedDate}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => router.push(`/support/knowledge/view/${article.id}`)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"

                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => router.push(`/support/knowledge/edit/${article.id}`)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"

                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"

                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredArticles.length)} of {filteredArticles.length} articles
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                })
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg ${currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
