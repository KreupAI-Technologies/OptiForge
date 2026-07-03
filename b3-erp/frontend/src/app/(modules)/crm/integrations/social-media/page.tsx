'use client'

import { useState, useEffect } from 'react'
import { Linkedin, Twitter, Facebook, Instagram, Youtube, MessageCircle, TrendingUp, Users, Heart, Share2, Eye, BarChart3, Link as LinkIcon, RefreshCw, Settings } from 'lucide-react'
import { useToast } from '@/components/ui'
import crmService from '@/services/crm.service'

interface SocialAccount {
  id: string
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'youtube'
  accountName: string
  accountHandle: string
  connected: boolean
  followers: number
  engagement: number
  lastSync: string
  stats: {
    posts: number
    likes: number
    shares: number
    comments: number
    reach: number
  }
}

interface SocialLead {
  id: string
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram'
  name: string
  handle: string
  company?: string
  location?: string
  source: string
  score: number
  engagements: number
  lastActivity: string
  status: 'new' | 'contacted' | 'qualified' | 'converted'
}

interface SocialPost {
  id: string
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'youtube'
  content: string
  postedAt: string
  likes: number
  shares: number
  comments: number
  reach: number
  url: string
}

export default function SocialMediaIntegrationPage() {
  const { addToast } = useToast()

  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const rows = await crmService.socialAccounts.getAll()
        if (cancelled) return
        const mapped: SocialAccount[] = (rows || []).map((row: any) => {
          const rawStatus = String(row.status ?? '').toLowerCase()
          return {
            id: String(row.id ?? ''),
            platform: (row.platform ?? 'linkedin') as SocialAccount['platform'],
            accountName: row.handle ?? row.accountName ?? '',
            accountHandle: row.handle ?? '',
            connected: rawStatus === 'connected' || rawStatus === 'active',
            followers: Number(row.followers) || 0,
            engagement: Number(row.engagement) || 0,
            lastSync: row.lastSync ?? '',
            stats: {
              posts: Number(row.posts) || 0,
              likes: 0,
              shares: 0,
              comments: 0,
              reach: 0
            }
          }
        })
        setAccounts(mapped)
      } catch (err) {
        if (cancelled) return
        setAccounts([])
        setLoadError(err instanceof Error ? err.message : 'Failed to load social accounts')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  const [socialLeads] = useState<SocialLead[]>([
    {
      id: '1',
      platform: 'linkedin',
      name: 'Rajesh Sharma',
      handle: '@rajeshsharma',
      company: 'TechCorp Industries',
      location: 'Mumbai, India',
      source: 'Engaged with product post',
      score: 85,
      engagements: 12,
      lastActivity: '2025-10-28 14:30',
      status: 'qualified'
    },
    {
      id: '2',
      platform: 'linkedin',
      name: 'Priya Patel',
      handle: '@priyapatel',
      company: 'Manufacturing Solutions Ltd',
      location: 'Pune, India',
      source: 'Downloaded whitepaper',
      score: 92,
      engagements: 18,
      lastActivity: '2025-10-28 12:15',
      status: 'new'
    },
    {
      id: '3',
      platform: 'twitter',
      name: 'Amit Kumar',
      handle: '@amitkumar_mfg',
      company: 'AutoParts India',
      location: 'Bangalore, India',
      source: 'Retweeted product announcement',
      score: 78,
      engagements: 8,
      lastActivity: '2025-10-28 10:45',
      status: 'contacted'
    },
    {
      id: '4',
      platform: 'linkedin',
      name: 'Sneha Reddy',
      handle: '@snehareddy',
      company: 'Global Manufacturing Inc',
      location: 'Hyderabad, India',
      source: 'Commented on case study',
      score: 88,
      engagements: 15,
      lastActivity: '2025-10-27 16:20',
      status: 'new'
    },
    {
      id: '5',
      platform: 'facebook',
      name: 'Vikram Singh',
      handle: '@vikramsingh',
      company: 'Industrial Solutions',
      location: 'Delhi, India',
      source: 'Liked multiple posts',
      score: 65,
      engagements: 6,
      lastActivity: '2025-10-27 14:30',
      status: 'new'
    }
  ])

  const [recentPosts] = useState<SocialPost[]>([
    {
      id: '1',
      platform: 'linkedin',
      content: 'Excited to announce our new Industry 4.0 manufacturing solution! Transform your factory floor with real-time analytics and IoT integration. #Manufacturing #Industry40',
      postedAt: '2025-10-28 09:00',
      likes: 234,
      shares: 45,
      comments: 23,
      reach: 8900,
      url: 'https://linkedin.com/posts/b3macbis/...'
    },
    {
      id: '2',
      platform: 'twitter',
      content: 'Just wrapped up an amazing demo for a Fortune 500 client! Our MES solution impressed with 99.9% uptime and real-time tracking. #MES #Manufacturing',
      postedAt: '2025-10-27 15:30',
      likes: 156,
      shares: 67,
      comments: 12,
      reach: 12000,
      url: 'https://twitter.com/OptiForge/status/...'
    },
    {
      id: '3',
      platform: 'linkedin',
      content: 'Case Study: How we helped XYZ Corp reduce production costs by 35% with smart inventory management. Download the full report! 📊',
      postedAt: '2025-10-26 11:00',
      likes: 189,
      shares: 78,
      comments: 34,
      reach: 15000,
      url: 'https://linkedin.com/posts/b3macbis/...'
    },
    {
      id: '4',
      platform: 'youtube',
      content: 'New Video: 5 Ways to Optimize Your Production Line | Manufacturing Best Practices',
      postedAt: '2025-10-25 10:00',
      likes: 890,
      shares: 123,
      comments: 67,
      reach: 45000,
      url: 'https://youtube.com/watch?v=...'
    }
  ])

  const toggleConnection = (accountId: string) => {
    setAccounts(accounts.map(acc => {
      if (acc.id === accountId) {
        const newStatus = !acc.connected
        addToast({
          title: newStatus ? 'Account Connected' : 'Account Disconnected',
          message: `${acc.accountName} has been ${newStatus ? 'connected' : 'disconnected'}`,
          variant: newStatus ? 'success' : 'warning'
        })
        return { ...acc, connected: newStatus }
      }
      return acc
    }))
  }

  const syncAccount = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId)
    if (account) {
      addToast({
        title: 'Syncing Account',
        message: `Fetching latest data from ${account.platform}...`,
        variant: 'info'
      })
      // Simulate sync
      setTimeout(() => {
        setAccounts(accounts.map(acc =>
          acc.id === accountId
            ? {
              ...acc, lastSync: new Date().toLocaleString('en-IN', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
              })
            }
            : acc
        ))
        addToast({
          title: 'Sync Complete',
          message: `${account.accountName} synced successfully`,
          variant: 'success'
        })
      }, 1500)
    }
  }

  const convertToLead = (leadId: string) => {
    const lead = socialLeads.find(l => l.id === leadId)
    if (lead) {
      addToast({
        title: 'Lead Created',
        message: `${lead.name} added to CRM leads`,
        variant: 'success'
      })
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin': return <Linkedin className="w-5 h-5" />
      case 'twitter': return <Twitter className="w-5 h-5" />
      case 'facebook': return <Facebook className="w-5 h-5" />
      case 'instagram': return <Instagram className="w-5 h-5" />
      case 'youtube': return <Youtube className="w-5 h-5" />
      default: return null
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'linkedin': return 'blue'
      case 'twitter': return 'sky'
      case 'facebook': return 'indigo'
      case 'instagram': return 'pink'
      case 'youtube': return 'red'
      default: return 'gray'
    }
  }

  const totalFollowers = accounts.reduce((sum, acc) => sum + acc.followers, 0)
  const avgEngagement = accounts.reduce((sum, acc) => sum + acc.engagement, 0) / accounts.length
  const connectedAccounts = accounts.filter(acc => acc.connected).length
  const totalPosts = accounts.reduce((sum, acc) => sum + acc.stats.posts, 0)
  const totalReach = accounts.reduce((sum, acc) => sum + acc.stats.reach, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {isLoading && (<div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700"><div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />Loading accounts…</div>)}
      {loadError && !isLoading && (<div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>)}
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Social Media Integration</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Connect social accounts, track engagement, and capture leads
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all">
              <LinkIcon className="w-4 h-4" />
              Connect New Account
            </button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-5 gap-2 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
              <div className="text-sm text-blue-600 font-medium flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />
                Connected Accounts
              </div>
              <div className="text-2xl font-bold text-blue-900 mt-1">
                {connectedAccounts} / {accounts.length}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
              <div className="text-sm text-purple-600 font-medium flex items-center gap-1">
                <Users className="w-3 h-3" />
                Total Followers
              </div>
              <div className="text-2xl font-bold text-purple-900 mt-1">
                {(totalFollowers / 1000).toFixed(1)}K
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
              <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                <Heart className="w-3 h-3" />
                Avg. Engagement
              </div>
              <div className="text-2xl font-bold text-green-900 mt-1">
                {avgEngagement.toFixed(1)}%
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
              <div className="text-sm text-orange-600 font-medium flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                Total Posts
              </div>
              <div className="text-2xl font-bold text-orange-900 mt-1">
                {totalPosts}
              </div>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-3 border border-teal-200">
              <div className="text-sm text-teal-600 font-medium flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Total Reach
              </div>
              <div className="text-2xl font-bold text-teal-900 mt-1">
                {(totalReach / 1000).toFixed(0)}K
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {/* Connected Accounts */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Social Accounts</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {accounts.map((account) => {
              const color = getPlatformColor(account.platform)
              return (
                <div
                  key={account.id}
                  className={`border-2 rounded-lg p-5 transition-all ${account.connected
                      ? `border-${color}-200 bg-${color}-50`
                      : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 bg-${color}-100 rounded-lg text-${color}-600`}>
                        {getPlatformIcon(account.platform)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{account.accountName}</h3>
                        <p className="text-sm text-gray-600">{account.accountHandle}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${account.connected
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                      }`}>
                      {account.connected ? '● Connected' : '○ Disconnected'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-2">
                    <div className="text-center p-2 bg-white rounded border border-gray-200">
                      <div className="text-lg font-bold text-gray-900">
                        {(account.followers / 1000).toFixed(1)}K
                      </div>
                      <div className="text-xs text-gray-600">Followers</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded border border-gray-200">
                      <div className="text-lg font-bold text-gray-900">
                        {account.stats.posts}
                      </div>
                      <div className="text-xs text-gray-600">Posts</div>
                    </div>
                    <div className="text-center p-2 bg-white rounded border border-gray-200">
                      <div className="text-lg font-bold text-gray-900">
                        {account.engagement}%
                      </div>
                      <div className="text-xs text-gray-600">Engagement</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-2 text-xs">
                    <div className="text-center">
                      <Heart className="w-4 h-4 text-red-500 mb-1" />
                      <div className="font-semibold text-gray-900">{(account.stats.likes / 1000).toFixed(1)}K</div>
                    </div>
                    <div className="text-center">
                      <Share2 className="w-4 h-4 text-blue-500 mb-1" />
                      <div className="font-semibold text-gray-900">{(account.stats.shares / 1000).toFixed(1)}K</div>
                    </div>
                    <div className="text-center">
                      <MessageCircle className="w-4 h-4 text-green-500 mb-1" />
                      <div className="font-semibold text-gray-900">{(account.stats.comments / 1000).toFixed(1)}K</div>
                    </div>
                    <div className="text-center">
                      <Eye className="w-4 h-4 text-purple-500 mb-1" />
                      <div className="font-semibold text-gray-900">{(account.stats.reach / 1000).toFixed(0)}K</div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-3">
                    Last synced: {account.lastSync}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleConnection(account.id)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${account.connected
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                    >
                      {account.connected ? 'Disconnect' : 'Connect'}
                    </button>
                    {account.connected && (
                      <>
                        <button
                          onClick={() => syncAccount(account.id)}
                          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Sync Now"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Social Leads */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900">Social Leads</h2>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              {socialLeads.length} leads captured
            </span>
          </div>
          <div className="space-y-3">
            {socialLeads.map((lead) => {
              const color = getPlatformColor(lead.platform)
              return (
                <div key={lead.id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 bg-${color}-100 rounded-lg text-${color}-600`}>
                        {getPlatformIcon(lead.platform)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                          <span className="text-sm text-gray-500">{lead.handle}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${lead.score >= 80 ? 'bg-green-100 text-green-700' :
                              lead.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                            Score: {lead.score}
                          </span>
                        </div>
                        {lead.company && (
                          <p className="text-sm text-gray-600 mb-1">{lead.company}</p>
                        )}
                        {lead.location && (
                          <p className="text-xs text-gray-500 mb-2">📍 {lead.location}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>Source: {lead.source}</span>
                          <span>• {lead.engagements} engagements</span>
                          <span>• Last activity: {lead.lastActivity}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${lead.status === 'converted' ? 'bg-green-100 text-green-700' :
                          lead.status === 'qualified' ? 'bg-blue-100 text-blue-700' :
                            lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-600'
                        }`}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                      <button
                        onClick={() => convertToLead(lead.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Convert to Lead
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Recent Posts</h2>
          <div className="space-y-2">
            {recentPosts.map((post) => {
              const color = getPlatformColor(post.platform)
              return (
                <div key={post.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 bg-${color}-100 rounded-lg text-${color}-600`}>
                      {getPlatformIcon(post.platform)}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 mb-2">{post.content}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{post.postedAt}</span>
                        <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View Post →
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="text-center">
                      <Heart className="w-4 h-4 text-red-500 mb-1" />
                      <div className="text-sm font-semibold text-gray-900">{post.likes}</div>
                      <div className="text-xs text-gray-600">Likes</div>
                    </div>
                    <div className="text-center">
                      <Share2 className="w-4 h-4 text-blue-500 mb-1" />
                      <div className="text-sm font-semibold text-gray-900">{post.shares}</div>
                      <div className="text-xs text-gray-600">Shares</div>
                    </div>
                    <div className="text-center">
                      <MessageCircle className="w-4 h-4 text-green-500 mb-1" />
                      <div className="text-sm font-semibold text-gray-900">{post.comments}</div>
                      <div className="text-xs text-gray-600">Comments</div>
                    </div>
                    <div className="text-center">
                      <Eye className="w-4 h-4 text-purple-500 mb-1" />
                      <div className="text-sm font-semibold text-gray-900">{(post.reach / 1000).toFixed(1)}K</div>
                      <div className="text-xs text-gray-600">Reach</div>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="w-4 h-4 text-orange-500 mb-1" />
                      <div className="text-sm font-semibold text-gray-900">
                        {((post.likes + post.shares + post.comments) / post.reach * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">Engagement</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
