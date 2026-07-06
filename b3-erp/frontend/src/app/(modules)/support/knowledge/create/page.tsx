'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Save, Eye, FileText, Tag, Users, Globe, Lock, AlertCircle,
  Plus, X, Upload, Link, Image, Code, List, Bold, Italic,
  Underline, AlignLeft, AlignCenter, AlignRight, BookOpen
} from 'lucide-react'
import { KnowledgeBaseService } from '@/services/support.service'

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-1'

export default function CreateKnowledgeArticle() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    summary: '',
    content: '',
    tags: [] as string[],
    visibility: 'public',
    relatedArticles: [] as string[],
    attachments: [] as string[],
    author: '',
    reviewers: [] as string[],
    status: 'draft'
  })

  const [currentTag, setCurrentTag] = useState('')
  const [currentArticle, setCurrentArticle] = useState('')
  const [currentReviewer, setCurrentReviewer] = useState('')

  const categories = [
    { id: 'faq', name: 'FAQ', subcategories: ['General', 'Account', 'Billing', 'Technical', 'Security'] },
    { id: 'guide', name: 'How-To Guide', subcategories: ['Getting Started', 'Advanced Features', 'Integration', 'Best Practices', 'Administration'] },
    { id: 'troubleshooting', name: 'Troubleshooting', subcategories: ['Login Issues', 'Performance', 'Errors', 'Configuration', 'Network'] },
    { id: 'reference', name: 'Reference Documentation', subcategories: ['API', 'Configuration', 'Architecture', 'Specifications'] },
    { id: 'tutorial', name: 'Tutorial', subcategories: ['Beginner', 'Intermediate', 'Advanced', 'Video Tutorials'] },
    { id: 'release', name: 'Release Notes', subcategories: ['Features', 'Bug Fixes', 'Breaking Changes', 'Deprecations'] }
  ]

  const selectedCategory = categories.find(cat => cat.id === formData.category)

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const addRelatedArticle = () => {
    if (currentArticle.trim() && !formData.relatedArticles.includes(currentArticle.trim())) {
      setFormData(prev => ({
        ...prev,
        relatedArticles: [...prev.relatedArticles, currentArticle.trim()]
      }))
      setCurrentArticle('')
    }
  }

  const removeRelatedArticle = (article: string) => {
    setFormData(prev => ({
      ...prev,
      relatedArticles: prev.relatedArticles.filter(a => a !== article)
    }))
  }

  const addReviewer = () => {
    if (currentReviewer.trim() && !formData.reviewers.includes(currentReviewer.trim())) {
      setFormData(prev => ({
        ...prev,
        reviewers: [...prev.reviewers, currentReviewer.trim()]
      }))
      setCurrentReviewer('')
    }
  }

  const removeReviewer = (reviewer: string) => {
    setFormData(prev => ({
      ...prev,
      reviewers: prev.reviewers.filter(r => r !== reviewer)
    }))
  }

  const handleSubmit = async (status: 'draft' | 'review' | 'published') => {
    try {
      await KnowledgeBaseService.createArticle({
        companyId: COMPANY_ID,
        title: formData.title,
        content: formData.content,
        summary: formData.summary,
        category: formData.category,
        subcategory: formData.subcategory,
        tags: formData.tags,
        isPublic: status === 'published' && formData.visibility === 'public',
        isInternal: formData.visibility === 'internal',
      } as any)
      router.push('/support/knowledge')
    } catch (err) {
      console.error('Failed to create article:', err)
      alert('Failed to create article. Please try again.')
    }
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Knowledge Article</h1>
          <p className="text-gray-600 mt-1">Write and publish articles to help users</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Eye className="h-4 w-4 inline mr-2" />
            Preview
          </button>
          <button
            onClick={() => handleSubmit('draft')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Save className="h-4 w-4 inline mr-2" />
            Save Draft
          </button>
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Writing Effective Knowledge Articles</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use clear, concise language and avoid jargon when possible</li>
              <li>• Include step-by-step instructions with screenshots or examples</li>
              <li>• Add relevant tags to improve searchability</li>
              <li>• Link to related articles for comprehensive coverage</li>
              <li>• Review and update articles regularly to keep information current</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-3">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Article Details
            </h2>

            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Article Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter a clear, descriptive title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory *
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    disabled={!formData.category}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Select Subcategory</option>
                    {selectedCategory?.subcategories.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary *
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Brief summary of the article (2-3 sentences)"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Article Content *</h2>

            {/* Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-2 mb-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                <Bold className="h-4 w-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                <Italic className="h-4 w-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                <Underline className="h-4 w-4 text-gray-600" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                <AlignLeft className="h-4 w-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                <AlignCenter className="h-4 w-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                <AlignRight className="h-4 w-4 text-gray-600" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1"></div>
              <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                <List className="h-4 w-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                <Link className="h-4 w-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                <Image className="h-4 w-4 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                <Code className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your article content here. Use markdown formatting for headings, lists, code blocks, etc."
              rows={20}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
            />

            <p className="text-xs text-gray-500 mt-2">
              Supports Markdown formatting. Use ## for headings, - for lists, ` for inline code, ``` for code blocks
            </p>
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Upload className="h-5 w-5 text-purple-600" />
              Attachments
            </h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Support for images, PDFs, and documents (Max 10MB each)
              </p>
              <button className="mt-4 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100">
                Choose Files
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-3">
          {/* Publishing Options */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-600" />
              Publishing
            </h2>

            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibility
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={formData.visibility === 'public'}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                      className="mr-2"
                    />
                    <Globe className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">Public - Anyone can view</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      value="internal"
                      checked={formData.visibility === 'internal'}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                      className="mr-2"
                    />
                    <Users className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="text-sm">Internal - Staff only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={formData.visibility === 'private'}
                      onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                      className="mr-2"
                    />
                    <Lock className="h-4 w-4 mr-2 text-orange-600" />
                    <span className="text-sm">Private - Restricted access</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author
                </label>
                <select
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Author</option>
                  <option value="current">Current User</option>
                  <option value="rajesh">Rajesh Kumar</option>
                  <option value="priya">Priya Sharma</option>
                  <option value="amit">Amit Patel</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <button
                  onClick={() => handleSubmit('review')}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700"
                >
                  Submit for Review
                </button>
                <button
                  onClick={() => handleSubmit('published')}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700"
                >
                  Publish Now
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Tag className="h-5 w-5 text-purple-600" />
              Tags
            </h2>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={addTag}
                  className="px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full border border-purple-200"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-purple-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              <p className="text-xs text-gray-500">
                Suggested: account, login, setup, integration, troubleshooting
              </p>
            </div>
          </div>

          {/* Related Articles */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Link className="h-5 w-5 text-purple-600" />
              Related Articles
            </h2>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentArticle}
                  onChange={(e) => setCurrentArticle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRelatedArticle())}
                  placeholder="Article ID or URL"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={addRelatedArticle}
                  className="px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {formData.relatedArticles.map((article, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded text-sm"
                  >
                    <span className="font-mono text-blue-800">{article}</span>
                    <button onClick={() => removeRelatedArticle(article)} className="text-blue-600 hover:text-blue-800">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviewers */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Reviewers
            </h2>

            <div className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={currentReviewer}
                  onChange={(e) => setCurrentReviewer(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Reviewer</option>
                  <option value="rajesh">Rajesh Kumar</option>
                  <option value="priya">Priya Sharma</option>
                  <option value="amit">Amit Patel</option>
                  <option value="sneha">Sneha Reddy</option>
                </select>
                <button
                  onClick={addReviewer}
                  className="px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {formData.reviewers.map((reviewer, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-sm"
                  >
                    <span className="text-green-800">{reviewer}</span>
                    <button onClick={() => removeReviewer(reviewer)} className="text-green-600 hover:text-green-800">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
