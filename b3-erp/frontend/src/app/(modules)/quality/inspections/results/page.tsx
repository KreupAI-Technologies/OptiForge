'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { inspectionService as InspectionService, Inspection, InspectionResult, InspectionStatus } from '@/services/inspection.service';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Calendar,
  User,
  Package,
  FolderKanban,
  Search,
  Building2,
  Loader2,
  Eye,
  FileBarChart,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from 'lucide-react';
import { projectManagementService } from '@/services/ProjectManagementService';

interface ProjectInfo {
  id: string;
  name: string;
  clientName: string;
  status: string;
}

export default function InspectionResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Project selection state
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectSearch, setProjectSearch] = useState('');

  // Inspections state
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [filterResult, setFilterResult] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const allProjects = await projectManagementService.getProjects();
        const projectInfos: ProjectInfo[] = allProjects.map((p: any) => ({
          id: p.id,
          name: p.projectName || p.name || `Project ${p.id}`,
          clientName: p.clientName || p.customer || 'Unknown Client',
          status: p.status || 'active',
        }));
        setProjects(projectInfos);

        const projectId = searchParams.get('projectId');
        if (projectId) {
          const found = projectInfos.find(p => p.id === projectId);
          if (found) {
            setSelectedProject(found);
          }
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
        toast({ title: 'Error', description: 'Failed to load projects', variant: 'destructive' });
      } finally {
        setProjectsLoading(false);
      }
    };
    loadProjects();
  }, [searchParams, toast]);

  // Load inspections when project is selected
  useEffect(() => {
    if (selectedProject) {
      loadInspections();
    }
  }, [selectedProject]);

  const loadInspections = async () => {
    setLoading(true);
    try {
      const data = await InspectionService.getAllInspections();
      // Filter only completed inspections (pass, fail, conditional results)
      const completedInspections = data.filter((i: Inspection) =>
        [InspectionResult.PASS, InspectionResult.FAIL, InspectionResult.CONDITIONAL].includes(i.overallResult)
      );
      setInspections(completedInspections);
    } catch (error) {
      console.error('Failed to load inspections:', error);
      toast({ title: 'Error', description: 'Failed to load inspection results', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project: ProjectInfo) => {
    setSelectedProject(project);
    router.push(`/quality/inspections/results?projectId=${project.id}`);
    toast({ title: 'Project Selected', description: `Viewing inspection results for ${project.name}` });
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredInspections = inspections.filter((inspection) => {
    const matchesResult = filterResult === 'all' || inspection.overallResult === filterResult;
    const matchesType = filterType === 'all' || inspection.type === filterType;
    return matchesResult && matchesType;
  });

  const getResultColor = (result: InspectionResult) => {
    switch (result) {
      case InspectionResult.PASS:
        return 'bg-green-100 text-green-800 border-green-300';
      case InspectionResult.FAIL:
        return 'bg-red-100 text-red-800 border-red-300';
      case InspectionResult.CONDITIONAL:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getResultIcon = (result: InspectionResult) => {
    switch (result) {
      case InspectionResult.PASS:
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case InspectionResult.FAIL:
        return <XCircle className="w-5 h-5 text-red-600" />;
      case InspectionResult.CONDITIONAL:
        return <FileBarChart className="w-5 h-5 text-orange-600" />;
      default:
        return <ClipboardCheck className="w-5 h-5 text-gray-600" />;
    }
  };

  const stats = {
    total: inspections.length,
    passed: inspections.filter((i) => i.overallResult === InspectionResult.PASS).length,
    failed: inspections.filter((i) => i.overallResult === InspectionResult.FAIL).length,
    conditional: inspections.filter((i) => i.overallResult === InspectionResult.CONDITIONAL).length,
  };

  const passRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;

  // Project selection view
  if (!selectedProject) {
    return (
      <div className="w-full h-screen overflow-y-auto bg-gray-50">
        <div className="px-3 py-2 space-y-3">
          {/* Header */}
          <div className="bg-white rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileBarChart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inspection Results</h1>
                <p className="text-sm text-gray-600 mt-1">Select a project to view completed inspection results</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
            />
          </div>

          {/* Projects Grid */}
          {projectsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <span className="ml-2 text-gray-600">Loading projects...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-300" onClick={() => handleProjectSelect(project)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                      </div>
                      <Badge variant="outline" className="capitalize">{project.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="h-4 w-4" />
                      <span>{project.clientName}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      View Results
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Inspection results view
  return (
    <div className="w-full h-screen overflow-y-auto bg-gray-50">
      <div className="px-3 py-2 space-y-3">
        {/* Header */}
        <div className="bg-white rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Inspection Results</h1>
              <p className="text-sm text-gray-600 mt-1">{selectedProject.name} • {selectedProject.clientName}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedProject(null)}>
                <FolderKanban className="w-4 h-4 mr-2" />
                Change Project
              </Button>
              <Button onClick={() => router.push(`/quality/inspections?projectId=${selectedProject.id}`)}>
                All Inspections
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Loading inspection results...</span>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-5 gap-2">
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Completed</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <ClipboardCheck className="w-8 h-8 text-gray-600" />
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Passed</p>
                    <p className="text-2xl font-bold text-green-900">{stats.passed}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">Failed</p>
                    <p className="text-2xl font-bold text-red-900">{stats.failed}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600">Conditional</p>
                    <p className="text-2xl font-bold text-orange-900">{stats.conditional}</p>
                  </div>
                  <FileBarChart className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Pass Rate</p>
                    <p className="text-2xl font-bold text-blue-900">{passRate}%</p>
                  </div>
                  {passRate >= 90 ? (
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  ) : (
                    <TrendingDown className="w-8 h-8 text-red-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border p-3">
              <div className="flex gap-2">
                <select value={filterResult} onChange={(e) => setFilterResult(e.target.value)} className="px-4 py-2 border rounded-lg">
                  <option value="all">All Results</option>
                  <option value={InspectionResult.PASS}>Passed</option>
                  <option value={InspectionResult.FAIL}>Failed</option>
                  <option value={InspectionResult.CONDITIONAL}>Conditional</option>
                </select>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 border rounded-lg">
                  <option value="all">All Types</option>
                  <option value="incoming">Incoming</option>
                  <option value="in-process">In-Process</option>
                  <option value="final">Final</option>
                  <option value="dimensional">Dimensional</option>
                  <option value="visual">Visual</option>
                </select>
              </div>
            </div>

            {/* Results List */}
            <div className="grid gap-2">
              {filteredInspections.length === 0 ? (
                <div className="bg-white rounded-lg border p-8 text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-600">No inspection results found</h3>
                  <p className="text-sm text-gray-500 mt-1">Completed inspections will appear here</p>
                </div>
              ) : (
                filteredInspections.map((inspection) => (
                  <div key={inspection.id} className="bg-white rounded-lg border p-3 hover:shadow-lg transition">
                    <div className="flex items-start gap-2">
                      <div className={`w-16 h-16 rounded-lg ${inspection.overallResult === InspectionResult.PASS ? 'bg-green-500' : inspection.overallResult === InspectionResult.FAIL ? 'bg-red-500' : 'bg-orange-500'} flex items-center justify-center`}>
                        {getResultIcon(inspection.overallResult)}
                        <ClipboardCheck className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold">{inspection.productName}</h3>
                            <p className="text-sm text-gray-600">{inspection.inspectionNumber}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${getResultColor(inspection.overallResult)}`}>
                              {inspection.overallResult}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Inspector</p>
                            <p className="font-medium flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {inspection.inspectorName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Completed Date</p>
                            <p className="font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {inspection.completedAt ? new Date(inspection.completedAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Work Order</p>
                            <p className="font-medium flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {inspection.workOrderId}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Type</p>
                            <p className="font-medium capitalize">{inspection.type}</p>
                          </div>
                        </div>
                        {inspection.notes && (
                          <div className={`border rounded p-2 text-sm ${inspection.overallResult === InspectionResult.PASS ? 'bg-green-50 border-green-200 text-green-800' : inspection.overallResult === InspectionResult.FAIL ? 'bg-red-50 border-red-200 text-red-800' : 'bg-orange-50 border-orange-200 text-orange-800'}`}>
                            <strong>Notes:</strong> {inspection.notes}
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm" onClick={() => router.push(`/quality/inspections/${inspection.id}?projectId=${selectedProject.id}`)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          {inspection.overallResult === InspectionResult.FAIL && (
                            <Button variant="outline" size="sm" className="text-red-600 border-red-300" onClick={() => router.push(`/quality/ncr/new?inspectionId=${inspection.id}&projectId=${selectedProject.id}`)}>
                              Create NCR
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
