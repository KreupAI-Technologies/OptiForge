'use client'

import { useState, useEffect } from 'react'
import { SupportSoftwareAssetService } from '@/services/support.service'
import { Package, Shield, Cloud, Code, Database, CheckCircle, AlertCircle, XCircle, Calendar, DollarSign, Users, TrendingUp, Eye, Edit, RefreshCw, Search, Plus, Filter } from 'lucide-react'

interface SoftwareAsset {
  id: string
  name: string
  vendor: string
  category: 'Operating System' | 'Productivity' | 'Development' | 'Security' | 'Database' | 'Cloud Service' | 'Other'
  version: string
  licenseType: 'Perpetual' | 'Subscription' | 'Open Source' | 'Trial' | 'Enterprise'
  licenses: {
    total: number
    used: number
    available: number
  }
  cost: {
    perLicense: number
    totalAnnual: number
    billingCycle: 'Monthly' | 'Annual' | 'One-time'
  }
  deployment: {
    type: 'On-Premise' | 'Cloud' | 'Hybrid'
    installCount: number
    lastDeployed: string
  }
  contract: {
    startDate: string
    renewalDate: string
    vendor: string
    contactPerson: string
    contactEmail: string
  }
  compliance: {
    status: 'Compliant' | 'Warning' | 'Non-Compliant'
    lastAudit: string
    nextAudit: string
  }
  support: {
    level: 'Basic' | 'Standard' | 'Premium' | 'Enterprise'
    expiryDate: string
    supportHours: string
  }
}

