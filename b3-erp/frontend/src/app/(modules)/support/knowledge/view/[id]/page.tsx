'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, AlertCircle, BookOpen, Eye, ThumbsUp, ThumbsDown, Tag, User, Calendar } from 'lucide-react';
import { KnowledgeBaseService, type KnowledgeArticle } from '@/services/support.service';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-red-100 text-red-700',
  under_review: 'bg-yellow-100 text-yellow-700',
};

const titleCase = (v: string) =>
  (v || '').split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const fmtDate = (d: unknown) => (d ? String(d).slice(0, 10) : '—');

export default function KnowledgeViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await KnowledgeBaseService.getArticleById(params.id);
        if (!cancelled) setArticle(res);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load article');
          setArticle(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  return (
    <div className="w-full min-h-screen px-3 py-2 max-w-full">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/support/knowledge')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Knowledge Base
        </button>
        {article && (
          <button
            onClick={() => router.push(`/support/knowledge/edit/${article.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          <div className="h-8 w-1/2 animate-pulse rounded bg-gray-200" />
          <div className="h-64 w-full animate-pulse rounded-lg bg-gray-100" />
        </div>
      )}

      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {!isLoading && !loadError && !article && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 text-center">
          <BookOpen className="h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-900">Article not found</p>
          <p className="text-sm text-gray-500">The article you are looking for does not exist.</p>
        </div>
      )}

      {!isLoading && !loadError && article && (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-blue-600">{article.articleNumber}</div>
                <h1 className="mt-1 text-xl font-semibold text-gray-900">{article.title}</h1>
                {article.summary && <p className="mt-2 text-sm text-gray-600">{article.summary}</p>}
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[article.status] || 'bg-gray-100 text-gray-700'}`}>
                {titleCase(article.status)}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><User className="h-3 w-3" /> {article.authorName || '—'}</span>
              <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {article.viewCount ?? 0} views</span>
              <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {article.helpfulCount ?? 0}</span>
              <span className="flex items-center gap-1"><ThumbsDown className="h-3 w-3" /> {article.notHelpfulCount ?? 0}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Updated {fmtDate(article.updatedAt)}</span>
            </div>

            {Array.isArray(article.tags) && article.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {article.tags.map((tag, idx) => (
                  <span key={idx} className="flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
              <p className="text-gray-500">Category</p>
              <p className="mt-1 font-medium text-gray-900">{article.category || '—'}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
              <p className="text-gray-500">Subcategory</p>
              <p className="mt-1 font-medium text-gray-900">{article.subcategory || '—'}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
              <p className="text-gray-500">Published</p>
              <p className="mt-1 font-medium text-gray-900">{fmtDate(article.publishedDate)}</p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Content</h2>
            <div className="whitespace-pre-wrap text-sm text-gray-700">{article.content || '—'}</div>
          </div>
        </div>
      )}
    </div>
  );
}
