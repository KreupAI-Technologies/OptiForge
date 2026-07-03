'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Edit, Truck, Package, MapPin, Clock, DollarSign, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { salesConfigService, ShippingMethodDto } from '@/services/sales-config.service'

interface ShippingMethod {
  id: string
  name: string
  carrier: string
  type: 'standard' | 'express' | 'same-day' | 'freight' | 'hand-delivery'
  deliveryDays: string
  baseRate: number
  perKgRate: number
  minWeight: number
  maxWeight: number
  freeShippingThreshold?: number
  zones: string[]
  applicableProducts: string[]
  insuranceIncluded: boolean
  trackingAvailable: boolean
  status: 'active' | 'inactive'
  usageCount: number
}

export default function ShippingSettingsPage() {
  const router = useRouter()
  const [selectedZone, setSelectedZone] = useState('all')

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = await salesConfigService.getShippingMethods()
        if (cancelled) return
        const mapped: ShippingMethod[] = (Array.isArray(raw) ? raw : []).map((m: ShippingMethodDto) => ({
          id: m.id,
          name: m.name,
          carrier: m.carrier ?? '',
          type: (m.type as ShippingMethod['type']) ?? 'standard',
          deliveryDays: m.deliveryDays ?? '',
          baseRate: Number(m.baseRate ?? 0),
          perKgRate: Number(m.perKgRate ?? 0),
          minWeight: Number(m.minWeight ?? 0),
          maxWeight: Number(m.maxWeight ?? 0),
          freeShippingThreshold: m.freeShippingThreshold != null ? Number(m.freeShippingThreshold) : undefined,
          zones: Array.isArray(m.zones) ? m.zones : [],
          applicableProducts: Array.isArray(m.applicableProducts) ? m.applicableProducts : [],
          insuranceIncluded: !!m.insuranceIncluded,
          trackingAvailable: !!m.trackingAvailable,
          status: (m.status as ShippingMethod['status']) ?? 'active',
          usageCount: Number(m.usageCount ?? 0),
        }))
        setShippingMethods(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load shipping methods')
          setShippingMethods([])
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

  const _seed: ShippingMethod[] = ([
    {
      id: 'SHIP-001',
      name: 'Standard Delivery - Kitchen Accessories',
      carrier: 'Blue Dart',
      type: 'standard',
      deliveryDays: '3-5',
      baseRate: 150,
      perKgRate: 25,
      minWeight: 0.5,
      maxWeight: 30,
      freeShippingThreshold: 5000,
      zones: ['Local', 'Zonal', 'National'],
      applicableProducts: ['Kitchen Accessories', 'Cookware', 'Small Items'],
      insuranceIncluded: true,
      trackingAvailable: true,
      status: 'active',
      usageCount: 2345
    },
    {
      id: 'SHIP-002',
      name: 'Express Delivery - Kitchen Appliances',
      carrier: 'DTDC',
      type: 'express',
      deliveryDays: '1-2',
      baseRate: 300,
      perKgRate: 40,
      minWeight: 1,
      maxWeight: 50,
      zones: ['Local', 'Metro Cities'],
      applicableProducts: ['Kitchen Appliances', 'Mixer Grinders', 'Induction Cooktops'],
      insuranceIncluded: true,
      trackingAvailable: true,
      status: 'active',
      usageCount: 567
    },
    {
      id: 'SHIP-003',
      name: 'Freight Shipping - Heavy Items',
      carrier: 'VRL Logistics',
      type: 'freight',
      deliveryDays: '5-7',
      baseRate: 500,
      perKgRate: 15,
      minWeight: 50,
      maxWeight: 500,
      zones: ['All India'],
      applicableProducts: ['Kitchen Sinks', 'Kitchen Cabinets', 'Countertops', 'Heavy Items'],
      insuranceIncluded: true,
      trackingAvailable: true,
      status: 'active',
      usageCount: 1234
    },
    {
      id: 'SHIP-004',
      name: 'Same Day Delivery - Premium',
      carrier: 'Dunzo/Porter',
      type: 'same-day',
      deliveryDays: 'Same Day',
      baseRate: 500,
      perKgRate: 50,
      minWeight: 0.5,
      maxWeight: 20,
      zones: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'],
      applicableProducts: ['Kitchen Accessories', 'Cookware', 'Small Kitchen Items'],
      insuranceIncluded: false,
      trackingAvailable: true,
      status: 'active',
      usageCount: 156
    },
    {
      id: 'SHIP-005',
      name: 'Modular Kitchen Delivery & Installation',
      carrier: 'Own Fleet',
      type: 'hand-delivery',
      deliveryDays: '7-10',
      baseRate: 2000,
      perKgRate: 0,
      minWeight: 100,
      maxWeight: 1000,
      zones: ['Local', 'Within 200km'],
      applicableProducts: ['Modular Kitchen', 'Kitchen Cabinets', 'Complete Kitchen Sets'],
      insuranceIncluded: true,
      trackingAvailable: true,
      status: 'active',
      usageCount: 89
    },
    {
      id: 'SHIP-006',
      name: 'Countertop Delivery - Specialized',
      carrier: 'Own Fleet',
      type: 'hand-delivery',
      deliveryDays: '5-7',
      baseRate: 1500,
      perKgRate: 10,
      minWeight: 50,
      maxWeight: 300,
      zones: ['Local', 'Within 100km'],
      applicableProducts: ['Countertops', 'Granite Slabs', 'Quartz Slabs'],
      insuranceIncluded: true,
      trackingAvailable: true,
      status: 'active',
      usageCount: 234
    },
    {
      id: 'SHIP-007',
      name: 'Economy Shipping - Bulk Orders',
      carrier: 'India Post',
      type: 'standard',
      deliveryDays: '7-10',
      baseRate: 100,
      perKgRate: 15,
      minWeight: 1,
      maxWeight: 35,
      freeShippingThreshold: 10000,
      zones: ['All India'],
      applicableProducts: ['Cookware', 'Kitchen Accessories', 'Bulk Orders'],
      insuranceIncluded: false,
      trackingAvailable: true,
      status: 'active',
      usageCount: 445
    },
    {
      id: 'SHIP-008',
      name: 'Premium Appliance Delivery',
      carrier: 'Professional Couriers',
      type: 'express',
      deliveryDays: '2-3',
      baseRate: 400,
      perKgRate: 35,
      minWeight: 5,
      maxWeight: 60,
      zones: ['Metro Cities', 'Tier 1 Cities'],
      applicableProducts: ['Kitchen Appliances', 'Chimney Hoods', 'Premium Products'],
      insuranceIncluded: true,
      trackingAvailable: true,
      status: 'active',
      usageCount: 678
    },
    {
      id: 'SHIP-009',
      name: 'Kitchen Faucets - Standard',
      carrier: 'Delhivery',
      type: 'standard',
      deliveryDays: '4-6',
      baseRate: 120,
      perKgRate: 20,
      minWeight: 0.5,
      maxWeight: 15,
      freeShippingThreshold: 3000,
      zones: ['All India'],
      applicableProducts: ['Kitchen Faucets', 'Taps', 'Accessories'],
      insuranceIncluded: true,
      trackingAvailable: true,
      status: 'active',
      usageCount: 891
    },
    {
      id: 'SHIP-010',
      name: 'Fragile Items - Special Care',
      carrier: 'FedEx',
      type: 'express',
      deliveryDays: '2-4',
      baseRate: 350,
      perKgRate: 45,
      minWeight: 1,
      maxWeight: 30,
      zones: ['All India'],
      applicableProducts: ['Glass Cookware', 'Ceramic Items', 'Fragile Products'],
      insuranceIncluded: true,
      trackingAvailable: true,
      status: 'active',
      usageCount: 234
    },
    {
      id: 'SHIP-011',
      name: 'Weekend Delivery - Extra Charge',
      carrier: 'Multiple Carriers',
      type: 'express',
      deliveryDays: '1-2',
      baseRate: 600,
      perKgRate: 60,
      minWeight: 0.5,
      maxWeight: 40,
      zones: ['Major Cities'],
      applicableProducts: ['All Products'],
      insuranceIncluded: true,
      trackingAvailable: true,
      status: 'inactive',
      usageCount: 45
    }
  ])

  const zones = ['all', 'Local', 'Zonal', 'Metro Cities', 'National', 'All India']

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'standard':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'express':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'same-day':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'freight':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'hand-delivery':
        return 'bg-pink-100 text-pink-700 border-pink-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const filteredMethods = shippingMethods.filter(method =>
    selectedZone === 'all' || method.zones.includes(selectedZone)
  )

  const stats = {
    totalMethods: shippingMethods.filter(m => m.status === 'active').length,
    avgDeliveryDays: 4.5,
    withFreeShipping: shippingMethods.filter(m => m.freeShippingThreshold && m.status === 'active').length,
    totalShipments: shippingMethods.reduce((sum, m) => sum + m.usageCount, 0)
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Inline Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shipping Settings</h1>
            <p className="text-sm text-gray-600 mt-1">Configure shipping methods and rates for kitchen products</p>
          </div>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Shipping Method
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Shipping Methods</p>
              <p className="text-3xl font-bold mt-1">{stats.totalMethods}</p>
              <p className="text-xs text-blue-100 mt-1">Active options</p>
            </div>
            <Truck className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">Avg Delivery</p>
              <p className="text-3xl font-bold mt-1">{stats.avgDeliveryDays}</p>
              <p className="text-xs text-green-100 mt-1">Days average</p>
            </div>
            <Clock className="h-10 w-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-100">Free Shipping</p>
              <p className="text-3xl font-bold mt-1">{stats.withFreeShipping}</p>
              <p className="text-xs text-purple-100 mt-1">Options available</p>
            </div>
            <DollarSign className="h-10 w-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-100">Total Shipments</p>
              <p className="text-3xl font-bold mt-1">{(stats.totalShipments / 1000).toFixed(1)}K</p>
              <p className="text-xs text-orange-100 mt-1">Delivered orders</p>
            </div>
            <Package className="h-10 w-10 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Zone Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="flex flex-wrap gap-2">
          {zones.map(zone => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedZone === zone
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {zone === 'all' ? 'All Zones' : zone}
            </button>
          ))}
        </div>
      </div>

      {/* Shipping Methods Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filteredMethods.map((method) => (
          <div key={method.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">{method.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{method.carrier}</span>
                    {method.status === 'active' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(method.type)}`}>
                  {method.type.replace('-', ' ').toUpperCase()}
                </span>
              </div>

              {/* Delivery Time & Rates */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-green-600" />
                    <p className="text-xs text-green-700 font-medium">Delivery Time</p>
                  </div>
                  <p className="font-semibold text-green-900">{method.deliveryDays} days</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <p className="text-xs text-blue-700 font-medium">Base Rate</p>
                  </div>
                  <p className="font-semibold text-blue-900">₹{method.baseRate}</p>
                </div>
              </div>

              {/* Weight & Per Kg Rate */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <p className="text-xs text-purple-700 mb-1">Weight Range</p>
                  <p className="font-semibold text-purple-900">{method.minWeight}-{method.maxWeight} kg</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <p className="text-xs text-orange-700 mb-1">Per Kg Rate</p>
                  <p className="font-semibold text-orange-900">₹{method.perKgRate}/kg</p>
                </div>
              </div>

              {/* Free Shipping Threshold */}
              {method.freeShippingThreshold && (
                <div className="mb-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-700 mb-1 font-medium">Free Shipping Above</p>
                      <p className="font-bold text-green-900">₹{method.freeShippingThreshold.toLocaleString('en-IN')}</p>
                    </div>
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              )}

              {/* Zones */}
              <div className="mb-2">
                <p className="text-xs text-gray-600 mb-2 font-medium">Delivery Zones:</p>
                <div className="flex flex-wrap gap-2">
                  {method.zones.map((zone, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {zone}
                    </span>
                  ))}
                </div>
              </div>

              {/* Applicable Products */}
              <div className="mb-2">
                <p className="text-xs text-gray-600 mb-2 font-medium">Applicable Products:</p>
                <div className="flex flex-wrap gap-2">
                  {method.applicableProducts.map((product, index) => (
                    <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {product}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="mb-2 grid grid-cols-2 gap-2">
                <div className={`p-2 rounded text-xs text-center ${method.insuranceIncluded ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {method.insuranceIncluded ? '✓ Insurance Included' : '✗ No Insurance'}
                </div>
                <div className={`p-2 rounded text-xs text-center ${method.trackingAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {method.trackingAvailable ? '✓ Tracking Available' : '✗ No Tracking'}
                </div>
              </div>

              {/* Usage Stats */}
              <div className="mb-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600 font-medium">Total Shipments</p>
                  <p className="font-semibold text-gray-900">{method.usageCount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button className={`flex-1 px-4 py-2 rounded-lg ${
                  method.status === 'active'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}>
                  {method.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMethods.length === 0 && (
        <div className="text-center py-12">
          <Truck className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">No shipping methods found for selected zone</p>
        </div>
      )}
    </div>
  )
}
