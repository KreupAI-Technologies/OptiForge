'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Share2, MoreHorizontal, Image, FileText, Send, ThumbsUp, MessageCircle, AlertCircle } from 'lucide-react';
import { collaborationService } from '@/services/collaboration.service';

interface FeedPost {
    id: number | string;
    author: string;
    role: string;
    time: string;
    content: string;
    likes: number;
    comments: number;
    hasImage: boolean;
    image?: string;
    isSystem?: boolean;
}

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || 'company-1';

// Format an ISO/date value into a coarse relative label.
const toRelativeTime = (value: any): string => {
    if (!value) return '';
    const then = new Date(value).getTime();
    if (Number.isNaN(then)) return '';
    const diffMs = Date.now() - then;
    const mins = Math.round(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
};

export default function ActivityFeedPage() {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                // Backend returns raw TeamActivity records; map them to the
                // page's FeedPost model defensively.
                const raw = (await collaborationService.getRecentActivity(COMPANY_ID, 20)) as any[];
                const mapped: FeedPost[] = (raw ?? []).map((a) => {
                    const author = a.userName ?? 'Unknown';
                    return {
                        id: a.id ?? Math.random(),
                        author,
                        role: a.teamName ?? a.activityType ?? 'Activity',
                        time: toRelativeTime(a.activityAt ?? a.createdAt),
                        content: a.activityDescription ?? '',
                        likes: Number(a.likes ?? 0),
                        comments: Number(a.comments ?? 0),
                        hasImage: false,
                        isSystem: author === 'System' || author === 'system',
                    };
                });
                if (!cancelled) setPosts(mapped);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load activity feed');
                    setPosts([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const [newPost, setNewPost] = useState('');

    const handlePost = () => {
        if (!newPost.trim()) return;
        const post: FeedPost = {
            id: Date.now(),
            author: 'You',
            role: 'Current User',
            time: 'Just now',
            content: newPost,
            likes: 0,
            comments: 0,
            hasImage: false,
        };
        setPosts([post, ...posts]);
        setNewPost('');
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
            <div className="w-full space-y-3">
                <h1 className="text-2xl font-bold text-gray-900">Activity Feed</h1>

                {/* Create Post */}
                <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                    <div className="flex gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            Y
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                                placeholder="What's on your mind?"
                                className="w-full border-none focus:ring-0 resize-none text-gray-900 placeholder-gray-500 text-lg"
                                rows={2}
                            />
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                                <div className="flex gap-2">
                                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg flex items-center gap-2 text-sm font-medium">
                                        <Image className="w-5 h-5 text-green-500" />
                                        Photo
                                    </button>
                                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg flex items-center gap-2 text-sm font-medium">
                                        <FileText className="w-5 h-5 text-blue-500" />
                                        File
                                    </button>
                                </div>
                                <button
                                    onClick={handlePost}
                                    disabled={!newPost.trim()}
                                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${newPost.trim()
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <Send className="w-4 h-4" />
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed */}
                {isLoading && (
                    <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
                        Loading activity feed…
                    </div>
                )}
                {loadError && !isLoading && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        {loadError}
                    </div>
                )}
                {!isLoading && !loadError && posts.length === 0 && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                        No activity yet.
                    </div>
                )}
                <div className="space-y-3">
                    {posts.map((post) => (
                        <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${post.isSystem ? 'bg-gray-500' : 'bg-blue-600'
                                        }`}>
                                        {post.author[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{post.author}</h3>
                                        <p className="text-xs text-gray-500">{post.role} • {post.time}</p>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-gray-800 mb-2 whitespace-pre-wrap">{post.content}</p>

                            {post.hasImage && (
                                <div className="mb-2 rounded-lg overflow-hidden bg-gray-100 h-64 flex items-center justify-center border border-gray-200">
                                    <Image className="w-12 h-12 text-gray-400" />
                                </div>
                            )}

                            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                                    <ThumbsUp className="w-5 h-5" />
                                    <span className="text-sm font-medium">{post.likes} Likes</span>
                                </button>
                                <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">{post.comments} Comments</span>
                                </button>
                                <button className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors ml-auto">
                                    <Share2 className="w-5 h-5" />
                                    <span className="text-sm font-medium">Share</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
