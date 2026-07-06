'use client'

import React, { useState, useEffect } from 'react'
import { ProductionOrphanService } from '@/services/production/production-orphan.service'
import { Search, Filter, Download, Eye, Edit2, CheckCircle as CheckIcon, ClipboardCheck, XCircle, AlertTriangle, TrendingUp } from 'lucide-react'
import { ViewInspectionModal, EditInspectionModal, ApproveInspectionModal, type Inspection } from '@/components/quality/QualityModals'
import { ExportInspectionReportModal } from '@/components/quality/QualityExportModals'
import { exportToCsv } from '@/lib/export'

interface QualityInspection {
  id: string
  inspection_id: string
  work_order_id: string
  product_name: string
  product_code: string
  inspection_type: 'in_process' | 'final' | 'first_article' | 'receiving' | 'audit'
  inspection_date: string
  inspector_name: string
  sample_size: number
  defects_found: number
  defect_categories: { [key: string]: number }
  pass_fail_status: 'pending' | 'passed' | 'failed' | 'conditional'
  remarks: string
  work_center: string
}

// Map a raw NCR/inspection record from the API into the QualityInspection shape used by this page.
const mapToQualityInspection = (d: any, i: number): QualityInspection => ({
  id: String(d?.id ?? d?.inspection_id ?? d?.ncrNumber ?? i),
  inspection_id: String(d?.inspection_id ?? d?.ncrNumber ?? d?.id ?? `QI-${i + 1}`),
  work_order_id: String(d?.work_order_id ?? d?.workOrder ?? ''),
  product_name: String(d?.product_name ?? d?.productName ?? ''),
  product_code: String(d?.product_code ?? d?.productCode ?? ''),
  inspection_type: (d?.inspection_type ?? d?.inspectionType ?? 'in_process') as QualityInspection['inspection_type'],
  inspection_date: String(d?.inspection_date ?? d?.detectedDate ?? d?.createdAt ?? ''),
  inspector_name: String(d?.inspector_name ?? d?.detectedBy ?? d?.inspectorName ?? ''),
  sample_size: Number(d?.sample_size ?? d?.sampleSize ?? 0),
  defects_found: Number(d?.defects_found ?? d?.defectsFound ?? d?.quantityAffected ?? 0),
  defect_categories:
    d?.defect_categories && typeof d.defect_categories === 'object' ? d.defect_categories : {},
  pass_fail_status: (d?.pass_fail_status ?? d?.status ?? 'pending') as QualityInspection['pass_fail_status'],
  remarks: String(d?.remarks ?? d?.description ?? ''),
  work_center: String(d?.work_center ?? d?.workCenter ?? d?.detectedStage ?? ''),
})

