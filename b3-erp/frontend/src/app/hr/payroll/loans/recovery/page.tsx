'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  TrendingDown,
  Search,
  Filter,
  Download,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  MoreVertical,
  X
} from 'lucide-react'
import { HrPayrollService } from '@/services/hr-payroll.service'

interface RecoveryRecord {
  id: string
  employeeId: string
  employeeName: string
  loanId: string
  loanType: string
  amountRecovered: number
  recoveryDate: string
  method: 'salary_deduction' | 'bank_transfer' | 'cheque' | 'cash'
  status: 'completed' | 'pending' | 'failed'
  reference?: string
}

export default function LoanRecoveryPage() {
  const [recoveries, setRecoveries] = useState<RecoveryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = await HrPayrollService.getLoanRecoveries()
        const mapped: RecoveryRecord[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          id: r.id ?? '',
          employeeId: r.employeeId ?? '',
          employeeName: r.employeeName ?? '',
          loanId: r.loanId ?? '',
          loanType: r.loanType ?? '',
          amountRecovered: Number(r.amountRecovered ?? r.amount ?? 0),
          recoveryDate: r.recoveryDate ?? '',
          method: (r.method ?? 'salary_deduction') as RecoveryRecord['method'],
          status: (r.status ?? 'pending') as RecoveryRecord['status'],
          reference: r.reference ?? undefined,
        }))
        if (!cancelled) setRecoveries(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load recoveries')
          setRecoveries([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'pending' | 'failed'>('all')

  // Date Display Component to prevent hydration errors
  const DateDisplay = ({ date }: { date: string }) => {
    const [mounted, setMounted] = useState(false)
    React.useEffect(() => setMounted(true), [])
    if (!mounted) return <span>{date}</span>
    return <span>{new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
  }

  const filteredRecoveries = useMemo(() => {
    return recoveries.filter(rec => {
      const matchesSearch =
        rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.loanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.employeeId.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesTab = activeTab === 'all' || rec.status === activeTab

      return matchesSearch && matchesTab
    })
  }, [recoveries, searchTerm, activeTab])

  const stats = useMemo(() => {
    const totalRecovered = recoveries
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.amountRecovered, 0)

    const pendingRecovery = recoveries
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + r.amountRecovered, 0)

    const failedCount = recoveries.filter(r => r.status === 'failed').length

    return { totalRecovered, pendingRecovery, failedCount }
  }, [recoveries])

  return (
    <div className="min-h-screen bg-gray-50 p-3 w-full relative">
      <div className="mb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-green-600" />
            Recovery Tracking
          </h1>
          <p className="text-gray-500 text-sm mt-1">Monitor loan repayments and recovery status</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => setShowManualEntry(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Manual Entry
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Total Recovered (Jan)</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{stats.totalRecovered.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            <span>12% increase from last month</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Pending Clearance</p>
              <h3 className="text-2xl font-bold text-orange-600 mt-1">₹{stats.pendingRecovery.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Awaiting bank confirmation
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">Failed Transactions</p>
              <h3 className="text-2xl font-bold text-red-600 mt-1">{stats.failedCount}</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-red-600 font-medium cursor-pointer hover:underline">
            View details
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            {(['all', 'completed', 'pending', 'failed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reference or employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Details</th>
                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Info</th>
                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecoveries.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      {record.id} • <DateDisplay date={record.recoveryDate} />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">{record.loanType}</div>
                    <div className="text-xs text-gray-500">{record.loanId}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-bold text-gray-900">₹{record.amountRecovered.toLocaleString()}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="inline-flex items-center px-2 py-1 rounded border border-gray-200 bg-gray-50 text-xs text-gray-600 capitalize">
                      {record.method.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize
                      ${record.status === 'completed' ? 'bg-green-50 text-green-700' :
                        record.status === 'pending' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full 
                        ${record.status === 'completed' ? 'bg-green-500' :
                          record.status === 'pending' ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                      />
                      {record.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRecoveries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 bg-gray-50/50">
                    <Search className="h-8 w-8 text-gray-300 mb-2" />
                    <p>No recovery records found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal Overlay */}
      {showManualEntry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-900">Record Manual Recovery</h3>
              <button
                onClick={() => setShowManualEntry(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                  <option>Select Employee...</option>
                  <option>Arjun Mehta (EMP045)</option>
                  <option>Sarah Jenkins (EMP102)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loan Account</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none">
                  <option>Select Loan...</option>
                  <option>Home Loan (LN-2024-089)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" className="border border-green-600 bg-green-50 text-green-700 font-medium py-2 rounded-lg text-sm">Cash</button>
                  <button type="button" className="border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 rounded-lg text-sm">Cheque</button>
                  <button type="button" className="border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 rounded-lg text-sm">Transfer</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference / Remarks</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none h-20"
                  placeholder="Enter transaction ID or notes..."
                ></textarea>
              </div>
            </div>

            <div className="px-3 py-2 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => setShowManualEntry(false)}
                className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowManualEntry(false)}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium hover:bg-green-700 rounded-lg shadow-sm"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
