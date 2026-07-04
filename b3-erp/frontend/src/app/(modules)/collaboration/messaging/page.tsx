'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, Phone, Video, Info, Paperclip, Smile, Send, Check, CheckCheck } from 'lucide-react';
import { collaborationOrphanService, type CollabChannelItem, type CollabMessageItem } from '@/services/collaboration.service';

interface ChatView { id: string; name: string; type: string; lastMessage: string; time: string; unread: number; status?: string; }
interface MessageView { id: string; sender: string; text: string; time: string; isMe: boolean; status?: string; }

function formatTime(value?: string): string {
    if (!value) return '';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessagingPage() {
    const [selectedChat, setSelectedChat] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [chats, setChats] = useState<ChatView[]>([]);
    const [messages, setMessages] = useState<MessageView[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const rawChannels = await collaborationOrphanService.getChannels();
                if (cancelled) return;
                const mapped: ChatView[] = (rawChannels as CollabChannelItem[]).map((c) => ({
                    id: String(c.id),
                    name: c.name ?? 'Untitled',
                    type: c.channelType ?? 'channel',
                    lastMessage: c.lastMessage ?? '',
                    time: formatTime(c.lastMessageAt),
                    unread: Number(c.unreadCount ?? 0),
                    status: c.status,
                }));
                setChats(mapped);
                if (mapped.length > 0) setSelectedChat(mapped[0].id);
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load channels');
                    setChats([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (!selectedChat) { setMessages([]); return; }
        let cancelled = false;
        const load = async () => {
            try {
                const raw = await collaborationOrphanService.getMessages(selectedChat);
                if (cancelled) return;
                setMessages((raw as CollabMessageItem[]).map((m) => ({
                    id: String(m.id),
                    sender: m.senderName ?? 'Unknown',
                    text: m.content ?? '',
                    time: formatTime(m.sentAt ?? m.createdAt),
                    isMe: (m.status === 'read' || m.status === 'delivered' || m.status === 'sent') && !!m.senderId && m.senderName === 'You',
                    status: m.status,
                })));
            } catch {
                if (!cancelled) setMessages([]);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [selectedChat]);

    const activeChat = chats.find((c) => c.id === selectedChat);

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
                        <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-sm text-gray-500">Loading channels…</div>
                    ) : loadError ? (
                        <div className="p-4 text-sm text-red-600">{loadError}</div>
                    ) : chats.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500">No conversations found.</div>
                    ) : chats.map((chat) => (
                        <button
                            key={chat.id}
                            onClick={() => setSelectedChat(chat.id)}
                            className={`w-full p-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${selectedChat === chat.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''
                                }`}
                        >
                            <div className="relative">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${chat.type === 'channel' ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {chat.type === 'channel' ? '#' : chat.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                {chat.status === 'online' && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                )}
                            </div>
                            <div className="flex-1 text-left">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-gray-900">{chat.name}</span>
                                    <span className="text-xs text-gray-500">{chat.time}</span>
                                </div>
                                <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                            </div>
                            {chat.unread > 0 && (
                                <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                    {chat.unread}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg font-semibold text-gray-600">
                            {activeChat?.type === 'channel' ? '#' : (activeChat?.name?.split(' ').map(n => n[0]).join('') || '#')}
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">{activeChat?.name ?? 'No conversation'}</h2>
                            <p className="text-xs text-gray-500">{activeChat?.type === 'channel' ? `${activeChat?.unread ?? 0} unread` : (activeChat?.status ?? '')}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Phone className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Video className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <Info className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
                    {messages.length === 0 && (
                        <div className="text-center text-sm text-gray-400 py-8">No messages yet.</div>
                    )}
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] ${msg.isMe ? 'order-2' : 'order-1'}`}>
                                <div className={`flex items-end gap-2 ${msg.isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {!msg.isMe && (
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 mb-1">
                                            {msg.sender.split(' ').map(n => n[0]).join('')}
                                        </div>
                                    )}
                                    <div className={`p-4 rounded-2xl shadow-sm ${msg.isMe
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white text-gray-900 rounded-tl-none'
                                        }`}>
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-1 mt-1 ${msg.isMe ? 'justify-end' : 'justify-start ml-10'}`}>
                                    <span className="text-xs text-gray-500">{msg.time}</span>
                                    {msg.isMe && (
                                        <span className="text-blue-600">
                                            {msg.status === 'read' ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                            <Plus className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-500"
                        />
                        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                            <Smile className="w-5 h-5" />
                        </button>
                        <button
                            className={`p-2 rounded-lg transition-colors ${messageInput.trim()
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
