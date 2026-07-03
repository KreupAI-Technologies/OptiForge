'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    ArrowLeft,
    Package,
    Truck,
    CheckCircle,
    Clock,
    AlertTriangle,
    Factory,
    ClipboardCheck,
    Calendar,
    DollarSign,
    User,
    MapPin,
    FileText
} from 'lucide-react'
import { WorkflowService, OrderTrackingDetail } from '@/services/workflow.service'

// Status ordering used to derive an overall progress percentage
// (mirrors OrderTracking.getProgressPercentage() on the backend).
const STATUS_ORDER = [
    'order_placed',
    'order_confirmed',
    'production_planning',
    'material_procurement',
    'in_production',
    'quality_check',
    'ready_for_dispatch',
    'dispatched',
    'in_transit',
    'delivered',
    'completed',
]

function deriveProgress(status: string): number {
    const idx = STATUS_ORDER.indexOf(status)
    if (idx === -1) return 0
    return Math.round((idx / (STATUS_ORDER.length - 1)) * 100)
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
    order_placed: { label: 'Order Placed', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Clock },
    order_confirmed: { label: 'Confirmed', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: CheckCircle },
    production_planning: { label: 'Planning', color: 'text-indigo-600', bgColor: 'bg-indigo-100', icon: ClipboardCheck },
    material_procurement: { label: 'Procurement', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Package },
    in_production: { label: 'In Production', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Factory },
    quality_check: { label: 'Quality Check', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: ClipboardCheck },
    ready_for_dispatch: { label: 'Ready to Ship', color: 'text-teal-600', bgColor: 'bg-teal-100', icon: Package },
    dispatched: { label: 'Dispatched', color: 'text-cyan-600', bgColor: 'bg-cyan-100', icon: Truck },
    in_transit: { label: 'In Transit', color: 'text-sky-600', bgColor: 'bg-sky-100', icon: Truck },
    delivered: { label: 'Delivered', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
    completed: { label: 'Completed', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertTriangle },
    on_hold: { label: 'On Hold', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: Clock },
}

export default function WorkflowOrderDetailPage() {
    const params = useParams()
    const router = useRouter()
    const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined)

    const [order, setOrder] = useState<OrderTrackingDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!id) return
        let cancelled = false

        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await WorkflowService.getOrderTrackingById(id)
                if (!cancelled) setOrder(data)
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Failed to load order')
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [id])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return '—'
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center gap-3 text-gray-500">
                    <Clock className="h-5 w-5 animate-spin" />
                    <span>Loading order…</span>
                </div>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
                    <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Unable to load order</h2>
                    <p className="text-sm text-gray-500 mb-4">{error || 'Order not found'}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    const config = statusConfig[order.status] || statusConfig.order_placed
    const StatusIcon = config.icon
    const progress = deriveProgress(order.status)
    const events = order.events ?? []
    const workOrders = order.workOrders ?? []

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="w-full px-3 py-2">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Dashboard
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color} flex items-center gap-1`}>
                                    <StatusIcon className="h-4 w-4" />
                                    {config.label}
                                </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                Created on {formatDate(events[0]?.timestamp ?? order.createdAt)} • Customer: {order.customerName}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Invoice
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                Track Shipment
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-3 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-3">
                        {/* Progress Bar */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Order Progress</h2>
                            <div className="mb-2 flex justify-between text-sm">
                                <span className="font-medium text-gray-700">{progress}% Completed</span>
                                <span className="text-gray-500">Est. Delivery: {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : '—'}</span>
                            </div>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="mt-6 flex justify-between items-center relative">
                                {/* Simplified milestones for visual */}
                                {['Placed', 'Confirmed', 'Production', 'QC', 'Dispatch', 'Delivered'].map((step, idx) => {
                                    const isCompleted = idx * 20 <= progress
                                    return (
                                        <div key={step} className="flex flex-col items-center z-10">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-300'
                                                }`}>
                                                {isCompleted ? <CheckCircle className="h-5 w-5" /> : <div className="w-2 h-2 bg-gray-300 rounded-full" />}
                                            </div>
                                            <span className={`text-xs mt-2 font-medium ${isCompleted ? 'text-blue-600' : 'text-gray-400'}`}>
                                                {step}
                                            </span>
                                        </div>
                                    )
                                })}
                                <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 -z-0" />
                            </div>
                        </div>

                        {/* Work Orders */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Work Orders</h2>
                            {workOrders.length === 0 ? (
                                <p className="text-sm text-gray-500">No work orders yet.</p>
                            ) : (
                            <div className="space-y-2">
                                {workOrders.map((wo) => {
                                    const woProgress = wo.status === 'completed' ? 100 : wo.status === 'in_progress' ? 50 : 0
                                    return (
                                    <div key={wo.workOrderId ?? wo.workOrderNumber} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-orange-100 rounded-lg">
                                                    <Factory className="h-5 w-5 text-orange-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{wo.workOrderNumber}</p>
                                                    <p className="text-sm text-gray-500">{wo.itemName}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${wo.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    wo.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {wo.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="mt-3">
                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>Progress</span>
                                                <span>{woProgress}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-orange-500 rounded-full"
                                                    style={{ width: `${woProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    )
                                })}
                            </div>
                            )}
                        </div>

                        {/* Order Items (derived from work orders) */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
                                <span className="text-sm text-gray-500">{order.itemCount} item{order.itemCount === 1 ? '' : 's'}</span>
                            </div>
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {workOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-3 py-4 text-center text-sm text-gray-500">
                                                No line items available yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        workOrders.map((wo) => (
                                            <tr key={wo.workOrderId ?? wo.workOrderNumber}>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{wo.itemName}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{wo.quantity}</td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{wo.status.replace('_', ' ')}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan={2} className="px-3 py-2 text-right text-sm font-medium text-gray-900">Total Amount</td>
                                        <td className="px-3 py-2 text-right text-sm font-bold text-gray-900">{formatCurrency(Number(order.totalAmount))}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-3">
                        {/* Customer Details */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Customer Details</h2>
                            <div className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                                        <p className="text-xs text-gray-500 mt-1">Customer ID: {order.customerId}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Order Reference</p>
                                        <p className="text-sm text-gray-700">{order.orderNumber}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Activity Log</h2>
                            <div className="space-y-3">
                                {events.length === 0 && (
                                    <p className="text-sm text-gray-500">No activity recorded yet.</p>
                                )}
                                {events.map((event, index) => (
                                    <div key={index} className="relative flex gap-2">
                                        <div className={`
                      absolute left-0 top-0 bottom-0 w-px bg-gray-200
                      ${index === events.length - 1 ? 'h-2' : ''}
                    `} style={{ left: '9px' }} />
                                        <div className="relative z-10 w-5 h-5 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-blue-600" />
                                        </div>
                                        <div className="pb-2">
                                            <p className="text-sm font-medium text-gray-900">{event.description}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{formatDate(event.timestamp)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
