'use client';

export const dynamic = 'force-dynamic';

import { Project, projectManagementService, MEPDrawing } from '@/services/ProjectManagementService';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  FileText,
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Share2,
  Eye,
  Edit,
  Wrench,
  Zap,
  Droplet,
  Wind,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function MEPManagementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [drawings, setDrawings] = useState<MEPDrawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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
      const [project, mepDrawings] = await Promise.all([
        projectManagementService.getProject(id),
        projectManagementService.getMEPDrawings(id)
      ]);
      setSelectedProject(project);
      setDrawings(mepDrawings);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project details.",
      });
      router.push('/project-management/mep');
    } finally {
      setLoading(false);
    }
  };
  const [newDrawing, setNewDrawing] = useState({
    projectName: '',
    drawingType: '',
    drawingName: '',
  });

  const handleCreateDrawing = () => {
    if (!newDrawing.projectName || !newDrawing.drawingType || !newDrawing.drawingName) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields to create a drawing.",
        variant: "destructive",
      });
      return;
    }

    const newEntry: MEPDrawing = {
      id: Math.random().toString(36).substring(7),
      mepNumber: `MEP-2025-${(drawings.length + 1).toString().padStart(3, '0')}`,
      projectId: 'PRJ-2025-NEW', // Mock project ID
      projectName: newDrawing.projectName,
      drawingType: newDrawing.drawingType as any,
      drawingName: newDrawing.drawingName,
      version: '1.0',
      status: 'Draft',
      createdDate: new Date().toISOString().split('T')[0],
      createdBy: 'Current User',
      siteWorkProgress: 0,
      siteWorkStatus: 'Not Started',
      assignedTo: 'Pending Assignment',
      fileSize: '0 MB', // Placeholder
    };

    setDrawings([newEntry, ...drawings]);
    setIsCreateOpen(false);
    setNewDrawing({ projectName: '', drawingType: '', drawingName: '' });
    toast({
      title: "Drawing Created",
      description: `${newEntry.mepNumber} has been created successfully.`,
    });
  };

  const handleShare = (id: string) => {
    setDrawings(drawings.map(d => {
      if (d.id === id) {
        return { ...d, status: 'Shared with Site', siteWorkStatus: 'Not Started' };
      }
      return d;
    }));
    toast({
      title: "Shared with Site",
      description: "Drawing has been shared with the site team.",
    });
  };

  const filteredDrawings = drawings.filter(
    (d) =>
      (typeFilter === 'All' || d.drawingType === typeFilter) &&
      (statusFilter === 'All' || d.status === statusFilter)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-blue-100 text-blue-800';
      case 'Shared with Site':
        return 'bg-purple-100 text-purple-800';
      case 'Site Work Complete':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSiteWorkStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started':
        return 'text-gray-600';
      case 'In Progress':
        return 'text-blue-600';
      case 'Pending Inspection':
        return 'text-yellow-600';
      case 'Completed':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Electrical':
        return <Zap className="w-5 h-5 text-yellow-600" />;
      case 'Plumbing':
        return <Droplet className="w-5 h-5 text-blue-600" />;
      case 'HVAC':
        return <Wind className="w-5 h-5 text-cyan-600" />;
      case 'Fire Safety':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'Drainage':
        return <Droplet className="w-5 h-5 text-gray-600" />;
      default:
        return <Wrench className="w-5 h-5 text-gray-600" />;
    }
  };

  const stats = {
    total: drawings.length,
    draft: drawings.filter((d) => d.status === 'Draft').length,
    underReview: drawings.filter((d) => d.status === 'Under Review').length,
    approved: drawings.filter((d) => d.status === 'Approved').length,
    sharedWithSite: drawings.filter((d) => d.status === 'Shared with Site').length,
    siteComplete: drawings.filter((d) => d.status === 'Site Work Complete').length,
  };

  return (
    <div className="w-full h-screen overflow-y-auto overflow-x-hidden bg-gray-50">
      {!projectId ? (
        <div className="flex flex-col">
          <div className="px-3 py-2 space-y-3">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent">
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Select Project for MEP</h1>
                  <p className="text-sm text-gray-500">Manage MEP drawings and site progress</p>
                </div>
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
                          <span className="font-medium">{project.location}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={() => router.push(`/project-management/mep?projectId=${project.id}`)}
                      >
                        Manage MEP
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="px-3 py-2 space-y-3">
          {/* Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/project-management/mep')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    MEP Drawing Management
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedProject?.name} • Phase 2: Create, share, and track MEP drawings
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => router.push('/project-management/mep')}>
                  Change Project
                </Button>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      <Plus className="w-4 h-4" />
                      Create MEP Drawing
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New MEP Drawing</DialogTitle>
                      <DialogDescription>
                        Enter the details for the new MEP drawing. Click save when you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2 py-4">
                      <div className="grid grid-cols-4 items-center gap-2">
                        <Label htmlFor="project" className="text-right">
                          Project
                        </Label>
                        <Select
                          onValueChange={(value) => setNewDrawing({ ...newDrawing, projectName: value })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select Project" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Taj Hotels - Commercial Kitchen Setup">Taj Hotels</SelectItem>
                            <SelectItem value="BigBasket Cold Storage Facility">BigBasket</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-2">
                        <Label htmlFor="type" className="text-right">
                          Type
                        </Label>
                        <Select
                          onValueChange={(value) => setNewDrawing({ ...newDrawing, drawingType: value })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Electrical">Electrical</SelectItem>
                            <SelectItem value="Plumbing">Plumbing</SelectItem>
                            <SelectItem value="HVAC">HVAC</SelectItem>
                            <SelectItem value="Fire Safety">Fire Safety</SelectItem>
                            <SelectItem value="Drainage">Drainage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-2">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={newDrawing.drawingName}
                          onChange={(e) => setNewDrawing({ ...newDrawing, drawingName: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleCreateDrawing}>Create Drawing</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Draft</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
                  </div>
                  <Edit className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Review</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.underReview}</p>
                  </div>
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">At Site</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.sharedWithSite}</p>
                  </div>
                  <Share2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Complete</p>
                    <p className="text-2xl font-bold text-green-600">{stats.siteComplete}</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Type:</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All Types</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Fire Safety">Fire Safety</option>
                  <option value="Drainage">Drainage</option>
                </select>

                <label className="text-sm font-medium text-gray-700 ml-4">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All Status</option>
                  <option value="Draft">Draft</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Shared with Site">Shared with Site</option>
                  <option value="Site Work Complete">Site Work Complete</option>
                </select>
              </div>
            </div>

            {/* MEP Drawings List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        MEP Drawing
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Project
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Site Work Progress
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Assigned To
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDrawings.map((drawing) => (
                      <tr key={drawing.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {drawing.mepNumber}
                            </div>
                            <div className="text-sm text-gray-600">{drawing.drawingName}</div>
                            <div className="text-xs text-gray-500">
                              v{drawing.version} • {drawing.fileSize}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{drawing.projectName}</div>
                          <div className="text-xs text-gray-500">{drawing.projectId}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(drawing.drawingType)}
                            <span className="text-sm text-gray-900">{drawing.drawingType}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(drawing.status)}`}
                          >
                            {drawing.status}
                          </span>
                          {drawing.approvedDate && (
                            <div className="text-xs text-gray-500 mt-1">
                              Approved: {drawing.approvedDate}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className={`text-xs font-medium ${getSiteWorkStatusColor(drawing.siteWorkStatus)}`}
                              >
                                {drawing.siteWorkStatus}
                              </span>
                              <span className="text-xs font-medium text-gray-900">
                                {drawing.siteWorkProgress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${drawing.siteWorkProgress === 100
                                  ? 'bg-green-600'
                                  : drawing.siteWorkProgress > 0
                                    ? 'bg-blue-600'
                                    : 'bg-gray-400'
                                  }`}
                                style={{ width: `${drawing.siteWorkProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{drawing.assignedTo}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Drawing"
                              onClick={() => toast({ title: "View Drawing", description: `Viewing ${drawing.drawingName}` })}
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Download"
                              onClick={() => toast({ title: "Download Started", description: `Downloading ${drawing.drawingName}...` })}
                            >
                              <Download className="w-4 h-4 text-gray-600" />
                            </button>
                            {drawing.status === 'Approved' && (
                              <button
                                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Share with Site"
                                onClick={() => handleShare(drawing.id)}
                              >
                                <Share2 className="w-4 h-4 text-blue-600" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900">About MEP Management</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Step 2.8: Create MEP drawings, share them with site teams, and track the
                    progress of MEP work installation. MEP drawings must be approved before sharing
                    with site.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
