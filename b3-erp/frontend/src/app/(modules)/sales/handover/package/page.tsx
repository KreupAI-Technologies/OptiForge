'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { salesHandoverService } from '@/services/sales-handover.service';
import {
    Package,
    FileText,
    CheckCircle,
    XCircle,
    Download,
    Send,
    AlertCircle,
    ArrowLeft,
} from 'lucide-react';

interface PackageDocument {
    id: string;
    name: string;
    type: string;
    status: 'Available' | 'Missing' | 'Pending Review';
    uploadDate?: string;
    uploadedBy?: string;
    content?: string;
}

interface HandoverPackage {
    projectId: string;
    projectNumber: string;
    projectName: string;
    customer: string;
    createdDate: string;
    completionPercentage: number;
    documents: PackageDocument[];
}

const EMPTY_PACKAGE: HandoverPackage = {
    projectId: '',
    projectNumber: '',
    projectName: '',
    customer: '',
    createdDate: '',
    completionPercentage: 0,
    documents: [],
};

export default function HandoverPackagePage() {
    const [packageData, setPackageData] = useState<HandoverPackage>(EMPTY_PACKAGE);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [currentNote, setCurrentNote] = useState('');
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const raw = await salesHandoverService.getPackageDocuments();
                const documents: PackageDocument[] = raw.map((d) => ({
                    id: d.id,
                    name: d.name,
                    type: d.type ?? '',
                    status: (d.status as PackageDocument['status']) ?? 'Missing',
                    uploadDate: d.uploadDate ?? undefined,
                    uploadedBy: d.uploadedBy ?? undefined,
                    content: d.content ?? undefined,
                }));
                const first = raw[0];
                const available = documents.filter((d) => d.status === 'Available').length;
                if (!cancelled) {
                    setPackageData({
                        projectId: first?.projectId ?? '',
                        projectNumber: first?.projectNumber ?? '',
                        projectName: first?.projectName ?? '',
                        customer: first?.customer ?? '',
                        createdDate: first?.createdAt
                            ? String(first.createdAt).split('T')[0]
                            : '',
                        completionPercentage: documents.length
                            ? Math.round((available / documents.length) * 100)
                            : 0,
                        documents,
                    });
                }
            } catch (err) {
                if (!cancelled) {
                    setLoadError(err instanceof Error ? err.message : 'Failed to load handover package');
                    setPackageData(EMPTY_PACKAGE);
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

    const availableDocs = packageData.documents.filter((d) => d.status === 'Available').length;
    const totalDocs = packageData.documents.length;

    const handleAddNote = (docId: string, existingContent?: string) => {
        setSelectedDocId(docId);
        setCurrentNote(existingContent || '');
        setShowNoteModal(true);
    };

    const handleViewNote = (doc: PackageDocument) => {
        setSelectedDocId(doc.id);
        setCurrentNote(doc.content || '');
        setShowNoteModal(true);
    };

    const handleSaveNote = () => {
        if (selectedDocId) {
            setPackageData((prev) => ({
                ...prev,
                documents: prev.documents.map((doc) =>
                    doc.id === selectedDocId
                        ? {
                            ...doc,
                            status: 'Available',
                            uploadDate: new Date().toISOString().split('T')[0],
                            uploadedBy: 'Current User',
                            content: currentNote,
                        }
                        : doc
                ),
            }));
            setShowNoteModal(false);
            setSelectedDocId(null);
            setCurrentNote('');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Available':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'Missing':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'Pending Review':
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Available':
                return 'bg-green-100 text-green-800';
            case 'Missing':
                return 'bg-red-100 text-red-800';
            case 'Pending Review':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="w-full h-screen overflow-y-auto overflow-x-hidden bg-gray-50">
            <div className="px-3 py-2 space-y-3">
                {/* Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Link
                                href="/sales/handover"
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Phase 1 Handover Package
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    {packageData.projectName} - {packageData.projectNumber}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                                <Download className="w-4 h-4" />
                                Download Package
                            </button>
                            <button
                                disabled={availableDocs !== totalDocs}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${availableDocs === totalDocs
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <Send className="w-4 h-4" />
                                Execute Handover
                            </button>
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="bg-white rounded-lg border border-gray-200 p-3 text-sm text-gray-500">
                        Loading handover package...
                    </div>
                )}

                {!isLoading && loadError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                        {loadError}
                    </div>
                )}

                {/* Progress Overview */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Package Completion</h2>
                            <p className="text-sm text-gray-600">
                                {availableDocs} of {totalDocs} required documents attached
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900">
                                {Math.round((availableDocs / totalDocs) * 100)}%
                            </div>
                            <p className="text-sm text-gray-600">Complete</p>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                            style={{ width: `${(availableDocs / totalDocs) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Package Details */}
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Project Information</h2>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-sm text-gray-600">Customer</p>
                            <p className="text-sm font-medium text-gray-900">{packageData.customer}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Package Created</p>
                            <p className="text-sm font-medium text-gray-900">{packageData.createdDate}</p>
                        </div>
                    </div>
                </div>

                {/* Document Checklist */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Required Documents Checklist
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Step 1.5 - All mandatory documents for Phase 1 handover
                        </p>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {packageData.documents.map((doc) => (
                            <div key={doc.id} className="px-3 py-2 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        {getStatusIcon(doc.status)}
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-gray-900">{doc.name}</h3>
                                            <p className="text-xs text-gray-500">{doc.type}</p>
                                            {doc.uploadDate && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Uploaded on {doc.uploadDate} by {doc.uploadedBy}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}
                                        >
                                            {doc.status}
                                        </span>
                                        {doc.status === 'Available' && (
                                            <button
                                                onClick={() => handleViewNote(doc)}
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <FileText className="w-4 h-4 text-gray-600" />
                                            </button>
                                        )}
                                        {doc.type === 'Notes' && doc.status === 'Missing' && (
                                            <button
                                                onClick={() => handleAddNote(doc.id)}
                                                className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                                            >
                                                Add Note
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Banner */}
                {availableDocs !== totalDocs && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-medium text-yellow-900">
                                    Handover Package Incomplete
                                </h3>
                                <p className="text-sm text-yellow-700 mt-1">
                                    You need to attach all {totalDocs} required documents before you can execute the
                                    handover. Currently missing: {totalDocs - availableDocs} document(s).
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {availableDocs === totalDocs && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-medium text-green-900">
                                    Handover Package Complete ✓
                                </h3>
                                <p className="text-sm text-green-700 mt-1">
                                    All required documents are attached. You can now execute the handover to transfer
                                    this project to the project execution team.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Note Modal */}
            {showNoteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-3 w-full max-w-md">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Notes: {packageData.documents.find(d => d.id === selectedDocId)?.name}
                        </h3>
                        <textarea
                            value={currentNote}
                            onChange={(e) => setCurrentNote(e.target.value)}
                            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                            placeholder="Enter your notes here..."
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowNoteModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveNote}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Save Note
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
