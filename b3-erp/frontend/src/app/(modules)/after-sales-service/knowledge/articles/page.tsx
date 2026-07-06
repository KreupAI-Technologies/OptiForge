'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileText, Search, Eye, Edit, Trash2, Plus, Calendar, User, Tag, ThumbsUp, MessageSquare, TrendingUp, Filter, ChevronRight, X, CheckCircle, AlertTriangle, BarChart3, Clock, Star } from 'lucide-react';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  dateCreated: string;
  dateUpdated: string;
  views: number;
  likes: number;
  comments: number;
  featured: boolean;
  status: 'published' | 'draft';
  tags: string[];
  readTime: number;
}

function mapArticle(a: any): Article {
  const status = String(a?.status || 'published').toLowerCase();
  return {
    id: String(a?.id ?? a?._id ?? ''),
    title: a?.title || a?.name || '',
    description: a?.description || a?.summary || a?.content || '',
    category: a?.category || a?.categoryName || 'General',
    author: a?.author || a?.authorName || a?.createdBy || '',
    dateCreated: a?.dateCreated || a?.createdAt || a?.created_at || '',
    dateUpdated: a?.dateUpdated || a?.updatedAt || a?.updated_at || a?.dateCreated || a?.createdAt || '',
    views: Number(a?.views ?? a?.viewCount ?? 0) || 0,
    likes: Number(a?.likes ?? a?.likeCount ?? 0) || 0,
    comments: Number(a?.comments ?? a?.commentCount ?? 0) || 0,
    featured: Boolean(a?.featured ?? a?.isFeatured ?? false),
    status: status === 'draft' ? 'draft' : 'published',
    tags: Array.isArray(a?.tags) ? a.tags.map((t: any) => String(t)) : [],
    readTime: Number(a?.readTime ?? a?.readingTime ?? 0) || 0,
  };
}

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'How to Perform Regular Maintenance on Kitchen Equipment',
    description: 'Comprehensive guide on maintaining kitchen appliances to ensure optimal performance and longevity',
    category: 'Maintenance',
    author: 'Rajesh Kumar',
    dateCreated: '2025-09-15',
    dateUpdated: '2025-10-18',
    views: 342,
    likes: 45,
    comments: 12,
    featured: true,
    status: 'published',
    tags: ['Kitchen', 'Maintenance', 'Equipment'],
    readTime: 8
  },
  {
    id: '2',
    title: 'Troubleshooting Common Microwave Issues',
    description: 'Step-by-step guide to diagnose and fix the most common microwave problems',
    category: 'Troubleshooting',
    author: 'Priya Sharma',
    dateCreated: '2025-09-10',
    dateUpdated: '2025-10-17',
    views: 287,
    likes: 38,
    comments: 8,
    featured: true,
    status: 'published',
    tags: ['Microwave', 'Troubleshooting', 'DIY'],
    readTime: 6
  },
  {
    id: '3',
    title: 'Understanding Warranty Coverage and Limitations',
    description: 'Complete overview of what is and is not covered under our standard warranty',
    category: 'Warranty',
    author: 'Amit Singh',
    dateCreated: '2025-08-25',
    dateUpdated: '2025-10-16',
    views: 215,
    likes: 28,
    comments: 5,
    featured: false,
    status: 'published',
    tags: ['Warranty', 'Coverage', 'Policy'],
    readTime: 5
  },
  {
    id: '4',
    title: 'Best Practices for Installation Safety',
    description: 'Important safety guidelines to follow during equipment installation',
    category: 'Installation',
    author: 'Vikram Patel',
    dateCreated: '2025-08-20',
    dateUpdated: '2025-10-15',
    views: 198,
    likes: 31,
    comments: 7,
    featured: false,
    status: 'published',
    tags: ['Safety', 'Installation', 'Guidelines'],
    readTime: 7
  },
  {
    id: '5',
    title: 'Water Filter Replacement Guide',
    description: 'How to safely replace water filters in your appliances',
    category: 'Maintenance',
    author: 'Neha Desai',
    dateCreated: '2025-08-15',
    dateUpdated: '2025-10-14',
    views: 156,
    likes: 22,
    comments: 4,
    featured: false,
    status: 'published',
    tags: ['Filters', 'Maintenance', 'Care'],
    readTime: 4
  },
  {
    id: '6',
    title: 'Energy Efficiency Tips for Your Refrigerator',
    description: 'Learn how to optimize your refrigerator settings for maximum energy efficiency',
    category: 'Optimization',
    author: 'Sanjay Verma',
    dateCreated: '2025-08-10',
    dateUpdated: '2025-10-13',
    views: 289,
    likes: 52,
    comments: 11,
    featured: true,
    status: 'published',
    tags: ['Energy', 'Efficiency', 'Refrigerator'],
    readTime: 6
  },
  {
    id: '7',
    title: 'Understanding Error Codes on Your Display Panel',
    description: 'A complete guide to interpreting and resolving error codes displayed on modern appliances',
    category: 'Troubleshooting',
    author: 'Isha Nair',
    dateCreated: '2025-07-30',
    dateUpdated: '2025-10-12',
    views: 421,
    likes: 67,
    comments: 18,
    featured: true,
    status: 'published',
    tags: ['Error Codes', 'Troubleshooting', 'Support'],
    readTime: 9
  },
  {
    id: '8',
    title: 'Extended Service Plan Benefits',
    description: 'Overview of benefits included in our extended service plans',
    category: 'Service Plans',
    author: 'Rohan Gupta',
    dateCreated: '2025-07-25',
    dateUpdated: '2025-10-11',
    views: 134,
    likes: 19,
    comments: 3,
    featured: false,
    status: 'published',
    tags: ['Service Plans', 'Coverage', 'Benefits'],
    readTime: 5
  }
];

