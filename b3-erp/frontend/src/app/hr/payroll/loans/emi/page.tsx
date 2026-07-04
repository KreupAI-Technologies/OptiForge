'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Calendar,
  Calculator,
  DollarSign,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  PieChart,
  Search,
  ArrowRight
} from 'lucide-react'
import { HrPayrollService } from '@/services/hr-payroll.service'

interface EMISchedule {
  id: string
  installmentNo: number
  dueDate: string
  amount: number
  principalComponent: number
  interestComponent: number
  status: 'paid' | 'pending' | 'overdue'
  paymentDate?: string
}

interface ActiveLoan {
  id: string
  employeeId: string
  employeeName: string
  loanType: string
  totalAmount: number
  outstandingAmount: number
  tenureMonths: number
  remainingTenure: number
  interestRate: number
  emiAmount: number
  startDate: string
  endDate: string
  status: 'active' | 'closed' | 'defaulted'
  schedule: EMISchedule[]
}

export default function LoanEMIPage() {
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = await HrPayrollService.getLoans()
        const mapped: ActiveLoan[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          id: r.id ?? r.loanId ?? r.loanNumber ?? '',
          employeeId: r.employeeId ?? r.employeeCode ?? '',
          employeeName: r.employeeName ?? r.employee?.name ?? '',
          loanType: r.loanType ?? r.type ?? 'Loan',
          totalAmount: Number(r.totalAmount ?? r.loanAmount ?? r.principalAmount ?? r.amount ?? 0),
          outstandingAmount: Number(r.outstandingAmount ?? r.outstandingBalance ?? r.balance ?? 0),
          tenureMonths: Number(r.tenureMonths ?? r.tenure ?? r.requestedTenure ?? 0),
          remainingTenure: Number(r.remainingTenure ?? r.remainingEMIs ?? 0),
          interestRate: Number(r.interestRate ?? r.rate ?? 0),
          emiAmount: Number(r.emiAmount ?? r.emi ?? 0),
          startDate: r.startDate ?? r.disbursedDate ?? r.disbursementDate ?? '',
          endDate: r.endDate ?? r.maturityDate ?? '',
          status: (r.status === 'closed' || r.status === 'defaulted' ? r.status : 'active') as ActiveLoan['status'],
          schedule: Array.isArray(r.schedule) ? r.schedule : [],
        }))
        if (!cancelled) setActiveLoans(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load loans')
          setActiveLoans([])
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

  // Calculator State
  const [calcAmount, setCalcAmount] = useState(100000)
  const [calcRate, setCalcRate] = useState(10)
  const [calcTenure, setCalcTenure] = useState(12)

  const calculatedEMI = useMemo(() => {
    const r = calcRate / 12 / 100
    const n = calcTenure
    if (r === 0) return calcAmount / n
    return (calcAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  }, [calcAmount, calcRate, calcTenure])

  // Custom Date Display Component to avoid hydration errors
  const DateDisplay = ({ date, fallback = '-' }: { date?: string, fallback?: string }) => {
    const [mounted, setMounted] = useState(false)
    React.useEffect(() => setMounted(true), [])

    if (!mounted) return <span>{date || fallback}</span>
    return <span>{date ? new Date(date).toLocaleDateString('en-IN') : fallback}</span>
  }

  const filteredLoans = activeLoans.filter(loan =>
    loan.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    totalActive: activeLoans.length,
    totalOutstanding: activeLoans.reduce((sum, l) => sum + l.outstandingAmount, 0),
    monthlyCollection: activeLoans.reduce((sum, l) => sum + l.emiAmount, 0),
    overdueCount: 0 // Mock value
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 w-full">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="h-6 w-6 text-indigo-600" />
          EMI Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">Track repayments and calculate schedules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Column: Stats & Calculator */}
        <div className="space-y-3">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-medium">Monthly Collection</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">₹{(stats.monthlyCollection / 1000).toFixed(1)}K</h3>
            </div>
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-medium">Outstanding</p>
              <h3 className="text-xl font-bold text-indigo-600 mt-1">₹{(stats.totalOutstanding / 100000).toFixed(2)}L</h3>
            </div>
          </div>

          {/* EMI Calculator */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Calculator className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="font-bold text-gray-900">EMI Simulator</h3>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Loan Amount (₹)</label>
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input
                  type="range"
                  min="10000" max="2000000" step="5000"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full mt-2 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Interest Rate (% p.a)</label>
                  <input
                    type="number"
                    value={calcRate}
                    onChange={(e) => setCalcRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tenure (Months)</label>
                  <input
                    type="number"
                    value={calcTenure}
                    onChange={(e) => setCalcTenure(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-3 text-white mt-4">
                <p className="text-indigo-100 text-xs mb-1">Estimated Monthly EMI</p>
                <h2 className="text-2xl font-bold">₹{Math.round(calculatedEMI).toLocaleString('en-IN')}</h2>
                <div className="mt-3 pt-3 border-t border-indigo-500/30 flex justify-between text-xs text-indigo-100">
                  <span>Total Interest</span>
                  <span>₹{Math.round((calculatedEMI * calcTenure) - calcAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Loans List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Active Repayments</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search loans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500">Employee</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500">Loan Details</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500">EMI Info</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500">Progress</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-gray-50 group">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900 text-sm">{loan.employeeName}</div>
                        <div className="text-xs text-gray-500">{loan.employeeId}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-gray-900">{loan.loanType}</div>
                        <div className="text-xs text-gray-500">₹{loan.totalAmount.toLocaleString()} @ {loan.interestRate}%</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900 text-sm">₹{loan.emiAmount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Next: <DateDisplay date="2025-02-01" /></div>
                      </td>
                      <td className="px-5 py-4 w-48">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>{loan.tenureMonths - loan.remainingTenure} Paid</span>
                          <span>{loan.tenureMonths} Total</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${((loan.tenureMonths - loan.remainingTenure) / loan.tenureMonths) * 100}%` }}
                          />
                        </div>
                        <div className="text-xs text-indigo-600 mt-1 font-medium text-right">
                          ₹{loan.outstandingAmount.toLocaleString()} Left
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredLoans.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                        No active loans found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-between items-center">
              <span className="text-xs text-gray-500">Showing {filteredLoans.length} active loans</span>
              <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                View All History <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
