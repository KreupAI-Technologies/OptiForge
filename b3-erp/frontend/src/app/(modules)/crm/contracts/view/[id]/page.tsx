'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Download, FileText, DollarSign, Calendar, AlertCircle, CheckCircle, RefreshCw, User, Building2, Clock, TrendingUp, Package, Mail, Phone, MapPin, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui';
import { crmService } from '@/services/crm.service';

export default function ViewContractPage() {
  const router = useRouter();
  const params = useParams();
  const contractId = params?.id as string;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const [contract, setContract] = useState<any>({
    id: contractId,
    contractNumber: '',
    title: '',
    customer: '',
    customerCompany: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    type: 'license',
    status: 'active',
    value: 0,
    recurringValue: 0,
    billingCycle: 'annually',
    startDate: '',
    endDate: '',
    signedDate: '',
    autoRenew: false,
    renewalNoticeDays: 0,
    paymentTerms: '',
    assignedTo: '',
    assignedEmail: '',
    tags: [],
    attachments: [],
    lastInvoiceDate: '',
    nextInvoiceDate: '',
    totalInvoiced: 0,
    outstandingAmount: 0,
    createdDate: '',
    notes: '',
    termsAndConditions: '',
    deliverables: [],
  });

  useEffect(() => {
    if (!contractId) return;
    let active = true;
    (async () => {
      try {
        const c: any = await crmService.contracts.getById(contractId);
        if (!active || !c) return;
        setContract({
          id: c.id ?? contractId,
          contractNumber: c.contractNumber ?? '',
          title: c.title ?? '',
          customer: c.customer ?? c.contactPerson ?? '',
          customerCompany: c.customerCompany ?? c.customerName ?? '',
          customerEmail: c.customerEmail ?? '',
          customerPhone: c.customerPhone ?? '',
          customerAddress: c.customerAddress ?? '',
          type: c.type ?? c.category ?? 'license',
          status: c.status ?? 'active',
          value: Number(c.value ?? 0),
          recurringValue: Number(c.recurringValue ?? 0),
          billingCycle: c.billingCycle ?? 'annually',
          startDate: c.startDate ?? '',
          endDate: c.endDate ?? '',
          signedDate: c.signedDate ?? '',
          autoRenew: Boolean(c.autoRenew),
          renewalNoticeDays: Number(c.renewalNoticeDays ?? 0),
          paymentTerms: c.paymentTerms ?? '',
          assignedTo: c.assignedTo ?? '',
          assignedEmail: c.assignedEmail ?? '',
          tags: Array.isArray(c.tags) ? c.tags : [],
          attachments: Array.isArray(c.attachments) ? c.attachments : [],
          lastInvoiceDate: c.lastInvoiceDate ?? '',
          nextInvoiceDate: c.nextInvoiceDate ?? '',
          totalInvoiced: Number(c.totalInvoiced ?? 0),
          outstandingAmount: Number(c.outstandingAmount ?? 0),
          createdDate: c.createdDate ?? '',
          notes: c.notes ?? '',
          termsAndConditions: c.termsAndConditions ?? '',
          deliverables: Array.isArray(c.deliverables) ? c.deliverables : [],
        });
      } catch (err) {
        console.error('Failed to load contract', err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [contractId]);

  const getDaysUntilEnd = () => {
    return Math.ceil((new Date(contract.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  };

  const getContractProgress = () => {
    return ((new Date().getTime() - new Date(contract.startDate).getTime()) /
      (new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) * 100).toFixed(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending_renewal': return 'bg-yellow-100 text-yellow-700';
      case 'expired': return 'bg-orange-100 text-orange-700';
      case 'terminated': return 'bg-red-100 text-red-700';
      case 'suspended': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'service': return 'bg-blue-100 text-blue-700';
      case 'subscription': return 'bg-purple-100 text-purple-700';
      case 'license': return 'bg-green-100 text-green-700';
      case 'support': return 'bg-orange-100 text-orange-700';
      case 'maintenance': return 'bg-teal-100 text-teal-700';
      case 'custom': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleEdit = () => {
    router.push(`/crm/contracts/edit/${contract.id}`);
  };

  const handleDownload = () => {
    console.log('Downloading contract');
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await crmService.contracts.delete(contractId);
    } catch (err) {
      console.error('Failed to delete contract', err);
    }
    router.push('/crm/contracts');
  };

  return (
    <div className="w-full h-full px-3 py-2 ">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Contracts
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{contract.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
                  {contract.status.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${getTypeColor(contract.type)}`}>
                  {contract.type}
                </span>
                {contract.autoRenew && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                    <RefreshCw className="w-4 h-4" />
                    Auto-Renew
                  </span>
                )}
              </div>
              <p className="text-gray-600">{contract.contractNumber}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-3">
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
                <DollarSign className="w-8 h-8 opacity-80 mb-2" />
                <div className="text-3xl font-bold mb-1">${(contract.value / 1000).toFixed(0)}K</div>
                <div className="text-green-100 text-sm">Total Value</div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
                <TrendingUp className="w-8 h-8 opacity-80 mb-2" />
                <div className="text-3xl font-bold mb-1">${(contract.recurringValue / 1000).toFixed(0)}K</div>
                <div className="text-blue-100 text-sm capitalize">{contract.billingCycle}</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
                <CheckCircle className="w-8 h-8 opacity-80 mb-2" />
                <div className="text-3xl font-bold mb-1">${(contract.totalInvoiced / 1000).toFixed(0)}K</div>
                <div className="text-purple-100 text-sm">Invoiced</div>
              </div>

              <div className={`bg-gradient-to-br rounded-lg p-3 text-white ${
                contract.outstandingAmount > 0 ? 'from-red-500 to-red-600' : 'from-gray-500 to-gray-600'
              }`}>
                <AlertCircle className="w-8 h-8 opacity-80 mb-2" />
                <div className="text-3xl font-bold mb-1">${(contract.outstandingAmount / 1000).toFixed(1)}K</div>
                <div className={`text-sm ${contract.outstandingAmount > 0 ? 'text-red-100' : 'text-gray-100'}`}>
                  Outstanding
                </div>
              </div>
            </div>

            {/* Contract Progress */}
            {contract.status === 'active' && (
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Contract Progress</h2>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Timeline Progress</span>
                    <span className="font-medium text-gray-900">{getContractProgress()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                      style={{ width: `${getContractProgress()}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{new Date(contract.startDate).toLocaleDateString()}</span>
                    <span className="font-medium text-gray-900">
                      {getDaysUntilEnd()} days remaining
                    </span>
                    <span>{new Date(contract.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Deliverables */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Deliverables & Services</h2>
              <ul className="space-y-3">
                {contract.deliverables.map((deliverable: any, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{deliverable}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Terms & Conditions</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{contract.termsAndConditions}</p>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Internal Notes</h2>
              <p className="text-gray-700 leading-relaxed">{contract.notes}</p>
            </div>

            {/* Attachments */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Attachments</h2>
              <div className="space-y-3">
                {contract.attachments.map((file: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">{file.name}</div>
                        <div className="text-sm text-gray-600">{file.size} • {new Date(file.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            {/* Contract Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contract Details</h3>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Contract Period</div>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(contract.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    to {new Date(contract.endDate).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Signed Date</div>
                  <div className="text-gray-900">
                    {contract.signedDate ? new Date(contract.signedDate).toLocaleDateString() : 'Not signed'}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Payment Terms</div>
                  <div className="text-gray-900">{contract.paymentTerms}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Billing Cycle</div>
                  <div className="text-gray-900 capitalize">{contract.billingCycle}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Renewal Notice</div>
                  <div className="text-gray-900">{contract.renewalNoticeDays} days</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Next Invoice</div>
                  <div className="text-gray-900">
                    {contract.nextInvoiceDate ? new Date(contract.nextInvoiceDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Customer Information</h3>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Company</div>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium">{contract.customerCompany}</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Contact Person</div>
                  <div className="flex items-center gap-2 text-gray-900">
                    <User className="w-4 h-4" />
                    <span>{contract.customer}</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Email</div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${contract.customerEmail}`} className="hover:underline">
                      {contract.customerEmail}
                    </a>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Phone</div>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Phone className="w-4 h-4" />
                    <span>{contract.customerPhone}</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Address</div>
                  <div className="flex items-start gap-2 text-gray-900">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{contract.customerAddress}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned To */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Assigned To</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-900">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{contract.assignedTo}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${contract.assignedEmail}`} className="text-sm hover:underline">
                    {contract.assignedEmail}
                  </a>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {contract.tags.map((tag: any, index: number) => (
                  <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
              <div className="text-sm text-gray-600 mb-1">Created</div>
              <div className="text-gray-900">{new Date(contract.createdDate).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Contract"
        message={`Are you sure you want to delete "${contract.title}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
      />
    </div>
  );
}
