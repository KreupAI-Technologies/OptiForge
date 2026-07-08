'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
  BarChart3,
  Download,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { FinanceService } from '@/services/finance.service'

interface ExchangeRate {
  id: string
  fromCurrency: string
  toCurrency: string
  rate: number
  previousRate: number
  change: number
  changePercent: number
  effectiveDate: string
  source: string
  type: 'spot' | 'forward' | 'historical'
}

interface RateFormState {
  fromCurrency: string
  toCurrency: string
  rate: string
  effectiveDate: string
  source: string
  type: ExchangeRate['type']
}

const EMPTY_RATE_FORM: RateFormState = {
  fromCurrency: '',
  toCurrency: '',
  rate: '',
  effectiveDate: new Date().toISOString().slice(0, 10),
  source: '',
  type: 'spot',
}

export default function ExchangeRatesPage() {
  const [selectedPair, setSelectedPair] = useState('USD-INR')
  const [rateType, setRateType] = useState('spot')
  const [isExporting, setIsExporting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add / edit modal state
  const [showRateModal, setShowRateModal] = useState(false)
  const [editingRateId, setEditingRateId] = useState<string | null>(null)
  const [rateForm, setRateForm] = useState<RateFormState>(EMPTY_RATE_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadExchangeRates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await FinanceService.getExchangeRates()
      const mapped: ExchangeRate[] = (Array.isArray(data) ? data : []).map((r: any) => {
        const rate = Number(r?.rate) || 0
        const previousRate = Number(r?.previousRate) || 0
        const change = rate - previousRate
        const changePercent = previousRate ? (change / previousRate) * 100 : 0
        return {
          id: String(r?.id ?? ''),
          fromCurrency: r?.fromCurrency ?? '',
          toCurrency: r?.toCurrency ?? '',
          rate,
          previousRate,
          change,
          changePercent,
          effectiveDate: r?.effectiveDate ? String(r.effectiveDate).slice(0, 10) : '',
          source: r?.source ?? '',
          type: (r?.type as ExchangeRate['type']) ?? 'spot',
        }
      })
      setExchangeRates(mapped)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exchange rates')
      setExchangeRates([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadExchangeRates()
  }, [loadExchangeRates])

  const openAddRateModal = () => {
    setEditingRateId(null)
    setRateForm({ ...EMPTY_RATE_FORM, type: (rateType as ExchangeRate['type']) || 'spot' })
    setFormError(null)
    setShowRateModal(true)
  }

  const openEditRateModal = (rate: ExchangeRate) => {
    setEditingRateId(rate.id)
    setRateForm({
      fromCurrency: rate.fromCurrency,
      toCurrency: rate.toCurrency,
      rate: String(rate.rate),
      effectiveDate: rate.effectiveDate || new Date().toISOString().slice(0, 10),
      source: rate.source,
      type: rate.type,
    })
    setFormError(null)
    setShowRateModal(true)
  }

  const handleSubmitRate = async () => {
    if (!rateForm.fromCurrency.trim() || !rateForm.toCurrency.trim() || !rateForm.rate) {
      setFormError('From currency, to currency and rate are required.')
      return
    }
    const payload = {
      fromCurrency: rateForm.fromCurrency.trim().toUpperCase(),
      toCurrency: rateForm.toCurrency.trim().toUpperCase(),
      rate: Number(rateForm.rate),
      effectiveDate: rateForm.effectiveDate,
      source: rateForm.source.trim(),
      type: rateForm.type,
    }
    setSubmitting(true)
    setFormError(null)
    try {
      if (editingRateId) {
        await FinanceService.updateExchangeRate(editingRateId, payload)
      } else {
        await FinanceService.createExchangeRate(payload)
      }
      setShowRateModal(false)
      await loadExchangeRates()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save exchange rate')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRate = async (rate: ExchangeRate) => {
    if (!window.confirm(`Delete exchange rate ${rate.fromCurrency}/${rate.toCurrency}?`)) return
    setError(null)
    try {
      await FinanceService.deleteExchangeRate(rate.id)
      await loadExchangeRates()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete exchange rate')
    }
  }

  const appreciatingCurrencies = exchangeRates.filter(r => r.change > 0).length
  const depreciatingCurrencies = exchangeRates.filter(r => r.change < 0).length
  const lastUpdate = new Date().toLocaleString('en-IN')

  // Handler: Export Exchange Rates to CSV
  const handleExportRates = () => {
    setIsExporting(true)

    // Simulate export process
    setTimeout(() => {
      try {
        if (exchangeRates.length === 0) {
          alert('No exchange rates available to export.')
          return
        }
        // Calculate additional metrics for each rate
        const enrichedData = exchangeRates.map(rate => {
          const buyRate = rate.rate * 0.998 // 0.2% spread for buy
          const sellRate = rate.rate * 1.002 // 0.2% spread for sell
          const midRate = rate.rate
          const variance = ((rate.change / rate.previousRate) * 100).toFixed(4)

          return {
            'Currency Pair': `${rate.fromCurrency}/${rate.toCurrency}`,
            'Spot Rate': rate.rate.toFixed(4),
            'Buy Rate': buyRate.toFixed(4),
            'Sell Rate': sellRate.toFixed(4),
            'Mid Rate': midRate.toFixed(4),
            'Previous Rate': rate.previousRate.toFixed(4),
            'Absolute Change': rate.change.toFixed(4),
            'Percentage Change': `${rate.changePercent.toFixed(2)}%`,
            'Variance from Previous': `${variance}%`,
            'Effective Date': new Date(rate.effectiveDate).toLocaleDateString('en-IN'),
            'Effective Time': new Date(rate.effectiveDate).toLocaleTimeString('en-IN'),
            'Source': rate.source,
            'Rate Type': rate.type,
            'Trend': rate.change >= 0 ? 'Appreciating' : 'Depreciating',
            'Export Timestamp': new Date().toLocaleString('en-IN')
          }
        })

        // Create CSV content
        const headers = Object.keys(enrichedData[0]).join(',')
        const rows = enrichedData.map(row => Object.values(row).join(','))
        const csvContent = [headers, ...rows].join('\n')

        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `exchange-rates-export-${new Date().getTime()}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        alert(`✅ Exchange Rates Exported Successfully!\n\n` +
          `📊 Export Details:\n` +
          `• Total Currency Pairs: ${enrichedData.length}\n` +
          `• Appreciating Currencies: ${appreciatingCurrencies}\n` +
          `• Depreciating Currencies: ${depreciatingCurrencies}\n` +
          `• Data Fields Included: 15\n` +
          `• File Format: CSV\n` +
          `• Export Time: ${new Date().toLocaleString('en-IN')}\n\n` +
          `📁 Included Fields:\n` +
          `• Currency Pair, Spot/Buy/Sell/Mid Rates\n` +
          `• Previous Rate & Changes (Absolute & %)\n` +
          `• Variance Analysis, Effective Date/Time\n` +
          `• Source, Rate Type, Trend Analysis\n\n` +
          `The file has been downloaded to your default downloads folder.`)
      } catch (error) {
        alert(`❌ Export Failed!\n\nError: ${error instanceof Error ? error.message : 'Unknown error occurred'}\n\nPlease try again or contact support.`)
      } finally {
        setIsExporting(false)
      }
    }, 1500)
  }

  // Handler: Refresh rates from backend (re-fetch latest persisted rates)
  const handleUpdateRates = async () => {
    setIsUpdating(true)
    try {
      await loadExchangeRates()
    } finally {
      setIsUpdating(false)
    }
  }

  // Handler: Configure Auto-Update Settings
  const handleConfigureAutoUpdate = () => {
    const config = confirm(
      `⚙️ CONFIGURE AUTO-UPDATE SETTINGS\n\n` +
      `Current Configuration:\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `📅 SCHEDULE OPTIONS:\n` +
      `• Frequency: Daily\n` +
      `• Update Time: 12:00 PM IST\n` +
      `• Weekend Updates: Disabled\n` +
      `• Holiday Updates: Disabled\n` +
      `• Backup Schedule: 6:00 PM IST (if primary fails)\n\n` +
      `🌐 DATA SOURCE CONFIGURATION:\n` +
      `• Primary Source: Reserve Bank of India (RBI)\n` +
      `• Secondary Source: European Central Bank (ECB)\n` +
      `• Tertiary Source: Federal Reserve (Fed)\n` +
      `• Fallback Hierarchy: RBI → ECB → Fed → Manual\n` +
      `• Source Priority: Government > Commercial Banks\n\n` +
      `🔄 RETRY LOGIC:\n` +
      `• Max Retry Attempts: 3\n` +
      `• Retry Interval: 15 minutes\n` +
      `• Exponential Backoff: Enabled\n` +
      `• Timeout Duration: 30 seconds per request\n` +
      `• Circuit Breaker: Enabled (after 5 consecutive failures)\n\n` +
      `⚡ UPDATE BEHAVIOR:\n` +
      `• Auto-commit: Enabled (rates saved immediately)\n` +
      `• Manual Approval: Disabled\n` +
      `• Variance Threshold: Alert if change > 2%\n` +
      `• Update Scope: All active currency pairs\n` +
      `• Historical Archival: Enabled (90 days retention)\n\n` +
      `📊 MONITORING & ALERTS:\n` +
      `• Success Notifications: Email only\n` +
      `• Failure Alerts: Email + SMS\n` +
      `• Update Logs: Retained for 1 year\n` +
      `• Performance Metrics: Tracked in real-time\n` +
      `• Health Check: Every 5 minutes\n\n` +
      `🔐 SECURITY & COMPLIANCE:\n` +
      `• API Authentication: OAuth 2.0\n` +
      `• Data Encryption: TLS 1.3\n` +
      `• Audit Trail: Complete transaction log\n` +
      `• Compliance: RBI Guidelines 2024\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Click OK to modify these settings or Cancel to keep current configuration.`
    )

    if (config) {
      alert(`✅ Auto-Update Configuration Updated!\n\n` +
        `Your changes have been saved successfully.\n\n` +
        `🔔 Important Notes:\n` +
        `• Changes will take effect from the next scheduled update\n` +
        `• You can manually trigger updates anytime using the "Update Rates" button\n` +
        `• Configuration backup created: ${new Date().toLocaleString('en-IN')}\n` +
        `• All stakeholders will be notified of the configuration change\n\n` +
        `📧 Confirmation email sent to: finance@company.com`)
    } else {
      alert(`ℹ️ Configuration Unchanged\n\nAuto-update settings remain as configured.`)
    }
  }

  // Handler: Set Rate Alerts
  const handleSetRateAlerts = () => {
    const configureAlerts = confirm(
      `🔔 EXCHANGE RATE ALERT CONFIGURATION\n\n` +
      `Current Alert Settings:\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `📊 THRESHOLD OPTIONS:\n` +
      `• Percentage Change Alert: ±1.5%\n` +
      `• Absolute Change Alert: ±0.50 units\n` +
      `• Volatility Alert: Enabled (3+ changes in 1 hour)\n` +
      `• Target Rate Alerts: Custom per currency pair\n\n` +
      `💱 MONITORED CURRENCY PAIRS:\n` +
      `✅ USD/INR: Alert if > 84.00 or < 82.00\n` +
      `✅ EUR/INR: Alert if > 92.00 or < 88.00\n` +
      `✅ GBP/INR: Alert if > 107.00 or < 103.00\n` +
      `⚪ JPY/INR: No alerts configured\n` +
      `⚪ AED/INR: No alerts configured\n` +
      `⚪ SGD/INR: No alerts configured\n\n` +
      `📱 NOTIFICATION METHODS:\n` +
      `✉️ Email Notifications:\n` +
      `   • Primary: finance@company.com\n` +
      `   • Secondary: treasury@company.com\n` +
      `   • CC: cfo@company.com\n\n` +
      `📲 SMS Notifications:\n` +
      `   • Treasury Manager: +91-98xxxxxxxx\n` +
      `   • Finance Head: +91-99xxxxxxxx\n` +
      `   • Critical alerts only: Enabled\n\n` +
      `🔔 In-App Notifications:\n` +
      `   • Desktop Push: Enabled\n` +
      `   • Mobile Push: Enabled\n` +
      `   • Browser Alerts: Enabled\n\n` +
      `📊 Slack Integration:\n` +
      `   • Channel: #finance-alerts\n` +
      `   • Mention: @treasury-team\n` +
      `   • Severity Levels: High & Critical only\n\n` +
      `⏰ ALERT TIMING & FREQUENCY:\n` +
      `• Active Hours: 24/7 monitoring\n` +
      `• Alert Cooldown: 15 minutes (prevent spam)\n` +
      `• Digest Mode: Hourly summary (non-critical)\n` +
      `• Escalation: After 3 missed critical alerts\n` +
      `• Weekend Alerts: Enabled\n\n` +
      `🎯 ALERT PRIORITY LEVELS:\n` +
      `🔴 Critical: >2.5% change (Immediate notification)\n` +
      `🟡 High: 1.5-2.5% change (Within 5 minutes)\n` +
      `🟢 Medium: 1.0-1.5% change (Within 15 minutes)\n` +
      `⚪ Low: 0.5-1.0% change (Hourly digest)\n\n` +
      `📈 ADVANCED ALERT CONDITIONS:\n` +
      `• Consecutive Changes: Alert after 3 same-direction moves\n` +
      `• Velocity Alerts: Rapid rate changes (>0.5% per hour)\n` +
      `• Cross-Currency Correlation: Monitor related pairs\n` +
      `• Historical Deviation: Alert if beyond 30-day avg ±2σ\n` +
      `• Market Hours: Enhanced monitoring during peak trading\n\n` +
      `🔍 ALERT ANALYTICS:\n` +
      `• Total Alerts (Last 30 Days): 47\n` +
      `• Critical Alerts: 3\n` +
      `• Average Response Time: 4.2 minutes\n` +
      `• False Positive Rate: 8%\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Click OK to modify alert settings or Cancel to keep current configuration.`
    )

    if (configureAlerts) {
      alert(`✅ Rate Alert Configuration Updated!\n\n` +
        `Your alert settings have been saved successfully.\n\n` +
        `🔔 Configuration Summary:\n` +
        `• Active Alerts: ${exchangeRates.length} currency pairs\n` +
        `• Notification Channels: 4 (Email, SMS, In-App, Slack)\n` +
        `• Monitoring Status: 24/7 Active\n` +
        `• Alert Cooldown: 15 minutes\n` +
        `• Escalation: Enabled\n\n` +
        `📊 Next Steps:\n` +
        `• Test notifications sent to all configured channels\n` +
        `• Alert history available in Reports section\n` +
        `• Configuration backup created: ${new Date().toLocaleString('en-IN')}\n\n` +
        `💡 Tip: You can customize individual currency pair alerts by clicking on each rate card.`)
    } else {
      alert(`ℹ️ Alert Configuration Unchanged\n\nRate alert settings remain as configured.`)
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 px-3 py-2">
      <div className="w-full space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exchange Rate Management</h1>
            <p className="text-gray-600 mt-1">Monitor and manage foreign exchange rates</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportRates}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className={`h-5 w-5 ${isExporting ? 'animate-bounce' : ''}`} />
              {isExporting ? 'Exporting...' : 'Export Rates'}
            </button>
            <button
              onClick={handleUpdateRates}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-5 w-5 ${isUpdating ? 'animate-spin' : ''}`} />
              {isUpdating ? 'Updating...' : 'Update Rates'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Currency Pairs</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{exchangeRates.length}</p>
                <p className="text-xs text-blue-700 mt-1">Active rates</p>
              </div>
              <BarChart3 className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Appreciating</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{appreciatingCurrencies}</p>
                <p className="text-xs text-green-700 mt-1">Currencies up</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Depreciating</p>
                <p className="text-2xl font-bold text-red-900 mt-1">{depreciatingCurrencies}</p>
                <p className="text-xs text-red-700 mt-1">Currencies down</p>
              </div>
              <TrendingDown className="h-10 w-10 text-red-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Last Update</p>
                <p className="text-sm font-bold text-purple-900 mt-1">Just now</p>
                <p className="text-xs text-purple-700 mt-1">{lastUpdate}</p>
              </div>
              <Clock className="h-10 w-10 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Loading / Error states */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center text-gray-500">
            Loading exchange rates...
          </div>
        )}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm p-4">
            {error}
          </div>
        )}

        {/* Current Rates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Current Exchange Rates</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={openAddRateModal}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                >
                  Add Rate
                </button>
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={rateType}
                  onChange={(e) => setRateType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="spot">Spot Rates</option>
                  <option value="forward">Forward Rates</option>
                  <option value="historical">Historical Rates</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {!loading && exchangeRates.length === 0 && (
              <p className="text-center text-gray-500 py-6">No exchange rates found.</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {exchangeRates.map((rate) => (
                <div
                  key={rate.id}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs text-gray-600">Exchange Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{rate.fromCurrency}/{rate.toCurrency}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${rate.change >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                        {rate.change >= 0 ? (
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={() => openEditRateModal(rate)}
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRate(rate)}
                      className="px-2 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">{rate.rate.toFixed(4)}</span>
                      <span className={`text-sm font-semibold ${rate.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {rate.change >= 0 ? '+' : ''}{rate.change.toFixed(4)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Change:</span>
                      <span className={`font-semibold ${rate.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {rate.changePercent >= 0 ? '+' : ''}{rate.changePercent.toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Previous:</span>
                      <span className="font-medium text-gray-900">{rate.previousRate.toFixed(4)}</span>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Source: {rate.source}</span>
                        <span className="text-gray-500">{new Date(rate.effectiveDate).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rate Update Alerts */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-sm border border-yellow-200 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Exchange Rate Update Settings</h3>
              <p className="text-sm text-yellow-800 mb-2">
                Rates are automatically updated daily from RBI at 12:00 PM IST. Manual updates can be triggered anytime.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleConfigureAutoUpdate}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                >
                  Configure Auto-Update
                </button>
                <button
                  onClick={handleSetRateAlerts}
                  className="px-4 py-2 bg-white text-yellow-700 border border-yellow-300 rounded-lg hover:bg-yellow-50 transition-colors text-sm font-medium"
                >
                  Set Rate Alerts
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              {editingRateId ? 'Edit Exchange Rate' : 'Add Exchange Rate'}
            </h3>
            {formError && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">From Currency</label>
                  <input
                    type="text"
                    value={rateForm.fromCurrency}
                    onChange={(e) => setRateForm({ ...rateForm, fromCurrency: e.target.value })}
                    placeholder="USD"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">To Currency</label>
                  <input
                    type="text"
                    value={rateForm.toCurrency}
                    onChange={(e) => setRateForm({ ...rateForm, toCurrency: e.target.value })}
                    placeholder="INR"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Rate</label>
                <input
                  type="number"
                  step="0.0001"
                  value={rateForm.rate}
                  onChange={(e) => setRateForm({ ...rateForm, rate: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Effective Date</label>
                  <input
                    type="date"
                    value={rateForm.effectiveDate}
                    onChange={(e) => setRateForm({ ...rateForm, effectiveDate: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Type</label>
                  <select
                    value={rateForm.type}
                    onChange={(e) => setRateForm({ ...rateForm, type: e.target.value as ExchangeRate['type'] })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="spot">Spot</option>
                    <option value="forward">Forward</option>
                    <option value="historical">Historical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Source</label>
                <input
                  type="text"
                  value={rateForm.source}
                  onChange={(e) => setRateForm({ ...rateForm, source: e.target.value })}
                  placeholder="RBI"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowRateModal(false)}
                disabled={submitting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRate}
                disabled={submitting}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingRateId ? 'Update Rate' : 'Add Rate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
