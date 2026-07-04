'use client'

import { useState, useEffect } from 'react'
import {
  Search, Plus, HelpCircle, ThumbsUp, ThumbsDown, Eye, Calendar,
  ChevronDown, ChevronUp, Tag, Star, TrendingUp, Edit, Trash2,
  Filter, BookOpen, MessageCircle, AlertCircle
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

export default function FAQs() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const [stats] = useState({
    totalFAQs: 48,
    featured: 12,
    avgViews: 1250,
    avgHelpful: 89,
    categoriesCount: 6,
    updatedThisWeek: 5
  })

  const [faqs] = useState<FAQ[]>([
    {
      id: '1',
      faqId: 'FAQ-001',
      question: 'How do I reset my password?',
      answer: 'To reset your password:\n\n1. Click on "Forgot Password?" link on the login page\n2. Enter your registered email address\n3. Check your email for a password reset link (valid for 24 hours)\n4. Click the link and enter your new password\n5. Confirm the new password and submit\n\nIf you don\'t receive the email within 5 minutes, check your spam folder or contact support.',
      category: 'Account',
      tags: ['password', 'login', 'security', 'account'],
      views: 3245,
      helpful: 298,
      notHelpful: 12,
      lastUpdated: '2024-10-18',
      author: 'Priya Sharma',
      featured: true
    },
    {
      id: '2',
      faqId: 'FAQ-002',
      question: 'How do I export data to Excel?',
      answer: 'Exporting data to Excel is simple:\n\n1. Navigate to any list view (e.g., Orders, Customers, Products)\n2. Apply any filters you need to narrow down the data\n3. Click the "Export" button in the top-right corner\n4. Select "Excel (.xlsx)" from the format dropdown\n5. Choose which columns to include (or select "All Columns")\n6. Click "Download Export"\n\nThe file will be downloaded to your default downloads folder. Large exports may take a few moments to process.',
      category: 'General',
      tags: ['export', 'excel', 'data', 'download'],
      views: 2876,
      helpful: 245,
      notHelpful: 8,
      lastUpdated: '2024-10-15',
      author: 'Rajesh Kumar',
      featured: true
    },
    {
      id: '3',
      faqId: 'FAQ-003',
      question: 'What are the different user roles and permissions?',
      answer: 'Our system has 5 primary user roles:\n\n**Administrator** - Full access to all modules, user management, and system settings\n\n**Manager** - Access to operational modules, reporting, and team management\n\n**Operator** - Access to production modules, work orders, and shop floor operations\n\n**Viewer** - Read-only access to assigned modules for monitoring and reporting\n\n**Custom** - Configurable role with specific permissions tailored to your needs\n\nPermissions can be customized for each role under Admin > User Management > Roles.',
      category: 'Security',
      tags: ['roles', 'permissions', 'access', 'security', 'users'],
      views: 2134,
      helpful: 189,
      notHelpful: 15,
      lastUpdated: '2024-10-20',
      author: 'Sneha Reddy',
      featured: true
    },
    {
      id: '4',
      faqId: 'FAQ-004',
      question: 'How do I configure email notifications?',
      answer: 'To configure email notifications:\n\n1. Click on your profile icon in the top-right corner\n2. Select "Settings" from the dropdown\n3. Navigate to the "Notifications" tab\n4. Choose which events you want to be notified about:\n   - Order updates\n   - Production alerts\n   - System maintenance\n   - Performance reports\n5. Select notification frequency (real-time, daily digest, weekly summary)\n6. Save your preferences\n\nYou can also configure team-wide notification settings from Admin > System Settings > Notifications.',
      category: 'Technical',
      tags: ['notifications', 'email', 'settings', 'alerts'],
      views: 1892,
      helpful: 156,
      notHelpful: 7,
      lastUpdated: '2024-10-17',
      author: 'Amit Patel',
      featured: false
    },
    {
      id: '5',
      faqId: 'FAQ-005',
      question: 'Can I integrate with third-party systems?',
      answer: 'Yes! We support multiple integration methods:\n\n**REST API** - Full-featured API for custom integrations. Documentation available at /api/docs\n\n**Webhooks** - Real-time event notifications to your endpoints\n\n**Pre-built Connectors** - Ready-to-use integrations for:\n- Accounting software (QuickBooks, Xero)\n- CRM systems (Salesforce, HubSpot)\n- E-commerce platforms (Shopify, WooCommerce)\n- Shipping providers (FedEx, UPS, DHL)\n\n**File-based Import/Export** - CSV, Excel, XML formats supported\n\nContact our integration team for assistance with complex integration requirements.',
      category: 'Technical',
      tags: ['integration', 'api', 'webhooks', 'third-party'],
      views: 1645,
      helpful: 142,
      notHelpful: 18,
      lastUpdated: '2024-10-19',
      author: 'Vikram Singh',
      featured: false
    },
    {
      id: '6',
      faqId: 'FAQ-006',
      question: 'What browsers are supported?',
      answer: 'We support the latest versions of all major browsers:\n\n**Fully Supported:**\n- Google Chrome (recommended)\n- Mozilla Firefox\n- Microsoft Edge (Chromium)\n- Safari 14+\n\n**Limited Support:**\n- Internet Explorer 11 (basic functionality only, not recommended)\n\nFor the best experience, we recommend using the latest version of Chrome or Edge. Mobile browsers on iOS and Android are also supported.',
      category: 'Technical',
      tags: ['browser', 'compatibility', 'support', 'technical'],
      views: 1234,
      helpful: 98,
      notHelpful: 5,
      lastUpdated: '2024-10-12',
      author: 'Priya Sharma',
      featured: false
    },
    {
      id: '7',
      faqId: 'FAQ-007',
      question: 'How do I change my subscription plan?',
      answer: 'To upgrade or downgrade your subscription:\n\n1. Go to Admin > Billing > Subscription\n2. Click "Change Plan"\n3. Review available plans and features\n4. Select your desired plan\n5. Review the pricing change (prorated for current billing period)\n6. Confirm the change\n\n**Upgrades** take effect immediately with prorated billing.\n\n**Downgrades** take effect at the end of your current billing cycle.\n\nContact our sales team for enterprise or custom plans.',
      category: 'Billing',
      tags: ['subscription', 'billing', 'plan', 'upgrade', 'pricing'],
      views: 1567,
      helpful: 134,
      notHelpful: 9,
      lastUpdated: '2024-10-16',
      author: 'Rajesh Kumar',
      featured: false
    },
    {
      id: '8',
      faqId: 'FAQ-008',
      question: 'How is my data backed up?',
      answer: 'Your data security is our priority:\n\n**Automated Backups:**\n- Full backups: Daily at 2:00 AM UTC\n- Incremental backups: Every 6 hours\n- Retention: 30 days of daily backups, 12 months of monthly backups\n\n**Storage:**\n- Encrypted at rest using AES-256\n- Geo-redundant storage across multiple data centers\n- 99.99% durability guarantee\n\n**Recovery:**\n- Point-in-time recovery available for the last 30 days\n- Full system restoration typically within 4 hours\n- Contact support to request a restore\n\nEnterprise plans include custom backup schedules and dedicated backup storage.',
      category: 'Security',
      tags: ['backup', 'data', 'security', 'recovery', 'storage'],
      views: 1423,
      helpful: 178,
      notHelpful: 3,
      lastUpdated: '2024-10-14',
      author: 'Sneha Reddy',
      featured: true
    }
  ])

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
        <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700">
          <Plus className="h-4 w-4 inline mr-2" />
          Add FAQ
        </button>
      </div>

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
                      console.log('Edit FAQ:', faq.id)
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                   
                  >
                    <Edit className="h-4 w-4" />
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
                    <button className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      Yes
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1">
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

      {filteredFAQs.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <HelpCircle className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No FAQs found matching your search.</p>
        </div>
      )}
    </div>
  )
}
