'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp, Clock, Zap, AlertCircle, Download, RefreshCw, Settings, Eye, FileText, TrendingDown } from 'lucide-react';
import {
  productionAnalyticsService,
  type OEERecord,
} from '@/services/production/production-analytics.service';

export interface OEEData {
  machineId: string;
  machineName: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  plannedProductionTime: number;
  actualRuntime: number;
  downtime: number;
  idealCycleTime: number;
  actualCycleTime: number;
  totalParts: number;
  goodParts: number;
  defectParts: number;
}

const OEEAnalytics: React.FC = () => {
  const DEFAULT_OEE_DATA: OEEData[] = [
    {
      machineId: 'M001',
      machineName: 'CNC Mill #1',
      oee: 75.8,
      availability: 88.5,
      performance: 92.1,
      quality: 93.0,
      plannedProductionTime: 480,
      actualRuntime: 425,
      downtime: 55,
      idealCycleTime: 145,
      actualCycleTime: 158,
      totalParts: 1247,
      goodParts: 1160,
      defectParts: 87,
    },
    {
      machineId: 'M002',
      machineName: 'CNC Lathe #2',
      oee: 82.4,
      availability: 92.0,
      performance: 95.8,
      quality: 93.6,
      plannedProductionTime: 480,
      actualRuntime: 442,
      downtime: 38,
      idealCycleTime: 98,
      actualCycleTime: 102,
      totalParts: 892,
      goodParts: 835,
      defectParts: 57,
    },
    {
      machineId: 'M003',
      machineName: 'Press #1',
      oee: 65.2,
      availability: 78.3,
      performance: 88.2,
      quality: 94.5,
      plannedProductionTime: 480,
      actualRuntime: 376,
      downtime: 104,
      idealCycleTime: 35,
      actualCycleTime: 40,
      totalParts: 645,
      goodParts: 610,
      defectParts: 35,
    },
  ];

  const [oeeData, setOeeData] = useState<OEEData[]>(DEFAULT_OEE_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const mapRecord = useCallback((r: OEERecord): OEEData => ({
    machineId: r.workCenterId || r.id,
    machineName: r.workCenterName || r.productionLineName || 'Work Center',
    oee: Number(r.oee) || 0,
    availability: Number(r.availability) || 0,
    performance: Number(r.performance) || 0,
    quality: Number(r.quality) || 0,
    plannedProductionTime: Number(r.plannedProductionTime) || 0,
    actualRuntime: Number(r.actualRunTime) || 0,
    downtime: Number(r.downtime) || 0,
    idealCycleTime: Number(r.idealCycleTime) || 0,
    actualCycleTime: Number(r.actualCycleTime) || 0,
    totalParts: Number(r.totalCount) || 0,
    goodParts: Number(r.goodCount) || 0,
    defectParts: Number(r.rejectCount) || 0,
  }), []);

  const loadOEE = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const records = await productionAnalyticsService.findAllOEERecords();
      const rows = Array.isArray(records) ? records : [];
      if (rows.length > 0) {
        setOeeData(rows.map(mapRecord));
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load OEE data');
    } finally {
      setIsLoading(false);
    }
  }, [mapRecord]);

  useEffect(() => {
    loadOEE();
  }, [loadOEE]);

  const avgOEE = oeeData.length > 0 ? oeeData.reduce((sum, d) => sum + d.oee, 0) / oeeData.length : 0;

  const getOEEColor = (oee: number): string => {
    if (oee >= 85) return 'text-green-600';
    if (oee >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOEEBgColor = (oee: number): string => {
    if (oee >= 85) return 'bg-green-500';
    if (oee >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Handler functions
  const handleRefreshOEE = () => {
    loadOEE();
  };

  const handleExportOEE = () => {
    console.log('Exporting OEE report...');
    alert('Exporting OEE Analytics Report to Excel...\n\nIncludes:\n- OEE breakdown by machine\n- Availability, Performance, Quality metrics\n- Downtime analysis\n- Production statistics\n- Trend analysis');
  };

  const handleOEESettings = () => {
    console.log('Opening OEE settings...');
    alert('OEE Analytics Settings\n\nConfigure:\n- Target OEE thresholds\n- Ideal cycle times\n- Downtime categories\n- Reporting periods\n- Alert rules');
  };

  const handleViewMachineDetails = (machine: OEEData) => {
    alert(`OEE Details: ${machine.machineName}\n\nOverall OEE: ${machine.oee.toFixed(1)}%\n\nAVAILABILITY: ${machine.availability.toFixed(1)}%\n- Planned Time: ${machine.plannedProductionTime} min\n- Runtime: ${machine.actualRuntime} min\n- Downtime: ${machine.downtime} min\n\nPERFORMANCE: ${machine.performance.toFixed(1)}%\n- Ideal Cycle Time: ${machine.idealCycleTime}s\n- Actual Cycle Time: ${machine.actualCycleTime}s\n\nQUALITY: ${machine.quality.toFixed(1)}%\n- Total Parts: ${machine.totalParts}\n- Good Parts: ${machine.goodParts}\n- Defects: ${machine.defectParts} (${((machine.defectParts / machine.totalParts) * 100).toFixed(1)}%)`);
  };

  const handleDowntimeAnalysis = (machine: OEEData) => {
    alert(`Downtime Analysis: ${machine.machineName}\n\nTotal Downtime: ${machine.downtime} minutes\nAvailability Loss: ${(100 - machine.availability).toFixed(1)}%\n\nDowntime Categories:\n- Setup/Changeover: ${(machine.downtime * 0.4).toFixed(0)} min (40%)\n- Equipment Failure: ${(machine.downtime * 0.3).toFixed(0)} min (30%)\n- Material Shortage: ${(machine.downtime * 0.2).toFixed(0)} min (20%)\n- Other: ${(machine.downtime * 0.1).toFixed(0)} min (10%)\n\nRecommendations:\n- Reduce setup time with SMED techniques\n- Implement preventive maintenance\n- Improve material planning`);
  };

  const handlePerformanceAnalysis = (machine: OEEData) => {
    const cycleTimeDiff = machine.actualCycleTime - machine.idealCycleTime;
    const percentSlower = ((cycleTimeDiff / machine.idealCycleTime) * 100).toFixed(1);
    alert(`Performance Analysis: ${machine.machineName}\n\nPerformance: ${machine.performance.toFixed(1)}%\nCycle Time Variance: ${cycleTimeDiff}s (${percentSlower}% slower than ideal)\n\nIdeal Cycle Time: ${machine.idealCycleTime}s\nActual Cycle Time: ${machine.actualCycleTime}s\n\nPotential Causes:\n- Worn tooling or equipment\n- Operator skill/training gaps\n- Material quality variations\n- Machine speed settings\n\nRecommendations:\n- Review and optimize machine parameters\n- Provide operator training\n- Inspect and replace tooling as needed`);
  };

  const handleQualityAnalysis = (machine: OEEData) => {
    const defectRate = ((machine.defectParts / machine.totalParts) * 100).toFixed(2);
    alert(`Quality Analysis: ${machine.machineName}\n\nQuality Rate: ${machine.quality.toFixed(1)}%\nDefect Rate: ${defectRate}%\n\nTotal Parts: ${machine.totalParts}\nGood Parts: ${machine.goodParts}\nDefects: ${machine.defectParts}\n\nTop Defect Types:\n- Dimensional non-conformance: ${(machine.defectParts * 0.45).toFixed(0)} (45%)\n- Surface finish issues: ${(machine.defectParts * 0.30).toFixed(0)} (30%)\n- Material defects: ${(machine.defectParts * 0.25).toFixed(0)} (25%)\n\nRecommendations:\n- Implement statistical process control\n- Review first-piece inspection\n- Improve incoming material quality`);
  };

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-3 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">OEE Analytics & Drill-Down</h2>
              <p className="text-orange-100">
                {isLoading
                  ? 'Loading live OEE data…'
                  : loadError
                    ? 'Live data unavailable — showing reference figures'
                    : 'Overall Equipment Effectiveness monitoring'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleRefreshOEE}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleOEESettings}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleExportOEE}
              className="flex items-center space-x-2 px-4 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white p-3 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average OEE</p>
              <p className={`text-2xl font-bold ${getOEEColor(avgOEE)}`}>{avgOEE.toFixed(1)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Availability</p>
              <p className="text-2xl font-bold text-green-600">
                {(oeeData.reduce((sum, d) => sum + d.availability, 0) / oeeData.length).toFixed(1)}%
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Performance</p>
              <p className="text-2xl font-bold text-purple-600">
                {(oeeData.reduce((sum, d) => sum + d.performance, 0) / oeeData.length).toFixed(1)}%
              </p>
            </div>
            <Zap className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Quality</p>
              <p className="text-2xl font-bold text-yellow-600">
                {(oeeData.reduce((sum, d) => sum + d.quality, 0) / oeeData.length).toFixed(1)}%
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">OEE Breakdown by Machine</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {oeeData.map((machine) => (
            <div key={machine.machineId} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-gray-900">{machine.machineName}</h4>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Overall OEE</div>
                  <div className={`text-3xl font-bold ${getOEEColor(machine.oee)}`}>{machine.oee.toFixed(1)}%</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <div className="p-3 bg-green-50 rounded">
                  <div className="text-sm text-gray-600 mb-1">Availability</div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-700">{machine.availability.toFixed(1)}%</span>
                    <div className="text-xs text-gray-600">
                      <div>Runtime: {machine.actualRuntime}m</div>
                      <div>Downtime: {machine.downtime}m</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${machine.availability}%` }}></div>
                  </div>
                </div>

                <div className="p-3 bg-purple-50 rounded">
                  <div className="text-sm text-gray-600 mb-1">Performance</div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-purple-700">{machine.performance.toFixed(1)}%</span>
                    <div className="text-xs text-gray-600">
                      <div>Ideal: {machine.idealCycleTime}s</div>
                      <div>Actual: {machine.actualCycleTime}s</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${machine.performance}%` }}></div>
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 rounded">
                  <div className="text-sm text-gray-600 mb-1">Quality</div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-yellow-700">{machine.quality.toFixed(1)}%</span>
                    <div className="text-xs text-gray-600">
                      <div>Good: {machine.goodParts}</div>
                      <div>Defects: {machine.defectParts}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${machine.quality}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-gray-600">Planned Time</div>
                  <div className="font-semibold">{machine.plannedProductionTime} min</div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-gray-600">Total Parts</div>
                  <div className="font-semibold">{machine.totalParts}</div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-gray-600">Good Parts</div>
                  <div className="font-semibold text-green-600">{machine.goodParts}</div>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-gray-600">Defect Rate</div>
                  <div className="font-semibold text-red-600">{((machine.defectParts / machine.totalParts) * 100).toFixed(1)}%</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleViewMachineDetails(machine)}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
                <button
                  onClick={() => handleDowntimeAnalysis(machine)}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm"
                >
                  <Clock className="h-4 w-4" />
                  <span>Downtime Analysis</span>
                </button>
                <button
                  onClick={() => handlePerformanceAnalysis(machine)}
                  className="flex items-center space-x-1 px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors text-sm"
                >
                  <Zap className="h-4 w-4" />
                  <span>Performance Analysis</span>
                </button>
                <button
                  onClick={() => handleQualityAnalysis(machine)}
                  className="flex items-center space-x-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors text-sm"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>Quality Analysis</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">OEE Formula & Calculation</h3>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-blue-50 rounded">
            <strong>OEE = Availability × Performance × Quality</strong>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-green-50 rounded">
              <div className="font-semibold mb-1">Availability</div>
              <div className="text-xs">= (Runtime / Planned Production Time) × 100</div>
            </div>
            <div className="p-3 bg-purple-50 rounded">
              <div className="font-semibold mb-1">Performance</div>
              <div className="text-xs">= (Ideal Cycle Time / Actual Cycle Time) × 100</div>
            </div>
            <div className="p-3 bg-yellow-50 rounded">
              <div className="font-semibold mb-1">Quality</div>
              <div className="text-xs">= (Good Parts / Total Parts) × 100</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OEEAnalytics;
