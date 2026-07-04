'use client';

import React, { useState, useEffect } from 'react';
import { Folder, FileText, Image, MoreVertical, Search, Plus, Upload, Download, Share2, Trash2, Grid, List, Clock, Star } from 'lucide-react';
import { collaborationOrphanService, type CollabFileItem, type CollabFolderItem } from '@/services/collaboration.service';

interface FolderView { id: string; name: string; items: number; size: string; modified: string; }
interface FileView { id: string; name: string; type: string; size: string; modified: string; owner: string; }

function formatBytes(bytes: number): string {
    const b = Number(bytes) || 0;
    if (b <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.min(Math.floor(Math.log(b) / Math.log(1024)), units.length - 1);
    return `${(b / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(value?: string): string {
    if (!value) return '';
    const d = new Date(value);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString();
}

function inferType(name?: string, fileType?: string): string {
    if (fileType && fileType !== 'file') return fileType;
    const ext = (name || '').split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'pdf';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'excel';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (['doc', 'docx'].includes(ext)) return 'doc';
    if (['zip', 'rar', '7z'].includes(ext)) return 'zip';
    return 'file';
}

export default function FilesPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [folders, setFolders] = useState<FolderView[]>([]);
    const [files, setFiles] = useState<FileView[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const [rawFolders, rawFiles] = await Promise.all([
                    collaborationOrphanService.getFolders(),
                    collaborationOrphanService.getFiles(),
                ]);
                if (cancelled) return;
                setFolders((rawFolders as CollabFolderItem[]).map((f) => ({
                    id: String(f.id),
                    name: f.name ?? 'Untitled',
                    items: Number(f.itemCount ?? 0),
                    size: formatBytes(Number(f.sizeBytes ?? 0)),
                    modified: formatDate(f.updatedAt),
                })));
                setFiles((rawFiles as CollabFileItem[]).map((f) => ({
                    id: String(f.id),
                    name: f.name ?? 'Untitled',
                    type: inferType(f.name, f.fileType),
                    size: formatBytes(Number(f.sizeBytes ?? 0)),
                    modified: formatDate(f.updatedAt),
                    owner: f.owner ?? 'Unknown',
                })));
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load files');
                    setFolders([]);
                    setFiles([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
            case 'excel': return <FileText className="w-8 h-8 text-green-500" />;
            case 'image': return <Image className="w-8 h-8 text-blue-500" />;
            case 'doc': return <FileText className="w-8 h-8 text-blue-600" />;
            case 'zip': return <Folder className="w-8 h-8 text-yellow-500" />;
            default: return <FileText className="w-8 h-8 text-gray-500" />;
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 px-3 py-2">
            <div className="w-full space-y-3">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">File Manager</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage and share your documents</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search files..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 whitespace-nowrap">
                            <Upload className="w-4 h-4" />
                            Upload
                        </button>
                    </div>
                </div>

                {/* Quick Access */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Recent
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap flex items-center gap-2">
                        <Star className="w-4 h-4" /> Starred
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap flex items-center gap-2">
                        <Share2 className="w-4 h-4" /> Shared with me
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Trash
                    </button>
                </div>

                {loadError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                        {loadError}
                    </div>
                )}

                {/* Folders */}
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Folders</h2>
                    {isLoading ? (
                        <div className="text-sm text-gray-500 py-4">Loading folders…</div>
                    ) : folders.length === 0 ? (
                        <div className="text-sm text-gray-500 py-4">No folders found.</div>
                    ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                        {folders.map((folder) => (
                            <div key={folder.id} className="bg-white p-3 rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                                <div className="flex justify-between items-start mb-3">
                                    <Folder className="w-10 h-10 text-blue-500 fill-blue-100" />
                                    <button className="p-1 hover:bg-gray-100 rounded-full">
                                        <MoreVertical className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                                <h3 className="font-semibold text-gray-900">{folder.name}</h3>
                                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                    <span>{folder.items} items</span>
                                    <span>{folder.size}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    )}
                </div>

                {/* Files */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-bold text-gray-900">Recent Files</h2>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="text-sm text-gray-500 py-4">Loading files…</div>
                    ) : files.length === 0 ? (
                        <div className="text-sm text-gray-500 py-4">No files found.</div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                            {files.map((file) => (
                                <div key={file.id} className="bg-white p-3 rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group">
                                    <div className="flex justify-between items-start mb-3">
                                        {getFileIcon(file.type)}
                                        <button className="p-1 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>
                                    <h3 className="font-medium text-gray-900 truncate mb-1">{file.name}</h3>
                                    <p className="text-xs text-gray-500 mb-3">{file.size} • {file.modified}</p>
                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                        <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                                            {file.owner?.[0] ?? '?'}
                                        </div>
                                        <span className="text-xs text-gray-500 truncate">{file.owner}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Size</th>
                                        <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Modified</th>
                                        <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Owner</th>
                                        <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {files.map((file) => (
                                        <tr key={file.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 flex items-center gap-3">
                                                {getFileIcon(file.type)}
                                                <span className="font-medium text-gray-900">{file.name}</span>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-600">{file.size}</td>
                                            <td className="px-3 py-2 text-sm text-gray-600">{file.modified}</td>
                                            <td className="px-3 py-2 text-sm text-gray-600">{file.owner}</td>
                                            <td className="px-3 py-2 text-right">
                                                <button className="p-2 hover:bg-gray-100 rounded-full">
                                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
