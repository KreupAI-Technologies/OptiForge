'use client'

import { useState, useEffect } from 'react'
import { FileText, CheckCircle, XCircle, Clock, AlertTriangle, ChevronDown, ChevronRight, Filter, Loader2 } from 'lucide-react'
import { workflowRepositoryService, WorkflowInstanceDTO } from '@/services/workflow-repository.service'

export type ExecutionStatus = 'running' | 'success' | 'failed' | 'warning' | 'cancelled';

export interface ExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: ExecutionStatus;
  triggeredBy: string;
  steps: ExecutionStep[];
  errorCount: number;
  warningCount: number;
}

export interface ExecutionStep {
  id: string;
  stepName: string;
  nodeType: string;
  startTime: string;
  endTime?: string;
  duration: number;
  status: ExecutionStatus;
  input?: any;
  output?: any;
  error?: string;
  retryCount?: number;
}

// Map a backend InstanceStatus onto the component's ExecutionStatus.
function mapInstanceStatus(status: string): ExecutionStatus {
  switch (status) {
    case 'running':
    case 'pending':
    case 'paused':
      return 'running';
    case 'completed':
      return 'success';
    case 'failed':
      return 'failed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'running';
  }
}

function fmtDate(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  return isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

// Map a backend WorkflowInstance into the ExecutionLog shape used here.
function mapInstanceToLog(inst: WorkflowInstanceDTO): ExecutionLog {
  const status = mapInstanceStatus(inst.status);
  const start = inst.startedAt ?? inst.createdAt;
  const end = inst.completedAt ?? undefined;
  const duration =
    start && end
      ? Math.max(0, Math.round(((new Date(end).getTime() - new Date(start).getTime()) / 1000) * 10) / 10)
      : undefined;

  const stepStatus: ExecutionStatus =
    status === 'failed' ? 'failed' : status === 'success' ? 'success' : status === 'running' ? 'running' : status;

  const summaryStep: ExecutionStep = {
    id: `${inst.id}-current`,
    stepName: inst.currentStepName || `${inst.completedSteps}/${inst.totalSteps} steps completed`,
    nodeType: 'step',
    startTime: fmtDate(start),
    endTime: end ? fmtDate(end) : undefined,
    duration: duration ?? 0,
    status: stepStatus,
    input: inst.context ?? undefined,
    output: inst.errorDetails ?? undefined,
    error: inst.errorMessage ?? undefined,
  };

  return {
    id: inst.id,
    workflowId: inst.definitionId ?? '',
    workflowName:
      inst.definition?.name ||
      inst.sourceNumber ||
      inst.instanceNumber ||
      'Workflow Instance',
    startTime: fmtDate(start),
    endTime: end ? fmtDate(end) : undefined,
    duration,
    status,
    triggeredBy: inst.sourceType
      ? `${inst.sourceType}${inst.sourceNumber ? ` (${inst.sourceNumber})` : ''}`
      : inst.createdBy || 'system',
    errorCount: status === 'failed' ? 1 : 0,
    warningCount: 0,
    steps: [summaryStep],
  };
}

export default function ExecutionLogs() {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const instances = await workflowRepositoryService.getInstances({ limit: 50 });
        if (!cancelled) setLogs(instances.map(mapInstanceToLog));
      } catch (err) {
        console.error('Failed to load workflow instances:', err);
        if (!cancelled) setLoadError('Failed to load execution logs.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<ExecutionStatus | 'all'>('all');
  const [realTimeUpdate, setRealTimeUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeUpdate(prev => prev + 1);
      // Update running logs
      setLogs(prev => prev.map(log => {
        if (log.status === 'running') {
          const runningStep = log.steps.find(s => s.status === 'running');
          if (runningStep) {
            runningStep.duration = Math.round((Date.now() - new Date(runningStep.startTime).getTime()) / 100) / 10;
          }
        }
        return log;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'running':
        return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: ExecutionStatus) => {
    const colors = {
      running: 'bg-blue-100 text-blue-700',
      success: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      warning: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-gray-100 text-gray-700'
    };
    return colors[status];
  };

  const filteredLogs = logs.filter(log => statusFilter === 'all' || log.status === statusFilter);

  const statusCounts = {
    all: logs.length,
    running: logs.filter(l => l.status === 'running').length,
    success: logs.filter(l => l.status === 'success').length,
    failed: logs.filter(l => l.status === 'failed').length,
    warning: logs.filter(l => l.status === 'warning').length,
    cancelled: logs.filter(l => l.status === 'cancelled').length
  };

  return (
    <div className="space-y-3">
      <div className="bg-white shadow-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              Execution Logs & Monitoring
            </h2>
            <p className="text-gray-600 mt-1">Real-time workflow execution tracking</p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'running', 'success', 'failed', 'warning'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-12 flex items-center justify-center gap-3 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          Loading execution logs...
        </div>
      )}

      {!loading && loadError && (
        <div className="bg-white shadow-lg border border-red-200 rounded-lg p-6 text-center text-red-600">
          {loadError}
        </div>
      )}

      {/* Logs List */}
      {!loading && !loadError && (
      <div className="space-y-2">
        {filteredLogs.map((log) => {
          const isExpanded = expandedLogs.has(log.id);
          return (
            <div key={log.id} className="bg-white shadow-lg border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 cursor-pointer hover:from-blue-100 hover:to-purple-100 transition-colors"
                onClick={() => toggleExpand(log.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {isExpanded ? <ChevronDown className="h-5 w-5 text-gray-600" /> : <ChevronRight className="h-5 w-5 text-gray-600" />}
                    {getStatusIcon(log.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{log.workflowName}</h3>
                      <p className="text-sm text-gray-600">
                        {log.startTime}
                        {log.duration && ` • ${log.duration}s`}
                        {log.status === 'running' && ' • In Progress'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {log.errorCount > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                        {log.errorCount} errors
                      </span>
                    )}
                    {log.warningCount > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                        {log.warningCount} warnings
                      </span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(log.status)}`}>
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 bg-gray-50">
                  <div className="space-y-3">
                    {log.steps.map((step, idx) => (
                      <div key={step.id} className="p-3 bg-white border border-gray-200 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(step.status)}
                            <span className="font-medium text-gray-900">{step.stepName}</span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">{step.nodeType}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {step.retryCount && step.retryCount > 0 && (
                              <span className="text-xs text-orange-600">
                                {step.retryCount} retries
                              </span>
                            )}
                            <span className="text-sm text-gray-600">{step.duration}s</span>
                          </div>
                        </div>

                        {step.input && (
                          <div className="mb-2">
                            <div className="text-xs font-medium text-gray-700 mb-1">INPUT:</div>
                            <div className="bg-blue-50 p-2 rounded text-xs font-mono text-gray-800 max-h-20 overflow-auto">
                              {JSON.stringify(step.input, null, 2)}
                            </div>
                          </div>
                        )}

                        {step.output && (
                          <div className="mb-2">
                            <div className="text-xs font-medium text-gray-700 mb-1">OUTPUT:</div>
                            <div className="bg-green-50 p-2 rounded text-xs font-mono text-gray-800 max-h-20 overflow-auto">
                              {JSON.stringify(step.output, null, 2)}
                            </div>
                          </div>
                        )}

                        {step.error && (
                          <div className="bg-red-50 p-2 rounded">
                            <div className="text-xs font-medium text-red-700 mb-1">ERROR:</div>
                            <div className="text-xs text-red-600">{step.error}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600">No execution logs found for the selected filter.</p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
