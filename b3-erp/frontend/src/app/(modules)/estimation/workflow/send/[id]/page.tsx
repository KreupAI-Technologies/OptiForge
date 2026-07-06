'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { costEstimateService } from '@/services/estimation-cost-estimate.service'
import { estimationPricingService } from '@/services/estimation-pricing.service'
import { ArrowLeft, Send, Mail, Phone, FileText, CheckCircle, AlertCircle } from 'lucide-react'

const companyId = 'default-company-id'

export default function SendEstimatePage() {
  const router = useRouter()
  const params = useParams()
  const draftId = params?.id as string

  const [sendMethod, setSendMethod] = useState<'email' | 'whatsapp'>('email')
  const [recipientEmail, setRecipientEmail] = useState('rajesh.kumar@prestigeconstructions.com')
  const [recipientPhone, setRecipientPhone] = useState('+91 98765 43210')
  const [subject, setSubject] = useState('Estimate - Luxury Villa Kitchen Setup')
  const [message, setMessage] = useState(`Dear Mr. Rajesh Kumar,

Please find attached the detailed estimate for your Luxury Villa Kitchen Setup project.

The estimate includes all materials, labor, and installation costs as discussed.

If you have any questions or need clarifications, please don't hesitate to contact us.

Best regards,
Estimation Team`)
  const [includeTerms, setIncludeTerms] = useState(true)
  const [includePaymentSchedule, setIncludePaymentSchedule] = useState(true)
  const [validityDays, setValidityDays] = useState('30')
  const [sending, setSending] = useState(false)

  const [draftData, setDraftData] = useState({
    estimateNumber: '',
    projectName: '',
    customerName: '',
    contactPerson: '',
    estimatedValue: 0,
    items: 0,
    completionPercent: 0
  })

  useEffect(() => {
    if (!draftId) return
    let mounted = true
    const load = async () => {
      try {
        const est = await costEstimateService.findOne(companyId, draftId)
        if (!mounted || !est) return
        setDraftData({
          estimateNumber: est.estimateNumber || '',
          projectName: est.title || '',
          customerName: est.customerName || '',
          contactPerson: est.customerName || '',
          estimatedValue: est.totalCost || 0,
          items: 0,
          completionPercent: 100,
        })
      } catch (err) {
        console.error('Failed to load estimate:', err)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [draftId])

  const handleSend = async () => {
    if (sending) return
    setSending(true)
    try {
      await estimationPricingService.sendToCustomer(companyId, draftId)
      router.push('/estimation/workflow/drafts')
    } catch (err) {
      console.error('Failed to send estimate:', err)
      alert('Failed to send estimate. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleCancel = () => {
    router.push('/estimation/workflow/drafts')
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="flex-none bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Send Estimate</h1>
              <p className="text-sm text-gray-500 mt-1">{draftData.estimateNumber}</p>
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={sending}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : 'Send Estimate'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <div className="grid grid-cols-3 gap-3">
          {/* Main Content */}
          <div className="col-span-2 space-y-3">
            {/* Estimate Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Estimate Summary
              </h2>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Project Name</p>
                  <p className="font-medium text-gray-900">{draftData.projectName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Customer</p>
                  <p className="font-medium text-gray-900">{draftData.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Contact Person</p>
                  <p className="font-medium text-gray-900">{draftData.contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Value</p>
                  <p className="font-semibold text-lg text-blue-600">
                    ₹{draftData.estimatedValue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Items</p>
                  <p className="font-medium text-gray-900">{draftData.items} items</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Completion</p>
                  <p className="font-medium text-green-600">{draftData.completionPercent}%</p>
                </div>
              </div>
            </div>

            {/* Delivery Method */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Delivery Method</h2>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={() => setSendMethod('email')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    sendMethod === 'email'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-blue-300'
                  }`}
                >
                  <Mail className="w-8 h-8 mb-2 text-blue-600" />
                  <p className="text-sm font-semibold text-gray-900">Email</p>
                  <p className="text-xs text-gray-600 mt-1">Send via email with PDF attachment</p>
                </button>

                <button
                  onClick={() => setSendMethod('whatsapp')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    sendMethod === 'whatsapp'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 bg-white hover:border-green-300'
                  }`}
                >
                  <Phone className="w-8 h-8 mb-2 text-green-600" />
                  <p className="text-sm font-semibold text-gray-900">WhatsApp</p>
                  <p className="text-xs text-gray-600 mt-1">Send via WhatsApp Business</p>
                </button>
              </div>

              {sendMethod === 'email' ? (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipient Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">PDF will be attached automatically</p>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Options */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Additional Options</h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="includeTerms"
                    checked={includeTerms}
                    onChange={(e) => setIncludeTerms(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="includeTerms" className="text-sm font-medium text-gray-700">
                    Include Terms & Conditions
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="includePayment"
                    checked={includePaymentSchedule}
                    onChange={(e) => setIncludePaymentSchedule(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="includePayment" className="text-sm font-medium text-gray-700">
                    Include Payment Schedule
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validity Period (Days)
                  </label>
                  <input
                    type="number"
                    value={validityDays}
                    onChange={(e) => setValidityDays(e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This estimate will be valid for {validityDays} days from the date of issue
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-1 space-y-3">
            {/* Checklist */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pre-send Checklist</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Estimate Complete</p>
                    <p className="text-xs text-gray-600">All items and pricing finalized</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Customer Details</p>
                    <p className="text-xs text-gray-600">Contact information verified</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Quality Check</p>
                    <p className="text-xs text-gray-600">Reviewed for accuracy</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Follow-up Reminder</p>
                    <p className="text-xs text-gray-600">Set reminder for 3 days</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-3">
                  Once sent, the estimate will be marked as "Sent" and customer will receive:
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Detailed estimate PDF</li>
                  <li>• Terms & conditions</li>
                  <li>• Payment schedule</li>
                  <li>• Validity information</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pb-6">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : 'Send Estimate'}
          </button>
        </div>
      </div>
    </div>
  )
}
