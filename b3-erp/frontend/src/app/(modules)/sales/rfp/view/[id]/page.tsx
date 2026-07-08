'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Edit2,
  Loader2,
  AlertCircle,
  FileText,
  Building,
  Calendar,
  IndianRupee,
  User,
} from 'lucide-react';
import { RFPService } from '@/services/rfp.service';
import { RFP } from '@/types/rfp';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  submitted: 'bg-blue-100 text-blue-700 border-blue-300',
  under_review: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  in_progress: 'bg-purple-100 text-purple-700 border-purple-300',
  awaiting_approval: 'bg-purple-100 text-purple-700 border-purple-300',
  approved: 'bg-green-100 text-green-700 border-green-300',
  rejected: 'bg-red-100 text-red-700 border-red-300',
  expired: 'bg-red-100 text-red-700 border-red-300',
  withdrawn: 'bg-gray-100 text-gray-700 border-gray-300',
};

export default function RFPViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [rfp, setRfp] = useState<RFP | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RFPService.getRFPById(params.id);
      setRfp(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load RFP');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="w-full min-h-screen px-4 py-2 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading RFP…</p>
        </div>
      </div>
    );
  }

  if (error || !rfp) {
    return (
      <div className="w-full min-h-screen px-4 py-2 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p className="text-red-600 font-medium">{error || 'RFP not found'}</p>
          <button
            onClick={() => router.push('/sales/rfp')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to RFPs
          </button>
        </div>
      </div>
    );
  }

  const field = (label: string, value?: string | number | null) => (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-gray-900">{value !== undefined && value !== null && value !== '' ? value : '—'}</p>
    </div>
  );

  return (
    <div className="w-full min-h-screen px-4 py-2">
      <button
        onClick={() => router.push('/sales/rfp')}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
      >
        <ChevronLeft className="w-4 h-4" /> Back to RFPs
      </button>

      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{rfp.title}</h1>
            <p className="text-sm text-gray-600">{rfp.rfpNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusColors[rfp.status] || 'bg-gray-100 text-gray-700 border-gray-300'}`}>
            {String(rfp.status).replace('_', ' ').toUpperCase()}
          </span>
          <button
            onClick={() => router.push(`/sales/rfp/edit/${rfp.id}`)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2 text-sm"
          >
            <Edit2 className="w-4 h-4" /> Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Building className="h-5 w-5 text-green-600" /> Customer & Project
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {field('Customer', rfp.customerName)}
              {field('Contact Person', rfp.contactPerson)}
              {field('Contact Email', rfp.contactEmail)}
              {field('Contact Phone', rfp.contactPhone)}
              {field('Category', rfp.category)}
              {field('Type', rfp.type)}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Scope & Requirements</h3>
            <div className="space-y-3">
              {field('Description', rfp.description)}
              {field('Project Scope', rfp.projectScope)}
              {field('Technical Specifications', rfp.technicalSpecifications)}
              {field('Payment Terms', rfp.paymentTerms)}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-blue-600" /> Commercial
            </h3>
            <div className="space-y-3">
              {field('Estimated Budget', rfp.estimatedBudget !== undefined ? `${rfp.currency || ''} ${Number(rfp.estimatedBudget).toLocaleString('en-IN')}` : undefined)}
              {field('Proposal Value', rfp.proposalValue !== undefined ? `${rfp.currency || ''} ${Number(rfp.proposalValue).toLocaleString('en-IN')}` : undefined)}
              {field('Win Probability', rfp.winProbability !== undefined ? `${rfp.winProbability}%` : undefined)}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" /> Timeline
            </h3>
            <div className="space-y-3">
              {field('Issue Date', rfp.issueDate ? new Date(rfp.issueDate).toLocaleDateString('en-IN') : undefined)}
              {field('Submission Deadline', rfp.submissionDeadline ? new Date(rfp.submissionDeadline).toLocaleDateString('en-IN') : undefined)}
              {field('Expected Start', rfp.expectedStartDate ? new Date(rfp.expectedStartDate).toLocaleDateString('en-IN') : undefined)}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="h-5 w-5 text-orange-600" /> Assignment
            </h3>
            <div className="space-y-3">
              {field('Sales Person', rfp.salesPerson)}
              {field('Assigned To', rfp.assignedTo)}
              {field('Technical Lead', rfp.technicalLead)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
