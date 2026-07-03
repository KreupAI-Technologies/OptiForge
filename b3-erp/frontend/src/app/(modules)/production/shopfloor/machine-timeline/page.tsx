'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MachineTimeline, Machine, MachineEvent } from '@/components/production/MachineTimeline';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

export default function MachineTimelinePage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [events, setEvents] = useState<MachineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const rows = await ProductionOrphanService.getMachineTimelines();
        if (!active) return;
        const mappedMachines: Machine[] = [];
        const mappedEvents: MachineEvent[] = [];
        (Array.isArray(rows) ? rows : []).forEach((r: any) => {
          const machineId = String(r.id ?? '');
          mappedMachines.push({
            id: machineId,
            name: r.machineName ?? r.machine_name ?? '',
            code: r.machineCode ?? r.machine_code ?? '',
            type: r.machineType ?? r.machine_type ?? '',
            status: (r.status ?? 'idle') as Machine['status'],
            currentShift: r.currentShift ?? r.current_shift ?? undefined,
            utilization: Number(r.utilization ?? 0),
          });
          const rawEvents = Array.isArray(r.events) ? r.events : [];
          rawEvents.forEach((e: any, idx: number) => {
            mappedEvents.push({
              ...e,
              id: String(e?.id ?? `${machineId}-evt-${idx}`),
              machineId,
              type: e?.type ?? 'production',
              startTime: e?.startTime ? new Date(e.startTime) : new Date(),
              endTime: e?.endTime ? new Date(e.endTime) : new Date(),
            });
          });
        });
        setMachines(mappedMachines);
        setEvents(mappedEvents);
      } catch (err: any) {
        if (active) setError(err?.message || 'Failed to load machine timelines');
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
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
              <h1 className="text-2xl font-bold text-gray-900">Machine Timeline</h1>
              <p className="text-sm text-gray-600">Visual machine utilization and event tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Picker */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Export Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="px-6 py-3 text-sm text-blue-700">Loading machine timelines…</div>
      )}
      {error && !loading && (
        <div className="px-6 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Machine Timeline Component */}
      <div className="p-6">
        <MachineTimeline
          machines={machines}
          events={events}
          date={new Date(selectedDate)}
          onEventClick={(event: MachineEvent) => {
            console.log('Event clicked:', event.machineId, event);
          }}
          onMachineClick={(machine: Machine) => {
            console.log('Machine clicked:', machine.id);
          }}
        />
      </div>
    </div>
  );
}
