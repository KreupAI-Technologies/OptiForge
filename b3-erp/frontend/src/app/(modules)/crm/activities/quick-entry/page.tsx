'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { ActivityQuickEntry } from '@/components/crm/ActivityQuickEntry';
import { crmService } from '@/services/crm.service';

export default function ActivityQuickEntryPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (activity: {
    type: string;
    contact: { id: string; name: string; company: string; email: string; phone: string };
    subject: string;
    notes: string;
    outcome?: string;
    duration?: number;
    scheduledDate?: Date;
  }) => {
    setSubmitError(null);
    try {
      const payload: any = {
        companyId: 'default-company-id',
        type: activity.type,
        subject: activity.subject || activity.notes?.slice(0, 80) || `${activity.type} activity`,
        description: activity.notes || undefined,
        contactId: activity.contact?.id || undefined,
        contactName: activity.contact?.name || undefined,
        customerName: activity.contact?.company || undefined,
        outcome: activity.outcome || undefined,
        duration: activity.duration ?? undefined,
        scheduledDate: activity.scheduledDate ? activity.scheduledDate.toISOString() : undefined,
        startDate: activity.scheduledDate ? activity.scheduledDate.toISOString() : undefined,
      };
      await crmService.activities.create(payload);
      router.push('/crm/activities');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save activity. Please try again.');
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Quick Entry</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">One-click logging for calls, emails, meetings, and tasks</p>
          </div>
        </div>
      </div>

      {/* Activity Quick Entry Component */}
      <div className="p-6">
        {submitError && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" />
            {submitError}
          </div>
        )}
        <ActivityQuickEntry onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
