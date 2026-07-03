'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Package, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useProjectContext } from '@/context/ProjectContext';
import { projectManagementService, Project, SiteReadiness } from '@/services/ProjectManagementService';

export default function SiteReadinessPage() {
  const { loadProject } = useProjectContext();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [readinessRecord, setReadinessRecord] = useState<SiteReadiness | null>(null);
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
      const [project, record] = await Promise.all([
        projectManagementService.getProject(id),
        projectManagementService.getSiteReadiness(id)
      ]);
      setSelectedProject(project);
      setReadinessRecord(record);
      loadProject({
        id: project.id,
        name: project.name,
        projectType: project.projectType || 'Commercial Kitchen',
        customerName: project.clientName,
        status: project.status
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project details.",
      });
      router.push('/project-management/site-readiness');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReady = async () => {
    if (!selectedProject) return;

    try {
      if (readinessRecord) {
        await projectManagementService.updateSiteReadiness({
          ...readinessRecord,
          isReady: true,
          lastChecked: new Date().toISOString().split('T')[0]
        });
      }

      toast({
        title: "Site Confirmed Ready",
        description: "Proceeding to Production Phase.",
      });

      setTimeout(() => {
        router.push('/project-management/production');
      }, 1000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update readiness status.",
      });
    }
  };

  const handleNotReady = async () => {
    if (!selectedProject) return;

    try {
      if (readinessRecord) {
        await projectManagementService.updateSiteReadiness({
          ...readinessRecord,
          isReady: false,
          lastChecked: new Date().toISOString().split('T')[0]
        });
      }

      toast({
        variant: "destructive",
        title: "Site Not Ready",
        description: "Initiating Godown Storage Workflow.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update readiness status.",
      });
    }
  };

  if (!projectId) {
    return (
      <div className="w-full py-2 space-y-6">
        <div className="flex items-center gap-2 mb-3 px-3">
          <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Select Project for Site Readiness Check</h1>
            <p className="text-sm text-gray-500">Decision Point: Verify site conditions before proceeding to production</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-500">Loading projects...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-3">
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
                      <span className="font-medium">{project.location}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/project-management/site-readiness?projectId=${project.id}`)}
                  >
                    Check Readiness
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
    <div className="w-full py-2 space-y-4">
      <div className="flex items-center justify-between mb-3 px-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push('/project-management/site-readiness')} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Site Readiness Check</h1>
            <p className="text-sm text-gray-500">{selectedProject?.name} • Decision Point</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/project-management/site-readiness')}>
          Change Project
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500">Loading details...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 px-3">
          <div className="lg:col-span-3 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className={`border-l-4 ${readinessRecord?.isReady === true ? 'border-l-green-500 bg-green-50/30' : 'border-l-green-500'}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle>Site Ready</CardTitle>
                      <CardDescription>Proceed to Production</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-600">
                    {readinessRecord?.checkList.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${item.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                          {item.completed && <CheckCircle className="w-3 h-3" />}
                        </div>
                        <span className={item.completed ? 'text-gray-900 font-medium' : ''}>{item.item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleConfirmReady}
                    variant={readinessRecord?.isReady === true ? 'outline' : 'default'}
                  >
                    {readinessRecord?.isReady === true ? 'Already Confirmed Ready' : 'Confirm Site Ready'}
                  </Button>
                </CardFooter>
              </Card>

              <Card className={`border-l-4 ${readinessRecord?.isReady === false ? 'border-l-red-500 bg-red-50/30' : 'border-l-red-500'}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <CardTitle>Site Not Ready</CardTitle>
                      <CardDescription>Divert to Storage</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <p className="text-xs text-yellow-800 leading-relaxed">
                          Routing materials to godown storage prevents damage and reduces site congestion when civil works are incomplete.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <Package className="w-5 h-5 text-red-500" />
                      <span>Initiate Godown Storage Workflow</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleNotReady}
                    variant={readinessRecord?.isReady === false ? 'outline' : 'default'}
                  >
                    {readinessRecord?.isReady === false ? 'Marked Not Ready' : 'Mark Not Ready'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-blue-600" />
                  Status Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg border bg-gray-50 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current State</p>
                  {readinessRecord?.isReady === null ? (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Check</Badge>
                  ) : readinessRecord?.isReady === true ? (
                    <Badge className="bg-green-100 text-green-700 border-green-200">Ready</Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">Not Ready</Badge>
                  )}
                </div>

                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Checked:</span>
                    <span className="font-medium">{readinessRecord?.lastChecked || 'Never'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Project Code:</span>
                    <span className="font-medium">{selectedProject?.projectCode}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-blue-100 rounded-lg border border-blue-200">
              <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" />
                Important
              </h4>
              <p className="text-xs text-blue-800 leading-relaxed">
                Confirming site readiness triggers the procurement of final materials and schedules the production floor. Incorrect confirmation may lead to logistics bottlenecks.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
