'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { HrPayrollService } from '@/services/hr-payroll.service'
import {
  Users,
  FileText,
  Send,
  Download,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  Mail,
  Printer,
  Eye,
  Edit3,
  X
} from 'lucide-react'

interface IncrementLetter {
  id: string
  employeeId: string
  employeeName: string
  designation: string
  department: string
  incrementType: 'annual' | 'performance' | 'promotion' | 'arrears'
  effectiveDate: string
  oldBasic: number
  newBasic: number
  incrementAmount: number
  incrementPercentage: number
  letterDate: string
  letterNumber: string
  status: 'draft' | 'approved' | 'sent' | 'acknowledged' | 'printed'
  approvedBy?: string
  approvedDate?: string
  sentDate?: string
  sentVia?: 'email' | 'physical' | 'both'
  acknowledgedDate?: string
  downloadedDate?: string
  remarks?: string
  performanceRating?: 'outstanding' | 'excellent' | 'good' | 'average'
  emailAddress?: string
  templateUsed: string
}

const mockLetters: IncrementLetter[] = [
  {
    id: 'IL-2025-001',
    employeeId: 'EMP001',
    employeeName: 'Rajesh Kumar',
    designation: 'Senior Production Manager',
    department: 'Production',
    incrementType: 'annual',
    effectiveDate: '2025-04-01',
    oldBasic: 45000,
    newBasic: 47700,
    incrementAmount: 2700,
    incrementPercentage: 6.0,
    letterDate: '2025-03-15',
    letterNumber: 'MFG/HR/INC/2025/001',
    status: 'acknowledged',
    approvedBy: 'HR Director',
    approvedDate: '2025-03-14',
    sentDate: '2025-03-15',
    sentVia: 'both',
    acknowledgedDate: '2025-03-16',
    downloadedDate: '2025-03-15',
    emailAddress: 'rajesh.kumar@company.com',
    templateUsed: 'Annual Increment Letter Template',
    remarks: 'Regular annual increment FY 2025-26'
  },
  {
    id: 'IL-2025-002',
    employeeId: 'EMP002',
    employeeName: 'Priya Sharma',
    designation: 'Quality Control Manager',
    department: 'Quality Assurance',
    incrementType: 'performance',
    effectiveDate: '2025-07-01',
    oldBasic: 42000,
    newBasic: 45360,
    incrementAmount: 3360,
    incrementPercentage: 8.0,
    letterDate: '2025-06-20',
    letterNumber: 'MFG/HR/INC/2025/002',
    status: 'sent',
    approvedBy: 'CEO',
    approvedDate: '2025-06-18',
    sentDate: '2025-06-20',
    sentVia: 'email',
    performanceRating: 'excellent',
    emailAddress: 'priya.sharma@company.com',
    templateUsed: 'Performance Increment Letter Template',
    remarks: 'Q1 performance increment - excellent rating'
  },
  {
    id: 'IL-2025-003',
    employeeId: 'EMP003',
    employeeName: 'Amit Patel',
    designation: 'Warehouse Supervisor',
    department: 'Logistics',
    incrementType: 'annual',
    effectiveDate: '2025-04-01',
    oldBasic: 32000,
    newBasic: 33600,
    incrementAmount: 1600,
    incrementPercentage: 5.0,
    letterDate: '2025-03-18',
    letterNumber: 'MFG/HR/INC/2025/003',
    status: 'approved',
    approvedBy: 'HR Manager',
    approvedDate: '2025-03-17',
    emailAddress: 'amit.patel@company.com',
    templateUsed: 'Annual Increment Letter Template'
  },
  {
    id: 'IL-2025-004',
    employeeId: 'EMP004',
    employeeName: 'Sneha Reddy',
    designation: 'Production Supervisor',
    department: 'Production',
    incrementType: 'promotion',
    effectiveDate: '2025-05-01',
    oldBasic: 28000,
    newBasic: 33600,
    incrementAmount: 5600,
    incrementPercentage: 20.0,
    letterDate: '2025-04-25',
    letterNumber: 'MFG/HR/INC/2025/004',
    status: 'acknowledged',
    approvedBy: 'CEO',
    approvedDate: '2025-04-22',
    sentDate: '2025-04-25',
    sentVia: 'both',
    acknowledgedDate: '2025-04-26',
    downloadedDate: '2025-04-25',
    emailAddress: 'sneha.reddy@company.com',
    templateUsed: 'Promotion Increment Letter Template',
    remarks: 'Promoted from Operator to Supervisor'
  },
  {
    id: 'IL-2025-005',
    employeeId: 'EMP005',
    employeeName: 'Vikram Singh',
    designation: 'Maintenance Technician',
    department: 'Maintenance',
    incrementType: 'performance',
    effectiveDate: '2025-10-01',
    oldBasic: 30000,
    newBasic: 32100,
    incrementAmount: 2100,
    incrementPercentage: 7.0,
    letterDate: '2025-09-25',
    letterNumber: 'MFG/HR/INC/2025/005',
    status: 'sent',
    approvedBy: 'Operations Head',
    approvedDate: '2025-09-23',
    sentDate: '2025-09-25',
    sentVia: 'email',
    performanceRating: 'excellent',
    emailAddress: 'vikram.singh@company.com',
    templateUsed: 'Performance Increment Letter Template',
    remarks: 'Q3 performance increment'
  },
  {
    id: 'IL-2025-006',
    employeeId: 'EMP006',
    employeeName: 'Anita Desai',
    designation: 'HR Executive',
    department: 'Human Resources',
    incrementType: 'annual',
    effectiveDate: '2025-04-01',
    oldBasic: 35000,
    newBasic: 36750,
    incrementAmount: 1750,
    incrementPercentage: 5.0,
    letterDate: '2025-03-20',
    letterNumber: 'MFG/HR/INC/2025/006',
    status: 'draft',
    emailAddress: 'anita.desai@company.com',
    templateUsed: 'Annual Increment Letter Template'
  },
  {
    id: 'IL-2025-007',
    employeeId: 'EMP007',
    employeeName: 'Rahul Verma',
    designation: 'Accounts Manager',
    department: 'Finance',
    incrementType: 'performance',
    effectiveDate: '2025-07-01',
    oldBasic: 48000,
    newBasic: 52800,
    incrementAmount: 4800,
    incrementPercentage: 10.0,
    letterDate: '2025-06-22',
    letterNumber: 'MFG/HR/INC/2025/007',
    status: 'acknowledged',
    approvedBy: 'CFO',
    approvedDate: '2025-06-20',
    sentDate: '2025-06-22',
    sentVia: 'both',
    acknowledgedDate: '2025-06-23',
    downloadedDate: '2025-06-22',
    performanceRating: 'outstanding',
    emailAddress: 'rahul.verma@company.com',
    templateUsed: 'Performance Increment Letter Template',
    remarks: 'Outstanding performance - Q1 rating'
  },
  {
    id: 'IL-2025-008',
    employeeId: 'EMP008',
    employeeName: 'Meera Krishnan',
    designation: 'Purchase Executive',
    department: 'Purchase',
    incrementType: 'annual',
    effectiveDate: '2025-04-01',
    oldBasic: 32000,
    newBasic: 33920,
    incrementAmount: 1920,
    incrementPercentage: 6.0,
    letterDate: '2025-03-22',
    letterNumber: 'MFG/HR/INC/2025/008',
    status: 'sent',
    approvedBy: 'HR Manager',
    approvedDate: '2025-03-21',
    sentDate: '2025-03-22',
    sentVia: 'email',
    emailAddress: 'meera.krishnan@company.com',
    templateUsed: 'Annual Increment Letter Template'
  },
  {
    id: 'IL-2025-009',
    employeeId: 'EMP009',
    employeeName: 'Arjun Nair',
    designation: 'Sales Manager',
    department: 'Sales',
    incrementType: 'arrears',
    effectiveDate: '2025-01-01',
    oldBasic: 40000,
    newBasic: 42400,
    incrementAmount: 2400,
    incrementPercentage: 6.0,
    letterDate: '2025-03-25',
    letterNumber: 'MFG/HR/INC/2025/009',
    status: 'approved',
    approvedBy: 'HR Director',
    approvedDate: '2025-03-24',
    emailAddress: 'arjun.nair@company.com',
    templateUsed: 'Arrears Increment Letter Template',
    remarks: 'Delayed increment with arrears for Jan-Mar 2025'
  },
  {
    id: 'IL-2025-010',
    employeeId: 'EMP010',
    employeeName: 'Kavita Joshi',
    designation: 'IT Administrator',
    department: 'IT',
    incrementType: 'performance',
    effectiveDate: '2025-10-01',
    oldBasic: 38000,
    newBasic: 40660,
    incrementAmount: 2660,
    incrementPercentage: 7.0,
    letterDate: '2025-09-28',
    letterNumber: 'MFG/HR/INC/2025/010',
    status: 'draft',
    performanceRating: 'excellent',
    emailAddress: 'kavita.joshi@company.com',
    templateUsed: 'Performance Increment Letter Template'
  }
]

