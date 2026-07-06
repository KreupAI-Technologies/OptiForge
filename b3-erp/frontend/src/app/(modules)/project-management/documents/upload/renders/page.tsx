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
import { Upload, Image as ImageIcon, X, ArrowLeft, Eye, Check } from 'lucide-react';

export default function UploadRendersPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [project, setProject] = useState('');
  const [viewType, setViewType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
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
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
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
        documentType: 'Render',
        category: viewType || 'Renders',
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
          <h1 className="text-2xl font-bold text-gray-900">Upload 3D Renders</h1>
          <p className="text-sm text-gray-500">Submit 3D visualizations and walkthroughs for client approval</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Column: Metadata Form */}
        <div className="lg:col-span-1 space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Render Details</CardTitle>
              <CardDescription>Describe the visualization</CardDescription>
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
                <Label htmlFor="viewType">View Type</Label>
                <Select value={viewType} onValueChange={setViewType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select view type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perspective">Perspective View</SelectItem>
                    <SelectItem value="isometric">Isometric View</SelectItem>
                    <SelectItem value="top">Top Down / Plan View</SelectItem>
                    <SelectItem value="walkthrough">Walkthrough Video</SelectItem>
                    <SelectItem value="detail">Detail Shot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">Design Stage</Label>
                <Select defaultValue="concept">
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concept">Concept Design</SelectItem>
                    <SelectItem value="schematic">Schematic Design</SelectItem>
                    <SelectItem value="detailed">Detailed Design</SelectItem>
                    <SelectItem value="final">Final Presentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe the view, lighting, materials..." />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Gallery Upload */}
        <div className="lg:col-span-2 space-y-3">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Image Gallery</CardTitle>
              <CardDescription>Upload high-quality renders (JPG, PNG, MP4)</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                {files.map((file, index) => (
                  <div key={index} className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                    {file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => setPreviewFile(file)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" className="h-8 w-8 p-0 rounded-full" onClick={() => removeFile(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2">
                      <p className="text-xs text-white truncate">{file.name}</p>
                    </div>
                  </div>
                ))}

                <label className="cursor-pointer aspect-video border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center gap-2">
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                  />
                  <div className="p-2 bg-blue-50 rounded-full">
                    <Upload className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Add Images</span>
                </label>
              </div>

              {files.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic">
                  No images uploaded yet.
                </div>
              )}
            </CardContent>
            <div className="p-6 border-t bg-gray-50 rounded-b-lg flex justify-end gap-3">
              <Button variant="outline" onClick={() => setFiles([])}>Clear Gallery</Button>
              <Button
                onClick={handleSubmit}
                disabled={files.length === 0 || !project || !viewType || isUploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? 'Uploading...' : 'Submit Renders'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3">
          <div className={`bg-white rounded-lg shadow-xl flex flex-col transition-all duration-200 ${isMaximized ? 'w-full h-full' : 'w-full  h-[85vh]'}`}>
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
            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden p-2">
              {previewFile.type.startsWith('video/') ? (
                <video
                  src={URL.createObjectURL(previewFile)}
                  controls
                  className="max-w-full max-h-full"
                />
              ) : (
                <img
                  src={URL.createObjectURL(previewFile)}
                  alt={previewFile.name}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
