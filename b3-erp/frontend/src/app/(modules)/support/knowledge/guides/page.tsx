'use client'

import { useState, useEffect } from 'react'
import { SupportGuideService } from '@/services/support.service'
import {
  Search, Plus, BookOpen, Clock, Eye, ThumbsUp, Download,
  Star, Play, FileText, CheckCircle, ArrowRight, Filter,
  Grid, List, BookMarked, Users, Calendar, Tag
} from 'lucide-react'

interface Guide {
  id: string
  guideId: string
  title: string
  description: string
  category: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  readTime: string
  views: number
  helpful: number
  lastUpdated: string
  author: string
  tags: string[]
  sections: number
  featured: boolean
  format: 'Article' | 'Video' | 'Interactive'
  thumbnail?: string
}

export default function Guides() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [stats] = useState({
    totalGuides: 36,
    featured: 8,
    avgReadTime: '18 min',
    avgHelpful: 92,
    categories: 5,
    newThisMonth: 4
  })

  const [guides, setGuides] = useState<Guide[]>([
    {
      id: '1',
      guideId: 'GUIDE-001',
      title: 'Getting Started with the ERP System',
      description: 'A comprehensive introduction to the system covering basic navigation, user interface, dashboard overview, and essential features. Perfect for new users who want to get up and running quickly.',
      category: 'Getting Started',
      difficulty: 'Beginner',
      readTime: '15 min',
      views: 5234,
      helpful: 486,
      lastUpdated: '2024-10-18',
      author: 'Priya Sharma',
      tags: ['basics', 'navigation', 'dashboard', 'introduction'],
      sections: 8,
      featured: true,
      format: 'Article'
    },
    {
      id: '2',
      guideId: 'GUIDE-002',
      title: 'Advanced Reporting and Analytics',
      description: 'Learn how to create custom reports, build dashboards, use advanced filters, and export data for analysis. Includes examples of complex report configurations and best practices.',
      category: 'Advanced Features',
      difficulty: 'Advanced',
      readTime: '35 min',
      views: 3876,
      helpful: 412,
      lastUpdated: '2024-10-20',
      author: 'Rajesh Kumar',
      tags: ['reports', 'analytics', 'dashboards', 'data'],
      sections: 12,
      featured: true,
      format: 'Article'
    },
    {
      id: '3',
      guideId: 'GUIDE-003',
      title: 'Production Planning & Scheduling',
      description: 'Master production planning with step-by-step instructions on creating work orders, managing resources, optimizing schedules, and tracking production progress in real-time.',
      category: 'Best Practices',
      difficulty: 'Intermediate',
      readTime: '28 min',
      views: 2945,
      helpful: 378,
      lastUpdated: '2024-10-17',
      author: 'Amit Patel',
      tags: ['production', 'planning', 'scheduling', 'work-orders'],
      sections: 10,
      featured: true,
      format: 'Article'
    },
    {
      id: '4',
      guideId: 'GUIDE-004',
      title: 'Inventory Management Best Practices',
      description: 'Optimize your inventory operations with proven strategies for stock control, reorder points, warehouse management, and minimizing carrying costs while avoiding stockouts.',
      category: 'Best Practices',
      difficulty: 'Intermediate',
      readTime: '22 min',
      views: 3124,
      helpful: 394,
      lastUpdated: '2024-10-19',
      author: 'Sneha Reddy',
      tags: ['inventory', 'warehouse', 'stock', 'optimization'],
      sections: 9,
      featured: false,
      format: 'Article'
    },
    {
      id: '5',
      guideId: 'GUIDE-005',
      title: 'API Integration Guide',
      description: 'Complete guide to integrating with our REST API including authentication, endpoints, rate limits, webhooks, and sample code in multiple programming languages.',
      category: 'Integration',
      difficulty: 'Advanced',
      readTime: '45 min',
      views: 2156,
      helpful: 287,
      lastUpdated: '2024-10-16',
      author: 'Vikram Singh',
      tags: ['api', 'integration', 'webhooks', 'development'],
      sections: 15,
      featured: true,
      format: 'Article'
    },
    {
      id: '6',
      guideId: 'GUIDE-006',
      title: 'User Roles and Permissions Setup',
      description: 'Learn how to configure user roles, assign permissions, set up approval workflows, and implement security best practices to protect your data.',
      category: 'Administration',
      difficulty: 'Intermediate',
      readTime: '18 min',
      views: 2789,
      helpful: 341,
      lastUpdated: '2024-10-15',
      author: 'Priya Sharma',
      tags: ['security', 'permissions', 'roles', 'admin'],
      sections: 7,
      featured: false,
      format: 'Article'
    },
    {
      id: '7',
      guideId: 'GUIDE-007',
      title: 'Bill of Materials (BOM) Configuration',
      description: 'Step-by-step guide to creating and managing BOMs, including multi-level BOMs, revision control, costing, and linking to production processes.',
      category: 'Best Practices',
      difficulty: 'Intermediate',
      readTime: '25 min',
      views: 2534,
      helpful: 318,
      lastUpdated: '2024-10-14',
      author: 'Rajesh Kumar',
      tags: ['bom', 'production', 'manufacturing', 'costing'],
      sections: 11,
      featured: false,
      format: 'Article'
    },
    {
      id: '8',
      guideId: 'GUIDE-008',
      title: 'Quality Control and Inspection Workflows',
      description: 'Implement effective quality control processes including inspection plans, non-conformance reporting, corrective actions, and continuous improvement tracking.',
      category: 'Best Practices',
      difficulty: 'Intermediate',
      readTime: '20 min',
      views: 1987,
      helpful: 264,
      lastUpdated: '2024-10-12',
      author: 'Sneha Reddy',
      tags: ['quality', 'inspection', 'qc', 'compliance'],
      sections: 8,
      featured: false,
      format: 'Article'
    },
    {
      id: '9',
      guideId: 'GUIDE-009',
      title: 'Mobile App User Guide',
      description: 'Complete walkthrough of the mobile application features including offline mode, barcode scanning, shop floor data entry, and synchronization with the main system.',
      category: 'Getting Started',
      difficulty: 'Beginner',
      readTime: '12 min',
      views: 3421,
      helpful: 398,
      lastUpdated: '2024-10-13',
      author: 'Amit Patel',
      tags: ['mobile', 'app', 'offline', 'barcode'],
      sections: 6,
      featured: true,
      format: 'Video'
    },
    {
      id: '10',
      guideId: 'GUIDE-010',
      title: 'Data Import and Export Procedures',
      description: 'Master data migration with comprehensive instructions on importing data from Excel, CSV, and other systems, plus exporting reports and backing up your data.',
      category: 'Administration',
      difficulty: 'Intermediate',
      readTime: '16 min',
      views: 2876,
      helpful: 352,
      lastUpdated: '2024-10-11',
      author: 'Vikram Singh',
      tags: ['import', 'export', 'data', 'migration'],
      sections: 7,
      featured: false,
      format: 'Article'
    }
  ])

  useEffect(() => {
    let cancelled = false
    SupportGuideService.getGuides()
      .then((rows) => {
        if (!cancelled && Array.isArray(rows) && rows.length > 0) {
          setGuides(rows as unknown as Guide[])
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const categories = ['all', 'Getting Started', 'Advanced Features', 'Best Practices', 'Integration', 'Administration']
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced']

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = categoryFilter === 'all' || guide.category === categoryFilter
    const matchesDifficulty = difficultyFilter === 'all' || guide.difficulty === difficultyFilter
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'Video': return <Play className="h-4 w-4" />
      case 'Interactive': return <CheckCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Guides</h1>
          <p className="text-gray-600 mt-1">Step-by-step instructions and best practices</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'} rounded-l-lg transition-colors`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-600'} rounded-r-lg transition-colors`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700">
            <Plus className="h-4 w-4 inline mr-2" />
            Create Guide
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Guides</p>
              <p className="text-2xl font-bold mt-1">{stats.totalGuides}</p>
            </div>
            <BookOpen className="h-8 w-8 text-purple-200" />
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
              <p className="text-blue-100 text-sm">Avg Read Time</p>
              <p className="text-2xl font-bold mt-1">{stats.avgReadTime}</p>
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
              <p className="text-orange-100 text-sm">New This Month</p>
              <p className="text-2xl font-bold mt-1">{stats.newThisMonth}</p>
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
              placeholder="Search guides..."
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
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {difficulties.map(diff => (
              <option key={diff} value={diff}>
                {diff === 'all' ? 'All Levels' : diff}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Featured Guides */}
      {categoryFilter === 'all' && difficultyFilter === 'all' && !searchQuery && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <h2 className="text-lg font-semibold text-gray-900">Featured Guides</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {guides.filter(g => g.featured).slice(0, 3).map(guide => (
              <div
                key={guide.id}
                className="bg-white rounded-lg p-3 border border-yellow-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(guide.difficulty)}`}>
                    {guide.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {guide.readTime}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{guide.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{guide.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guides Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2' : 'space-y-2'}>
        {filteredGuides.map((guide) => (
          <div
            key={guide.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {viewMode === 'grid' ? (
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {guide.featured && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                    <code className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      {guide.guideId}
                    </code>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    {getFormatIcon(guide.format)}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {guide.title}
                </h3>

                <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                  {guide.description}
                </p>

                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(guide.difficulty)}`}>
                    {guide.difficulty}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200">
                    {guide.category}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {guide.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {guide.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {guide.sections} sections
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {guide.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">By {guide.author}</span>
                  <button className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700">
                    Read Guide
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 flex items-start gap-2">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {guide.featured && (
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        )}
                        <code className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded">
                          {guide.guideId}
                        </code>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(guide.difficulty)}`}>
                          {guide.difficulty}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200">
                          {guide.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{guide.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{guide.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {guide.readTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {guide.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {guide.sections} sections
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {guide.helpful} helpful
                        </span>
                        <span>By {guide.author}</span>
                        <span>Updated: {guide.lastUpdated}</span>
                      </div>
                    </div>
                    <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 whitespace-nowrap ml-4">
                      Read Guide
                      <ArrowRight className="h-4 w-4" />
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
          <BookMarked className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-purple-900 mb-2">Need help with a specific topic?</h3>
            <p className="text-sm text-purple-800 mb-3">
              Can't find the guide you're looking for? Check our FAQs, troubleshooting articles, or request a new guide topic.
            </p>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors">
                Browse FAQs
              </button>
              <button className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors">
                Request Guide
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredGuides.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No guides found matching your filters.</p>
        </div>
      )}
    </div>
  )
}
