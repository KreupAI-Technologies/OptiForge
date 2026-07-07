'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { projectManagementService } from '@/services/ProjectManagementService';
import { toPhases } from '@/components/project-management/pm-wiring-transforms';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Ruler,
  Camera,
  PenTool,
  Zap,
  MapPin,
  Calendar,
  UserPlus,
  PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkflowStep {
  id: string;
  stepNumber: string;
  title: string;
  description: string;
  icon: any;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Skipped';
  href: string;
}

const baseWorkflowSteps: WorkflowStep[] = [
  {
    id: 'verify-drawings',
    stepNumber: '2.1',
    title: 'Drawing Verification',
    description: 'Verify layout drawings against BOQ and 3D',
    icon: FileText,
    status: 'Completed',
    href: '/project-management/documents/verification'
  },
  {
    id: 'check-boq',
    stepNumber: '2.2',
    title: 'BOQ Cross-Check',
    description: 'Verify BOQ quantities match drawing specifications',
    icon: CheckCircle,
    status: 'Completed',
    href: '/project-management/boq/check'
  },
  {
    id: 'log-discrepancies',
    stepNumber: '2.3',
    title: 'Log Discrepancies',
    description: 'Record any mismatches for client clarification',
    icon: AlertCircle,
    status: 'In Progress',
    href: '/project-management/discrepancies'
  },
  {
    id: 'schedule-visit',
    stepNumber: '2.4',
    title: 'Schedule Site Visit',
    description: 'Coordinate with client for site access',
    icon: Calendar,
    status: 'Pending',
    href: '/project-management/site-visit/schedule'
  },
  {
    id: 'site-measurements',
    stepNumber: '2.5',
    title: 'Site Measurements',
    description: 'Capture actual dimensions via mobile app',
    icon: Ruler,
    status: 'Pending',
    href: '/project-management/site-visit/measurements'
  },
  {
    id: 'photo-documentation',
    stepNumber: '2.6',
    title: 'Photo Documentation',
    description: 'Capture site photos for reference',
    icon: Camera,
    status: 'Pending',
    href: '/project-management/site-visit/photos'
  },
  {
    id: 'revise-drawings',
    stepNumber: '2.7',
    title: 'Revise Drawings',
    description: 'Update drawings based on actual measurements',
    icon: PenTool,
    status: 'Pending',
    href: '/project-management/documents/revisions'
  },
  {
    id: 'create-mep',
    stepNumber: '2.8',
    title: 'Create MEP Drawings',
    description: 'Mechanical, Electrical, Plumbing coordination',
    icon: Zap,
    status: 'Pending',
    href: '/project-management/mep'
  },
  {
    id: 'cabinet-marking',
    stepNumber: '2.9',
    title: 'Cabinet Marking at Site',
    description: 'Physical marking with photo evidence',
    icon: MapPin,
    status: 'Pending',
    href: '/project-management/cabinet-marking'
  },
  {
    id: 'calculate-timeline',
    stepNumber: '2.10',
    title: 'Calculate Timeline',
    description: 'Project duration estimation',
    icon: Clock,
    status: 'Pending',
    href: '/project-management/timeline'
  },
  {
    id: 'assign-supervisor',
    stepNumber: '2.11',
    title: 'Assign Supervisor',
    description: 'Project supervisor allocation',
    icon: UserPlus,
    status: 'Pending',
    href: '/project-management/team/assign'
  }
];

// Map a live task progress/status to the page's step status vocabulary.
function toStepStatus(progress: number, status: string): WorkflowStep['status'] {
  const s = (status || '').toLowerCase();
  if (progress >= 100 || s.includes('complete')) return 'Completed';
  if (s.includes('skip')) return 'Skipped';
  if (progress > 0 || s.includes('progress')) return 'In Progress';
  return 'Pending';
}

export default function Phase2Dashboard() {
  const router = useRouter();
  const [liveTasks, setLiveTasks] = useState<Array<{ name: string; progress: number; status: string }>>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const rows = await projectManagementService.getPmPhases();
        const phases = toPhases(rows);
        // Find the Design & Site Assessment phase (phase 2 of the workflow).
        const phase2 =
          phases.find((p) => /design|site|assessment/i.test(p.name)) || phases[1] || phases[0];
        if (active && phase2) {
          setLiveTasks(
            phase2.tasks.map((t) => ({ name: t.name, progress: t.progress, status: t.status })),
          );
        }
      } catch {
        if (active) setLiveTasks([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Overlay live task status onto the fixed step scaffold by fuzzy name match.
  const workflowSteps = useMemo<WorkflowStep[]>(() => {
    if (!liveTasks.length) return baseWorkflowSteps;
    return baseWorkflowSteps.map((step) => {
      const match = liveTasks.find((t) => {
        const a = t.name.toLowerCase();
        const b = step.title.toLowerCase();
        return a.includes(b) || b.includes(a) || a.split(' ')[0] === b.split(' ')[0];
      });
      return match ? { ...step, status: toStepStatus(match.progress, match.status) } : step;
    });
  }, [liveTasks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'In Progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Pending': return 'text-gray-500 bg-gray-50 border-gray-200';
      case 'Skipped': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="w-full py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Phase 2: Design & Site Assessment</h1>
          <p className="text-gray-600 mt-2">Execute and track all steps in the design verification and site assessment phase.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">View Phase 1</Button>
          <Button>Start Phase 3</Button>
        </div>
      </div>

      {/* Workflow Visualization */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 hidden lg:block z-0"></div>
        <div className="flex overflow-x-auto pb-8 gap-2 relative z-10 no-scrollbar">
          {workflowSteps.slice(0, 6).map((step, index) => (
            <div key={step.id} className="flex-shrink-0 w-48 flex flex-col items-center group cursor-pointer" onClick={() => router.push(step.href)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-3 transition-colors ${step.status === 'Completed' ? 'bg-green-600 border-green-600 text-white' :
                  step.status === 'In Progress' ? 'bg-blue-600 border-blue-600 text-white' :
                    'bg-white border-gray-300 text-gray-400 group-hover:border-blue-400'
                }`}>
                <step.icon className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-blue-600 mb-1">STEP {step.stepNumber}</p>
                <p className="text-sm font-medium text-gray-900 line-clamp-2">{step.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {workflowSteps.map((step) => (
          <Card key={step.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(step.href)}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-blue-600 mb-1">STEP {step.stepNumber}</p>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </div>
                <div className={`p-2 rounded-full ${step.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  <step.icon className="w-5 h-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-gray-600 min-h-[40px]">
                {step.description}
              </CardDescription>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between items-center">
              <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(step.status)}`}>
                {step.status}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
            </CardFooter>
          </Card>
        ))}

        {/* Decision Point Card */}
        <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/50 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/project-management/site-readiness')}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-yellow-600 mb-1">DECISION POINT</p>
                <CardTitle className="text-lg">Site Readiness Check</CardTitle>
              </div>
              <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm text-gray-600">
              If not ready → Materials to godown storage. Verify site conditions before proceeding to production.
            </CardDescription>
          </CardContent>
          <CardFooter className="pt-0 flex justify-between items-center">
            <span className="text-xs px-2 py-1 rounded-full border border-yellow-200 bg-yellow-100 text-yellow-800">
              Pending Decision
            </span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
