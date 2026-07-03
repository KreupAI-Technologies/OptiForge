'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Target, Trophy, TrendingUp, TrendingDown, Users, Package, DollarSign, Calendar, Award, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { salesConfigService } from '@/services/sales-config.service'

interface SalesTarget {
  id: string
  name: string
  type: 'individual' | 'team' | 'category' | 'regional'
  period: string
  target: number
  achieved: number
  progress: number
  status: 'exceeded' | 'on-track' | 'at-risk' | 'behind'
  assignedTo?: string
  category?: string
  region?: string
  startDate: string
  endDate: string
  daysRemaining: number
}

export default function TargetsPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('all')

  const [targets, setTargets] = useState<SalesTarget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const rows = await salesConfigService.getSalesTargets()
        const mapped: SalesTarget[] = (rows || []).map((r) => ({
          id: r.id,
          name: r.name,
          type: (r.type as SalesTarget['type']) || 'team',
          period: r.period || '',
          target: Number(r.target) || 0,
          achieved: Number(r.achieved) || 0,
          progress: Number(r.progress) || 0,
          status: (r.status as SalesTarget['status']) || 'on-track',
          assignedTo: r.assignedTo,
          category: r.category,
          region: r.region,
          startDate: r.startDate || '',
          endDate: r.endDate || '',
          daysRemaining: Number(r.daysRemaining) || 0,
        }))
        if (!cancelled) setTargets(mapped)
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load sales targets')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const targetTypes = ['all', 'individual', 'team', 'category', 'regional']
  const periods = ['all', 'October 2025', 'Q4 2025', 'FY 2025-26']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'on-track':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'behind':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded':
        return <Trophy className="h-4 w-4" />
      case 'on-track':
        return <TrendingUp className="h-4 w-4" />
      case 'at-risk':
        return <AlertCircle className="h-4 w-4" />
      case 'behind':
        return <TrendingDown className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'individual':
        return <Users className="h-4 w-4" />
      case 'team':
        return <Trophy className="h-4 w-4" />
      case 'category':
        return <Package className="h-4 w-4" />
      case 'regional':
        return <Target className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const filteredTargets = targets.filter(target => {
    const matchesType = selectedType === 'all' || target.type === selectedType
    const matchesPeriod = selectedPeriod === 'all' || target.period === selectedPeriod
    return matchesType && matchesPeriod
  })

  const stats = {
    totalTargets: filteredTargets.length,
    exceeded: filteredTargets.filter(t => t.status === 'exceeded').length,
    onTrack: filteredTargets.filter(t => t.status === 'on-track').length,
    atRisk: filteredTargets.filter(t => t.status === 'at-risk').length,
    behind: filteredTargets.filter(t => t.status === 'behind').length,
    avgProgress: filteredTargets.length > 0 ? filteredTargets.reduce((sum, t) => sum + t.progress, 0) / filteredTargets.length : 0
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Inline Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Targets & Goals</h1>
            <p className="text-sm text-gray-600 mt-1">Track and manage sales performance goals</p>
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Target className="h-5 w-5" />
          Set New Target
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Total Targets</p>
              <p className="text-3xl font-bold mt-1">{stats.totalTargets}</p>
            </div>
            <Target className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">Exceeded</p>
              <p className="text-3xl font-bold mt-1">{stats.exceeded}</p>
            </div>
            <Trophy className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-100">On Track</p>
              <p className="text-3xl font-bold mt-1">{stats.onTrack}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-indigo-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-100">At Risk</p>
              <p className="text-3xl font-bold mt-1">{stats.atRisk}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-100">Behind</p>
              <p className="text-3xl font-bold mt-1">{stats.behind}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">Avg Progress</p>
              <p className="text-3xl font-bold mt-1">{stats.avgProgress.toFixed(0)}%</p>
            </div>
            <Award className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {targetTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {periods.map(period => (
                <option key={period} value={period}>
                  {period === 'all' ? 'All Periods' : period}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Targets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredTargets.map((target) => (
          <div key={target.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getTypeIcon(target.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{target.name}</h3>
                      <p className="text-sm text-gray-600">{target.period}</p>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(target.status)}`}>
                  {getStatusIcon(target.status)}
                  {target.status.replace('-', ' ').toUpperCase()}
                </span>
              </div>

              {/* Target vs Achieved */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Target</p>
                  <p className="font-semibold text-gray-900">₹{(target.target / 100000).toFixed(2)}L</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-xs text-green-700 mb-1">Achieved</p>
                  <p className="font-semibold text-green-900">₹{(target.achieved / 100000).toFixed(2)}L</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-bold text-gray-900">{target.progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full ${
                      target.status === 'exceeded' ? 'bg-green-500' :
                      target.status === 'on-track' ? 'bg-blue-500' :
                      target.status === 'at-risk' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(target.progress, 100)}%` }}
                  />
                </div>
              </div>

              {/* Gap Analysis */}
              <div className="mb-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-xs text-orange-700 mb-1">Gap to Target</p>
                <p className="font-semibold text-orange-900">₹{((target.target - target.achieved) / 100000).toFixed(2)}L</p>
                <p className="text-xs text-orange-700 mt-1">
                  Requires ₹{(((target.target - target.achieved) / target.daysRemaining) / 1000).toFixed(0)}K per day
                </p>
              </div>

              {/* Additional Details */}
              {target.assignedTo && (
                <div className="mb-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-purple-600" />
                    <p className="text-xs text-purple-700 font-medium">Assigned To</p>
                  </div>
                  <p className="font-semibold text-purple-900">{target.assignedTo}</p>
                </div>
              )}

              {target.category && (
                <div className="mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Category: <span className="font-medium text-gray-900">{target.category}</span></span>
                </div>
              )}

              {target.region && (
                <div className="mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">Region: <span className="font-medium text-gray-900">{target.region}</span></span>
                </div>
              )}

              {/* Timeline */}
              <div className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <p className="text-xs text-blue-700 font-medium">Timeline</p>
                </div>
                <div className="text-sm space-y-1">
                  <p className="text-gray-700">Period: <span className="font-medium text-gray-900">{new Date(target.startDate).toLocaleDateString('en-IN')} - {new Date(target.endDate).toLocaleDateString('en-IN')}</span></p>
                  <p className={`font-semibold ${target.daysRemaining < 15 ? 'text-red-600' : 'text-blue-900'}`}>
                    {target.daysRemaining} days remaining
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  View Details
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Update Progress
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTargets.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No targets found matching your criteria</p>
        </div>
      )}
    </div>
  )
}
