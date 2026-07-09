'use client';

import { useState, useEffect } from 'react';
import { User, Laptop, Monitor, Smartphone, Package } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';

interface EmployeeAsset {
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  laptop?: string;
  desktop?: string;
  mobile?: string;
  monitor?: string;
  furniture: string[];
  totalAssets: number;
  totalValue: number;
  location: string;
}

export default function Page() {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportData, setReportData] = useState<EmployeeAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrAssetsService.getReportEmployee();
        const mapped: EmployeeAsset[] = rows.map((r) => ({
          employeeName: r.employeeName,
          employeeCode: r.employeeCode,
          department: r.department,
          designation: r.designation,
          laptop: r.laptop,
          desktop: r.desktop,
          mobile: r.mobile,
          monitor: r.monitor,
          furniture: Array.isArray(r.furniture) ? r.furniture : [],
          totalAssets: Number(r.totalAssets),
          totalValue: Number(r.totalValue),
          location: r.location,
        }));
        if (!cancelled) setReportData(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load employee assets report');
          setReportData([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredData = reportData.filter(emp => {
    if (selectedDepartment !== 'all' && emp.department !== selectedDepartment) return false;
    if (searchQuery && !emp.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) && !emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    totalEmployees: reportData.length,
    totalAssets: reportData.reduce((sum, emp) => sum + emp.totalAssets, 0),
    totalValue: reportData.reduce((sum, emp) => sum + emp.totalValue, 0),
    avgAssetsPerEmployee: (reportData.reduce((sum, emp) => sum + emp.totalAssets, 0) / reportData.length).toFixed(1)
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Employee-wise Assets Report</h1>
        <p className="text-sm text-gray-600 mt-1">Individual employee asset allocation details</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading employee assets report…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Total Employees</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalEmployees}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-sm font-medium text-green-600">Total Assets</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.totalAssets}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <p className="text-sm font-medium text-purple-600">Avg/Employee</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{stats.avgAssetsPerEmployee}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <p className="text-sm font-medium text-orange-600">Total Value</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">₹{(stats.totalValue / 100000).toFixed(2)}L</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Departments</option>
              <option value="Sales">Sales</option>
              <option value="IT">IT</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Management">Management</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Employee</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name or Code..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
              Export Report
            </button>
          </div>
          <div className="flex items-end">
            <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
              Print Report
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {filteredData.map((emp, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{emp.employeeName}</h3>
                  <p className="text-sm text-gray-600">{emp.employeeCode} • {emp.designation} • {emp.department}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Asset Value</p>
                <p className="text-2xl font-bold text-blue-600">₹{emp.totalValue.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-600 mt-1">{emp.totalAssets} assets</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
              {emp.laptop && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Laptop className="h-4 w-4 text-blue-600" />
                    <p className="text-xs text-blue-600 uppercase font-medium">Laptop</p>
                  </div>
                  <p className="text-sm font-semibold text-blue-900">{emp.laptop}</p>
                </div>
              )}
              {emp.desktop && (
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Monitor className="h-4 w-4 text-purple-600" />
                    <p className="text-xs text-purple-600 uppercase font-medium">Desktop</p>
                  </div>
                  <p className="text-sm font-semibold text-purple-900">{emp.desktop}</p>
                </div>
              )}
              {emp.mobile && (
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="h-4 w-4 text-green-600" />
                    <p className="text-xs text-green-600 uppercase font-medium">Mobile</p>
                  </div>
                  <p className="text-sm font-semibold text-green-900">{emp.mobile}</p>
                </div>
              )}
              {emp.monitor && (
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Monitor className="h-4 w-4 text-orange-600" />
                    <p className="text-xs text-orange-600 uppercase font-medium">Monitor</p>
                  </div>
                  <p className="text-sm font-semibold text-orange-900">{emp.monitor}</p>
                </div>
              )}
            </div>

            {emp.furniture.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-gray-600" />
                  <p className="text-xs text-gray-600 uppercase font-medium">Furniture & Others</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {emp.furniture.map((item, idx) => (
                    <span key={idx} className="px-2 py-1 bg-white text-gray-700 text-xs rounded border border-gray-200">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Location:</span> {emp.location}
              </p>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