const ProductionQualityPage = () => {
  const [inspections, setInspections] = useState<QualityInspection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [inspectionTypeFilter, setInspectionTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const res = (await ProductionOrphanService.getNcrs()) as any
        const raw = Array.isArray(res) ? res : (res?.data ?? [])
        const mapped = (Array.isArray(raw) ? raw : []).map(mapToQualityInspection)
        if (!cancelled) setInspections(mapped)
      } catch (err: any) {
        if (!cancelled) setLoadError(err?.message ?? 'Failed to load data')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  // Modal state hooks
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isApproveOpen, setIsApproveOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [selectedInspection, setSelectedInspection] = useState<QualityInspection | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'passed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'conditional':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getInspectionTypeColor = (type: string) => {
    switch (type) {
      case 'in_process':
        return 'text-blue-600'
      case 'final':
        return 'text-green-600'
      case 'first_article':
        return 'text-purple-600'
      case 'receiving':
        return 'text-orange-600'
      case 'audit':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch =
      inspection.inspection_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.work_order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.inspector_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || inspection.pass_fail_status === statusFilter
    const matchesType = inspectionTypeFilter === 'all' || inspection.inspection_type === inspectionTypeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const totalPages = Math.ceil(filteredInspections.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedInspections = filteredInspections.slice(startIndex, startIndex + itemsPerPage)

  const pendingInspections = inspections.filter(i => i.pass_fail_status === 'pending').length
  const passedInspections = inspections.filter(i => i.pass_fail_status === 'passed').length
  const failedInspections = inspections.filter(i => i.pass_fail_status === 'failed').length
  const totalInspections = inspections.filter(i => i.pass_fail_status !== 'pending').length
  const passRate = totalInspections > 0 ? ((passedInspections / totalInspections) * 100).toFixed(1) : '0.0'

  // Helper function to convert QualityInspection to Inspection modal format
  const convertToModalInspection = (inspection: QualityInspection): Inspection => {
    const inspectionTypeMap: Record<string, 'incoming' | 'in-process' | 'final' | 'pre-shipment'> = {
      'receiving': 'incoming',
      'in_process': 'in-process',
      'final': 'final',
      'first_article': 'in-process',
      'audit': 'final'
    }

    const statusMap: Record<string, 'pending' | 'passed' | 'failed' | 'conditional'> = {
      'pending': 'pending',
      'passed': 'passed',
      'failed': 'failed',
      'conditional': 'conditional'
    }

    return {
      id: inspection.inspection_id,
      workOrderId: inspection.work_order_id,
      productName: inspection.product_name,
      productCode: inspection.product_code,
      inspectionType: inspectionTypeMap[inspection.inspection_type] || 'in-process',
      inspectionDate: inspection.inspection_date,
      inspector: inspection.inspector_name,
      inspectorId: `INS-${inspection.inspector_name.replace(/\s/g, '')}`,
      workCenter: inspection.work_center,
      workCenterId: `WC-${inspection.work_center.replace(/\s/g, '')}`,
      sampleSize: inspection.sample_size,
      defectsFound: inspection.defects_found,
      status: statusMap[inspection.pass_fail_status] || 'pending',
      defectCategories: Object.entries(inspection.defect_categories).map(([category, count], index) => ({
        id: `${inspection.id}-defect-${index}`,
        category,
        count,
        severity: count > 3 ? 'major' : count > 1 ? 'minor' : 'minor'
      })),
      remarks: inspection.remarks
    }
  }

  // Handler functions
  const handleView = (inspection: QualityInspection) => {
    setSelectedInspection(inspection)
    setIsViewOpen(true)
  }

  const handleEdit = (inspection: QualityInspection) => {
    setSelectedInspection(inspection)
    setIsEditOpen(true)
  }

  const handleApprove = (inspection: QualityInspection) => {
    setSelectedInspection(inspection)
    setIsApproveOpen(true)
  }

  const handleExport = () => {
    setIsExportOpen(true)
  }

  const handleViewClose = () => {
    setIsViewOpen(false)
    setSelectedInspection(null)
  }

  const handleEditSubmit = async (data: Inspection) => {
    try {
      const id = (data as any).id ?? selectedInspection?.inspection_id
      if (id != null) {
        await ProductionOrphanService.updateNcr(String(id), data as any)
      }
    } catch (err) {
      console.error('Error updating inspection:', err)
    } finally {
      setIsEditOpen(false)
      setSelectedInspection(null)
      setRefreshKey((k) => k + 1)
    }
  }

  const handleApproveSubmit = (decision: 'approve' | 'reject' | 'request-changes', comments: string, signature: string) => {
    if (selectedInspection) {
      const nextStatus: QualityInspection['pass_fail_status'] =
        decision === 'approve' ? 'passed' : decision === 'reject' ? 'failed' : 'conditional'
      setInspections(prev =>
        prev.map(i =>
          i.id === selectedInspection.id
            ? { ...i, pass_fail_status: nextStatus, remarks: comments || i.remarks }
            : i,
        ),
      )
    }
    setIsApproveOpen(false)
    setSelectedInspection(null)
  }

  const handleExportSubmit = (_data: any) => {
    exportToCsv('quality-inspections', filteredInspections as unknown as Record<string, unknown>[])
  }

  return (
    <div className="w-full min-h-screen px-3 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending Inspections</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{pendingInspections}</p>
            </div>
            <ClipboardCheck className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Passed</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{passedInspections}</p>
            </div>
            <CheckIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Failed</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{failedInspections}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Pass Rate</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{passRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by Inspection ID, Work Order, Product, Inspector..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                    <option value="conditional">Conditional</option>
                  </select>
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    value={inspectionTypeFilter}
                    onChange={(e) => setInspectionTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="in_process">In Process</option>
                    <option value="final">Final</option>
                    <option value="first_article">First Article</option>
                    <option value="receiving">Receiving</option>
                    <option value="audit">Audit</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export Report
            </button>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-24rem)]">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inspection ID
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Work Order
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inspection Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inspection Date
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inspector Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sample Size
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Defects Found
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pass/Fail Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedInspections.map((inspection) => (
                <tr key={inspection.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{inspection.inspection_id}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{inspection.work_order_id}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900">{inspection.product_name}</div>
                    <div className="text-sm text-gray-500">{inspection.product_code}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getInspectionTypeColor(inspection.inspection_type)}`}>
                      {inspection.inspection_type.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{inspection.inspection_date}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{inspection.inspector_name}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{inspection.sample_size}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{inspection.defects_found}</div>
                      {inspection.defects_found > 0 && (
                        <div className="text-xs text-gray-500">
                          {Object.entries(inspection.defect_categories).map(([category, count]) => (
                            <span key={category} className="mr-1">{category}: {count}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(inspection.pass_fail_status)}`}>
                      {inspection.pass_fail_status}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(inspection)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Inspection"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(inspection)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Edit Inspection"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      {inspection.pass_fail_status === 'pending' && (
                        <button
                          onClick={() => handleApprove(inspection)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve Inspection"
                        >
                          <CheckIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-3 py-2 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(startIndex + itemsPerPage, filteredInspections.length)}
              </span>{' '}
              of <span className="font-medium">{filteredInspections.length}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Components */}
      <ViewInspectionModal
        isOpen={isViewOpen}
        onClose={handleViewClose}
        inspection={selectedInspection ? convertToModalInspection(selectedInspection) : null}
        onEdit={(inspection) => {
          const qualityInspection = inspections.find(i => i.inspection_id === inspection.id)
          if (qualityInspection) {
            handleEdit(qualityInspection)
          }
        }}
      />

      <EditInspectionModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false)
          setSelectedInspection(null)
        }}
        onSave={handleEditSubmit}
        inspection={selectedInspection ? convertToModalInspection(selectedInspection) : null}
      />

      <ApproveInspectionModal
        isOpen={isApproveOpen}
        onClose={() => {
          setIsApproveOpen(false)
          setSelectedInspection(null)
        }}
        onApprove={handleApproveSubmit}
        inspection={selectedInspection ? convertToModalInspection(selectedInspection) : null}
      />

      <ExportInspectionReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExportSubmit}
      />
    </div>
  )
}

export default ProductionQualityPage
