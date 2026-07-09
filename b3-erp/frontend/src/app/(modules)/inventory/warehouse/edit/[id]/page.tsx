'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Warehouse as WarehouseIcon, AlertCircle } from 'lucide-react';
import { inventoryService } from '@/services/InventoryService';

interface FormState {
  warehouseCode: string;
  warehouseName: string;
  warehouseType: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  contactPerson: string;
  phone: string;
  email: string;
  managerName: string;
  storageCapacity: number;
  status: string;
}

export default function WarehouseEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      setNotFound(false);
      try {
        const wh = await inventoryService.getWarehouse(params.id);
        if (cancelled) return;
        if (!wh || !(wh.id ?? wh.warehouseCode)) {
          setNotFound(true);
          return;
        }
        setForm({
          warehouseCode: wh.warehouseCode ?? '',
          warehouseName: wh.warehouseName ?? '',
          warehouseType: wh.warehouseType ?? '',
          addressLine1: wh.addressLine1 ?? '',
          addressLine2: wh.addressLine2 ?? '',
          city: wh.city ?? '',
          state: wh.state ?? '',
          postalCode: wh.postalCode ?? '',
          country: wh.country ?? '',
          contactPerson: wh.contactPerson ?? '',
          phone: wh.phone ?? '',
          email: wh.email ?? '',
          managerName: wh.managerName ?? '',
          storageCapacity: Number(wh.storageCapacity ?? 0),
          status: wh.status ?? 'Active',
        });
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to load warehouse';
          if (/not found|404/i.test(msg)) setNotFound(true);
          else setLoadError(msg);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const setField = (key: keyof FormState, value: string | number) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await inventoryService.updateWarehouse(params.id, {
        warehouseCode: form.warehouseCode,
        warehouseName: form.warehouseName,
        warehouseType: form.warehouseType,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
        contactPerson: form.contactPerson,
        phone: form.phone,
        email: form.email,
        managerName: form.managerName,
        storageCapacity: form.storageCapacity,
        status: form.status,
      });
      router.push('/inventory/warehouse');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save warehouse');
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm';

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center gap-2">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <WarehouseIcon className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Warehouse</h1>
            <p className="text-gray-600 text-sm">{form?.warehouseCode}</p>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading warehouse…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {notFound && !isLoading && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          Warehouse not found.
        </div>
      )}

      {form && !isLoading && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          {saveError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {saveError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Warehouse Code</label>
              <input type="text" value={form.warehouseCode} onChange={(e) => setField('warehouseCode', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Warehouse Name</label>
              <input type="text" value={form.warehouseName} onChange={(e) => setField('warehouseName', e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
              <select value={form.warehouseType} onChange={(e) => setField('warehouseType', e.target.value)} className={inputCls}>
                <option value="">Select…</option>
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="Branch Warehouse">Branch Warehouse</option>
                <option value="Transit Warehouse">Transit Warehouse</option>
                <option value="External Warehouse">External Warehouse</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setField('status', e.target.value)} className={inputCls}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Storage Capacity</label>
              <input type="number" step="0.01" value={form.storageCapacity} onChange={(e) => setField('storageCapacity', Number(e.target.value))} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Manager</label>
              <input type="text" value={form.managerName} onChange={(e) => setField('managerName', e.target.value)} className={inputCls} />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Address Line 1</label>
              <input type="text" value={form.addressLine1} onChange={(e) => setField('addressLine1', e.target.value)} className={inputCls} />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Address Line 2</label>
              <input type="text" value={form.addressLine2} onChange={(e) => setField('addressLine2', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
              <input type="text" value={form.city} onChange={(e) => setField('city', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
              <input type="text" value={form.state} onChange={(e) => setField('state', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Postal Code</label>
              <input type="text" value={form.postalCode} onChange={(e) => setField('postalCode', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
              <input type="text" value={form.country} onChange={(e) => setField('country', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Contact Person</label>
              <input type="text" value={form.contactPerson} onChange={(e) => setField('contactPerson', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => setField('phone', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/inventory/warehouse')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
