'use client';

import { useState, useMemo, useEffect } from 'react';
import { History, Wrench, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';

interface MaintenanceRecord {
  id: string;
  ticketId: string;
  assetTag: string;
  assetName: string;
  assetCategory: 'laptop' | 'desktop' | 'mobile' | 'monitor' | 'printer' | 'server' | 'other';
  issueType: 'hardware_failure' | 'software_issue' | 'preventive' | 'breakdown' | 'upgrade' | 'other';
  issueDescription: string;
  reportedBy: string;
  reportedDate: string;
  assignedTo: string;
  vendor?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'completed' | 'failed' | 'partial';
  startDate: string;
  completionDate: string;
  resolutionTime: number;
  cost: number;
  workDone: string;
  partsReplaced?: string[];
  location: string;
  remarks?: string;
}

export default function Page() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIssueType, setSelectedIssueType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fallbackHistory: MaintenanceRecord[] = [
    {
      id: '1',
      ticketId: 'MT-2024-1234',
      assetTag: 'LAP-2024-001',
      assetName: 'Dell Latitude 5420',
      assetCategory: 'laptop',
      issueType: 'hardware_failure',
      issueDescription: 'Screen flickering and display issues',
      reportedBy: 'Rajesh Kumar (EMP345)',
      reportedDate: '2024-10-15',
      assignedTo: 'Dell Service Center',
      vendor: 'Dell India Support Services',
      priority: 'high',
      status: 'completed',
      startDate: '2024-10-15',
      completionDate: '2024-10-17',
      resolutionTime: 48,
      cost: 8500,
      workDone: 'Replaced LCD panel and display cable',
      partsReplaced: ['LCD Panel', 'Display Cable'],
      location: 'Mumbai Office'
    },
    {
      id: '2',
      ticketId: 'MT-2024-1189',
      assetTag: 'DESK-2024-002',
      assetName: 'HP Elite 800 G8',
      assetCategory: 'desktop',
      issueType: 'preventive',
      issueDescription: 'Scheduled quarterly maintenance',
      reportedBy: 'System Auto-generated',
      reportedDate: '2024-10-01',
      assignedTo: 'IT Team - Vikram Singh',
      priority: 'low',
      status: 'completed',
      startDate: '2024-10-01',
      completionDate: '2024-10-01',
      resolutionTime: 2,
      cost: 0,
      workDone: 'Cleaned system, updated BIOS, checked thermal paste',
      location: 'Hyderabad Office',
      remarks: 'All systems running optimally'
    },
    {
      id: '3',
      ticketId: 'MT-2024-1256',
      assetTag: 'MOB-2024-001',
      assetName: 'Samsung Galaxy S21',
      assetCategory: 'mobile',
      issueType: 'breakdown',
      issueDescription: 'Device not charging, battery drain',
      reportedBy: 'Arjun Kapoor (EMP890)',
      reportedDate: '2024-10-20',
      assignedTo: 'Samsung Service Center',
      vendor: 'Samsung India Service',
      priority: 'critical',
      status: 'completed',
      startDate: '2024-10-20',
      completionDate: '2024-10-22',
      resolutionTime: 36,
      cost: 4500,
      workDone: 'Replaced battery and charging port',
      partsReplaced: ['Battery', 'Charging Port'],
      location: 'Delhi Office'
    },
    {
      id: '4',
      ticketId: 'MT-2024-1102',
      assetTag: 'PRN-2023-045',
      assetName: 'Canon imageRUNNER 2525i',
      assetCategory: 'printer',
      issueType: 'hardware_failure',
      issueDescription: 'Paper jam and print quality issues',
      reportedBy: 'Priya Sharma (EMP412)',
      reportedDate: '2024-09-28',
      assignedTo: 'Canon Service Engineer',
      vendor: 'Canon India Services',
      priority: 'medium',
      status: 'partial',
      startDate: '2024-09-28',
      completionDate: '2024-09-29',
      resolutionTime: 24,
      cost: 3200,
      workDone: 'Cleared paper jam, replaced fuser unit. Print quality still needs monitoring',
      partsReplaced: ['Fuser Unit', 'Pickup Roller'],
      location: 'Bangalore Office',
      remarks: 'Follow-up required after 1 week'
    },
    {
      id: '5',
      ticketId: 'MT-2024-1045',
      assetTag: 'SRV-2023-012',
      assetName: 'Lenovo ThinkSystem SR650',
      assetCategory: 'server',
      issueType: 'hardware_failure',
      issueDescription: 'Hard drive failure alert',
      reportedBy: 'IT Team - Sneha Reddy',
      reportedDate: '2024-09-10',
      assignedTo: 'Lenovo Data Center Services',
      vendor: 'Lenovo Data Center Services',
      priority: 'critical',
      status: 'completed',
      startDate: '2024-09-10',
      completionDate: '2024-09-10',
      resolutionTime: 4,
      cost: 0,
      workDone: 'Replaced failed HDD with hot-spare, rebuilt RAID array',
      partsReplaced: ['2TB HDD'],
      location: 'Mumbai Data Center',
      remarks: 'Under AMC - no charges'
    }
  ];

  const [mockHistory, setMockHistory] = useState<MaintenanceRecord[]>(fallbackHistory);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrAssetsService.getAssetMaintenance('history');
        if (cancelled) return;
        if (rows.length) {
          setMockHistory(
            rows.map((r) => {
              let parts: string[] = [];
              try {
                parts = r.partsReplaced ? JSON.parse(r.partsReplaced) : [];
              } catch {
                parts = [];
              }
              return {
                id: r.id,
                ticketId: r.ticketId || '',
                assetTag: r.assetTag || '',
                assetName: r.assetName || '',
                assetCategory: (r.assetCategory as MaintenanceRecord['assetCategory']) || 'other',
                issueType: (r.issueType as MaintenanceRecord['issueType']) || 'other',
                issueDescription: r.issueDescription || '',
                reportedBy: r.reportedBy || '',
                reportedDate: r.reportedDate || '',
                assignedTo: r.assignedTo || '',
                vendor: r.vendor || undefined,
                priority: (r.priority as MaintenanceRecord['priority']) || 'medium',
                status: (r.status as MaintenanceRecord['status']) || 'completed',
                startDate: r.startDate || '',
                completionDate: r.completionDate || '',
                resolutionTime: Number(r.resolutionTime ?? 0),
                cost: Number(r.cost ?? 0),
                workDone: r.workDone || '',
                partsReplaced: parts,
                location: r.location || '',
                remarks: r.remarks || undefined,
              };
            }),
          );
        }
      } catch (err) {
        if (!cancelled)
          setLoadError(err instanceof Error ? err.message : 'Failed to load history');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredHistory = mockHistory.filter(h => {
    if (selectedCategory !== 'all' && h.assetCategory !== selectedCategory) return false;
    if (selectedIssueType !== 'all' && h.issueType !== selectedIssueType) return false;
    if (selectedStatus !== 'all' && h.status !== selectedStatus) return false;
    return true;
  });

  const stats = useMemo(() => ({
    total: mockHistory.length,
    completed: mockHistory.filter(h => h.status === 'completed').length,
    partial: mockHistory.filter(h => h.status === 'partial').length,
    totalCost: mockHistory.reduce((sum, h) => sum + h.cost, 0),
    avgResolutionTime: Math.round(mockHistory.reduce((sum, h) => sum + h.resolutionTime, 0) / mockHistory.length)
  }), [mockHistory]);

  const statusColors = {
    completed: 'bg-green-100 text-green-700',
    partial: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700'
  };

  const categoryColors = {
    laptop: 'bg-blue-100 text-blue-700',
    desktop: 'bg-purple-100 text-purple-700',
    mobile: 'bg-green-100 text-green-700',
    monitor: 'bg-orange-100 text-orange-700',
    printer: 'bg-pink-100 text-pink-700',
    server: 'bg-red-100 text-red-700',
    other: 'bg-gray-100 text-gray-700'
  };

  const issueTypeLabel = {
    hardware_failure: 'Hardware Failure',
    software_issue: 'Software Issue',
    preventive: 'Preventive Maintenance',
    breakdown: 'Breakdown',
    upgrade: 'Upgrade',
    other: 'Other'
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Maintenance History</h1>
        <p className="text-sm text-gray-600 mt-1">View past maintenance and repair records</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading history…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Records</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-sm font-medium text-green-600">Completed</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
          <p className="text-sm font-medium text-yellow-600">Partial</p>
          <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.partial}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <p className="text-sm font-medium text-purple-600">Total Cost</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">₹{stats.totalCost.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <p className="text-sm font-medium text-orange-600">Avg Resolution</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">{stats.avgResolutionTime}h</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Category</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Categories</option>
              <option value="laptop">Laptop</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="monitor">Monitor</option>
              <option value="printer">Printer</option>
              <option value="server">Server</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
            <select value={selectedIssueType} onChange={(e) => setSelectedIssueType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Types</option>
              <option value="hardware_failure">Hardware Failure</option>
              <option value="software_issue">Software Issue</option>
              <option value="preventive">Preventive</option>
              <option value="breakdown">Breakdown</option>
              <option value="upgrade">Upgrade</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="partial">Partial</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredHistory.map(record => (
          <div key={record.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Wrench className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{record.assetName}</h3>
                    <p className="text-sm text-gray-600">Ticket: {record.ticketId} • Asset: {record.assetTag}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${categoryColors[record.assetCategory]}`}>
                    {record.assetCategory.charAt(0).toUpperCase() + record.assetCategory.slice(1)}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${priorityColors[record.priority]}`}>
                    {record.priority.charAt(0).toUpperCase() + record.priority.slice(1)}
                  </span>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[record.status]}`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Maintenance Cost</p>
                <p className="text-2xl font-bold text-blue-600">₹{record.cost.toLocaleString('en-IN')}</p>
                {record.cost === 0 && <p className="text-xs text-green-600 mt-1">Under AMC</p>}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-2">
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Issue Type</p>
              <p className="text-sm font-semibold text-gray-900 mb-2">{issueTypeLabel[record.issueType]}</p>
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Description</p>
              <p className="text-sm text-gray-700">{record.issueDescription}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 py-4 border-y border-gray-200">
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Reported By</p>
                <p className="text-sm font-semibold text-gray-900">{record.reportedBy}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Assigned To</p>
                <p className="text-sm font-semibold text-gray-900">{record.assignedTo}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Resolution Time</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  <Clock className="h-4 w-4 text-orange-600" />
                  {record.resolutionTime} hours
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p>
                <p className="text-sm font-semibold text-gray-900">{record.location}</p>
              </div>
            </div>

            <div className="mb-2">
              <p className="text-xs text-gray-500 uppercase font-medium mb-2">Work Done</p>
              <p className="text-sm text-gray-700 mb-3">{record.workDone}</p>
              {record.partsReplaced && record.partsReplaced.length > 0 && (
                <>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-2">Parts Replaced</p>
                  <div className="flex flex-wrap gap-2">
                    {record.partsReplaced.map((part, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                        {part}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Reported:</span> {new Date(record.reportedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                <span className="mx-2">→</span>
                <span className="font-medium">Completed:</span> {new Date(record.completionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                View Details
              </button>
            </div>

            {record.remarks && (
              <div className="mt-4 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                <p className="text-xs text-yellow-700 uppercase font-medium mb-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Remarks
                </p>
                <p className="text-sm text-yellow-800">{record.remarks}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
