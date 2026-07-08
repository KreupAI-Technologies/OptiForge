'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Download, Plus, X, Calendar, Filter } from 'lucide-react'
import {
  estimationCategoryService,
  EstimationCategory,
} from '@/services/estimation-category.service'

export default function CustomReportPage() {
  const router = useRouter()

  const [reportName, setReportName] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [dateRange, setDateRange] = useState('last-30-days')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [groupBy, setGroupBy] = useState<string[]>([])
  const [outputFormat, setOutputFormat] = useState('pdf')
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeRawData, setIncludeRawData] = useState(false)

  // Live category options drive the "Kitchen Category" filter. Analytics has no
  // base GET, so we source the one data-backed filter list from the categories
  // endpoint and fall back to defaults when none exist.
  const [categoryOptions, setCategoryOptions] = useState<string[]>([
    'Modular', 'L-Shape', 'U-Shape', 'Parallel', 'Island',
  ])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoadError(null)
      try {
        const cats = await estimationCategoryService.getCategories()
        const names = cats
          .map((c: EstimationCategory) => c.name)
          .filter((n): n is string => Boolean(n))
        if (!cancelled && names.length > 0) setCategoryOptions(names)
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : 'Failed to load categories',
          )
        }
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const availableMetrics = [
    { id: 'total-estimates', name: 'Total Estimates', category: 'Volume' },
    { id: 'win-rate', name: 'Win Rate', category: 'Performance' },
    { id: 'avg-value', name: 'Average Estimate Value', category: 'Financial' },
    { id: 'total-value', name: 'Total Estimate Value', category: 'Financial' },
    { id: 'conversion-rate', name: 'Conversion Rate', category: 'Performance' },
    { id: 'turnaround-time', name: 'Average Turnaround Time', category: 'Performance' },
    { id: 'accuracy', name: 'Estimation Accuracy', category: 'Quality' },
    { id: 'rejection-rate', name: 'Rejection Rate', category: 'Quality' },
    { id: 'customer-satisfaction', name: 'Customer Satisfaction', category: 'Quality' },
    { id: 'estimator-productivity', name: 'Estimator Productivity', category: 'Team' },
    { id: 'category-distribution', name: 'Category Distribution', category: 'Analysis' },
    { id: 'pricing-trends', name: 'Pricing Trends', category: 'Analysis' }
  ]

  const availableFilters = [
    { id: 'category', name: 'Kitchen Category', options: categoryOptions },
    { id: 'status', name: 'Status', options: ['Draft', 'Pending', 'Approved', 'Rejected', 'Converted'] },
    { id: 'value-range', name: 'Value Range', options: ['<50K', '50K-1L', '1L-2L', '2L-5L', '>5L'] },
    { id: 'estimator', name: 'Estimator', options: ['All', 'Rajesh Kumar', 'Priya Sharma', 'Amit Patel'] },
    { id: 'customer-type', name: 'Customer Type', options: ['Residential', 'Commercial', 'Builder'] }
  ]

  const groupByOptions = [
    'Date',
    'Week',
    'Month',
    'Quarter',
    'Kitchen Category',
    'Estimator',
    'Customer Type',
    'Status'
  ]

  const handleBack = () => {
    router.push('/estimation/analytics/reports')
  }

  const toggleMetric = (metricId: string) => {
    if (selectedMetrics.includes(metricId)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== metricId))
    } else {
      setSelectedMetrics([...selectedMetrics, metricId])
    }
  }

  const toggleFilter = (filterId: string) => {
    if (selectedFilters.includes(filterId)) {
      setSelectedFilters(selectedFilters.filter(f => f !== filterId))
    } else {
      setSelectedFilters([...selectedFilters, filterId])
    }
  }

  const toggleGroupBy = (option: string) => {
    if (groupBy.includes(option)) {
      setGroupBy(groupBy.filter(g => g !== option))
    } else {
      setGroupBy([...groupBy, option])
    }
  }

  const handleGenerate = () => {
    setGenerateError(null)
    if (!reportName.trim()) {
      setGenerateError('Please enter a report name')
      return
    }
    if (selectedMetrics.length === 0) {
      setGenerateError('Please select at least one metric')
      return
    }
    if (dateRange === 'custom' && (!customStartDate || !customEndDate)) {
      setGenerateError('Please select a custom date range')
      return
    }

    // Ad-hoc custom report generation has no backend endpoint yet
    // (estimation/report-schedules only supports scheduled CRUD, and
    // estimation analytics exposes no report-render endpoint). Surface an
    // honest message instead of faking success. See NEEDS BACKEND note.
    setGenerateError(
      'Custom report generation is not yet available — the reporting backend endpoint has not been implemented. To automate delivery of a report, use "Schedule Report" instead.',
    )
  }

  const metricsByCategory = availableMetrics.reduce((acc, metric) => {
    if (!acc[metric.category]) {
      acc[metric.category] = []
    }
    acc[metric.category].push(metric)
    return acc
  }, {} as Record<string, typeof availableMetrics>)

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="flex-none bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Generate Custom Report</h1>
              <p className="text-sm text-gray-500 mt-1">Select metrics, filters, and parameters for your custom report</p>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        {loadError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}
        {generateError && (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {generateError}
          </div>
        )}
        <div className="grid grid-cols-3 gap-3">
          {/* Left Column - Configuration */}
          <div className="col-span-2 space-y-3">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Report Information
              </h2>

              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="e.g., Q4 2025 Performance Analysis"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    rows={2}
                    placeholder="Brief description of what this report covers"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Date Range
              </h2>

              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Period
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="last-7-days">Last 7 Days</option>
                    <option value="last-30-days">Last 30 Days</option>
                    <option value="last-90-days">Last 90 Days</option>
                    <option value="this-month">This Month</option>
                    <option value="last-month">Last Month</option>
                    <option value="this-quarter">This Quarter</option>
                    <option value="last-quarter">Last Quarter</option>
                    <option value="this-year">This Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {dateRange === 'custom' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metrics Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Select Metrics <span className="text-red-500">*</span>
              </h2>

              <div className="space-y-2">
                {Object.entries(metricsByCategory).map(([category, metrics]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">{category}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {metrics.map((metric) => (
                        <label
                          key={metric.id}
                          className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedMetrics.includes(metric.id)
                              ? 'bg-blue-50 border-blue-300'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedMetrics.includes(metric.id)}
                            onChange={() => toggleMetric(metric.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-900">{metric.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Filter className="w-5 h-5 text-purple-600" />
                Apply Filters
              </h2>

              <div className="space-y-3">
                {availableFilters.map((filter) => (
                  <label
                    key={filter.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedFilters.includes(filter.id)
                        ? 'bg-purple-50 border-purple-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(filter.id)}
                      onChange={() => toggleFilter(filter.id)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">{filter.name}</span>
                      <p className="text-xs text-gray-500 mt-1">
                        Options: {filter.options.join(', ')}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Group By */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Group Results By
              </h2>

              <div className="flex flex-wrap gap-2">
                {groupByOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleGroupBy(option)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      groupBy.includes(option)
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Preview & Options */}
          <div className="space-y-3">
            <div className="bg-white rounded-lg border border-gray-200 p-3 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Output Options</h3>

              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="powerpoint">PowerPoint</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeCharts}
                      onChange={(e) => setIncludeCharts(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Include Charts & Visualizations</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={includeRawData}
                      onChange={(e) => setIncludeRawData(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Include Raw Data Tables</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Report Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Metrics Selected:</span>
                    <span className="font-medium text-gray-900">{selectedMetrics.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Filters Applied:</span>
                    <span className="font-medium text-gray-900">{selectedFilters.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Group By:</span>
                    <span className="font-medium text-gray-900">{groupBy.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Output Format:</span>
                    <span className="font-medium text-gray-900">{outputFormat.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {selectedMetrics.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Selected Metrics</h4>
                  <div className="space-y-1">
                    {selectedMetrics.map((metricId) => {
                      const metric = availableMetrics.find(m => m.id === metricId)
                      return (
                        <div key={metricId} className="text-xs text-gray-600 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          {metric?.name}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pb-6">
          <button
            onClick={handleBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>
    </div>
  )
}
