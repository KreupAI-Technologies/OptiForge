'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Image,
  Video,
  FileImage,
  Folder,
  BarChart3,
  TrendingUp,
  Download,
  AlertCircle
} from 'lucide-react'
import { cpqProposalService } from '@/services/cpq'
import {
  UploadContentModal,
  ViewContentModal,
  EditContentModal,
  AddToProposalModal,
  OrganizeContentModal,
  ContentItem as ContentItemType
} from '@/components/cpq/ProposalContentModals'

interface ContentItem {
  id: string
  name: string
  type: 'text' | 'image' | 'video' | 'document' | 'case-study' | 'specification'
  category: string
  description: string
  fileSize?: string
  usageCount: number
  lastUsed: string
  tags: string[]
  status: 'approved' | 'pending' | 'draft'
  createdBy: string
  createdDate: string
}

export default function CPQProposalsContentPage() {
  const router = useRouter()

  const [content, setContent] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        // Backend returns the ContentLibraryItem ORM shape (contentType/category/
        // name/content/tags/usageCount/isActive/createdBy/createdAt); map it to this
        // page's ContentItem model. fileSize and approval status are not tracked on
        // the library record, so they fall back to defaults.
        const raw = (await cpqProposalService.findAllContentLibraryItems()) as any[]
        const typeMap: Record<string, ContentItem['type']> = {
          text: 'text',
          image: 'image',
          video: 'video',
          document: 'document',
          table: 'document',
          clause: 'text',
        }
        const toDate = (v: unknown): string =>
          v ? new Date(v as string).toISOString().split('T')[0] : ''
        const mapped: ContentItem[] = (raw ?? []).map((c) => ({
          id: c.id ?? '',
          name: c.name ?? '',
          type: typeMap[String(c.contentType ?? '').toLowerCase()] ?? 'document',
          category: c.category ?? '',
          description: typeof c.content === 'string' ? c.content.slice(0, 160) : '',
          fileSize: c.fileSize ?? undefined,
          usageCount: Number(c.usageCount ?? 0),
          lastUsed: toDate(c.updatedAt ?? c.createdAt),
          tags: Array.isArray(c.tags) ? c.tags : [],
          status: c.isActive === false ? 'draft' : 'approved',
          createdBy: c.createdBy ?? '',
          createdDate: toDate(c.createdAt),
        }))
        if (!cancelled) setContent(mapped)
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load content library')
          setContent([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-5 w-5" />
      case 'video': return <Video className="h-5 w-5" />
      case 'document': return <FileText className="h-5 w-5" />
      case 'case-study': return <BarChart3 className="h-5 w-5" />
      case 'specification': return <FileImage className="h-5 w-5" />
      default: return <FileText className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    const colors: any = {
      text: 'bg-gray-100 text-gray-700 border-gray-200',
      image: 'bg-blue-100 text-blue-700 border-blue-200',
      video: 'bg-purple-100 text-purple-700 border-purple-200',
      document: 'bg-green-100 text-green-700 border-green-200',
      'case-study': 'bg-orange-100 text-orange-700 border-orange-200',
      specification: 'bg-pink-100 text-pink-700 border-pink-200'
    }
    return colors[type] || colors.document
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      approved: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-orange-100 text-orange-700 border-orange-200',
      draft: 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colors[status] || colors.draft
  }

  const totalContent = content.length
  const approvedContent = content.filter(c => c.status === 'approved').length
  const totalUsage = content.reduce((sum, c) => sum + c.usageCount, 0)
  const contentTypes = Array.from(new Set(content.map(c => c.type))).length

  // Modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddToProposalOpen, setIsAddToProposalOpen] = useState(false)
  const [isOrganizeOpen, setIsOrganizeOpen] = useState(false)
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null)

  // Convert local content to ContentItemType
  const convertToContentItemType = (item: ContentItem): ContentItemType => ({
    id: item.id,
    contentId: item.id,
    title: item.name,
    type: item.type,
    category: item.category,
    size: item.fileSize || '0 KB',
    format: item.type === 'document' ? 'PDF' : item.type === 'image' ? 'PNG' : item.type === 'video' ? 'MP4' : 'TXT',
    description: item.description,
    usageCount: item.usageCount,
    lastUsed: item.lastUsed,
    createdDate: item.createdDate,
    tags: item.tags,
    status: item.status === 'approved' ? 'active' : 'archived',
    createdBy: item.createdBy,
    version: '1.0'
  })

  // Modal handlers
  const handleUpload = (content: any) => {
    console.log('Uploading content:', content)
  }

  const handleEdit = (item: ContentItem) => {
    setSelectedContent(item)
    setIsEditOpen(true)
  }

  const handleView = (item: ContentItem) => {
    setSelectedContent(item)
    setIsViewOpen(true)
  }

  const handleAddToProposal = (item: ContentItem) => {
    setSelectedContent(item)
    setIsAddToProposalOpen(true)
  }

  const handleSaveEdit = (editedContent: ContentItemType) => {
    console.log('Saving edited content:', editedContent)
  }

  const handleAdd = (data: any) => {
    console.log('Adding content to proposal:', data)
  }

  const handleOrganize = (data: any) => {
    console.log('Organizing content:', data)
  }

  return (
    <div className="w-full h-full px-4 py-2">
      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading content library…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && content.length === 0 && (
        <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          No content items found.
        </div>
      )}
      {/* Action Buttons */}
      <div className="mb-3 flex justify-end">
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button
            onClick={() => setIsOrganizeOpen(true)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Folder className="h-4 w-4" />
            Organize
          </button>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Upload Content
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Content</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{totalContent}</p>
              <p className="text-xs text-blue-700 mt-1">Items available</p>
            </div>
            <FileText className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{approvedContent}</p>
              <p className="text-xs text-green-700 mt-1">Ready to use</p>
            </div>
            <Eye className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Usage</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{totalUsage}</p>
              <p className="text-xs text-purple-700 mt-1">Times used</p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Content Types</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{contentTypes}</p>
              <p className="text-xs text-orange-700 mt-1">Different formats</p>
            </div>
            <Folder className="h-10 w-10 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-3 flex gap-3 overflow-x-auto pb-2">
        <button className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-200 text-sm font-medium whitespace-nowrap">
          All Content ({totalContent})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Images ({content.filter(c => c.type === 'image').length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Documents ({content.filter(c => c.type === 'document').length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Videos ({content.filter(c => c.type === 'video').length})
        </button>
        <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm whitespace-nowrap">
          Case Studies ({content.filter(c => c.type === 'case-study').length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search content by name, category, or tags..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {content.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-3 rounded-lg border ${getTypeColor(item.type)}`}>
                {getTypeIcon(item.type)}
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>

            <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
            <p className="text-xs text-gray-500 mb-2">{item.id} • {item.category}</p>
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {item.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              {item.fileSize && (
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-gray-500">File Size</p>
                  <p className="font-semibold text-gray-900">{item.fileSize}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded p-2">
                <p className="text-gray-500">Usage</p>
                <p className="font-semibold text-gray-900">{item.usageCount}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3 text-xs text-gray-600">
              <span>Last used: {new Date(item.lastUsed).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
              <span className="text-gray-500">by {item.createdBy}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddToProposal(item)}
                className="flex-1 px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add to Proposal
              </button>
              <button
                onClick={() => handleView(item)}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200"
                aria-label="View"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200"
                aria-label="Download"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleEdit(item)}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200"
                aria-label="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Content Library Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Content Library Features:</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li><strong>Centralized Storage:</strong> All proposal content in one searchable library</li>
          <li><strong>Version Control:</strong> Track content updates and maintain approval workflows</li>
          <li><strong>Usage Analytics:</strong> See which content performs best in winning proposals</li>
          <li><strong>Tag-Based Search:</strong> Quickly find relevant content using tags and categories</li>
          <li><strong>Multi-Format Support:</strong> Images, videos, documents, case studies, and specifications</li>
        </ul>
      </div>

      {/* Modals */}
      <UploadContentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
      />

      {isViewOpen && selectedContent && (
        <ViewContentModal
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false)
            setSelectedContent(null)
          }}
          content={convertToContentItemType(selectedContent)}
        />
      )}

      {isEditOpen && selectedContent && (
        <EditContentModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false)
            setSelectedContent(null)
          }}
          onSave={handleSaveEdit}
          content={convertToContentItemType(selectedContent)}
        />
      )}

      {isAddToProposalOpen && selectedContent && (
        <AddToProposalModal
          isOpen={isAddToProposalOpen}
          onClose={() => {
            setIsAddToProposalOpen(false)
            setSelectedContent(null)
          }}
          onAdd={handleAdd}
          content={convertToContentItemType(selectedContent)}
        />
      )}

      <OrganizeContentModal
        isOpen={isOrganizeOpen}
        onClose={() => setIsOrganizeOpen(false)}
        onOrganize={handleOrganize}
      />
    </div>
  )
}
