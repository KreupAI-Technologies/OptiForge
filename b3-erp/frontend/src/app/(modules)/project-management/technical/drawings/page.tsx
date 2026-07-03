'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Upload, FileText, Trash2, Eye, Plus, ArrowRight, FolderOpen, AlertCircle } from 'lucide-react';
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
import { projectManagementService, Project, ProductionDrawing } from '@/services/ProjectManagementService';

export default function TechnicalDrawingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [drawings, setDrawings] = useState<ProductionDrawing[]>([]);
  const [loading, setLoading] = useState(true);

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
        projectManagementService.getProductionDrawings(id)
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

  const handleUpload = async () => {
    toast({
      title: "Upload Started",
      description: "Uploading technical drawings...",
    });

    try {
      const newDrawing: ProductionDrawing = {
        id: `DWG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        projectId: projectId!,
        name: `Technical_Detail_${drawings.length + 1}.pdf`,
        version: 'v1.0',
        type: 'PDF',
        uploadedBy: 'Technical Designer',
        date: new Date().toISOString().split('T')[0],
        status: 'Draft',
      };

      await projectManagementService.addProductionDrawing(newDrawing);
      setDrawings([...drawings, newDrawing]);

      toast({
        title: "Upload Complete",
        description: "Drawing added to repository.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload drawing.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await projectManagementService.deleteProductionDrawing(id);
      setDrawings(drawings.filter(d => d.id !== id));
      toast({
        title: "Drawing Deleted",
        description: "File removed from repository.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete drawing.",
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
            <Button onClick={handleUpload} variant="outline" className="gap-2 border-blue-200 hover:bg-blue-50">
              <Upload className="w-4 h-4 text-blue-600" />
              Upload New Version
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/30">
                <TableRow>
                  <TableHead className="w-[300px]">File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Release Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drawings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500 gap-2">
                        <FileText className="w-8 h-8 opacity-20" />
                        <p>No drawings uploaded for this project yet.</p>
                        <Button variant="link" onClick={handleUpload} className="text-blue-600">Upload first file</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  drawings.map((drawing) => (
                    <TableRow key={drawing.id} className="group hover:bg-blue-50/30 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded ${drawing.type === 'CAD' ? 'bg-orange-50' : 'bg-red-50'}`}>
                            <FileText className={`w-4 h-4 ${drawing.type === 'CAD' ? 'text-orange-600' : 'text-red-600'}`} />
                          </div>
                          <div>
                            <p className="text-gray-900">{drawing.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{drawing.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal text-[10px] uppercase tracking-wider">{drawing.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-gray-600">{drawing.version}</span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{drawing.uploadedBy}</TableCell>
                      <TableCell className="text-sm text-gray-600">{drawing.date}</TableCell>
                      <TableCell>
                        <Badge className={`${drawing.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} border-none`}>
                          {drawing.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white shadow-sm border border-transparent hover:border-gray-200">
                            <Eye className="w-4 h-4 text-gray-500" />
                          </Button>
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
                  ))
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
