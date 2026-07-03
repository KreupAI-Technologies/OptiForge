'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, ThumbsUp, ThumbsDown, BookOpen, FileText, Video, Code, AlertCircle, TrendingUp, Star, Clock, User } from 'lucide-react';
import { crmService } from '@/services/crm.service';

interface KnowledgeArticle {
  id: string;
  articleNumber: string;
  title: string;
  excerpt: string;
  category: 'getting_started' | 'how_to' | 'troubleshooting' | 'api_docs' | 'best_practices' | 'faq' | 'release_notes';
  type: 'article' | 'video' | 'code_snippet' | 'tutorial';
  content: string;
  author: string;
  createdDate: string;
  lastUpdated: string;
  views: number;
  helpful: number;
  notHelpful: number;
  averageRating: number;
  totalRatings: number;
  isPinned: boolean;
  isPublished: boolean;
  tags: string[];
  relatedArticles: string[];
  estimatedReadTime: number; // in minutes
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  attachments: number;
}

export default function KnowledgeBasePage() {
  const router = useRouter();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        // Backend (NestJS CrmKnowledgeArticle) uses different field names than
        // the page's KnowledgeArticle model; map defensively and coerce numerics.
        const raw = (await crmService.knowledgeArticles.getAll()) as any[];
        const mapped: KnowledgeArticle[] = (raw || []).map((a) => ({
          id: String(a.id),
          articleNumber: a.articleNumber ?? '',
          title: a.title ?? '',
          excerpt: a.summary ?? '',
          category: (a.category ?? 'faq') as KnowledgeArticle['category'],
          type: (a.type ?? 'article') as KnowledgeArticle['type'],
          content: a.content ?? '',
          author: a.authorName ?? a.author ?? '',
          createdDate: a.createdAt ?? a.createdDate ?? '',
          lastUpdated: a.updatedAt ?? a.lastUpdated ?? '',
          views: Number(a.viewCount ?? a.views ?? 0),
          helpful: Number(a.helpfulCount ?? a.helpful ?? 0),
          notHelpful: Number(a.notHelpfulCount ?? a.notHelpful ?? 0),
          averageRating: Number(a.averageRating ?? 0),
          totalRatings: Number(a.totalRatings ?? 0),
          isPinned: Boolean(a.isPinned),
          isPublished: a.status ? a.status === 'published' : Boolean(a.isPublished),
          tags: Array.isArray(a.tags) ? a.tags : [],
          relatedArticles: Array.isArray(a.relatedArticles) ? a.relatedArticles : [],
          estimatedReadTime: Number(a.estimatedReadTime ?? 0),
          difficultyLevel: (a.difficultyLevel ?? 'beginner') as KnowledgeArticle['difficultyLevel'],
          attachments: Array.isArray(a.attachments) ? a.attachments.length : Number(a.attachments ?? 0),
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'getting_started' | 'how_to' | 'troubleshooting' | 'api_docs' | 'best_practices' | 'faq' | 'release_notes'>('all');
  const [filterType, setFilterType] = useState<'all' | 'article' | 'video' | 'code_snippet' | 'tutorial'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const handleCreateArticle = () => {
    router.push('/crm/support/knowledge/create');
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || article.category === filterCategory;
    const matchesType = filterType === 'all' || article.type === filterType;
    const matchesDifficulty = filterDifficulty === 'all' || article.difficultyLevel === filterDifficulty;
    return matchesSearch && matchesCategory && matchesType && matchesDifficulty;
  });

  // Separate pinned and unpinned articles
  const pinnedArticles = filteredArticles.filter(a => a.isPinned);
  const unpinnedArticles = filteredArticles.filter(a => !a.isPinned);

  const stats = {
    totalArticles: articles.filter(a => a.isPublished).length,
    totalViews: articles.reduce((sum, a) => sum + a.views, 0),
    avgRating: (articles.reduce((sum, a) => sum + a.averageRating, 0) / articles.length).toFixed(1),
    helpfulRate: Math.round(
      (articles.reduce((sum, a) => sum + a.helpful, 0) /
       (articles.reduce((sum, a) => sum + a.helpful + a.notHelpful, 0))) * 100
    ),
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'getting_started': return 'bg-green-100 text-green-700';
      case 'how_to': return 'bg-blue-100 text-blue-700';
      case 'troubleshooting': return 'bg-orange-100 text-orange-700';
      case 'api_docs': return 'bg-purple-100 text-purple-700';
      case 'best_practices': return 'bg-teal-100 text-teal-700';
      case 'faq': return 'bg-yellow-100 text-yellow-700';
      case 'release_notes': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'code_snippet': return <Code className="w-4 h-4" />;
      case 'tutorial': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-50 text-green-700';
      case 'intermediate': return 'bg-yellow-50 text-yellow-700';
      case 'advanced': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading articles…
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
          No articles found.
        </div>
      )}
      <div className="mb-8">
        <div className="flex justify-end mb-3">
          <button
            onClick={handleCreateArticle}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create Article
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <BookOpen className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.totalArticles}</div>
            <div className="text-blue-100">Published Articles</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
            <TrendingUp className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{(stats.totalViews / 1000).toFixed(1)}K</div>
            <div className="text-purple-100">Total Views</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-3 text-white">
            <Star className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.avgRating}/5</div>
            <div className="text-yellow-100">Avg Rating</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
            <ThumbsUp className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.helpfulRate}%</div>
            <div className="text-green-100">Helpful Rate</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <div className="flex gap-2 items-center flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="getting_started">Getting Started</option>
              <option value="how_to">How To</option>
              <option value="troubleshooting">Troubleshooting</option>
              <option value="api_docs">API Docs</option>
              <option value="best_practices">Best Practices</option>
              <option value="faq">FAQ</option>
              <option value="release_notes">Release Notes</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="code_snippet">Code Snippet</option>
              <option value="tutorial">Tutorial</option>
            </select>

            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pinned Articles */}
      {pinnedArticles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            Pinned Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pinnedArticles.map((article) => (
              <div key={article.id} className="bg-white rounded-lg border-2 border-yellow-300 p-3 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(article.type)}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(article.category)}`}>
                      {article.category.replace('_', ' ')}
                    </span>
                  </div>
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{article.excerpt}</p>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-blue-50 rounded p-2">
                    <div className="text-xs text-blue-600 mb-1">Views</div>
                    <div className="text-lg font-bold text-blue-900">{(article.views / 1000).toFixed(1)}K</div>
                  </div>
                  <div className="bg-yellow-50 rounded p-2">
                    <div className="text-xs text-yellow-600 mb-1">Rating</div>
                    <div className="text-lg font-bold text-yellow-900">{article.averageRating}/5</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.estimatedReadTime} min
                  </div>
                  <span className={`px-2 py-0.5 rounded ${getDifficultyColor(article.difficultyLevel)}`}>
                    {article.difficultyLevel}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex gap-3 text-sm">
                    <div className="flex items-center gap-1 text-green-600">
                      <ThumbsUp className="w-4 h-4" />
                      {article.helpful}
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <ThumbsDown className="w-4 h-4" />
                      {article.notHelpful}
                    </div>
                  </div>
                  <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Articles */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">All Articles</h2>
        <div className="space-y-2">
          {unpinnedArticles.map((article) => (
            <div key={article.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(article.type)}
                      <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(article.category)}`}>
                      {article.category.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(article.difficultyLevel)}`}>
                      {article.difficultyLevel}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{article.excerpt}</p>

                  <div className="grid grid-cols-6 gap-2 mb-2">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-blue-700 mb-1">
                        <Eye className="w-3 h-3" />
                        <span className="text-xs font-medium">Views</span>
                      </div>
                      <div className="text-xl font-bold text-blue-900">{(article.views / 1000).toFixed(1)}K</div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-yellow-700 mb-1">
                        <Star className="w-3 h-3" />
                        <span className="text-xs font-medium">Rating</span>
                      </div>
                      <div className="text-xl font-bold text-yellow-900">{article.averageRating}/5</div>
                      <div className="text-xs text-yellow-700">({article.totalRatings})</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-green-700 mb-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span className="text-xs font-medium">Helpful</span>
                      </div>
                      <div className="text-xl font-bold text-green-900">{article.helpful}</div>
                      <div className="text-xs text-green-700">
                        {Math.round((article.helpful / (article.helpful + article.notHelpful)) * 100)}%
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-orange-700 mb-1">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs font-medium">Read Time</span>
                      </div>
                      <div className="text-xl font-bold text-orange-900">{article.estimatedReadTime}</div>
                      <div className="text-xs text-orange-700">minutes</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-purple-700 mb-1">
                        <User className="w-3 h-3" />
                        <span className="text-xs font-medium">Author</span>
                      </div>
                      <div className="text-sm font-medium text-purple-900 truncate">{article.author}</div>
                    </div>

                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3">
                      <div className="flex items-center gap-1 text-teal-700 mb-1">
                        <FileText className="w-3 h-3" />
                        <span className="text-xs font-medium">Article ID</span>
                      </div>
                      <div className="text-sm font-bold text-teal-900">{article.articleNumber}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {article.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div>
                      Created: {new Date(article.createdDate).toLocaleDateString()} •
                      Last updated: {new Date(article.lastUpdated).toLocaleDateString()}
                    </div>
                    {article.attachments > 0 && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {article.attachments} attachments
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Eye className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">View</span>
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Edit className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">Edit</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <BookOpen className="w-16 h-16 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
