'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { projectManagementService } from '@/services/ProjectManagementService';
import {
    Image as ImageIcon,
    FileText,
    Download,
    History,
    MoreVertical,
    CheckCircle2,
    Clock,
    AlertCircle,
    Maximize2,
    Filter,
    Plus,
} from 'lucide-react';

interface DesignAsset {
    id: string;
    fileName: string;
    category: 'drawing' | 'render';
    version: number;
    uploadDate: string;
    status: 'pending' | 'approved' | 'rejected';
    thumbnailUrl?: string;
    fileUrl: string;
    comments?: string;
    isLatest: boolean;
}

export default function DesignAssetGallery() {
    const { id } = useParams() as { id: string };
    const [assets, setAssets] = useState<DesignAsset[]>([]);
    const [filter, setFilter] = useState<'all' | 'drawing' | 'render'>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                setLoading(true);
                const rows = await projectManagementService.listDesignAssets();
                if (!active) return;
                if (rows && rows.length > 0) {
                    setAssets(rows.map((r) => ({
                        id: r.id,
                        fileName: r.fileName || '',
                        category: (r.category as DesignAsset['category']) || 'drawing',
                        version: r.version ?? 1,
                        uploadDate: r.uploadDate || '',
                        status: (r.status as DesignAsset['status']) || 'pending',
                        thumbnailUrl: r.thumbnailUrl,
                        fileUrl: r.fileUrl || '#',
                        comments: r.comments,
                        isLatest: r.isLatest ?? true,
                    })));
                }
                setError(null);
            } catch (e) {
                if (active) setError('Failed to load design assets');
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, [id]);

    const filteredAssets = filter === 'all' ? assets : assets.filter(a => a.category === filter);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'rejected': return <AlertCircle className="w-4 h-4 text-rose-500" />;
            default: return <Clock className="w-4 h-4 text-amber-500" />;
        }
    };

    return (
        <div className="w-full space-y-4 px-3 py-2">
            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-2 rounded-lg">{error}</div>
            )}
            {loading && (
                <div className="bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold px-4 py-2 rounded-lg">Loading assets…</div>
            )}
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-xl font-black text-gray-900 leading-none">Design Assets & Drawings</h1>
                    <p className="text-xs text-gray-400 font-bold mt-1">Project ID: {id}</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${filter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('drawing')}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${filter === 'drawing' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            Drawings
                        </button>
                        <button
                            onClick={() => setFilter('render')}
                            className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${filter === 'render' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            Renders
                        </button>
                    </div>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                        <Plus className="w-4 h-4" />
                        Upload Asset
                    </button>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filteredAssets.map(asset => (
                    <div key={asset.id} className="bg-white rounded-xl shadow-sm border border-gray-100 group overflow-hidden hover:shadow-md transition-all">
                        {/* Preview Area */}
                        <div className="aspect-video bg-gray-50 relative flex items-center justify-center overflow-hidden border-b border-gray-50">
                            {asset.thumbnailUrl ? (
                                <img src={asset.thumbnailUrl} alt={asset.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-gray-300">
                                    {asset.category === 'drawing' ? <FileText className="w-12 h-12" /> : <ImageIcon className="w-12 h-12" />}
                                    <span className="text-[10px] font-black uppercase tracking-widest">{asset.fileName.split('.').pop()}</span>
                                </div>
                            )}
                            <div className="absolute top-2 left-2 flex gap-1">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase bg-white border shadow-sm ${asset.category === 'drawing' ? 'text-purple-600 border-purple-100' : 'text-blue-600 border-blue-100'}`}>
                                    {asset.category}
                                </span>
                                {asset.isLatest && (
                                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-blue-600 text-white shadow-sm">
                                        Latest
                                    </span>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                                <button className="p-2 bg-white text-blue-600 rounded-lg shadow-lg hover:scale-110 transition-transform"><Maximize2 className="w-4 h-4" /></button>
                                <button className="p-2 bg-white text-blue-600 rounded-lg shadow-lg hover:scale-110 transition-transform"><Download className="w-4 h-4" /></button>
                            </div>
                        </div>

                        {/* Info Area */}
                        <div className="p-3">
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-gray-900 truncate" title={asset.fileName}>{asset.fileName}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold mt-0.5 flex items-center gap-1.5">
                                        Version {asset.version} • {new Date(asset.uploadDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1.5">
                                    {getStatusIcon(asset.status)}
                                </div>
                            </div>

                            {asset.comments && (
                                <div className="mt-2 p-2 bg-gray-50 rounded-lg text-[10px] text-gray-600 italic border border-gray-100 line-clamp-2">
                                    "{asset.comments}"
                                </div>
                            )}

                            <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                                <button className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 hover:text-blue-600 transition-colors">
                                    <History className="w-3 h-3" />
                                    Revision History
                                </button>
                                <button className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors"><MoreVertical className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {!loading && filteredAssets.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-xs font-bold text-gray-400">
                    No design assets found.
                </div>
            )}
        </div>
    );
}
