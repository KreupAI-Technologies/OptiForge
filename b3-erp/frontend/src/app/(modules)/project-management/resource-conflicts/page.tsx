'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { ResourceConflictAlerts } from '@/components/project-management/ResourceConflictAlerts';
import { projectManagementService } from '@/services/ProjectManagementService';
import { toConflicts, type ConflictShape } from '@/components/project-management/pm-wiring-transforms';

export default function ResourceConflictsPage() {
 const router = useRouter();
 const [conflicts, setConflicts] = useState<ConflictShape[]>([]);
 const [loaded, setLoaded] = useState(false);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 const refreshConflicts = async () => {
  try {
   setError(null);
   const rows = await projectManagementService.getPmResourceAllocationsSafe();
   setConflicts(toConflicts(rows));
   setLoaded(true);
  } catch (e) {
   setError('Failed to load resource allocations.');
  }
 };

 useEffect(() => {
  let active = true;
  (async () => {
   try {
    setLoading(true);
    setError(null);
    const rows = await projectManagementService.getPmResourceAllocationsSafe();
    if (active) {
     setConflicts(toConflicts(rows));
     setLoaded(true);
    }
   } catch (e) {
    if (active) setError('Failed to load resource allocations.');
   } finally {
    if (active) setLoading(false);
   }
  })();
  return () => {
   active = false;
  };
 }, []);

 const handleResolveConflict = async (conflictId: string, resolution: string) => {
  try {
   await projectManagementService.updateResourceAllocation(conflictId, {
    status: 'resolved',
    resolutionNote: resolution,
   } as any);
   await refreshConflicts();
  } catch (e) {
   setError('Failed to resolve conflict.');
  }
 };

 const handleAcknowledge = async (conflictId: string) => {
  try {
   await projectManagementService.updateResourceAllocation(conflictId, {
    status: 'acknowledged',
   } as any);
   await refreshConflicts();
  } catch (e) {
   setError('Failed to acknowledge conflict.');
  }
 };

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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resource Conflict Alerts</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">Monitor and resolve over-allocated resources</p>
     </div>
    </div>
   </div>

   {/* Resource Conflicts Component */}
   <div className="p-6">
    {loading ? (
     <div className="flex items-center justify-center py-24 text-gray-500 dark:text-gray-400">
      <Loader2 className="h-6 w-6 animate-spin mr-2" />
      Loading resource conflicts…
     </div>
    ) : error ? (
     <div className="flex items-center justify-center py-24 text-red-600">
      <AlertCircle className="h-6 w-6 mr-2" />
      {error}
     </div>
    ) : loaded && conflicts.length === 0 ? (
     <div className="flex flex-col items-center justify-center py-24 text-gray-500 dark:text-gray-400">
      <CheckCircle className="h-10 w-10 mb-3 text-green-500" />
      <p className="text-lg font-medium text-gray-900 dark:text-white">No resource conflicts</p>
      <p className="text-sm">All resources are within their capacity.</p>
     </div>
    ) : (
     <ResourceConflictAlerts
      conflicts={conflicts as any}
      filterSeverity="all"
      onConflictClick={(conflictId) => console.log('Conflict clicked:', conflictId)}
      onResolveConflict={handleResolveConflict}
      onAcknowledge={handleAcknowledge}
     />
    )}
   </div>
  </div>
 );
}