export default function ArticlesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('published');
  const [sortBy, setSortBy] = useState<'recent' | 'views' | 'likes'>('recent');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);

  // Load articles from API
  useEffect(() => {
    (async () => {
      try {
        const raw = await AfterSalesPagesService.knowledgeArticles();
        setArticles(Array.isArray(raw) ? raw.map(mapArticle) : []);
      } catch {
        setArticles([]);
      }
    })();
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleStatsCardClick = (type: string) => {
    switch (type) {
      case 'total':
        setSelectedCategory('all');
        setSelectedStatus('published');
        setToast({ message: `Showing all ${stats.total} articles`, type: 'info' });
        break;
      case 'published':
        setSelectedStatus('published');
        setToast({ message: `${stats.published} published articles`, type: 'success' });
        break;
      case 'drafts':
        setSelectedStatus('draft');
        setToast({ message: `${stats.draft} draft articles`, type: 'info' });
        break;
      case 'featured':
        setToast({ message: `${stats.featured} featured articles`, type: 'info' });
        break;
    }
  };

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
  };

  const handleDelete = (article: Article, e: React.MouseEvent) => {
    e.stopPropagation();
    setToast({ message: `Article "${article.title}" deleted`, type: 'success' });
  };

  const categories = ['Maintenance', 'Troubleshooting', 'Warranty', 'Installation', 'Optimization', 'Service Plans'];

  const filteredArticles = useMemo(() => {
    let filtered = articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const matchesStatus = article.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort
    if (sortBy === 'views') {
      filtered.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'likes') {
      filtered.sort((a, b) => b.likes - a.likes);
    } else {
      filtered.sort((a, b) => new Date(b.dateUpdated).getTime() - new Date(a.dateUpdated).getTime());
    }

    return filtered;
  }, [articles, searchTerm, selectedCategory, selectedStatus, sortBy]);

  const stats = {
    total: articles.length,
    published: articles.filter(a => a.status === 'published').length,
    draft: articles.filter(a => a.status === 'draft').length,
    featured: articles.filter(a => a.featured).length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {toast.type === 'info' && <AlertTriangle className="w-5 h-5" />}
          {toast.type === 'error' && <X className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="h-8 w-8 text-emerald-600" />
            Knowledge Base Articles
          </h1>
          <p className="text-gray-600 mt-1">Browse and manage service knowledge articles</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAnalyticsModal(true)}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
          >
            <BarChart3 className="h-5 w-5" />
            View Analytics
          </button>
          <button className="bg-emerald-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-md">
            <Plus className="h-5 w-5" />
            New Article
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <button
          onClick={() => handleStatsCardClick('total')}
          className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-blue-500 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Articles</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              <p className="text-xs text-blue-600 mt-1">Click to view all</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => handleStatsCardClick('published')}
          className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-green-500 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.published}</p>
              <p className="text-xs text-green-600 mt-1">Click to filter</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Tag className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => handleStatsCardClick('drafts')}
          className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-yellow-500 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.draft}</p>
              <p className="text-xs text-yellow-600 mt-1">Click to filter</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Edit className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </button>

        <button
          onClick={() => handleStatsCardClick('featured')}
          className="bg-white rounded-lg border-2 border-gray-200 p-5 shadow-sm hover:shadow-lg hover:border-purple-500 transition-all text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Featured</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.featured}</p>
              <p className="text-xs text-purple-600 mt-1">Click for info</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white hover:border-gray-300"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
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
                <option value="views">Most Viewed</option>
                <option value="likes">Most Liked</option>
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

      {/* Articles List */}
      <div className="space-y-2">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            onClick={() => handleArticleClick(article)}
            className="bg-white rounded-lg border-2 border-gray-200 p-3 shadow-sm hover:shadow-lg hover:border-emerald-500 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{article.title}</h3>
                  {article.featured && (
                    <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded">Featured</span>
                  )}
                </div>
                <p className="text-gray-600 mb-2">{article.description}</p>

                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {article.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(article.dateUpdated).toLocaleDateString('en-IN')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    {article.category}
                  </div>
                  <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                    {article.readTime} min read
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                  {article.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {article.views} views
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {article.likes} likes
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {article.comments} comments
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArticleClick(article);
                  }}
                  className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600 hover:text-blue-700"
                  aria-label="View"
                  title="View Article"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setToast({ message: `Editing "${article.title}"`, type: 'info' });
                  }}
                  className="p-2 hover:bg-amber-100 rounded-lg transition-colors text-amber-600 hover:text-amber-700"
                  aria-label="Edit"
                  title="Edit Article"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => handleDelete(article, e)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 hover:text-red-700"
                  aria-label="Delete"
                  title="Delete Article"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredArticles.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
            <FileText className="h-12 w-12 text-gray-300 mb-2" />
            <p className="text-gray-600 font-medium">No articles found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
