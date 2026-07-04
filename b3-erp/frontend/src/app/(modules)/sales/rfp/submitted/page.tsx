'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  FileText,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Download,
  Mail,
  Phone,
  IndianRupee,
  TrendingUp,
  Package
} from 'lucide-react';
import { salesPagesService } from '@/services/sales-pages.service';

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  responseStatus: 'pending' | 'responded' | 'declined' | 'no_response';
  responseDate?: string;
  quotedAmount?: number;
  responseTime?: number; // in hours
}

interface SubmittedRFP {
  id: string;
  rfpNumber: string;
  title: string;
  category: string;
  priority: 'normal' | 'high' | 'urgent';
  issueDate: string;
  dueDate: string;
  status: 'open' | 'responses_received' | 'under_evaluation' | 'closed' | 'expired';
  itemsCount: number;
  vendorsInvited: number;
  responsesReceived: number;
  responsesDeclined: number;
  noBidsReceived: number;
  estimatedValue: number;
  lowestQuote?: number;
  highestQuote?: number;
  avgResponseTime?: number; // in hours
  vendors: Vendor[];
  description: string;
  daysRemaining: number;
}

export default function SubmittedRFPPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [rfps, setRfps] = useState<SubmittedRFP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await salesPagesService.getQuotations();
        const mapped: SubmittedRFP[] = raw.map((r: any) => ({
          id: String(r.id ?? ''),
          rfpNumber: r.rfpNumber ?? '',
          title: r.title ?? '',
          category: r.category ?? '',
          priority: (r.priority ?? 'normal') as SubmittedRFP['priority'],
          issueDate: r.issueDate ?? '',
          dueDate: r.dueDate ?? '',
          status: (r.status ?? 'open') as SubmittedRFP['status'],
          itemsCount: r.itemsCount ?? 0,
          vendorsInvited: r.vendorsInvited ?? 0,
          responsesReceived: r.responsesReceived ?? 0,
          responsesDeclined: r.responsesDeclined ?? 0,
          noBidsReceived: r.noBidsReceived ?? 0,
          estimatedValue: r.estimatedValue ?? 0,
          lowestQuote: r.lowestQuote,
          highestQuote: r.highestQuote,
          avgResponseTime: r.avgResponseTime,
          vendors: (r.vendors ?? []).map((v: any) => ({
            id: String(v.id ?? ''),
            name: v.name ?? '',
            email: v.email ?? '',
            phone: v.phone ?? '',
            responseStatus: (v.responseStatus ?? 'pending') as Vendor['responseStatus'],
            responseDate: v.responseDate,
            quotedAmount: v.quotedAmount,
            responseTime: v.responseTime
          })),
          description: r.description ?? '',
          daysRemaining: r.daysRemaining ?? 0
        }));
        if (!cancelled) setRfps(mapped);
      } catch (e) {
        if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setRfps([]); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const _seedRfps: SubmittedRFP[] = [
    {
      id: '1',
      rfpNumber: 'RFP-2025-001',
      title: 'Industrial Machinery Components Manufacturing',
      category: 'manufacturing',
      priority: 'urgent',
      issueDate: '2025-10-10',
      dueDate: '2025-10-25',
      status: 'responses_received',
      itemsCount: 15,
      vendorsInvited: 6,
      responsesReceived: 4,
      responsesDeclined: 1,
      noBidsReceived: 1,
      estimatedValue: 5000000,
      lowestQuote: 4750000,
      highestQuote: 5400000,
      avgResponseTime: 48,
      daysRemaining: 5,
      description: 'High-precision CNC machined components for industrial automation equipment',
      vendors: [
        {
          id: '1',
          name: 'Tata Steel Limited',
          email: 'sales@tatasteel.com',
          phone: '+91 98765 43210',
          responseStatus: 'responded',
          responseDate: '2025-10-15',
          quotedAmount: 4750000,
          responseTime: 42
        },
        {
          id: '2',
          name: 'JSW Steel',
          email: 'business@jswsteel.in',
          phone: '+91 98765 43211',
          responseStatus: 'responded',
          responseDate: '2025-10-16',
          quotedAmount: 5100000,
          responseTime: 56
        },
        {
          id: '3',
          name: 'Hindalco Industries',
          email: 'procurement@hindalco.com',
          phone: '+91 98765 43212',
          responseStatus: 'responded',
          responseDate: '2025-10-14',
          quotedAmount: 4950000,
          responseTime: 38
        },
        {
          id: '4',
          name: 'Bharat Forge',
          email: 'sales@bharatforge.com',
          phone: '+91 98765 43213',
          responseStatus: 'declined',
          responseDate: '2025-10-13',
          responseTime: 30
        },
        {
          id: '5',
          name: 'L&T Heavy Engineering',
          email: 'rfp@lntheavy.com',
          phone: '+91 98765 43214',
          responseStatus: 'responded',
          responseDate: '2025-10-17',
          quotedAmount: 5400000,
          responseTime: 62
        },
        {
          id: '6',
          name: 'Thermax Limited',
          email: 'business@thermaxglobal.com',
          phone: '+91 98765 43215',
          responseStatus: 'pending'
        }
      ]
    },
    {
      id: '2',
      rfpNumber: 'RFP-2025-002',
      title: 'Raw Material Procurement - Aluminum Alloy',
      category: 'raw_materials',
      priority: 'high',
      issueDate: '2025-10-12',
      dueDate: '2025-10-27',
      status: 'open',
      itemsCount: 5,
      vendorsInvited: 4,
      responsesReceived: 1,
      responsesDeclined: 0,
      noBidsReceived: 3,
      estimatedValue: 2500000,
      lowestQuote: 2450000,
      highestQuote: 2450000,
      avgResponseTime: 36,
      daysRemaining: 7,
      description: 'High-grade aluminum alloy 6061-T6 for aerospace applications',
      vendors: [
        {
          id: '1',
          name: 'Hindalco Industries',
          email: 'procurement@hindalco.com',
          phone: '+91 98765 43212',
          responseStatus: 'responded',
          responseDate: '2025-10-14',
          quotedAmount: 2450000,
          responseTime: 36
        },
        {
          id: '2',
          name: 'Vedanta Aluminum',
          email: 'sales@vedanta.com',
          phone: '+91 98765 43220',
          responseStatus: 'pending'
        },
        {
          id: '3',
          name: 'National Aluminum',
          email: 'rfp@nalco.in',
          phone: '+91 98765 43221',
          responseStatus: 'pending'
        },
        {
          id: '4',
          name: 'Jindal Aluminum',
          email: 'business@jindal.com',
          phone: '+91 98765 43222',
          responseStatus: 'pending'
        }
      ]
    },
    {
      id: '3',
      rfpNumber: 'RFP-2025-003',
      title: 'Hydraulic System Components',
      category: 'components',
      priority: 'normal',
      issueDate: '2025-10-08',
      dueDate: '2025-10-23',
      status: 'under_evaluation',
      itemsCount: 8,
      vendorsInvited: 5,
      responsesReceived: 5,
      responsesDeclined: 0,
      noBidsReceived: 0,
      estimatedValue: 1200000,
      lowestQuote: 1050000,
      highestQuote: 1350000,
      avgResponseTime: 52,
      daysRemaining: 3,
      description: 'Complete hydraulic system components for construction machinery',
      vendors: [
        {
          id: '1',
          name: 'Bosch Rexroth India',
          email: 'sales@boschrexroth.in',
          phone: '+91 98765 43230',
          responseStatus: 'responded',
          responseDate: '2025-10-12',
          quotedAmount: 1050000,
          responseTime: 45
        },
        {
          id: '2',
          name: 'Parker Hannifin',
          email: 'rfp@parker.com',
          phone: '+91 98765 43231',
          responseStatus: 'responded',
          responseDate: '2025-10-13',
          quotedAmount: 1180000,
          responseTime: 58
        },
        {
          id: '3',
          name: 'Eaton Hydraulics',
          email: 'business@eaton.in',
          phone: '+91 98765 43232',
          responseStatus: 'responded',
          responseDate: '2025-10-11',
          quotedAmount: 1120000,
          responseTime: 38
        },
        {
          id: '4',
          name: 'Poclain Hydraulics',
          email: 'sales@poclain.com',
          phone: '+91 98765 43233',
          responseStatus: 'responded',
          responseDate: '2025-10-14',
          quotedAmount: 1350000,
          responseTime: 62
        },
        {
          id: '5',
          name: 'Sun Hydraulics',
          email: 'rfp@sunhydraulics.in',
          phone: '+91 98765 43234',
          responseStatus: 'responded',
          responseDate: '2025-10-12',
          quotedAmount: 1240000,
          responseTime: 48
        }
      ]
    },
    {
      id: '4',
      rfpNumber: 'RFP-2025-004',
      title: 'Industrial Automation Equipment',
      category: 'equipment',
      priority: 'high',
      issueDate: '2025-10-15',
      dueDate: '2025-10-30',
      status: 'open',
      itemsCount: 12,
      vendorsInvited: 6,
      responsesReceived: 2,
      responsesDeclined: 1,
      noBidsReceived: 3,
      estimatedValue: 8500000,
      lowestQuote: 8200000,
      highestQuote: 8600000,
      avgResponseTime: 40,
      daysRemaining: 10,
      description: 'Complete industrial automation solution including PLCs, HMIs, and sensors',
      vendors: [
        {
          id: '1',
          name: 'Siemens India',
          email: 'automation@siemens.in',
          phone: '+91 98765 43240',
          responseStatus: 'responded',
          responseDate: '2025-10-17',
          quotedAmount: 8200000,
          responseTime: 38
        },
        {
          id: '2',
          name: 'ABB India',
          email: 'rfp@abb.in',
          phone: '+91 98765 43241',
          responseStatus: 'responded',
          responseDate: '2025-10-18',
          quotedAmount: 8600000,
          responseTime: 42
        },
        {
          id: '3',
          name: 'Schneider Electric',
          email: 'business@schneider.in',
          phone: '+91 98765 43242',
          responseStatus: 'declined',
          responseDate: '2025-10-16',
          responseTime: 28
        },
        {
          id: '4',
          name: 'Rockwell Automation',
          email: 'sales@rockwell.com',
          phone: '+91 98765 43243',
          responseStatus: 'pending'
        },
        {
          id: '5',
          name: 'Honeywell Process',
          email: 'rfp@honeywell.in',
          phone: '+91 98765 43244',
          responseStatus: 'pending'
        },
        {
          id: '6',
          name: 'Mitsubishi Electric',
          email: 'business@mitsubishi.in',
          phone: '+91 98765 43245',
          responseStatus: 'pending'
        }
      ]
    },
    {
      id: '5',
      rfpNumber: 'RFP-2025-005',
      title: 'Heavy Duty Conveyor System',
      category: 'machinery',
      priority: 'normal',
      issueDate: '2025-09-25',
      dueDate: '2025-10-15',
      status: 'expired',
      itemsCount: 6,
      vendorsInvited: 4,
      responsesReceived: 2,
      responsesDeclined: 1,
      noBidsReceived: 1,
      estimatedValue: 3500000,
      lowestQuote: 3200000,
      highestQuote: 3700000,
      daysRemaining: -5,
      description: 'Heavy-duty conveyor system for material handling in warehouse',
      vendors: [
        {
          id: '1',
          name: 'Fenner Conveyors',
          email: 'sales@fenner.in',
          phone: '+91 98765 43250',
          responseStatus: 'responded',
          responseDate: '2025-10-10',
          quotedAmount: 3200000,
          responseTime: 48
        },
        {
          id: '2',
          name: 'Elecon Engineering',
          email: 'rfp@elecon.com',
          phone: '+91 98765 43251',
          responseStatus: 'responded',
          responseDate: '2025-10-12',
          quotedAmount: 3700000,
          responseTime: 52
        },
        {
          id: '3',
          name: 'ThyssenKrupp',
          email: 'business@thyssenkrupp.in',
          phone: '+91 98765 43252',
          responseStatus: 'declined',
          responseDate: '2025-10-08',
          responseTime: 36
        },
        {
          id: '4',
          name: 'Continental Conveyors',
          email: 'sales@continental.in',
          phone: '+91 98765 43253',
          responseStatus: 'no_response'
        }
      ]
    },
    {
      id: '6',
      rfpNumber: 'RFP-2025-006',
      title: 'Quality Control & Testing Equipment',
      category: 'equipment',
      priority: 'urgent',
      issueDate: '2025-10-18',
      dueDate: '2025-10-28',
      status: 'open',
      itemsCount: 10,
      vendorsInvited: 5,
      responsesReceived: 0,
      responsesDeclined: 0,
      noBidsReceived: 5,
      estimatedValue: 4200000,
      daysRemaining: 8,
      description: 'Advanced quality control and non-destructive testing equipment',
      vendors: [
        {
          id: '1',
          name: 'Zeiss India',
          email: 'sales@zeiss.in',
          phone: '+91 98765 43260',
          responseStatus: 'pending'
        },
        {
          id: '2',
          name: 'Olympus NDT',
          email: 'rfp@olympus.in',
          phone: '+91 98765 43261',
          responseStatus: 'pending'
        },
        {
          id: '3',
          name: 'GE Inspection',
          email: 'business@ge.in',
          phone: '+91 98765 43262',
          responseStatus: 'pending'
        },
        {
          id: '4',
          name: 'Nikon Metrology',
          email: 'sales@nikon.in',
          phone: '+91 98765 43263',
          responseStatus: 'pending'
        },
        {
          id: '5',
          name: 'Mitutoyo India',
          email: 'rfp@mitutoyo.in',
          phone: '+91 98765 43264',
          responseStatus: 'pending'
        }
      ]
    }
  ];

  const filteredRFPs = rfps.filter(rfp => {
    const matchesSearch =
      rfp.rfpNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfp.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || rfp.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || rfp.priority === selectedPriority;
    const matchesCategory = selectedCategory === 'all' || rfp.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const totalRFPs = rfps.length;
  const openRFPs = rfps.filter(r => r.status === 'open' || r.status === 'responses_received').length;
  const totalResponses = rfps.reduce((sum, rfp) => sum + rfp.responsesReceived, 0);
  const avgResponseRate = (totalResponses / rfps.reduce((sum, rfp) => sum + rfp.vendorsInvited, 0) * 100).toFixed(0);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'responses_received': return 'bg-green-100 text-green-700';
      case 'under_evaluation': return 'bg-purple-100 text-purple-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      case 'expired': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'responses_received': return 'Responses Received';
      case 'under_evaluation': return 'Under Evaluation';
      case 'closed': return 'Closed';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  const getResponseStatusColor = (status: string) => {
    switch (status) {
      case 'responded': return 'bg-green-100 text-green-700';
      case 'declined': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'no_response': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getResponseStatusLabel = (status: string) => {
    switch (status) {
      case 'responded': return 'Responded';
      case 'declined': return 'Declined';
      case 'pending': return 'Pending';
      case 'no_response': return 'No Response';
      default: return status;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 px-3 py-2">
      <div className="space-y-3">
        {/* Inline Header */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <button className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors">
              Export Report
            </button>
            <button className="px-4 py-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors">
              Send Reminder
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors">
              Create New RFP
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total RFPs</p>
                <p className="text-3xl font-bold mt-2">{totalRFPs}</p>
                <p className="text-blue-100 text-xs mt-1">Submitted</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FileText className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Open RFPs</p>
                <p className="text-3xl font-bold mt-2">{openRFPs}</p>
                <p className="text-green-100 text-xs mt-1">Awaiting responses</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Responses</p>
                <p className="text-3xl font-bold mt-2">{totalResponses}</p>
                <p className="text-purple-100 text-xs mt-1">Received</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Users className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Response Rate</p>
                <p className="text-3xl font-bold mt-2">{avgResponseRate}%</p>
                <p className="text-orange-100 text-xs mt-1">Average</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search RFPs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="responses_received">Responses Received</option>
              <option value="under_evaluation">Under Evaluation</option>
              <option value="closed">Closed</option>
              <option value="expired">Expired</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="raw_materials">Raw Materials</option>
              <option value="machinery">Machinery</option>
              <option value="components">Components</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>
        </div>

        {/* RFPs Grid */}
        <div className="grid grid-cols-1 gap-3">
          {filteredRFPs.map((rfp) => {
            const responseRate = ((rfp.responsesReceived / rfp.vendorsInvited) * 100).toFixed(0);
            const isExpiringSoon = rfp.daysRemaining > 0 && rfp.daysRemaining <= 3;
            const isExpired = rfp.daysRemaining < 0;

            return (
              <div key={rfp.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
                <div className="space-y-2">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900">{rfp.rfpNumber}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(rfp.priority)}`}>
                          {rfp.priority.toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rfp.status)}`}>
                          {getStatusLabel(rfp.status)}
                        </span>
                      </div>
                      <p className="text-xl font-medium text-gray-900 mt-2">{rfp.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{rfp.description}</p>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Items</p>
                      <p className="text-xl font-semibold text-gray-900">{rfp.itemsCount}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Vendors Invited</p>
                      <p className="text-xl font-semibold text-gray-900">{rfp.vendorsInvited}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Responses</p>
                      <p className="text-xl font-semibold text-green-600">{rfp.responsesReceived}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Response Rate</p>
                      <p className="text-xl font-semibold text-gray-900">{responseRate}%</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Issued: {new Date(rfp.issueDate).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={`${isExpired ? 'text-red-600 font-medium' : isExpiringSoon ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                        Due: {new Date(rfp.dueDate).toLocaleDateString('en-IN')}
                        {isExpired && ' (Expired)'}
                        {isExpiringSoon && ' (Expiring Soon!)'}
                      </span>
                    </div>
                    {!isExpired && rfp.daysRemaining > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${isExpiringSoon ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {rfp.daysRemaining} days remaining
                      </span>
                    )}
                  </div>

                  {/* Price Range */}
                  {rfp.lowestQuote && rfp.highestQuote && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-900">Quote Range</p>
                          <p className="text-lg font-semibold text-green-700 mt-1">
                            ₹{(rfp.lowestQuote / 100000).toFixed(2)}L - ₹{(rfp.highestQuote / 100000).toFixed(2)}L
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-green-700">Lowest Quote</p>
                          <p className="text-lg font-semibold text-green-900">₹{(rfp.lowestQuote / 100000).toFixed(2)}L</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vendor Responses */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Vendor Responses ({rfp.responsesReceived}/{rfp.vendorsInvited})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {rfp.vendors.map((vendor) => (
                        <div key={vendor.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-gray-900 text-sm">{vendor.name}</h5>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getResponseStatusColor(vendor.responseStatus)}`}>
                              {getResponseStatusLabel(vendor.responseStatus)}
                            </span>
                          </div>
                          {vendor.quotedAmount && (
                            <p className="text-sm font-semibold text-indigo-600 mb-1">
                              ₹{(vendor.quotedAmount / 100000).toFixed(2)}L
                            </p>
                          )}
                          {vendor.responseDate && (
                            <p className="text-xs text-gray-500">
                              Responded: {new Date(vendor.responseDate).toLocaleDateString('en-IN')}
                            </p>
                          )}
                          {vendor.responseTime && (
                            <p className="text-xs text-gray-500">
                              Response time: {vendor.responseTime}h
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    {rfp.status === 'open' || rfp.status === 'responses_received' ? (
                      <button className="px-4 py-2 text-indigo-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Send Reminder
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredRFPs.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No RFPs Found</h3>
            <p className="text-gray-600">No RFPs match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
