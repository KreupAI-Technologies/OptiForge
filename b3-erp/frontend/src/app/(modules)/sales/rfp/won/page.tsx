'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  Trophy,
  CheckCircle,
  Calendar,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Package,
  FileText,
  Building,
  User,
  Phone,
  Mail,
  Clock,
  Award,
  Target,
  Download,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { salesPagesService } from '@/services/sales-pages.service';

interface WonRFP {
  id: string;
  rfpNumber: string;
  title: string;
  category: string;
  rfpIssueDate: string;
  evaluationDate: string;
  awardDate: string;
  contractValue: number;
  originalEstimate: number;
  savings: number;
  savingsPercent: number;
  selectedVendor: {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    location: string;
  };
  contractStatus: 'contract_pending' | 'contract_signed' | 'po_generated' | 'in_progress' | 'completed';
  poNumber?: string;
  deliveryTimeline: number; // days
  expectedDeliveryDate: string;
  paymentTerms: string;
  warranty: string;
  itemsCount: number;
  totalResponses: number;
  evaluationScore: number;
  competitiveAdvantage: string[];
  keyDeliverables: string[];
  milestones: {
    name: string;
    dueDate: string;
    status: 'pending' | 'in_progress' | 'completed' | 'delayed';
    completionPercent: number;
  }[];
  contractDocument?: string;
  notes?: string;
}

