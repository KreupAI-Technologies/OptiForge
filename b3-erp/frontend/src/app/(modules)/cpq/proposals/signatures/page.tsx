'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  PenTool,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  Calendar,
  Mail,
  Phone,
  TrendingUp,
  Eye
} from 'lucide-react'
import {
  ViewProposalModal,
  SendReminderModal,
  SignatureDetailsModal,
  ExportReportModal,
  SignatureRecord
} from '@/components/cpq/ProposalSignatureModals'
import { exportToCsv } from '@/lib/export'
import { cpqProposalService } from '@/services/cpq/cpq-proposal.service'

interface ProposalSignature {
  id: string
  proposalNumber: string
  customerName: string
  contactPerson: string
  email: string
  phone: string
  proposalValue: number
  sentDate: string
  viewedDate?: string
  signedDate?: string
  expiryDate: string
  status: 'pending' | 'viewed' | 'signed' | 'declined' | 'expired'
  signatureMethod: 'digital' | 'email' | 'manual'
  remindersSent: number
  lastActivity: string
  ipAddress?: string
  deviceInfo?: string
}

export default function CPQProposalsSignaturesPage() {
  const router = useRouter()

  const [signatures, setSignatures] = useState<ProposalSignature[]>([])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const proposals = await cpqProposalService.findAllProposals()
        const list = Array.isArray(proposals) ? proposals : []
        const mapped: ProposalSignature[] = list.map((p: any) => {
          const sentDate = p?.sentAt || p?.createdAt || ''
          const signedDate = p?.respondedAt || p?.signedAt || p?.acceptedAt || undefined
          const rawStatus = p?.signatureStatus || p?.status || 'pending'
          const status: ProposalSignature['status'] =
            ['pending', 'viewed', 'signed', 'declined', 'expired'].includes(rawStatus)
              ? (rawStatus as ProposalSignature['status'])
              : rawStatus === 'accepted'
                ? 'signed'
                : rawStatus === 'rejected'
                  ? 'declined'
                  : rawStatus === 'sent'
                    ? 'pending'
                    : 'pending'
          return {
            id: p?.id ?? '',
            proposalNumber: p?.proposalNumber ?? '',
            customerName: p?.customerName ?? '',
            contactPerson: p?.contactPerson ?? '',
            email: p?.contactEmail ?? p?.email ?? '',
            phone: p?.contactPhone ?? p?.phone ?? '',
            proposalValue: Number(p?.totalValue) || 0,
            sentDate: typeof sentDate === 'string' ? sentDate.split('T')[0] : '',
            viewedDate: p?.lastViewedAt ? String(p.lastViewedAt).split('T')[0] : undefined,
            signedDate: signedDate ? String(signedDate).split('T')[0] : undefined,
            expiryDate: p?.validUntil ? String(p.validUntil).split('T')[0] : '',
            status,
            signatureMethod: (p?.signatureMethod as ProposalSignature['signatureMethod']) || 'digital',
            remindersSent: Number(p?.remindersSent) || 0,
            lastActivity: typeof (p?.updatedAt || sentDate) === 'string' ? String(p?.updatedAt || sentDate).split('T')[0] : '',
            ipAddress: p?.ipAddress,
            deviceInfo: p?.deviceInfo,
          }
        })
        if (active) setSignatures(mapped)
      } catch (e) {
        if (active) setSignatures([])
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'declined': return <XCircle className="h-5 w-5 text-red-600" />
      case 'viewed': return <Eye className="h-5 w-5 text-blue-600" />
      case 'expired': return <AlertCircle className="h-5 w-5 text-orange-600" />
      default: return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-gray-100 text-gray-700 border-gray-200',
      viewed: 'bg-blue-100 text-blue-700 border-blue-200',
      signed: 'bg-green-100 text-green-700 border-green-200',
      declined: 'bg-red-100 text-red-700 border-red-200',
      expired: 'bg-orange-100 text-orange-700 border-orange-200'
    }
    return colors[status] || colors.pending
  }

  const getMethodColor = (method: string) => {
    const colors: any = {
      digital: 'bg-blue-100 text-blue-700 border-blue-200',
      email: 'bg-purple-100 text-purple-700 border-purple-200',
      manual: 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colors[method] || colors.digital
  }

  const totalSignatures = signatures.length
  const pending = signatures.filter(s => s.status === 'pending').length
  const signed = signatures.filter(s => s.status === 'signed').length
  const viewed = signatures.filter(s => s.status === 'viewed').length
  const signatureRate = (totalSignatures > 0 ? (signed / totalSignatures) * 100 : 0).toFixed(1)
  const totalValue = signatures.filter(s => s.status === 'signed').reduce((sum, s) => sum + s.proposalValue, 0)

  // Modal states
  const [isViewProposalOpen, setIsViewProposalOpen] = useState(false)
  const [isReminderOpen, setIsReminderOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [selectedSignature, setSelectedSignature] = useState<ProposalSignature | null>(null)

  // Convert local signature to SignatureRecord
  const convertToSignatureRecord = (sig: ProposalSignature): SignatureRecord => ({
    id: sig.id,
    signatureId: sig.id,
    proposalNumber: sig.proposalNumber,
    proposalTitle: `Proposal for ${sig.customerName}`,
    customerName: sig.customerName,
    customerEmail: sig.email,
    signerName: sig.contactPerson,
    signerTitle: 'Decision Maker',
    status: sig.status,
    sentDate: sig.sentDate,
    viewedDate: sig.viewedDate,
    signedDate: sig.signedDate,
    expiryDate: sig.expiryDate,
    remindersSent: sig.remindersSent,
    ipAddress: sig.ipAddress,
    location: sig.ipAddress ? 'Bangalore, India' : undefined,
    device: sig.deviceInfo
  })

  // Modal handlers
  const handleViewProposal = (sig: ProposalSignature) => {
    setSelectedSignature(sig)
    setIsViewProposalOpen(true)
  }

  const handleSendReminder = (sig: ProposalSignature) => {
    setSelectedSignature(sig)
    setIsReminderOpen(true)
  }

  const handleViewDetails = (sig: ProposalSignature) => {
    setSelectedSignature(sig)
    setIsDetailsOpen(true)
  }

  const handleSendReminderAction = (data: any) => {
    console.log('Sending reminder:', data)
  }

  const handleExport = (settings: any) => {
    exportToCsv('proposal-signatures', signatures)
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Action Buttons */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            onClick={() => setIsExportOpen(true)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Sent</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalSignatures}</p>
              <p className="text-xs text-blue-700 mt-1">Proposals</p>
            </div>
            <FileText className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Pending</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{pending}</p>
              <p className="text-xs text-orange-700 mt-1">Awaiting signature</p>
            </div>
            <Clock className="h-10 w-10 text-orange-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Viewed</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{viewed}</p>
              <p className="text-xs text-purple-700 mt-1">Opened by customer</p>
            </div>
            <Eye className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Signed</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{signed}</p>
              <p className="text-xs text-green-700 mt-1">{signatureRate}% rate</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-5 border border-pink-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-pink-600">Signed Value</p>
              <p className="text-2xl font-bold text-pink-900 mt-1">₹{(totalValue / 10000000).toFixed(2)}Cr</p>
              <p className="text-xs text-pink-700 mt-1">Total contract value</p>
            </div>
            <TrendingUp className="h-10 w-10 text-pink-600" />
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-3 flex gap-3">
        <button className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-200 text-sm font-medium">
          All Proposals ({totalSignatures})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
          Pending ({pending})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
          Viewed ({viewed})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
          Signed ({signed})
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by proposal number, customer, or contact person..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Signatures List */}
      <div className="space-y-2">
        {signatures.map((signature) => (
          <div
            key={signature.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                {getStatusIcon(signature.status)}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900">{signature.proposalNumber}</h3>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getMethodColor(signature.signatureMethod)}`}>
                      {signature.signatureMethod}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{signature.customerName}</p>
                </div>
              </div>
              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(signature.status)}`}>
                {signature.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              {/* Contact Information */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-medium text-blue-600 mb-2 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Contact Person
                </p>
                <p className="text-sm font-semibold text-blue-900">{signature.contactPerson}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-blue-700">
                  <Mail className="h-3 w-3" />
                  {signature.email}
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-blue-700">
                  <Phone className="h-3 w-3" />
                  {signature.phone}
                </div>
              </div>

              {/* Proposal Value */}
              <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                <p className="text-xs font-medium text-green-600 mb-2">Proposal Value</p>
                <p className="text-lg font-bold text-green-900">₹{(signature.proposalValue / 100000).toFixed(2)}L</p>
                <p className="text-xs text-green-700 mt-1">Contract value</p>
              </div>

              {/* Timeline */}
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                <p className="text-xs font-medium text-purple-600 mb-2 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Timeline
                </p>
                <div className="space-y-1 text-xs text-purple-700">
                  <div className="flex justify-between">
                    <span>Sent:</span>
                    <span className="font-semibold">{new Date(signature.sentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                  </div>
                  {signature.viewedDate && (
                    <div className="flex justify-between">
                      <span>Viewed:</span>
                      <span className="font-semibold">{new Date(signature.viewedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Expires:</span>
                    <span className="font-semibold">{new Date(signature.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Reminders sent:</span>
                  <span className="font-semibold text-gray-900">{signature.remindersSent}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-600">Last activity:</span>
                  <span className="font-semibold text-gray-900">{new Date(signature.lastActivity).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                </div>
              </div>

              {signature.status === 'signed' && signature.ipAddress && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                  <div className="flex items-center gap-1 mb-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium text-green-600">Signature Details</span>
                  </div>
                  <div className="text-xs text-green-700 space-y-0.5">
                    <div>Signed: {new Date(signature.signedDate!).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    <div>IP: {signature.ipAddress}</div>
                    <div>Device: {signature.deviceInfo}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleViewProposal(signature)}
                className="flex-1 px-4 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Proposal
              </button>
              <button
                onClick={() => handleViewDetails(signature)}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                Details
              </button>
              {signature.status === 'pending' && (
                <button
                  onClick={() => handleSendReminder(signature)}
                  className="flex-1 px-4 py-2 text-sm text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 flex items-center justify-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Send Reminder
                </button>
              )}
              {signature.status === 'signed' && (
                <button className="flex-1 px-4 py-2 text-sm text-green-600 bg-green-50 rounded-lg hover:bg-green-100 flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Signed Copy
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Digital Signature Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <PenTool className="h-4 w-4" />
          Digital Signature Features:
        </h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li><strong>Legally Binding:</strong> Digital signatures are legally valid and enforceable</li>
          <li><strong>Audit Trail:</strong> Complete tracking of when and where proposals were signed</li>
          <li><strong>Email Notifications:</strong> Automatic reminders for pending signatures</li>
          <li><strong>Mobile Friendly:</strong> Customers can sign from any device, anywhere</li>
          <li><strong>Secure:</strong> IP address and device tracking for verification</li>
        </ul>
      </div>

      {/* Modals */}
      {isViewProposalOpen && selectedSignature && (
        <ViewProposalModal
          isOpen={isViewProposalOpen}
          onClose={() => {
            setIsViewProposalOpen(false)
            setSelectedSignature(null)
          }}
          signature={convertToSignatureRecord(selectedSignature)}
        />
      )}

      {isReminderOpen && selectedSignature && (
        <SendReminderModal
          isOpen={isReminderOpen}
          onClose={() => {
            setIsReminderOpen(false)
            setSelectedSignature(null)
          }}
          onSend={handleSendReminderAction}
          signature={convertToSignatureRecord(selectedSignature)}
        />
      )}

      {isDetailsOpen && selectedSignature && (
        <SignatureDetailsModal
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false)
            setSelectedSignature(null)
          }}
          signature={convertToSignatureRecord(selectedSignature)}
        />
      )}

      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExport}
      />
    </div>
  )
}
