'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Upload, FileText, Trash2, Eye, Plus, ArrowRight, FolderOpen, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { projectManagementService, Project } from '@/services/ProjectManagementService';
import { AttachmentsService, Attachment } from '@/services/attachments.service';

// Owning-record type used to key production drawings in the attachments store.
const DRAWING_ENTITY_TYPE = 'production-drawing';

export default function TechnicalDrawingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [drawings, setDrawings] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (projectId) {
      loadProjectData(projectId);
    } else {
      loadProjects();
    }
  }, [projectId]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectManagementService.getProjects();
      setProjects(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load projects.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProjectData = async (id: string) => {
    setLoading(true);
    try {
      const [project, dData] = await Promise.all([
        projectManagementService.getProject(id),
        AttachmentsService.list(DRAWING_ENTITY_TYPE, id)
      ]);
      setSelectedProject(project);
      setDrawings(dData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load drawing data.",
      });
      router.push('/project-management/technical/drawings');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFilesClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!projectId) return;
    const files = Array.from(e.target.files ?? []);
    // Reset the input so choosing the same file again re-triggers change.
    e.target.value = '';
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      await Promise.all(
        files.map((file) =>
          AttachmentsService.upload(file, DRAWING_ENTITY_TYPE, projectId, 'Technical Designer'),
        ),
      );
      await loadProjectData(projectId);
      toast({
        title: "Upload Complete",
        description: `${files.length} file(s) added to the drawing repository.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload drawing.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await AttachmentsService.remove(id);
      setDrawings(drawings.filter(d => d.id !== id));
      toast({
        title: "Drawing Deleted",
        description: "File removed from repository.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete drawing.",
      });
    }
  };

  const handleNext = () => {
    router.push('/project-management/technical/bom/accessories');
  };

  if (!projectId) {
    return (
      <div className="w-full py-2 space-y-6 px-3">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Select Project for Drawings</h1>
            <p className="text-sm text-gray-500">Step 3.4: Manage technical drawing repository</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500">Loading projects...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="mb-2">{project.projectCode}</Badge>
                    <Badge className={project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : ''}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl line-clamp-1">{project.name}</CardTitle>
                  <CardDescription>{project.clientName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-medium">{project.projectType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="font-medium truncate ml-2 text-right">{project.location}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    onClick={() => router.push(`/project-management/technical/drawings?projectId=${project.id}`)}
                  >
                    Select Project
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full py-2 space-y-4 px-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push('/project-management/technical/drawings')} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Drawing Repository</h1>
            <p className="text-sm text-gray-500">{selectedProject?.name} • Step 3.4</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/project-management/technical/drawings')}>
            Change Project
          </Button>
          <Button onClick={handleNext} size="sm" className="bg-blue-600 hover:bg-blue-700">
            Next: Accessories BOM <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500">Loading drawings...</p>
        </div>
      ) : (
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FolderOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Project Files</CardTitle>
                <CardDescription>CAD files and production specifications</CardDescription>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFilesChosen}
            />
            <Button onClick={handleSelectFilesClick} disabled={isUploading} variant="outline" className="gap-2 border-blue-200 hover:bg-blue-50">
              {isUploading ? <Loader2 className="w-4 h-4 text-blue-600 animate-spin" /> : <Upload className="w-4 h-4 text-blue-600" />}
              {isUploading ? 'Uploading…' : 'Upload New Version'}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/30">
                <TableRow>
                  <TableHead className="w-[300px]">File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drawings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500 gap-2">
                        <FileText className="w-8 h-8 opacity-20" />
                        <p>No drawings uploaded for this project yet.</p>
                        <Button variant="link" onClick={handleSelectFilesClick} disabled={isUploading} className="text-blue-600">Upload first file</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  drawings.map((drawing) => {
                    const ext = (drawing.fileName.split('.').pop() || 'FILE').toUpperCase();
                    const isCad = /dwg|dxf|step|stp|iges|igs/i.test(ext);
                    return (
                    <TableRow key={drawing.id} className="group hover:bg-blue-50/30 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded ${isCad ? 'bg-orange-50' : 'bg-red-50'}`}>
                            <FileText className={`w-4 h-4 ${isCad ? 'text-orange-600' : 'text-red-600'}`} />
                          </div>
                          <div>
                            <p className="text-gray-900">{drawing.fileName}</p>
                            <p className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{drawing.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal text-[10px] uppercase tracking-wider">{ext}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{(drawing.size / 1024).toFixed(0)} KB</TableCell>
                      <TableCell className="text-sm text-gray-600">{drawing.uploadedBy || '—'}</TableCell>
                      <TableCell className="text-sm text-gray-600">{drawing.createdAt ? new Date(drawing.createdAt).toLocaleDateString() : '—'}</TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a href={AttachmentsService.downloadUrl(drawing.id)} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white shadow-sm border border-transparent hover:border-gray-200">
                              <Eye className="w-4 h-4 text-gray-500" />
                            </Button>
                          </a>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-white shadow-sm border border-transparent hover:border-gray-200 hover:text-red-500"
                            onClick={() => handleDelete(drawing.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
          {drawings.length > 0 && (
            <CardFooter className="bg-gray-50/30 border-t py-3 px-6 flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Found <span className="font-bold text-gray-700">{drawings.length}</span> technical files for this project.
              </p>
              <div className="flex items-center gap-2 text-[10px] text-amber-600 font-medium">
                <AlertCircle className="w-3 h-3" />
                All production drawings must be approved by the Tech Lead before releasing to factory.
              </div>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