export default function WonRFPPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [wonRFPs, setWonRFPs] = useState<WonRFP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await salesPagesService.getQuotations();
        const mapped: WonRFP[] = raw.map((r: any) => ({
          id: String(r.id ?? ''),
          rfpNumber: r.rfpNumber ?? '',
          title: r.title ?? '',
          category: r.category ?? '',
          rfpIssueDate: r.rfpIssueDate ?? '',
          evaluationDate: r.evaluationDate ?? '',
          awardDate: r.awardDate ?? '',
          contractValue: r.contractValue ?? 0,
          originalEstimate: r.originalEstimate ?? 0,
          savings: r.savings ?? 0,
          savingsPercent: r.savingsPercent ?? 0,
          selectedVendor: {
            name: r.selectedVendor?.name ?? '',
            contactPerson: r.selectedVendor?.contactPerson ?? '',
            email: r.selectedVendor?.email ?? '',
            phone: r.selectedVendor?.phone ?? '',
            location: r.selectedVendor?.location ?? ''
          },
          contractStatus: (r.contractStatus ?? 'contract_pending') as WonRFP['contractStatus'],
          poNumber: r.poNumber,
          deliveryTimeline: r.deliveryTimeline ?? 0,
          expectedDeliveryDate: r.expectedDeliveryDate ?? '',
          paymentTerms: r.paymentTerms ?? '',
          warranty: r.warranty ?? '',
          itemsCount: r.itemsCount ?? 0,
          totalResponses: r.totalResponses ?? 0,
          evaluationScore: r.evaluationScore ?? 0,
          competitiveAdvantage: r.competitiveAdvantage ?? [],
          keyDeliverables: r.keyDeliverables ?? [],
          milestones: (r.milestones ?? []).map((m: any) => ({
            name: m.name ?? '',
            dueDate: m.dueDate ?? '',
            status: (m.status ?? 'pending') as WonRFP['milestones'][number]['status'],
            completionPercent: m.completionPercent ?? 0
          })),
          contractDocument: r.contractDocument,
          notes: r.notes
        }));
        if (!cancelled) setWonRFPs(mapped);
      } catch (e) {
        if (!cancelled) { setLoadError(e instanceof Error ? e.message : 'Failed to load'); setWonRFPs([]); }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const _seedWonRFPs: WonRFP[] = [
    {
      id: '1',
      rfpNumber: 'RFP-2025-001',
      title: 'Industrial Machinery Components Manufacturing',
      category: 'manufacturing',
      rfpIssueDate: '2025-10-10',
      evaluationDate: '2025-10-18',
      awardDate: '2025-10-19',
      contractValue: 4750000,
      originalEstimate: 5000000,
      savings: 250000,
      savingsPercent: 5.0,
      selectedVendor: {
        name: 'Tata Steel Limited',
        contactPerson: 'Rajesh Kumar',
        email: 'sales@tatasteel.com',
        phone: '+91 98765 43210',
        location: 'Mumbai, Maharashtra'
      },
      contractStatus: 'in_progress',
      poNumber: 'PO-2025-1234',
      deliveryTimeline: 45,
      expectedDeliveryDate: '2025-12-05',
      paymentTerms: '30% advance, 70% on delivery',
      warranty: '24 months comprehensive',
      itemsCount: 15,
      totalResponses: 6,
      evaluationScore: 92,
      competitiveAdvantage: [
        'Best price-quality ratio',
        'Excellent track record (24 orders completed)',
        'ISO certified facilities',
        'Strong technical capabilities'
      ],
      keyDeliverables: [
        '250 units of CNC machined components',
        'Quality inspection reports',
        'Installation support documentation',
        'Training materials for operators'
      ],
      milestones: [
        {
          name: 'Contract Signing',
          dueDate: '2025-10-20',
          status: 'completed',
          completionPercent: 100
        },
        {
          name: 'Advance Payment',
          dueDate: '2025-10-22',
          status: 'completed',
          completionPercent: 100
        },
        {
          name: 'Production Start',
          dueDate: '2025-10-25',
          status: 'completed',
          completionPercent: 100
        },
        {
          name: 'Quality Inspection',
          dueDate: '2025-11-20',
          status: 'in_progress',
          completionPercent: 60
        },
        {
          name: 'Delivery',
          dueDate: '2025-12-05',
          status: 'pending',
          completionPercent: 0
        },
        {
          name: 'Final Payment',
          dueDate: '2025-12-10',
          status: 'pending',
          completionPercent: 0
        }
      ],
      contractDocument: 'Contract_RFP-2025-001.pdf',
      notes: 'Project progressing well. Quality inspection phase ahead of schedule.'
    },
    {
      id: '2',
      rfpNumber: 'RFP-2025-003',
      title: 'Hydraulic System Components',
      category: 'components',
      rfpIssueDate: '2025-10-08',
      evaluationDate: '2025-10-16',
      awardDate: '2025-10-17',
      contractValue: 1050000,
      originalEstimate: 1200000,
      savings: 150000,
      savingsPercent: 12.5,
      selectedVendor: {
        name: 'Bosch Rexroth India',
        contactPerson: 'Suresh Menon',
        email: 'sales@boschrexroth.in',
        phone: '+91 98765 43230',
        location: 'Pune, Maharashtra'
      },
      contractStatus: 'completed',
      poNumber: 'PO-2025-1198',
      deliveryTimeline: 35,
      expectedDeliveryDate: '2025-11-22',
      paymentTerms: '30% advance, 70% on delivery',
      warranty: '24 months',
      itemsCount: 8,
      totalResponses: 5,
      evaluationScore: 95,
      competitiveAdvantage: [
        'Exceptional 12.5% cost savings',
        'Global brand reputation',
        'Extensive service network in India',
        '95% evaluation score - highest'
      ],
      keyDeliverables: [
        'Complete hydraulic system components',
        'Installation and commissioning',
        'Operator training (2 days)',
        'Maintenance schedule documentation'
      ],
      milestones: [
        {
          name: 'Contract Signing',
          dueDate: '2025-10-18',
          status: 'completed',
          completionPercent: 100
        },
        {
          name: 'Advance Payment',
          dueDate: '2025-10-20',
          status: 'completed',
          completionPercent: 100
        },
        {
          name: 'Production & Testing',
          dueDate: '2025-11-10',
          status: 'completed',
          completionPercent: 100
        },
        {
          name: 'Delivery',
          dueDate: '2025-11-22',
          status: 'completed',
          completionPercent: 100
        },
        {
          name: 'Installation',
          dueDate: '2025-11-25',
          status: 'completed',
          completionPercent: 100
        },
        {
          name: 'Final Payment',
          dueDate: '2025-11-27',
          status: 'completed',
          completionPercent: 100
        }
      ],
      contractDocument: 'Contract_RFP-2025-003.pdf',
      notes: 'Successfully completed. Excellent vendor performance, delivered 2 days ahead of schedule.'
    },
    {
      id: '3',
      rfpNumber: 'RFP-2025-007',
      title: 'Raw Material Procurement - Steel Alloy',
      category: 'raw_materials',
      rfpIssueDate: '2025-09-20',
      evaluationDate: '2025-09-28',
      awardDate: '2025-09-30',
      contractValue: 3200000,
      originalEstimate: 3500000,
      savings: 300000,
      savingsPercent: 8.6,
      selectedVendor: {
        name: 'JSW Steel',
        contactPerson: 'Amit Sharma',
        email: 'business@jswsteel.in',
        phone: '+91 98765 43211',
        location: 'Bengaluru, Karnataka'
      },
      contractStatus: 'contract_signed',
      poNumber: 'PO-2025-1067',
      deliveryTimeline: 30,
      expectedDeliveryDate: '2025-11-05',
      paymentTerms: '25% advance, 75% on delivery',
      warranty: 'Quality guarantee - 6 months',
      itemsCount: 5,
      totalResponses: 4,
      evaluationScore: 88,
      competitiveAdvantage: [
        'Premium quality steel alloy',
        'Certified to international standards',
        'Reliable supply chain',
        'Competitive pricing'
      ],
      keyDeliverables: [
        '500 tons of steel alloy grade 304',
        'Material test certificates',
        'Quality assurance documents',
        'Delivery in batches of 100 tons'
      ],
      milestones: [
        {
          name: 'Contract Signing',
          dueDate: '2025-10-02',
          status: 'completed',
          completionPercent: 100
        },
        {
          name: 'Advance Payment',
          dueDate: '2025-10-05',
          status: 'completed',
          completionPercent: 100
        },
        {
          name: 'First Batch Delivery',
          dueDate: '2025-10-20',
          status: 'completed',
          completionPercent: 100
        },
        {
          name: 'Second Batch Delivery',
          dueDate: '2025-10-30',
          status: 'in_progress',
          completionPercent: 75
        },
        {
          name: 'Final Batch Delivery',
          dueDate: '2025-11-05',
          status: 'pending',
          completionPercent: 0
        },
        {
          name: 'Final Payment',
          dueDate: '2025-11-10',
          status: 'pending',
          completionPercent: 0
        }
      ],
      contractDocument: 'Contract_RFP-2025-007.pdf'
    },
    {
      id: '4',
      rfpNumber: 'RFP-2025-012',
      title: 'Industrial Automation Equipment',
      category: 'equipment',
      rfpIssueDate: '2025-09-15',
      evaluationDate: '2025-09-25',
      awardDate: '2025-09-27',
      contractValue: 8200000,
      originalEstimate: 8500000,
      savings: 300000,
      savingsPercent: 3.5,
      selectedVendor: {
        name: 'Siemens India',
        contactPerson: 'Priya Nair',
        email: 'automation@siemens.in',
        phone: '+91 98765 43240',
        location: 'Bengaluru, Karnataka'
      },
      contractStatus: 'po_generated',
      poNumber: 'PO-2025-1012',
      deliveryTimeline: 60,
      expectedDeliveryDate: '2025-12-01',
      paymentTerms: '40% advance, 30% on delivery, 30% post installation',
      warranty: '36 months comprehensive with AMC',
      itemsCount: 12,
      totalResponses: 6,
      evaluationScore: 90,
      competitiveAdvantage: [
        'Industry-leading technology',
        'Comprehensive support package',
        'Proven automation solutions',
        'Extended warranty coverage'
      ],
      keyDeliverables: [
        'Complete PLC system (Siemens S7-1500)',
        'HMI panels and touch screens',
        'Industrial sensors and actuators',
        'SCADA software license',
        'System integration and commissioning',
        'On-site training (5 days)'
      ],
      milestones: [
        {
          name: 'Contract Signing',
          dueDate: '2025-09-30',
          status: 'completed',
          completionPercent: 100
        },
        {
          name: 'PO Generation',
          dueDate: '2025-10-02',
          status: 'completed',
          completionPercent: 100
        },
        {
          name: 'Advance Payment',
          dueDate: '2025-10-05',
          status: 'in_progress',
          completionPercent: 80
        },
        {
          name: 'Equipment Manufacturing',
          dueDate: '2025-11-15',
          status: 'pending',
          completionPercent: 0
        },
        {
          name: 'Delivery & Installation',
          dueDate: '2025-12-01',
          status: 'pending',
          completionPercent: 0
        },
        {
          name: 'Commissioning',
          dueDate: '2025-12-15',
          status: 'pending',
          completionPercent: 0
        },
        {
          name: 'Final Payment',
          dueDate: '2025-12-20',
          status: 'pending',
          completionPercent: 0
        }
      ],
      contractDocument: 'Contract_RFP-2025-012.pdf',
      notes: 'Large-scale automation project. Advance payment processing in progress.'
    },
    {
      id: '5',
      rfpNumber: 'RFP-2025-015',
      title: 'Heavy Duty Conveyor System',
      category: 'machinery',
      rfpIssueDate: '2025-08-25',
      evaluationDate: '2025-09-05',
      awardDate: '2025-09-08',
      contractValue: 3200000,
      originalEstimate: 3500000,
      savings: 300000,
      savingsPercent: 8.6,
      selectedVendor: {
        name: 'Fenner Conveyors',
        contactPerson: 'Karan Singh',
        email: 'sales@fenner.in',
        phone: '+91 98765 43250',
        location: 'Pune, Maharashtra'
      },
      contractStatus: 'contract_pending',
      deliveryTimeline: 50,
      expectedDeliveryDate: '2025-11-15',
      paymentTerms: '35% advance, 65% on delivery',
      warranty: '18 months parts and labor',
      itemsCount: 6,
      totalResponses: 4,
      evaluationScore: 87,
      competitiveAdvantage: [
        'Specialized in heavy-duty systems',
        '8.6% cost savings',
        'Local manufacturing facility',
        'Quick response time for service'
      ],
      keyDeliverables: [
        'Heavy-duty belt conveyor system (50m length)',
        'Drive units and motor assemblies',
        'Control panel and safety systems',
        'Installation and alignment',
        'Load testing and certification'
      ],
      milestones: [
        {
          name: 'Contract Finalization',
          dueDate: '2025-09-12',
          status: 'in_progress',
          completionPercent: 90
        },
        {
          name: 'Advance Payment',
          dueDate: '2025-09-15',
          status: 'pending',
          completionPercent: 0
        },
        {
          name: 'Manufacturing',
          dueDate: '2025-10-25',
          status: 'pending',
          completionPercent: 0
        },
        {
          name: 'Site Preparation',
          dueDate: '2025-11-05',
          status: 'pending',
          completionPercent: 0
        },
        {
          name: 'Installation',
          dueDate: '2025-11-15',
          status: 'pending',
          completionPercent: 0
        },
        {
          name: 'Final Payment',
          dueDate: '2025-11-20',
          status: 'pending',
          completionPercent: 0
        }
      ],
      contractDocument: 'Contract_RFP-2025-015_Draft.pdf',
      notes: 'Contract under legal review. Expected to be signed this week.'
    }
  ];

  const filteredRFPs = wonRFPs.filter(rfp => {
    const matchesSearch =
      rfp.rfpNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rfp.selectedVendor.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || rfp.contractStatus === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || rfp.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalValue = wonRFPs.reduce((sum, rfp) => sum + rfp.contractValue, 0);
  const totalSavings = wonRFPs.reduce((sum, rfp) => sum + rfp.savings, 0);
  const avgSavings = (totalSavings / wonRFPs.reduce((sum, rfp) => sum + rfp.originalEstimate, 0) * 100).toFixed(1);
  const completedContracts = wonRFPs.filter(r => r.contractStatus === 'completed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'contract_pending': return 'bg-yellow-100 text-yellow-700';
      case 'contract_signed': return 'bg-blue-100 text-blue-700';
      case 'po_generated': return 'bg-purple-100 text-purple-700';
      case 'in_progress': return 'bg-cyan-100 text-cyan-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'contract_pending': return 'Contract Pending';
      case 'contract_signed': return 'Contract Signed';
      case 'po_generated': return 'PO Generated';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'delayed': return 'bg-red-500';
      case 'pending': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50 to-amber-50 px-3 py-2">
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
              Performance Analytics
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-lg hover:from-yellow-700 hover:to-amber-700 transition-colors">
              Download All Contracts
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Won RFPs</p>
                <p className="text-3xl font-bold mt-2">{wonRFPs.length}</p>
                <p className="text-yellow-100 text-xs mt-1">Total contracts</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Trophy className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Contract Value</p>
                <p className="text-3xl font-bold mt-2">₹{(totalValue / 10000000).toFixed(1)}Cr</p>
                <p className="text-green-100 text-xs mt-1">Across all contracts</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <IndianRupee className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Savings</p>
                <p className="text-3xl font-bold mt-2">₹{(totalSavings / 100000).toFixed(1)}L</p>
                <p className="text-blue-100 text-xs mt-1">{avgSavings}% average savings</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <TrendingDown className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-3 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold mt-2">{completedContracts}</p>
                <p className="text-purple-100 text-xs mt-1">Successfully delivered</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <CheckCircle className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search RFPs or vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="contract_pending">Contract Pending</option>
              <option value="contract_signed">Contract Signed</option>
              <option value="po_generated">PO Generated</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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

        {/* Won RFPs List */}
        <div className="space-y-3">
          {filteredRFPs.map((rfp) => (
            <div key={rfp.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                  <div className="flex items-start gap-2">
                    <div className="bg-gradient-to-br from-yellow-500 to-amber-600 p-3 rounded-lg">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">{rfp.rfpNumber}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(rfp.contractStatus)}`}>
                          {getStatusLabel(rfp.contractStatus)}
                        </span>
                      </div>
                      <p className="text-lg text-gray-700 mb-2">{rfp.title}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Awarded: {new Date(rfp.awardDate).toLocaleDateString('en-IN')}</span>
                        </div>
                        {rfp.poNumber && (
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>PO: {rfp.poNumber}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          <span>Score: {rfp.evaluationScore}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contract Value & Savings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-3 text-white">
                    <p className="text-green-100 text-sm font-medium">Contract Value</p>
                    <p className="text-3xl font-bold mt-1">₹{(rfp.contractValue / 100000).toFixed(2)}L</p>
                    <p className="text-green-100 text-xs mt-1">{rfp.itemsCount} items</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg p-3 text-white">
                    <p className="text-blue-100 text-sm font-medium">Cost Savings</p>
                    <p className="text-3xl font-bold mt-1 flex items-center gap-2">
                      <TrendingDown className="w-6 h-6" />
                      ₹{(rfp.savings / 100000).toFixed(2)}L
                    </p>
                    <p className="text-blue-100 text-xs mt-1">{rfp.savingsPercent}% below estimate</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg p-3 text-white">
                    <p className="text-purple-100 text-sm font-medium">Delivery Timeline</p>
                    <p className="text-3xl font-bold mt-1">{rfp.deliveryTimeline}</p>
                    <p className="text-purple-100 text-xs mt-1">days</p>
                  </div>
                </div>

                {/* Selected Vendor */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Award className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-900 mb-2">Selected Vendor</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <p className="font-semibold text-gray-900">{rfp.selectedVendor.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{rfp.selectedVendor.contactPerson}</p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            <span>{rfp.selectedVendor.email}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span>{rfp.selectedVendor.phone}</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Payment Terms:</span>
                            <span className="ml-2 font-medium text-gray-900">{rfp.paymentTerms}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Warranty:</span>
                            <span className="ml-2 font-medium text-gray-900">{rfp.warranty}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Expected Delivery:</span>
                            <span className="ml-2 font-medium text-gray-900">{new Date(rfp.expectedDeliveryDate).toLocaleDateString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-yellow-600" />
                    Project Milestones
                  </h4>
                  <div className="space-y-3">
                    {rfp.milestones.map((milestone, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getMilestoneStatusColor(milestone.status)}`} />
                              <span className="font-medium text-gray-900">{milestone.name}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-gray-600">{new Date(milestone.dueDate).toLocaleDateString('en-IN')}</span>
                              <span className="font-semibold text-gray-900">{milestone.completionPercent}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${getMilestoneStatusColor(milestone.status)}`}
                              style={{ width: `${milestone.completionPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competitive Advantage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Competitive Advantage
                    </h4>
                    <ul className="space-y-1">
                      {rfp.competitiveAdvantage.map((item, idx) => (
                        <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Key Deliverables
                    </h4>
                    <ul className="space-y-1">
                      {rfp.keyDeliverables.map((item, idx) => (
                        <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Notes */}
                {rfp.notes && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">{rfp.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-lg hover:from-yellow-700 hover:to-amber-700 transition-colors flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View Contract
                  </button>
                  <button className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button className="px-4 py-2 text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Track Progress
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRFPs.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-400 mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Won RFPs Found</h3>
            <p className="text-gray-600">No RFPs match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Missing import
import { Eye } from 'lucide-react';
