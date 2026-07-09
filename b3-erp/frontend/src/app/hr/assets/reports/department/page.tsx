'use client';

import { useState, useMemo, useEffect } from 'react';
import { Building, Laptop, Monitor, Smartphone } from 'lucide-react';
import { HrAssetsService } from '@/services/hr-assets.service';

interface DepartmentAssets {
  department: string;
  employees: number;
  laptops: number;
  desktops: number;
  mobiles: number;
  monitors: number;
  furniture: number;
  totalValue: number;
  assetsPerEmployee: number;
}

export default function Page() {
  const [sortBy, setSortBy] = useState('department');
  const [reportData, setReportData] = useState<DepartmentAssets[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrAssetsService.getReportDepartment();
        const mapped: DepartmentAssets[] = rows.map((r) => ({
          department: r.department,
          employees: Number(r.employees),
          laptops: Number(r.laptops),
          desktops: Number(r.desktops),
          mobiles: Number(r.mobiles),
          monitors: Number(r.monitors),
          furniture: Number(r.furniture),
          totalValue: Number(r.totalValue),
          assetsPerEmployee: Number(r.assetsPerEmployee),
        }));
        if (!cancelled) setReportData(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load department assets report');
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

  const stats = useMemo(() => {
    const totals = reportData.reduce((acc, dept) => ({
      employees: acc.employees + dept.employees,
      laptops: acc.laptops + dept.laptops,
      desktops: acc.desktops + dept.desktops,
      mobiles: acc.mobiles + dept.mobiles,
      monitors: acc.monitors + dept.monitors,
      furniture: acc.furniture + dept.furniture,
      totalValue: acc.totalValue + dept.totalValue
    }), { employees: 0, laptops: 0, desktops: 0, mobiles: 0, monitors: 0, furniture: 0, totalValue: 0 });

    return {
      ...totals,
      departments: reportData.length,
      avgAssetsPerEmployee: (totals.laptops + totals.desktops + totals.mobiles + totals.monitors + totals.furniture) / totals.employees
    };
  }, [reportData]);

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900">Department-wise Assets Report</h1>
        <p className="text-sm text-gray-600 mt-1">Asset distribution across departments</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading department assets report…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Departments</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.departments}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
          <p className="text-sm font-medium text-green-600">Total Employees</p>
          <p className="text-2xl font-bold text-green-900 mt-1">{stats.employees}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
          <p className="text-sm font-medium text-purple-600">IT Assets</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">{stats.laptops + stats.desktops}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200">
          <p className="text-sm font-medium text-orange-600">Total Value</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">₹{(stats.totalValue / 10000000).toFixed(2)}Cr</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
          <p className="text-sm font-medium text-blue-600">Avg/Employee</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.avgAssetsPerEmployee.toFixed(1)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="department">Department Name</option>
              <option value="employees">Employee Count</option>
              <option value="value">Total Value</option>
            </select>
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
        {reportData.map((dept, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{dept.department}</h3>
                  <p className="text-sm text-gray-600">{dept.employees} Employees • {dept.assetsPerEmployee.toFixed(1)} assets per employee</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Department Value</p>
                <p className="text-2xl font-bold text-blue-600">₹{(dept.totalValue / 100000).toFixed(2)}L</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Laptop className="h-4 w-4 text-blue-600" />
                  <p className="text-xs text-blue-600 uppercase font-medium">Laptops</p>
                </div>
                <p className="text-xl font-bold text-blue-700">{dept.laptops}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Monitor className="h-4 w-4 text-purple-600" />
                  <p className="text-xs text-purple-600 uppercase font-medium">Desktops</p>
                </div>
                <p className="text-xl font-bold text-purple-700">{dept.desktops}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Smartphone className="h-4 w-4 text-green-600" />
                  <p className="text-xs text-green-600 uppercase font-medium">Mobiles</p>
                </div>
                <p className="text-xl font-bold text-green-700">{dept.mobiles}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3">
                <p className="text-xs text-orange-600 uppercase font-medium mb-1">Monitors</p>
                <p className="text-xl font-bold text-orange-700">{dept.monitors}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 uppercase font-medium mb-1">Furniture</p>
                <p className="text-xl font-bold text-gray-700">{dept.furniture}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
