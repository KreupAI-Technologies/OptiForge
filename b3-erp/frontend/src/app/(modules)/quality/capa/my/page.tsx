'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { capaService as CAPAService, CAPA, CAPAStatus, CAPAType } from '@/services/capa.service';
import {
  Shield,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  User,
  Calendar,
  Target,
  FolderKanban,
  Search,
  Building2,
  Loader2,
  Eye,
  Plus,
  AlertTriangle,
  UserCircle,
  PlayCircle,
} from 'lucide-react';
import { projectManagementService } from '@/services/ProjectManagementService';

interface ProjectInfo {
  id: string;
  name: string;
  clientName: string;
  status: string;
}

export default function MyCAPAsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Simulated current user - in production this would come from auth context
  const currentUser = 'Current User';

  // Project selection state
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectSearch, setProjectSearch] = useState('');

  // CAPA state
  const [capas, setCapas] = useState<CAPA[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
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

  // Load CAPAs when project is selected
  useEffect(() => {
    if (selectedProject) {
      loadCAPAs();
    }
  }, [selectedProject]);

  const loadCAPAs = async () => {
    setLoading(true);
    try {
      const data = await CAPAService.getAllCAPAs();
      // Filter CAPAs assigned to current user or initiated by current user
      // In production, this filtering would be done server-side
      const myCAPAs = data.filter((c: CAPA) =>
        c.ownerName === currentUser ||
        c.ownerId === currentUser ||
        // For demo purposes, show all CAPAs that are open or in-progress
        [CAPAStatus.INITIATED, CAPAStatus.IN_PROGRESS, CAPAStatus.IMPLEMENTATION, CAPAStatus.VERIFICATION].includes(c.status)
      );
      setCapas(myCAPAs);
    } catch (error) {
      console.error('Failed to load CAPAs:', error);
      toast({ title: 'Error', description: 'Failed to load your CAPAs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project: ProjectInfo) => {
    setSelectedProject(project);
    router.push(`/quality/capa/my?projectId=${project.id}`);
    toast({ title: 'Project Selected', description: `Viewing your CAPAs for ${project.name}` });
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.clientName.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const filteredCAPAs = capas.filter((capa) => {
    const matchesStatus = filterStatus === 'all' || capa.status === filterStatus;
    const matchesType = filterType === 'all' || capa.type === filterType;
    return matchesStatus && matchesType;
  });

  const getStatusColor = (status: CAPAStatus) => {
    switch (status) {
      case CAPAStatus.CLOSED:
        return 'bg-green-100 text-green-800 border-green-300';
      case CAPAStatus.IN_PROGRESS:
      case CAPAStatus.IMPLEMENTATION:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case CAPAStatus.INITIATED:
      case CAPAStatus.APPROVED:
        return 'bg-red-100 text-red-800 border-red-300';
      case CAPAStatus.VERIFICATION:
      case CAPAStatus.EFFECTIVENESS_REVIEW:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case CAPAStatus.DRAFT:
      case CAPAStatus.PENDING_APPROVAL:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeColor = (type: CAPAType) => {
    switch (type) {
      case CAPAType.CORRECTIVE:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case CAPAType.PREVENTIVE:
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const stats = {
    total: capas.length,
    open: capas.filter((c) => [CAPAStatus.INITIATED, CAPAStatus.APPROVED].includes(c.status)).length,
    inProgress: capas.filter((c) => [CAPAStatus.IN_PROGRESS, CAPAStatus.IMPLEMENTATION].includes(c.status)).length,
    pendingVerification: capas.filter((c) => [CAPAStatus.VERIFICATION, CAPAStatus.EFFECTIVENESS_REVIEW].includes(c.status)).length,
    corrective: capas.filter((c) => c.type === CAPAType.CORRECTIVE).length,
    preventive: capas.filter((c) => c.type === CAPAType.PREVENTIVE).length,
  };

  const isOverdue = (targetDate: Date) => {
    return new Date(targetDate) < new Date();
  };

  const getDaysRemaining = (targetDate: Date) => {
    const days = Math.floor((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Project selection view
  if (!selectedProject) {
    return (
      <div className="w-full h-screen overflow-y-auto bg-gray-50">
        <div className="px-3 py-2 space-y-3">
          {/* Header */}
          <div className="bg-white rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My CAPAs</h1>
                <p className="text-sm text-gray-600 mt-1">Select a project to view your assigned CAPAs</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
            />
          </div>

          {/* Projects Grid */}
          {projectsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Loading projects...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-300" onClick={() => handleProjectSelect(project)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FolderKanban className="h-5 w-5 text-purple-600" />
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
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      View My CAPAs
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

  // My CAPAs view
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
              <h1 className="text-3xl font-bold text-gray-900">My CAPAs</h1>
              <p className="text-sm text-gray-600 mt-1">{selectedProject.name} • {selectedProject.clientName}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedProject(null)}>
                <FolderKanban className="w-4 h-4 mr-2" />
                Change Project
              </Button>
              <Button variant="outline" onClick={() => router.push(`/quality/capa?projectId=${selectedProject.id}`)}>
                All CAPAs
              </Button>
              <Button onClick={() => router.push(`/quality/capa/new?projectId=${selectedProject.id}`)}>
                <Plus className="w-4 h-4 mr-2" />
                Create CAPA
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            <span className="ml-2 text-gray-600">Loading your CAPAs...</span>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-6 gap-2">
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Assigned</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <UserCircle className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">Open</p>
                    <p className="text-2xl font-bold text-red-900">{stats.open}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">In Progress</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.inProgress}</p>
                  </div>
                  <PlayCircle className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600">Pending Verification</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats.pendingVerification}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600">Corrective</p>
                    <p className="text-2xl font-bold text-orange-900">{stats.corrective}</p>
                  </div>
                  <Shield className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600">Preventive</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.preventive}</p>
                  </div>
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border p-3">
              <div className="flex gap-2">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2 border rounded-lg">
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="pending-verification">Pending Verification</option>
                  <option value="closed">Closed</option>
                </select>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 border rounded-lg">
                  <option value="all">All Types</option>
                  <option value="corrective">Corrective</option>
                  <option value="preventive">Preventive</option>
                </select>
              </div>
            </div>

            {/* CAPA List */}
            <div className="grid gap-2">
              {filteredCAPAs.length === 0 ? (
                <div className="bg-white rounded-lg border p-8 text-center">
                  <UserCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-600">No CAPAs assigned to you</h3>
                  <p className="text-sm text-gray-500 mt-1">CAPAs assigned to you will appear here</p>
                </div>
              ) : (
                filteredCAPAs.map((capa) => (
                  <div key={capa.id} className={`bg-white rounded-lg border-2 p-3 hover:shadow-lg transition ${isOverdue(capa.targetCompletionDate) && capa.status !== CAPAStatus.CLOSED ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                    <div className="flex items-start gap-2">
                      <div className={`w-16 h-16 rounded-lg ${capa.type === CAPAType.CORRECTIVE ? 'bg-orange-500' : 'bg-purple-500'} flex items-center justify-center`}>
                        <Shield className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-bold">{capa.title}</h3>
                              {isOverdue(capa.targetCompletionDate) && capa.status !== CAPAStatus.CLOSED && (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Overdue
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{capa.capaNumber}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${getTypeColor(capa.type)}`}>
                              {capa.type}
                            </span>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${getStatusColor(capa.status)}`}>
                              {capa.status}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-5 gap-2 mb-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Owner</p>
                            <p className="font-medium flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {capa.ownerName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Start Date</p>
                            <p className="font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {capa.initiatedDate ? new Date(capa.initiatedDate).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Target Date</p>
                            <p className={`font-medium flex items-center gap-1 ${isOverdue(capa.targetCompletionDate) && capa.status !== CAPAStatus.CLOSED ? 'text-red-600' : ''}`}>
                              <Target className="w-3 h-3" />
                              {new Date(capa.targetCompletionDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Days Remaining</p>
                            <p className={`font-medium ${getDaysRemaining(capa.targetCompletionDate) < 0 ? 'text-red-600' : getDaysRemaining(capa.targetCompletionDate) <= 7 ? 'text-orange-600' : 'text-green-600'}`}>
                              {getDaysRemaining(capa.targetCompletionDate) < 0
                                ? `${Math.abs(getDaysRemaining(capa.targetCompletionDate))} days overdue`
                                : `${getDaysRemaining(capa.targetCompletionDate)} days`
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Priority</p>
                            <p className={`font-medium capitalize ${getPriorityColor(capa.priority || 'medium')}`}>
                              {capa.priority || 'Medium'}
                            </p>
                          </div>
                        </div>
                        {capa.rootCauseAnalysis?.rootCause && (
                          <div className={`border rounded p-2 text-sm ${isOverdue(capa.targetCompletionDate) && capa.status !== CAPAStatus.CLOSED ? 'bg-red-100 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                            <strong>Root Cause:</strong> {capa.rootCauseAnalysis.rootCause}
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm" onClick={() => router.push(`/quality/capa/${capa.id}?projectId=${selectedProject.id}`)}>
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          {[CAPAStatus.INITIATED, CAPAStatus.APPROVED].includes(capa.status) && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <PlayCircle className="w-4 h-4 mr-1" />
                              Start Working
                            </Button>
                          )}
                          {[CAPAStatus.IN_PROGRESS, CAPAStatus.IMPLEMENTATION].includes(capa.status) && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Submit for Verification
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
