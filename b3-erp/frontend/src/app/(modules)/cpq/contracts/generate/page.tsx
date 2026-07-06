'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cpqContractService } from '@/services/cpq/cpq-contract.service'
import {
  FileText,
  Plus,
  Calendar,
  User,
  Building,
  IndianRupee,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Send,
  Eye
} from 'lucide-react'

export default function CPQContractsGeneratePage() {
  const router = useRouter()

  const [contractData, setContractData] = useState({
    // Source Information
    sourceType: 'proposal',
    proposalNumber: 'PROP-2024-1234',
    quoteNumber: 'QT-2024-1234',
    
    // Customer Information
    customerName: 'Prestige Properties Ltd',
    contactPerson: 'Mr. Arun Sharma',
    email: 'arun.sharma@prestigeprops.com',
    phone: '+91 98765 43210',
    address: '123 MG Road, Bangalore - 560001',
    
    // Contract Details
    contractType: 'standard',
    contractValue: 2850000,
    currency: 'INR',
    startDate: '2024-11-01',
    endDate: '2025-10-31',
    duration: '12 months',
    
    // Payment Terms
    paymentTerms: 'net-30',
    advancePayment: 50,
    milestones: [
      { name: 'Advance', percentage: 50, dueDate: '2024-11-01', amount: 1425000 },
      { name: 'On Delivery', percentage: 40, dueDate: '2025-02-01', amount: 1140000 },
      { name: 'On Installation', percentage: 10, dueDate: '2025-03-01', amount: 285000 }
    ],
    
    // Delivery Terms
    deliveryTerms: 'delivered-to-site',
    deliveryDate: '2025-02-01',
    installationIncluded: true,
    
    // Warranty & Support
    warrantyPeriod: '36 months',
    supportLevel: 'premium',
    
    // Legal Clauses
    selectedClauses: [
      'confidentiality',
      'intellectual-property',
      'liability',
      'termination',
      'dispute-resolution'
    ],
    
    // Additional Terms
    additionalTerms: 'All materials to be of premium quality as specified. Installation to be completed within 5 working days.'
  })

  const [selectedTemplate, setSelectedTemplate] = useState('standard-sales')

  const [templates, setTemplates] = useState<{ id: string; name: string; description: string }[]>([
    { id: 'standard-sales', name: 'Standard Sales Contract', description: 'Standard B2B sales agreement' },
    { id: 'premium-service', name: 'Premium Service Contract', description: 'With extended warranty and support' },
    { id: 'bulk-order', name: 'Bulk Order Contract', description: 'For volume purchases with special terms' },
    { id: 'custom', name: 'Custom Contract', description: 'Build from scratch with custom clauses' }
  ])

  useEffect(() => {
    const load = async () => {
      const data = await cpqContractService.findAllTemplates()
      const list = Array.isArray(data) ? data : []
      if (list.length > 0) {
        setTemplates(list.map((t: any) => ({
          id: t?.id ?? '',
          name: t?.templateName ?? '',
          description: t?.description ?? '',
        })))
      }
    }
    load()
  }, [])

  const handleGenerate = async () => {
    const payload: any = {
      customerName: contractData.customerName,
      title: templates.find(t => t.id === selectedTemplate)?.name ?? contractData.customerName,
      contractType: (contractData.contractType === 'standard' ? 'sales' : contractData.contractType) as any,
      totalValue: contractData.contractValue ?? 0,
      currency: contractData.currency ?? 'INR',
      startDate: contractData.startDate,
      endDate: contractData.endDate,
      paymentTerms: contractData.paymentTerms,
      notes: contractData.additionalTerms,
    }
    if (selectedTemplate) {
      await cpqContractService.createFromTemplate(selectedTemplate, payload)
    } else {
      await cpqContractService.createContract(payload)
    }
    router.push('/cpq/contracts')
  }

  const clauseCategories = [
    {
      category: 'Essential',
      clauses: [
        { id: 'confidentiality', name: 'Confidentiality', required: true },
        { id: 'intellectual-property', name: 'Intellectual Property Rights', required: true },
        { id: 'payment-terms', name: 'Payment Terms & Conditions', required: true },
        { id: 'delivery', name: 'Delivery & Installation', required: true }
      ]
    },
    {
      category: 'Legal',
      clauses: [
        { id: 'liability', name: 'Limitation of Liability', required: false },
        { id: 'indemnification', name: 'Indemnification', required: false },
        { id: 'termination', name: 'Termination Clause', required: true },
        { id: 'dispute-resolution', name: 'Dispute Resolution', required: false }
      ]
    },
    {
      category: 'Operational',
      clauses: [
        { id: 'warranty', name: 'Warranty Terms', required: true },
        { id: 'support', name: 'Support & Maintenance', required: false },
        { id: 'force-majeure', name: 'Force Majeure', required: false },
        { id: 'amendments', name: 'Amendments & Modifications', required: false }
      ]
    }
  ]

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Header */}
      <div className="mb-3 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Generate Contract</h2>
          <p className="text-sm text-gray-600 mt-1">From Proposal: {contractData.proposalNumber}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Download className="h-4 w-4" />
            Save Draft
          </button>
          <button onClick={handleGenerate} className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Generate Contract
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-3 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
            <span className="text-sm font-medium text-blue-600">Select Template</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
            <span className="text-sm font-medium text-blue-600">Contract Details</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
            <span className="text-sm text-gray-600">Select Clauses</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">4</div>
            <span className="text-sm text-gray-600">Review & Generate</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Form - Left 2 columns */}
        <div className="lg:col-span-2 space-y-3">
          {/* Template Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Select Contract Template
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
                  <p className="text-xs text-gray-600">{template.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Building className="h-5 w-5 text-green-600" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={contractData.customerName}
                  onChange={(e) => setContractData({...contractData, customerName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={contractData.contactPerson}
                  onChange={(e) => setContractData({...contractData, contactPerson: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={contractData.email}
                  onChange={(e) => setContractData({...contractData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={contractData.phone}
                  onChange={(e) => setContractData({...contractData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={contractData.address}
                  onChange={(e) => setContractData({...contractData, address: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Contract Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Contract Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
                <select
                  value={contractData.contractType}
                  onChange={(e) => setContractData({...contractData, contractType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="standard">Standard Sales</option>
                  <option value="service">Service Agreement</option>
                  <option value="maintenance">Maintenance Contract</option>
                  <option value="rental">Rental Agreement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contract Value</label>
                <input
                  type="number"
                  value={contractData.contractValue}
                  onChange={(e) => setContractData({...contractData, contractValue: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={contractData.startDate}
                  onChange={(e) => setContractData({...contractData, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={contractData.endDate}
                  onChange={(e) => setContractData({...contractData, endDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Period</label>
                <input
                  type="text"
                  value={contractData.warrantyPeriod}
                  onChange={(e) => setContractData({...contractData, warrantyPeriod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Support Level</label>
                <select
                  value={contractData.supportLevel}
                  onChange={(e) => setContractData({...contractData, supportLevel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clause Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Contract Clauses</h3>
            <div className="space-y-2">
              {clauseCategories.map((cat) => (
                <div key={cat.category}>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">{cat.category} Clauses</h4>
                  <div className="space-y-2">
                    {cat.clauses.map((clause) => (
                      <label key={clause.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={contractData.selectedClauses.includes(clause.id)}
                          disabled={clause.required}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setContractData({
                                ...contractData,
                                selectedClauses: [...contractData.selectedClauses, clause.id]
                              })
                            } else {
                              setContractData({
                                ...contractData,
                                selectedClauses: contractData.selectedClauses.filter(c => c !== clause.id)
                              })
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-900">{clause.name}</span>
                        {clause.required && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Required</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Sidebar - Right column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Contract Summary</h3>
            
            <div className="space-y-2">
              <div className="pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Contract Value</p>
                <p className="text-2xl font-bold text-blue-600">₹{(contractData.contractValue / 100000).toFixed(2)}L</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Template:</span>
                  <span className="font-medium text-gray-900">
                    {templates.find(t => t.id === selectedTemplate)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900">{contractData.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(contractData.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Date:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(contractData.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Payment Milestones</p>
                <div className="space-y-2">
                  {contractData.milestones.map((milestone, idx) => (
                    <div key={idx} className="bg-gray-50 rounded p-2 text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{milestone.name}</span>
                        <span className="text-blue-600 font-semibold">{milestone.percentage}%</span>
                      </div>
                      <div className="text-gray-600">₹{(milestone.amount / 100000).toFixed(2)}L</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Selected Clauses</p>
                <p className="text-2xl font-bold text-purple-600">{contractData.selectedClauses.length}</p>
                <p className="text-xs text-gray-600">Legal clauses included</p>
              </div>

              <button onClick={handleGenerate} className="w-full mt-4 px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium">
                <FileText className="h-5 w-5" />
                Generate Contract
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Contract Generation Process:</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li><strong>1. Select Template:</strong> Choose appropriate contract type for your needs</li>
          <li><strong>2. Fill Details:</strong> Enter customer and contract information</li>
          <li><strong>3. Add Clauses:</strong> Select legal clauses (required clauses auto-included)</li>
          <li><strong>4. Preview:</strong> Review complete contract before generation</li>
          <li><strong>5. Generate:</strong> Create final contract document for signatures</li>
        </ul>
      </div>
    </div>
  )
}
