'use client';

import { useRef, useState } from 'react';
import { Upload, Folder, AlertCircle } from 'lucide-react';
import { HrComplianceDocsService } from '@/services/hr-compliance-docs.service';

const FOLDERS = [
  'HR Policies',
  'Employee Handbooks',
  'Templates',
  'Circulars & Notices',
  'Compliance Documents',
  'Training Materials',
];

export default function UploadRepositoryPage() {
  const [folder, setFolder] = useState(FOLDERS[0]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setSaving(true);
    setMessage(null);
    try {
      for (const file of Array.from(files)) {
        await HrComplianceDocsService.uploadDocumentFile(file, {
          docCategory: folder,
          documentType: 'repository',
          title: file.name,
          uploadedOn: new Date().toISOString().slice(0, 10),
          status: 'pending',
        });
      }
      setMessage({ type: 'success', text: `Uploaded ${files.length} document(s) to "${folder}".` });
    } catch {
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Upload to Repository</h1>
        <p className="text-sm text-gray-600 mt-1">Upload documents to the company repository</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Select Destination Folder</h2>
        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {FOLDERS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        >
          <Upload className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-700 font-medium mb-2">Click to upload or drag and drop</p>
          <p className="text-sm text-gray-500">PDF, DOC, DOCX, XLS, XLSX up to 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <button
            type="button"
            disabled={saving}
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60"
          >
            {saving ? 'Uploading...' : 'Select Files'}
          </button>
          {message && (
            <p className={`mt-3 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Upload Guidelines
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>• Only authorized personnel can upload to the repository</li>
          <li>• All documents must be properly categorized</li>
          <li>• Ensure documents are virus-free before uploading</li>
          <li>• Use clear, descriptive file names</li>
          <li>• Add relevant tags and metadata for easy searching</li>
        </ul>
      </div>
    </div>
  );
}
