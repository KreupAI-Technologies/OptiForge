'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Eye,
  Save,
  Send,
  Download,
  Image,
  Type,
  Table,
  Layout,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Settings,
  Palette,
  CheckCircle
} from 'lucide-react'
import {
  PreviewModal,
  SendProposalModal,
  ExportPDFModal,
  SaveDraftModal,
  SettingsModal,
  SectionEditorModal,
  Proposal,
  ProposalSection as ProposalSectionType
} from '@/components/cpq/ProposalBuilderModals'
import { exportToCsv } from '@/lib/export'
import { cpqProposalService } from '@/services/cpq/cpq-proposal.service'

interface ProposalSection {
  id: string
  type: 'cover' | 'text' | 'quote' | 'table' | 'image' | 'terms'
  title: string
  content: string
  order: number
  visible: boolean
}

export default function CPQProposalsBuilderPage() {
  const router = useRouter()

  const [proposalData, setProposalData] = useState({
    title: 'Premium Modular Kitchen Proposal',
    customer: 'Prestige Properties Ltd',
    quoteNumber: 'QT-2024-1234',
    validUntil: '2024-11-18',
    preparedBy: 'Rajesh Kumar'
  })

  const [sections, setSections] = useState<ProposalSection[]>([
    {
      id: 'SEC-001',
      type: 'cover',
      title: 'Cover Page',
      content: 'Premium Modular Kitchen Solution for Prestige Properties Ltd',
      order: 1,
      visible: true
    },
    {
      id: 'SEC-002',
      type: 'text',
      title: 'Executive Summary',
      content: 'This proposal outlines a comprehensive modular kitchen solution tailored to meet your specific requirements...',
      order: 2,
      visible: true
    },
    {
      id: 'SEC-003',
      type: 'quote',
      title: 'Pricing Details',
      content: 'Quote Reference: QT-2024-1234\nTotal Value: ₹28.50L\nDiscount: 18%\nNet Amount: ₹23.37L',
      order: 3,
      visible: true
    },
    {
      id: 'SEC-004',
      type: 'table',
      title: 'Product Specifications',
      content: 'Detailed specifications table with materials, dimensions, and features',
      order: 4,
      visible: true
    },
    {
      id: 'SEC-005',
      type: 'image',
      title: 'Design Visualizations',
      content: '3D renders and design mockups',
      order: 5,
      visible: true
    },
    {
      id: 'SEC-006',
      type: 'text',
      title: 'Implementation Timeline',
      content: 'Project execution timeline: 45 days from approval\n- Week 1-2: Material procurement\n- Week 3-5: Manufacturing\n- Week 6: Installation',
      order: 6,
      visible: true
    },
    {
      id: 'SEC-007',
      type: 'terms',
      title: 'Terms & Conditions',
      content: 'Payment Terms: 50% advance, 50% on delivery\nWarranty: 3 years comprehensive\nDelivery: 45 days',
      order: 7,
      visible: true
    }
  ])

  const [selectedSection, setSelectedSection] = useState<string | null>(null)

  // Modal states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSendOpen, setIsSendOpen] = useState(false)
  const [isExportOpen, setIsExportOpen] = useState(false)
  const [isSaveDraftOpen, setIsSaveDraftOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSectionEditorOpen, setIsSectionEditorOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<ProposalSection | null>(null)

  // Build full proposal object for modals
  const fullProposal: Proposal = {
    id: 'PROP-001',
    proposalNumber: proposalData.quoteNumber,
    customerName: proposalData.customer,
    contactEmail: 'contact@prestigeproperties.com',
    contactPhone: '+91 98765 43210',
    quoteId: proposalData.quoteNumber,
    sections: sections,
    status: 'draft',
    totalValue: 2850000,
    validUntil: proposalData.validUntil,
    createdDate: new Date().toISOString().split('T')[0],
    branding: {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      accentColor: '#ec4899'
    },
    settings: {
      pageSize: 'A4',
      orientation: 'portrait',
      includePageNumbers: true,
      includeTableOfContents: true,
      includeTermsAndConditions: true
    }
  }

  // Modal handlers
  const mapProposalPayload = (data: any) => ({
    title: data?.title ?? proposalData.title,
    customerName: data?.customerName ?? proposalData.customer,
    proposalNumber: data?.proposalNumber ?? proposalData.quoteNumber,
    quoteId: proposalData.quoteNumber,
    validUntil: data?.validUntil ?? proposalData.validUntil,
    totalValue: fullProposal.totalValue,
    sections: (Array.isArray(sections) ? sections : []).map((s, i) => ({
      sectionId: s.id,
      title: s.title,
      content: s.content,
      displayOrder: s.order ?? i + 1,
      isIncluded: s.visible,
    })),
  })

  const handleSendProposal = async (data: any) => {
    try {
      const created = await cpqProposalService.createProposal({
        ...mapProposalPayload(data),
        status: 'draft',
      } as any)
      if (created?.id) {
        await cpqProposalService.sendProposal(created.id, 'current-user')
      }
      setIsSendOpen(false)
    } catch (e) {
      // service handles fallback; swallow to avoid crashing UI
    }
  }

  const handleExportPDF = (settings: any) => {
    exportToCsv('proposal-builder', sections)
  }

  const handleSaveDraft = async (data: any) => {
    try {
      await cpqProposalService.createProposal({
        ...mapProposalPayload(data),
        status: 'draft',
      } as any)
      setIsSaveDraftOpen(false)
    } catch (e) {
      // service handles fallback; swallow to avoid crashing UI
    }
  }

  const handleSaveSettings = async (settings: any) => {
    try {
      const created = await cpqProposalService.createProposal({
        ...mapProposalPayload(proposalData),
        status: 'draft',
      } as any)
      if (created?.id) {
        await cpqProposalService.updateProposal(created.id, { ...(settings || {}) } as any)
      }
      setIsSettingsOpen(false)
    } catch (e) {
      // service handles fallback; swallow to avoid crashing UI
    }
  }

  const handleEditSection = (section: ProposalSection) => {
    setEditingSection(section)
    setIsSectionEditorOpen(true)
  }

  const handleSaveSection = (section: ProposalSectionType) => {
    if (editingSection) {
      setSections(sections.map(s =>
        s.id === section.id ? section : s
      ))
    } else {
      setSections([...sections, section])
    }
  }

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'cover': return <FileText className="h-4 w-4" />
      case 'text': return <Type className="h-4 w-4" />
      case 'quote': return <FileText className="h-4 w-4" />
      case 'table': return <Table className="h-4 w-4" />
      case 'image': return <Image className="h-4 w-4" />
      case 'terms': return <CheckCircle className="h-4 w-4" />
      default: return <Layout className="h-4 w-4" />
    }
  }

  const getSectionColor = (type: string) => {
    const colors: any = {
      cover: 'bg-blue-50 border-blue-200 text-blue-700',
      text: 'bg-gray-50 border-gray-200 text-gray-700',
      quote: 'bg-green-50 border-green-200 text-green-700',
      table: 'bg-purple-50 border-purple-200 text-purple-700',
      image: 'bg-orange-50 border-orange-200 text-orange-700',
      terms: 'bg-red-50 border-red-200 text-red-700'
    }
    return colors[type] || colors.text
  }

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === id)
    if (direction === 'up' && index > 0) {
      const newSections = [...sections]
      ;[newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]]
      setSections(newSections.map((s, i) => ({ ...s, order: i + 1 })))
    } else if (direction === 'down' && index < sections.length - 1) {
      const newSections = [...sections]
      ;[newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]]
      setSections(newSections.map((s, i) => ({ ...s, order: i + 1 })))
    }
  }

  const toggleSectionVisibility = (id: string) => {
    setSections(sections.map(s => 
      s.id === id ? { ...s, visible: !s.visible } : s
    ))
  }

  const deleteSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })))
  }

  const addSection = (type: ProposalSection['type']) => {
    const newSection: ProposalSection = {
      id: `SEC-${String(sections.length + 1).padStart(3, '0')}`,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      content: '',
      order: sections.length + 1,
      visible: true
    }
    setSections([...sections, newSection])
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Header Actions */}
      <div className="mb-3 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{proposalData.title}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {proposalData.customer} • {proposalData.quoteNumber}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            onClick={() => setIsSaveDraftOpen(true)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>
          <button
            onClick={() => setIsExportOpen(true)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </button>
          <button
            onClick={() => setIsSendOpen(true)}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send Proposal
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Sections</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{sections.length}</p>
          <p className="text-xs text-blue-700 mt-1">{sections.filter(s => s.visible).length} visible</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-sm font-medium text-green-600">Quote Value</p>
          <p className="text-2xl font-bold text-green-900 mt-1">₹28.50L</p>
          <p className="text-xs text-green-700 mt-1">From {proposalData.quoteNumber}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <p className="text-sm font-medium text-orange-600">Valid Until</p>
          <p className="text-lg font-bold text-orange-900 mt-1">
            {new Date(proposalData.validUntil).toLocaleDateString('en-IN', { 
              day: '2-digit', 
              month: 'short',
              year: 'numeric'
            })}
          </p>
          <p className="text-xs text-orange-700 mt-1">29 days remaining</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <p className="text-sm font-medium text-purple-600">Prepared By</p>
          <p className="text-base font-bold text-purple-900 mt-1">{proposalData.preparedBy}</p>
          <p className="text-xs text-purple-700 mt-1">Sales Executive</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Sidebar - Section Library */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Section
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => addSection('text')}
                className="w-full px-3 py-2 text-sm text-left text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center gap-2"
              >
                <Type className="h-4 w-4" />
                Text Section
              </button>
              <button
                onClick={() => addSection('quote')}
                className="w-full px-3 py-2 text-sm text-left text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Quote Details
              </button>
              <button
                onClick={() => addSection('table')}
                className="w-full px-3 py-2 text-sm text-left text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center gap-2"
              >
                <Table className="h-4 w-4" />
                Table
              </button>
              <button
                onClick={() => addSection('image')}
                className="w-full px-3 py-2 text-sm text-left text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center gap-2"
              >
                <Image className="h-4 w-4" />
                Image Gallery
              </button>
              <button
                onClick={() => addSection('terms')}
                className="w-full px-3 py-2 text-sm text-left text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Terms & Conditions
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Proposal Settings
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700">Header Image</label>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-full mt-1 px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center justify-center gap-2 border border-gray-200"
                  >
                    <Image className="h-4 w-4" />
                    Upload Logo
                  </button>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Color Theme</label>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-full mt-1 px-3 py-2 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center justify-center gap-2 border border-gray-200"
                  >
                    <Palette className="h-4 w-4" />
                    Customize Colors
                  </button>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Page Layout</label>
                  <select className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Standard (A4)</option>
                    <option>Letter (US)</option>
                    <option>Custom</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Section Builder */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Proposal Structure ({sections.length} sections)
              </h3>
            </div>
            
            <div className="p-4 space-y-3">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`rounded-lg border-2 transition-all ${
                    selectedSection === section.id
                      ? 'border-blue-400 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg border ${getSectionColor(section.type)}`}>
                          {getSectionIcon(section.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => {
                                setSections(sections.map(s => 
                                  s.id === section.id ? { ...s, title: e.target.value } : s
                                ))
                              }}
                              className="text-sm font-semibold text-gray-900 bg-transparent border-none focus:ring-0 p-0"
                            />
                            <span className="text-xs text-gray-500">#{section.order}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">{section.content}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => toggleSectionVisibility(section.id)}
                          className={`p-1.5 rounded hover:bg-gray-100 ${
                            section.visible ? 'text-green-600' : 'text-gray-400'
                          }`}
                          title={section.visible ? 'Hide section' : 'Show section'}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveSection(section.id, 'up')}
                          disabled={index === 0}
                          className="p-1.5 text-gray-600 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <MoveUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveSection(section.id, 'down')}
                          disabled={index === sections.length - 1}
                          className="p-1.5 text-gray-600 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <MoveDown className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteSection(section.id)}
                          className="p-1.5 text-red-600 rounded hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {selectedSection === section.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Content</label>
                        <textarea
                          value={section.content}
                          onChange={(e) => {
                            setSections(sections.map(s => 
                              s.id === section.id ? { ...s, content: e.target.value } : s
                            ))
                          }}
                          rows={4}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter section content..."
                        />
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
                      className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {selectedSection === section.id ? 'Collapse' : 'Edit Content'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Builder Tips */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Proposal Builder Tips:</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li><strong>Drag & Reorder:</strong> Use up/down arrows to arrange sections in your preferred order</li>
              <li><strong>Show/Hide:</strong> Toggle eye icon to include or exclude sections from final proposal</li>
              <li><strong>Live Preview:</strong> Click Preview to see how your proposal will look to customers</li>
              <li><strong>Auto-Save:</strong> Changes are automatically saved as you build your proposal</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        proposal={fullProposal}
      />

      <SendProposalModal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        onSend={handleSendProposal}
        proposal={fullProposal}
      />

      <ExportPDFModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onExport={handleExportPDF}
        proposal={fullProposal}
      />

      <SaveDraftModal
        isOpen={isSaveDraftOpen}
        onClose={() => setIsSaveDraftOpen(false)}
        onSave={handleSaveDraft}
        proposal={fullProposal}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        proposal={fullProposal}
      />

      <SectionEditorModal
        isOpen={isSectionEditorOpen}
        onClose={() => {
          setIsSectionEditorOpen(false)
          setEditingSection(null)
        }}
        onSave={handleSaveSection}
        section={editingSection}
      />
    </div>
  )
}
