'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { POApprovalWorkflowUI } from '@/components/procurement/POApprovalWorkflowUI';
import { purchaseOrderService } from '@/services/purchase-order.service';
import { procurementPagesService } from '@/services/procurement-pages.service';

export default function POApprovalWorkflowPage() {
  const router = useRouter();
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">PO Approval Workflow</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Visual approval chain with multi-level authorization tracking</p>
          </div>
        </div>
      </div>

      {/* PO Approval Workflow Component */}
      <div className="p-6">
        {actionError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError}
          </div>
        )}
        {actionMessage && (
          <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {actionMessage}
          </div>
        )}
        <POApprovalWorkflowUI
          onApprove={async (poId) => {
            setActionError(null);
            setActionMessage(null);
            try {
              await purchaseOrderService.approvePurchaseOrder(poId);
              setActionMessage('Purchase order approved.');
            } catch (err) {
              setActionError(err instanceof Error ? err.message : 'Failed to approve purchase order.');
            }
          }}
          onReject={async (poId, _stepId, reason) => {
            setActionError(null);
            setActionMessage(null);
            try {
              await purchaseOrderService.rejectPurchaseOrder(poId, reason);
              setActionMessage('Purchase order rejected.');
            } catch (err) {
              setActionError(err instanceof Error ? err.message : 'Failed to reject purchase order.');
            }
          }}
          onDelegate={async (poId, _stepId, delegateToId) => {
            setActionError(null);
            setActionMessage(null);
            if (!delegateToId) {
              setActionError('A delegate must be specified.');
              return;
            }
            try {
              await procurementPagesService.delegatePurchaseOrder(poId, { delegatedTo: delegateToId });
              setActionMessage(`Approval delegated to ${delegateToId}.`);
            } catch (err) {
              setActionError(err instanceof Error ? err.message : 'Failed to delegate approval.');
            }
          }}
          onRequestInfo={async (poId, message) => {
            setActionError(null);
            setActionMessage(null);
            if (!message) {
              setActionError('An information-request message is required.');
              return;
            }
            try {
              await procurementPagesService.requestInfoPurchaseOrder(poId, { message });
              setActionMessage('Information request sent.');
            } catch (err) {
              setActionError(err instanceof Error ? err.message : 'Failed to request information.');
            }
          }}
        />
      </div>
    </div>
  );
}
