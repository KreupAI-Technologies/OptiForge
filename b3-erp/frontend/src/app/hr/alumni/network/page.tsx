'use client';

import { useState, useEffect } from 'react';
import { Network, Users, Calendar, MessageCircle, Heart, Share2, Eye, TrendingUp, Award, Briefcase, MapPin, X, UserPlus, AlertCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HrSelfServiceService, type AlumniComment } from '@/services/hr-self-service.service';
import { EmptyState } from '@/components/ui/EmptyState';

interface AlumniEvent {
  id: string;
  title: string;
  type: 'meetup' | 'webinar' | 'workshop' | 'reunion' | 'networking';
  date: string;
  time: string;
  location: string;
  mode: 'online' | 'offline' | 'hybrid';
  registrations: number;
  capacity: number;
  organizer: string;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface AlumniPost {
  id: string;
  author: string;
  authorDesignation: string;
  authorCompany: string;
  timestamp: string;
  content: string;
  type: 'update' | 'achievement' | 'opportunity' | 'question';
  likes: number;
  comments: number;
  shares: number;
}

// Alumni network posts have no backend endpoint yet (see NEEDS-BACKEND).
// Until one exists, the feed renders empty rather than fabricated content.
const posts: AlumniPost[] = [];

export default function Page() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<'feed' | 'events' | 'opportunities'>('feed');
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AlumniEvent | null>(null);
  const [postContent, setPostContent] = useState('');
  const [jobFormData, setJobFormData] = useState({
    title: '',
    company: '',
    location: '',
    jobType: 'full_time' as 'full_time' | 'part_time' | 'contract' | 'internship',
    experience: '',
    description: '',
    skills: '',
    applyLink: ''
  });
  const [eventRows, setEventRows] = useState<AlumniEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Comments (real, backed by /hr/alumni-comments)
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, AlumniComment[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
  const [commentsError, setCommentsError] = useState<Record<string, string | null>>({});
  const [commentSubmitting, setCommentSubmitting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrSelfServiceService.getAlumni({ kind: 'event' });
        const mapped: AlumniEvent[] = raw.map((r) => {
          const d = (r.details ?? {}) as Record<string, unknown>;
          const str = (v: unknown, fallback = ''): string =>
            v != null ? String(v) : fallback;
          return {
            id: r.id,
            title: str(d.title ?? r.name),
            type: (str(d.type) as AlumniEvent['type']) || 'meetup',
            date: str(d.date ?? r.exitDate),
            time: str(d.time),
            location: str(d.location ?? r.location),
            mode: (str(d.mode) as AlumniEvent['mode']) || 'offline',
            registrations: Number(d.registrations ?? 0),
            capacity: Number(d.capacity ?? 0),
            organizer: str(d.organizer ?? r.name),
            description: str(d.description ?? r.comments),
            status: (str(d.status ?? r.status) as AlumniEvent['status']) || 'upcoming',
          };
        });
        if (!cancelled) setEventRows(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load alumni events');
          setEventRows([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const events: AlumniEvent[] = eventRows;

  const stats = {
    totalMembers: 0,
    activeMembers: 0,
    upcomingEvents: events.filter(e => e.status === 'upcoming').length,
    openOpportunities: 0
  };

  const typeColors = {
    update: 'bg-blue-100 text-blue-700',
    achievement: 'bg-green-100 text-green-700',
    opportunity: 'bg-purple-100 text-purple-700',
    question: 'bg-orange-100 text-orange-700'
  };

  const eventTypeColors = {
    meetup: 'bg-blue-100 text-blue-700',
    webinar: 'bg-purple-100 text-purple-700',
    workshop: 'bg-green-100 text-green-700',
    reunion: 'bg-orange-100 text-orange-700',
    networking: 'bg-pink-100 text-pink-700'
  };

  const handleViewEventDetails = (event: AlumniEvent) => {
    setSelectedEvent(event);
    setShowEventDetailsModal(true);
  };

  const handleRegisterEvent = (event: AlumniEvent) => {
    toast({
      title: "Registration Successful",
      description: `You have successfully registered for ${event.title}`
    });
    setShowEventDetailsModal(false);
  };

  const handlePostUpdate = () => {
    if (!postContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content to post",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Post Published",
      description: "Your update has been shared with the alumni network"
    });
    setPostContent('');
  };

  const handleLikePost = (postId: string) => {
    toast({
      title: "Post Liked",
      description: "You liked this post"
    });
  };

  const loadComments = async (postId: string) => {
    setCommentsLoading((s) => ({ ...s, [postId]: true }));
    setCommentsError((s) => ({ ...s, [postId]: null }));
    try {
      const rows = await HrSelfServiceService.getAlumniComments({ postId });
      setCommentsByPost((s) => ({ ...s, [postId]: rows }));
    } catch (err) {
      setCommentsError((s) => ({
        ...s,
        [postId]: err instanceof Error ? err.message : 'Failed to load comments',
      }));
    } finally {
      setCommentsLoading((s) => ({ ...s, [postId]: false }));
    }
  };

  const handleCommentPost = (postId: string) => {
    if (openComments === postId) {
      setOpenComments(null);
      return;
    }
    setOpenComments(postId);
    if (commentsByPost[postId] === undefined) {
      void loadComments(postId);
    }
  };

  const handleSubmitComment = async (postId: string) => {
    const body = (commentDrafts[postId] || '').trim();
    if (!body) {
      toast({
        title: 'Error',
        description: 'Please enter a comment',
        variant: 'destructive',
      });
      return;
    }
    setCommentSubmitting((s) => ({ ...s, [postId]: true }));
    try {
      const created = await HrSelfServiceService.createAlumniComment({ postId, body });
      setCommentsByPost((s) => ({
        ...s,
        [postId]: [...(s[postId] || []), created],
      }));
      setCommentDrafts((s) => ({ ...s, [postId]: '' }));
      toast({ title: 'Comment posted' });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to post comment',
        variant: 'destructive',
      });
    } finally {
      setCommentSubmitting((s) => ({ ...s, [postId]: false }));
    }
  };

  const handleSharePost = (postId: string) => {
    toast({
      title: "Share Post",
      description: "Post sharing options will appear here"
    });
  };

  const handlePostJob = () => {
    toast({
      title: "Job Posted",
      description: "Your job opportunity has been posted to the alumni network"
    });
    setShowPostJobModal(false);
    setJobFormData({
      title: '',
      company: '',
      location: '',
      jobType: 'full_time',
      experience: '',
      description: '',
      skills: '',
      applyLink: ''
    });
  };

  return (
    <div className="w-full h-full px-3 py-2">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Alumni Network</h1>
        <p className="text-sm text-gray-600 mt-1">Stay connected, share experiences, and grow together</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading alumni events…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Network Size</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalMembers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Members</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.activeMembers}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Upcoming Events</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{stats.upcomingEvents}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Opportunities</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{stats.openOpportunities}</p>
            </div>
            <Briefcase className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-3">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setSelectedTab('feed')}
            className={`flex-1 px-3 py-2 text-sm font-medium ${
              selectedTab === 'feed'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Network Feed
          </button>
          <button
            onClick={() => setSelectedTab('events')}
            className={`flex-1 px-3 py-2 text-sm font-medium ${
              selectedTab === 'events'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setSelectedTab('opportunities')}
            className={`flex-1 px-3 py-2 text-sm font-medium ${
              selectedTab === 'opportunities'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Opportunities
          </button>
        </div>
      </div>

      {/* Content based on selected tab */}
      {selectedTab === 'feed' && (
        <div className="space-y-2">
          {/* Create Post */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Share an update with the alumni network..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handlePostUpdate}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Post Update
              </button>
            </div>
          </div>

          {/* Posts Feed */}
          {posts.length === 0 && !isLoading && (
            <EmptyState
              icon={Network}
              title="No network posts yet"
              description="Alumni network updates will appear here once posts are available."
            />
          )}
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {post.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{post.author}</h3>
                    <p className="text-sm text-gray-600">{post.authorDesignation} at {post.authorCompany}</p>
                    <p className="text-xs text-gray-500 mt-1">{post.timestamp}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${typeColors[post.type]}`}>
                  {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                </span>
              </div>

              {/* Post Content */}
              <p className="text-gray-800 mb-2">{post.content}</p>

              {/* Post Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Heart className="h-5 w-5" />
                  <span className="text-sm font-medium">{post.likes}</span>
                </button>
                <button
                  onClick={() => handleCommentPost(post.id)}
                  className={`flex items-center gap-2 transition-colors ${
                    openComments === post.id ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">
                    {commentsByPost[post.id] !== undefined
                      ? commentsByPost[post.id].length
                      : post.comments}
                  </span>
                </button>
                <button
                  onClick={() => handleSharePost(post.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                  <span className="text-sm font-medium">{post.shares}</span>
                </button>
              </div>

              {/* Comments section (real, backed by /hr/alumni-comments) */}
              {openComments === post.id && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                  {commentsLoading[post.id] && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                      Loading comments…
                    </div>
                  )}
                  {commentsError[post.id] && !commentsLoading[post.id] && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {commentsError[post.id]}
                    </div>
                  )}
                  {!commentsLoading[post.id] &&
                    !commentsError[post.id] &&
                    (commentsByPost[post.id]?.length ?? 0) === 0 && (
                      <p className="text-sm text-gray-500">No comments yet. Be the first to comment.</p>
                    )}
                  {(commentsByPost[post.id] || []).map((c) => (
                    <div key={c.id} className="flex items-start gap-3">
                      <div className="h-8 w-8 flex-shrink-0 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {(c.authorName || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900">
                            {c.authorName || 'Alumnus'}
                          </span>
                          {c.createdAt && (
                            <span className="text-xs text-gray-400">
                              {new Date(c.createdAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{c.body}</p>
                      </div>
                    </div>
                  ))}

                  {/* Add comment */}
                  <div className="flex items-start gap-2">
                    <textarea
                      value={commentDrafts[post.id] || ''}
                      onChange={(e) =>
                        setCommentDrafts((s) => ({ ...s, [post.id]: e.target.value }))
                      }
                      placeholder="Write a comment…"
                      rows={2}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <button
                      onClick={() => handleSubmitComment(post.id)}
                      disabled={commentSubmitting[post.id]}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1 text-sm"
                    >
                      <Send className="h-4 w-4" />
                      {commentSubmitting[post.id] ? 'Posting…' : 'Post'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'events' && events.length === 0 && !isLoading && (
        <EmptyState
          icon={Calendar}
          title="No events yet"
          description="Upcoming alumni events will appear here once scheduled."
        />
      )}

      {selectedTab === 'events' && events.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-2">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${eventTypeColors[event.type]}`}>
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </span>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  event.mode === 'online' ? 'bg-blue-100 text-blue-700' :
                  event.mode === 'offline' ? 'bg-green-100 text-green-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {event.mode.charAt(0).toUpperCase() + event.mode.slice(1)}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{event.description}</p>

              <div className="space-y-2 mb-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {event.date} at {event.time}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Users className="h-4 w-4 text-gray-400" />
                  {event.registrations}/{event.capacity} registered
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(event.registrations / event.capacity) * 100}%` }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewEventDetails(event)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                <button
                  onClick={() => handleRegisterEvent(event)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Register Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'opportunities' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Briefcase className="h-16 w-16 text-gray-400 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Opportunities</h3>
          <p className="text-gray-600 mb-3">
            Browse and share job opportunities within the alumni network
          </p>
          <button
            onClick={() => setShowPostJobModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Post an Opportunity
          </button>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetailsModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-2 flex items-center justify-between rounded-t-lg">
              <div>
                <h2 className="text-xl font-bold">{selectedEvent.title}</h2>
                <p className="text-sm text-purple-100 mt-1">Event Details</p>
              </div>
              <button
                onClick={() => setShowEventDetailsModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-3">
              {/* Event Type and Mode */}
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 text-sm font-semibold rounded-full ${eventTypeColors[selectedEvent.type]}`}>
                  {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                </span>
                <span className={`px-4 py-2 text-sm font-semibold rounded-full ${
                  selectedEvent.mode === 'online' ? 'bg-blue-100 text-blue-700' :
                  selectedEvent.mode === 'offline' ? 'bg-green-100 text-green-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {selectedEvent.mode.charAt(0).toUpperCase() + selectedEvent.mode.slice(1)}
                </span>
                <span className={`px-4 py-2 text-sm font-semibold rounded-full ${
                  selectedEvent.status === 'upcoming' ? 'bg-yellow-100 text-yellow-700' :
                  selectedEvent.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                </span>
              </div>

              {/* Event Description */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">About This Event</h3>
                <p className="text-gray-700">{selectedEvent.description}</p>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-600">Date & Time</p>
                      <p className="font-semibold text-blue-900">{selectedEvent.date}</p>
                      <p className="text-sm text-blue-700">{selectedEvent.time}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-600">Location</p>
                      <p className="font-semibold text-green-900">{selectedEvent.location}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-purple-600">Registrations</p>
                      <p className="font-semibold text-purple-900">
                        {selectedEvent.registrations} / {selectedEvent.capacity}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${(selectedEvent.registrations / selectedEvent.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-600">Organized By</p>
                      <p className="font-semibold text-orange-900">{selectedEvent.organizer}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Info */}
              {selectedEvent.registrations < selectedEvent.capacity && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-900 mb-1">Seats Available</p>
                      <p className="text-sm text-green-800">
                        {selectedEvent.capacity - selectedEvent.registrations} seats remaining. Register now to confirm your participation!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedEvent.registrations >= selectedEvent.capacity && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-900 mb-1">Event Full</p>
                      <p className="text-sm text-red-800">
                        This event has reached maximum capacity. Join the waitlist to be notified if seats become available.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-3 py-2 flex justify-end gap-3 rounded-b-lg border-t">
              <button
                onClick={() => setShowEventDetailsModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Close
              </button>
              {selectedEvent.registrations < selectedEvent.capacity ? (
                <button
                  onClick={() => handleRegisterEvent(selectedEvent)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Register for Event
                </button>
              ) : (
                <button
                  onClick={() => {
                    toast({
                      title: "Added to Waitlist",
                      description: "You've been added to the waitlist for this event"
                    });
                    setShowEventDetailsModal(false);
                  }}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Join Waitlist
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      {showPostJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-2 flex items-center justify-between rounded-t-lg">
              <div>
                <h2 className="text-xl font-bold">Post Job Opportunity</h2>
                <p className="text-sm text-blue-100 mt-1">Share opportunities with the alumni network</p>
              </div>
              <button
                onClick={() => setShowPostJobModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={jobFormData.title}
                    onChange={(e) => setJobFormData({...jobFormData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Senior Production Manager"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={jobFormData.company}
                    onChange={(e) => setJobFormData({...jobFormData, company: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Tata Motors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={jobFormData.location}
                    onChange={(e) => setJobFormData({...jobFormData, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Pune, Maharashtra"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={jobFormData.jobType}
                    onChange={(e) => setJobFormData({...jobFormData, jobType: e.target.value as any})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Required <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={jobFormData.experience}
                  onChange={(e) => setJobFormData({...jobFormData, experience: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 5-7 years"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={jobFormData.description}
                  onChange={(e) => setJobFormData({...jobFormData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe the role, responsibilities, and requirements..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={jobFormData.skills}
                  onChange={(e) => setJobFormData({...jobFormData, skills: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Lean Manufacturing, Six Sigma, AutoCAD"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Separate multiple skills with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={jobFormData.applyLink}
                  onChange={(e) => setJobFormData({...jobFormData, applyLink: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Link where candidates can apply</p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-1">Posting Guidelines</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Only post legitimate job opportunities</li>
                      <li>• Provide accurate and complete information</li>
                      <li>• Include a direct application link</li>
                      <li>• Posts will be visible to all alumni network members</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-3 py-2 flex justify-end gap-3 rounded-b-lg border-t">
              <button
                onClick={() => setShowPostJobModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handlePostJob}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Post Opportunity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
