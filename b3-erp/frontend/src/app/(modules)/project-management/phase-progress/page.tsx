'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, X } from 'lucide-react';
import { PhaseProgressVisualization } from '@/components/project-management/PhaseProgressVisualization';
import { projectManagementService } from '@/services/ProjectManagementService';
import { toPhases, deriveCurrentPhase, type PhaseShape, type PhaseTaskShape } from '@/components/project-management/pm-wiring-transforms';

const STATUS_BADGE: Record<string, string> = {
 completed: 'bg-green-100 text-green-800',
 'in-progress': 'bg-blue-100 text-blue-800',
 blocked: 'bg-red-100 text-red-800',
 pending: 'bg-gray-100 text-gray-800',
};

export default function PhaseProgressPage() {
 const router = useRouter();
 const [phases, setPhases] = useState<PhaseShape[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [selectedPhase, setSelectedPhase] = useState<PhaseShape | null>(null);
 const [selectedTask, setSelectedTask] = useState<PhaseTaskShape | null>(null);

 const openPhase = (phaseId: string) => {
  const found = phases.find((p) => p.id === phaseId) ?? null;
  setSelectedTask(null);
  setSelectedPhase(found);
 };

 const openTask = (phaseId: string, taskId: string) => {
  const phase = phases.find((p) => p.id === phaseId);
  const task = phase?.tasks.find((t) => t.id === taskId) ?? null;
  setSelectedPhase(null);
  setSelectedTask(task);
 };

 useEffect(() => {
  let active = true;
  (async () => {
   try {
    setLoading(true);
    setError(null);
    const rows = await projectManagementService.getPmPhases();
    if (active) setPhases(toPhases(rows));
   } catch (e) {
    if (active) setError('Failed to load phase progress.');
   } finally {
    if (active) setLoading(false);
   }
  })();
  return () => {
   active = false;
  };
 }, []);

 const hasData = phases.length > 0;
 const currentPhase = deriveCurrentPhase(phases);

 return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
   {/* Header */}
   <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2">
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Phase Progress</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">Visual progress through 8 manufacturing phases</p>
     </div>
    </div>
   </div>

   {/* Phase Progress Component */}
   <div className="p-6 space-y-3">
    {loading ? (
     <div className="flex items-center justify-center py-24 text-gray-500 dark:text-gray-400">
      <Loader2 className="h-6 w-6 animate-spin mr-2" />
      Loading phase progress…
     </div>
    ) : error ? (
     <div className="flex items-center justify-center py-24 text-red-600">
      <AlertCircle className="h-6 w-6 mr-2" />
      {error}
     </div>
    ) : (
     <>
      {/* Horizontal View */}
      <PhaseProgressVisualization
       variant="horizontal"
       showDetails={true}
       phases={hasData ? (phases as any) : undefined}
       currentPhase={hasData ? currentPhase : undefined}
       onPhaseClick={openPhase}
       onTaskClick={openTask}
      />

      {/* Compact View for Quick Reference */}
      <div className="mt-6">
       <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick View</h3>
       <PhaseProgressVisualization
        variant="compact"
        phases={hasData ? (phases as any) : undefined}
        currentPhase={hasData ? currentPhase : undefined}
        onPhaseClick={openPhase}
       />
      </div>
     </>
    )}
   </div>

   {/* Phase Detail Modal */}
   {selectedPhase && (
    <div
     className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
     onClick={() => setSelectedPhase(null)}
    >
     <div
      className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-xl"
      onClick={(e) => e.stopPropagation()}
     >
      <div className="flex items-start justify-between border-b border-gray-200 dark:border-gray-700 px-5 py-4">
       <div>
        <p className="text-xs font-medium text-gray-400">Phase {selectedPhase.number}</p>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedPhase.name}</h2>
        <span
         className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[selectedPhase.status] ?? STATUS_BADGE.pending}`}
        >
         {selectedPhase.status.replace('-', ' ')}
        </span>
       </div>
       <button
        onClick={() => setSelectedPhase(null)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        aria-label="Close"
       >
        <X className="h-5 w-5" />
       </button>
      </div>
      <div className="space-y-3 px-5 py-4 text-sm">
       <div className="flex justify-between">
        <span className="text-gray-500 dark:text-gray-400">Progress</span>
        <span className="font-medium text-gray-900 dark:text-white">{selectedPhase.progress}%</span>
       </div>
       {selectedPhase.startDate && (
        <div className="flex justify-between">
         <span className="text-gray-500 dark:text-gray-400">Start Date</span>
         <span className="font-medium text-gray-900 dark:text-white">{selectedPhase.startDate.toLocaleDateString()}</span>
        </div>
       )}
       {selectedPhase.endDate && (
        <div className="flex justify-between">
         <span className="text-gray-500 dark:text-gray-400">End Date</span>
         <span className="font-medium text-gray-900 dark:text-white">{selectedPhase.endDate.toLocaleDateString()}</span>
        </div>
       )}
       <div className="flex justify-between">
        <span className="text-gray-500 dark:text-gray-400">Tasks</span>
        <span className="font-medium text-gray-900 dark:text-white">{selectedPhase.tasks.length}</span>
       </div>
       {selectedPhase.description && (
        <div>
         <p className="text-gray-500 dark:text-gray-400 mb-1">Description</p>
         <p className="text-gray-900 dark:text-white">{selectedPhase.description}</p>
        </div>
       )}
      </div>
     </div>
    </div>
   )}

   {/* Task Detail Modal */}
   {selectedTask && (
    <div
     className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
     onClick={() => setSelectedTask(null)}
    >
     <div
      className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-xl"
      onClick={(e) => e.stopPropagation()}
     >
      <div className="flex items-start justify-between border-b border-gray-200 dark:border-gray-700 px-5 py-4">
       <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedTask.name}</h2>
        <span
         className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[selectedTask.status] ?? STATUS_BADGE.pending}`}
        >
         {selectedTask.status.replace('-', ' ')}
        </span>
       </div>
       <button
        onClick={() => setSelectedTask(null)}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        aria-label="Close"
       >
        <X className="h-5 w-5" />
       </button>
      </div>
      <div className="space-y-3 px-5 py-4 text-sm">
       <div className="flex justify-between">
        <span className="text-gray-500 dark:text-gray-400">Progress</span>
        <span className="font-medium text-gray-900 dark:text-white">{selectedTask.progress}%</span>
       </div>
       <div className="flex justify-between">
        <span className="text-gray-500 dark:text-gray-400">Assignee</span>
        <span className="font-medium text-gray-900 dark:text-white">{selectedTask.assignee ?? 'Unassigned'}</span>
       </div>
      </div>
     </div>
    </div>
   )}
  </div>
 );
}
