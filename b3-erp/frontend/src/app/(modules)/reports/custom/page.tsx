'use client';

import React, { useState, useEffect } from 'react';
import {
  fetchSavedReportItems,
  createSavedReportItem,
  updateSavedReportItem,
  deleteSavedReportItem,
} from '@/services/reports-management.service';
import {
  Plus,
  Save,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Copy,
  Play,
  Settings,
  Filter,
  Calendar,
  FileText,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Code,
  Database,
  Layers,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Clock,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Search,
  Grid,
  List,
  Star,
  Share2,
  Bookmark,
} from 'lucide-react';

interface CustomReport {
  id: string;
  name: string;
  description: string;
  category: string;
  chartType: string;
  dataSource: string;
  filters: ReportFilter[];
  columns: ReportColumn[];
  createdBy: string;
  createdAt: string;
  lastRun: string;
  isFavorite: boolean;
  isShared: boolean;
  status: 'draft' | 'active' | 'archived';
}

interface ReportFilter {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface ReportColumn {
  id: string;
  field: string;
  label: string;
  type: string;
  aggregation?: string;
  visible: boolean;
}

interface DataSource {
  id: string;
  name: string;
  type: string;
  tables: string[];
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

export default function CustomReportsPage() {
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CustomReport | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportCategory, setReportCategory] = useState('');
  const [selectedChartType, setSelectedChartType] = useState('table');
  const [selectedDataSource, setSelectedDataSource] = useState('');
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [columns, setColumns] = useState<ReportColumn[]>([]);

  // Action state
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const categories = [
    'All Reports',
    'Financial',
    'Operations',
    'Sales',
    'Inventory',
    'Production',
    'Quality',
    'HR',
    'Custom',
  ];

  const chartTypes = [
    { id: 'table', name: 'Table', icon: <Table className="w-5 h-5" /> },
    { id: 'bar', name: 'Bar Chart', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'line', name: 'Line Chart', icon: <LineChart className="w-5 h-5" /> },
    { id: 'pie', name: 'Pie Chart', icon: <PieChart className="w-5 h-5" /> },
    { id: 'area', name: 'Area Chart', icon: <TrendingUp className="w-5 h-5" /> },
  ];

