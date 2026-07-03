'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { AndonBoard, ProductionLine } from '@/components/production/AndonBoard';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

export default function AndonBoardPage() {
  const router = useRouter();
  const [lines, setLines] = useState<ProductionLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const rows = await ProductionOrphanService.getAndonLines();
        if (!active) return;
        const mapped: ProductionLine[] = (Array.isArray(rows) ? rows : []).map((r: any) => ({
          id: String(r.id ?? ''),
          name: r.lineName ?? r.line_name ?? '',
          status: (r.status ?? 'idle') as ProductionLine['status'],
          currentProduct: r.currentProduct ?? r.current_product ?? undefined,
          workOrderNumber: r.workOrderNumber ?? r.work_order_number ?? undefined,
          target: Number(r.target ?? 0),
          actual: Number(r.actual ?? 0),
          oee: Number(r.oee ?? 0),
          cycleTime: Number(r.cycleTime ?? r.cycle_time ?? 0),
          operator: r.operator ?? undefined,
          shift: r.shift ?? undefined,
          alerts: Array.isArray(r.alerts)
            ? r.alerts.map((a: any) => ({
                ...a,
                timestamp: a?.timestamp ? new Date(a.timestamp) : new Date(),
              }))
            : undefined,
          lastUpdate: r.updatedAt ? new Date(r.updatedAt) : new Date(),
        }));
        setLines(mapped);
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load andon lines');
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
    <div className="min-h-screen bg-gray-900">
      {/* Minimal Header - Andon typically runs fullscreen */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 print:hidden">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Exit Andon</span>
          </button>
          <p className="text-sm text-gray-400">Press F11 for fullscreen mode</p>
        </div>
      </div>

      {loading && (
        <div className="px-4 py-3 text-sm text-gray-300">Loading andon lines…</div>
      )}
      {error && !loading && (
        <div className="px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {/* Andon Board Component */}
      <AndonBoard
        lines={lines}
        refreshInterval={10000}
        onAlertAcknowledge={(alertId: string, lineId: string) => {
          console.log('Alert acknowledged:', alertId, lineId);
        }}
        onLineClick={(line: ProductionLine) => {
          console.log('Line clicked:', line.id);
        }}
      />
    </div>
  );
}
