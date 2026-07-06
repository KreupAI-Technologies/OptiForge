'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { WorkflowBuilder } from '@/components/crm';
import { WorkflowTestModal, type WorkflowTest } from '@/components/modals';
import { ArrowLeft } from 'lucide-react';
import { crmService, asArray } from '@/services/crm.service';

export default function WorkflowAutomationPage() {
  const router = useRouter();
  const [showWorkflowTestModal, setShowWorkflowTestModal] = useState(false);
  const [initialWorkflow, setInitialWorkflow] = useState<any>(undefined);

  // Load an existing saved workflow (if any) to prefill the builder.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await crmService.approvalWorkflows.getAll();
        const rows = asArray<any>(res);
        if (mounted && rows.length) {
          const w = rows[0];
          setInitialWorkflow({
            id: String(w.id ?? ''),
            name: w.name ?? 'New Workflow',
            description: w.description ?? '',
            trigger: w.trigger ?? { type: 'record_created' },
            conditions: Array.isArray(w.conditions) ? w.conditions : [],
            actions: Array.isArray(w.actions) ? w.actions : [],
            status: w.status ?? 'draft',
            createdAt: w.createdAt ?? new Date().toISOString(),
            lastRun: w.lastRun,
            runCount: w.runCount,
          });
        }
      } catch {
        // keep builder in blank-draft mode on error
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSaveWorkflow = async (workflow: any) => {
    try {
      if (workflow?.id) {
        await crmService.approvalWorkflows.update(workflow.id, workflow);
      } else {
        const created = await crmService.approvalWorkflows.create(workflow);
        if (created?.id) setInitialWorkflow({ ...workflow, id: created.id });
      }
    } catch {
      // swallow — surface via UI toast layer if present
    }
  };

  const handleTestWorkflow = (workflow: { name: string }) => {
    setShowWorkflowTestModal(true);
  };

  const handleSaveWorkflowTest = (test: WorkflowTest) => {
    console.log('Workflow test completed:', test);
    setShowWorkflowTestModal(false);
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">

      <div className="flex-1 px-3 py-2 overflow-auto">
        <button
          onClick={() => router.push('/crm/advanced-features')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Advanced Features
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Workflow Automation Builder</h2>
          <p className="text-gray-600 mb-2">
            Visual workflow builder with triggers, conditions, and actions to automate repetitive tasks
            and ensure consistency.
          </p>
          <WorkflowBuilder
            key={initialWorkflow?.id ?? 'new'}
            workflow={initialWorkflow}
            availableFields={[
              { name: 'status', label: 'Lead Status', type: 'string' },
              { name: 'score', label: 'Lead Score', type: 'number' },
              { name: 'value', label: 'Deal Value', type: 'number' },
              { name: 'source', label: 'Lead Source', type: 'string' },
            ]}
            availableUsers={[
              { id: '1', name: 'Sarah Johnson' },
              { id: '2', name: 'Mike Chen' },
              { id: '3', name: 'David Park' },
            ]}
            onSave={handleSaveWorkflow}
            onTest={handleTestWorkflow}
          />
        </div>
      </div>

      <WorkflowTestModal
        isOpen={showWorkflowTestModal}
        onClose={() => setShowWorkflowTestModal(false)}
        onSave={handleSaveWorkflowTest}
        mode="add"
      />
    </div>
  );
}
