'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Send,
  TrendingUp,
  FileText,
  CheckCircle,
  Award,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { RFPService } from '@/services/rfp.service';
import { RFP as ServiceRFP, RFPStatus } from '@/types/rfp';

interface RFP {
  id: string;
  rfpNumber: string;
  clientName: string;
  projectTitle: string;
  industry: 'manufacturing' | 'construction' | 'automotive' | 'pharma' | 'energy' | 'electronics';
  submissionDate: string;
  closingDate: string;
  estimatedValue: number;
  status: 'draft' | 'submitted' | 'under_review' | 'shortlisted' | 'won' | 'lost';
  salesOwner: string;
  requirementDetails: string;
  technicalSpecs: string;
  commercialTerms: string;
  competitorInfo: string;
  winProbability: number;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  submitted: 'bg-blue-100 text-blue-700 border-blue-300',
  under_review: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  shortlisted: 'bg-purple-100 text-purple-700 border-purple-300',
  won: 'bg-green-100 text-green-700 border-green-300',
  lost: 'bg-red-100 text-red-700 border-red-300',
};

const industryOptions = [
  { value: '', label: 'All Industries' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'construction', label: 'Construction' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'pharma', label: 'Pharmaceutical' },
  { value: 'energy', label: 'Energy' },
  { value: 'electronics', label: 'Electronics' },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

export default function RFPPage() {
  const router = useRouter();
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadRFPs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RFPService.getAllRFPs();

      // Map service RFPs to page format
      const mappedRFPs: RFP[] = data.map((rfp: ServiceRFP) => {
        // Map status from service format to page format
        let pageStatus: RFP['status'] = 'draft';
        const statusValue = rfp.status;
        if (statusValue === RFPStatus.DRAFT) pageStatus = 'draft';
        else if (statusValue === RFPStatus.SUBMITTED) pageStatus = 'submitted';
        else if (statusValue === RFPStatus.UNDER_REVIEW) pageStatus = 'under_review';
        else if (statusValue === RFPStatus.IN_PROGRESS) pageStatus = 'shortlisted';
        else if (statusValue === RFPStatus.APPROVED) pageStatus = 'won';
        else if (statusValue === RFPStatus.REJECTED) pageStatus = 'lost';
        else if (statusValue === RFPStatus.AWAITING_APPROVAL) pageStatus = 'shortlisted';

        // Map industry (default to manufacturing if not in our list)
        let industry: RFP['industry'] = 'manufacturing';
        const categoryLower = (rfp.category || '').toLowerCase();
        if (categoryLower.includes('construction')) industry = 'construction';
        else if (categoryLower.includes('auto')) industry = 'automotive';
        else if (categoryLower.includes('pharma')) industry = 'pharma';
        else if (categoryLower.includes('energy')) industry = 'energy';
        else if (categoryLower.includes('electron')) industry = 'electronics';

        return {
          id: rfp.id,
          rfpNumber: rfp.rfpNumber,
          clientName: rfp.customerName,
          projectTitle: rfp.title,
          industry: industry,
          submissionDate: rfp.issueDate.split('T')[0],
          closingDate: rfp.submissionDeadline.split('T')[0],
          estimatedValue: rfp.estimatedBudget || 0,
          status: pageStatus,
          salesOwner: rfp.salesPerson || rfp.assignedTo || 'Unassigned',
          requirementDetails: rfp.projectScope || '',
          technicalSpecs: rfp.technicalSpecifications || '',
          commercialTerms: rfp.paymentTerms || '',
          competitorInfo: rfp.competitorAnalysis || '',
          winProbability: rfp.winProbability || 50,
        };
      });

      setRfps(mappedRFPs);
    } catch (err) {
      setError('Failed to load RFPs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRFPs();
  }, [loadRFPs]);

  const filteredRFPs = rfps.filter((rfp) => {
    const matchesSearch =
      rfp.rfpNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfp.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfp.projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || rfp.status === statusFilter;
    const matchesIndustry = !industryFilter || rfp.industry === industryFilter;
    return matchesSearch && matchesStatus && matchesIndustry;
  });

  const totalPages = Math.ceil(filteredRFPs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRFPs = filteredRFPs.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    activeRFPs: rfps.filter((r) => ['submitted', 'under_review', 'shortlisted'].includes(r.status)).length,
    underReview: rfps.filter((r) => r.status === 'under_review').length,
    won: rfps.filter((r) => r.status === 'won').length,
    winRate: rfps.filter((r) => ['won', 'lost'].includes(r.status)).length > 0
      ? Math.round(
          (rfps.filter((r) => r.status === 'won').length /
            rfps.filter((r) => ['won', 'lost'].includes(r.status)).length) *
            100
        )
      : 0,
  };

  const handleExport = () => {
    exportToCsv('rfp', filteredRFPs as unknown as Record<string, unknown>[]);
  };

  const handleView = (id: string) => {
    router.push(`/sales/rfp/view/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/sales/rfp/edit/${id}`);
  };

  const handleSubmit = async (id: string) => {
    setSubmittingId(id);
    setActionError(null);
    try {
      await RFPService.updateStatus(id, RFPStatus.SUBMITTED, 'Current User');
      await loadRFPs();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to submit RFP.');
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen px-4 py-2 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading RFPs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen px-4 py-2 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen px-4 py-2">
      {actionError && (
        <div className="mb-3 flex items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700">×</button>
        </div>
      )}
      {/* Stats with Export Button */}
      <div className="mb-3 flex items-start gap-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 flex-1">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active RFPs</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.activeRFPs}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Under Review</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.underReview}</p>
              </div>
              <Filter className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Won RFPs</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.won}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Win Rate</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">{stats.winRate}%</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors h-fit flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by RFP number, client, or project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {industryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-24rem)]">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    RFP Number
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Client Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Project Title
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Submission Date
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Closing Date
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Estimated Value
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Sales Owner
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedRFPs.map((rfp) => (
                  <tr key={rfp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{rfp.rfpNumber}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{rfp.clientName}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-sm text-gray-900">{rfp.projectTitle}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-sm text-gray-600 capitalize">{rfp.industry}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {new Date(rfp.submissionDate).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {new Date(rfp.closingDate).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        ₹{(rfp.estimatedValue / 100000).toFixed(2)}L
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                          statusColors[rfp.status]
                        }`}
                      >
                        {rfp.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{rfp.salesOwner}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(rfp.id)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                         
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(rfp.id)}
                          className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                         
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {rfp.status === 'draft' && (
                          <button
                            onClick={() => handleSubmit(rfp.id)}
                            disabled={submittingId === rfp.id}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                          >
                            {submittingId === rfp.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-3 py-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredRFPs.length)} of{' '}
                {filteredRFPs.length} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
