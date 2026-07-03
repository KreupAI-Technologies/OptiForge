'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Eye, Edit, Send, Download, Copy, Trash2, FileText, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Calendar, User } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui';
import { crmService } from '@/services/crm.service';

interface Proposal {
  id: string;
  proposalNumber: string;
  title: string;
  customer: string;
  customerCompany: string;
  contactPerson: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'negotiation';
  totalValue: number;
  sections: number;
  pages: number;
  submittedDate?: string;
  viewedDate?: string;
  respondedDate?: string;
  validUntil: string;
  probability: number;
  assignedTo: string;
  tags: string[];
  notes: string;
  attachments: number;
  lastActivity: string;
  createdDate: string;
}

const mockProposals: Proposal[] = [
  {
    id: '1',
    proposalNumber: 'PROP-2024-001',
    title: 'Enterprise Digital Transformation Initiative',
    customer: 'John Smith',
    customerCompany: 'Acme Corporation',
    contactPerson: 'John Smith - CTO',
    status: 'negotiation',
    totalValue: 450000,
    sections: 8,
    pages: 42,
    submittedDate: '2024-10-10',
    viewedDate: '2024-10-11',
    respondedDate: '2024-10-15',
    validUntil: '2024-11-10',
    probability: 75,
    assignedTo: 'Sarah Johnson',
    tags: ['Enterprise', 'Digital Transformation', 'Strategic'],
    notes: 'Follow-up meeting scheduled for next week to discuss pricing adjustments.',
    attachments: 5,
    lastActivity: '2024-10-18',
    createdDate: '2024-10-05',
  },
  {
    id: '2',
    proposalNumber: 'PROP-2024-002',
    title: 'Cloud Infrastructure Migration Services',
    customer: 'Emily Davis',
    customerCompany: 'TechStart Inc',
    contactPerson: 'Emily Davis - VP Engineering',
    status: 'sent',
    totalValue: 125000,
    sections: 6,
    pages: 28,
    submittedDate: '2024-10-15',
    viewedDate: '2024-10-16',
    validUntil: '2024-11-15',
    probability: 60,
    assignedTo: 'Michael Chen',
    tags: ['Cloud', 'Migration', 'Infrastructure'],
    notes: 'Waiting for technical review by their infrastructure team.',
    attachments: 3,
    lastActivity: '2024-10-17',
    createdDate: '2024-10-12',
  },
  {
    id: '3',
    proposalNumber: 'PROP-2024-003',
    title: 'Annual Support & Maintenance Contract',
    customer: 'Robert Johnson',
    customerCompany: 'Global Industries Ltd',
    contactPerson: 'Robert Johnson - IT Director',
    status: 'accepted',
    totalValue: 85000,
    sections: 4,
    pages: 15,
    submittedDate: '2024-09-25',
    viewedDate: '2024-09-26',
    respondedDate: '2024-10-02',
    validUntil: '2024-10-25',
    probability: 100,
    assignedTo: 'Sarah Johnson',
    tags: ['Support', 'Maintenance', 'Renewal'],
    notes: 'Accepted! Contract execution in progress.',
    attachments: 2,
    lastActivity: '2024-10-02',
    createdDate: '2024-09-20',
  },
  {
    id: '4',
    proposalNumber: 'PROP-2024-004',
    title: 'Custom ERP Implementation',
    customer: 'Lisa Anderson',
    customerCompany: 'Manufacturing Solutions Co',
    contactPerson: 'Lisa Anderson - COO',
    status: 'viewed',
    totalValue: 320000,
    sections: 10,
    pages: 55,
    submittedDate: '2024-10-08',
    viewedDate: '2024-10-09',
    validUntil: '2024-11-08',
    probability: 65,
    assignedTo: 'David Park',
    tags: ['ERP', 'Custom', 'Manufacturing'],
    notes: 'Proposal viewed multiple times. Awaiting decision from executive team.',
    attachments: 8,
    lastActivity: '2024-10-14',
    createdDate: '2024-10-01',
  },
  {
    id: '5',
    proposalNumber: 'PROP-2024-005',
    title: 'Cybersecurity Assessment & Implementation',
    customer: 'James Wilson',
    customerCompany: 'Financial Services Group',
    contactPerson: 'James Wilson - CISO',
    status: 'rejected',
    totalValue: 95000,
    sections: 5,
    pages: 22,
    submittedDate: '2024-09-15',
    viewedDate: '2024-09-16',
    respondedDate: '2024-09-28',
    validUntil: '2024-10-15',
    probability: 0,
    assignedTo: 'Michael Chen',
    tags: ['Security', 'Compliance', 'Assessment'],
    notes: 'Rejected due to budget constraints. Consider re-engagement in Q1 2025.',
    attachments: 4,
    lastActivity: '2024-09-28',
    createdDate: '2024-09-10',
  },
  {
    id: '6',
    proposalNumber: 'PROP-2024-006',
    title: 'Mobile App Development - iOS & Android',
    customer: 'Maria Garcia',
    customerCompany: 'Retail Innovations',
    contactPerson: 'Maria Garcia - Product Manager',
    status: 'draft',
    totalValue: 180000,
    sections: 7,
    pages: 35,
    validUntil: '2024-11-20',
    probability: 50,
    assignedTo: 'Sarah Johnson',
    tags: ['Mobile', 'iOS', 'Android', 'Development'],
    notes: 'Draft in progress. Waiting for final requirements from client.',
    attachments: 2,
    lastActivity: '2024-10-19',
    createdDate: '2024-10-15',
  },
  {
    id: '7',
    proposalNumber: 'PROP-2024-007',
    title: 'Data Analytics Platform Implementation',
    customer: 'Thomas Brown',
    customerCompany: 'Healthcare Systems Inc',
    contactPerson: 'Thomas Brown - Data Officer',
    status: 'expired',
    totalValue: 275000,
    sections: 9,
    pages: 48,
    submittedDate: '2024-08-15',
    viewedDate: '2024-08-16',
    validUntil: '2024-09-15',
    probability: 40,
    assignedTo: 'David Park',
    tags: ['Analytics', 'Healthcare', 'Data'],
    notes: 'Proposal expired. Client requested extension but project put on hold.',
    attachments: 6,
    lastActivity: '2024-09-20',
    createdDate: '2024-08-10',
  },
];

