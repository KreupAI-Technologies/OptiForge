'use client'

import { useState, useEffect } from 'react'
import { Star, TrendingUp, TrendingDown, ThumbsUp, ThumbsDown, MessageSquare, Users, Download, Filter, RefreshCw, AlertCircle } from 'lucide-react'
import { ChartWrapper } from '@/components/ui'
import { supportPagesService } from '@/services/support-pages.service'

interface CSATTrend {
  period: string
  score: number
  responses: number
  nps: number
  promoters: number
  passives: number
  detractors: number
}

interface CategorySatisfaction {
  category: string
  score: number
  responses: number
  positivePercentage: number
  neutralPercentage: number
  negativePercentage: number
  trend: 'up' | 'down' | 'stable'
}

interface FeedbackTheme {
  theme: string
  sentiment: 'positive' | 'negative' | 'neutral'
  count: number
  percentage: number
  examples: string[]
}

interface RatingDistribution {
  rating: number
  count: number
  percentage: number
}

export default function CSATAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [csatTrends, setCsatTrends] = useState<CSATTrend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = await supportPagesService.getOmnichannel()
        // Omnichannel returns conversations; aggregate any CSAT-bearing records by period.
        const mapped: CSATTrend[] = raw
          .filter((r: any) => r?.period || r?.csatScore != null || r?.score != null)
          .map((r: any) => ({
            period: r.period ?? r.month ?? '',
            score: r.score ?? r.csatScore ?? 0,
            responses: r.responses ?? r.responseCount ?? 0,
            nps: r.nps ?? 0,
            promoters: r.promoters ?? 0,
            passives: r.passives ?? 0,
            detractors: r.detractors ?? 0,
          }))
        if (!cancelled) setCsatTrends(mapped)
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load')
          setCsatTrends([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const categorySatisfaction: CategorySatisfaction[] = [
    { category: 'Network Issues', score: 4.6, responses: 145, positivePercentage: 82.8, neutralPercentage: 12.4, negativePercentage: 4.8, trend: 'up' },
    { category: 'Application Support', score: 4.4, responses: 132, positivePercentage: 76.5, neutralPercentage: 18.2, negativePercentage: 5.3, trend: 'stable' },
    { category: 'Hardware Problems', score: 4.1, responses: 98, positivePercentage: 68.4, neutralPercentage: 24.5, negativePercentage: 7.1, trend: 'down' },
    { category: 'Access & Permissions', score: 4.9, responses: 67, positivePercentage: 94.0, neutralPercentage: 4.5, negativePercentage: 1.5, trend: 'up' },
    { category: 'Email Issues', score: 4.5, responses: 45, positivePercentage: 80.0, neutralPercentage: 15.6, negativePercentage: 4.4, trend: 'stable' },
    { category: 'Security Incidents', score: 5.0, responses: 23, positivePercentage: 100, neutralPercentage: 0, negativePercentage: 0, trend: 'stable' }
  ]

  const feedbackThemes: FeedbackTheme[] = [
    {
      theme: 'Fast Response Time',
      sentiment: 'positive',
      count: 187,
      percentage: 64.7,
      examples: ['Quick turnaround', 'Immediate attention', 'Responded within minutes']
    },
    {
      theme: 'Technical Expertise',
      sentiment: 'positive',
      count: 156,
      percentage: 54.0,
      examples: ['Knowledgeable staff', 'Expert guidance', 'Professional handling']
    },
    {
      theme: 'Communication Quality',
      sentiment: 'positive',
      count: 134,
      percentage: 46.4,
      examples: ['Clear explanations', 'Regular updates', 'Easy to understand']
    },
    {
      theme: 'Long Resolution Time',
      sentiment: 'negative',
      count: 34,
      percentage: 11.8,
      examples: ['Took too long', 'Multiple follow-ups needed', 'Delayed resolution']
    },
    {
      theme: 'Multiple Escalations',
      sentiment: 'negative',
      count: 18,
      percentage: 6.2,
      examples: ['Passed between teams', 'Had to escalate', 'Too many handoffs']
    }
  ]

  const ratingDistribution: RatingDistribution[] = [
    { rating: 5, count: 201, percentage: 69.6 },
    { rating: 4, count: 58, percentage: 20.1 },
    { rating: 3, count: 12, percentage: 4.2 },
    { rating: 2, count: 10, percentage: 3.5 },
    { rating: 1, count: 8, percentage: 2.8 }
  ]

  const currentMonth = csatTrends[csatTrends.length - 1]
  const previousMonth = csatTrends[csatTrends.length - 2]

  const stats = [
    {
      label: 'Avg CSAT Score',
      value: currentMonth.score.toFixed(1),
      change: `${currentMonth.score > previousMonth.score ? '+' : ''}${(currentMonth.score - previousMonth.score).toFixed(1)}`,
      trend: currentMonth.score > previousMonth.score ? 'up' : currentMonth.score < previousMonth.score ? 'down' : 'stable',
      icon: Star,
      color: 'yellow'
    },
    {
      label: 'Survey Responses',
      value: currentMonth.responses,
      change: `+${currentMonth.responses - previousMonth.responses}`,
      trend: 'up',
      icon: MessageSquare,
      color: 'blue'
    },
    {
      label: 'Net Promoter Score',
      value: currentMonth.nps,
      change: `${currentMonth.nps > previousMonth.nps ? '+' : ''}${currentMonth.nps - previousMonth.nps}`,
      trend: currentMonth.nps > previousMonth.nps ? 'up' : 'down',
      icon: TrendingUp,
      color: 'green'
    },
    {
      label: 'Promoters',
      value: `${((currentMonth.promoters / currentMonth.responses) * 100).toFixed(1)}%`,
      change: `${currentMonth.promoters} customers`,
      trend: 'up',
      icon: ThumbsUp,
      color: 'green'
    },
    {
      label: 'Detractors',
      value: `${((currentMonth.detractors / currentMonth.responses) * 100).toFixed(1)}%`,
      change: `${currentMonth.detractors} customers`,
      trend: currentMonth.detractors < previousMonth.detractors ? 'down' : 'up',
      icon: ThumbsDown,
      color: 'red'
    },
    {
      label: 'Response Rate',
      value: '55.3%',
      change: '+3.2%',
      trend: 'up',
      icon: Users,
      color: 'purple'
    }
  ]

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-700'
      case 'negative': return 'bg-red-100 text-red-700'
      case 'neutral': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-3 w-3" />
    if (trend === 'down') return <TrendingDown className="h-3 w-3" />
    return <Star className="h-3 w-3" />
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable', label: string) => {
    if (trend === 'stable') return 'text-gray-500'
    // For detractors, down is good
    if (label.includes('Detractors')) {
      return trend === 'down' ? 'text-green-600' : 'text-red-600'
    }
    return trend === 'up' ? 'text-green-600' : 'text-red-600'
  }

  const getStarColor = (index: number, score: number) => {
    return index < Math.floor(score) ? 'text-yellow-400 fill-yellow-400' : 
           index < score ? 'text-yellow-400 fill-yellow-400 opacity-50' : 'text-gray-300'
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Satisfaction Analytics</h1>
          <p className="text-gray-600 mt-1">Track CSAT scores, NPS, and customer feedback</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const colorClasses = {
            yellow: 'bg-yellow-500',
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            red: 'bg-red-500',
            purple: 'bg-purple-500'
          }
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm">{stat.label}</span>
                <div className={`${colorClasses[stat.color as keyof typeof colorClasses]} p-2 rounded-lg`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className={`text-xs mt-1 flex items-center gap-1 ${getTrendColor(stat.trend as 'up' | 'down' | 'stable', stat.label)}`}>
                {getTrendIcon(stat.trend as 'up' | 'down' | 'stable')}
                {stat.change}
              </div>
            </div>
          )
        })}
      </div>

      {/* CSAT and NPS Trends */}
      <ChartWrapper
       
        description="Track customer satisfaction scores and Net Promoter Score over time"
        showRefresh={true}
        showDownload={true}
        onRefresh={() => console.log('Refresh trends')}
        onDownload={() => console.log('Download trends')}
        height="h-96"
      >
        <div className="mb-2 flex justify-end">
          <div className="flex gap-2">
            {(['week', 'month', 'quarter', 'year'] as const).map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-600">CSAT Score (1-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">NPS (-100 to 100)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Survey Responses</span>
            </div>
          </div>

          <div className="space-y-2">
            {csatTrends.map((trend, index) => {
              const maxResponses = Math.max(...csatTrends.map(t => t.responses))
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="font-medium w-16">{trend.period}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-600 font-semibold">★ {trend.score.toFixed(1)}</span>
                      <span className="text-green-600 font-semibold">NPS {trend.nps}</span>
                      <span className="text-gray-500">{trend.responses} responses</span>
                    </div>
                  </div>
                  <div className="flex gap-1 h-6">
                    <div
                      className="bg-yellow-500 rounded relative group"
                      style={{ width: `${(trend.score / 5) * 100}%` }}
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium opacity-0 group-hover:opacity-100">
                        {trend.score.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 h-2">
                    <div className="bg-green-500 rounded" style={{ width: `${((trend.promoters / trend.responses) * 100)}%` }}></div>
                    <div className="bg-yellow-500 rounded" style={{ width: `${((trend.passives / trend.responses) * 100)}%` }}></div>
                    <div className="bg-red-500 rounded" style={{ width: `${((trend.detractors / trend.responses) * 100)}%` }}></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </ChartWrapper>

      {/* Category Satisfaction and Rating Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Category Satisfaction */}
        <ChartWrapper
         
          description="Customer satisfaction scores across support categories"
          showDownload={true}
          onDownload={() => console.log('Download category data')}
          height="h-auto"
        >
          <div className="space-y-3">
            {categorySatisfaction.map((cat, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      {cat.category}
                      <span className={getTrendColor(cat.trend, '')}>
                        {getTrendIcon(cat.trend)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">{cat.responses} responses</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star key={i} className={`h-4 w-4 ${getStarColor(i, cat.score)}`} />
                      ))}
                    </div>
                    <div className="text-lg font-bold text-gray-900">{cat.score.toFixed(1)}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex gap-1">
                    <div className="bg-green-500 h-2 rounded" style={{ width: `${cat.positivePercentage}%` }}></div>
                    <div className="bg-yellow-500 h-2 rounded" style={{ width: `${cat.neutralPercentage}%` }}></div>
                    <div className="bg-red-500 h-2 rounded" style={{ width: `${cat.negativePercentage}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="text-green-600">{cat.positivePercentage.toFixed(1)}% positive</span>
                    <span className="text-red-600">{cat.negativePercentage.toFixed(1)}% negative</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartWrapper>

        {/* Rating Distribution */}
        <ChartWrapper
         
          description="Distribution of customer ratings (1-5 stars)"
          showDownload={true}
          onDownload={() => console.log('Download rating distribution')}
          height="h-auto"
        >
          <div className="space-y-2">
            {ratingDistribution.map((rating, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(rating.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <span className="font-medium text-gray-900">{rating.rating} stars</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">{rating.count}</span>
                    <span className="text-gray-500 ml-1">({rating.percentage}%)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        rating.rating >= 4 ? 'bg-green-600' :
                        rating.rating === 3 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${rating.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartWrapper>
      </div>

      {/* Feedback Themes */}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Common Feedback Themes</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {feedbackThemes.map((theme, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-3 py-1 rounded text-xs font-medium ${getSentimentColor(theme.sentiment)}`}>
                      {theme.sentiment}
                    </span>
                    <span className="font-semibold text-gray-900">{theme.theme}</span>
                  </div>
                  <div className="text-sm text-gray-600">{theme.count} mentions ({theme.percentage}%)</div>
                </div>
              </div>
              <div className="space-y-1">
                {theme.examples.map((example, idx) => (
                  <div key={idx} className="text-xs text-gray-600 italic flex items-start gap-1">
                    <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    "{example}"
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Customer Satisfaction Insights
        </h3>
        <ul className="space-y-2 text-sm text-green-800">
          <li className="flex items-start gap-2">
            <Star className="h-4 w-4 mt-0.5 flex-shrink-0 text-yellow-600" />
            <span><strong>Excellent Performance:</strong> CSAT score of {currentMonth.score.toFixed(1)}/5.0 with {currentMonth.responses} responses - highest this year!</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Strong NPS:</strong> Net Promoter Score of {currentMonth.nps} indicates strong customer loyalty ({((currentMonth.promoters / currentMonth.responses) * 100).toFixed(1)}% promoters).</span>
          </li>
          <li className="flex items-start gap-2">
            <ThumbsUp className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Top Categories:</strong> Security Incidents (5.0) and Access & Permissions (4.9) leading satisfaction scores.</span>
          </li>
          <li className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span><strong>Positive Themes:</strong> Fast Response Time (64.7%) and Technical Expertise (54.0%) most frequently mentioned positive attributes.</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-orange-600" />
            <span><strong>Improvement Area:</strong> Hardware Problems category (4.1) and Long Resolution Time feedback (11.8%) indicate optimization opportunities.</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
