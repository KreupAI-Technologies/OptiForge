'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkflowQuickActions } from '@/components/project-management/WorkflowQuickActions';
import { PhaseProgressVisualization } from '@/components/project-management/PhaseProgressVisualization';
import { projectManagementService } from '@/services/ProjectManagementService';
import { toPhases, deriveCurrentPhase, type PhaseShape } from '@/components/project-management/pm-wiring-transforms';

export default function WorkflowPage() {
 const [phases, setPhases] = useState<PhaseShape[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  let active = true;
  (async () => {
   try {
    setLoading(true);
    const rows = await projectManagementService.getPmPhases();
    if (active) setPhases(toPhases(rows));
   } catch {
    if (active) setPhases([]);
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
  <div className="w-full py-2 space-y-3">
   {/* Header */}
   <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
     <Link href="/project-management">
      <Button variant="ghost" className="p-0 hover:bg-transparent">
       <ArrowLeft className="w-6 h-6 text-gray-600" />
      </Button>
     </Link>
     <div>
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
       Manufacturing Workflow
       <span className="inline-flex items-center gap-1 text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-normal">
        <Sparkles className="w-4 h-4" />
        Enhanced Forms
       </span>
      </h1>
      <p className="text-sm text-gray-500">
       Access all 8 phases of the manufacturing workflow with enhanced FormUX features
      </p>
     </div>
    </div>
   </div>

   {/* Phase Progress Overview */}
   {loading ? (
    <div className="flex items-center justify-center py-16 text-gray-500">
     <Loader2 className="h-6 w-6 animate-spin mr-2" />
     Loading workflow phases…
    </div>
   ) : (
    <PhaseProgressVisualization
     variant="horizontal"
     showDetails={true}
     phases={hasData ? (phases as any) : undefined}
     currentPhase={hasData ? currentPhase : undefined}
    />
   )}

   {/* Quick Actions - Grid View */}
   <WorkflowQuickActions variant="grid" />

   {/* Quick Actions - List View */}
   <WorkflowQuickActions variant="list" />

   {/* Features Info */}
   <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-3">
    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
     <Sparkles className="w-5 h-5 text-yellow-500" />
     Enhanced Form Features
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
     <div className="bg-white rounded-lg p-3 border border-gray-200">
      <h4 className="font-medium text-gray-900 mb-2">Multi-Step Wizard</h4>
      <p className="text-sm text-gray-600">
       Break complex forms into manageable steps with visual progress indicators
      </p>
     </div>
     <div className="bg-white rounded-lg p-3 border border-gray-200">
      <h4 className="font-medium text-gray-900 mb-2">Auto-Save Draft</h4>
      <p className="text-sm text-gray-600">
       Automatically saves your progress every 2 seconds to prevent data loss
      </p>
     </div>
     <div className="bg-white rounded-lg p-3 border border-gray-200">
      <h4 className="font-medium text-gray-900 mb-2">Draft Recovery</h4>
      <p className="text-sm text-gray-600">
       Resume your work from where you left off with the draft recovery banner
      </p>
     </div>
     <div className="bg-white rounded-lg p-3 border border-gray-200">
      <h4 className="font-medium text-gray-900 mb-2">Field-Level Help</h4>
      <p className="text-sm text-gray-600">
       Contextual tooltips explain complex fields to guide users
      </p>
     </div>
    </div>
   </div>
  </div>
 );
}
