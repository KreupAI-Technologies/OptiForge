'use client';

import React, { useEffect, useState } from 'react';
import { cpqIntegrationEndpointService } from '@/services/cpq/cpq-orphans.service';
import {
  Box,
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  FileText,
  Layers,
  Link,
  Zap,
  Clock,
  Activity,
  Search,
  Filter,
  ExternalLink
} from 'lucide-react';

interface CADSystem {
  id: number;
  name: string;
  type: 'AutoCAD' | 'SolidWorks' | 'Inventor' | 'CATIA' | 'Fusion360';
  status: 'connected' | 'disconnected' | 'error';
  version: string;
  lastSync: string;
  filesImported: number;
}

interface DesignFile {
  id: number;
  fileName: string;
  fileType: string;
  cadSystem: string;
  quoteId: string;
  importedDate: string;
  status: 'imported' | 'processing' | 'failed' | 'converted';
  fileSize: string;
  thumbnail?: string;
}

interface TechnicalSpec {
  id: number;
  parameter: string;
  value: string;
  unit: string;
  source: 'CAD' | 'Manual';
  lastUpdated: string;
}

export default function CPQIntegrationCADPage() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSystem, setSelectedSystem] = useState<string>('all');

  // CAD Systems State
  const [cadSystems, setCadSystems] = useState<CADSystem[]>([]);

  useEffect(() => {
    let active = true;
    cpqIntegrationEndpointService
      .findAll({ system: 'cad' })
      .then((rows) => {
        if (!active) return;
        const mapped: CADSystem[] = (Array.isArray(rows) ? rows : []).map((r, idx) => ({
          id: idx + 1,
          name: r.name ?? '',
          type: (r.type ?? 'AutoCAD') as CADSystem['type'],
          status: (r.status ?? 'connected') as CADSystem['status'],
          version: r.version ?? '',
          lastSync: r.lastSync ?? '',
          filesImported: Number(r.recordCount) || 0
        }));
        setCadSystems(mapped);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Recent Design Files
  const [designFiles, setDesignFiles] = useState<DesignFile[]>([
    {
      id: 1,
      fileName: 'Hydraulic_Press_Assembly.dwg',
      fileType: 'DWG',
      cadSystem: 'AutoCAD',
      quoteId: 'Q-2025-00156',
      importedDate: '2025-01-20 14:30',
      status: 'converted',
      fileSize: '12.4 MB'
    },
    {
      id: 2,
      fileName: 'Conveyor_System_3D.sldasm',
      fileType: 'SLDASM',
      cadSystem: 'SolidWorks',
      quoteId: 'Q-2025-00155',
      importedDate: '2025-01-20 13:45',
      status: 'converted',
      fileSize: '28.7 MB'
    },
    {
      id: 3,
      fileName: 'Motor_Housing.ipt',
      fileType: 'IPT',
      cadSystem: 'Inventor',
      quoteId: 'Q-2025-00154',
      importedDate: '2025-01-20 12:20',
      status: 'processing',
      fileSize: '8.2 MB'
    },
    {
      id: 4,
      fileName: 'Gearbox_Design.dwg',
      fileType: 'DWG',
      cadSystem: 'AutoCAD',
      quoteId: 'Q-2025-00153',
      importedDate: '2025-01-20 11:10',
      status: 'converted',
      fileSize: '15.6 MB'
    },
    {
      id: 5,
      fileName: 'Robotic_Arm.sldprt',
      fileType: 'SLDPRT',
      cadSystem: 'SolidWorks',
      quoteId: 'Q-2025-00152',
      importedDate: '2025-01-20 10:30',
      status: 'failed',
      fileSize: '42.1 MB'
    }
  ]);

  // Technical Specifications
  const [techSpecs, setTechSpecs] = useState<TechnicalSpec[]>([
    {
      id: 1,
      parameter: 'Overall Length',
      value: '2450',
      unit: 'mm',
      source: 'CAD',
      lastUpdated: '2025-01-20 14:30'
    },
    {
      id: 2,
      parameter: 'Overall Width',
      value: '1850',
      unit: 'mm',
      source: 'CAD',
      lastUpdated: '2025-01-20 14:30'
    },
    {
      id: 3,
      parameter: 'Overall Height',
      value: '2100',
      unit: 'mm',
      source: 'CAD',
      lastUpdated: '2025-01-20 14:30'
    },
    {
      id: 4,
      parameter: 'Total Weight',
      value: '3500',
      unit: 'kg',
      source: 'CAD',
      lastUpdated: '2025-01-20 14:30'
    },
    {
      id: 5,
      parameter: 'Material Volume',
      value: '0.85',
      unit: 'm³',
      source: 'CAD',
      lastUpdated: '2025-01-20 14:30'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'converted':
        return 'text-green-600 bg-green-50';
      case 'processing':
        return 'text-yellow-600 bg-yellow-50';
      case 'disconnected':
        return 'text-gray-600 bg-gray-50';
      case 'error':
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'converted':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'disconnected':
        return <AlertCircle className="w-4 h-4" />;
      case 'error':
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-3">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <Box className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-900">4</span>
          </div>
          <div className="text-sm font-medium text-blue-700">CAD Systems</div>
          <div className="text-xs text-blue-600 mt-1">3 Connected</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-900">2,724</span>
          </div>
          <div className="text-sm font-medium text-green-700">Files Imported</div>
          <div className="text-xs text-green-600 mt-1">Last 30 days</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-900">98.5%</span>
          </div>
          <div className="text-sm font-medium text-purple-700">Success Rate</div>
          <div className="text-xs text-purple-600 mt-1">Import & Convert</div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-8 h-8 text-orange-600" />
            <span className="text-2xl font-bold text-orange-900">45</span>
          </div>
          <div className="text-sm font-medium text-orange-700">Active Quotes</div>
          <div className="text-xs text-orange-600 mt-1">With CAD files</div>
        </div>
      </div>

      {/* Connected CAD Systems */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Connected CAD Systems</h3>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            {cadSystems.map((system) => (
              <div key={system.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Box className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{system.name}</div>
                    <div className="text-sm text-gray-600">Version {system.version}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Files Imported</div>
                    <div className="font-semibold text-gray-900">{system.filesImported.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Last Sync</div>
                    <div className="font-semibold text-gray-900">{system.lastSync}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(system.status)}`}>
                    {getStatusIcon(system.status)}
                    <span className="capitalize">{system.status}</span>
                  </div>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    aria-label="Settings"
                   
                  >
                    <Settings className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDesignFiles = () => (
    <div className="space-y-3">
      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search design files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedSystem}
          onChange={(e) => setSelectedSystem(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All CAD Systems</option>
          <option value="AutoCAD">AutoCAD</option>
          <option value="SolidWorks">SolidWorks</option>
          <option value="Inventor">Inventor</option>
          <option value="Fusion360">Fusion 360</option>
        </select>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Import File</span>
        </button>
      </div>

      {/* Design Files Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CAD System</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote ID</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imported</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {designFiles.map((file) => (
              <tr key={file.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">{file.fileName}</span>
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">{file.fileType}</span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{file.cadSystem}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <button
                    onClick={() => alert(`View quote ${file.quoteId} - Feature coming soon`)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    {file.quoteId}
                  </button>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{file.fileSize}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600">{file.importedDate}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-fit ${getStatusColor(file.status)}`}>
                    {getStatusIcon(file.status)}
                    <span className="capitalize">{file.status}</span>
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Box className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <ExternalLink className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTechnicalSpecs = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow">
        <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Auto-Extracted Technical Specifications</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Re-Extract</span>
          </button>
        </div>
        <div className="p-6">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Parameter</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Value</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Unit</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Source</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {techSpecs.map((spec) => (
                <tr key={spec.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{spec.parameter}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{spec.value}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{spec.unit}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      spec.source === 'CAD' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {spec.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{spec.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3D Viewer Preview */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">3D Model Preview</h3>
        </div>
        <div className="p-6">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <Box className="w-16 h-16 text-gray-400 mb-2" />
              <p className="text-gray-600 font-medium">3D Viewer</p>
              <p className="text-sm text-gray-500 mt-1">Select a design file to preview 3D model</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow">
        <div className="px-3 py-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">CAD Integration Settings</h3>
        </div>
        <div className="p-6 space-y-3">
          {/* File Import Settings */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">File Import Settings</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Auto-extract dimensions from CAD files</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Calculate material volume automatically</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Generate thumbnail previews</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Convert to standard format (STEP)</span>
              </label>
            </div>
          </div>

          {/* Supported File Types */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Supported File Types</h4>
            <div className="flex flex-wrap gap-2">
              {['DWG', 'DXF', 'SLDPRT', 'SLDASM', 'IPT', 'IAM', 'STEP', 'IGES', 'STL', 'F3D'].map((type) => (
                <span key={type} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* API Configuration */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">API Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">AutoCAD API Key</label>
                <input
                  type="password"
                  defaultValue="••••••••••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SolidWorks API Key</label>
                <input
                  type="password"
                  defaultValue="••••••••••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'files', label: 'Design Files', icon: FileText },
    { id: 'specs', label: 'Technical Specs', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Box className="w-8 h-8 text-blue-600" />
            <span>CAD Integration</span>
          </h1>
          <p className="text-gray-600 mt-1">Import designs and extract technical specifications from CAD systems</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <RefreshCw className="w-4 h-4" />
          <span>Sync All</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-sm font-medium whitespace-nowrap flex items-center space-x-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'files' && renderDesignFiles()}
          {activeTab === 'specs' && renderTechnicalSpecs()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
}
