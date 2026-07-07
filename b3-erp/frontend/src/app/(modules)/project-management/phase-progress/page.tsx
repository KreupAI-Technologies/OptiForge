'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { PhaseProgressVisualization } from '@/components/project-management/PhaseProgressVisualization';
import { projectManagementService } from '@/services/ProjectManagementService';
import { toPhases, deriveCurrentPhase, type PhaseShape } from '@/components/project-management/pm-wiring-transforms';

export default function PhaseProgressPage() {
 const router = useRouter();
 const [phases, setPhases] = useState<PhaseShape[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

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
       onPhaseClick={(phaseId) => console.log('Phase clicked:', phaseId)}
       onTaskClick={(phaseId, taskId) => console.log('Task clicked:', phaseId, taskId)}
      />

      {/* Compact View for Quick Reference */}
      <div className="mt-6">
       <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick View</h3>
       <PhaseProgressVisualization
        variant="compact"
        phases={hasData ? (phases as any) : undefined}
        currentPhase={hasData ? currentPhase : undefined}
        onPhaseClick={(phaseId) => console.log('Phase clicked:', phaseId)}
       />
      </div>
     </>
    )}
   </div>
  </div>
 );
}
