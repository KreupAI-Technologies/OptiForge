'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MilestoneTimeline } from '@/components/project-management/MilestoneTimeline';
import { projectManagementService } from '@/services/ProjectManagementService';

const STATUS_MAP: Record<string, 'completed' | 'on-track' | 'at-risk' | 'delayed' | 'upcoming'> = {
 completed: 'completed', done: 'completed', 'in-progress': 'on-track', 'in_progress': 'on-track',
 'on-track': 'on-track', 'at-risk': 'at-risk', delayed: 'delayed', overdue: 'delayed',
 upcoming: 'upcoming', pending: 'upcoming', planned: 'upcoming',
};

export default function MilestoneTimelinePage() {
 const router = useRouter();
 const [variant, setVariant] = useState<'horizontal' | 'vertical'>('horizontal');
 const [milestones, setMilestones] = useState<any[] | undefined>(undefined);

 useEffect(() => {
  projectManagementService.listAllMilestones()
   .then((rows) => {
    const list = Array.isArray(rows) ? rows : [];
    if (list.length === 0) { setMilestones(undefined); return; }
    setMilestones(list.map((m: any, idx: number) => ({
     id: String(m.id ?? m.milestoneId ?? idx),
     name: m.name ?? m.title ?? m.milestoneName ?? 'Milestone',
     description: m.description ?? '',
     date: m.dueDate ? new Date(m.dueDate) : (m.targetDate ? new Date(m.targetDate) : new Date()),
     status: STATUS_MAP[String(m.status ?? '').toLowerCase()] ?? 'upcoming',
     type: (m.type ?? 'major') as any,
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
     onMilestoneClick={(milestoneId) => console.log('Milestone clicked:', milestoneId)}
    />
   </div>
  </div>
 );
}
