'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, BookOpen, Save } from 'lucide-react';
import { KnowledgeBaseService, type KnowledgeArticle } from '@/services/support.service';

interface FormState {
  title: string;
  summary: string;
  content: string;
  category: string;
  subcategory: string;
  status: KnowledgeArticle['status'];
  tags: string;
}

export default function KnowledgeEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState | null>(null);
  const [articleNumber, setArticleNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const a = await KnowledgeBaseService.getArticleById(params.id);
        if (!a) throw new Error('Article not found');
        if (!cancelled) {
          setArticleNumber(a.articleNumber || '');
          setForm({
            title: a.title || '',
            summary: a.summary || '',
            content: a.content || '',
            category: a.category || '',
            subcategory: a.subcategory || '',
            status: a.status || 'draft',
            tags: Array.isArray(a.tags) ? a.tags.join(', ') : '',
          });
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load article');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await KnowledgeBaseService.updateArticle(params.id, {
        title: form.title,
        summary: form.summary || undefined,
        content: form.content,
        category: form.category,
        subcategory: form.subcategory || undefined,
        status: form.status,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      router.push('/support/knowledge');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save article');
      setIsSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="w-full min-h-screen px-3 py-2 max-w-3xl">
      <div className="mb-4">
        <button
          onClick={() => router.push('/support/knowledge')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Knowledge Base
        </button>
      </div>

      <h1 className="mb-4 text-xl font-semibold text-gray-900">
        Edit Article {articleNumber && <span className="text-blue-600">{articleNumber}</span>}
      </h1>

      {isLoading && (
        <div className="space-y-3">
          <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-24 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-40 w-full animate-pulse rounded bg-gray-100" />
        </div>
      )}

      {loadError && !isLoading && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white py-16 text-center">
          <BookOpen className="h-10 w-10 text-gray-300" />
          <p className="mt-3 flex items-center gap-2 text-sm font-medium text-red-700">
            <AlertCircle className="h-4 w-4" /> {loadError}
          </p>
        </div>
      )}

      {!isLoading && !loadError && form && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          {saveError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {saveError}
            </div>
          )}

          <div>
            <label className={labelCls}>Title</label>
            <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} className={inputCls} required />
          </div>

          <div>
            <label className={labelCls}>Summary</label>
            <textarea value={form.summary} onChange={(e) => update('summary', e.target.value)} rows={2} className={inputCls} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={labelCls}>Category</label>
              <input type="text" value={form.category} onChange={(e) => update('category', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Subcategory</label>
              <input type="text" value={form.subcategory} onChange={(e) => update('subcategory', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={(e) => update('status', e.target.value as FormState['status'])} className={inputCls}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Tags (comma-separated)</label>
            <input type="text" value={form.tags} onChange={(e) => update('tags', e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Content</label>
            <textarea value={form.content} onChange={(e) => update('content', e.target.value)} rows={10} className={inputCls} />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => router.push('/support/knowledge')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
