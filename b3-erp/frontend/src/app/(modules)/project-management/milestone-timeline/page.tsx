'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MilestoneTimeline } from '@/components/project-management/MilestoneTimeline';
import { projectManagementService } from '@/services/ProjectManagementService';

const STATUS_MAP: Record<string, 'completed' | 'on-track' | 'at-risk' | 'delayed' | 'upcoming'> = {
 completed: 'completed', done: 'completed', 'in-progress': 'on-track', 'in_progress': 'on-track',
 'on-track': 'on-track', 'at-risk': 'at-risk', delayed: 'delayed', overdue: 'delayed',
 upcoming: 'upcoming', pending: 'upcoming', planned: 'upcoming',
};

const STATUS_BADGE: Record<string, string> = {
 completed: 'bg-green-100 text-green-800',
 'on-track': 'bg-blue-100 text-blue-800',
 'at-risk': 'bg-yellow-100 text-yellow-800',
 delayed: 'bg-red-100 text-red-800',
 upcoming: 'bg-gray-100 text-gray-800',
};

type MilestoneType = 'major' | 'minor' | 'phase-gate' | 'delivery' | 'review';
const MILESTONE_TYPES: MilestoneType[] = ['major', 'minor', 'phase-gate', 'delivery', 'review'];

interface MilestoneRow {
 id: string;
 name: string;
 description: string;
 date: Date;
 status: 'completed' | 'on-track' | 'at-risk' | 'delayed' | 'upcoming';
 type: MilestoneType;
 phase?: string;
 owner?: string;
 percentComplete?: number;
}

export default function MilestoneTimelinePage() {
 const router = useRouter();
 const [variant, setVariant] = useState<'horizontal' | 'vertical'>('horizontal');
 const [milestones, setMilestones] = useState<MilestoneRow[] | undefined>(undefined);
 const [selectedMilestone, setSelectedMilestone] = useState<MilestoneRow | null>(null);

 useEffect(() => {
  projectManagementService.listAllMilestones()
   .then((rows) => {
    const list = Array.isArray(rows) ? rows : [];
    if (list.length === 0) { setMilestones(undefined); return; }
    setMilestones(list.map((m: any, idx: number): MilestoneRow => ({
     id: String(m.id ?? m.milestoneId ?? idx),
     name: m.name ?? m.title ?? m.milestoneName ?? 'Milestone',
     description: m.description ?? '',
     date: m.dueDate ? new Date(m.dueDate) : (m.targetDate ? new Date(m.targetDate) : new Date()),
     status: STATUS_MAP[String(m.status ?? '').toLowerCase()] ?? 'upcoming',
     type: MILESTONE_TYPES.includes(m.type) ? m.type : 'major',
     phase: m.phase,
     owner: m.owner ?? m.assignedTo,
     percentComplete: m.percentComplete ?? m.progress,
    })));
   })
   .catch(() => setMilestones(undefined));
 }, []);

 return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
   {/* Header */}
   <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2">
    <div className="flex items-center justify-between flex-wrap gap-2">
     <div className="flex items-center gap-2">
      <button
       onClick={() => router.back()}
       className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
       <ArrowLeft className="h-5 w-5" />
       <span>Back</span>
      </button>
      <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
      <div>
       <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Milestone Timeline</h1>
       <p className="text-sm text-gray-600 dark:text-gray-400">Visual milestone tracking and progress</p>
      </div>
     </div>

     {/* View Toggle */}
     <div className="flex items-center gap-2">
      <button
       onClick={() => setVariant('horizontal')}
       className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
        variant === 'horizontal'
         ? 'bg-blue-600 text-white'
         : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
       }`}
      >
       Horizontal
      </button>
      <button
       onClick={() => setVariant('vertical')}
       className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
        variant === 'vertical'
         ? 'bg-blue-600 text-white'
         : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
       }`}
      >
       Vertical
      </button>
     </div>
    </div>
   </div>

   {/* Milestone Timeline Component */}
   <div className="p-6">
    <MilestoneTimeline
     milestones={milestones}
     variant={variant}
     showPhases={true}
     highlightUpcoming={true}
     onMilestoneClick={(milestoneId) => {
      const found = (milestones ?? []).find((m) => m.id === milestoneId) ?? null;
      setSelectedMilestone(found);
     }}
    />
   </div>

   {/* Milestone Detail Modal */}
   {selectedMilestone && (
    <div
     className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
     onClick={() => setSelectedMilestone(null)}
    >
     <div
      className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-xl"
      onClick={(e) => e.stopPropagation()}
     >
      <div className="flex items-start justify-between border-b border-gray-200 dark:border-gray-700 px-5 py-4">
       <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedMilestone.name}</h2>
        <span
         className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[selectedMilestone.status] ?? STATUS_BADGE.upcoming}`}
        >
         {selectedMilestone.status.replace('-', ' ')}
        </span>
       </div>
       <button
        onClick={() => setSelectedMilestone(null)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        aria-label="Close"
       >
        <X className="h-5 w-5" />
       </button>
      </div>
      <div className="space-y-3 px-5 py-4 text-sm">
       <div className="flex justify-between">
        <span className="text-gray-500 dark:text-gray-400">Target Date</span>
        <span className="font-medium text-gray-900 dark:text-white">
         {selectedMilestone.date.toLocaleDateString()}
        </span>
       </div>
       {selectedMilestone.phase && (
        <div className="flex justify-between">
         <span className="text-gray-500 dark:text-gray-400">Phase</span>
         <span className="font-medium text-gray-900 dark:text-white">{selectedMilestone.phase}</span>
        </div>
       )}
       {selectedMilestone.owner && (
        <div className="flex justify-between">
         <span className="text-gray-500 dark:text-gray-400">Owner</span>
         <span className="font-medium text-gray-900 dark:text-white">{selectedMilestone.owner}</span>
        </div>
       )}
       {typeof selectedMilestone.percentComplete === 'number' && (
        <div className="flex justify-between">
         <span className="text-gray-500 dark:text-gray-400">Progress</span>
         <span className="font-medium text-gray-900 dark:text-white">{selectedMilestone.percentComplete}%</span>
        </div>
       )}
       {selectedMilestone.description && (
        <div>
         <p className="text-gray-500 dark:text-gray-400 mb-1">Description</p>
         <p className="text-gray-900 dark:text-white">{selectedMilestone.description}</p>
        </div>
       )}
      </div>
     </div>
    </div>
   )}
  </div>
 );
}
