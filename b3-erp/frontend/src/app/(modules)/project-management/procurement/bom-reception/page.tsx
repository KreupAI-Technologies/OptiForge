'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, FileText, CheckCircle, Clock, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { projectManagementService, Project, BOMReception } from '@/services/ProjectManagementService';

export default function BOMReceptionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [boms, setBoms] = useState<BOMReception[]>([]);

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
      const [project, bomData] = await Promise.all([
        projectManagementService.getProject(id),
        projectManagementService.getBOMReceptions(id)
      ]);
      setSelectedProject(project);
      setBoms(bomData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project BOM data.",
      });
      router.push('/project-management/procurement/bom-reception');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiate = async (bom: BOMReception) => {
    try {
      const updatedBom: BOMReception = { ...bom, status: 'Processing' };
      await projectManagementService.updateBOMReception(updatedBom);
      setBoms(boms.map(b => b.id === bom.id ? updatedBom : b));

      toast({
        title: "Procurement Initiated",
        description: `Started procurement process for ${bom.id}`,
      });

      // Simulate navigation to next step
      setTimeout(() => {
        router.push('/project-management/procurement/stock-check');
      }, 1000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initiate procurement.",
      });
    }
  };

  // View 1: Project Selection
  if (!projectId) {
    return (
      <div className="w-full py-2 space-y-6 px-3">
        <div className="flex items-center gap-2 mb-3">
          <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Select Project for BOM Reception</h1>
            <p className="text-sm text-gray-500 font-medium">Step 4.1: Receive validated BOMs for procurement</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500 font-medium">Loading projects...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow group border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
                <CardHeader className="pb-3 bg-gray-50/50 border-b">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="mb-2 font-bold tracking-tighter bg-white">{project.projectCode}</Badge>
                    <Badge className={project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : ''}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl line-clamp-1 font-bold">{project.name}</CardTitle>
                  <CardDescription className="font-medium">{project.clientName}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-400 uppercase text-[10px] tracking-widest pt-0.5">Type</span>
                      <span className="font-medium">{project.projectType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 uppercase text-[10px] tracking-widest pt-0.5">Location</span>
                      <span className="font-medium truncate ml-2 text-right">{project.location}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    onClick={() => router.push(`${window.location.pathname}?projectId=${project.id}`)}
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

  // View 2: Main Content
  return (
    <div className="w-full py-2 space-y-4 px-3 font-sans">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push(window.location.pathname)} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">BOM Reception</h1>
            <p className="text-sm text-gray-500 font-medium">
              {selectedProject?.name} • Step 4.1
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push(window.location.pathname)}>
          Change Project
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading BOM requests...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500">Pending BOMs</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{boms.filter(b => b.status === 'Pending').length}</div>
                <p className="text-[10px] text-muted-foreground font-medium">Requires immediate attention</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500">In Processing</CardTitle>
                <AlertCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{boms.filter(b => b.status === 'Processing').length}</div>
                <p className="text-[10px] text-muted-foreground font-medium">Stock check in progress</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm ring-1 ring-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-gray-500">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{boms.filter(b => b.status === 'Completed').length}</div>
                <p className="text-[10px] text-muted-foreground font-medium">Sent for PO creation</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b py-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold tracking-tight">Incoming BOM Requests</CardTitle>
                  <CardDescription className="text-xs font-medium">Manage and initiate procurement for new projects</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-gray-50/30">
                  <TableRow>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">BOM ID</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Submitted By</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Date</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Items</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Priority</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-gray-500 font-medium">
                        No BOM requests found for this project.
                      </TableCell>
                    </TableRow>
                  ) : (
                    boms.map((bom) => (
                      <TableRow key={bom.id} className="hover:bg-blue-50/20 transition-colors">
                        <TableCell className="font-bold text-gray-900">{bom.id}</TableCell>
                        <TableCell className="text-sm text-gray-600 font-medium">{bom.submittedBy}</TableCell>
                        <TableCell className="text-sm text-gray-600 font-medium">{bom.date}</TableCell>
                        <TableCell className="text-sm font-bold text-gray-900">{bom.itemsCount}</TableCell>
                        <TableCell>
                          <Badge
                            variant={bom.priority === 'High' ? 'destructive' : 'secondary'}
                            className="text-[10px] font-bold px-2 py-0"
                          >
                            {bom.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            bom.status === 'Pending' ? 'bg-orange-100 text-orange-800 border-orange-200 font-bold text-[10px]' :
                              bom.status === 'Processing' ? 'bg-blue-100 text-blue-800 border-blue-200 font-bold text-[10px]' :
                                'bg-green-100 text-green-800 border-green-200 font-bold text-[10px]'
                          }>
                            {bom.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          {bom.status === 'Pending' && (
                            <Button size="sm" onClick={() => handleInitiate(bom)} className="bg-blue-600 hover:bg-blue-700 font-bold h-8 text-xs">
                              Initiate
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          )}
                          {bom.status === 'Processing' && (
                            <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 font-bold h-8 text-xs" onClick={() => router.push('/project-management/procurement/stock-check')}>
                              Continue
                            </Button>
                          )}
                          {bom.status === 'Completed' && (
                            <Button size="sm" variant="ghost" disabled className="text-green-600 font-bold h-8 text-xs">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Ready
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="bg-gray-50/30 border-t py-3 flex justify-between items-center px-6">
              <div className="flex items-center gap-2 text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                <Info className="w-3.5 h-3.5" />
                All BOMs must be stock-checked before PO generation
              </div>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
}
