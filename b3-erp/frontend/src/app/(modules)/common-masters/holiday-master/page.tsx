'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Download, Filter, X, Calendar, MapPin, Star, Award, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { mockHolidays, Holiday, getHolidayStats } from '@/data/common-masters/holidays';

import { hrMastersService } from '@/services/hr-masters.service';
import { exportToCsv } from '@/lib/export';

export default function HolidayMasterPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        setLoading(true);
        const data = await hrMastersService.getAllHolidays('1');

        const transformedHolidays: Holiday[] = data.map((item): Holiday => ({
          id: item.id,
          holidayCode: `HOL-${item.name.substring(0, 3).toUpperCase()}`,
          holidayName: item.name,
          date: item.date.split('T')[0],
          dayOfWeek: new Date(item.date).toLocaleDateString('en-US', { weekday: 'long' }),
          holidayType: (item.type?.toLowerCase() || 'national') as any,
          category: 'mandatory',
          applicableLocations: ['All Locations'],
          applicableFor: 'all',
          description: item.name,
          isActive: item.isActive,
          isRecurring: false,
          year: new Date(item.date).getFullYear(),
        }));

        setHolidays(transformedHolidays);
      } catch (error) {
        console.error('Error fetching holidays:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const handleEditHoliday = (row: Holiday) => {
    showToast(`Opening editor for: ${row.holidayName}`, 'info');
  };

  const handleExport = () => {
    exportToCsv('holiday-master', filteredData);
    showToast('Exporting holiday data...', 'success');
  };

  const handleAddHoliday = () => {
    showToast('Opening form to add new holiday', 'info');
  };

  // Filtered data
  const filteredData = useMemo(() => {
    return holidays.filter(holiday => {
      const matchesSearch =
        holiday.holidayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        holiday.holidayCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || holiday.holidayType === filterType;
      const matchesCategory = filterCategory === 'all' || holiday.category === filterCategory;

      const matchesMonth = filterMonth === 'all' ||
        new Date(holiday.date).getMonth() === parseInt(filterMonth);

      return matchesSearch && matchesType && matchesCategory && matchesMonth;
    });
  }, [holidays, searchTerm, filterType, filterCategory, filterMonth]);

  const getTypeColor = (type: string) => {
    const colors = {
      'national': 'bg-red-100 text-red-800',
      'regional': 'bg-orange-100 text-orange-800',
      'festival': 'bg-purple-100 text-purple-800',
      'restricted': 'bg-yellow-100 text-yellow-800',
      'company': 'bg-blue-100 text-blue-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    return category === 'mandatory' ? <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> : <Award className="w-4 h-4 text-gray-400" />;
  };

  // Table columns
  const columns: Column<Holiday>[] = [
    {
      id: 'date',
      header: 'Date',
      accessor: 'date',
      sortable: true,
      width: 'w-32',
      render: (value, row) => {
        const date = new Date(value);
        const isUpcoming = date >= new Date();
        return (
          <div className={`text-sm ${isUpcoming ? 'font-semibold' : 'text-gray-500'}`}>
            <div>{date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            <div className="text-xs text-gray-500">{row.dayOfWeek}</div>
          </div>
        );
      }
    },
    {
      id: 'holiday',
      header: 'Holiday',
      accessor: 'holidayName',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium flex items-center gap-2">
            {getCategoryIcon(row.category)}
            {value}
          </div>
          <div className="text-xs text-gray-500">{row.holidayCode}</div>
        </div>
      )
    },
    {
      id: 'type',
      header: 'Type',
      accessor: 'holidayType',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(value)} capitalize`}>
          {value}
        </span>
      )
    },
    {
      id: 'category',
      header: 'Category',
      accessor: 'category',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${value === 'mandatory' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
          {value}
        </span>
      )
    },
    {
      id: 'applicable',
      header: 'Applicable Locations',
      accessor: 'applicableLocations',
      sortable: false,
      render: (value) => (
        <div className="text-sm text-gray-600 flex items-start gap-1">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{value.join(', ')}</span>
        </div>
      )
    },
    {
      id: 'for',
      header: 'For',
      accessor: 'applicableFor',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-700 capitalize">{value}</span>
      )
    },
    {
      id: 'description',
      header: 'Description',
      accessor: 'description',
      sortable: false,
      render: (value) => (
        <div className="text-sm text-gray-600 max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'isActive',
      sortable: true,
      render: (value) => (
        <StatusBadge
          status={value ? 'active' : 'inactive'}
          text={value ? 'Active' : 'Inactive'}
        />
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id',
      sortable: false,
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              handleEditHoliday(row);
            }}
          >
            Edit
          </button>
          <button
            className="text-red-600 hover:text-red-800 text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Are you sure you want to delete ${row.holidayName}?`)) {
                setHolidays(prev => prev.filter(h => h.id !== row.id));
              }
            }}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterCategory('all');
    setFilterMonth('all');
  };

  const activeFilterCount = [
    filterType !== 'all',
    filterCategory !== 'all',
    filterMonth !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  // Statistics
  const stats = useMemo(() => {
    const today = new Date();
    const upcoming = holidays.filter(h => new Date(h.date) >= today);

    return {
      ...getHolidayStats(),
      upcoming: upcoming.length
    };
  }, [holidays]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-pink-50 to-rose-50">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
          <div className={`rounded-lg shadow-lg p-3 ${toast.type === 'success' ? 'bg-green-50 border border-green-200' :
              toast.type === 'error' ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
            }`}>
            <div className="flex items-start gap-3">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
              {toast.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />}
              <p className={`text-sm font-medium ${toast.type === 'success' ? 'text-green-800' :
                  toast.type === 'error' ? 'text-red-800' :
                    'text-blue-800'
                }`}>{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-none p-3 pb-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-7 h-7 text-pink-600" />
              Holiday Master - 2025
            </h1>
            <p className="text-gray-600 mt-1">Manage public holidays, festival leaves, and company offs</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Calendar</span>
            </button>
            <button
              onClick={handleAddHoliday}
              className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Holiday</span>
            </button>
          </div>
        </div>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Total Holidays</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Upcoming</div>
            <div className="text-2xl font-bold text-pink-600">{stats.upcoming}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">National</div>
            <div className="text-2xl font-bold text-red-600">{stats.national}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Festivals</div>
            <div className="text-2xl font-bold text-purple-600">{stats.festival}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Mandatory</div>
            <div className="text-2xl font-bold text-green-600">{stats.mandatory}</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="text-sm text-gray-600 mb-1">Restricted</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.restricted}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6">
        <div className="h-full flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex-none p-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search holidays by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showFilters ? 'bg-pink-50 border-pink-300 text-pink-700' : 'border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-pink-600 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Holiday Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="national">National</option>
                    <option value="regional">Regional</option>
                    <option value="festival">Festival</option>
                    <option value="restricted">Restricted</option>
                    <option value="company">Company</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="mandatory">Mandatory</option>
                    <option value="optional">Optional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month
                  </label>
                  <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="all">All Months</option>
                    {months.map((month, idx) => (
                      <option key={month} value={idx.toString()}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Data Table */}
          <div className="flex-1 overflow-auto">
            <DataTable
              data={filteredData}
              columns={columns}
              pagination={{
                enabled: true,
                pageSize: 15
              }}
              sorting={{
                enabled: true,
                defaultSort: { column: 'date', direction: 'asc' }
              }}
              emptyMessage="No holidays found"
              emptyDescription="Try adjusting your search or filters to find what you're looking for."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
