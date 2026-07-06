'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { costEstimateService } from '@/services/estimation-cost-estimate.service'
import { estimationCommentService } from '@/services/estimation-comment.service'
import { ArrowLeft, Send, User, Calendar, MessageSquare } from 'lucide-react'

const companyId = 'default-company-id'

interface Comment {
  id: string
  author: string
  role: string
  message: string
  timestamp: string
  type: 'comment' | 'approval' | 'rejection' | 'query'
}

export default function EstimateCommentsPage() {
  const router = useRouter()
  const params = useParams()
  const estimateId = params?.id as string

  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [posting, setPosting] = useState(false)

  const [estimateData, setEstimateData] = useState({
    estimateNumber: '',
    projectName: '',
    customerName: '',
    estimatedValue: 0,
    status: ''
  })

  const loadComments = useCallback(async () => {
    if (!estimateId) return
    try {
      const data = await estimationCommentService.getComments(estimateId)
      const list = Array.isArray(data) ? data : []
      const allowed = ['comment', 'approval', 'rejection', 'query']
      const mapped: Comment[] = list.map((c) => {
        const rawType = (c.commentType || 'comment').toLowerCase()
        const type = (allowed.includes(rawType) ? rawType : 'comment') as Comment['type']
        return {
          id: c.id,
          author: c.authorName || 'Unknown',
          role: '',
          message: c.message,
          timestamp: c.createdAt ? new Date(c.createdAt).toLocaleString() : '',
          type,
        }
      })
      setComments(mapped)
    } catch (err) {
      console.error('Failed to load comments:', err)
      setComments([])
    }
  }, [estimateId])

  useEffect(() => {
    if (!estimateId) return
    let mounted = true
    const loadEstimate = async () => {
      try {
        const est = await costEstimateService.findOne(companyId, estimateId)
        if (!mounted || !est) return
        setEstimateData({
          estimateNumber: est.estimateNumber || '',
          projectName: est.title || '',
          customerName: est.customerName || '',
          estimatedValue: est.totalCost || 0,
          status: est.status || '',
        })
      } catch (err) {
        console.error('Failed to load estimate:', err)
      }
    }
    loadEstimate()
    loadComments()
    return () => {
      mounted = false
    }
  }, [estimateId, loadComments])

  const handleBack = () => {
    router.push(`/estimation/workflow/pending/view/${estimateId}`)
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert('Please enter a comment')
      return
    }
    if (posting) return
    setPosting(true)
    try {
      await estimationCommentService.createComment({
        estimateId,
        message: newComment,
        authorName: 'Current User',
        commentType: 'comment',
      })
      setNewComment('')
      await loadComments()
    } catch (err) {
      console.error('Failed to add comment:', err)
      alert('Failed to post comment. Please try again.')
    } finally {
      setPosting(false)
    }
  }

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'approval':
        return 'bg-green-50 border-green-200'
      case 'rejection':
        return 'bg-red-50 border-red-200'
      case 'query':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-white border-gray-200'
    }
  }

  const getCommentTypeBadge = (type: string) => {
    switch (type) {
      case 'approval':
        return 'bg-green-100 text-green-700'
      case 'rejection':
        return 'bg-red-100 text-red-700'
      case 'query':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="flex-none bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Comments & Discussion</h1>
              <p className="text-sm text-gray-500 mt-1">{estimateData.estimateNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{estimateData.projectName}</p>
            <p className="text-sm text-gray-600">{estimateData.customerName}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <div className="w-full">
          <div className="grid grid-cols-3 gap-3">
            {/* Main Content - Comments Thread */}
            <div className="col-span-2 space-y-3">
              {/* Estimate Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Estimate Details</p>
                    <p className="text-lg font-bold text-blue-900 mt-1">{estimateData.estimateNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-600">Estimated Value</p>
                    <p className="text-xl font-bold text-blue-900">₹{estimateData.estimatedValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Discussion Thread ({comments.length})
                </h2>

                {comments.length === 0 && (
                  <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
                    No comments yet. Be the first to add one.
                  </div>
                )}

                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`rounded-lg border p-3 ${getCommentTypeColor(comment.type)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{comment.author}</p>
                          <p className="text-xs text-gray-600">{comment.role}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCommentTypeBadge(comment.type)}`}>
                        {comment.type.charAt(0).toUpperCase() + comment.type.slice(1)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-900 mb-3">{comment.message}</p>

                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>{comment.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment Form */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <h3 className="text-base font-semibold text-gray-900 mb-2">Add Comment</h3>

                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Comment
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={4}
                      placeholder="Type your comment, question, or feedback here..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleAddComment}
                      disabled={posting}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {posting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Activity Summary */}
            <div className="col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-3 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Activity Summary</h3>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Comments</p>
                    <p className="text-2xl font-bold text-blue-600">{comments.length}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <span className="inline-flex px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      {estimateData.status}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900 mb-2">Comment Types</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">General Comments</span>
                        <span className="font-semibold text-gray-900">
                          {comments.filter(c => c.type === 'comment').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Queries</span>
                        <span className="font-semibold text-yellow-600">
                          {comments.filter(c => c.type === 'query').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Approvals</span>
                        <span className="font-semibold text-green-600">
                          {comments.filter(c => c.type === 'approval').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Rejections</span>
                        <span className="font-semibold text-red-600">
                          {comments.filter(c => c.type === 'rejection').length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900 mb-2">Participants</p>
                    <div className="space-y-2">
                      {Array.from(new Set(comments.map(c => c.author))).map((author) => (
                        <div key={author} className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm text-gray-900">{author}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
