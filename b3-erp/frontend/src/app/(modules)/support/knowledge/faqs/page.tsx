'use client'

import { useState, useEffect } from 'react'
import {
  Search, Plus, HelpCircle, ThumbsUp, ThumbsDown, Eye, Calendar,
  ChevronDown, ChevronUp, Tag, Star, TrendingUp, Edit, Trash2,
  Filter, BookOpen, MessageCircle, AlertCircle, X
} from 'lucide-react'
import { supportPagesService } from '@/services/support-pages.service'

interface FAQ {
  id: string
  faqId: string
  question: string
  answer: string
  category: string
  tags: string[]
  views: number
  helpful: number
  notHelpful: number
  lastUpdated: string
  author: string
  featured: boolean
}

interface FaqFormState {
  id: string | null
  faqId: string
  question: string
  answer: string
  category: string
  tags: string
  featured: boolean
  author: string
}

const EMPTY_FORM: FaqFormState = {
  id: null,
  faqId: '',
  question: '',
  answer: '',
  category: 'General',
  tags: '',
  featured: false,
  author: '',
}

export default function FAQs() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FaqFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const mapRow = (r: any, i: number): FAQ => ({
    id: String(r.id ?? i),
    faqId: r.faqId ?? r.code ?? '',
    question: r.question ?? '',
    answer: r.answer ?? '',
    category: r.category ?? '',
    tags: Array.isArray(r.tags) ? r.tags : [],
    views: r.views ?? 0,
    helpful: r.helpful ?? 0,
    notHelpful: r.notHelpful ?? 0,
    lastUpdated: r.lastUpdated ?? r.updatedAt ?? '',
    author: r.author ?? '',
    featured: r.featured ?? false,
  })

  const loadFaqs = async (signal?: { cancelled: boolean }) => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const raw = await supportPagesService.getFaqs()
      const mapped: FAQ[] = raw.map(mapRow)
      if (!signal?.cancelled) setFaqs(mapped)
    } catch (e) {
      if (!signal?.cancelled) {
        setLoadError(e instanceof Error ? e.message : 'Failed to load')
        setFaqs([])
      }
    } finally {
      if (!signal?.cancelled) setIsLoading(false)
    }
  }

  useEffect(() => {
    const signal = { cancelled: false }
    loadFaqs(signal)
    return () => { signal.cancelled = true }
  }, [])

  const stats = {
    totalFAQs: faqs.length,
    featured: faqs.filter(f => f.featured).length,
    avgViews: faqs.length ? Math.round(faqs.reduce((s, f) => s + f.views, 0) / faqs.length) : 0,
    avgHelpful: (() => {
      const withVotes = faqs.filter(f => f.helpful + f.notHelpful > 0)
      if (!withVotes.length) return 0
      return Math.round(
        withVotes.reduce((s, f) => s + (f.helpful / (f.helpful + f.notHelpful)) * 100, 0) / withVotes.length,
      )
    })(),
    categoriesCount: new Set(faqs.map(f => f.category).filter(Boolean)).size,
    updatedThisWeek: faqs.filter(f => {
      if (!f.lastUpdated) return false
      const d = new Date(f.lastUpdated).getTime()
      return !Number.isNaN(d) && Date.now() - d < 7 * 24 * 60 * 60 * 1000
    }).length,
  }

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setActionError(null)
    setShowForm(true)
  }

  const openEdit = (faq: FAQ) => {
    setForm({
      id: faq.id,
      faqId: faq.faqId,
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'General',
      tags: faq.tags.join(', '),
      featured: faq.featured,
      author: faq.author,
    })
    setActionError(null)
    setShowForm(true)
  }

  const saveForm = async () => {
    if (saving) return
    if (!form.question.trim()) {
      setActionError('Question is required.')
      return
    }
    setSaving(true)
    setActionError(null)
    const payload = {
      question: form.question,
      answer: form.answer,
      category: form.category,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      featured: form.featured,
      author: form.author || undefined,
    }
    try {
      if (form.id) {
        await supportPagesService.updateFaq(form.id, payload)
      } else {
        await supportPagesService.createFaq(payload)
      }
      setShowForm(false)
      await loadFaqs()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to save FAQ.')
    } finally {
      setSaving(false)
    }
  }

  const deleteFaq = async (faq: FAQ) => {
    if (busyId) return
    setBusyId(faq.id)
    setActionError(null)
    try {
      await supportPagesService.deleteFaq(faq.id)
      await loadFaqs()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to delete FAQ.')
    } finally {
      setBusyId(null)
    }
  }

  const rateFaq = async (faq: FAQ, helpful: boolean) => {
    if (busyId) return
    setBusyId(faq.id)
    setActionError(null)
    try {
      await supportPagesService.rateFaq(faq.id, helpful, { helpful: faq.helpful, notHelpful: faq.notHelpful })
      await loadFaqs()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Failed to record feedback.')
    } finally {
      setBusyId(null)
    }
  }

  const categories = ['all', 'General', 'Account', 'Billing', 'Technical', 'Security']

  const filteredFAQs = faqs
    .filter(faq => {
      const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = categoryFilter === 'all' || faq.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.views - a.views
        case 'helpful':
          return b.helpful - a.helpful
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        default:
          return 0
      }
    })

  const toggleExpand = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  const helpfulPercentage = (faq: FAQ) => {
    const total = faq.helpful + faq.notHelpful
    return total > 0 ? Math.round((faq.helpful / total) * 100) : 0
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
          <p className="text-gray-600 mt-1">Quick answers to common questions</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700"
        >
          <Plus className="h-4 w-4 inline mr-2" />
          Add FAQ
        </button>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {actionError}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading FAQs…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total FAQs</p>
              <p className="text-2xl font-bold mt-1">{stats.totalFAQs}</p>
            </div>
            <HelpCircle className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Featured</p>
              <p className="text-2xl font-bold mt-1">{stats.featured}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Avg Views</p>
              <p className="text-2xl font-bold mt-1">{stats.avgViews}</p>
            </div>
            <Eye className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Avg Helpful</p>
              <p className="text-2xl font-bold mt-1">{stats.avgHelpful}%</p>
            </div>
            <ThumbsUp className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Categories</p>
              <p className="text-2xl font-bold mt-1">{stats.categoriesCount}</p>
            </div>
            <Tag className="h-8 w-8 text-indigo-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Updated</p>
              <p className="text-2xl font-bold mt-1">{stats.updatedThisWeek}</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="popular">Most Popular</option>
            <option value="helpful">Most Helpful</option>
            <option value="recent">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Featured FAQs */}
      {categoryFilter === 'all' && !searchQuery && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <h2 className="text-lg font-semibold text-gray-900">Featured FAQs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {faqs.filter(f => f.featured).slice(0, 4).map(faq => (
              <div
                key={faq.id}
                className="bg-white rounded-lg p-3 border border-yellow-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => toggleExpand(faq.id)}
              >
                <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {faq.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {helpfulPercentage(faq)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ List */}
      <div className="space-y-3">
        {filteredFAQs.map((faq) => (
          <div key={faq.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div
              className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleExpand(faq.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {faq.featured && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                    <code className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      {faq.faqId}
                    </code>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200">
                      {faq.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-purple-600" />
                    {faq.question}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {faq.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      {faq.helpful}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      {faq.notHelpful}
                    </span>
                    <span className="text-gray-500">
                      {helpfulPercentage(faq)}% found helpful
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openEdit(faq)
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteFaq(faq)
                    }}
                    disabled={busyId === faq.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {expandedFAQ === faq.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {expandedFAQ === faq.id && (
              <div className="border-t border-gray-200 bg-gray-50 p-5">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-line text-gray-700 mb-2">
                    {faq.answer}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {faq.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full border border-purple-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>By {faq.author}</span>
                    <span>Updated: {faq.lastUpdated}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 mr-2">Was this helpful?</span>
                    <button
                      onClick={() => rateFaq(faq, true)}
                      disabled={busyId === faq.id}
                      className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Yes
                    </button>
                    <button
                      onClick={() => rateFaq(faq, false)}
                      disabled={busyId === faq.id}
                      className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      No
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div className="flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-purple-900 mb-2">Can't find what you're looking for?</h3>
            <p className="text-sm text-purple-800 mb-3">
              If you couldn't find the answer to your question, try searching our guides and troubleshooting articles, or contact our support team.
            </p>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors">
                Browse Guides
              </button>
              <button className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {!isLoading && filteredFAQs.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <HelpCircle className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No FAQs found matching your search.</p>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {form.id ? 'Edit FAQ' : 'Add FAQ'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 p-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Question *</label>
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter the question"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Answer</label>
                <textarea
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  rows={5}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter the answer"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.filter(c => c !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Author</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500"
                    placeholder="Author name"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. account, login, billing"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="rounded"
                />
                Featured
              </label>
              {actionError && <p className="text-sm text-red-600">{actionError}</p>}
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 p-4">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveForm}
                disabled={saving}
                className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving…' : form.id ? 'Save Changes' : 'Add FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
