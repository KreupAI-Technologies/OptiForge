'use client';

import { useState, useMemo, useEffect } from 'react';
import { MapPin, DollarSign, Calendar, Globe, Plus, Edit, Trash2, Copy, XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';
import DataTable from '@/components/DataTable';
import { toast } from '@/hooks/use-toast';

interface PerDiemRate {
  id: string;
  locationName: string;
  locationType: 'domestic' | 'international';
  country?: string;
  state?: string;
  city?: string;
  currency: string;
  accommodationRate: number;
  mealsRate: number;
  incidentalsRate: number;
  transportRate: number;
  totalDailyRate: number;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'active' | 'inactive';
  notes?: string;
  createdDate: string;
  lastModified: string;
}

export default function Page() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRate, setSelectedRate] = useState<PerDiemRate | null>(null);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [rates, setRates] = useState<PerDiemRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadRates = async (): Promise<void> => {
    const raw = await HrPagesService.perDiemRates<any[]>();
    const mapped: PerDiemRate[] = (raw || []).map((r) => {
      const accommodation = Number(r.accommodationRate ?? 0);
      const meals = Number(r.mealsRate ?? 0);
      const incidentals = Number(r.incidentalsRate ?? 0);
      const transport = Number(r.transportRate ?? 0);
      const total = Number(r.totalDailyRate ?? accommodation + meals + incidentals + transport);
      return {
        id: r.id,
        locationName: r.locationName ?? '',
        locationType: r.locationType === 'international' ? 'international' : 'domestic',
        country: r.country ?? undefined,
        state: r.state ?? undefined,
        city: r.city ?? undefined,
        currency: r.currency ?? 'INR',
        accommodationRate: accommodation,
        mealsRate: meals,
        incidentalsRate: incidentals,
        transportRate: transport,
        totalDailyRate: total,
        effectiveFrom: r.effectiveFrom ?? '',
        effectiveTo: r.effectiveTo ?? undefined,
        status: r.status === 'inactive' ? 'inactive' : 'active',
        notes: r.notes ?? undefined,
        createdDate: r.createdAt ?? '',
        lastModified: r.updatedAt ?? '',
      };
    });
    setRates(mapped);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = await HrPagesService.perDiemRates<any[]>();
        const mapped: PerDiemRate[] = (raw || []).map((r) => {
          const accommodation = Number(r.accommodationRate ?? 0);
          const meals = Number(r.mealsRate ?? 0);
          const incidentals = Number(r.incidentalsRate ?? 0);
          const transport = Number(r.transportRate ?? 0);
          const total = Number(r.totalDailyRate ?? accommodation + meals + incidentals + transport);
          return {
            id: r.id,
            locationName: r.locationName ?? '',
            locationType: r.locationType === 'international' ? 'international' : 'domestic',
            country: r.country ?? undefined,
            state: r.state ?? undefined,
            city: r.city ?? undefined,
            currency: r.currency ?? 'INR',
            accommodationRate: accommodation,
            mealsRate: meals,
            incidentalsRate: incidentals,
            transportRate: transport,
            totalDailyRate: total,
            effectiveFrom: r.effectiveFrom ?? '',
            effectiveTo: r.effectiveTo ?? undefined,
            status: r.status === 'inactive' ? 'inactive' : 'active',
            notes: r.notes ?? undefined,
            createdDate: r.createdAt ?? '',
            lastModified: r.updatedAt ?? '',
          };
        });
        if (!cancelled) setRates(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load per-diem rates');
          setRates([]);
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

  // Form state
  const [formData, setFormData] = useState({
    locationName: '',
    locationType: 'domestic' as 'domestic' | 'international',
    country: '',
    state: '',
    city: '',
    currency: 'INR',
    accommodationRate: 0,
    mealsRate: 0,
    incidentalsRate: 0,
    transportRate: 0,
    effectiveFrom: '',
    effectiveTo: '',
    status: 'active' as 'active' | 'inactive',
    notes: ''
  });

  const filteredRates = useMemo(() => {
    return rates.filter(rate => {
      const matchesType = selectedType === 'all' || rate.locationType === selectedType;
      const matchesStatus = selectedStatus === 'all' || rate.status === selectedStatus;
      return matchesType && matchesStatus;
    });
  }, [selectedType, selectedStatus, rates]);

  const domesticInr = rates.filter(r => r.locationType === 'domestic' && r.currency === 'INR');
  const stats = {
    totalRates: rates.length,
    activeRates: rates.filter(r => r.status === 'active').length,
    domesticRates: rates.filter(r => r.locationType === 'domestic').length,
    internationalRates: rates.filter(r => r.locationType === 'international').length,
    avgDomesticRate: domesticInr.length
      ? Math.round(domesticInr.reduce((sum, r) => sum + r.totalDailyRate, 0) / domesticInr.length)
      : 0,
    currenciesUsed: new Set(rates.map(r => r.currency)).size
  };

  const resetForm = () => {
    setFormData({
      locationName: '',
      locationType: 'domestic',
      country: '',
      state: '',
      city: '',
      currency: 'INR',
      accommodationRate: 0,
      mealsRate: 0,
      incidentalsRate: 0,
      transportRate: 0,
      effectiveFrom: '',
      effectiveTo: '',
      status: 'active',
      notes: ''
    });
  };

  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (rate: PerDiemRate) => {
    setSelectedRate(rate);
    setFormData({
      locationName: rate.locationName,
      locationType: rate.locationType,
      country: rate.country || '',
      state: rate.state || '',
      city: rate.city || '',
      currency: rate.currency,
      accommodationRate: rate.accommodationRate,
      mealsRate: rate.mealsRate,
      incidentalsRate: rate.incidentalsRate,
      transportRate: rate.transportRate,
      effectiveFrom: rate.effectiveFrom,
      effectiveTo: rate.effectiveTo || '',
      status: rate.status,
      notes: rate.notes || ''
    });
    setShowEditModal(true);
  };

  const handleDuplicate = (rate: PerDiemRate) => {
    setFormData({
      locationName: `${rate.locationName} (Copy)`,
      locationType: rate.locationType,
      country: rate.country || '',
      state: rate.state || '',
      city: rate.city || '',
      currency: rate.currency,
      accommodationRate: rate.accommodationRate,
      mealsRate: rate.mealsRate,
      incidentalsRate: rate.incidentalsRate,
      transportRate: rate.transportRate,
      effectiveFrom: '',
      effectiveTo: '',
      status: 'active',
      notes: rate.notes || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = (rate: PerDiemRate) => {
    setSelectedRate(rate);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedRate) return;
    setIsSaving(true);
    try {
      await HrPagesService.deletePerDiemRate(selectedRate.id);
      await loadRates();
      toast({
        title: "Rate Deleted",
        description: `Per diem rate for ${selectedRate.locationName} has been deleted`
      });
      setShowDeleteModal(false);
      setSelectedRate(null);
    } catch (err) {
      toast({
        title: "Delete Failed",
        description: err instanceof Error ? err.message : "Failed to delete per diem rate.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const totalDailyRate =
      formData.accommodationRate + formData.mealsRate + formData.incidentalsRate + formData.transportRate;
    const payload = {
      locationName: formData.locationName,
      locationType: formData.locationType,
      country: formData.country || undefined,
      state: formData.state || undefined,
      city: formData.city || undefined,
      currency: formData.currency,
      accommodationRate: formData.accommodationRate,
      mealsRate: formData.mealsRate,
      incidentalsRate: formData.incidentalsRate,
      transportRate: formData.transportRate,
      totalDailyRate,
      effectiveFrom: formData.effectiveFrom || undefined,
      effectiveTo: formData.effectiveTo || undefined,
      status: formData.status,
      notes: formData.notes || undefined,
    };

    setIsSaving(true);
    try {
      if (showEditModal && selectedRate) {
        await HrPagesService.updatePerDiemRate(selectedRate.id, payload);
        toast({
          title: "Rate Updated",
          description: `Per diem rate for ${formData.locationName} has been updated`
        });
        setShowEditModal(false);
      } else {
        await HrPagesService.createPerDiemRate(payload);
        toast({
          title: "Rate Added",
          description: `Per diem rate for ${formData.locationName} has been added successfully`
        });
        setShowAddModal(false);
      }
      await loadRates();
      resetForm();
      setSelectedRate(null);
    } catch (err) {
      toast({
        title: "Save Failed",
        description: err instanceof Error ? err.message : "Failed to save per diem rate.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getTotalRate = () => {
    return formData.accommodationRate + formData.mealsRate + formData.incidentalsRate + formData.transportRate;
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    return type === 'domestic' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
  };

  const columns = [
    { key: 'locationName', label: 'Location', sortable: true,
      render: (v: string, row: PerDiemRate) => (
        <div>
          <div className="font-semibold text-gray-900">{v}</div>
          <div className="text-xs text-gray-500">
            {row.locationType === 'domestic' ? `${row.country}` : row.country}
          </div>
        </div>
      )
    },
    { key: 'locationType', label: 'Type', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(v)}`}>
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </span>
      )
    },
    { key: 'currency', label: 'Currency', sortable: true,
      render: (v: string) => <div className="font-mono font-semibold text-gray-900">{v}</div>
    },
    { key: 'accommodationRate', label: 'Accommodation', sortable: true,
      render: (v: number, row: PerDiemRate) => (
        <div className="text-sm text-gray-700">{row.currency} {v.toLocaleString()}</div>
      )
    },
    { key: 'mealsRate', label: 'Meals', sortable: true,
      render: (v: number, row: PerDiemRate) => (
        <div className="text-sm text-gray-700">{row.currency} {v.toLocaleString()}</div>
      )
    },
    { key: 'totalDailyRate', label: 'Total Daily Rate', sortable: true,
      render: (v: number, row: PerDiemRate) => (
        <div className="text-sm font-bold text-blue-600">{row.currency} {v.toLocaleString()}</div>
      )
    },
    { key: 'effectiveFrom', label: 'Effective From', sortable: true,
      render: (v: string) => (
        <div className="text-sm text-gray-700">
          {new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )
    },
    { key: 'status', label: 'Status', sortable: true,
      render: (v: string) => (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(v)}`}>
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </span>
      )
    },
    { key: 'actions', label: 'Actions', sortable: false,
      render: (_: any, row: PerDiemRate) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 hover:bg-blue-100 rounded"
            title="Edit rate"
          >
            <Edit className="h-4 w-4 text-blue-600" />
          </button>
          <button
            onClick={() => handleDuplicate(row)}
            className="p-1 hover:bg-green-100 rounded"
            title="Duplicate rate"
          >
            <Copy className="h-4 w-4 text-green-600" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1 hover:bg-red-100 rounded"
            title="Delete rate"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-3">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <MapPin className="h-8 w-8 text-blue-600" />
          Per Diem Rates
        </h1>
        <p className="text-gray-600 mt-2">Manage daily allowance rates for business travel</p>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading per-diem rates…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-3">
        <div className="bg-white border-2 border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Rates</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalRates}</p>
            </div>
            <MapPin className="h-10 w-10 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeRates}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-indigo-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Domestic</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.domesticRates}</p>
            </div>
            <MapPin className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">International</p>
              <p className="text-2xl font-bold text-purple-600">{stats.internationalRates}</p>
            </div>
            <Globe className="h-10 w-10 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-orange-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Domestic</p>
              <p className="text-xl font-bold text-orange-600">₹{(stats.avgDomesticRate / 1000).toFixed(1)}k</p>
            </div>
            <DollarSign className="h-10 w-10 text-orange-400" />
          </div>
        </div>
        <div className="bg-white border-2 border-teal-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Currencies</p>
              <p className="text-2xl font-bold text-teal-600">{stats.currenciesUsed}</p>
            </div>
            <Globe className="h-10 w-10 text-teal-400" />
          </div>
        </div>
      </div>

      {/* Filters and Add Button */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="domestic">Domestic</option>
              <option value="international">International</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAdd}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <Plus className="h-5 w-5" />
              Add Per Diem Rate
            </button>
          </div>
        </div>
      </div>

      {/* Rates Table */}
      <DataTable data={filteredRates} columns={columns} />

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Per Diem Rate Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Per diem rates cover daily expenses including accommodation, meals, incidentals, and local transport</li>
          <li>• Domestic rates are categorized by city tier (Tier 1: Metro cities, Tier 2: Major cities, Tier 3: Others)</li>
          <li>• International rates are set based on cost of living and company policy for each country</li>
          <li>• Rates are effective from the specified date and can have an end date for temporary adjustments</li>
          <li>• Currency should match the location (INR for domestic, local currency for international)</li>
          <li>• Inactive rates are retained for historical reference and audit purposes</li>
          <li>• Employees can claim actual expenses or per diem rates, whichever is lower (per policy)</li>
        </ul>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl  w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-blue-600" />
                {showEditModal ? 'Edit Per Diem Rate' : 'Add Per Diem Rate'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                  setSelectedRate(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-3">
                {/* Location Information */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Location Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.locationName}
                        onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Mumbai, Maharashtra or Singapore"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location Type *</label>
                      <select
                        required
                        value={formData.locationType}
                        onChange={(e) => setFormData({ ...formData, locationType: e.target.value as 'domestic' | 'international' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="domestic">Domestic</option>
                        <option value="international">International</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                      <input
                        type="text"
                        required
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., India, Singapore"
                      />
                    </div>
                    {formData.locationType === 'domestic' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                          <input
                            type="text"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Maharashtra"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Mumbai"
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency *</label>
                      <select
                        required
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="SGD">SGD - Singapore Dollar</option>
                        <option value="AED">AED - UAE Dirham</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                        <option value="CNY">CNY - Chinese Yuan</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Rate Components */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Rate Components (Per Day)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Accommodation Rate *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.accommodationRate}
                        onChange={(e) => setFormData({ ...formData, accommodationRate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meals Rate *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.mealsRate}
                        onChange={(e) => setFormData({ ...formData, mealsRate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Incidentals Rate *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.incidentalsRate}
                        onChange={(e) => setFormData({ ...formData, incidentalsRate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                      <p className="text-xs text-gray-500 mt-1">Tips, laundry, phone calls, etc.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Local Transport Rate *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.transportRate}
                        onChange={(e) => setFormData({ ...formData, transportRate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                      <p className="text-xs text-gray-500 mt-1">Taxi, metro, bus, etc.</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white rounded-lg border border-blue-300">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total Daily Rate:</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formData.currency} {getTotalRate().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Effective Dates */}
                <div className="bg-yellow-50 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Effective Period</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Effective From *</label>
                      <input
                        type="date"
                        required
                        value={formData.effectiveFrom}
                        onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Effective To (Optional)</label>
                      <input
                        type="date"
                        value={formData.effectiveTo}
                        onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty for indefinite period</p>
                    </div>
                  </div>
                </div>

                {/* Status and Notes */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Additional Information</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Additional notes about this rate (e.g., city tier, special conditions)"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      resetForm();
                      setSelectedRate(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-60"
                  >
                    {isSaving ? 'Saving…' : showEditModal ? 'Update Rate' : 'Add Rate'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
                Delete Per Diem Rate
              </h2>
            </div>

            <div className="p-6 space-y-2">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-900">
                  Are you sure you want to delete this per diem rate?
                </p>
                <div className="mt-3 space-y-1 text-sm text-red-800">
                  <p><strong>Location:</strong> {selectedRate.locationName}</p>
                  <p><strong>Type:</strong> {selectedRate.locationType}</p>
                  <p><strong>Total Rate:</strong> {selectedRate.currency} {selectedRate.totalDailyRate.toLocaleString()}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                This action cannot be undone. The rate will be permanently deleted from the system.
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-60"
                >
                  {isSaving ? 'Deleting…' : 'Delete Rate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
