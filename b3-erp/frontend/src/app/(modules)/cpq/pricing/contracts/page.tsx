'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'
import { ContractModal, FilterModal, ContractPricing } from '@/components/cpq/ContractPricingModals'
import { cpqPricingService } from '@/services/cpq'

export default function CPQPricingContractsPage() {
  const router = useRouter()

  const [contracts, setContracts] = useState<ContractPricing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        // Backend returns the ContractPricing ORM shape (contractNumber,
        // discountPercentage, startDate/endDate, isActive). Collapse it into this
        // page's display model, deriving the lifecycle status from the end date.
        const raw = (await cpqPricingService.findAllContractPricing()) as any[]
        const now = Date.now()
        const soonMs = 60 * 24 * 60 * 60 * 1000 // 60 days
        const mapped = (raw ?? []).map((c) => {
          const endMs = c?.endDate ? new Date(c.endDate).getTime() : NaN
          let status: ContractPricing['status'] = 'active'
          if (c?.isActive === false) status = 'expired'
          else if (!Number.isNaN(endMs)) {
            if (endMs < now) status = 'expired'
            else if (endMs - now <= soonMs) status = 'expiring-soon'
          }
          const toDate = (d: any) => (d ? String(d).split('T')[0] : '')
          return {
            id: c?.id ?? '',
            contractName: c?.contractNumber ?? c?.contractId ?? 'Contract',
            customerId: c?.customerId ?? '',
            customerName: c?.customerName ?? c?.customerId ?? '',
            contractValue: Number(c?.committedVolume ?? c?.contractPrice ?? 0),
            discount: Number(c?.discountPercentage ?? 0),
            startDate: toDate(c?.startDate),
            endDate: toDate(c?.endDate),
            status,
            renewalDate: toDate(c?.endDate),
          } as ContractPricing
        })
        if (!cancelled) setContracts(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load contract pricing')
          setContracts([])
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

  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedContract, setSelectedContract] = useState<ContractPricing | null>(null)
  const [appliedFilters, setAppliedFilters] = useState<any>(null)

  const getStatusColor = (status: string) => {
    const colors: any = {
      active: 'bg-green-100 text-green-700 border-green-200',
      'expiring-soon': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      expired: 'bg-red-100 text-red-700 border-red-200'
    }
    return colors[status] || colors.active
  }

  const getStatusIcon = (status: string) => {
    if (status === 'active') return <CheckCircle className="h-4 w-4" />
    if (status === 'expiring-soon') return <Clock className="h-4 w-4" />
    return <AlertCircle className="h-4 w-4" />
  }

  // Handlers
  const handleAddContract = () => {
    setSelectedContract(null)
    setIsModalOpen(true)
  }

  const handleEditContract = (contract: ContractPricing) => {
    setSelectedContract(contract)
    setIsModalOpen(true)
  }

  const handleSaveContract = (contract: ContractPricing) => {
    if (selectedContract) {
      setContracts(contracts.map(c => c.id === contract.id ? contract : c))
    } else {
      setContracts([contract, ...contracts])
    }
  }

  const handleExport = () => {
    const headers = ['ID', 'Contract Name', 'Customer', 'Value', 'Discount', 'Start Date', 'End Date', 'Renewal Date', 'Status']
    const csvData = filteredContracts.map(contract => [
      contract.id,
      `"${contract.contractName}"`,
      `"${contract.customerName}"`,
      contract.contractValue,
      contract.discount,
      contract.startDate,
      contract.endDate,
      contract.renewalDate,
      contract.status
    ])

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contracts-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleApplyFilters = (filters: any) => {
    setAppliedFilters(filters)
  }

  // Filtering logic
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = searchQuery === '' ||
      contract.contractName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.id.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesFilters = true
    if (appliedFilters) {
      if (appliedFilters.status.length > 0 && !appliedFilters.status.includes(contract.status)) {
        matchesFilters = false
      }

      if (appliedFilters.discountRange.min > 0 || appliedFilters.discountRange.max > 0) {
        if (appliedFilters.discountRange.min > 0 && contract.discount < appliedFilters.discountRange.min) {
          matchesFilters = false
        }
        if (appliedFilters.discountRange.max > 0 && contract.discount > appliedFilters.discountRange.max) {
          matchesFilters = false
        }
      }

      if (appliedFilters.valueRange.min > 0 || appliedFilters.valueRange.max > 0) {
        const valueInCr = contract.contractValue / 10000000
        if (appliedFilters.valueRange.min > 0 && valueInCr < appliedFilters.valueRange.min) {
          matchesFilters = false
        }
        if (appliedFilters.valueRange.max > 0 && valueInCr > appliedFilters.valueRange.max) {
          matchesFilters = false
        }
      }
    }

    return matchesSearch && matchesFilters
  })

  const totalContractValue = filteredContracts.reduce((sum, c) => sum + c.contractValue, 0)
  const activeContracts = filteredContracts.filter(c => c.status === 'active').length
  const expiringSoon = filteredContracts.filter(c => c.status === 'expiring-soon').length

  return (
    <div className="w-full h-full px-4 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading contract pricing…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && contracts.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No contract pricing found.
        </div>
      )}
      {/* Action Buttons */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
            {appliedFilters && (appliedFilters.status.length > 0 || appliedFilters.discountRange.min > 0 || appliedFilters.valueRange.min > 0) && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                Active
              </span>
            )}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={handleAddContract}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Contract
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Contracts</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{contracts.length}</p>
              <p className="text-xs text-blue-700 mt-1">Pricing agreements</p>
            </div>
            <FileText className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Contracts</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{activeContracts}</p>
              <p className="text-xs text-green-700 mt-1">Currently in force</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-5 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{expiringSoon}</p>
              <p className="text-xs text-yellow-700 mt-1">Action needed</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Value</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                ₹{(totalContractValue / 10000000).toFixed(1)}Cr
              </p>
              <p className="text-xs text-purple-700 mt-1">Contract commitments</p>
            </div>
            <FileText className="h-10 w-10 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-3 flex gap-3">
        <button className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-200 text-sm font-medium">
          All Contracts ({contracts.length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
          Active ({activeContracts})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
          Expiring Soon ({expiringSoon})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
          Expired ({contracts.filter(c => c.status === 'expired').length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contracts..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contract Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Discount</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Renewal</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    {searchQuery || appliedFilters ? (
                      <div>
                        <p className="text-lg font-medium mb-2">No matching contracts found</p>
                        <p className="text-sm">Try adjusting your search or filter criteria</p>
                        <button
                          onClick={() => {
                            setSearchQuery('')
                            setAppliedFilters(null)
                          }}
                          className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Clear filters
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-medium mb-2">No contracts yet</p>
                        <p className="text-sm">Click "New Contract" to create your first contract</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{contract.contractName}</div>
                    <div className="text-xs text-gray-500">{contract.id}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">{contract.customerName}</div>
                    <div className="text-xs text-gray-500">{contract.customerId}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <span className="text-sm font-semibold text-blue-600">
                      ₹{(contract.contractValue / 10000000).toFixed(2)}Cr
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-lg font-bold text-green-700">{contract.discount}%</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="text-xs text-gray-700">
                      {new Date(contract.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-xs text-gray-500">to</div>
                    <div className="text-xs text-gray-700">
                      {new Date(contract.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                      <Calendar className="h-3 w-3" />
                      {new Date(contract.renewalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border ${getStatusColor(contract.status)}`}>
                      {getStatusIcon(contract.status)}
                      {contract.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleEditContract(contract)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      aria-label="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Contract Pricing Features:</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li><strong>Pre-Negotiated Terms:</strong> Fixed pricing and discounts for contract duration</li>
          <li><strong>Volume Commitments:</strong> Guaranteed pricing based on committed purchase volumes</li>
          <li><strong>Renewal Management:</strong> Automated alerts for upcoming renewals and renegotiations</li>
          <li><strong>Compliance Tracking:</strong> Monitor adherence to contract terms and pricing limits</li>
        </ul>
      </div>

      {/* Modals */}
      <ContractModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedContract(null)
        }}
        onSave={handleSaveContract}
        contract={selectedContract}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
      />
    </div>
  )
}
