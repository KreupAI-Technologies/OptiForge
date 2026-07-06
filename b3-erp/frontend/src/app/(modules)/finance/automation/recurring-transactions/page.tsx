'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Calendar, CheckCircle, Clock, FileText, DollarSign, TrendingUp } from 'lucide-react'
import { FinanceService } from '@/services/finance.service'

interface RecurringTransaction {
  id: string
  templateName: string
  transactionType: 'journal_entry' | 'invoice' | 'payment' | 'accrual'
  description: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  amount: number
  startDate: string
  endDate: string
  nextOccurrence: string
  lastPosted: string
  totalOccurrences: number
  completedOccurrences: number
  status: 'active' | 'paused' | 'completed' | 'expired'
  autoPost: boolean
  accountsAffected: string[]
}

const TYPE_MAP: Record<string, RecurringTransaction['transactionType']> = {
  journal_entry: 'journal_entry',
  journal: 'journal_entry',
  invoice: 'invoice',
  payment: 'payment',
  accrual: 'accrual',
}

const FREQ_MAP: Record<string, RecurringTransaction['frequency']> = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  quarterly: 'quarterly',
  yearly: 'yearly',
  annually: 'yearly',
}

export default function RecurringTransactionsPage() {
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await FinanceService.getRecurringTransactions()
      const mapped: RecurringTransaction[] = (data || []).map((t: any) => {
        const type = String(t.type ?? '').toLowerCase()
        const freq = String(t.frequency ?? '').toLowerCase()
        const status = String(t.status ?? 'active').toLowerCase()
        return {
          id: String(t.id),
          templateName: t.name ?? 'Recurring Transaction',
          transactionType: TYPE_MAP[type] ?? 'journal_entry',
          description: t.description ?? '',
          frequency: FREQ_MAP[freq] ?? 'monthly',
          amount: Number(t.amount ?? 0),
          startDate: t.nextRunDate ?? '',
          endDate: t.endDate ?? '',
          nextOccurrence: t.nextRunDate ?? '',
          lastPosted: t.nextRunDate ?? '',
          totalOccurrences: Number(t.occurrencesGenerated ?? 0),
          completedOccurrences: Number(t.occurrencesGenerated ?? 0),
          status: (['active', 'paused', 'completed', 'expired'].includes(status)
            ? status
            : 'active') as RecurringTransaction['status'],
          autoPost: true,
          accountsAffected: [t.accountName, t.partyName].filter(Boolean) as string[],
        }
      })
      setTransactions(mapped)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load recurring transactions')
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  const handleCreate = async (data: any) => {
    try {
      await FinanceService.createRecurringTransaction(data)
      await loadTransactions()
    } catch (e) {
      console.error('Failed to create recurring transaction', e)
    }
  }

  const handleUpdate = async (id: string, data: any) => {
    try {
      await FinanceService.updateRecurringTransaction(id, data)
      await loadTransactions()
    } catch (e) {
      console.error('Failed to update recurring transaction', e)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await FinanceService.deleteRecurringTransaction(id)
      await loadTransactions()
    } catch (e) {
      console.error('Failed to delete recurring transaction', e)
    }
  }

  const stats = {
    totalRecurring: transactions.length,
    activeRecurring: transactions.filter((t) => t.status === 'active').length,
    pausedRecurring: transactions.filter((t) => t.status === 'paused').length,
    completedRecurring: transactions.filter((t) => t.status === 'completed').length,
    totalMonthlyValue: transactions
      .filter((t) => t.frequency === 'monthly')
      .reduce((sum, t) => sum + t.amount, 0),
    upcomingThisWeek: 0,
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'journal_entry': return 'bg-blue-100 text-blue-700'
      case 'invoice': return 'bg-purple-100 text-purple-700'
      case 'payment': return 'bg-green-100 text-green-700'
      case 'accrual': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getFrequencyBadge = (frequency: string) => {
    const badges = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly'
    }
    return badges[frequency as keyof typeof badges] || frequency
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 px-3 py-2">
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recurring Transactions</h1>
            <p className="text-gray-600 mt-1">Automated recurring journal entries and payments</p>
          </div>
          <button
            onClick={() => handleCreate({ companyId: 'default-company-id', name: 'New Recurring Transaction', frequency: 'monthly', amount: 0 })}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700"
          >
            <RefreshCw className="h-5 w-5" />
            New Template
          </button>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading recurring transactions…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw className="h-6 w-6 text-emerald-600" />
              <span className="text-sm text-gray-600">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalRecurring}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.activeRecurring}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-6 w-6 text-yellow-600" />
              <span className="text-sm text-gray-600">Paused</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pausedRecurring}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-6 w-6 text-blue-600" />
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.completedRecurring}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-6 w-6 text-purple-600" />
              <span className="text-sm text-gray-600">This Week</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.upcomingThisWeek}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-6 w-6 text-teal-600" />
              <span className="text-sm text-gray-600">Monthly Value</span>
            </div>
            <p className="text-xl font-bold text-teal-600">{formatCurrency(stats.totalMonthlyValue)}</p>
          </div>
        </div>

        <div className="space-y-2">
          {!loading && transactions.length === 0 && (
            <p className="text-sm text-gray-500">No recurring transactions found.</p>
          )}
          {transactions.map((txn) => (
            <div key={txn.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{txn.templateName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(txn.transactionType)}`}>
                      {txn.transactionType.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {getFrequencyBadge(txn.frequency)}
                    </span>
                    {txn.autoPost && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        AUTO-POST
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{txn.description}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${txn.status === 'active' ? 'bg-green-100 text-green-700' :
                      txn.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                        txn.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                    }`}>
                    {txn.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
                <div className="bg-emerald-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Amount</p>
                  <p className="text-lg font-bold text-emerald-700">{formatCurrency(txn.amount)}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Next Occurrence</p>
                  <p className="text-sm font-semibold text-blue-700">{txn.nextOccurrence ? new Date(txn.nextOccurrence).toLocaleDateString('en-IN') : '-'}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Last Posted</p>
                  <p className="text-sm font-semibold text-purple-700">{txn.lastPosted ? new Date(txn.lastPosted).toLocaleDateString('en-IN') : '-'}</p>
                </div>
                <div className="bg-teal-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Progress</p>
                  <p className="text-sm font-semibold text-teal-700">{txn.completedOccurrences}/{txn.totalOccurrences}</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-teal-600 h-1.5 rounded-full"
                      style={{ width: `${txn.totalOccurrences ? (txn.completedOccurrences / txn.totalOccurrences) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-600 mb-2">Accounts Affected:</p>
                <div className="flex flex-wrap gap-2">
                  {txn.accountsAffected.map((account, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      {account}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleUpdate(txn.id, { name: txn.templateName })}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Edit Template
                </button>
                <button
                  onClick={() => console.log('Post now', txn.id)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
                >
                  Post Now
                </button>
                <button
                  onClick={() => handleDelete(txn.id)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-sm p-3 text-white">
          <h3 className="text-lg font-semibold mb-2">Recurring Transaction Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-2">Flexible Scheduling</h4>
              <ul className="space-y-1 text-sm">
                <li>• Daily, weekly, monthly, quarterly, yearly</li>
                <li>• Custom date ranges and end dates</li>
                <li>• Skip weekends and holidays option</li>
                <li>• Multi-year planning support</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-2">Automation Options</h4>
              <ul className="space-y-1 text-sm">
                <li>• Auto-post or require manual approval</li>
                <li>• Email notifications before posting</li>
                <li>• Automatic reversal entries</li>
                <li>• Batch processing capabilities</li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <h4 className="font-semibold mb-2">Control & Audit</h4>
              <ul className="space-y-1 text-sm">
                <li>• Complete posting history log</li>
                <li>• Pause/resume functionality</li>
                <li>• Template versioning</li>
                <li>• Audit trail for all changes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
