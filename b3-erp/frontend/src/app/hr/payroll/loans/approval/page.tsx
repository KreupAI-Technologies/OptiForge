'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  FileText,
  AlertCircle,
  ChevronRight,
  User,
  Calendar,
  Briefcase
} from 'lucide-react'
import { HrPayrollService } from '@/services/hr-payroll.service'

interface LoanApplication {
  id: string
  employeeId: string
  employeeName: string
  department: string
  designation: string
  loanType: 'personal' | 'home' | 'education' | 'emergency' | 'vehicle'
  amount: number
  tenureMonths: number
  interestRate: number
  emiAmount: number
  reason: string
  appliedDate: string
  status: 'pending' | 'approved' | 'rejected' | 'disbursed'
  riskScore: 'low' | 'medium' | 'high'
  documentsVerified: boolean
  remarks?: string
}

export default function LoanApprovalPage() {
  const [loans, setLoans] = useState<LoanApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = await HrPayrollService.getLoans()
        const mapped: LoanApplication[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          id: r.loanNumber ?? r.id ?? r.details?.loanNumber ?? '',
          employeeId: r.employeeCode ?? r.employeeId ?? r.details?.employeeId ?? '',
          employeeName: r.employeeName ?? r.employee?.fullName ?? r.details?.employeeName ?? '',
          department: r.department ?? r.details?.department ?? '',
          designation: r.designation ?? r.details?.designation ?? '',
          loanType: (r.loanType ?? r.details?.loanType ?? 'personal') as LoanApplication['loanType'],
          amount: Number(r.loanAmount ?? r.principalAmount ?? r.amount ?? r.details?.amount ?? 0),
          tenureMonths: Number(r.tenure ?? r.tenureMonths ?? r.details?.tenureMonths ?? 0),
          interestRate: Number(r.interestRate ?? r.details?.interestRate ?? 0),
          emiAmount: Number(r.emiAmount ?? r.emi ?? r.details?.emiAmount ?? 0),
          reason: r.reason ?? r.purpose ?? r.details?.reason ?? '',
          appliedDate: r.appliedDate ?? r.requestDate ?? r.createdAt ?? r.details?.appliedDate ?? '',
          status: (r.status ?? 'pending') as LoanApplication['status'],
          riskScore: (r.riskScore ?? r.details?.riskScore ?? 'low') as LoanApplication['riskScore'],
          documentsVerified: Boolean(r.documentsVerified ?? r.details?.documentsVerified ?? false),
          remarks: r.remarks ?? r.details?.remarks ?? undefined,
        }))
        if (!cancelled) setLoans(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load loan applications')
          setLoans([])
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

  const filteredLoans = useMemo(() => {
    return loans.filter(loan => {
      const matchesStatus = filterStatus === 'all' || loan.status === filterStatus
      const matchesSearch =
        loan.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.loanType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.employeeId.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesStatus && matchesSearch
    })
  }, [loans, filterStatus, searchTerm])

  const stats = useMemo(() => {
    const total = loans.length
    const pending = loans.filter(l => l.status === 'pending').length
    const approved = loans.filter(l => l.status === 'approved').length
    const totalAmount = loans.reduce((sum, l) => sum + l.amount, 0)

    return { total, pending, approved, totalAmount }
  }, [loans])

  const handleStatusUpdate = (id: string, newStatus: 'approved' | 'rejected') => {
    setLoans(prev => prev.map(loan =>
      loan.id === id ? { ...loan, status: newStatus } : loan
    ))
    setSelectedLoan(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'disbursed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 w-full">
      <div className="mb-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-blue-600" />
            Loan Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Review and approve employee loan requests</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export Report
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading loan applications…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && loans.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No loan applications found.
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Total Requests</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Pending Action</p>
              <h3 className="text-2xl font-bold text-orange-600 mt-1">{stats.pending}</h3>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Approved This Month</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-medium uppercase">Total Value</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{(stats.totalAmount / 100000).toFixed(1)}L</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2 bg-gray-50/50">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees or loan types..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredLoans.map((loan) => (
                <div
                  key={loan.id}
                  onClick={() => setSelectedLoan(loan)}
                  className={`p-4 hover:bg-blue-50/50 transition-colors cursor-pointer group ${selectedLoan?.id === loan.id ? 'bg-blue-50 ring-1 ring-blue-200' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold group-hover:bg-white group-hover:shadow-sm">
                        {loan.employeeName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{loan.employeeName}</h4>
                        <p className="text-xs text-gray-500">{loan.designation} • {loan.department}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                      {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Amount</p>
                      <p className="text-sm font-medium text-gray-900">₹{loan.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Type</p>
                      <p className="text-sm font-medium text-gray-900 capitalize">{loan.loanType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">EMI</p>
                      <p className="text-sm font-medium text-gray-900">₹{loan.emiAmount.toLocaleString()}/mo</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Applied On</p>
                      <p className="text-sm font-medium text-gray-900">{loan.appliedDate}</p>
                    </div>
                  </div>
                </div>
              ))}

              {filteredLoans.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>No loan applications found matching criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="space-y-3">
          {selectedLoan ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sticky top-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">Application Details</h3>
                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{selectedLoan.id}</span>
              </div>

              <div className="flex items-center gap-2 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                  {selectedLoan.employeeName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedLoan.employeeName}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Briefcase className="h-3 w-3" />
                    {selectedLoan.designation}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Loan Specifics</h5>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    <div>
                      <p className="text-xs text-gray-400">Total Amount</p>
                      <p className="text-lg font-bold text-gray-900">₹{selectedLoan.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Tenure</p>
                      <p className="text-sm font-medium text-gray-900">{selectedLoan.tenureMonths} Months</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Interest Rate</p>
                      <p className="text-sm font-medium text-gray-900">{selectedLoan.interestRate}% p.a.</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Ref ID</p>
                      <p className="text-sm font-medium text-gray-900">{selectedLoan.employeeId}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Purpose</h5>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                    "{selectedLoan.reason}"
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Risk Assessment</h5>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskColor(selectedLoan.riskScore)}`}>
                      {selectedLoan.riskScore.toUpperCase()} Risk
                    </span>
                    {selectedLoan.documentsVerified ? (
                      <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
                        <CheckCircle className="h-3 w-3" /> Docs Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-orange-700 font-medium">
                        <AlertCircle className="h-3 w-3" /> Docs Pending
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                    <div
                      className={`h-1.5 rounded-full ${selectedLoan.riskScore === 'low' ? 'bg-green-500 w-1/4' :
                          selectedLoan.riskScore === 'medium' ? 'bg-yellow-500 w-2/4' : 'bg-red-500 w-3/4'
                        }`}
                    />
                  </div>
                </div>
              </div>

              {selectedLoan.status === 'pending' && (
                <div className="flex items-center gap-3 mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => handleStatusUpdate(selectedLoan.id, 'rejected')}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedLoan.id, 'approved')}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" /> Approve
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-8 text-center sticky top-6">
              <div className="mx-auto h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                <User className="h-8 w-8 text-blue-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Select an Application</h3>
              <p className="text-sm text-gray-500">
                Click on any loan application from the list to view detailed information, risk assessment, and take action.
              </p>
            </div>
          )}

          {/* Quick Policy Guide */}
          <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
            <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-3">
              <Briefcase className="h-4 w-4" /> Policy Guidelines
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2 text-xs text-indigo-800">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                EMI should not exceed 40% of monthly in-hand salary.
              </li>
              <li className="flex items-start gap-2 text-xs text-indigo-800">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                Minimum tenure is 6 months, maximum 60 months.
              </li>
              <li className="flex items-start gap-2 text-xs text-indigo-800">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                Employees under probation are not eligible for personal loans.
              </li>
            </ul>
            <button className="mt-4 text-xs font-semibold text-indigo-700 flex items-center gap-1 hover:underline">
              View Full Policy <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
