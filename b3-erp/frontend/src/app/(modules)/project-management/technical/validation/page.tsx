'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, AlertTriangle, FileText, Package, Layers, Send, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { projectManagementService, Project, BOMValidation } from '@/services/ProjectManagementService';

export default function BOMValidationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const [checks, setChecks] = useState({
    drawings: false,
    accessories: false,
    specs: false,
    quantities: false,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      const [project, validation] = await Promise.all([
        projectManagementService.getProject(id),
        projectManagementService.getBOMValidation(id)
      ]);
      setSelectedProject(project);
      if (validation) {
        setChecks(validation.checks);
        setIsSubmitted(validation.isSubmitted);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load validation data.",
      });
      router.push('/project-management/technical/validation');
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (key: keyof typeof checks) => {
    if (isSubmitted) return;
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checks).every(Boolean);

  const handleSubmit = async () => {
    if (!projectId || !allChecked) {
      toast({
        title: "Validation Incomplete",
        description: "Please confirm all checks before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      const validation: BOMValidation = {
        projectId,
        checks,
        isSubmitted: true,
        submittedAt: new Date().toISOString()
      };
      await projectManagementService.updateBOMValidation(validation);
      setIsSubmitted(true);

      toast({
        title: "BOM Submitted",
        description: `Technical design for ${selectedProject?.name} has been submitted to Procurement.`,
      });

      // Navigate back to project list after a delay
      setTimeout(() => {
        router.push('/project-management/technical/validation');
      }, 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit validation.",
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Select Project for Validation</h1>
            <p className="text-sm text-gray-500 font-medium font-sans">Step 3.7: Final check before procurement submission</p>
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
              <Card key={project.id} className="hover:shadow-md transition-shadow group cursor-pointer border-none shadow-sm ring-1 ring-gray-200 overflow-hidden" onClick={() => router.push(`${window.location.pathname}?projectId=${project.id}`)}>
                <CardHeader className="pb-3 bg-gray-50/50 border-b">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="mb-2 font-bold tracking-tighter bg-white">{project.projectCode}</Badge>
                    <Badge className={project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : ''}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl line-clamp-1 group-hover:text-blue-600 transition-colors tracking-tight font-bold">{project.name}</CardTitle>
                  <CardDescription className="font-medium">{project.clientName}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 pb-0">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-400 uppercase text-[10px] tracking-widest pt-0.5">Type</span>
                      <span>{project.projectType}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-400 uppercase text-[10px] tracking-widest pt-0.5">Location</span>
                      <span className="truncate ml-2 text-right">{project.location}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4">
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

  // View 2: Validation Form
  return (
    <div className="w-full py-2 space-y-4 px-3 font-sans">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push(window.location.pathname)} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">BOM Validation</h1>
            <p className="text-sm text-gray-500 font-medium">
              {selectedProject?.name} • Final Step
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(window.location.pathname)}>
            Change Project
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading validation state...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm border-none ring-1 ring-gray-200 overflow-hidden">
              <CardHeader className="bg-gray-50/50 border-b py-5">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg shadow-sm border border-blue-200">
                    <FileText className="w-5 h-5 text-blue-700 font-bold" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-800 tracking-tight">Design Package Summary</CardTitle>
                    <CardDescription className="text-gray-500 font-medium tracking-tight">Review all components before final submission</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="group flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-blue-50/30 transition-all hover:ring-1 hover:ring-blue-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                      <FileText className="w-6 h-6 text-blue-600 font-bold" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 tracking-tight">Technical Drawings</p>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-tighter">Approved v1.0 • 2 Files</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="font-bold text-blue-700 border-blue-200 hover:bg-white" onClick={() => router.push(`/project-management/technical/drawings?projectId=${projectId}`)}>Review repository</Button>
                </div>

                <div className="group flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-purple-50/30 transition-all hover:ring-1 hover:ring-purple-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                      <Package className="w-6 h-6 text-purple-600 font-bold" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 tracking-tight">Accessories BOM</p>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-tighter">Verified list • 36 Items</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="font-bold text-purple-700 border-purple-200 hover:bg-white" onClick={() => router.push(`/project-management/technical/bom/accessories?projectId=${projectId}`)}>View items</Button>
                </div>

                <div className="group flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-amber-50/30 transition-all hover:ring-1 hover:ring-amber-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                      <Layers className="w-6 h-6 text-amber-600 font-bold" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 tracking-tight">Shutter Specifications</p>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-tighter">Material selection complete</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="font-bold text-amber-700 border-amber-200 hover:bg-white" onClick={() => router.push(`/project-management/technical/specs/shutters?projectId=${projectId}`)}>Edit specs</Button>
                </div>
              </CardContent>
            </Card>

            <div className="p-5 rounded-2xl border border-blue-100 bg-blue-50/30 flex gap-4 shadow-sm border-l-4 border-l-blue-500">
              <div className="bg-blue-100 p-2.5 rounded-full h-fit flex items-center justify-center border border-blue-200 shadow-sm mt-0.5">
                <Info className="w-5 h-5 text-blue-600 font-bold" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-blue-900 uppercase tracking-widest pl-0.5">Submission Protocol</h4>
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                  Submitting this package triggers the transition from Technical Design to Procurement phase. Ensure all drawings have been triple-checked for production readiness as changes after this stage may impact project timelines and material lead times.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-md ring-1 ring-yellow-200 bg-yellow-50/50 overflow-hidden">
              <CardHeader className="bg-yellow-100/50 border-b border-yellow-200 py-5">
                <CardTitle className="text-yellow-900 flex items-center gap-2 font-bold tracking-tight">
                  <AlertTriangle className="w-5 h-5" />
                  Technical Approval
                </CardTitle>
                <CardDescription className="text-yellow-800/70 font-medium">Lead Engineer confirmation</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  {[
                    { id: 'drawings', label: 'Drawings are production-ready' },
                    { id: 'accessories', label: 'Accessories list is complete' },
                    { id: 'specs', label: 'Material specs are verified' },
                    { id: 'quantities', label: 'Quantities match BOQ' }
                  ].map((item) => (
                    <div key={item.id} className="flex items-start space-x-3 group cursor-pointer" onClick={() => handleCheck(item.id as keyof typeof checks)}>
                      <Checkbox
                        id={item.id}
                        checked={checks[item.id as keyof typeof checks]}
                        className="mt-1 data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600"
                        disabled={isSubmitted}
                      />
                      <Label
                        htmlFor={item.id}
                        className={`text-sm font-bold leading-tight cursor-pointer transition-colors ${checks[item.id as keyof typeof checks] ? 'text-yellow-900' : 'text-yellow-800/60'}`}
                      >
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full h-12 font-bold shadow-lg transition-all active:scale-[0.98] ${isSubmitted ? 'bg-green-600 hover:bg-green-700 shadow-green-100' : 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-100'}`}
                  onClick={handleSubmit}
                  disabled={isSubmitted || !allChecked}
                >
                  {isSubmitted ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Procurement Handover
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Validate & Submit
                    </>
                  )}
                </Button>

                {isSubmitted && (
                  <p className="text-[10px] text-center text-green-700 font-bold uppercase tracking-widest animate-pulse">
                    Routing to supply chain team...
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Workflow Status</h4>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isSubmitted ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                <p className="text-sm font-bold text-gray-700">{isSubmitted ? 'Technical Phase Locked' : 'Pending Verification'}</p>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${isSubmitted ? 'w-full bg-green-500' : 'bg-yellow-500 w-[75%]'}`}
                />
              </div>
              <p className="text-[10px] text-gray-400 font-medium">92% OF TECHNICAL CHECKS COMPLETE</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
