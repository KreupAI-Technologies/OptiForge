'use client';

import { useState, useMemo, useEffect } from 'react';
import { TrendingUp, Download, MapPin, Plane, Hotel, Users, Calendar, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from '@/hooks/use-toast';
import { HrPagesService } from '@/services/hr-pages.service';

interface TravelExpense {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  destination: string;
  purpose: string;
  startDate: string;
  endDate: string;
  days: number;
  flightCost: number;
  hotelCost: number;
  mealsCost: number;
  localTransportCost: number;
  totalCost: number;
}

export default function TravelAnalyticsPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [travelData, setTravelData] = useState<TravelExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.get('/hr/travel-requests')) as any[];
        const mapped: TravelExpense[] = (Array.isArray(raw) ? raw : []).map((r, i) => {
          const flightCost = Number(r.flightCost ?? r.flight ?? 0);
          const hotelCost = Number(r.hotelCost ?? r.hotel ?? 0);
          const mealsCost = Number(r.mealsCost ?? r.meals ?? 0);
          const localTransportCost = Number(r.localTransportCost ?? r.transport ?? 0);
          return {
            id: String(r.id ?? `TRV-${i}`),
            employeeName: r.employeeName ?? r.employee ?? '',
            employeeId: r.employeeId ?? '',
            department: r.department ?? r.departmentName ?? '',
            destination: r.destination ?? '',
            purpose: r.purpose ?? '',
            startDate: r.startDate ?? '',
            endDate: r.endDate ?? '',
            days: Number(r.days ?? 0),
            flightCost,
            hotelCost,
            mealsCost,
            localTransportCost,
            totalCost: Number(
              r.totalCost ?? r.totalAmount ?? flightCost + hotelCost + mealsCost + localTransportCost,
            ),
          };
        });
        if (!cancelled) setTravelData(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load travel data');
          setTravelData([]);
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

  const filteredData = useMemo(() => {
    if (selectedDepartment === 'all') return travelData;
    return travelData.filter(trip => trip.department === selectedDepartment);
  }, [selectedDepartment, travelData]);

  const stats = useMemo(() => {
    const total = filteredData.reduce(
      (acc, trip) => ({
        trips: acc.trips + 1,
        cost: acc.cost + trip.totalCost,
        days: acc.days + trip.days,
        flight: acc.flight + trip.flightCost,
        hotel: acc.hotel + trip.hotelCost,
        meals: acc.meals + trip.mealsCost,
        transport: acc.transport + trip.localTransportCost
      }),
      { trips: 0, cost: 0, days: 0, flight: 0, hotel: 0, meals: 0, transport: 0 }
    );

    return {
      ...total,
      avgCostPerTrip: total.trips > 0 ? Math.round(total.cost / total.trips) : 0,
      avgCostPerDay: total.days > 0 ? Math.round(total.cost / total.days) : 0
    };
  }, [filteredData]);

  const destinationSummary = useMemo(() => {
    const summary: Record<string, {count: number, totalCost: number}> = {};
    filteredData.forEach(trip => {
      if (!summary[trip.destination]) {
        summary[trip.destination] = { count: 0, totalCost: 0 };
      }
      summary[trip.destination].count++;
      summary[trip.destination].totalCost += trip.totalCost;
    });
    return Object.entries(summary)
      .map(([destination, data]) => ({ destination, ...data }))
      .sort((a, b) => b.totalCost - a.totalCost);
  }, [filteredData]);

  const handleExportToExcel = () => {
    try {
      const exportData = filteredData.map(trip => ({
        'Trip ID': trip.id,
        'Employee Name': trip.employeeName,
        'Department': trip.department,
        'Destination': trip.destination,
        'Purpose': trip.purpose,
        'Days': trip.days,
        'Flight Cost': trip.flightCost,
        'Hotel Cost': trip.hotelCost,
        'Meals Cost': trip.mealsCost,
        'Transport Cost': trip.localTransportCost,
        'Total Cost': trip.totalCost
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      ws['!cols'] = [
        { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 25 },
        { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Travel Analytics');
      XLSX.writeFile(wb, `Travel_Analytics_${selectedYear}_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: "Export Successful",
        description: `Travel analytics exported successfully`
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export travel analytics",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-purple-600" />
            Travel Analytics
          </h1>
          <p className="text-sm text-gray-600 mt-1">Travel expense insights and trends</p>
        </div>
        <button
          onClick={handleExportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium"
        >
          <Download className="h-5 w-5" />
          Export Report
        </button>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading travel data…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-purple-700">Total Trips</p>
            <Plane className="h-8 w-8 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-purple-900">{stats.trips}</p>
          <p className="text-xs text-purple-600 mt-1">{stats.days} total days</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-700">Total Cost</p>
            <MapPin className="h-8 w-8 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-900">₹{(stats.cost / 100000).toFixed(1)}L</p>
          <p className="text-xs text-blue-600 mt-1">All travel expenses</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-700">Avg Per Trip</p>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-900">₹{(stats.avgCostPerTrip / 1000).toFixed(1)}k</p>
          <p className="text-xs text-green-600 mt-1">Average trip cost</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-sm border border-orange-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-orange-700">Avg Per Day</p>
            <Hotel className="h-8 w-8 text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-orange-900">₹{(stats.avgCostPerDay / 1000).toFixed(1)}k</p>
          <p className="text-xs text-orange-600 mt-1">Daily average</p>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Plane className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-gray-700">Flight</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{(stats.flight / 1000).toFixed(0)}k</p>
          <p className="text-xs text-gray-500 mt-1">{stats.cost > 0 ? Math.round((stats.flight / stats.cost) * 100) : 0}% of total</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Hotel className="h-5 w-5 text-purple-600" />
            <p className="text-sm font-medium text-gray-700">Hotel</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{(stats.hotel / 1000).toFixed(0)}k</p>
          <p className="text-xs text-gray-500 mt-1">{stats.cost > 0 ? Math.round((stats.hotel / stats.cost) * 100) : 0}% of total</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-gray-700">Meals</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{(stats.meals / 1000).toFixed(0)}k</p>
          <p className="text-xs text-gray-500 mt-1">{stats.cost > 0 ? Math.round((stats.meals / stats.cost) * 100) : 0}% of total</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-orange-600" />
            <p className="text-sm font-medium text-gray-700">Transport</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{(stats.transport / 1000).toFixed(0)}k</p>
          <p className="text-xs text-gray-500 mt-1">{stats.cost > 0 ? Math.round((stats.transport / stats.cost) * 100) : 0}% of total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value={currentYear}>{currentYear}</option>
              <option value={currentYear - 1}>{currentYear - 1}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Departments</option>
              {Array.from(new Set(travelData.map(t => t.department))).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* By Destination */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-purple-600" />
          Travel by Destination
        </h2>
        <div className="space-y-3">
          {destinationSummary.map((dest) => (
            <div key={dest.destination} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{dest.destination}</p>
                <p className="text-xs text-gray-500">{dest.count} trips</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">₹{(dest.totalCost / 1000).toFixed(0)}k</p>
                <p className="text-xs text-gray-500">₹{Math.round(dest.totalCost / dest.count / 1000)}k avg</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Travel Details Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Travel Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{trip.employeeName}</div>
                      <div className="text-xs text-gray-500">{trip.department}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">{trip.destination}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{trip.purpose}</td>
                  <td className="px-3 py-2">
                    <div className="text-xs text-gray-600">
                      {new Date(trip.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} -
                      {' '}
                      {new Date(trip.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">{trip.days}</td>
                  <td className="px-3 py-2 text-sm font-semibold text-gray-900">₹{trip.totalCost.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Travel Expense Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• All travel must be pre-approved by department head</li>
          <li>• Flight bookings should be done minimum 15 days in advance for best rates</li>
          <li>• Hotel expenses limited to ₹4,000 per night for metro cities</li>
          <li>• Daily meal allowance: ₹1,500 for domestic travel</li>
          <li>• Local transport reimbursed as per actuals with valid receipts</li>
        </ul>
      </div>
    </div>
  );
}
