'use client'

import { useEffect, useState } from 'react'
import {
  CheckCircle, XCircle, Zap, Shield, Cloud, Globe, Smartphone,
  BarChart, Settings, Code, Package, HelpCircle
} from 'lucide-react'
import { ItAdminService, LicenseFeatureDto } from '@/services/it-admin.service'

interface Feature {
  id: string
  name: string
  category: string
  description: string
  licensed: boolean
  icon: any
  tier: 'Basic' | 'Standard' | 'Enterprise' | 'Premium'
  limitations?: string
}

interface FeatureCategory {
  name: string
  description: string
  features: Feature[]
}

const ICON_BY_CATEGORY: Record<string, any> = {
  Core: Globe,
  Analytics: BarChart,
  Security: Shield,
  Integration: Code,
  Infrastructure: Cloud,
  Mobile: Smartphone,
  Customization: Settings,
  Support: HelpCircle
}

const VALID_TIERS: Feature['tier'][] = ['Basic', 'Standard', 'Enterprise', 'Premium']

const normalizeTier = (tier?: string): Feature['tier'] =>
  (VALID_TIERS.includes(tier as Feature['tier']) ? tier : 'Basic') as Feature['tier']

const groupFeatures = (dtos: LicenseFeatureDto[]): FeatureCategory[] => {
  const byCategory = new Map<string, Feature[]>()

  dtos.forEach((dto) => {
    const feature: Feature = {
      id: dto.id,
      name: dto.name,
      category: dto.category,
      description: dto.description ?? '',
      licensed: dto.included,
      icon: ICON_BY_CATEGORY[dto.category] ?? Package,
      tier: normalizeTier(dto.tier),
      limitations:
        dto.usageLimit !== undefined
          ? `Limited to ${dto.usageLimit} (used ${dto.usageCount})`
          : undefined
    }

    const existing = byCategory.get(dto.category)
    if (existing) {
      existing.push(feature)
    } else {
      byCategory.set(dto.category, [feature])
    }
  })

  return Array.from(byCategory.entries()).map(([name, features]) => ({
    name,
    description: `${name} features`,
    features
  }))
}

export default function LicenseFeatures() {
  const [selectedTier, setSelectedTier] = useState('all')
  const [categories, setCategories] = useState<FeatureCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadFeatures = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const features = await ItAdminService.getLicenseFeatures()
        if (active) {
          setCategories(groupFeatures(features))
        }
      } catch (err) {
        if (active) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load license features')
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadFeatures()

    return () => {
      active = false
    }
  }, [])

  const allFeatures = categories.flatMap(cat => cat.features)

  const filteredFeatures = selectedTier === 'all'
    ? allFeatures
    : allFeatures.filter(f => f.tier === selectedTier)

  const stats = {
    totalFeatures: allFeatures.length,
    licensedFeatures: allFeatures.filter(f => f.licensed).length,
    enterpriseFeatures: allFeatures.filter(f => f.tier === 'Enterprise').length,
    premiumFeatures: allFeatures.filter(f => f.tier === 'Premium').length
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Basic':
        return 'text-gray-600 bg-gray-50'
      case 'Standard':
        return 'text-blue-600 bg-blue-50'
      case 'Enterprise':
        return 'text-purple-600 bg-purple-50'
      case 'Premium':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="p-6 space-y-3">
      {isLoading && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Loading...
        </div>
      )}
      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Licensed Features</h1>
          <p className="text-gray-600 mt-1">View all available features and capabilities in your license</p>
        </div>
        <div>
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Tiers</option>
            <option value="Basic">Basic</option>
            <option value="Standard">Standard</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Premium">Premium</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Features</p>
              <p className="text-3xl font-bold mt-1">{stats.totalFeatures}</p>
            </div>
            <Zap className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Licensed Features</p>
              <p className="text-3xl font-bold mt-1">{stats.licensedFeatures}</p>
            </div>
            <CheckCircle className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Enterprise Features</p>
              <p className="text-3xl font-bold mt-1">{stats.enterpriseFeatures}</p>
            </div>
            <Shield className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Premium Features</p>
              <p className="text-3xl font-bold mt-1">{stats.premiumFeatures}</p>
            </div>
            <Zap className="h-12 w-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Feature Categories */}
      {categories.map((category) => {
        const categoryFeatures = selectedTier === 'all'
          ? category.features
          : category.features.filter(f => f.tier === selectedTier)

        if (categoryFeatures.length === 0) return null

        return (
          <div key={category.name} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{category.description}</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {categoryFeatures.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <div
                      key={feature.id}
                      className={`border-2 rounded-lg p-3 transition-all ${
                        feature.licensed
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg ${
                          feature.licensed ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            feature.licensed ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTierColor(feature.tier)}`}>
                            {feature.tier}
                          </span>
                          {feature.licensed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        {feature.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-3">
                        {feature.description}
                      </p>

                      {feature.limitations && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                            <strong>Limitation:</strong> {feature.limitations}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}

      {/* License Tier Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">License Tier Comparison</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="border-2 border-gray-300 rounded-lg p-3">
            <div className="text-center mb-2">
              <h3 className="text-xl font-bold text-gray-900">Basic</h3>
              <p className="text-sm text-gray-600 mt-1">Essential features</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Core modules</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Basic reporting</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <XCircle className="h-4 w-4" />
                <span>API access</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <XCircle className="h-4 w-4" />
                <span>Cloud backup</span>
              </div>
            </div>
          </div>

          <div className="border-2 border-blue-500 rounded-lg p-3 bg-blue-50">
            <div className="text-center mb-2">
              <h3 className="text-xl font-bold text-blue-900">Standard</h3>
              <p className="text-sm text-blue-700 mt-1">Full functionality</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>All Basic features</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Advanced reporting</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Custom fields</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <XCircle className="h-4 w-4" />
                <span>SSO integration</span>
              </div>
            </div>
          </div>

          <div className="border-2 border-purple-500 rounded-lg p-3 bg-purple-50">
            <div className="text-center mb-2">
              <h3 className="text-xl font-bold text-purple-900">Enterprise</h3>
              <p className="text-sm text-purple-700 mt-1">Large organizations</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>All Standard features</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Full API access</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>SSO integration</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Priority support</span>
              </div>
            </div>
          </div>

          <div className="border-2 border-yellow-500 rounded-lg p-3 bg-yellow-50">
            <div className="text-center mb-2">
              <h3 className="text-xl font-bold text-yellow-900">Premium</h3>
              <p className="text-sm text-yellow-700 mt-1">Ultimate package</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>All Enterprise features</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>High availability</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>CDN distribution</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Account manager</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