export default function ProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await crmService.proposals.getAll();
        if (!active) return;
        const rows = Array.isArray(data) ? data : [];
        setProposals(
          rows.map((p: any) => ({
            id: String(p?.id ?? ''),
            proposalNumber: p?.proposalNumber ?? '',
            title: p?.title ?? '',
            customer: p?.customer ?? '',
            customerCompany: p?.customerCompany ?? '',
            contactPerson: p?.contactPerson ?? '',
            status: (p?.status ?? 'draft') as Proposal['status'],
            totalValue: Number(p?.totalValue ?? 0),
            sections: Number(p?.sections ?? 0),
            pages: Number(p?.pages ?? 0),
            submittedDate: p?.submittedDate ?? undefined,
            viewedDate: p?.viewedDate ?? undefined,
            respondedDate: p?.respondedDate ?? undefined,
            validUntil: p?.validUntil ?? '',
            probability: Number(p?.probability ?? 0),
            assignedTo: p?.assignedTo ?? '',
            tags: Array.isArray(p?.tags) ? p.tags : [],
            notes: p?.notes ?? '',
            attachments: Number(p?.attachments ?? 0),
            lastActivity: p?.lastActivity ?? '',
            createdDate: p?.createdDate ?? (p?.createdAt ?? ''),
          })),
        );
      } catch {
        if (active) setProposals(mockProposals);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'negotiation'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'probability'>('date');
  const [proposalToDelete, setProposalToDelete] = useState<Proposal | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const filteredProposals = proposals
    .filter(proposal => {
      const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           proposal.proposalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           proposal.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           proposal.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || proposal.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return b.totalValue - a.totalValue;
        case 'probability':
          return b.probability - a.probability;
        case 'date':
        default:
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      }
    });

  const stats = {
    totalProposals: proposals.length,
    totalValue: proposals.reduce((sum, p) => sum + p.totalValue, 0),
    accepted: proposals.filter(p => p.status === 'accepted').length,
    avgProbability: Math.round(proposals.reduce((sum, p) => sum + p.probability, 0) / proposals.length),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'sent': return 'bg-blue-100 text-blue-700';
      case 'viewed': return 'bg-purple-100 text-purple-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'expired': return 'bg-orange-100 text-orange-700';
      case 'negotiation': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'sent': return <Send className="w-4 h-4" />;
      case 'viewed': return <Eye className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'expired': return <Clock className="w-4 h-4" />;
      case 'negotiation': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const isExpiringSoon = (validUntil: string) => {
    const daysUntilExpiry = Math.ceil((new Date(validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
  };

  const handleCreateProposal = () => {
    router.push('/crm/proposals/create');
  };

  const handleViewProposal = (proposal: Proposal) => {
    router.push(`/crm/proposals/view/${proposal.id}`);
  };

  const handleEditProposal = (proposal: Proposal) => {
    router.push(`/crm/proposals/edit/${proposal.id}`);
  };

  const handleDownloadProposal = (proposal: Proposal) => {
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${proposal.proposalNumber}.pdf`;
  };

  const handleCopyProposal = (proposal: Proposal) => {
    const newProposal: Proposal = {
      ...proposal,
      id: Date.now().toString(),
      proposalNumber: `PROP-${new Date().getFullYear()}-${(proposals.length + 1).toString().padStart(3, '0')}`,
      status: 'draft',
      createdDate: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0],
      submittedDate: undefined,
      viewedDate: undefined,
      respondedDate: undefined,
    };
    setProposals([...proposals, newProposal]);
  };

  const handleSendProposal = (proposal: Proposal) => {
    setProposals(proposals.map(p =>
      p.id === proposal.id
        ? { ...p, status: 'sent', submittedDate: new Date().toISOString().split('T')[0] }
        : p
    ));
  };

  const handleDeleteProposal = (proposal: Proposal) => {
    setProposalToDelete(proposal);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (proposalToDelete) {
      setProposals(proposals.filter(p => p.id !== proposalToDelete.id));
      setShowDeleteDialog(false);
      setProposalToDelete(null);
    }
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      <div className="mb-8">
        <div className="flex justify-end mb-3">
          <button
            onClick={handleCreateProposal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create Proposal
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
            <FileText className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.totalProposals}</div>
            <div className="text-blue-100">Total Proposals</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
            <DollarSign className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">${(stats.totalValue / 1000000).toFixed(1)}M</div>
            <div className="text-green-100">Total Value</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
            <CheckCircle className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.accepted}</div>
            <div className="text-purple-100">Accepted</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white">
            <AlertCircle className="w-8 h-8 opacity-80 mb-2" />
            <div className="text-3xl font-bold mb-1">{stats.avgProbability}%</div>
            <div className="text-orange-100">Avg Probability</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search proposals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="negotiation">Negotiation</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="value">Sort by Value</option>
              <option value="probability">Sort by Probability</option>
            </select>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-2">
        {filteredProposals.map((proposal) => {
          const expiringSoon = isExpiringSoon(proposal.validUntil);

          return (
            <div
              key={proposal.id}
              className={`bg-white rounded-lg border p-3 hover:shadow-md transition-shadow ${
                expiringSoon && proposal.status !== 'accepted' && proposal.status !== 'rejected' && proposal.status !== 'expired'
                  ? 'border-orange-300 bg-orange-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{proposal.title}</h3>
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                      {getStatusIcon(proposal.status)}
                      {proposal.status}
                    </span>
                    {expiringSoon && proposal.status !== 'accepted' && proposal.status !== 'rejected' && proposal.status !== 'expired' && (
                      <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                        <AlertCircle className="w-3 h-3" />
                        Expiring Soon
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">{proposal.proposalNumber}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {proposal.customerCompany}
                    </span>
                    <span>•</span>
                    <span>{proposal.contactPerson}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewProposal(proposal)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleEditProposal(proposal)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDownloadProposal(proposal)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => handleCopyProposal(proposal)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                  {proposal.status === 'draft' && (
                    <button
                      onClick={() => handleSendProposal(proposal)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1"
                    >
                      <Send className="w-4 h-4" />
                      Send
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteProposal(proposal)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-2">
                {/* Total Value */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-green-700 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs font-medium">Total Value</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    ${(proposal.totalValue / 1000).toFixed(0)}K
                  </div>
                </div>

                {/* Probability */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-purple-700 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Win Probability</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">{proposal.probability}%</div>
                  <div className="w-full bg-purple-200 rounded-full h-1.5 mt-2">
                    <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${proposal.probability}%` }}></div>
                  </div>
                </div>

                {/* Document Details */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-blue-700 mb-1">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-medium">Document</span>
                  </div>
                  <div className="text-sm font-medium text-blue-900">
                    {proposal.sections} sections
                  </div>
                  <div className="text-sm text-blue-700">{proposal.pages} pages</div>
                </div>

                {/* Valid Until */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-orange-700 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-medium">Valid Until</span>
                  </div>
                  <div className="text-sm font-bold text-orange-900">
                    {new Date(proposal.validUntil).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-orange-700">
                    {Math.ceil((new Date(proposal.validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                  </div>
                </div>

                {/* Assigned To */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-gray-700 mb-1">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-medium">Assigned To</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{proposal.assignedTo}</div>
                  <div className="text-xs text-gray-600">{proposal.attachments} attachments</div>
                </div>
              </div>

              {/* Timeline */}
              {(proposal.submittedDate || proposal.viewedDate || proposal.respondedDate) && (
                <div className="mb-2 pb-4 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-700 mb-2">Timeline:</div>
                  <div className="flex items-center gap-3 text-xs">
                    {proposal.submittedDate && (
                      <div className="flex items-center gap-2">
                        <Send className="w-3 h-3 text-blue-600" />
                        <span className="text-gray-600">Sent:</span>
                        <span className="font-medium">{new Date(proposal.submittedDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {proposal.viewedDate && (
                      <div className="flex items-center gap-2">
                        <Eye className="w-3 h-3 text-purple-600" />
                        <span className="text-gray-600">Viewed:</span>
                        <span className="font-medium">{new Date(proposal.viewedDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {proposal.respondedDate && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span className="text-gray-600">Responded:</span>
                        <span className="font-medium">{new Date(proposal.respondedDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {proposal.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Notes */}
              {proposal.notes && (
                <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 border border-gray-200">
                  <span className="font-medium">Notes: </span>
                  {proposal.notes}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                <span>Created: {new Date(proposal.createdDate).toLocaleDateString()}</span>
                <span>Last Activity: {new Date(proposal.lastActivity).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProposals.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="w-16 h-16 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {proposalToDelete && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setProposalToDelete(null);
          }}
          onConfirm={confirmDelete}
          title="Delete Proposal"
          message={`Are you sure you want to delete ${proposalToDelete.proposalNumber} - "${proposalToDelete.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
        />
      )}
    </div>
  );
}
