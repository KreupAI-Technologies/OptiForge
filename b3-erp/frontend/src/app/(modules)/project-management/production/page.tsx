'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Scissors,
  Wrench,
  Hammer,
  Flame,
  Sparkles,
  DoorOpen,
  LayoutGrid,
  ClipboardList,
  Factory,
  ChevronRight
} from 'lucide-react';
import { projectManagementService, Project } from '@/services/ProjectManagementService';

interface ProductionStation {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  status?: 'active' | 'idle' | 'maintenance';
  jobsCount?: number;
}

const productionStations: ProductionStation[] = [
  {
    id: 'work-order',
    name: 'Work Orders',
    description: 'Create and manage production work orders',
    icon: <ClipboardList className="w-6 h-6" />,
    href: '/project-management/production/work-order-enhanced',
  },
  {
    id: 'laser-cutting',
    name: 'Laser Cutting',
    description: 'CNC laser cutting operations and logo etching',
    icon: <Scissors className="w-6 h-6" />,
    href: '/project-management/production/laser-cutting',
  },
  {
    id: 'bending',
    name: 'Bending',
    description: 'Metal bending and forming operations',
    icon: <Wrench className="w-6 h-6" />,
    href: '/project-management/production/bending',
  },
  {
    id: 'fabrication',
    name: 'Fabrication',
    description: 'General fabrication and assembly work',
    icon: <Hammer className="w-6 h-6" />,
    href: '/project-management/production/fabrication',
  },
  {
    id: 'welding',
    name: 'Welding',
    description: 'Welding and joint work',
    icon: <Flame className="w-6 h-6" />,
    href: '/project-management/production/welding',
  },
  {
    id: 'buffing',
    name: 'Buffing & Finishing',
    description: 'Surface finishing and polishing',
    icon: <Sparkles className="w-6 h-6" />,
    href: '/project-management/production/buffing',
  },
  {
    id: 'shutter-work',
    name: 'Shutter Work',
    description: 'Shutter assembly and installation prep',
    icon: <DoorOpen className="w-6 h-6" />,
    href: '/project-management/production/shutter-work',
  },
  {
    id: 'trial-wall',
    name: 'Trial Wall',
    description: 'Trial assembly and quality verification',
    icon: <LayoutGrid className="w-6 h-6" />,
    href: '/project-management/production/trial-wall',
  },
];

export default function ProductionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
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
      toast({ variant: "destructive", title: "Error", description: "Failed to load projects." });
    } finally {
      setLoading(false);
    }
  };

  const loadProjectData = async (id: string) => {
    setLoading(true);
    try {
      const project = await projectManagementService.getProject(id);
      setSelectedProject(project);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load project details." });
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project: Project) => {
    router.push(`/project-management/production?projectId=${project.id}`);
  };

  // Project selection view
  if (!projectId) {
    return (
      <div className="p-3">
        <div className="flex items-center gap-3 mb-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/project-management')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Production</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Select a project to view production status</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleProjectSelect(project)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant={project.status === 'In Progress' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </div>
                  <CardDescription>{project.projectCode}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Client: {project.clientName}</p>
                    <p>Phase: {project.status}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Production stations view
  return (
    <div className="p-3">
      <div className="flex items-center gap-3 mb-3">
        <Button variant="outline" size="sm" onClick={() => router.push('/project-management/production')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Production</h1>
          {selectedProject && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedProject.name} - {selectedProject.projectCode}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Factory className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium">Production Workflow</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Production Workflow Overview */}
          <Card className="mb-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Production Workflow</CardTitle>
              <CardDescription>
                Track and manage each stage of the production process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 overflow-x-auto py-2">
                {productionStations.slice(1).map((station, index) => (
                  <div key={station.id} className="flex items-center">
                    <div className="flex flex-col items-center min-w-[80px]">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                        {station.icon}
                      </div>
                      <span className="text-xs text-center mt-1 text-gray-600 dark:text-gray-400">
                        {station.name}
                      </span>
                    </div>
                    {index < productionStations.length - 2 && (
                      <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Production Stations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {productionStations.map((station) => (
              <Link
                key={station.id}
                href={`${station.href}?projectId=${projectId}`}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                        {station.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{station.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {station.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
