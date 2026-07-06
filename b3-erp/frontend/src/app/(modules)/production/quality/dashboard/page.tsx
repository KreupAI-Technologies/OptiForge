'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { QualityControlDashboard } from '@/components/production/QualityControlDashboard';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';

interface DefectCategory {
  category: string;
  count: number;
  percentage: number;
  cumulative: number;
}

// Build a Pareto-ordered defect breakdown from raw NCR records.
function buildDefectData(ncrs: any[]): DefectCategory[] {
  const counts: Record<string, number> = {};
  (Array.isArray(ncrs) ? ncrs : []).forEach((n: any) => {
    const key = String(n?.nonconformanceType ?? n?.defectType ?? n?.category ?? 'Other');
    counts[key] = (counts[key] ?? 0) + Number(n?.quantityAffected ?? n?.count ?? 1);
  });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((a, [, c]) => a + c, 0);
  if (total === 0) return [];
  let cumulative = 0;
  return entries.map(([category, count]) => {
    cumulative += (count / total) * 100;
    return {
      category,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
      cumulative: Math.round(cumulative * 10) / 10,
    };
  });
}

export default function QualityDashboardPage() {
  const router = useRouter();
  const [defectData, setDefectData] = useState<DefectCategory[] | undefined>(undefined);

  const loadData = useCallback(async () => {
    try {
      const res = (await ProductionOrphanService.getNcrs()) as any;
      const raw = Array.isArray(res) ? res : (res?.data ?? []);
      const defects = buildDefectData(Array.isArray(raw) ? raw : []);
      // Only override the component's sample data when we actually have records.
      setDefectData(defects.length > 0 ? defects : undefined);
    } catch (err) {
      console.error('Failed to load quality dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Header - Dashboard has its own header */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Quality</span>
          </button>
        </div>
      </div>

      {/* Quality Control Dashboard Component */}
      <QualityControlDashboard
        productLine="All Production Lines"
        refreshInterval={30000}
        defectData={defectData}
        onRefresh={() => {
          loadData();
        }}
        onExport={(type) => {
          console.log('Exporting:', type);
        }}
      />
    </div>
  );
}
