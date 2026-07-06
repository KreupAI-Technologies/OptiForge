'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectManagementService } from '@/services/ProjectManagementService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileImage, X, ArrowLeft, Layers, PenTool } from 'lucide-react';

export default function UploadDrawingsPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [project, setProject] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const [isMaximized, setIsMaximized] = useState(false);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    projectManagementService.getPmProjectPlansRaw()
      .then((rows) => {
        setProjects((Array.isArray(rows) ? rows : []).map((p: any) => ({
          id: String(p.id ?? p.projectCode ?? ''),
          name: p.projectName ?? p.name ?? p.projectCode ?? 'Project',
        })));
      })
      .catch(() => setProjects([]));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    try {
      const proj = projects.find((p) => p.id === project);
      await Promise.all(files.map((f) => projectManagementService.createPmDocument({
        companyId: 'default-company-id',
        projectId: project,
        projectName: proj?.name ?? '',
        documentName: f.name,
        documentType: 'Drawing',
        category: discipline || 'Drawings',
        version: '1.0',
        fileFormat: f.name.split('.').pop() ?? '',
        fileSize: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
        status: 'Pending Approval',
      } as any)));
      router.push('/project-management/documents');
    } catch {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full py-2 space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Technical Drawings</h1>
          <p className="text-sm text-gray-500">Submit architectural, structural, and MEP drawings for review</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Column: Metadata Form */}
        <div className="lg:col-span-1 space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Drawing Details</CardTitle>
              <CardDescription>Classify your drawings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="project">Select Project</Label>
                <Select value={project} onValueChange={setProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discipline">Discipline</Label>
                <Select value={discipline} onValueChange={setDiscipline}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="architectural">Architectural</SelectItem>
                    <SelectItem value="structural">Structural</SelectItem>
                    <SelectItem value="mechanical">Mechanical (HVAC)</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="fire">Fire Fighting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="revision">Revision Number</Label>
                <Input id="revision" placeholder="e.g., R0, A, 1" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Drawing Status</Label>
                <Select defaultValue="gfc">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft / For Review</SelectItem>
                    <SelectItem value="tender">Tender Purpose</SelectItem>
                    <SelectItem value="gfc">Good For Construction (GFC)</SelectItem>
                    <SelectItem value="as-built">As-Built</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Remarks</Label>
                <Textarea id="description" placeholder="Any specific notes for the reviewer..." />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Upload Area */}
        <div className="lg:col-span-2 space-y-3">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>Support for DWG, PDF, and DXF files</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div
                className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors flex flex-col items-center justify-center flex-grow min-h-[200px] ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  accept=".pdf,.dwg,.dxf"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2 w-full h-full justify-center">
                  <div className={`p-4 rounded-full ${isDragging ? 'bg-blue-100' : 'bg-blue-50'}`}>
                    <Layers className={`w-8 h-8 ${isDragging ? 'text-blue-700' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-900 block">
                      {isDragging ? 'Drop files now' : 'Drop drawings here or click to upload'}
                    </span>
                    <span className="text-sm text-gray-500 mt-1 block">
                      Upload multiple files (Max 50MB each)
                    </span>
                  </div>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">Selected Files ({files.length})</h3>
                  <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-gray-100 rounded">
                            {file.name.endsWith('.dwg') ? (
                              <PenTool className="w-5 h-5 text-purple-600" />
                            ) : (
                              <FileImage className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {file.type === 'application/pdf' && (
                            <Button variant="ghost" size="sm" onClick={() => setPreviewFile(file)} className="text-blue-600 hover:text-blue-800">
                              Preview
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <div className="p-6 border-t bg-gray-50 rounded-b-lg flex justify-end gap-3">
              <Button variant="outline" onClick={() => setFiles([])}>Clear All</Button>
              <Button
                onClick={handleSubmit}
                disabled={files.length === 0 || !project || !discipline || isUploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? 'Uploading...' : 'Submit Drawings'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
          <div className={`bg-white rounded-lg shadow-xl flex flex-col transition-all duration-200 ${isMaximized ? 'w-full h-full' : 'w-full  h-[80vh]'}`}>
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="text-lg font-semibold">{previewFile.name}</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsMaximized(!isMaximized)}>
                  {isMaximized ? 'Minimize' : 'Maximize'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setPreviewFile(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 p-3 overflow-hidden">
              <iframe
                src={URL.createObjectURL(previewFile)}
                className="w-full h-full rounded border bg-white"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
