'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectManagementService } from '@/services/ProjectManagementService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileSpreadsheet, FileText, CheckCircle, AlertCircle, ArrowLeft, Save } from 'lucide-react';

export default function UploadBOQPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [project, setProject] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [phase, setPhase] = useState('');
  const [version, setVersion] = useState('1.0');
  const [description, setDescription] = useState('');

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
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // Mock parsing for Excel files
      if (e.target.files[0].name.endsWith('.xlsx') || e.target.files[0].name.endsWith('.xls')) {
        setPreviewData([
          { item: '1.0', description: 'Excavation and Earthwork', unit: 'm3', quantity: 500, rate: 450, amount: 225000 },
          { item: '2.0', description: 'PCC 1:4:8 Foundation', unit: 'm3', quantity: 150, rate: 4500, amount: 675000 },
          { item: '3.0', description: 'RCC M25 Grade Concrete', unit: 'm3', quantity: 350, rate: 8500, amount: 2975000 },
          { item: '4.0', description: 'Steel Reinforcement (Fe500)', unit: 'kg', quantity: 25000, rate: 75, amount: 1875000 },
          { item: '5.0', description: 'Brick Masonry Work', unit: 'm3', quantity: 400, rate: 6500, amount: 2600000 },
        ]);
      } else {
        setPreviewData([]);
      }
    }
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    try {
      const proj = projects.find((p) => p.id === project);
      await projectManagementService.createPmDocument({
        companyId: 'default-company-id',
        projectId: project,
        projectName: proj?.name ?? '',
        documentName: file?.name ?? 'BOQ Document',
        documentType: 'BOQ',
        category: 'BOQ',
        version,
        fileFormat: file ? (file.name.split('.').pop() ?? '') : '',
        fileSize: file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '',
        status: 'Pending Approval',
        description,
      } as any);
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
          <h1 className="text-2xl font-bold text-gray-900">Upload Bill of Quantities (BOQ)</h1>
          <p className="text-sm text-gray-500">Upload and validate project BOQ documents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Column: Upload Form */}
        <div className="lg:col-span-1 space-y-3">
          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
              <CardDescription>Enter project and document information</CardDescription>
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
                <Label htmlFor="phase">Project Phase</Label>
                <Select value={phase} onValueChange={setPhase}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="execution">Execution</SelectItem>
                    <SelectItem value="procurement">Procurement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input id="version" placeholder="e.g., 1.0" value={version} onChange={(e) => setVersion(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Enter brief description..." value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>File Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:bg-gray-50 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".xlsx,.xls,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="p-3 bg-blue-50 rounded-full">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {file ? file.name : 'Click to upload or drag and drop'}
                  </span>
                  <span className="text-xs text-gray-500">
                    XLSX, PDF, DOC up to 10MB
                  </span>
                </label>
              </div>
              {file && (
                <div className="mt-4 flex items-center gap-3 p-3 bg-green-50 rounded-md border border-green-100">
                  {file.name.endsWith('x') ? <FileSpreadsheet className="w-5 h-5 text-green-600" /> : <FileText className="w-5 h-5 text-blue-600" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Preview & Actions */}
        <div className="lg:col-span-2 space-y-3">
          {previewData.length > 0 ? (
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>BOQ Preview</CardTitle>
                <CardDescription>Review extracted items before submission</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Item No</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[80px]">Unit</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{row.item}</TableCell>
                        <TableCell>{row.description}</TableCell>
                        <TableCell>{row.unit}</TableCell>
                        <TableCell className="text-right">{row.quantity}</TableCell>
                        <TableCell className="text-right">₹{row.rate.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold">₹{row.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <div className="p-6 border-t bg-gray-50 rounded-b-lg flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>Please verify all quantities before submitting</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setFile(null)}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={isUploading} className="bg-blue-600 hover:bg-blue-700">
                    {isUploading ? 'Submitting...' : 'Submit for Approval'}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px] bg-gray-50 border-dashed">
              <div className="text-center space-y-3">
                <div className="p-4 bg-white rounded-full shadow-sm inline-block">
                  <FileSpreadsheet className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No File Selected</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  Upload an Excel file to see a preview of the BOQ items here.
                  PDF and Word documents cannot be previewed.
                </p>
                {file && !file.name.endsWith('x') && (
                  <div className="mt-4">
                    <Button onClick={handleSubmit} disabled={!project || isUploading} className="bg-blue-600 hover:bg-blue-700">
                      {isUploading ? 'Submitting...' : 'Submit Document'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
