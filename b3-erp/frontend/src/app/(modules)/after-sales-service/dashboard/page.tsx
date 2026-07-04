'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Shield, AlertCircle, Wrench, Navigation, DollarSign, TrendingUp, TrendingDown, CheckCircle, Clock, Users, ArrowRight, X, Eye, Calendar, Package } from 'lucide-react';

export default function AfterSalesDashboard() {
  const router = useRouter();
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showInstallationModal, setShowInstallationModal] = useState(false);
  const [showSLAModal, setShowSLAModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [selectedInstallation, setSelectedInstallation] = useState<any>(null);

  // Mock dashboard data
  const stats = {
    activeContracts: 6,
    contractValue: 4250000,
    expiringIn30Days: 2,
    activeWarranties: 7,
    totalClaims: 12,
    openTickets: 3,
    p1Critical: 2,
    slaCompliance: 87.5,
    scheduledInstallations: 3,
    inProgressInstallations: 2,
    activeFieldJobs: 3,
    completedJobs: 4,
    totalInvoiced: 3264347,
    totalCollected: 1612716,
    outstanding: 1651631,
    overdueInvoices: 2,
  };

  const trends = {
    contracts: '+12%',
    tickets: '+8%',
    revenue: '+15%',
    sla: '-3%',
  };

  const recentTickets = [
    { id: 'TICKET-2025-000123', customer: 'Sharma Kitchens', priority: 'P1', issue: 'Chimney motor not working', timeLeft: '1h 30m', status: 'in_progress' },
    { id: 'TICKET-2025-000118', customer: 'Prestige Developers', priority: 'P2', issue: 'Oven temperature issue', timeLeft: '8h 15m', status: 'acknowledged' },
    { id: 'TICKET-2025-000134', customer: 'Modern Living', priority: 'P2', issue: 'Chimney suction reduced', timeLeft: '12h 45m', status: 'open' },
  ];

  const upcomingInstallations = [
    { id: 'INS-2025-00118', customer: 'Prestige Developers', date: '2025-10-19', team: 'Vijay Patil', items: 5 },
    { id: 'INS-2025-00142', customer: 'Elite Contractors', date: '2025-10-20', team: 'Vijay Patil', items: 3 },
    { id: 'INS-2025-00101', customer: 'Signature Interiors', date: '2025-10-21', team: 'Arun Reddy', items: 4 },
  ];

  const revenueData = [
    { month: 'Apr', amount: 245000 },
    { month: 'May', amount: 312000 },
    { month: 'Jun', amount: 289000 },
    { month: 'Jul', amount: 356000 },
    { month: 'Aug', amount: 421000 },
    { month: 'Sep', amount: 389000 },
    { month: 'Oct', amount: 458000 },
  ];

  const maxRevenue = Math.max(...revenueData.map(d => d.amount));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const priorityColors: Record<string, string> = {
    'P1': 'bg-red-100 text-red-700 border-red-300',
    'P2': 'bg-orange-100 text-orange-700 border-orange-300',
    'P3': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  };

  const handleViewTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  const handleViewInstallation = (installation: any) => {
    setSelectedInstallation(installation);
    setShowInstallationModal(true);
  };

  return (
    <div className="min-h-screen px-3 py-2">
      <div className="w-full">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          {/* Contracts */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push('/after-sales-service/service-contracts')}>
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-8 w-8 text-blue-600" />
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {trends.contracts}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Active Contracts</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.activeContracts}</p>
            <p className="text-sm text-gray-600">{formatCurrency(stats.contractValue)} value</p>
            {stats.expiringIn30Days > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-orange-600 font-medium">{stats.expiringIn30Days} expiring in 30 days</p>
              </div>
            )}
          </div>

          {/* Warranties */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push('/after-sales-service/warranties')}>
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-8 w-8 text-green-600" />
              <span className="text-sm text-blue-600 font-medium">Active</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Active Warranties</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.activeWarranties}</p>
            <p className="text-sm text-gray-600">{stats.totalClaims} total claims</p>
          </div>

          {/* Service Requests */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push('/after-sales-service/service-requests')}>
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {trends.tickets}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Open Tickets</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.openTickets}</p>
            <p className="text-sm text-gray-600">SLA: {stats.slaCompliance}% compliant</p>
            {stats.p1Critical > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-red-600 font-medium">{stats.p1Critical} P1 Critical issues</p>
              </div>
            )}
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push('/after-sales-service/billing')}>
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {trends.revenue}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(stats.totalInvoiced)}</p>
            <p className="text-sm text-gray-600">Collected: {formatCurrency(stats.totalCollected)}</p>
            {stats.outstanding > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-red-600 font-medium">Outstanding: {formatCurrency(stats.outstanding)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
          <button
            onClick={() => router.push('/after-sales-service/installations')}
            className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-blue-500 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled Installations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.scheduledInstallations}</p>
                <p className="text-xs text-blue-600 mt-1">Click to view all</p>
              </div>
              <Wrench className="h-6 w-6 text-blue-600" />
            </div>
          </button>

          <button
            onClick={() => router.push('/after-sales-service/installations')}
            className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-purple-500 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-purple-600">{stats.inProgressInstallations}</p>
                <p className="text-xs text-purple-600 mt-1">Click to view all</p>
              </div>
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </button>

          <button
            onClick={() => router.push('/after-sales-service/field-service')}
            className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-cyan-500 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Field Jobs</p>
                <p className="text-2xl font-bold text-cyan-600">{stats.activeFieldJobs}</p>
                <p className="text-xs text-cyan-600 mt-1">Click to view all</p>
              </div>
              <Navigation className="h-6 w-6 text-cyan-600" />
            </div>
          </button>

          <button
            onClick={() => router.push('/after-sales-service/field-service')}
            className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-green-500 hover:shadow-lg transition-all text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Jobs</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedJobs}</p>
                <p className="text-xs text-green-600 mt-1">Click to view all</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </button>
        </div>

        {/* Charts and Lists Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
          {/* Revenue Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Revenue Trend (Last 7 Months)</h2>
              <button
                onClick={() => router.push('/after-sales-service/dashboard/analytics')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View Details
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="h-64 flex items-end justify-between gap-2">
              {revenueData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-blue-100 rounded-t relative group">
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all duration-500"
                      style={{ height: `${(data.amount / maxRevenue) * 200}px` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        {formatCurrency(data.amount)}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{data.month}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SLA Compliance Gauge */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-orange-500 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setShowSLAModal(true)}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">SLA Compliance</h2>
              <Eye className="h-5 w-5 text-gray-400 hover:text-blue-600" />
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="12"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke={stats.slaCompliance >= 90 ? '#10B981' : stats.slaCompliance >= 75 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="12"
                    strokeDasharray={`${(stats.slaCompliance / 100) * 440} 440`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{stats.slaCompliance}%</p>
                    <p className="text-xs text-gray-600 mt-1">Compliant</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 w-full space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Target:</span>
                  <span className="font-medium text-gray-900">95%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${stats.slaCompliance >= 90 ? 'text-green-600' : stats.slaCompliance >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {stats.slaCompliance >= 90 ? 'Good' : stats.slaCompliance >= 75 ? 'Fair' : 'Poor'}
                  </span>
                </div>
                <p className="text-xs text-orange-600 mt-2 text-center">Click for detailed breakdown</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Recent Tickets */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Recent Service Requests
              </h2>
              <button
                onClick={() => router.push('/after-sales-service/service-requests')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{ticket.id}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${priorityColors[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{ticket.customer}</p>
                    <p className="text-xs text-gray-500 mt-1">{ticket.issue}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <div className="text-right">
                      <p className="text-xs text-orange-600 font-medium">{ticket.timeLeft}</p>
                      <p className="text-xs text-gray-500 mt-1">{ticket.status}</p>
                    </div>
                    <button
                      onClick={() => handleViewTicket(ticket)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Installations */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-600" />
                Upcoming Installations
              </h2>
              <button
                onClick={() => router.push('/after-sales-service/installations')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {upcomingInstallations.map((install) => (
                <div key={install.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{install.id}</span>
                    </div>
                    <p className="text-sm text-gray-600">{install.customer}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {install.team}
                      </span>
                      <span>{install.items} items</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">
                        {new Date(install.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewInstallation(install)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ticket Details Modal */}
        {showTicketModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className={`sticky top-0 px-3 py-2 flex items-center justify-between ${selectedTicket.priority === 'P1' ? 'bg-gradient-to-r from-red-600 to-orange-600' :
                  selectedTicket.priority === 'P2' ? 'bg-gradient-to-r from-orange-600 to-yellow-600' :
                    'bg-gradient-to-r from-blue-600 to-indigo-600'
                } text-white`}>
                <div>
                  <h2 className="text-xl font-bold">{selectedTicket.id}</h2>
                  <p className="text-white text-opacity-90 text-sm">Service Request Details</p>
                </div>
                <button onClick={() => setShowTicketModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-3">
                {/* Priority Banner */}
                <div className={`rounded-lg p-3 border-2 ${selectedTicket.priority === 'P1' ? 'bg-red-50 border-red-200' :
                    selectedTicket.priority === 'P2' ? 'bg-orange-50 border-orange-200' :
                      'bg-yellow-50 border-yellow-200'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className={`h-8 w-8 ${selectedTicket.priority === 'P1' ? 'text-red-600' :
                          selectedTicket.priority === 'P2' ? 'text-orange-600' :
                            'text-yellow-600'
                        }`} />
                      <div>
                        <h3 className={`text-lg font-bold ${selectedTicket.priority === 'P1' ? 'text-red-900' :
                            selectedTicket.priority === 'P2' ? 'text-orange-900' :
                              'text-yellow-900'
                          }`}>
                          {selectedTicket.priority === 'P1' ? 'Critical Priority' :
                            selectedTicket.priority === 'P2' ? 'High Priority' :
                              'Medium Priority'}
                        </h3>
                        <p className={`text-sm ${selectedTicket.priority === 'P1' ? 'text-red-700' :
                            selectedTicket.priority === 'P2' ? 'text-orange-700' :
                              'text-yellow-700'
                          }`}>
                          Time Remaining: {selectedTicket.timeLeft}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${priorityColors[selectedTicket.priority]}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Customer Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Customer Name</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedTicket.customer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Ticket ID</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedTicket.id}</p>
                    </div>
                  </div>
                </div>

                {/* Issue Details */}
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Issue Description
                  </h4>
                  <p className="text-sm text-gray-700">{selectedTicket.issue}</p>
                </div>

                {/* Status Info */}
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-3">Current Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 font-medium">Status</span>
                      <span className="text-sm font-semibold text-purple-600 capitalize">{selectedTicket.status.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 font-medium">Time Left</span>
                      <span className={`text-sm font-semibold ${selectedTicket.priority === 'P1' ? 'text-red-600' : 'text-orange-600'
                        }`}>{selectedTicket.timeLeft}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-3 py-2 flex justify-end gap-3 border-t">
                <button onClick={() => setShowTicketModal(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                  Close
                </button>
                <button
                  onClick={() => router.push('/after-sales-service/service-requests')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  View All Requests
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Installation Details Modal */}
        {showInstallationModal && selectedInstallation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-2 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{selectedInstallation.id}</h2>
                  <p className="text-emerald-100 text-sm">Installation Details</p>
                </div>
                <button onClick={() => setShowInstallationModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-3">
                {/* Date Banner */}
                <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-bold text-blue-900">Scheduled Date</h3>
                        <p className="text-sm text-blue-700">
                          {new Date(selectedInstallation.date).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <Wrench className="h-8 w-8 text-blue-600 opacity-20" />
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Customer Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-purple-700 font-medium">Customer Name</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedInstallation.customer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-purple-700 font-medium">Installation ID</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedInstallation.id}</p>
                    </div>
                  </div>
                </div>

                {/* Team Info */}
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Team Assignment
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 font-medium">Assigned Team</span>
                      <span className="text-sm font-semibold text-green-600">{selectedInstallation.team}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700 font-medium">Items to Install</span>
                      <span className="text-sm font-semibold text-gray-900">{selectedInstallation.items} items</span>
                    </div>
                  </div>
                </div>

                {/* Installation Items */}
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Installation Scope
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">This installation includes:</p>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{selectedInstallation.items} kitchen appliances</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Pre-installation site survey</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Professional installation & testing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Customer training & handover</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-3 py-2 flex justify-end gap-3 border-t">
                <button onClick={() => setShowInstallationModal(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                  Close
                </button>
                <button
                  onClick={() => router.push('/after-sales-service/installations')}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  View All Installations
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SLA Compliance Details Modal */}
        {showSLAModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-3 py-2 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">SLA Compliance Report</h2>
                  <p className="text-orange-100 text-sm">Service Level Agreement Performance</p>
                </div>
                <button onClick={() => setShowSLAModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-3">
                {/* Overall SLA Status */}
                <div className={`rounded-lg p-5 border-2 ${stats.slaCompliance >= 90 ? 'bg-green-50 border-green-200' :
                    stats.slaCompliance >= 75 ? 'bg-yellow-50 border-yellow-200' :
                      'bg-red-50 border-red-200'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            fill="none"
                            stroke={stats.slaCompliance >= 90 ? '#10B981' : stats.slaCompliance >= 75 ? '#F59E0B' : '#EF4444'}
                            strokeWidth="8"
                            strokeDasharray={`${(stats.slaCompliance / 100) * 251} 251`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-2xl font-bold">{stats.slaCompliance}%</p>
                        </div>
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${stats.slaCompliance >= 90 ? 'text-green-900' :
                            stats.slaCompliance >= 75 ? 'text-yellow-900' :
                              'text-red-900'
                          }`}>
                          {stats.slaCompliance >= 90 ? 'Excellent Performance' :
                            stats.slaCompliance >= 75 ? 'Needs Improvement' :
                              'Critical - Action Required'}
                        </h3>
                        <p className={`text-sm ${stats.slaCompliance >= 90 ? 'text-green-700' :
                            stats.slaCompliance >= 75 ? 'text-yellow-700' :
                              'text-red-700'
                          }`}>
                          Current compliance: {stats.slaCompliance}% | Target: 95%
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Gap to target: {(95 - stats.slaCompliance).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <TrendingDown className={`h-8 w-8 ${stats.slaCompliance >= 90 ? 'text-green-600' :
                        stats.slaCompliance >= 75 ? 'text-yellow-600' :
                          'text-red-600'
                      }`} />
                  </div>
                </div>

                {/* SLA Breakdown by Priority */}
                <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    SLA Performance by Priority
                  </h4>
                  <div className="space-y-2">
                    {/* P1 Critical */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-300">P1</span>
                          <span className="text-sm font-medium text-gray-900">Critical (2 Hour Response)</span>
                        </div>
                        <span className="text-sm font-bold text-green-600">95%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">19 out of 20 tickets met SLA</p>
                    </div>

                    {/* P2 High */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700 border border-orange-300">P2</span>
                          <span className="text-sm font-medium text-gray-900">High (4 Hour Response)</span>
                        </div>
                        <span className="text-sm font-bold text-yellow-600">88%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">22 out of 25 tickets met SLA</p>
                    </div>

                    {/* P3 Medium */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-300">P3</span>
                          <span className="text-sm font-medium text-gray-900">Medium (8 Hour Response)</span>
                        </div>
                        <span className="text-sm font-bold text-green-600">92%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">46 out of 50 tickets met SLA</p>
                    </div>

                    {/* P4 Low */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 border border-blue-300">P4</span>
                          <span className="text-sm font-medium text-gray-900">Low (24 Hour Response)</span>
                        </div>
                        <span className="text-sm font-bold text-green-600">98%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" style={{ width: '98%' }}></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">39 out of 40 tickets met SLA</p>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <p className="text-sm text-purple-700 font-medium mb-1">Average Response Time</p>
                    <p className="text-2xl font-bold text-purple-900">2.3 hrs</p>
                    <p className="text-xs text-purple-600 mt-1">Target: 2.0 hrs</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-sm text-green-700 font-medium mb-1">Tickets Met SLA</p>
                    <p className="text-2xl font-bold text-green-900">126 / 135</p>
                    <p className="text-xs text-green-600 mt-1">93.3% compliance</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                    <p className="text-sm text-red-700 font-medium mb-1">Tickets Breached SLA</p>
                    <p className="text-2xl font-bold text-red-900">9</p>
                    <p className="text-xs text-red-600 mt-1">6.7% breach rate</p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-5 border border-indigo-200">
                  <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recommendations
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span>Focus on improving P2 priority response times to reach 95% target</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span>Review the 9 breached tickets to identify common patterns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span>Consider additional technician resources during peak hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span>Implement proactive monitoring for high-priority customers</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-3 py-2 flex justify-end gap-3 border-t">
                <button onClick={() => setShowSLAModal(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                  Close
                </button>
                <button
                  onClick={() => router.push('/after-sales-service/dashboard')}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  View Full Analytics
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