  const dataSources: DataSource[] = [
    {
      id: 'sales',
      name: 'Sales Database',
      type: 'SQL',
      tables: ['orders', 'customers', 'products', 'transactions'],
    },
    {
      id: 'inventory',
      name: 'Inventory System',
      type: 'SQL',
      tables: ['stock', 'warehouses', 'movements', 'suppliers'],
    },
    {
      id: 'production',
      name: 'Production Data',
      type: 'SQL',
      tables: ['work_orders', 'resources', 'schedules', 'quality_checks'],
    },
    {
      id: 'hr',
      name: 'HR Management',
      type: 'SQL',
      tables: ['employees', 'departments', 'payroll', 'attendance'],
    },
  ];

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'sales-summary',
      name: 'Sales Summary',
      description: 'Overview of sales performance and trends',
      icon: <DollarSign className="w-6 h-6" />,
      category: 'Sales',
    },
    {
      id: 'inventory-status',
      name: 'Inventory Status',
      description: 'Current stock levels and movements',
      icon: <Package className="w-6 h-6" />,
      category: 'Inventory',
    },
    {
      id: 'production-output',
      name: 'Production Output',
      description: 'Manufacturing output and efficiency metrics',
      icon: <BarChart3 className="w-6 h-6" />,
      category: 'Production',
    },
    {
      id: 'customer-analysis',
      name: 'Customer Analysis',
      description: 'Customer behavior and segmentation',
      icon: <Users className="w-6 h-6" />,
      category: 'Sales',
    },
  ];

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'between', label: 'Between' },
    { value: 'in', label: 'In' },
    { value: 'not_in', label: 'Not In' },
  ];

  const aggregations = [
    { value: 'none', label: 'None' },
    { value: 'sum', label: 'Sum' },
    { value: 'avg', label: 'Average' },
    { value: 'count', label: 'Count' },
    { value: 'min', label: 'Minimum' },
    { value: 'max', label: 'Maximum' },
  ];

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    // Saved reports come solely from the backend.
    fetchSavedReportItems()
      .then((items) => {
        setReports(
          items.map((it) => ({
            id: it.id,
            name: it.name,
            description: it.description ?? '',
            category: it.category ?? 'Custom',
            chartType:
              (it.config?.chartType as string | undefined) ?? 'table',
            dataSource: it.dataSource ?? '',
            filters: (it.config?.filters as ReportFilter[] | undefined) ?? [],
            columns: (it.config?.columns as ReportColumn[] | undefined) ?? [],
            createdBy: it.createdByName ?? 'System',
            createdAt: '',
            lastRun: it.lastRunAt ?? '',
            isFavorite: it.isFavorite,
            isShared: it.isShared,
            status: 'active',
          })),
        );
      })
      .catch(() => {
        setReports([]);
      });
  };

  const handleCreateReport = () => {
    setIsCreating(true);
    setCurrentStep(1);
    resetForm();
  };

  const resetForm = () => {
    setReportName('');
    setReportDescription('');
    setReportCategory('');
    setSelectedChartType('table');
    setSelectedDataSource('');
    setFilters([]);
    setColumns([]);
  };

  const handleSaveReport = async () => {
    if (!reportName.trim()) {
      setActionError('Report name is required.');
      return;
    }
    setIsSaving(true);
    setActionError(null);
    try {
      await createSavedReportItem({
        name: reportName,
        description: reportDescription,
        category: reportCategory || 'Custom',
        dataSource: selectedDataSource,
        outputFormat: 'pdf',
        config: { chartType: selectedChartType, filters, columns },
      });
      setIsCreating(false);
      resetForm();
      loadReports();
      setNotice('Report created successfully.');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to create report');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    setActionError(null);
    try {
      await deleteSavedReportItem(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      setNotice('Report deleted.');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete report');
    }
  };

  const handleDuplicateReport = async (report: CustomReport) => {
    setActionError(null);
    try {
      await createSavedReportItem({
        name: `${report.name} (Copy)`,
        description: report.description,
        category: report.category,
        dataSource: report.dataSource,
        outputFormat: 'pdf',
        config: {
          chartType: report.chartType,
          filters: report.filters,
          columns: report.columns,
        },
      });
      loadReports();
      setNotice('Report duplicated.');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to duplicate report');
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const report = reports.find((r) => r.id === id);
    if (!report) return;
    const next = !report.isFavorite;
    // Optimistic update
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: next } : r)),
    );
    try {
      await updateSavedReportItem(id, { isFavorite: next });
    } catch (err) {
      // Roll back on failure
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isFavorite: !next } : r)),
      );
      setActionError(err instanceof Error ? err.message : 'Failed to update favorite');
    }
  };

  // NOTE: report rendering/execution has no backend endpoint yet — this records
  // the last-run timestamp via the saved-item update endpoint. See NEEDS BACKEND.
  const handleRunReport = async (report: CustomReport) => {
    setActionError(null);
    try {
      await updateSavedReportItem(report.id, { lastRunAt: new Date().toISOString() });
      loadReports();
      setNotice(`Marked "${report.name}" as run. (Rendering not yet available.)`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to run report');
    }
  };

  const handleAddFilter = () => {
    const newFilter: ReportFilter = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: '',
    };
    setFilters([...filters, newFilter]);
  };

  const handleRemoveFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const handleAddColumn = () => {
    const newColumn: ReportColumn = {
      id: Date.now().toString(),
      field: '',
      label: '',
      type: 'text',
      aggregation: 'none',
      visible: true,
    };
    setColumns([...columns, newColumn]);
  };

  const handleRemoveColumn = (id: string) => {
    setColumns(columns.filter((c) => c.id !== id));
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderReportBuilder = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
        <div className="bg-white rounded-lg shadow-xl w-full  max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Create Custom Report</h2>
              <button
                onClick={() => setIsCreating(false)}
                className="text-white hover:bg-blue-700 p-2 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* Steps */}
            <div className="flex gap-2 mt-6">
              {['Basic Info', 'Data Source', 'Columns', 'Filters', 'Preview'].map(
                (step, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 ${currentStep > index + 1 ? 'opacity-100' : 'opacity-60'
                      }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep > index
                          ? 'bg-green-500'
                          : currentStep === index + 1
                            ? 'bg-white text-blue-600'
                            : 'bg-blue-500'
                        }`}
                    >
                      {currentStep > index ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span className="text-sm hidden md:block">{step}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {currentStep === 1 && (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Name
                  </label>
                  <input
                    type="text"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter report name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe your report"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.slice(1).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chart Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {chartTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedChartType(type.id)}
                        className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${selectedChartType === type.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        {type.icon}
                        <span className="text-sm">{type.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Data Source
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {dataSources.map((source) => (
                      <button
                        key={source.id}
                        onClick={() => setSelectedDataSource(source.id)}
                        className={`p-4 border-2 rounded-lg text-left transition-colors ${selectedDataSource === source.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Database className="w-5 h-5" />
                          <span className="font-semibold">{source.name}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Type: {source.type}
                        </div>
                        <div className="text-sm text-gray-600">
                          Tables: {source.tables.length}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Configure Columns</h3>
                  <button
                    onClick={handleAddColumn}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Column
                  </button>
                </div>
                <div className="space-y-3">
                  {columns.map((column, index) => (
                    <div
                      key={column.id}
                      className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <input
                        type="text"
                        placeholder="Field name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Label"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <select className="px-3 py-2 border border-gray-300 rounded-lg">
                        {aggregations.map((agg) => (
                          <option key={agg.value} value={agg.value}>
                            {agg.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleRemoveColumn(column.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Apply Filters</h3>
                  <button
                    onClick={handleAddFilter}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Filter
                  </button>
                </div>
                <div className="space-y-3">
                  {filters.map((filter) => (
                    <div
                      key={filter.id}
                      className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <input
                        type="text"
                        placeholder="Field"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <select className="px-3 py-2 border border-gray-300 rounded-lg">
                        {operators.map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Value"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        onClick={() => handleRemoveFilter(filter.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-800">
                    <Check className="w-5 h-5" />
                    <span className="font-semibold">Report Configuration Complete</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div>
                    <span className="font-semibold">Name:</span> {reportName}
                  </div>
                  <div>
                    <span className="font-semibold">Category:</span> {reportCategory}
                  </div>
                  <div>
                    <span className="font-semibold">Chart Type:</span> {selectedChartType}
                  </div>
                  <div>
                    <span className="font-semibold">Data Source:</span> {selectedDataSource}
                  </div>
                  <div>
                    <span className="font-semibold">Columns:</span> {columns.length}
                  </div>
                  <div>
                    <span className="font-semibold">Filters:</span> {filters.length}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-3 flex justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex gap-3">
              {currentStep < 5 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSaveReport}
                  disabled={isSaving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving…' : 'Save Report'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen px-3 py-2">
      <div className="w-full space-y-3">
        {actionError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex justify-between items-center">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {notice && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex justify-between items-center">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)} className="text-green-500 hover:text-green-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex justify-end items-start gap-2 mb-2">
            <button
              onClick={handleCreateReport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Report
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reports..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat.toLowerCase().replace(' ', '')}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
                  }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
                  }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Report Templates */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Quick Start Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            {reportTemplates.map((template) => (
              <button
                key={template.id}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    {template.icon}
                  </div>
                  <span className="font-semibold">{template.name}</span>
                </div>
                <p className="text-sm text-gray-600">{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Reports Grid/List */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            My Reports ({filteredReports.length})
          </h2>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{report.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    </div>
                    <button
                      onClick={() => handleToggleFavorite(report.id)}
                      className="text-yellow-500 hover:text-yellow-600"
                    >
                      <Star
                        className="w-5 h-5"
                        fill={report.isFavorite ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                      {report.category}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {report.chartType}
                    </span>
                    {report.isShared && (
                      <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">
                        Shared
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    Last run: {report.lastRun}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRunReport(report)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1"
                    >
                      <Play className="w-4 h-4" />
                      Run
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Edit className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDuplicateReport(report)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      onClick={() => handleToggleFavorite(report.id)}
                      className="text-yellow-500"
                    >
                      <Star
                        className="w-5 h-5"
                        fill={report.isFavorite ? 'currentColor' : 'none'}
                      />
                    </button>
                    <div className="flex-1">
                      <h3 className="font-semibold">{report.name}</h3>
                      <p className="text-sm text-gray-600">{report.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded">
                      {report.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      Last run: {report.lastRun}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRunReport(report)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Run
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                      <Edit className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDuplicateReport(report)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Builder Modal */}
      {isCreating && renderReportBuilder()}
    </div>
  );
}
