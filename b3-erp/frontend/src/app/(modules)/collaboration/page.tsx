'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Folder, Activity, Bell, Plus, FileText, Loader2, AlertCircle } from 'lucide-react';
import {
    collaborationOrphanService,
    CollabMessageItem,
    CollabFileItem,
    CollabChannelItem,
} from '@/services/collaboration.service';

function timeAgo(value?: string): string {
    if (!value) return '';
    const then = new Date(value).getTime();
    if (Number.isNaN(then)) return '';
    const diffMs = Date.now() - then;
    const mins = Math.round(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.round(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function CollaborationPage() {
    const [messages, setMessages] = useState<CollabMessageItem[]>([]);
    const [files, setFiles] = useState<CollabFileItem[]>([]);
    const [channels, setChannels] = useState<CollabChannelItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const [msgs, fls, chs] = await Promise.all([
                    collaborationOrphanService.getMessages(),
                    collaborationOrphanService.getFiles(),
                    collaborationOrphanService.getChannels(),
                ]);
                if (!active) return;
                setMessages(msgs);
                setFiles(fls);
                setChannels(chs);
            } catch (e) {
                if (active) setError(e instanceof Error ? e.message : 'Failed to load collaboration data');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    const unread = channels.reduce((sum, c) => sum + (Number(c.unreadCount) || 0), 0);
    const recentMessages = [...messages]
        .sort((a, b) => new Date(b.sentAt || b.createdAt || 0).getTime() - new Date(a.sentAt || a.createdAt || 0).getTime())
        .slice(0, 5);

    return (
        <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
            <div className="w-full space-y-3">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Collaboration Hub</h1>
                        <p className="text-sm text-gray-500 mt-1">Connect, share, and stay updated with your team</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 relative">
                            <Bell className="w-5 h-5 text-gray-600" />
                            {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>}
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            New Post
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Link href="/collaboration/messaging" className="block group">
                        <div className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-all hover:border-blue-500">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <MessageSquare className="w-6 h-6 text-blue-600" />
                                </div>
                                {!loading && unread > 0 && (
                                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">{unread} New</span>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Messaging</h3>
                            <p className="text-sm text-gray-600">
                                {loading ? 'Loading…' : `${messages.length} message${messages.length === 1 ? '' : 's'} across ${channels.length} channel${channels.length === 1 ? '' : 's'}`}
                            </p>
                        </div>
                    </Link>

                    <Link href="/collaboration/files" className="block group">
                        <div className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-all hover:border-purple-500">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                                    <Folder className="w-6 h-6 text-purple-600" />
                                </div>
                                {!loading && (
                                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">{files.length}</span>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">File Sharing</h3>
                            <p className="text-sm text-gray-600">
                                {loading ? 'Loading…' : `${files.length} shared file${files.length === 1 ? '' : 's'}`}
                            </p>
                        </div>
                    </Link>

                    <Link href="/collaboration/feed" className="block group">
                        <div className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-all hover:border-green-500">
                            <div className="flex items-center justify-between mb-2">
                                <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                                    <Activity className="w-6 h-6 text-green-600" />
                                </div>
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Live</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Activity Feed</h3>
                            <p className="text-sm text-gray-600">Company updates and system notifications</p>
                        </div>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-3">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-bold text-gray-900">Recent Messages</h2>
                            <Link href="/collaboration/feed" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                View All
                            </Link>
                        </div>
                        {loading ? (
                            <div className="flex items-center justify-center py-10 text-gray-400">
                                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading activity…
                            </div>
                        ) : recentMessages.length === 0 ? (
                            <div className="py-10 text-center text-sm text-gray-500">No recent messages yet.</div>
                        ) : (
                            <div className="space-y-3">
                                {recentMessages.map((m) => (
                                    <div key={m.id} className="flex gap-2">
                                        <div className="p-2 rounded-full h-fit bg-blue-100 text-blue-600">
                                            <MessageSquare className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-900">
                                                <span className="font-semibold">{m.senderName || 'Someone'}</span> posted{' '}
                                                <span className="text-gray-700">{m.content || 'a message'}</span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">{timeAgo(m.sentAt || m.createdAt)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Channels */}
                    <div className="bg-white rounded-xl border border-gray-200 p-3">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-lg font-bold text-gray-900">Channels</h2>
                            {!loading && (
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">{channels.length}</span>
                            )}
                        </div>
                        {loading ? (
                            <div className="flex items-center justify-center py-8 text-gray-400">
                                <Loader2 className="w-5 h-5 animate-spin" />
                            </div>
                        ) : channels.length === 0 ? (
                            <div className="py-8 text-center text-sm text-gray-500">No channels yet.</div>
                        ) : (
                            <div className="space-y-2">
                                {channels.slice(0, 6).map((c) => (
                                    <div key={c.id} className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                                            {(c.name || '#').slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{c.name || 'Channel'}</p>
                                            <p className="text-xs text-gray-500 truncate">{c.lastMessage || c.channelType || 'No messages'}</p>
                                        </div>
                                        {Number(c.unreadCount) > 0 && (
                                            <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{c.unreadCount}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        <Link href="/collaboration/messaging" className="block w-full mt-6 py-2 text-sm text-center text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200">
                            View All Channels
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
