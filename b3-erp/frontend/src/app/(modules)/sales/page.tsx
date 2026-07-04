'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  FileText,
  CheckCircle,
  Target,
  ArrowUpRight,
  Award
} from 'lucide-react'
import { KPICard, CardSkeleton } from '@/components/ui'
import { salesOrderService, SalesOrder as ServiceSalesOrder, SalesOrderStatistics } from '@/services/sales-order.service'

interface SalesStats {
  totalRevenue: number
  revenueGrowth: number
  activeOrders: number
  pendingQuotations: number
  customersActive: number
  avgOrderValue: number
  conversionRate: number
  targetAchievement: number
  ordersThisMonth: number
  quotationsThisMonth: number
}

interface SalesOrder {
  id: string
  customer: string
  product: string
  quantity: number
  value: number
  status: 'draft' | 'confirmed' | 'in_production' | 'ready_to_ship' | 'shipped' | 'delivered'
  orderDate: string
  deliveryDate: string
  priority: 'high' | 'medium' | 'low'
}

interface TopCustomer {
  id: string
  name: string
  industry: string
  totalOrders: number
  totalRevenue: number
  activeOrders: number
  creditLimit: number
  outstandingAmount: number
}

export default function SalesDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<SalesStats>({
    totalRevenue: 0,
    revenueGrowth: 0,
    activeOrders: 0,
    pendingQuotations: 0,
    customersActive: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    targetAchievement: 0,
    ordersThisMonth: 0,
    quotationsThisMonth: 0
  })

  const [recentOrders, setRecentOrders] = useState<SalesOrder[]>([])

  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)

        // Fetch statistics and orders in parallel
        const [statisticsData, ordersData] = await Promise.all([
          salesOrderService.getOrderStatistics(),
          salesOrderService.getAllOrders({ limit: 4 })
        ])

        // Map statistics to dashboard stats format
        setStats({
          totalRevenue: statisticsData.totalRevenue,
          revenueGrowth: 18.5, // Calculate from monthly data or add to API
          activeOrders: statisticsData.confirmedOrders + statisticsData.inProductionOrders + statisticsData.shippedOrders,
          pendingQuotations: statisticsData.pendingOrders,
          customersActive: statisticsData.topCustomers?.length || 0,
          avgOrderValue: statisticsData.averageOrderValue,
          conversionRate: 42.5, // Calculate or add to API
          targetAchievement: 87.3, // Calculate or add to API
          ordersThisMonth: statisticsData.ordersByMonth?.[statisticsData.ordersByMonth.length - 1]?.count || 0,
          quotationsThisMonth: statisticsData.pendingOrders
        })

        // Map orders to dashboard format
        const mappedOrders: SalesOrder[] = ordersData.data.slice(0, 4).map((order: ServiceSalesOrder) => {
          // Map status from service format to dashboard format
          let dashboardStatus: SalesOrder['status'] = 'draft'
          const statusLower = order.status.toLowerCase()
          if (statusLower === 'draft') dashboardStatus = 'draft'
          else if (statusLower === 'confirmed' || statusLower === 'approved') dashboardStatus = 'confirmed'
          else if (statusLower === 'pending' || statusLower === 'in production') dashboardStatus = 'in_production'
          else if (statusLower === 'shipped') dashboardStatus = 'shipped'
          else if (statusLower === 'delivered') dashboardStatus = 'delivered'

          return {
            id: order.orderNumber,
            customer: order.customerName,
            product: order.items[0]?.productName || 'Multiple Items',
            quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
            value: order.totalAmount,
            status: dashboardStatus,
            orderDate: order.orderDate,
            deliveryDate: order.expectedDeliveryDate,
            priority: 'medium' as const // Default priority
          }
        })
        setRecentOrders(mappedOrders)

        // Map top customers from statistics
        const mappedCustomers: TopCustomer[] = (statisticsData.topCustomers || []).slice(0, 4).map((customer, index) => ({
          id: customer.customerId,
          name: customer.customerName,
          industry: 'Manufacturing', // Default - would need additional API data
          totalOrders: customer.orderCount,
          totalRevenue: customer.totalValue,
          activeOrders: Math.ceil(customer.orderCount * 0.2), // Estimate
          creditLimit: customer.totalValue * 1.5, // Estimate
          outstandingAmount: customer.totalValue * 0.1 // Estimate
        }))
        setTopCustomers(mappedCustomers)

      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'in_production':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'ready_to_ship':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'shipped':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-orange-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 px-3 py-2">
      <div className="w-full space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
            <p className="text-gray-600 mt-1">Sales orders, quotations, and customer management</p>
          </div>
          <Link
            href="/sales/orders/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700 transition-all shadow-md"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>New Sales Order</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              <KPICard

                value={`₹${(stats.totalRevenue / 10000000).toFixed(1)}Cr`}
                icon={DollarSign}
                color="green"
                trend={{ value: stats.revenueGrowth, isPositive: true, label: 'growth' }}
              />
              <KPICard

                value={stats.activeOrders}
                icon={ShoppingBag}
                color="blue"
                description={`${stats.ordersThisMonth} this month`}
              />
              <KPICard

                value={stats.customersActive}
                icon={Users}
                color="purple"
                description={`${stats.conversionRate}% conversion`}
              />
              <KPICard

                value={`${stats.targetAchievement}%`}
                icon={Target}
                color="yellow"
                description="Monthly target"
              />
            </>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Recent Sales Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Sales Orders</h2>
                <Link
                  href="/sales/orders"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{order.id}</p>
                        <p className="text-sm text-gray-600 mt-1">{order.customer}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="mb-2">
                      <p className="text-sm text-gray-700">{order.product}</p>
                      <p className="text-xs text-gray-500 mt-1">Qty: {order.quantity} units</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-semibold text-gray-900">₹{(order.value / 10000000).toFixed(2)}Cr</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${getPriorityColor(order.priority)}`}>
                          {order.priority.toUpperCase()}
                        </p>
                        <p className="text-gray-600 text-xs mt-1">Delivery: {order.deliveryDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Top Customers</h2>
                <Link
                  href="/crm/customers"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  View All
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {topCustomers.map((customer) => (
                  <div key={customer.id} className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-600 mt-1">{customer.industry}</p>
                      </div>
                      <Award className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600 text-xs">Total Revenue</p>
                        <p className="font-semibold text-gray-900">₹{(customer.totalRevenue / 10000000).toFixed(1)}Cr</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Active Orders</p>
                        <p className="font-semibold text-gray-900">{customer.activeOrders}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Total Orders</p>
                        <p className="font-semibold text-gray-900">{customer.totalOrders}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Outstanding</p>
                        <p className="font-semibold text-orange-600">₹{(customer.outstandingAmount / 10000000).toFixed(1)}Cr</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              <KPICard

                value={`₹${(stats.avgOrderValue / 100000).toFixed(1)}L`}
                icon={TrendingUp}
                color="green"
                trend={{ value: 12, isPositive: true, label: 'from last month' }}
              />
              <KPICard

                value={stats.pendingQuotations}
                icon={FileText}
                color="yellow"
                description={`${stats.quotationsThisMonth} sent this month`}
              />
              <KPICard

                value={`${stats.conversionRate}%`}
                icon={CheckCircle}
                color="blue"
                trend={{ value: 3.5, isPositive: true, label: 'improvement' }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
