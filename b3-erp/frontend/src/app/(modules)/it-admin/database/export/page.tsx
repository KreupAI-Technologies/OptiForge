'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, FileText, Database, CheckSquare, Square, Filter, Calendar, FileSpreadsheet, FileJson, FileCode } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { ItAdminService, ExportTemplateDto } from '@/services/it-admin.service';

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: 'csv' | 'excel' | 'json' | 'sql' | 'xml';
  tables: string[];
  filters: string[];
  lastUsed?: string;
}

interface TableSelection {
  name: string;
  category: string;
  recordCount: number;
  size: string;
  selected: boolean;
}

export default function DatabaseExportPage() {
  const router = useRouter();
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'excel' | 'json' | 'sql' | 'xml'>('csv');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [includeSchema, setIncludeSchema] = useState(true);
  const [includeData, setIncludeData] = useState(true);
  const [compression, setCompression] = useState(true);

  const [tables, setTables] = useState<TableSelection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    ItAdminService.getExportDatasets()
      .then((datasets) => {
        if (cancelled) return;
        setTables(
          datasets.map((d) => ({
            name: d.name,
            category: d.category,
            recordCount: d.recordCount,
            size: d.size ?? '',
            selected: false,
          }))
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load export datasets');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const [templates, setTemplates] = useState<ExportTemplate[]>([]);

  const mapTemplate = (dto: ExportTemplateDto): ExportTemplate => ({
    id: dto.id,
    name: dto.name,
    description: dto.description ?? '',
    format: (dto.format as ExportTemplate['format']) ?? 'csv',
    tables: dto.tables ?? [],
    filters: dto.filters ?? [],
    lastUsed: dto.lastUsedAt ? dto.lastUsedAt.split('T')[0] : undefined,
  });

  useEffect(() => {
    let cancelled = false;
    ItAdminService.getExportTemplates()
      .then((rows) => {
        if (cancelled) return;
        setTemplates((Array.isArray(rows) ? rows : []).map(mapTemplate));
      })
      .catch(() => {
        if (!cancelled) setTemplates([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = ['All', 'User Management', 'Sales', 'Production', 'Inventory', 'Master Data', 'Finance'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const formats = [
    { id: 'csv', name: 'CSV', icon: FileText, description: 'Comma-separated values' },
    { id: 'excel', name: 'Excel', icon: FileSpreadsheet, description: 'Microsoft Excel (.xlsx)' },
    { id: 'json', name: 'JSON', icon: FileJson, description: 'JavaScript Object Notation' },
    { id: 'sql', name: 'SQL', icon: Database, description: 'SQL dump file' },
    { id: 'xml', name: 'XML', icon: FileCode, description: 'Extensible Markup Language' }
  ];

  const toggleTable = (tableName: string) => {
    setTables(prev =>
      prev.map(table =>
        table.name === tableName ? { ...table, selected: !table.selected } : table
      )
    );
  };

  const toggleCategory = (category: string) => {
    const categoryTables = tables.filter(t => category === 'All' || t.category === category);
    const allSelected = categoryTables.every(t => t.selected);

    setTables(prev =>
      prev.map(table =>
        (category === 'All' || table.category === category)
          ? { ...table, selected: !allSelected }
          : table
      )
    );
  };

  const applyTemplate = (template: ExportTemplate) => {
    setSelectedFormat(template.format);
    if (template.tables.includes('*')) {
      setTables(prev => prev.map(t => ({ ...t, selected: true })));
    } else {
      setTables(prev =>
        prev.map(t => ({
          ...t,
          selected: template.tables.includes(t.name)
        }))
      );
    }
    // Stamp lastUsedAt on the backend, then reflect it in the list.
    ItAdminService.applyExportTemplate(template.id)
      .then((updated) => {
        setTemplates(prev =>
          prev.map(t => (t.id === updated.id ? mapTemplate(updated) : t))
        );
      })
      .catch(() => {
        // best-effort; selection already applied locally
      });
  };

  const handleExport = async () => {
    exportToCsv('database-export', filteredTables as unknown as Record<string, unknown>[]);
    const selected = tables.filter((t) => t.selected);
    for (const t of selected) {
      try {
        await ItAdminService.createExportDataset({
          name: t.name,
          category: t.category,
          recordCount: t.recordCount,
          exportable: true,
        });
      } catch {
        // best-effort logging of export; ignore failures
      }
    }
  };

  const filteredTables = selectedCategory === 'All'
    ? tables
    : tables.filter(t => t.category === selectedCategory);

  const selectedCount = tables.filter(t => t.selected).length;
  const estimatedSize = tables
    .filter(t => t.selected)
    .reduce((acc, t) => {
      const sizeInMB = parseFloat(t.size.replace(' MB', '').replace(' KB', '')) * (t.size.includes('KB') ? 0.001 : 1);
      return acc + sizeInMB;
    }, 0);

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-2 w-full max-w-full">
      {isLoading && (
        <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          Loading...
        </div>
      )}
      {loadError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {loadError}
        </div>
      )}
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Database Export</h1>
          <p className="text-sm text-gray-500 mt-1">Export database tables and data in various formats</p>
        </div>
        <button
          onClick={handleExport}
          disabled={selectedCount === 0}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export {selectedCount > 0 && `(${selectedCount})`}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Export Templates */}
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Export Templates</h2>

          <div className="space-y-2 mb-3">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => applyTemplate(template)}
                className="w-full text-left p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <p className="font-semibold text-gray-900 text-sm">{template.name}</p>
                </div>
                <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                    {template.format.toUpperCase()}
                  </span>
                  {template.lastUsed && (
                    <span className="text-xs text-gray-500">
                      {template.lastUsed}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h3 className="text-sm font-bold text-blue-900 mb-2">Quick Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-700">Selected Tables</span>
                <span className="text-sm font-bold text-blue-900">{selectedCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-700">Est. Size</span>
                <span className="text-sm font-bold text-blue-900">{estimatedSize.toFixed(1)} MB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-blue-700">Format</span>
                <span className="text-sm font-bold text-blue-900">{selectedFormat.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Export Configuration */}
        <div className="lg:col-span-3 space-y-3">
          {/* Export Format */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Export Format</h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {formats.map((format) => {
                const IconComponent = format.icon;
                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id as any)}
                    className={`p-4 rounded-lg border-2 transition-all ${selectedFormat === format.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                      }`}
                  >
                    <IconComponent className={`w-8 h-8 mb-2 ${selectedFormat === format.id ? 'text-blue-600' : 'text-gray-600'}`} />
                    <p className="font-semibold text-sm text-gray-900">{format.name}</p>
                    <p className="text-xs text-gray-600 mt-1">{format.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Export Options</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Date Range Filter</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">From</label>
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">To</label>
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Export Settings</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSchema}
                      onChange={(e) => setIncludeSchema(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Include Schema/Structure</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeData}
                      onChange={(e) => setIncludeData(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Include Data</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={compression}
                      onChange={(e) => setCompression(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Compress Output (.zip)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Table Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900">Select Tables</h2>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <button
                onClick={() => toggleCategory(selectedCategory)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {filteredTables.every(t => t.selected) ? 'Deselect All' : 'Select All'} in {selectedCategory}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTables.map((table) => (
                <button
                  key={table.name}
                  onClick={() => toggleTable(table.name)}
                  className={`text-left p-3 rounded-lg border-2 transition-all ${table.selected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {table.selected ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                        <p className="font-semibold text-gray-900">{table.name}</p>
                      </div>
                      <p className="text-xs text-gray-600 ml-7">{table.category}</p>
                      <div className="flex items-center gap-3 mt-2 ml-7 text-xs text-gray-600">
                        <span>{table.recordCount.toLocaleString()} records</span>
                        <span>•</span>
                        <span>{table.size}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">Export Guidelines:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Large exports may take several minutes to complete</li>
              <li>• CSV format is recommended for importing into spreadsheets</li>
              <li>• SQL format includes both schema and data for complete backups</li>
              <li>• JSON format is ideal for application data interchange</li>
              <li>• Enable compression for files larger than 100MB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
