'use client'

import { useState, useEffect } from 'react'
import {
  Award, Key, Users, Calendar, AlertCircle, CheckCircle,
  TrendingUp, Clock, RefreshCw, Download, Shield, Zap
} from 'lucide-react'
import { ItAdminService } from '@/services/it-admin.service'
import { exportToCsv } from '@/lib/export'

interface LicenseInfo {
  type: string
  status: 'active' | 'expiring' | 'expired'
  totalLicenses: number
  usedLicenses: number
  availableLicenses: number
  expiryDate: string
  daysRemaining: number
  purchaseDate: string
  licenseKey: string
  activationDate: string
}

interface ModuleAccess {
  id: string
  name: string
  category: string
  licensed: boolean
  inUse: number
  available: number
}

export default function LicenseManagement() {
  const [licenseInfo] = useState<LicenseInfo>({
    type: 'Enterprise',
    status: 'active',
    totalLicenses: 500,
    usedLicenses: 387,
    availableLicenses: 113,
    expiryDate: '2025-12-31',
    daysRemaining: 437,
    purchaseDate: '2024-01-01',
    licenseKey: 'XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX',
    activationDate: '2024-01-05'
  })

  const [modules, setModules] = useState<ModuleAccess[]>([])

  useEffect(() => {
    let cancelled = false
    ItAdminService.getLicenseFeatures()
      .then((data) => {
        if (cancelled) return
        const mapped: ModuleAccess[] = (data ?? []).map((dto) => ({
          id: dto.id,
          name: dto.name,
          category: dto.category,
          licensed: dto.included,
          inUse: dto.usageCount ?? 0,
          available: dto.usageLimit ?? 0,
        }))
        setModules(mapped)
      })
      .catch(() => {
        if (!cancelled) setModules([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const [features] = useState([
    { name: 'Multi-Company Support', enabled: true },
    { name: 'Advanced Reporting', enabled: true },
    { name: 'API Access', enabled: true },
    { name: 'Mobile Application', enabled: true },
    { name: 'Custom Workflows', enabled: true },
    { name: 'Data Export/Import', enabled: true },
    { name: 'SSO Integration', enabled: true },
    { name: 'Audit Logging', enabled: true },
    { name: 'Real-time Sync', enabled: true },
    { name: 'Cloud Backup', enabled: true },
    { name: '24/7 Support', enabled: true },
    { name: 'Dedicated Account Manager', enabled: true }
  ])

  const [usageHistory] = useState([
    { month: 'October 2024', users: 387, percentage: 77.4 },
    { month: 'September 2024', users: 372, percentage: 74.4 },
    { month: 'August 2024', users: 358, percentage: 71.6 },
    { month: 'July 2024', users: 345, percentage: 69.0 },
    { month: 'June 2024', users: 332, percentage: 66.4 },
    { month: 'May 2024', users: 318, percentage: 63.6 }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50'
      case 'expiring':
        return 'text-yellow-600 bg-yellow-50'
      case 'expired':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const utilizationPercentage = (licenseInfo.usedLicenses / licenseInfo.totalLicenses) * 100

  // Download is a client-side export — no license-document store exists.
  const handleDownloadReport = () => {
    exportToCsv(
      'license-report',
      modules as unknown as Record<string, unknown>[],
    )
  }

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">License Management</h1>
          <p className="text-gray-600 mt-1">Manage your software licenses and monitor usage</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDownloadReport} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4 inline mr-2" />
            Download Report
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:from-purple-700 hover:to-blue-700">
            <RefreshCw className="h-4 w-4 inline mr-2" />
            Renew License
          </button>
        </div>
      </div>

      {/* License Overview */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-8">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Award className="h-8 w-8" />
              <h2 className="text-2xl font-bold">{licenseInfo.type} License</h2>
            </div>
            <p className="text-sm opacity-90">Active license with full feature access</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(licenseInfo.status)} text-gray-900 bg-white`}>
            {licenseInfo.status.charAt(0).toUpperCase() + licenseInfo.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 opacity-80" />
              <p className="text-sm opacity-90">Total Licenses</p>
            </div>
            <p className="text-3xl font-bold">{licenseInfo.totalLicenses}</p>
          </div>

          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 opacity-80" />
              <p className="text-sm opacity-90">Used</p>
            </div>
            <p className="text-3xl font-bold">{licenseInfo.usedLicenses}</p>
            <p className="text-xs opacity-75 mt-1">{utilizationPercentage.toFixed(1)}% utilized</p>
          </div>

          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 opacity-80" />
              <p className="text-sm opacity-90">Available</p>
            </div>
            <p className="text-3xl font-bold">{licenseInfo.availableLicenses}</p>
          </div>

          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 opacity-80" />
              <p className="text-sm opacity-90">Days Remaining</p>
            </div>
            <p className="text-3xl font-bold">{licenseInfo.daysRemaining}</p>
            <p className="text-xs opacity-75 mt-1">Until {licenseInfo.expiryDate}</p>
          </div>
        </div>

        <div className="mt-6 p-3 bg-white bg-opacity-10 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">License Utilization</span>
            <span className="text-sm font-medium">{utilizationPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
            <div
              className="bg-white rounded-full h-3 transition-all"
              style={{ width: `${utilizationPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* License Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-3">
            <Key className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">License Details</h2>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">License Type</span>
              <span className="text-sm font-medium text-gray-900">{licenseInfo.type}</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">License Key</span>
              <code className="text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded">
                {licenseInfo.licenseKey}
              </code>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Purchase Date</span>
              <span className="text-sm font-medium text-gray-900">{licenseInfo.purchaseDate}</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Activation Date</span>
              <span className="text-sm font-medium text-gray-900">{licenseInfo.activationDate}</span>
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Expiry Date</span>
              <span className="text-sm font-medium text-gray-900">{licenseInfo.expiryDate}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(licenseInfo.status)}`}>
                {licenseInfo.status.charAt(0).toUpperCase() + licenseInfo.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Usage History (6 Months)</h2>
          </div>

          <div className="space-y-3">
            {usageHistory.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{item.month}</span>
                  <span className="font-medium text-gray-900">
                    {item.users} users ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full h-2 transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Module Access */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Module Access</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Licensed modules and their usage</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilization
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {modules.map((module) => {
                const moduleUtilization = (module.inUse / module.available) * 100
                return (
                  <tr key={module.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                        <div className="text-sm font-medium text-gray-900">{module.name}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">
                      {module.category}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Licensed
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {module.inUse} / {module.available}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 rounded-full h-2"
                            style={{ width: `${moduleUtilization}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {moduleUtilization.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Licensed Features */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-5 w-5 text-yellow-600" />
          <h2 className="text-lg font-semibold text-gray-900">Licensed Features</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900">{feature.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-2">License Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your Enterprise license is valid until {licenseInfo.expiryDate}</li>
              <li>• You have {licenseInfo.availableLicenses} available user licenses out of {licenseInfo.totalLicenses} total</li>
              <li>• All modules and features are currently licensed and accessible</li>
              <li>• Contact your account manager to add more user licenses or extend your subscription</li>
              <li>• License renewal notifications will be sent 60 days before expiry</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
