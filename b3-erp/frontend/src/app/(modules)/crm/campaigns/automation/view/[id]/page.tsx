'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Workflow, GitBranch, Users, CheckCircle, Target, AlertCircle } from 'lucide-react';
import { crmService } from '@/services/crm.service';

interface Automation {
  id: string;
  name: string;
  description: string;
  status: string;
  trigger: string;
  triggerType: string;
  steps: number;
  activeContacts: number;
  completedContacts: number;
  conversionRate: number;
  avgCompletionTime: string;
  createdDate: string;
  lastTriggered?: string;
  owner: string;
}

export default function AutomationViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [automation, setAutomation] = useState<Automation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const r = (await crmService.campaignAutomations.getById(params.id)) as any;
        if (cancelled) return;
        if (!r || !r.id) {
          setAutomation(null);
          return;
        }
        setAutomation({
          id: String(r.id),
          name: r.name ?? '',
          description: r.description ?? '',
          status: r.status ?? 'draft',
          trigger: r.trigger ?? '',
          triggerType: r.triggerType ?? 'manual',
          steps: Number(r.steps ?? 0),
          activeContacts: Number(r.activeContacts ?? 0),
          completedContacts: Number(r.completedContacts ?? 0),
          conversionRate: Number(r.conversionRate ?? 0),
          avgCompletionTime: r.avgCompletionTime ?? '',
          createdDate: r.createdDate ?? (r.createdAt ? String(r.createdAt).slice(0, 10) : ''),
          lastTriggered: r.lastTriggered ?? undefined,
          owner: r.owner ?? '',
        });
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load automation');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="w-full h-full px-3 py-2 space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/crm/campaigns/automation')}
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Automations</span>
        </button>
        {automation && (
          <button
            onClick={() => router.push(`/crm/campaigns/automation/edit/${automation.id}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Automation</span>
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading automation…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {!isLoading && !loadError && !automation && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Automation not found.
        </div>
      )}

      {automation && (
        <>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Workflow className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{automation.name}</h1>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(automation.status)}`}>
                    {automation.status}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{automation.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm border-t border-gray-200 pt-4">
              <div>
                <p className="text-xs text-gray-500 flex items-center gap-1"><GitBranch className="w-3 h-3" /> Trigger</p>
                <p className="font-medium text-gray-900">{automation.trigger || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Trigger Type</p>
                <p className="font-medium text-gray-900">{automation.triggerType.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Steps</p>
                <p className="font-medium text-gray-900">{automation.steps}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Owner</p>
                <p className="font-medium text-gray-900">{automation.owner || '—'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
              <Users className="w-8 h-8 opacity-80 mb-2" />
              <div className="text-3xl font-bold mb-1">{automation.activeContacts.toLocaleString()}</div>
              <div className="text-purple-100">In Progress</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
              <CheckCircle className="w-8 h-8 opacity-80 mb-2" />
              <div className="text-3xl font-bold mb-1">{automation.completedContacts.toLocaleString()}</div>
              <div className="text-green-100">Completed</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white">
              <Target className="w-8 h-8 opacity-80 mb-2" />
              <div className="text-3xl font-bold mb-1">{automation.conversionRate.toFixed(1)}%</div>
              <div className="text-orange-100">Conversion Rate</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
              <Workflow className="w-8 h-8 opacity-80 mb-2" />
              <div className="text-3xl font-bold mb-1">{automation.avgCompletionTime || '—'}</div>
              <div className="text-blue-100">Avg Completion Time</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 text-sm text-gray-600 flex items-center gap-4">
            <span>Created: <strong className="text-gray-900">{automation.createdDate ? new Date(automation.createdDate).toLocaleDateString() : '—'}</strong></span>
            <span>•</span>
            <span>Last Triggered: <strong className="text-gray-900">{automation.lastTriggered ? new Date(automation.lastTriggered).toLocaleDateString() : 'Never'}</strong></span>
          </div>
        </>
      )}
    </div>
  );
}
