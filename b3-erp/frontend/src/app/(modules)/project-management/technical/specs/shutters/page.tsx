'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, ArrowRight, Layers, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { projectManagementService, Project, ShutterSpecs } from '@/services/ProjectManagementService';

export default function ShutterSpecsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const [glassSpecs, setGlassSpecs] = useState({ type: 'Toughened', thickness: '5mm', finish: 'Clear', notes: '' });
  const [woodSpecs, setWoodSpecs] = useState({ core: 'MDF', finish: 'Laminate', edgeBand: '2mm PVC', notes: '' });
  const [stoneSpecs, setStoneSpecs] = useState({ material: 'Granite', thickness: '20mm', edgeProfile: 'Chamfered', notes: '' });
  const [metalSpecs, setMetalSpecs] = useState({ material: 'SS 304', finish: 'Brushed', gauge: '18G', notes: '' });

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
      const [project, specs] = await Promise.all([
        projectManagementService.getProject(id),
        projectManagementService.getShutterSpecs(id)
      ]);
      setSelectedProject(project);
      if (specs) {
        setGlassSpecs(specs.glass);
        setWoodSpecs(specs.wood);
        setStoneSpecs(specs.stone);
        setMetalSpecs(specs.metal);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project specs.",
      });
      router.push('/project-management/technical/specs/shutters');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!projectId) return;

    try {
      const specs: ShutterSpecs = {
        projectId,
        glass: glassSpecs,
        wood: woodSpecs,
        stone: stoneSpecs,
        metal: metalSpecs
      };
      await projectManagementService.updateShutterSpecs(specs);
      toast({
        title: "Specifications Saved",
        description: `Specs for ${selectedProject?.name} have been updated.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save specifications.",
      });
    }
  };

  const handleNext = () => {
    router.push('/project-management/technical/validation');
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
            <h1 className="text-2xl font-bold text-gray-900">Select Project for Specs</h1>
            <p className="text-sm text-gray-500">Step 3.6: Define material specifications for shutters</p>
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
                      <span className="font-medium truncate ml-2 text-right text-xs text-gray-400 uppercase tracking-tighter">{project.location}</span>
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

  // View 2: Specifications Form
  return (
    <div className="w-full py-2 space-y-4 px-3 font-sans">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push(window.location.pathname)} className="p-0 hover:bg-transparent">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Shutter Specifications</h1>
            <p className="text-sm text-gray-500 font-medium">
              {selectedProject?.name} • Step 3.6
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(window.location.pathname)}>
            Change Project
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} className="border-blue-200 text-blue-700 hover:bg-blue-50">
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleNext} size="sm" className="bg-blue-600 hover:bg-blue-700">
            Next: BOM Validation <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500 font-medium">Loading specifications...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <Tabs defaultValue="wood" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 h-12 rounded-xl mb-6 shadow-inner border">
              <TabsTrigger value="wood" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 font-bold uppercase text-[10px] tracking-wide">Wood / Laminate</TabsTrigger>
              <TabsTrigger value="glass" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 font-bold uppercase text-[10px] tracking-wide">Glass Shutters</TabsTrigger>
              <TabsTrigger value="stone" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 font-bold uppercase text-[10px] tracking-wide">Stone / Countertops</TabsTrigger>
              <TabsTrigger value="metal" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 font-bold uppercase text-[10px] tracking-wide">Metal / SS</TabsTrigger>
            </TabsList>

            <TabsContent value="wood" className="mt-0 ring-offset-background focus-visible:outline-none">
              <Card className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b py-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg shadow-sm border border-amber-200">
                      <Layers className="w-5 h-5 text-amber-700 font-bold" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-800 tracking-tight">Wood & Laminate Details</CardTitle>
                      <CardDescription className="text-gray-500 font-medium tracking-tight">Specify core materials and edge treatments</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Core Material</Label>
                      <Input
                        placeholder="e.g., HDHMR, BWR Plywood"
                        className="h-11 bg-gray-50/50 border-gray-200 focus:ring-amber-500 transition-shadow font-medium"
                        value={woodSpecs.core}
                        onChange={(e) => setWoodSpecs({ ...woodSpecs, core: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Finish / Laminate</Label>
                      <Input
                        placeholder="e.g., Matte Laminate, Acrylic"
                        className="h-11 bg-gray-50/50 border-gray-200 focus:ring-amber-500 transition-shadow font-medium"
                        value={woodSpecs.finish}
                        onChange={(e) => setWoodSpecs({ ...woodSpecs, finish: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Edge Banding</Label>
                      <Input
                        placeholder="e.g., 2mm PVC matching"
                        className="h-11 bg-gray-50/50 border-gray-200 focus:ring-amber-500 transition-shadow font-medium"
                        value={woodSpecs.edgeBand}
                        onChange={(e) => setWoodSpecs({ ...woodSpecs, edgeBand: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Technical Notes</Label>
                    <Textarea
                      placeholder="Specify grain direction, special adhesive requirements, etc."
                      className="min-h-[120px] bg-gray-50/50 border-gray-200 focus:ring-amber-500 transition-shadow font-medium text-sm leading-relaxed"
                      value={woodSpecs.notes}
                      onChange={(e) => setWoodSpecs({ ...woodSpecs, notes: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="glass" className="mt-0 ring-offset-background focus-visible:outline-none">
              <Card className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b py-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg shadow-sm border border-blue-200">
                      <Layers className="w-5 h-5 text-blue-700 font-bold" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-800 tracking-tight">Glass Specifications</CardTitle>
                      <CardDescription className="text-gray-500 font-medium tracking-tight">Details for glass inserts and glazed shutters</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Glass Type</Label>
                      <Input className="h-11 bg-gray-50/50 border-gray-200 focus:ring-blue-500 font-medium" value={glassSpecs.type} onChange={(e) => setGlassSpecs({ ...glassSpecs, type: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Thickness</Label>
                      <Input className="h-11 bg-gray-50/50 border-gray-200 focus:ring-blue-500 font-medium" value={glassSpecs.thickness} onChange={(e) => setGlassSpecs({ ...glassSpecs, thickness: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Finish / Tint</Label>
                      <Input className="h-11 bg-gray-50/50 border-gray-200 focus:ring-blue-500 font-medium" value={glassSpecs.finish} onChange={(e) => setGlassSpecs({ ...glassSpecs, finish: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Additional Notes</Label>
                    <Textarea className="min-h-[120px] bg-gray-50/50 border-gray-200 focus:ring-blue-500 text-sm font-medium" value={glassSpecs.notes} onChange={(e) => setGlassSpecs({ ...glassSpecs, notes: e.target.value })} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stone" className="mt-0 ring-offset-background focus-visible:outline-none">
              <Card className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b py-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg shadow-sm border border-emerald-200">
                      <Layers className="w-5 h-5 text-emerald-700 font-bold" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-800 tracking-tight">Stone & Countertop Details</CardTitle>
                      <CardDescription className="text-gray-500 font-medium tracking-tight">Specify surface materials for worktops</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Material Name</Label>
                      <Input className="h-11 bg-gray-50/50 border-gray-200 focus:ring-emerald-500 font-medium" value={stoneSpecs.material} onChange={(e) => setStoneSpecs({ ...stoneSpecs, material: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Thickness</Label>
                      <Input className="h-11 bg-gray-50/50 border-gray-200 focus:ring-emerald-500 font-medium" value={stoneSpecs.thickness} onChange={(e) => setStoneSpecs({ ...stoneSpecs, thickness: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Edge Profile</Label>
                      <Input className="h-11 bg-gray-50/50 border-gray-200 focus:ring-emerald-500 font-medium" value={stoneSpecs.edgeProfile} onChange={(e) => setStoneSpecs({ ...stoneSpecs, edgeProfile: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Additional Notes</Label>
                    <Textarea className="min-h-[120px] bg-gray-50/50 border-gray-200 focus:ring-emerald-500 text-sm font-medium" value={stoneSpecs.notes} onChange={(e) => setStoneSpecs({ ...stoneSpecs, notes: e.target.value })} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metal" className="mt-0 ring-offset-background focus-visible:outline-none">
              <Card className="border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b py-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg shadow-sm border border-slate-200">
                      <Layers className="w-5 h-5 text-slate-700 font-bold" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-800 tracking-tight">Metal & SS Details</CardTitle>
                      <CardDescription className="text-gray-500 font-medium tracking-tight">Specifications for stainless steel components</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Material Grade</Label>
                      <Input className="h-11 bg-gray-50/50 border-gray-200 focus:ring-slate-500 font-medium" value={metalSpecs.material} onChange={(e) => setMetalSpecs({ ...metalSpecs, material: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Gauge / Thickness</Label>
                      <Input className="h-11 bg-gray-50/50 border-gray-200 focus:ring-slate-500 font-medium" value={metalSpecs.gauge} onChange={(e) => setMetalSpecs({ ...metalSpecs, gauge: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Finish</Label>
                      <Input className="h-11 bg-gray-50/50 border-gray-200 focus:ring-slate-500 font-medium" value={metalSpecs.finish} onChange={(e) => setMetalSpecs({ ...metalSpecs, finish: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-1">Additional Notes</Label>
                    <Textarea className="min-h-[120px] bg-gray-50/50 border-gray-200 focus:ring-slate-500 text-sm font-medium" value={metalSpecs.notes} onChange={(e) => setMetalSpecs({ ...metalSpecs, notes: e.target.value })} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 flex gap-4 shadow-sm border-l-4 border-l-blue-500">
            <div className="bg-blue-100 p-2 rounded-full h-fit flex items-center justify-center border border-blue-200 shadow-sm mt-0.5">
              <Info className="w-4 h-4 text-blue-600 font-bold" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-blue-900 uppercase tracking-widest">Specifications Guide</h4>
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                Please ensure all material grades (e.g., SS 304, HDHMR) align with the approved BOQ and Technical Sharing document. Special grain directions or edge requirements should be clearly noted in the technical remarks section to avoid production errors.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
