'use client'

import { useState, useEffect } from 'react'
import { SupportTroubleshootingService } from '@/services/support.service'
import {
  Search, Plus, AlertTriangle, CheckCircle, XCircle, Clock,
  ChevronDown, ChevronUp, Tag, Filter, Eye, ThumbsUp, Wrench,
  Zap, Database, Network, Shield, Settings, BookOpen, ArrowRight
} from 'lucide-react'

interface TroubleshootingArticle {
  id: string
  articleId: string
  title: string
  problem: string
  solution: string
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  steps: string[]
  causes: string[]
  prevention: string[]
  tags: string[]
  views: number
  helpful: number
  lastUpdated: string
  author: string
  relatedArticles: string[]
}

export default function Troubleshooting() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null)

  const [stats] = useState({
    totalArticles: 52,
    critical: 8,
    avgResolutionTime: '12 min',
    avgHelpful: 88,
    categories: 6,
    updatedThisWeek: 7
  })

  const [articles, setArticles] = useState<TroubleshootingArticle[]>([
    {
      id: '1',
      articleId: 'TS-001',
      title: 'Unable to Login - Invalid Credentials Error',
      problem: 'Users receive "Invalid credentials" error even when using correct username and password.',
      solution: 'This issue is typically caused by caps lock, expired password, or account lockout after multiple failed attempts.',
      category: 'Login Issues',
      severity: 'high',
      steps: [
        'Verify caps lock is OFF and check keyboard language settings',
        'Try using "Forgot Password" to reset your password',
        'Wait 15 minutes if account is locked after failed attempts',
        'Clear browser cache and cookies, then try again',
        'Try logging in from a different browser or incognito mode',
        'If issue persists, contact IT admin to verify account status'
      ],
      causes: [
        'Caps Lock or Num Lock enabled',
        'Password has expired and needs to be changed',
        'Account locked after 5 failed login attempts',
        'Browser cached old credentials',
        'User account disabled by administrator'
      ],
      prevention: [
        'Change password before it expires (system sends reminder 7 days before)',
        'Use password manager to avoid typing errors',
        'Be aware of keyboard state (Caps Lock indicator)',
        'Keep active session to avoid frequent re-logins'
      ],
      tags: ['login', 'authentication', 'password', 'account'],
      views: 4532,
      helpful: 412,
      lastUpdated: '2024-10-19',
      author: 'Priya Sharma',
      relatedArticles: ['TS-002', 'TS-015']
    },
    {
      id: '2',
      articleId: 'TS-002',
      title: 'Page Loading Slowly or Timing Out',
      problem: 'Application pages take a long time to load or display timeout errors.',
      solution: 'Performance issues are often related to network connectivity, browser cache, or server load.',
      category: 'Performance',
      severity: 'medium',
      steps: [
        'Check your internet connection speed (should be at least 5 Mbps)',
        'Clear browser cache: Settings > Privacy > Clear Browsing Data',
        'Disable browser extensions temporarily to rule out conflicts',
        'Try accessing from a different network to isolate network issues',
        'Check system status page for any ongoing maintenance or outages',
        'If using VPN, try disconnecting and reconnecting',
        'Close unused tabs and applications to free up system resources'
      ],
      causes: [
        'Slow or unstable internet connection',
        'Large amount of cached data in browser',
        'Browser extensions interfering with application',
        'VPN connection issues or restrictions',
        'Server experiencing high load during peak hours',
        'Outdated browser version'
      ],
      prevention: [
        'Clear browser cache weekly',
        'Use recommended browsers (Chrome, Edge, Firefox latest versions)',
        'Ensure stable internet connection (wired preferred over WiFi)',
        'Schedule heavy operations during off-peak hours',
        'Keep browser updated to latest version'
      ],
      tags: ['performance', 'slow', 'timeout', 'network'],
      views: 3876,
      helpful: 354,
      lastUpdated: '2024-10-18',
      author: 'Rajesh Kumar',
      relatedArticles: ['TS-008', 'TS-012']
    },
    {
      id: '3',
      articleId: 'TS-003',
      title: 'Data Not Saving - Changes Lost After Refresh',
      problem: 'Form changes are not being saved, or data disappears after page refresh.',
      solution: 'This usually indicates a session timeout, browser issue, or validation error preventing save.',
      category: 'Errors',
      severity: 'high',
      steps: [
        'Check for error messages at the top of the form (red banner)',
        'Verify all required fields (marked with *) are filled',
        'Ensure your session hasn\'t timed out - look for session expiry warning',
        'Click "Save" button again and watch for confirmation message',
        'Check browser console for JavaScript errors (F12 > Console tab)',
        'Try saving in a different browser to rule out browser-specific issues',
        'If using autofill, manually review all fields for accuracy'
      ],
      causes: [
        'Required fields not filled or contain invalid data',
        'Session expired due to 30-minute inactivity timeout',
        'JavaScript errors preventing form submission',
        'Network interruption during save operation',
        'Data validation rules not met (e.g., duplicate entries)',
        'Insufficient permissions to modify the record'
      ],
      prevention: [
        'Save work frequently, don\'t wait until finishing entire form',
        'Keep session active by interacting with the system regularly',
        'Enable browser notifications for session expiry warnings',
        'Review validation messages before attempting to save',
        'Use "Save Draft" feature for long forms'
      ],
      tags: ['save', 'data', 'form', 'validation'],
      views: 3245,
      helpful: 298,
      lastUpdated: '2024-10-20',
      author: 'Amit Patel',
      relatedArticles: ['TS-007', 'TS-011']
    },
    {
      id: '4',
      articleId: 'TS-004',
      title: 'Report Generation Fails or Shows No Data',
      problem: 'Reports fail to generate or display "No data found" despite data existing in the system.',
      solution: 'Check date ranges, filters, and permissions to ensure you have access to view the data.',
      category: 'Reports',
      severity: 'medium',
      steps: [
        'Verify date range covers period when data was created',
        'Check all filter criteria - remove filters and try again',
        'Ensure you have permission to view the data (ask admin if unsure)',
        'Try generating a different report to isolate the issue',
        'Refresh data by clicking "Reload" or "Refresh" button',
        'If exporting, try viewing report on-screen first before export',
        'Contact support if specific report continues to fail'
      ],
      causes: [
        'Date range filter excludes all relevant data',
        'Too many restrictive filters applied',
        'User lacks permission to view certain data categories',
        'Data hasn\'t synced yet (recent entries)',
        'Report template has configuration errors',
        'Large dataset causing timeout'
      ],
      prevention: [
        'Start with broad date ranges and filters, then narrow down',
        'Save commonly used filter combinations as presets',
        'Request appropriate permissions from administrator upfront',
        'Allow 5 minutes for recent data to sync before reporting',
        'For large reports, schedule generation during off-peak hours'
      ],
      tags: ['reports', 'no-data', 'filters', 'permissions'],
      views: 2987,
      helpful: 276,
      lastUpdated: '2024-10-17',
      author: 'Sneha Reddy',
      relatedArticles: ['TS-009', 'TS-013']
    },
    {
      id: '5',
      articleId: 'TS-005',
      title: 'File Upload Fails or Hangs',
      problem: 'Uploading files fails with error or progress bar gets stuck.',
      solution: 'Check file size limits, format restrictions, and network stability.',
      category: 'Errors',
      severity: 'medium',
      steps: [
        'Verify file size is under 50MB limit (10MB for images)',
        'Check file format is supported (PDF, XLSX, DOCX, JPG, PNG)',
        'Ensure filename doesn\'t contain special characters (!@#$%)',
        'Try renaming file to simple name (e.g., "document.pdf")',
        'Check internet connection stability',
        'Close and reopen the upload dialog',
        'Try uploading a smaller test file first',
        'If upload hangs, refresh page and try again'
      ],
      causes: [
        'File size exceeds maximum limit (50MB)',
        'Unsupported file format or extension',
        'Filename contains special characters',
        'Network interruption during upload',
        'Browser blocking due to security settings',
        'Corrupted or damaged file',
        'Server storage limit reached'
      ],
      prevention: [
        'Compress large files before uploading',
        'Use standard file formats (PDF, XLSX, DOCX)',
        'Name files using letters, numbers, hyphens, underscores only',
        'Upload files during stable network conditions',
        'Verify file integrity before uploading'
      ],
      tags: ['upload', 'file', 'attachment', 'error'],
      views: 2654,
      helpful: 245,
      lastUpdated: '2024-10-16',
      author: 'Vikram Singh',
      relatedArticles: ['TS-010']
    },
    {
      id: '6',
      articleId: 'TS-006',
      title: 'Email Notifications Not Received',
      problem: 'System email notifications are not arriving in inbox.',
      solution: 'Check spam folder, email filters, and notification settings.',
      category: 'Configuration',
      severity: 'low',
      steps: [
        'Check Spam/Junk folder for system emails',
        'Add noreply@system.com to email safe senders list',
        'Verify notification settings: Profile > Settings > Notifications',
        'Check that correct email address is configured in profile',
        'Look for email filter rules that might be auto-archiving emails',
        'Contact email admin to verify emails aren\'t blocked by corporate filter',
        'Request test notification to verify delivery'
      ],
      causes: [
        'Emails marked as spam by email provider',
        'Email filters auto-archiving or deleting messages',
        'Incorrect email address in user profile',
        'Notifications disabled in user preferences',
        'Corporate email security blocking system emails',
        'Email quota exceeded (full mailbox)'
      ],
      prevention: [
        'Add system email addresses to safe senders list',
        'Review notification preferences quarterly',
        'Keep email address in profile up to date',
        'Monitor spam folder weekly for false positives',
        'Maintain mailbox below quota limit'
      ],
      tags: ['email', 'notifications', 'spam', 'settings'],
      views: 2123,
      helpful: 198,
      lastUpdated: '2024-10-15',
      author: 'Priya Sharma',
      relatedArticles: ['TS-014']
    }
  ])

  useEffect(() => {
    let cancelled = false
    SupportTroubleshootingService.getArticles()
      .then((rows) => {
        if (!cancelled && Array.isArray(rows) && rows.length > 0) {
          setArticles(rows as unknown as TroubleshootingArticle[])
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const categories = ['all', 'Login Issues', 'Performance', 'Errors', 'Configuration', 'Reports', 'Network']
  const severities = ['all', 'low', 'medium', 'high', 'critical']

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter
    const matchesSeverity = severityFilter === 'all' || article.severity === severityFilter
    return matchesSearch && matchesCategory && matchesSeverity
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Login Issues': return <Shield className="h-4 w-4" />
      case 'Performance': return <Zap className="h-4 w-4" />
      case 'Errors': return <XCircle className="h-4 w-4" />
      case 'Configuration': return <Settings className="h-4 w-4" />
      case 'Reports': return <Database className="h-4 w-4" />
      case 'Network': return <Network className="h-4 w-4" />
      default: return <Wrench className="h-4 w-4" />
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedArticle(expandedArticle === id ? null : id)
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Troubleshooting Guides</h1>
          <p className="text-gray-600 mt-1">Step-by-step solutions to common problems</p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700">
          <Plus className="h-4 w-4 inline mr-2" />
          Add Article
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Articles</p>
              <p className="text-2xl font-bold mt-1">{stats.totalArticles}</p>
            </div>
            <Wrench className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Critical</p>
              <p className="text-2xl font-bold mt-1">{stats.critical}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Avg Resolution</p>
              <p className="text-2xl font-bold mt-1">{stats.avgResolutionTime}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-200" />
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
              <p className="text-2xl font-bold mt-1">{stats.categories}</p>
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
            <CheckCircle className="h-8 w-8 text-orange-200" />
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
              placeholder="Search troubleshooting articles..."
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
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {severities.map(sev => (
              <option key={sev} value={sev}>
                {sev === 'all' ? 'All Severities' : sev.charAt(0).toUpperCase() + sev.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-2">
        {filteredArticles.map((article) => (
          <div key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div
              className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleExpand(article.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded ${getSeverityColor(article.severity)}`}>
                      {getCategoryIcon(article.category)}
                    </div>
                    <code className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      {article.articleId}
                    </code>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(article.severity)}`}>
                      {article.severity.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-700 mb-2"><strong>Problem:</strong> {article.problem}</p>
                  <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                    <strong>Quick Solution:</strong> {article.solution}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {article.helpful} helpful
                    </span>
                    <span>By {article.author}</span>
                    <span>Updated: {article.lastUpdated}</span>
                  </div>
                </div>
                <div className="ml-4">
                  {expandedArticle === article.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            {expandedArticle === article.id && (
              <div className="border-t border-gray-200 bg-gray-50 p-3 space-y-3">
                {/* Step-by-Step Solution */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Step-by-Step Solution</h4>
                  </div>
                  <ol className="space-y-2">
                    {article.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-green-200">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-semibold">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-gray-700 pt-0.5">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Root Causes */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <h4 className="font-semibold text-gray-900">Common Causes</h4>
                  </div>
                  <ul className="space-y-2">
                    {article.causes.map((cause, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-white rounded-lg p-3 border border-orange-200">
                        <span className="text-orange-600 mt-0.5">•</span>
                        <p className="text-sm text-gray-700">{cause}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prevention Tips */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Prevention Tips</h4>
                  </div>
                  <ul className="space-y-2">
                    {article.prevention.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-white rounded-lg p-3 border border-blue-200">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{tip}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tags and Related Articles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full border border-purple-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Related Articles</h4>
                    <div className="flex flex-wrap gap-2">
                      {article.relatedArticles.map((relId, idx) => (
                        <button
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200 hover:bg-blue-100 transition-colors font-mono"
                        >
                          {relId}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Feedback */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Was this article helpful?</span>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      Yes
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
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
            <h3 className="text-sm font-semibold text-purple-900 mb-2">Still Need Help?</h3>
            <p className="text-sm text-purple-800 mb-3">
              If you couldn't resolve your issue with these guides, try our FAQs, user guides, or contact support for personalized assistance.
            </p>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors">
                Browse FAQs
              </button>
              <button className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredArticles.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Wrench className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No troubleshooting articles found matching your filters.</p>
        </div>
      )}
    </div>
  )
}
