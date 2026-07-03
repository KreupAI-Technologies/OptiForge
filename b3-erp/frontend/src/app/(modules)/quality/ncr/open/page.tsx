'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ncrService as NCRService, NCR, NCRStatus } from '@/services/ncr.service';
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  XCircle,
  ArrowLeft,
  User,
  Calendar,
  FolderKanban,
  Search,
  Building2,
  Loader2,
  Eye,
  Plus,
  ArrowRight,
  FileWarning,
} from 'lucide-react';
import { projectManagementService } from '@/services/ProjectManagementService';

interface ProjectInfo {
  id: string;
  name: string;
  clientName: string;
  status: string;
}

export default function OpenNCRsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Project selection state
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectSearch, setProjectSearch] = useState('');

  // NCR state
  const [ncrs, setNcrs] = useState<NCR[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
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

  // Load NCRs when project is selected
  useEffect(() => {
    if (selectedProject) {
      loadNCRs();
    }
  }, [selectedProject]);

  const loadNCRs = async () => {
    setLoading(true);
    try {
      const data = await NCRService.getAllNCRs();
      // Filter only open NCRs (status is OPEN, UNDER_REVIEW, CONTAINMENT, ROOT_CAUSE, DISPOSITION, CAPA_REQUIRED, CAPA_IN_PROGRESS)
      const openNCRs = data.filter((n: NCR) =>
        [NCRStatus.OPEN, NCRStatus.UNDER_REVIEW, NCRStatus.CONTAINMENT, NCRStatus.ROOT_CAUSE, NCRStatus.DISPOSITION, NCRStatus.CAPA_REQUIRED, NCRStatus.CAPA_IN_PROGRESS].includes(n.status)
      );
      setNcrs(openNCRs);
    } catch (error) {
      console.error('Failed to load NCRs:', error);
      toast({ title: 'Error', description: 'Failed to load open NCRs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project: ProjectInfo) => {
    setSelectedProject(project);
    router.push(`/quality/ncr/open?projectId=${project.id}`);
    toast({ title: 'Project Selected', description: `Viewing open NCRs for ${project.name}` });
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredNCRs = ncrs
    .filter((ncr) => {
      const matchesSeverity = filterSeverity === 'all' || ncr.severity === filterSeverity;
      return matchesSeverity;
    })
    .sort((a, b) => {
      if (sortBy === 'severity') {
        const severityOrder = { critical: 0, major: 1, minor: 2 };
        return (severityOrder[a.severity as keyof typeof severityOrder] || 3) -
               (severityOrder[b.severity as keyof typeof severityOrder] || 3);
      }
      // Default: sort by date (newest first)
      return new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime();
    });

  const getStatusColor = (status: NCRStatus) => {
    switch (status) {
      case NCRStatus.OPEN:
        return 'bg-red-100 text-red-800 border-red-300';
      case NCRStatus.UNDER_REVIEW:
      case NCRStatus.CONTAINMENT:
      case NCRStatus.ROOT_CAUSE:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case NCRStatus.DISPOSITION:
      case NCRStatus.CAPA_REQUIRED:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case NCRStatus.CAPA_IN_PROGRESS:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case NCRStatus.CLOSED:
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'major':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'major':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'minor':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const stats = {
    total: ncrs.length,
    critical: ncrs.filter((n) => n.severity === 'critical').length,
    major: ncrs.filter((n) => n.severity === 'major').length,
    minor: ncrs.filter((n) => n.severity === 'minor').length,
    open: ncrs.filter((n) => n.status === NCRStatus.OPEN).length,
    inProgress: ncrs.filter((n) => [NCRStatus.UNDER_REVIEW, NCRStatus.CONTAINMENT, NCRStatus.ROOT_CAUSE, NCRStatus.DISPOSITION, NCRStatus.CAPA_REQUIRED, NCRStatus.CAPA_IN_PROGRESS].includes(n.status)).length,
  };

  // Project selection view
  if (!selectedProject) {
    return (
      <div className="w-full h-screen overflow-y-auto bg-gray-50">
        <div className="px-3 py-2 space-y-3">
          {/* Header */}
          <div className="bg-white rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <FileWarning className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Open NCRs</h1>
                <p className="text-sm text-gray-600 mt-1">Select a project to view open non-conformance reports</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
            />
          </div>

          {/* Projects Grid */}
          {projectsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
              <span className="ml-2 text-gray-600">Loading projects...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-red-300" onClick={() => handleProjectSelect(project)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-5 w-5 text-red-600" />
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
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      View Open NCRs
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

  // Open NCRs view
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
              <h1 className="text-3xl font-bold text-gray-900">Open NCRs</h1>
              <p className="text-sm text-gray-600 mt-1">{selectedProject.name} • {selectedProject.clientName}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedProject(null)}>
                <FolderKanban className="w-4 h-4 mr-2" />
                Change Project
              </Button>
              <Button variant="outline" onClick={() => router.push(`/quality/ncr?projectId=${selectedProject.id}`)}>
                All NCRs
              </Button>
              <Button onClick={() => router.push(`/quality/ncr/new?projectId=${selectedProject.id}`)}>
                <Plus className="w-4 h-4 mr-2" />
                Report NCR
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <span className="ml-2 text-gray-600">Loading open NCRs...</span>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-6 gap-2">
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Open</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <FileWarning className="w-8 h-8 text-gray-600" />
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">Critical</p>
                    <p className="text-2xl font-bold text-red-900">{stats.critical}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600">Major</p>
                    <p className="text-2xl font-bold text-orange-900">{stats.major}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600">Minor</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats.minor}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">Open</p>
                    <p className="text-2xl font-bold text-red-900">{stats.open}</p>
                  </div>
                  <Clock className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">In Progress</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.inProgress}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border p-3">
              <div className="flex gap-2">
                <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="px-4 py-2 border rounded-lg">
                  <option value="all">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="major">Major</option>
                  <option value="minor">Minor</option>
                </select>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 border rounded-lg">
                  <option value="date">Sort by Date</option>
                  <option value="severity">Sort by Severity</option>
                </select>
              </div>
            </div>

            {/* NCR List */}
            <div className="grid gap-2">
              {filteredNCRs.length === 0 ? (
                <div className="bg-white rounded-lg border p-8 text-center">
                  <FileWarning className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-600">No open NCRs found</h3>
                  <p className="text-sm text-gray-500 mt-1">All non-conformances have been resolved</p>
                  <Button className="mt-4" onClick={() => router.push(`/quality/ncr/new?projectId=${selectedProject.id}`)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Report New NCR
                  </Button>
                </div>
              ) : (
                filteredNCRs.map((ncr) => (
                  <div key={ncr.id} className={`bg-white rounded-lg border-2 p-3 hover:shadow-lg transition ${ncr.severity === 'critical' ? 'border-red-300' : ncr.severity === 'major' ? 'border-orange-300' : 'border-yellow-300'}`}>
                    <div className="flex items-start gap-2">
                      <div className={`w-16 h-16 rounded-lg ${ncr.severity === 'critical' ? 'bg-red-500' : ncr.severity === 'major' ? 'bg-orange-500' : 'bg-yellow-500'} flex items-center justify-center`}>
                        <AlertCircle className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold">{ncr.title}</h3>
                            <p className="text-sm text-gray-600">{ncr.ncrNumber} - {ncr.sourceType}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${getSeverityColor(ncr.severity)}`}>
                              {ncr.severity}
                            </span>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${getStatusColor(ncr.status)}`}>
                              {ncr.status}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Discovered By</p>
                            <p className="font-medium flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {ncr.discoveredByName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(ncr.reportedDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="font-medium">{ncr.discoveredLocation}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Days Open</p>
                            <p className="font-medium">
                              {Math.floor((new Date().getTime() - new Date(ncr.reportedDate).getTime()) / (1000 * 60 * 60 * 24))} days
                            </p>
                          </div>
                        </div>
                        <div className={`border rounded p-2 text-sm ${ncr.severity === 'critical' ? 'bg-red-50 border-red-200 text-red-800' : ncr.severity === 'major' ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
                          <strong>Description:</strong> {ncr.description}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm" onClick={() => router.push(`/quality/ncr/${ncr.id}?projectId=${selectedProject.id}`)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/quality/capa/new?ncrId=${ncr.id}&projectId=${selectedProject.id}`)}>
                            Create CAPA <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
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