export default function IncrementLettersPage() {
  const [letters, setLetters] = useState<IncrementLetter[]>(mockLetters)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [departmentFilter, setDepartmentFilter] = useState<string>('all')
  const [selectedLetter, setSelectedLetter] = useState<IncrementLetter | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = await HrPayrollService.getSalaryRevisions('increment-letters')
        if (!cancelled && Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((r: any) => ({
            id: String(r.id ?? r.details?.id ?? ''),
            employeeId: String(r.employeeId ?? r.details?.employeeId ?? r.employeeCode ?? ''),
            employeeName: String(r.employeeName ?? r.details?.employeeName ?? ''),
            designation: String(r.designation ?? r.details?.designation ?? ''),
            department: String(r.department ?? r.details?.department ?? ''),
            incrementType: (r.incrementType ?? r.details?.incrementType ?? 'annual') as IncrementLetter['incrementType'],
            effectiveDate: String(r.effectiveDate ?? r.details?.effectiveDate ?? ''),
            oldBasic: Number(r.currentSalary ?? r.details?.oldBasic ?? 0),
            newBasic: Number(r.revisedSalary ?? r.details?.newBasic ?? 0),
            incrementAmount: Number(
              r.incrementAmount ??
                r.details?.incrementAmount ??
                (Number(r.revisedSalary ?? 0) - Number(r.currentSalary ?? 0))
            ),
            incrementPercentage: Number(r.incrementPercent ?? r.details?.incrementPercentage ?? 0),
            letterDate: String(r.letterDate ?? r.details?.letterDate ?? r.effectiveDate ?? ''),
            letterNumber: String(r.letterNumber ?? r.details?.letterNumber ?? ''),
            status: (r.status ?? r.details?.status ?? 'draft') as IncrementLetter['status'],
            approvedBy: r.approvedBy ?? r.details?.approvedBy ?? undefined,
            approvedDate: r.approvedDate ?? r.details?.approvedDate ?? undefined,
            sentDate: r.sentDate ?? r.details?.sentDate ?? undefined,
            sentVia: (r.sentVia ?? r.details?.sentVia ?? undefined) as IncrementLetter['sentVia'],
            acknowledgedDate: r.acknowledgedDate ?? r.details?.acknowledgedDate ?? undefined,
            downloadedDate: r.downloadedDate ?? r.details?.downloadedDate ?? undefined,
            remarks: r.remarks ?? r.details?.remarks ?? undefined,
            performanceRating: (r.performanceRating ?? r.details?.performanceRating ?? undefined) as IncrementLetter['performanceRating'],
            emailAddress: r.emailAddress ?? r.details?.emailAddress ?? undefined,
            templateUsed: String(r.templateUsed ?? r.details?.templateUsed ?? 'Annual Increment Letter Template'),
          } as IncrementLetter))
          setLetters(mapped)
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredLetters = useMemo(() => {
    return letters.filter(letter => {
      const matchesSearch =
        letter.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        letter.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        letter.letterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        letter.designation.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || letter.status === statusFilter
      const matchesType = typeFilter === 'all' || letter.incrementType === typeFilter
      const matchesDepartment = departmentFilter === 'all' || letter.department === departmentFilter

      return matchesSearch && matchesStatus && matchesType && matchesDepartment
    })
  }, [letters, searchTerm, statusFilter, typeFilter, departmentFilter])

  const stats = useMemo(() => {
    const total = letters.length
    const drafted = letters.filter(l => l.status === 'draft').length
    const approved = letters.filter(l => l.status === 'approved').length
    const sent = letters.filter(l => l.status === 'sent' || l.status === 'acknowledged').length
    const acknowledged = letters.filter(l => l.status === 'acknowledged').length
    const avgIncrement = letters.reduce((sum, l) => sum + l.incrementPercentage, 0) / total

    return { total, drafted, approved, sent, acknowledged, avgIncrement }
  }, [letters])

  const departments = useMemo(() => {
    return Array.from(new Set(letters.map(l => l.department))).sort()
  }, [letters])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'approved': return 'bg-blue-100 text-blue-800'
      case 'sent': return 'bg-yellow-100 text-yellow-800'
      case 'acknowledged': return 'bg-green-100 text-green-800'
      case 'printed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'annual': return 'bg-blue-100 text-blue-800'
      case 'performance': return 'bg-green-100 text-green-800'
      case 'promotion': return 'bg-purple-100 text-purple-800'
      case 'arrears': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handlePreviewLetter = (letter: IncrementLetter) => {
    setSelectedLetter(letter)
  }

  const handleApproveLetter = (letterId: string) => {
    setLetters(prev => prev.map(l =>
      l.id === letterId
        ? {
          ...l,
          status: 'approved',
          approvedBy: 'HR Manager',
          approvedDate: new Date().toISOString().split('T')[0]
        }
        : l
    ))
  }

  const handleSendLetter = (letterId: string, via: 'email' | 'physical' | 'both') => {
    setLetters(prev => prev.map(l =>
      l.id === letterId
        ? {
          ...l,
          status: 'sent',
          sentDate: new Date().toISOString().split('T')[0],
          sentVia: via
        }
        : l
    ))
  }

  const handleAcknowledgeLetter = (letterId: string) => {
    setLetters(prev => prev.map(l =>
      l.id === letterId
        ? {
          ...l,
          status: 'acknowledged',
          acknowledgedDate: new Date().toISOString().split('T')[0]
        }
        : l
    ))
  }

  return (
    <div className="p-6 w-full">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Increment Letters</h1>
        <p className="text-gray-600">Generate, approve, and distribute increment letters to employees</p>
        {isLoading && <div className="text-sm text-gray-500 mt-1">Loading…</div>}
        {loadError && <div className="text-sm text-red-600 mt-1">{loadError}</div>}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Total Letters</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Draft</p>
              <p className="text-2xl font-bold text-gray-900">{stats.drafted}</p>
            </div>
            <div className="h-12 w-12 bg-gray-500 rounded-lg flex items-center justify-center">
              <Edit3 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Approved</p>
              <p className="text-2xl font-bold text-blue-900">{stats.approved}</p>
            </div>
            <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 mb-1">Sent</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.sent}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Send className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Acknowledged</p>
              <p className="text-2xl font-bold text-green-900">{stats.acknowledged}</p>
            </div>
            <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Avg Increment</p>
              <p className="text-2xl font-bold text-purple-900">{stats.avgIncrement.toFixed(1)}%</p>
            </div>
            <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-3 p-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by name, ID, letter number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="sent">Sent</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="printed">Printed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="annual">Annual</option>
              <option value="performance">Performance</option>
              <option value="promotion">Promotion</option>
              <option value="arrears">Arrears</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Letters List */}
      <div className="space-y-2">
        {filteredLetters.map((letter) => (
          <div key={letter.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{letter.employeeName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(letter.status)}`}>
                      {letter.status.charAt(0).toUpperCase() + letter.status.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(letter.incrementType)}`}>
                      {letter.incrementType.charAt(0).toUpperCase() + letter.incrementType.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {letter.employeeId}
                    </span>
                    <span>{letter.designation}</span>
                    <span>{letter.department}</span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {letter.letterNumber}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePreviewLetter(letter)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                  <button className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 text-sm">
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  {letter.status === 'draft' && (
                    <button
                      onClick={() => handleApproveLetter(letter.id)}
                      className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2 text-sm"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </button>
                  )}
                  {letter.status === 'approved' && (
                    <button
                      onClick={() => handleSendLetter(letter.id, 'email')}
                      className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center gap-2 text-sm"
                    >
                      <Mail className="h-4 w-4" />
                      Send
                    </button>
                  )}
                  {letter.status === 'sent' && (
                    <button
                      onClick={() => handleAcknowledgeLetter(letter.id)}
                      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 text-sm"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark Acknowledged
                    </button>
                  )}
                  <button className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2 text-sm">
                    <Printer className="h-4 w-4" />
                    Print
                  </button>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {/* Salary Change */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <h4 className="text-xs font-semibold text-blue-900 mb-3 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    Salary Change
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-blue-600">Old Basic</p>
                      <p className="text-sm font-semibold text-blue-900">₹{letter.oldBasic.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">New Basic</p>
                      <p className="text-sm font-semibold text-blue-900">₹{letter.newBasic.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Increment</p>
                      <p className="text-sm font-semibold text-green-700">
                        ₹{letter.incrementAmount.toLocaleString('en-IN')} ({letter.incrementPercentage}%)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Letter Details */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                  <h4 className="text-xs font-semibold text-purple-900 mb-3 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Letter Details
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-purple-600">Letter Date</p>
                      <p className="text-sm font-semibold text-purple-900">
                        {new Date(letter.letterDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-600">Effective Date</p>
                      <p className="text-sm font-semibold text-purple-900">
                        {new Date(letter.effectiveDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-600">Template</p>
                      <p className="text-sm font-semibold text-purple-900">{letter.templateUsed}</p>
                    </div>
                  </div>
                </div>

                {/* Approval Info */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                  <h4 className="text-xs font-semibold text-green-900 mb-3 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Approval Info
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-green-600">Approved By</p>
                      <p className="text-sm font-semibold text-green-900">
                        {letter.approvedBy || 'Pending'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-green-600">Approved Date</p>
                      <p className="text-sm font-semibold text-green-900">
                        {letter.approvedDate ? new Date(letter.approvedDate).toLocaleDateString('en-IN') : '-'}
                      </p>
                    </div>
                    {letter.performanceRating && (
                      <div>
                        <p className="text-xs text-green-600">Performance</p>
                        <p className="text-sm font-semibold text-green-900 capitalize">
                          {letter.performanceRating}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Distribution */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
                  <h4 className="text-xs font-semibold text-yellow-900 mb-3 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Distribution
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-yellow-600">Sent Date</p>
                      <p className="text-sm font-semibold text-yellow-900">
                        {letter.sentDate ? new Date(letter.sentDate).toLocaleDateString('en-IN') : 'Not sent'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-yellow-600">Sent Via</p>
                      <p className="text-sm font-semibold text-yellow-900 capitalize">
                        {letter.sentVia || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-yellow-600">Email</p>
                      <p className="text-sm font-semibold text-yellow-900">
                        {letter.emailAddress || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acknowledgment */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-3 border border-indigo-200">
                  <h4 className="text-xs font-semibold text-indigo-900 mb-3 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Acknowledgment
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-indigo-600">Acknowledged Date</p>
                      <p className="text-sm font-semibold text-indigo-900">
                        {letter.acknowledgedDate ? new Date(letter.acknowledgedDate).toLocaleDateString('en-IN') : 'Pending'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-600">Downloaded Date</p>
                      <p className="text-sm font-semibold text-indigo-900">
                        {letter.downloadedDate ? new Date(letter.downloadedDate).toLocaleDateString('en-IN') : 'Not downloaded'}
                      </p>
                    </div>
                    {letter.remarks && (
                      <div>
                        <p className="text-xs text-indigo-600">Remarks</p>
                        <p className="text-sm font-semibold text-indigo-900">{letter.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Letter Preview Modal */}
      {selectedLetter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-lg  w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Letter Preview</h2>
              <button
                onClick={() => setSelectedLetter(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-8">
              {/* Letter Content */}
              <div className="space-y-3">
                {/* Company Header */}
                <div className="text-center border-b-2 border-gray-300 pb-4">
                  <h1 className="text-2xl font-bold text-gray-900">Manufacturing Company Pvt Ltd</h1>
                  <p className="text-sm text-gray-600">Industrial Area, Phase-II, Bangalore - 560058</p>
                  <p className="text-sm text-gray-600">Email: hr@manufacturingco.com | Phone: +91-80-12345678</p>
                </div>

                {/* Letter Details */}
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="font-semibold">Letter No: {selectedLetter.letterNumber}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Date: {new Date(selectedLetter.letterDate).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>

                {/* To Address */}
                <div>
                  <p className="font-semibold">To,</p>
                  <p>{selectedLetter.employeeName}</p>
                  <p>{selectedLetter.designation}</p>
                  <p>{selectedLetter.department} Department</p>
                  <p>Employee ID: {selectedLetter.employeeId}</p>
                </div>

                {/* Subject */}
                <div>
                  <p className="font-semibold">Subject: Salary Increment Letter - {selectedLetter.incrementType.charAt(0).toUpperCase() + selectedLetter.incrementType.slice(1)}</p>
                </div>

                {/* Body */}
                <div className="space-y-2">
                  <p>Dear {selectedLetter.employeeName.split(' ')[0]},</p>

                  <p>
                    We are pleased to inform you that based on your {selectedLetter.incrementType === 'performance' ? 'outstanding performance and contributions' :
                      selectedLetter.incrementType === 'promotion' ? 'promotion to a higher role' :
                        selectedLetter.incrementType === 'arrears' ? 'delayed increment processing' : 'annual appraisal'},
                    the management has approved a salary increment for you.
                  </p>

                  <p>The details of your revised salary structure are as follows:</p>

                  {/* Salary Table */}
                  <table className="w-full border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">Component</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">Old Amount (₹)</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">New Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">Basic Salary</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          {selectedLetter.oldBasic.toLocaleString('en-IN')}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-semibold">
                          {selectedLetter.newBasic.toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr className="bg-green-50">
                        <td className="border border-gray-300 px-4 py-2 font-semibold">Increment Amount</td>
                        <td className="border border-gray-300 px-4 py-2"></td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-semibold text-green-700">
                          {selectedLetter.incrementAmount.toLocaleString('en-IN')} ({selectedLetter.incrementPercentage}%)
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <p>
                    <strong>Effective Date:</strong> This increment will be effective from{' '}
                    {new Date(selectedLetter.effectiveDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}.
                  </p>

                  {selectedLetter.incrementType === 'performance' && selectedLetter.performanceRating && (
                    <p>
                      This increment has been awarded in recognition of your <strong>{selectedLetter.performanceRating}</strong> performance rating
                      and significant contributions to the organization.
                    </p>
                  )}

                  {selectedLetter.incrementType === 'promotion' && (
                    <p>
                      This increment is effective upon your promotion to the position of {selectedLetter.designation}.
                      We congratulate you on this achievement and look forward to your continued success.
                    </p>
                  )}

                  {selectedLetter.incrementType === 'arrears' && (
                    <p>
                      Please note that the arrears amount for the period from {new Date(selectedLetter.effectiveDate).toLocaleDateString('en-IN')}
                      to {new Date(selectedLetter.letterDate).toLocaleDateString('en-IN')} will be processed along with your upcoming salary.
                    </p>
                  )}

                  <p>
                    We appreciate your dedication and hard work. We wish you continued success in your role
                    and look forward to your valuable contributions to the organization.
                  </p>

                  <p>If you have any questions regarding this increment, please feel free to contact the HR Department.</p>

                  <p>Congratulations once again!</p>

                  <p className="mt-8">
                    Best Regards,<br />
                    <strong>{selectedLetter.approvedBy || 'HR Manager'}</strong><br />
                    Human Resources Department<br />
                    Manufacturing Company Pvt Ltd
                  </p>
                </div>

                {/* Acknowledgment */}
                <div className="border-t-2 border-gray-300 pt-6 mt-8">
                  <p className="font-semibold mb-2">Employee Acknowledgment</p>
                  <p className="text-sm mb-3">
                    I, {selectedLetter.employeeName}, acknowledge receipt of this increment letter and accept the revised salary structure
                    effective from {new Date(selectedLetter.effectiveDate).toLocaleDateString('en-IN')}.
                  </p>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-sm">Employee Signature: ___________________</p>
                    </div>
                    <div>
                      <p className="text-sm">Date: ___________________</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-3 flex justify-end gap-2">
              <button
                onClick={() => setSelectedLetter(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Policy Guidelines */}
      <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-3 border border-blue-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Increment Letter Guidelines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Letter Generation Process</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Draft letter created after increment approval</li>
              <li>HR reviews and approves letter content</li>
              <li>Letter distributed via email and/or physical copy</li>
              <li>Employee acknowledgment tracked in system</li>
              <li>Signed copy filed in employee records</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Letter Templates</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Annual Increment: Standard yearly appraisal format</li>
              <li>Performance: Includes performance rating details</li>
              <li>Promotion: Highlights role change and responsibilities</li>
              <li>Arrears: Mentions delayed implementation and backpay</li>
              <li>All templates include salary breakdown table</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Distribution Methods</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Email: Sent to registered employee email ID</li>
              <li>Physical: Printed copy handed to employee</li>
              <li>Both: Email + physical for formal records</li>
              <li>Download tracking: Monitor employee access</li>
              <li>Acknowledgment: Employee signs physical copy</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Compliance Requirements</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Unique letter number for audit trail</li>
              <li>Effective date clearly mentioned</li>
              <li>Old and new salary components detailed</li>
              <li>Authorized signatory approval required</li>
              <li>Employee acknowledgment mandatory</li>
              <li>Retain copies for 7 years minimum</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
