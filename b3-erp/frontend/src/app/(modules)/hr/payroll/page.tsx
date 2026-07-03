'use client'

import { useState, useEffect } from 'react'
import {
  Search,
  FileDown,
  Eye,
  Edit,
  CheckCircle,
  DollarSign,
  Users,
  AlertCircle,
  TrendingUp,
  Loader2
} from 'lucide-react'
import {
  PayrollService,
  SalarySlip,
  SalarySlipStatus,
  PaymentMethod
} from '@/services/payroll.service'
import { exportToCsv } from '@/lib/export'

interface PayrollRecord {
  id: string
  employeeId: string
  employeeName: string
  department: string
  payPeriod: string
  basicSalary: number
  hra: number
  transportAllowance: number
  medicalAllowance: number
  taxDeduction: number
  pfDeduction: number
  insurance: number
  netSalary: number
  paymentMethod: string
  status: 'draft' | 'processed' | 'paid' | 'on_hold'
}

// Transform service salary slip to page format
const transformSalarySlip = (slip: SalarySlip): PayrollRecord => {
  const statusMap: Record<SalarySlipStatus, PayrollRecord['status']> = {
    [SalarySlipStatus.DRAFT]: 'draft',
    [SalarySlipStatus.GENERATED]: 'processed',
    [SalarySlipStatus.SENT]: 'paid',
    [SalarySlipStatus.ACKNOWLEDGED]: 'paid',
  }

  const paymentMethodMap: Record<PaymentMethod, string> = {
    [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer',
    [PaymentMethod.CHEQUE]: 'Check',
    [PaymentMethod.CASH]: 'Cash',
    [PaymentMethod.UPI]: 'UPI',
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return {
    id: slip.id,
    employeeId: slip.employeeCode || slip.employeeId,
    employeeName: slip.employeeName || 'Unknown',
    department: slip.departmentName || 'Unknown',
    payPeriod: `${monthNames[slip.month - 1]} ${slip.year}`,
    basicSalary: slip.basicSalary,
    hra: slip.houseRentAllowance,
    transportAllowance: slip.conveyanceAllowance,
    medicalAllowance: slip.medicalAllowance,
    taxDeduction: slip.incomeTax,
    pfDeduction: slip.providentFund,
    insurance: slip.esiContribution,
    netSalary: slip.netSalary,
    paymentMethod: paymentMethodMap[slip.paymentMethod],
    status: statusMap[slip.status],
  }
}

export default function PayrollPage() {
  const [payrollData, setPayrollData] = useState<PayrollRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [stats, setStats] = useState({
    totalPayroll: 0,
    paidThisMonth: 0,
    pendingPayments: 0,
    avgSalary: 0
  })
  const itemsPerPage = 10

  // Load payroll data from service
  useEffect(() => {
    const loadPayrollData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch salary slips and statistics
        const [salarySlips, payrollStats] = await Promise.all([
          PayrollService.getSalarySlips(),
          PayrollService.getStatistics()
        ])

        const records = salarySlips.map(transformSalarySlip)
        setPayrollData(records)

        const totalPayroll = records.reduce((sum, record) => sum + record.netSalary, 0)
        const paidAmount = records
          .filter(r => r.status === 'paid')
          .reduce((sum, record) => sum + record.netSalary, 0)
        const pendingAmount = records
          .filter(r => r.status === 'draft' || r.status === 'processed')
          .reduce((sum, record) => sum + record.netSalary, 0)
        const avgSalary = records.length > 0 ? totalPayroll / records.length : 0

        setStats({
          totalPayroll,
          paidThisMonth: paidAmount,
          pendingPayments: pendingAmount,
          avgSalary: Math.round(avgSalary)
        })
      } catch (err) {
        console.error('Error loading payroll data:', err)
        setError('Failed to load payroll data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadPayrollData()
  }, [])

  const filteredData = payrollData.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    const matchesDepartment = departmentFilter === 'all' || record.department === departmentFilter
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'processed': return 'bg-blue-100 text-blue-700'
      case 'paid': return 'bg-green-100 text-green-700'
      case 'on_hold': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleExport = () => {
    exportToCsv('payroll', filteredData as unknown as Record<string, unknown>[])
  }

  const handleView = (id: string) => {
    console.log('Viewing payroll:', id)
  }

  const handleEdit = (id: string) => {
    console.log('Editing payroll:', id)
  }

  const handleProcess = (id: string) => {
    console.log('Processing payroll:', id)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="w-full min-h-screen px-3 py-2 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading payroll data...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full min-h-screen px-3 py-2 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="text-red-500 text-lg font-medium">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen px-3 py-2">
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Payroll</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">₹{stats.totalPayroll.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Paid This Month</p>
                <p className="text-2xl font-bold text-green-900 mt-1">₹{stats.paidThisMonth.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Pending Payments</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">₹{stats.pendingPayments.toLocaleString()}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Salary</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">₹{stats.avgSalary.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex-1 flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by employee name or payroll ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="processed">Processed</option>
                <option value="paid">Paid</option>
                <option value="on_hold">On Hold</option>
              </select>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                <option value="Production">Production</option>
                <option value="Quality Control">Quality Control</option>
                <option value="Engineering">Engineering</option>
                <option value="HR">HR</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileDown className="h-5 w-5" />
              Export Report
            </button>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-24rem)]">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payroll ID
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pay Period
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Basic Salary
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allowances
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deductions
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Salary
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((record) => {
                const totalAllowances = record.hra + record.transportAllowance + record.medicalAllowance
                const totalDeductions = record.taxDeduction + record.pfDeduction + record.insurance

                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.id}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.employeeName}</div>
                      <div className="text-sm text-gray-500">{record.employeeId}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {record.department}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {record.payPeriod}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      ₹{record.basicSalary.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{totalAllowances.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">
                        HRA + Transport + Medical
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{totalDeductions.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">
                        Tax + PF + Insurance
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ₹{record.netSalary.toLocaleString()}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(record.id)}
                          className="text-blue-600 hover:text-blue-800"
                         
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(record.id)}
                          className="text-gray-600 hover:text-gray-800"
                         
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        {record.status === 'draft' && (
                          <button
                            onClick={() => handleProcess(record.id)}
                            className="text-green-600 hover:text-green-800"
                           
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="px-3 py-2 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, filteredData.length)}
            </span>{' '}
            of <span className="font-medium">{filteredData.length}</span> results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
