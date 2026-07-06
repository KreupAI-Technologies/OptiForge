'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, Plus, X, BookOpen, FileText, Video, Code } from 'lucide-react';
import { crmService } from '@/services/crm.service';

export default function CreateArticlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: 'getting_started' as 'getting_started' | 'how_to' | 'troubleshooting' | 'api_docs' | 'best_practices' | 'faq' | 'release_notes',
    type: 'article' as 'article' | 'video' | 'code_snippet' | 'tutorial',
    content: '',
    author: '',
    difficultyLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    estimatedReadTime: '',
    isPinned: false,
    isPublished: false,
  });

  const [tags, setTags] = useState<string[]>(['']);
  const [relatedArticles, setRelatedArticles] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.excerpt.trim()) newErrors.excerpt = 'Excerpt is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.author.trim()) newErrors.author = 'Author is required';
    if (!formData.estimatedReadTime) newErrors.estimatedReadTime = 'Estimated read time is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const payload: any = {
        companyId: 'default-company-id',
        title: formData.title,
        excerpt: formData.excerpt,
        category: formData.category,
        type: formData.type,
        content: formData.content,
        author: formData.author,
        difficultyLevel: formData.difficultyLevel,
        estimatedReadTime: Number(formData.estimatedReadTime),
        isPinned: formData.isPinned,
        isPublished: formData.isPublished,
        status: formData.isPublished ? 'published' : 'draft',
        tags: tags.map((t) => t.trim()).filter(Boolean),
        relatedArticles: relatedArticles.map((a) => a.trim()).filter(Boolean),
      };
      await crmService.knowledgeArticles.create(payload);
      router.push('/crm/support/knowledge');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create article. Please try again.');
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    setTags([...tags, '']);
  };

  const removeTag = (index: number) => {
    if (tags.length > 1) {
      setTags(tags.filter((_, i) => i !== index));
    }
  };

  const updateTag = (index: number, value: string) => {
    const newTags = [...tags];
    newTags[index] = value;
    setTags(newTags);
  };

  const addRelatedArticle = () => {
    setRelatedArticles([...relatedArticles, '']);
  };

  const removeRelatedArticle = (index: number) => {
    if (relatedArticles.length > 1) {
      setRelatedArticles(relatedArticles.filter((_, i) => i !== index));
    }
  };

  const updateRelatedArticle = (index: number, value: string) => {
    const newArticles = [...relatedArticles];
    newArticles[index] = value;
    setRelatedArticles(newArticles);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'article': return <FileText className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'code_snippet': return <Code className="w-5 h-5" />;
      case 'tutorial': return <BookOpen className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Knowledge Base
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create Knowledge Base Article</h1>
          <p className="text-gray-600 mt-2">Write and publish a new knowledge base article</p>
        </div>

        {submitError && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-3">
              {/* Basic Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h2>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Article Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Getting Started with Your First Project"
                    />
                    {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Excerpt (Summary) *
                    </label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.excerpt ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Brief summary that appears in search results and article listings..."
                    />
                    {errors.excerpt && <p className="text-red-600 text-sm mt-1">{errors.excerpt}</p>}
                    <p className="text-xs text-gray-500 mt-1">Keep it under 150 characters for best results</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="getting_started">Getting Started</option>
                        <option value="how_to">How To</option>
                        <option value="troubleshooting">Troubleshooting</option>
                        <option value="api_docs">API Documentation</option>
                        <option value="best_practices">Best Practices</option>
                        <option value="faq">FAQ</option>
                        <option value="release_notes">Release Notes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="article">Article</option>
                        <option value="tutorial">Tutorial</option>
                        <option value="video">Video</option>
                        <option value="code_snippet">Code Snippet</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Difficulty Level *
                      </label>
                      <select
                        value={formData.difficultyLevel}
                        onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Read Time (minutes) *
                      </label>
                      <input
                        type="number"
                        value={formData.estimatedReadTime}
                        onChange={(e) => setFormData({ ...formData, estimatedReadTime: e.target.value })}
                        min="1"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.estimatedReadTime ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="5"
                      />
                      {errors.estimatedReadTime && <p className="text-red-600 text-sm mt-1">{errors.estimatedReadTime}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Author *
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                        errors.author ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Sarah Johnson"
                    />
                    {errors.author && <p className="text-red-600 text-sm mt-1">{errors.author}</p>}
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Article Content</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={20}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                      errors.content ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Write your article content here. You can use Markdown formatting..."
                  />
                  {errors.content && <p className="text-red-600 text-sm mt-1">{errors.content}</p>}
                  <p className="text-xs text-gray-500 mt-2">
                    Supports Markdown formatting: **bold**, *italic*, `code`, ## Headings, - Lists, etc.
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
                  <button
                    type="button"
                    onClick={addTag}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Tag
                  </button>
                </div>
                <div className="space-y-3">
                  {tags.map((tag, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => updateTag(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Setup"
                      />
                      {tags.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Tags help users find related content</p>
              </div>

              {/* Related Articles */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Related Articles</h2>
                  <button
                    type="button"
                    onClick={addRelatedArticle}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Related Article
                  </button>
                </div>
                <div className="space-y-3">
                  {relatedArticles.map((article, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={article}
                        onChange={(e) => updateRelatedArticle(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., KB-002"
                      />
                      {relatedArticles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRelatedArticle(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Enter article IDs (e.g., KB-001, KB-002)</p>
              </div>

              {/* Publishing Options */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Publishing Options</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Pin to Top</span>
                      <p className="text-xs text-gray-500">Pinned articles appear at the top of search results</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Publish Immediately</span>
                      <p className="text-xs text-gray-500">Article will be visible to all users</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving…' : formData.isPublished ? 'Create & Publish' : 'Save as Draft'}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-3">
              {/* Writing Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Writing Tips</h3>
                    <ul className="text-sm text-blue-700 space-y-2">
                      <li>• Use clear, concise language</li>
                      <li>• Include step-by-step instructions</li>
                      <li>• Add screenshots or code examples</li>
                      <li>• Keep paragraphs short and scannable</li>
                      <li>• Use headings to organize content</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Article Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Article Summary</h3>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Content Type</div>
                    <div className="flex items-center gap-2 text-gray-900">
                      {getTypeIcon(formData.type)}
                      <span className="capitalize">{formData.type.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Category</div>
                    <div className="text-gray-900 capitalize">
                      {formData.category.replace('_', ' ')}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Difficulty</div>
                    <div className="text-gray-900 capitalize">
                      {formData.difficultyLevel}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Read Time</div>
                    <div className="text-gray-900">
                      {formData.estimatedReadTime || '-'} {formData.estimatedReadTime && 'minutes'}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Status</div>
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                      formData.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {formData.isPublished ? 'Will Publish' : 'Draft'}
                    </span>
                  </div>

                  {formData.isPinned && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Pinned</div>
                      <div className="text-yellow-700 text-sm">⭐ Article will be pinned to top</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Markdown Cheat Sheet */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Markdown Cheat Sheet</h3>
                <div className="space-y-2 text-xs font-mono">
                  <div className="border-b border-gray-100 pb-2">
                    <div className="text-gray-600">**bold**</div>
                    <div className="font-bold">bold</div>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <div className="text-gray-600">*italic*</div>
                    <div className="italic">italic</div>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <div className="text-gray-600">`code`</div>
                    <div className="bg-gray-100 px-1 inline">code</div>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <div className="text-gray-600">## Heading 2</div>
                    <div className="text-lg font-bold">Heading 2</div>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <div className="text-gray-600">- List item</div>
                    <div>• List item</div>
                  </div>
                  <div>
                    <div className="text-gray-600">[Link](url)</div>
                    <div className="text-blue-600 underline">Link</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
