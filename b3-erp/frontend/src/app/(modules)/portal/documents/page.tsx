'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Folder, FileText, Download, Search, Grid, List, MoreVertical, Upload } from 'lucide-react';
import Link from 'next/link';
import { PortalService, type PortalDocumentItem } from '@/services/portal.service';

interface DocView { id: string; name: string; type: 'folder' | 'file'; items?: string; size?: string; date: string; }

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
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

export default function PortalDocumentsPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [files, setFiles] = useState<DocView[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await PortalService.getDocuments();
                if (cancelled) return;
                setFiles((raw as PortalDocumentItem[]).map((d) => {
                    const isFolder = d.docType === 'folder';
                    return {
                        id: String(d.id),
                        name: d.name ?? 'Untitled',
                        type: isFolder ? 'folder' : 'file',
                        items: isFolder ? `${Number(d.itemCount ?? 0)} items` : undefined,
                        size: isFolder ? undefined : formatBytes(Number(d.sizeBytes ?? 0)),
                        date: formatDate(d.updatedAt ?? d.createdAt),
                    } as DocView;
                }));
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load documents');
                    setFiles([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="w-full min-h-screen bg-gray-50 p-3">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/portal" className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Back</span>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
                        <p className="text-gray-600 mt-1">Access your invoices, contracts, and project files</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-3 flex items-center justify-between">
                <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search documents..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <List className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Grid className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {loadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-3">
                    {loadError}
                </div>
            )}

            {/* File List */}
            {isLoading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-sm text-gray-500">
                    Loading documents…
                </div>
            ) : files.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-sm text-gray-500">
                    No documents found.
                </div>
            ) : viewMode === 'list' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Date Modified</th>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">Size / Items</th>
                                <th className="px-3 py-2 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {files.map((file) => (
                                <tr key={file.id} className="hover:bg-gray-50 group">
                                    <td className="px-3 py-2 flex items-center gap-3">
                                        {file.type === 'folder' ? (
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                                <Folder className="w-5 h-5" />
                                            </div>
                                        ) : (
                                            <div className="p-2 bg-red-50 text-red-600 rounded">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                        )}
                                        <span className="font-medium text-gray-900">{file.name}</span>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-500">{file.date}</td>
                                    <td className="px-3 py-2 text-sm text-gray-500">{file.type === 'folder' ? file.items : file.size}</td>
                                    <td className="px-3 py-2 text-right">
                                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {files.map((file) => (
                        <div key={file.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow group cursor-pointer">
                            <div className="flex justify-between items-start mb-2">
                                {file.type === 'folder' ? (
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                        <Folder className="w-8 h-8" />
                                    </div>
                                ) : (
                                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                )}
                                <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                            <h3 className="font-medium text-gray-900 truncate mb-1">{file.name}</h3>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>{file.date}</span>
                                <span>{file.type === 'folder' ? file.items : file.size}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