export default function SoftwareAssets() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedCompliance, setSelectedCompliance] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSoftware, setSelectedSoftware] = useState<SoftwareAsset | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const seedSoftwareAssets: SoftwareAsset[] = [
    {
      id: '1',
      name: 'Microsoft Office 365',
      vendor: 'Microsoft',
      category: 'Productivity',
      version: 'Enterprise E5',
      licenseType: 'Subscription',
      licenses: { total: 150, used: 142, available: 8 },
      cost: { perLicense: 35, totalAnnual: 63000, billingCycle: 'Annual' },
      deployment: { type: 'Cloud', installCount: 142, lastDeployed: '2024-10-01' },
      contract: {
        startDate: '2024-01-01',
        renewalDate: '2025-01-01',
        vendor: 'Microsoft Corporation',
        contactPerson: 'John Smith',
        contactEmail: 'john.smith@microsoft.com'
      },
      compliance: { status: 'Compliant', lastAudit: '2024-09-15', nextAudit: '2025-03-15' },
      support: { level: 'Enterprise', expiryDate: '2025-01-01', supportHours: '24/7' }
    },
    {
      id: '2',
      name: 'Windows Server 2022',
      vendor: 'Microsoft',
      category: 'Operating System',
      version: '2022 Datacenter',
      licenseType: 'Enterprise',
      licenses: { total: 20, used: 18, available: 2 },
      cost: { perLicense: 1200, totalAnnual: 24000, billingCycle: 'Annual' },
      deployment: { type: 'On-Premise', installCount: 18, lastDeployed: '2024-09-20' },
      contract: {
        startDate: '2023-11-01',
        renewalDate: '2024-11-01',
        vendor: 'Microsoft Corporation',
        contactPerson: 'Sarah Johnson',
        contactEmail: 'sarah.j@microsoft.com'
      },
      compliance: { status: 'Warning', lastAudit: '2024-08-01', nextAudit: '2024-11-01' },
      support: { level: 'Premium', expiryDate: '2024-11-01', supportHours: 'Business Hours' }
    },
    {
      id: '3',
      name: 'JetBrains IntelliJ IDEA',
      vendor: 'JetBrains',
      category: 'Development',
      version: '2024.2 Ultimate',
      licenseType: 'Subscription',
      licenses: { total: 50, used: 48, available: 2 },
      cost: { perLicense: 149, totalAnnual: 7450, billingCycle: 'Annual' },
      deployment: { type: 'On-Premise', installCount: 48, lastDeployed: '2024-09-15' },
      contract: {
        startDate: '2024-03-01',
        renewalDate: '2025-03-01',
        vendor: 'JetBrains s.r.o.',
        contactPerson: 'Developer Relations',
        contactEmail: 'sales@jetbrains.com'
      },
      compliance: { status: 'Compliant', lastAudit: '2024-09-01', nextAudit: '2025-03-01' },
      support: { level: 'Standard', expiryDate: '2025-03-01', supportHours: 'Business Hours' }
    },
    {
      id: '4',
      name: 'CrowdStrike Falcon',
      vendor: 'CrowdStrike',
      category: 'Security',
      version: 'Enterprise EDR',
      licenseType: 'Subscription',
      licenses: { total: 200, used: 198, available: 2 },
      cost: { perLicense: 84, totalAnnual: 16800, billingCycle: 'Annual' },
      deployment: { type: 'Cloud', installCount: 198, lastDeployed: '2024-10-10' },
      contract: {
        startDate: '2024-06-01',
        renewalDate: '2025-06-01',
        vendor: 'CrowdStrike Inc.',
        contactPerson: 'Security Team',
        contactEmail: 'enterprise@crowdstrike.com'
      },
      compliance: { status: 'Compliant', lastAudit: '2024-09-20', nextAudit: '2025-03-20' },
      support: { level: 'Enterprise', expiryDate: '2025-06-01', supportHours: '24/7' }
    },
    {
      id: '5',
      name: 'Oracle Database 19c',
      vendor: 'Oracle',
      category: 'Database',
      version: '19c Enterprise Edition',
      licenseType: 'Perpetual',
      licenses: { total: 10, used: 8, available: 2 },
      cost: { perLicense: 17500, totalAnnual: 35000, billingCycle: 'Annual' },
      deployment: { type: 'On-Premise', installCount: 8, lastDeployed: '2024-08-15' },
      contract: {
        startDate: '2023-01-15',
        renewalDate: '2025-01-15',
        vendor: 'Oracle Corporation',
        contactPerson: 'Enterprise Sales',
        contactEmail: 'enterprise@oracle.com'
      },
      compliance: { status: 'Compliant', lastAudit: '2024-07-15', nextAudit: '2025-01-15' },
      support: { level: 'Premium', expiryDate: '2025-01-15', supportHours: 'Business Hours' }
    },
    {
      id: '6',
      name: 'Adobe Creative Cloud',
      vendor: 'Adobe',
      category: 'Productivity',
      version: 'All Apps',
      licenseType: 'Subscription',
      licenses: { total: 25, used: 25, available: 0 },
      cost: { perLicense: 54.99, totalAnnual: 16497, billingCycle: 'Monthly' },
      deployment: { type: 'Cloud', installCount: 25, lastDeployed: '2024-10-05' },
      contract: {
        startDate: '2024-02-01',
        renewalDate: '2025-02-01',
        vendor: 'Adobe Inc.',
        contactPerson: 'Creative Team',
        contactEmail: 'team@adobe.com'
      },
      compliance: { status: 'Warning', lastAudit: '2024-08-15', nextAudit: '2024-11-15' },
      support: { level: 'Standard', expiryDate: '2025-02-01', supportHours: 'Business Hours' }
    },
    {
      id: '7',
      name: 'Slack Enterprise Grid',
      vendor: 'Salesforce',
      category: 'Cloud Service',
      version: 'Enterprise Grid',
      licenseType: 'Subscription',
      licenses: { total: 180, used: 165, available: 15 },
      cost: { perLicense: 12.5, totalAnnual: 27000, billingCycle: 'Annual' },
      deployment: { type: 'Cloud', installCount: 165, lastDeployed: '2024-10-12' },
      contract: {
        startDate: '2024-04-01',
        renewalDate: '2025-04-01',
        vendor: 'Slack Technologies',
        contactPerson: 'Enterprise Success',
        contactEmail: 'enterprise@slack.com'
      },
      compliance: { status: 'Compliant', lastAudit: '2024-09-01', nextAudit: '2025-03-01' },
      support: { level: 'Enterprise', expiryDate: '2025-04-01', supportHours: '24/7' }
    },
    {
      id: '8',
      name: 'VMware vSphere',
      vendor: 'VMware',
      category: 'Other',
      version: '8.0 Enterprise Plus',
      licenseType: 'Subscription',
      licenses: { total: 30, used: 28, available: 2 },
      cost: { perLicense: 995, totalAnnual: 29850, billingCycle: 'Annual' },
      deployment: { type: 'On-Premise', installCount: 28, lastDeployed: '2024-09-25' },
      contract: {
        startDate: '2024-07-01',
        renewalDate: '2025-07-01',
        vendor: 'VMware by Broadcom',
        contactPerson: 'Enterprise Support',
        contactEmail: 'support@vmware.com'
      },
      compliance: { status: 'Non-Compliant', lastAudit: '2024-06-01', nextAudit: '2024-12-01' },
      support: { level: 'Premium', expiryDate: '2025-07-01', supportHours: '24/7' }
    }
  ]

  const [softwareAssets, setSoftwareAssets] = useState<SoftwareAsset[]>(seedSoftwareAssets)

  useEffect(() => {
    let cancelled = false
    SupportSoftwareAssetService.getAssets()
      .then((rows) => {
        if (!cancelled && Array.isArray(rows) && rows.length > 0) {
          setSoftwareAssets(rows as unknown as SoftwareAsset[])
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const stats = {
    totalSoftware: softwareAssets.length,
    totalLicenses: softwareAssets.reduce((sum, s) => sum + s.licenses.total, 0),
    usedLicenses: softwareAssets.reduce((sum, s) => sum + s.licenses.used, 0),
    totalAnnualCost: softwareAssets.reduce((sum, s) => sum + s.cost.totalAnnual, 0),
    compliant: softwareAssets.filter(s => s.compliance.status === 'Compliant').length,
    nonCompliant: softwareAssets.filter(s => s.compliance.status === 'Non-Compliant').length
  }

  const categoryIcons = {
    'Operating System': Shield,
    'Productivity': Package,
    'Development': Code,
    'Security': Shield,
    'Database': Database,
    'Cloud Service': Cloud,
    'Other': Package
  }

  const filteredSoftware = softwareAssets.filter(software => {
    const matchesCategory = selectedCategory === 'All' || software.category === selectedCategory
    const matchesCompliance = selectedCompliance === 'All' || software.compliance.status === selectedCompliance
    const matchesSearch = software.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      software.vendor.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesCompliance && matchesSearch
  })

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'Compliant': return 'bg-green-100 text-green-700'
      case 'Warning': return 'bg-yellow-100 text-yellow-700'
      case 'Non-Compliant': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 95) return 'text-red-600'
    if (percentage >= 85) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Software Assets</h1>
          <p className="text-gray-600 mt-1">Manage software licenses and compliance</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-5 w-5" />
          Add Software
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-6 gap-2">
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Software</p>
              <p className="text-2xl font-bold mt-1">{stats.totalSoftware}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Licenses</p>
              <p className="text-2xl font-bold mt-1">{stats.totalLicenses}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Used Licenses</p>
              <p className="text-2xl font-bold mt-1">{stats.usedLicenses}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Annual Cost</p>
              <p className="text-2xl font-bold mt-1">${(stats.totalAnnualCost / 1000).toFixed(0)}k</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Compliant</p>
              <p className="text-2xl font-bold mt-1">{stats.compliant}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Non-Compliant</p>
              <p className="text-2xl font-bold mt-1">{stats.nonCompliant}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by software name or vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Categories</option>
            <option value="Operating System">Operating System</option>
            <option value="Productivity">Productivity</option>
            <option value="Development">Development</option>
            <option value="Security">Security</option>
            <option value="Database">Database</option>
            <option value="Cloud Service">Cloud Service</option>
            <option value="Other">Other</option>
          </select>
          <select
            value={selectedCompliance}
            onChange={(e) => setSelectedCompliance(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Compliance</option>
            <option value="Compliant">Compliant</option>
            <option value="Warning">Warning</option>
            <option value="Non-Compliant">Non-Compliant</option>
          </select>
        </div>
      </div>

      {/* Software Cards */}
      <div className="grid grid-cols-2 gap-2">
        {filteredSoftware.map((software) => {
          const Icon = categoryIcons[software.category]
          const utilizationPercentage = Math.round((software.licenses.used / software.licenses.total) * 100)
          
          return (
            <div key={software.id} className="bg-white rounded-lg shadow-sm border p-3">
              {/* Software Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{software.name}</h3>
                    <p className="text-sm text-gray-600">{software.vendor}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplianceColor(software.compliance.status)}`}>
                  {software.compliance.status}
                </span>
              </div>

              {/* Version & Type */}
              <div className="grid grid-cols-2 gap-3 mb-2 pb-4 border-b">
                <div>
                  <p className="text-xs text-gray-600">Version</p>
                  <p className="text-sm font-medium">{software.version}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">License Type</p>
                  <p className="text-sm font-medium">{software.licenseType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Category</p>
                  <p className="text-sm font-medium">{software.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Deployment</p>
                  <p className="text-sm font-medium">{software.deployment.type}</p>
                </div>
              </div>

              {/* License Usage */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">License Usage</span>
                  <span className={`text-sm font-bold ${getUtilizationColor(utilizationPercentage)}`}>
                    {utilizationPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      utilizationPercentage >= 95 ? 'bg-red-500' :
                      utilizationPercentage >= 85 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${utilizationPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{software.licenses.used} used</span>
                  <span>{software.licenses.available} available</span>
                </div>
              </div>

              {/* Cost & Contract */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div>
                  <p className="text-xs text-gray-600">Annual Cost</p>
                  <p className="text-lg font-bold">${software.cost.totalAnnual.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Renewal Date</p>
                  <p className="text-sm font-medium">{software.contract.renewalDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Per License</p>
                  <p className="text-sm font-medium">${software.cost.perLicense}/
                    {software.cost.billingCycle === 'Monthly' ? 'mo' : 
                     software.cost.billingCycle === 'Annual' ? 'yr' : 'once'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Support Level</p>
                  <p className="text-sm font-medium">{software.support.level}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedSoftware(software)
                    setShowDetailModal(true)
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Renew
                </button>
              </div>

              {/* Alerts */}
              {software.licenses.available === 0 && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded p-2 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700">No licenses available. Consider purchasing more.</p>
                </div>
              )}
              {software.compliance.status === 'Non-Compliant' && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded p-2 flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700">Non-compliant status requires immediate attention.</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedSoftware && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = categoryIcons[selectedSoftware.category]
                  return (
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                  )
                })()}
                <div>
                  <h2 className="text-xl font-semibold">{selectedSoftware.name}</h2>
                  <p className="text-sm text-gray-600">{selectedSoftware.vendor}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-3">
              {/* License Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">License Information</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Total Licenses</p>
                    <p className="text-2xl font-bold">{selectedSoftware.licenses.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Used Licenses</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedSoftware.licenses.used}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="text-2xl font-bold text-green-600">{selectedSoftware.licenses.available}</p>
                  </div>
                </div>
              </div>

              {/* Cost Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Cost Details</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Per License</p>
                    <p className="font-medium">${selectedSoftware.cost.perLicense}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Annual Cost</p>
                    <p className="font-medium">${selectedSoftware.cost.totalAnnual.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Billing Cycle</p>
                    <p className="font-medium">{selectedSoftware.cost.billingCycle}</p>
                  </div>
                </div>
              </div>

              {/* Contract Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Contract Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium">{selectedSoftware.contract.startDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Renewal Date</p>
                    <p className="font-medium">{selectedSoftware.contract.renewalDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact Person</p>
                    <p className="font-medium">{selectedSoftware.contract.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact Email</p>
                    <p className="font-medium">{selectedSoftware.contract.contactEmail}</p>
                  </div>
                </div>
              </div>

              {/* Deployment Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Deployment Details</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Deployment Type</p>
                    <p className="font-medium">{selectedSoftware.deployment.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Install Count</p>
                    <p className="font-medium">{selectedSoftware.deployment.installCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Deployed</p>
                    <p className="font-medium">{selectedSoftware.deployment.lastDeployed}</p>
                  </div>
                </div>
              </div>

              {/* Compliance Status */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Compliance Status</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getComplianceColor(selectedSoftware.compliance.status)}`}>
                      {selectedSoftware.compliance.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Audit</p>
                    <p className="font-medium">{selectedSoftware.compliance.lastAudit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Next Audit</p>
                    <p className="font-medium">{selectedSoftware.compliance.nextAudit}</p>
                  </div>
                </div>
              </div>

              {/* Support Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Support Information</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-sm text-gray-600">Support Level</p>
                    <p className="font-medium">{selectedSoftware.support.level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Support Hours</p>
                    <p className="font-medium">{selectedSoftware.support.supportHours}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Support Expiry</p>
                    <p className="font-medium">{selectedSoftware.support.expiryDate}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit Software
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Manage Licenses
                </button>
                <button className="px-4 py-2 border border-green-300 text-green-600 rounded-lg hover:bg-green-50">
                  Renew Contract
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
