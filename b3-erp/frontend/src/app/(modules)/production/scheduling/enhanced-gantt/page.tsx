'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EnhancedGanttChart } from '@/components/production/EnhancedGanttChart';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

export default function EnhancedGanttPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const rows = await ProductionOrphanService.getGanttTasks();
        if (!active) return;
        const arr = Array.isArray(rows) ? rows : [];
        const mappedTasks = arr.map((r: any) => ({
          id: String(r.id ?? ''),
          name: r.name ?? '',
          startDate: r.startDate ?? r.start_date ? new Date(r.startDate ?? r.start_date) : new Date(),
          endDate: r.endDate ?? r.end_date ? new Date(r.endDate ?? r.end_date) : new Date(),
          progress: Number(r.progress ?? 0),
          status: r.status ?? 'not-started',
          priority: r.priority ?? 'medium',
          assignee: r.assignee ?? '',
          group: r.groupId ?? r.group_id ?? '',
          dependencies: Array.isArray(r.dependencies) ? r.dependencies : undefined,
        }));
        const groupMap = new Map<string, string>();
        arr.forEach((r: any) => {
          const gid = r.groupId ?? r.group_id;
          if (gid) groupMap.set(String(gid), r.groupName ?? r.group_name ?? String(gid));
        });
        setTasks(mappedTasks);
        setGroups(Array.from(groupMap.entries()).map(([id, name]) => ({ id, name })));
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load gantt tasks');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enhanced Gantt Chart</h1>
            <p className="text-sm text-gray-600">Drag-and-drop scheduling with dependency visualization</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="px-3 py-2 text-sm text-blue-700 flex-shrink-0">Loading gantt tasks…</div>
      )}
      {error && !loading && (
        <div className="px-3 py-2 text-sm text-red-600 flex-shrink-0">{error}</div>
      )}

      {/* Gantt Chart Component */}
      <div className="flex-1 p-3 overflow-hidden">
        <EnhancedGanttChart
          tasks={tasks as any}
          groups={groups}
          className="h-full"
          onTaskUpdate={(task) => {
            console.log('Task updated:', task);
          }}
          onDependencyCreate={(fromId, toId) => {
            console.log('Dependency added:', fromId, '->', toId);
          }}
        />
      </div>
    </div>
  );
}
