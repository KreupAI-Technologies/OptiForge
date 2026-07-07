'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { CriticalPathHighlight } from '@/components/project-management/CriticalPathHighlight';
import { projectManagementService } from '@/services/ProjectManagementService';
import { toCriticalPathTasks, type CriticalPathTask } from '@/components/project-management/pm-wiring-transforms';

export default function CriticalPathPage() {
 const router = useRouter();
 const [tasks, setTasks] = useState<CriticalPathTask[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  let active = true;
  (async () => {
   try {
    setLoading(true);
    setError(null);
    const rows = await projectManagementService.getPmScheduleTasks();
    if (active) setTasks(toCriticalPathTasks(rows));
   } catch (e) {
    if (active) setError('Failed to load schedule tasks.');
   } finally {
    if (active) setLoading(false);
   }
  })();
  return () => {
   active = false;
  };
 }, []);

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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Critical Path Analysis</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">Identify and highlight critical tasks that determine project duration</p>
     </div>
    </div>
   </div>

   {/* Critical Path Component */}
   <div className="p-6">
    {loading ? (
     <div className="flex items-center justify-center py-24 text-gray-500 dark:text-gray-400">
      <Loader2 className="h-6 w-6 animate-spin mr-2" />
      Loading critical path…
     </div>
    ) : error ? (
     <div className="flex items-center justify-center py-24 text-red-600">
      <AlertCircle className="h-6 w-6 mr-2" />
      {error}
     </div>
    ) : (
     <CriticalPathHighlight
      tasks={tasks.length > 0 ? (tasks as any) : undefined}
      showGantt={true}
      highlightMode="critical"
      onTaskClick={(taskId) => console.log('Task clicked:', taskId)}
     />
    )}
   </div>
  </div>
 );
}
