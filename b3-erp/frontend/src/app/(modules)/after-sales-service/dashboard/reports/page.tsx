'use client';

import React, { useState, useEffect } from 'react';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  FileSpreadsheet,
  Mail,
  Play,
  Settings,
  Eye,
  Copy,
  Trash2,
  Plus
} from 'lucide-react';

interface Report {
  id: string;
  reportName: string;
  reportType: 'SLA Performance' | 'Revenue Analysis' | 'Engineer Performance' | 'Contract Management' | 'Customer Satisfaction' | 'Service Trends' | 'Billing Summary' | 'Custom';
  description: string;
  frequency: 'On-Demand' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  format: 'PDF' | 'Excel' | 'CSV';
  lastGenerated: string;
  nextScheduled?: string;
  status: 'Active' | 'Inactive' | 'Generating';
  recipients?: string[];
  createdBy: string;
  parameters?: Record<string, any>;
}

interface ReportTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  category: string;
  estimatedTime: string;
  dataPoints: string[];
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'scheduled' | 'templates'>('scheduled');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);

  // Scheduled reports loaded from the after-sales analytics endpoint.
  const [scheduledReports, setScheduledReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await AfterSalesPagesService.reports()) as any[];
        const mapped: Report[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          id: String(r?.id ?? ''),
          reportName: r?.reportName ?? '',
          reportType: (r?.reportType ?? 'Custom') as Report['reportType'],
          description: r?.description ?? '',
          frequency: (r?.frequency ?? 'On-Demand') as Report['frequency'],
          format: (r?.format ?? 'PDF') as Report['format'],
          lastGenerated: r?.lastGenerated ?? '',
          nextScheduled: r?.nextScheduled,
          status: (r?.status ?? 'Active') as Report['status'],
          recipients: Array.isArray(r?.recipients) ? r.recipients : [],
          createdBy: r?.createdBy ?? '',
          parameters: r?.parameters,
        }));
        if (!cancelled) setScheduledReports(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load reports');
          setScheduledReports([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Mock Data - Report Templates
  const reportTemplates: ReportTemplate[] = [
    {
      id: 'TPL-001',
      name: 'SLA Performance Analysis',
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      description: 'Detailed analysis of response and resolution time compliance across all service requests',
      category: 'Operations',
      estimatedTime: '2-3 minutes',
      dataPoints: ['Response Time SLA %', 'Resolution Time SLA %', 'Average Response Time', 'Average Resolution Time', 'SLA Breaches', 'Trend Analysis']
    },
    {
      id: 'TPL-002',
      name: 'Revenue & Financial Performance',
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      description: 'Comprehensive revenue breakdown by service type, region, and time period with growth trends',
      category: 'Finance',
      estimatedTime: '3-4 minutes',
      dataPoints: ['Total Revenue', 'Revenue by Service Type', 'Revenue by Region', 'Payment Status', 'Outstanding Amount', 'Growth Trends']
    },
    {
      id: 'TPL-003',
      name: 'Engineer Performance Scorecard',
      icon: <Users className="w-6 h-6 text-purple-600" />,
      description: 'Individual and team performance metrics including job completion, SLA compliance, and ratings',
      category: 'HR & Operations',
      estimatedTime: '2-3 minutes',
      dataPoints: ['Jobs Completed', 'SLA Compliance %', 'Customer Ratings', 'Avg Resolution Time', 'Parts Utilization', 'Performance Ranking']
    },
    {
      id: 'TPL-004',
      name: 'Contract Renewal Pipeline',
      icon: <FileText className="w-6 h-6 text-orange-600" />,
      description: 'Upcoming contract renewals, expiring contracts, renewal rates, and revenue forecasting',
      category: 'Sales & CRM',
      estimatedTime: '1-2 minutes',
      dataPoints: ['Expiring Contracts', 'Renewal Pipeline Value', 'Renewal Rate %', 'Revenue Forecast', 'Contract Status', 'Customer Segments']
    },
    {
      id: 'TPL-005',
      name: 'Customer Satisfaction Report',
      icon: <TrendingUp className="w-6 h-6 text-indigo-600" />,
      description: 'NPS and CSAT scores with trends, feedback analysis, and improvement recommendations',
      category: 'Quality',
      estimatedTime: '2-3 minutes',
      dataPoints: ['NPS Score', 'CSAT Score', 'Response Rate', 'Trend Analysis', 'Feedback Summary', 'Action Items']
    },
    {
      id: 'TPL-006',
      name: 'Service Trends & Insights',
      icon: <TrendingUp className="w-6 h-6 text-teal-600" />,
      description: 'Service request patterns, common issues, seasonal trends, and predictive insights',
      category: 'Operations',
      estimatedTime: '3-4 minutes',
      dataPoints: ['Service Type Distribution', 'Issue Categories', 'Seasonal Patterns', 'Request Volume', 'Resolution Trends', 'Predictions']
    },
    {
      id: 'TPL-007',
      name: 'Billing & Payment Summary',
      icon: <FileSpreadsheet className="w-6 h-6 text-yellow-600" />,
      description: 'Invoice generation, payment collection, overdue accounts, and aging analysis',
      category: 'Finance',
      estimatedTime: '2-3 minutes',
      dataPoints: ['Total Invoiced', 'Payments Collected', 'Outstanding Balance', 'Overdue Analysis', 'Payment Methods', 'Aging Report']
    },
    {
      id: 'TPL-008',
      name: 'Warranty Claims Analysis',
      icon: <FileText className="w-6 h-6 text-red-600" />,
      description: 'Warranty claim patterns, approval rates, costs, and product quality insights',
      category: 'Quality & Finance',
      estimatedTime: '2-3 minutes',
      dataPoints: ['Total Claims', 'Approval Rate', 'Claim Value', 'Claim Categories', 'Product Analysis', 'Cost Trends']
    },
    {
      id: 'TPL-009',
      name: 'Installation Performance',
      icon: <Clock className="w-6 h-6 text-cyan-600" />,
      description: 'Installation job completion rates, timelines, team performance, and customer feedback',
      category: 'Operations',
      estimatedTime: '2-3 minutes',
      dataPoints: ['Jobs Completed', 'On-Time Rate', 'Avg Installation Time', 'Team Performance', 'Customer Satisfaction', 'Issue Log']
    }
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Inactive': return 'bg-gray-100 text-gray-700';
      case 'Generating': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getFrequencyColor = (frequency: Report['frequency']) => {
    switch (frequency) {
      case 'Daily': return 'bg-purple-100 text-purple-700';
      case 'Weekly': return 'bg-blue-100 text-blue-700';
      case 'Monthly': return 'bg-green-100 text-green-700';
      case 'Quarterly': return 'bg-orange-100 text-orange-700';
      case 'On-Demand': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleGenerateReport = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setShowGenerateModal(true);
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports Center</h1>
          <p className="text-sm text-gray-500 mt-1">Generate, schedule, and manage after-sales service reports</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Generate New Report
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Scheduled Reports</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {scheduledReports.filter(r => r.frequency !== 'On-Demand').length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {scheduledReports.filter(r => r.status === 'Active' && r.frequency !== 'On-Demand').length} active schedules
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Generated Today</span>
            <FileText className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">12</div>
          <div className="text-xs text-gray-500 mt-1">+3 from yesterday</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Report Templates</span>
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{reportTemplates.length}</div>
          <div className="text-xs text-gray-500 mt-1">Available templates</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">In Progress</span>
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {scheduledReports.filter(r => r.status === 'Generating').length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Currently generating</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'scheduled'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Scheduled Reports ({scheduledReports.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'templates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Report Templates ({reportTemplates.length})
          </button>
        </div>
      </div>

      {/* Scheduled Reports Tab */}
      {activeTab === 'scheduled' && (
        <div className="space-y-2">
          {scheduledReports.map((report) => (
            <div key={report.id} className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{report.reportName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(report.frequency)}`}>
                      {report.frequency}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{report.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-2 font-medium text-gray-900">{report.reportType}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Format:</span>
                      <span className="ml-2 font-medium text-gray-900">{report.format}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Generated:</span>
                      <span className="ml-2 font-medium text-gray-900">{formatDate(report.lastGenerated)}</span>
                    </div>
                    {report.nextScheduled && (
                      <div>
                        <span className="text-gray-500">Next Run:</span>
                        <span className="ml-2 font-medium text-gray-900">{formatDate(report.nextScheduled)}</span>
                      </div>
                    )}
                  </div>

                  {report.recipients && report.recipients.length > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-500">Recipients:</span>
                      <span className="text-gray-700">{report.recipients.join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                   
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                   
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                   
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                   
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                   
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                   
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {reportTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-lg transition-all hover:border-blue-300 cursor-pointer"
              onClick={() => handleGenerateReport(template)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="bg-gray-50 p-3 rounded-lg">
                  {template.icon}
                </div>
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                  {template.category}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{template.description}</p>

              <div className="mb-2">
                <div className="text-xs font-medium text-gray-500 mb-2">Includes:</div>
                <div className="flex flex-wrap gap-1">
                  {template.dataPoints.slice(0, 3).map((point, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {point}
                    </span>
                  ))}
                  {template.dataPoints.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      +{template.dataPoints.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{template.estimatedTime}</span>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700">
                  <Play className="w-3 h-3" />
                  Generate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedTemplate.icon}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{selectedTemplate.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-3">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">From</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue="2025-01-01"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">To</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue="2025-02-17"
                    />
                  </div>
                </div>
              </div>

              {/* Output Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
                <div className="grid grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="format" value="PDF" defaultChecked className="text-blue-600" />
                    <FileText className="w-4 h-4 text-red-600" />
                    <span className="text-sm">PDF</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="format" value="Excel" className="text-blue-600" />
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Excel</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="format" value="CSV" className="text-blue-600" />
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">CSV</span>
                  </label>
                </div>
              </div>

              {/* Report Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Report Options</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                    <span className="text-sm text-gray-700">Include charts and visualizations</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                    <span className="text-sm text-gray-700">Compare with previous period</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-blue-600" />
                    <span className="text-sm text-gray-700">Include detailed breakdowns</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-blue-600" />
                    <span className="text-sm text-gray-700">Add executive summary</span>
                  </label>
                </div>
              </div>

              {/* Email Recipients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Recipients (Optional)</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter email addresses separated by commas"
                />
              </div>

              {/* Schedule Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Generate Once (Now)</option>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                  <option>Quarterly</option>
                </select>
              </div>

              {/* Data Points Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data Points Included</label>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="grid grid-cols-2 gap-2">
                    {selectedTemplate.dataPoints.map((point, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        <span className="text-gray-700">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <Clock className="w-4 h-4 inline mr-1" />
                Estimated time: {selectedTemplate.estimatedTime}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                  <Play className="w-4 h-4" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
