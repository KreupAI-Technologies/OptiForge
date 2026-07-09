'use client'

import React, { useState, useEffect } from 'react'
import { OmnichannelService, type OmnichannelInteraction } from '@/services/support.service'
import {
  ChannelSelector,
  UnifiedInbox,
  QueueManager,
  TabPanel,
  TabContent,
  DrawerPanel,
  TimelineView,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  useToast,
  ToastProvider,
  PageToolbar
} from '@/components/ui'
import type { Channel, ConversationMessage, QueueItem, QueueStats, TimelineEvent } from '@/components/ui'
import { Send, Paperclip, Phone, Video, MoreVertical, User, Tag as TagIcon } from 'lucide-react'

function OmnichannelSupportPageContent() {
  const [selectedChannel, setSelectedChannel] = useState<Channel>('all')
  const [activeTab, setActiveTab] = useState('inbox')
  const [selectedConversation, setSelectedConversation] = useState<string>()
  const [showConversationDetails, setShowConversationDetails] = useState(false)
  const { addToast } = useToast()

  const [conversations, setConversations] = useState<ConversationMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mapInteraction = (i: OmnichannelInteraction): ConversationMessage => ({
    id: i.id,
    ticketId: i.ticketId,
    subject: i.subject,
    customer: {
      name: i.customerName,
      email: i.customerEmail || '',
      avatar: i.customerAvatar,
    },
    channel: i.channel as Channel,
    lastMessage: i.lastMessage || '',
    lastMessageTime: i.lastMessageTime || '',
    unreadCount: i.unreadCount ?? 0,
    priority: i.priority,
    status: i.status,
    assignedTo: i.assignedToName
      ? { name: i.assignedToName, avatar: i.assignedToAvatar }
      : undefined,
    tags: i.tags,
    starred: i.starred,
    hasAttachments: i.hasAttachments,
    slaDeadline: i.slaDeadline,
  })

  const loadConversations = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await OmnichannelService.getInteractions()
      setConversations(data.map(mapInteraction))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Queue and per-conversation timeline have no backend endpoint yet; render
  // empty until /support/omnichannel exposes queue + timeline data.
  const queueItems: QueueItem[] = []

  const queueStats: QueueStats = {
    total: 0,
    waiting: 0,
    assigned: 0,
    avgWaitTime: 0,
    longestWait: 0
  }

  const timeline: TimelineEvent[] = []

  const handleConversationSelect = (id: string) => {
    setSelectedConversation(id)
    setShowConversationDetails(true)
  }

  const handleAssignToMe = (itemId: string) => {
    addToast({
      title: 'Success',
      message: 'Ticket assigned to you',
      variant: 'success'
    })
  }

  const handleSendMessage = () => {
    addToast({
      title: 'Success',
      message: 'Message sent',
      variant: 'success'
    })
  }

  const filteredConversations = selectedChannel === 'all'
    ? conversations
    : conversations.filter(c => c.channel === selectedChannel)

  const selectedConvData = conversations.find(c => c.id === selectedConversation)

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <PageToolbar
         
          subtitle="Unified inbox across all communication channels"
          breadcrumbs={[
            { label: 'Support', href: '/support' },
            { label: 'Omnichannel' }
          ]}
        />
      </div>

      {/* Channel Selector */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <ChannelSelector
          selectedChannel={selectedChannel}
          onChannelChange={setSelectedChannel}
          showCounts
          variant="horizontal"
          size="md"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 px-6">
          <TabPanel
            tabs={[
              { id: 'inbox', label: 'Inbox', count: filteredConversations.filter(c => c.status !== 'resolved' && c.status !== 'closed').length },
              { id: 'queue', label: 'Queue', count: queueStats.waiting },
              { id: 'assigned', label: 'My Tickets', count: filteredConversations.filter(c => c.assignedTo).length }
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="default"
            size="md"
          />
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden p-3">
          <TabContent activeTab={activeTab} tabId="inbox">
            <div className="h-full">
              {error ? (
                <div className="flex items-center justify-center h-full text-sm text-red-600">
                  {error}
                </div>
              ) : (
                <UnifiedInbox
                  conversations={filteredConversations}
                  selectedConversation={selectedConversation}
                  onConversationSelect={handleConversationSelect}
                  loading={loading}
                  onRefresh={() => {
                    loadConversations()
                    addToast({
                      title: 'Refreshed',
                      message: 'Inbox updated',
                      variant: 'info',
                      duration: 2000
                    })
                  }}
                  onSearch={(query) => console.log('Search:', query)}
                />
              )}
            </div>
          </TabContent>

          <TabContent activeTab={activeTab} tabId="queue">
            <div className="h-full overflow-y-auto">
              <QueueManager
                items={queueItems}
                stats={queueStats}
                onItemClick={(item) => {
                  addToast({
                    title: 'Queue Item',
                    message: `Opening ${item.id}`,
                    variant: 'info',
                    duration: 2000
                  })
                }}
                onAssign={handleAssignToMe}
                showStats
              />
            </div>
          </TabContent>

          <TabContent activeTab={activeTab} tabId="assigned">
            <div className="h-full">
              <UnifiedInbox
                conversations={filteredConversations.filter(c => c.assignedTo)}
                selectedConversation={selectedConversation}
                onConversationSelect={handleConversationSelect}
                loading={loading}
                onRefresh={() => {
                  loadConversations()
                  addToast({
                    title: 'Refreshed',
                    message: 'Assigned tickets updated',
                    variant: 'info',
                    duration: 2000
                  })
                }}
              />
            </div>
          </TabContent>
        </div>
      </div>

      {/* Conversation Details Drawer */}
      <DrawerPanel
        isOpen={showConversationDetails}
        onClose={() => setShowConversationDetails(false)}
        title={selectedConvData?.subject || 'Conversation Details'}
        description={selectedConvData?.ticketId}
        position="right"
        size="xl"
      >
        {selectedConvData && (
          <div className="space-y-3">
            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Customer Information</h3>
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600">Name</p>
                  <p className="text-sm font-medium text-gray-900">{selectedConvData.customer.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="text-sm font-medium text-gray-900">{selectedConvData.customer.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Channel</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{selectedConvData.channel}</p>
                </div>
              </div>
            </div>

            {/* Ticket Info */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Ticket Details</h3>
                <TagIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-600">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedConvData.status === 'open' ? 'bg-blue-100 text-blue-700' :
                    selectedConvData.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    selectedConvData.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedConvData.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Priority</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedConvData.priority === 'critical' ? 'bg-red-100 text-red-700' :
                    selectedConvData.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    selectedConvData.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {selectedConvData.priority.toUpperCase()}
                  </span>
                </div>
                {selectedConvData.slaDeadline && (
                  <div>
                    <p className="text-xs text-gray-600">SLA Deadline</p>
                    <p className="text-sm font-medium text-orange-600">{selectedConvData.slaDeadline}</p>
                  </div>
                )}
                {selectedConvData.tags && selectedConvData.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedConvData.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Activity Timeline</h3>
              <TimelineView
                events={timeline}
                showAvatars
                compact
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Phone className="h-4 w-4" />
                  Call Customer
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Video className="h-4 w-4" />
                  Video Call
                </button>
              </div>
            </div>

            {/* Reply Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Send Reply</h3>
              <div className="space-y-3">
                <Select value="reply">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reply">Reply to customer</SelectItem>
                    <SelectItem value="internal">Internal note</SelectItem>
                    <SelectItem value="forward">Forward to team</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Type your message..."
                  rows={4}
                />
                <div className="flex items-center justify-between">
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
                    <Paperclip className="h-4 w-4" />
                    Attach file
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DrawerPanel>
    </div>
  )
}

export default function OmnichannelSupportPage() {
  return (
    <ToastProvider>
      <OmnichannelSupportPageContent />
    </ToastProvider>
  )
}
