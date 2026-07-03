'use client'

import { useState, useEffect } from 'react'
import { SparePartService } from '@/services/spare-part.service'
import {
  Package,
  Search,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronRight,
  Filter,
  ArrowRight
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SparePart {
  id: string
  name: string
  partNumber: string
  category: string
  price: number
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock'
  stockLevel: number
  compatibility: string[]
  leadTime: string
  image: string
}

export default function SparePartsCatalog() {
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)

  const [parts, setParts] = useState<SparePart[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const raw = await SparePartService.getAllSpareParts()
        const mapped: SparePart[] = (Array.isArray(raw) ? raw : []).map((p: any) => {
          const stockLevel = Number(p.stockLevel ?? p.stock_level ?? 0)
          const stockStatus: SparePart['stockStatus'] =
            stockLevel <= 0 ? 'Out of Stock' : stockLevel < 10 ? 'Low Stock' : 'In Stock'
          const leadDays = Number(p.leadTimeDays ?? p.lead_time_days ?? 0)
          return {
            id: String(p.id ?? p.partNumber ?? ''),
            name: p.name ?? '',
            partNumber: p.partNumber ?? p.part_number ?? '',
            category: p.category ?? '',
            price: Number(p.price ?? 0),
            stockStatus,
            stockLevel,
            compatibility: Array.isArray(p.compatibility) ? p.compatibility : [],
            leadTime: leadDays > 0 ? `${leadDays} days` : (p.leadTime ?? 'N/A'),
            image: p.image ?? '',
          }
        })
        if (!cancelled) setParts(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load spare parts')
          setParts([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleOneClickOrder = (partName: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Processing requisition...',
        success: `Requisition raised for ${partName}! Check your email for approval status.`,
        error: 'Failed to process order.',
      }
    )
    setCartCount(prev => prev + 1)
  }

  const filteredParts = parts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.partNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-full min-h-screen bg-slate-50 px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
            Loading spare parts…
          </div>
        )}
        {loadError && !isLoading && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {loadError}
          </div>
        )}
        {!isLoading && !loadError && parts.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            No spare parts found.
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="h-8 w-8 text-rose-600" />
              Spare Parts Catalog
            </h1>
            <p className="text-gray-600 mt-2">Genuine parts with direct ordering and compatibility tracking</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Part name or number..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="relative p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
              <ShoppingCart className="h-6 w-6 text-gray-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredParts.map((part) => (
            <div key={part.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col group">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={part.image}
                  alt={part.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${part.stockStatus === 'In Stock' ? 'bg-green-500 text-white' :
                      part.stockStatus === 'Low Stock' ? 'bg-amber-500 text-white' :
                        'bg-gray-500 text-white'
                    }`}>
                    {part.stockStatus}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 space-y-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{part.category}</p>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-rose-600 transition-colors leading-tight">
                    {part.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">Part #: {part.partNumber}</p>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <Info className="h-3 w-3 text-blue-500" />
                  <span>Compatible with: {part.compatibility.join(', ')}</span>
                </div>

                <div className="pt-2 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-gray-900">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(part.price)}
                    </span>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                      <ArrowRight className="h-3 w-3" />
                      {part.leadTime} Lead
                    </span>
                  </div>
                  <button
                    onClick={() => handleOneClickOrder(part.name)}
                    disabled={part.stockStatus === 'Out of Stock'}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${part.stockStatus === 'Out of Stock'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-rose-600 text-white hover:bg-rose-700 active:scale-95'
                      }`}
                  >
                    <CheckCircle className="h-5 w-5" />
                    One-Click Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-3xl p-10 text-white overflow-hidden relative shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-6">
            <h2 className="text-4xl font-black leading-tight">Consolidated Parts Management</h2>
            <p className="text-slate-400 text-lg">
              Manage inventory across multiple sites, track usage patterns, and automate reordering for critical components.
            </p>
            <div className="flex gap-4">
              <button className="px-8 py-4 bg-rose-600 rounded-2xl font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20">
                View Inventory Analytics
              </button>
              <button className="px-8 py-4 bg-slate-800 rounded-2xl font-bold hover:bg-slate-700 transition-colors border border-slate-700">
                Bulk Requisition
              </button>
            </div>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-full opacity-10 pointer-events-none">
            <Package className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  )
}