'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Barcode, Plus, Search, Edit3, Trash2, CheckCircle, Scan, Download, X } from 'lucide-react';
import { commonMastersService, Barcode as ApiBarcode } from '@/services/common-masters.service';

const DEFAULT_COMPANY_ID = 'default-company-id';

const BARCODE_TYPES = ['EAN13', 'UPC', 'CODE128', 'CODE39', 'QR', 'DATAMATRIX'];

interface BarcodeEntry {
  id: string;
  barcodeNumber: string;
  barcodeType: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  status: 'active' | 'inactive';
  description?: string;
}

interface ItemOption {
  id: string;
  code: string;
  name: string;
}

interface FormState {
  code: string;
  itemId: string;
  barcodeType: string;
  description: string;
}

const EMPTY_FORM: FormState = { code: '', itemId: '', barcodeType: 'EAN13', description: '' };

const mapApiBarcode = (b: ApiBarcode): BarcodeEntry => ({
  id: b.id,
  barcodeNumber: b.code,
  barcodeType: b.barcodeType || 'EAN13',
  itemId: b.itemId,
  itemCode: b.item?.code || '',
  itemName: b.item?.name || '',
  status: b.isActive ? 'active' : 'inactive',
  description: b.description || undefined,
});

const BarcodeMaster: React.FC = () => {
  const [barcodes, setBarcodes] = useState<BarcodeEntry[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const loadBarcodes = async () => {
    try {
      setIsLoading(true);
      const data = await commonMastersService.getAllBarcodes(DEFAULT_COMPANY_ID);
      setBarcodes(data.map(mapApiBarcode));
    } catch (e) {
      console.error('Failed to load barcodes:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      setItems(await commonMastersService.getItems(DEFAULT_COMPANY_ID));
    } catch (e) {
      console.error('Failed to load items:', e);
    }
  };

  useEffect(() => {
    loadBarcodes();
    loadItems();
  }, []);

  const filteredBarcodes = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return barcodes.filter(b =>
      b.barcodeNumber.toLowerCase().includes(q) ||
      b.itemName.toLowerCase().includes(q) ||
      b.itemCode.toLowerCase().includes(q)
    );
  }, [barcodes, searchTerm]);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      EAN13: 'bg-blue-100 text-blue-800',
      UPC: 'bg-green-100 text-green-800',
      CODE128: 'bg-purple-100 text-purple-800',
      CODE39: 'bg-yellow-100 text-yellow-800',
      QR: 'bg-pink-100 text-pink-800',
      DATAMATRIX: 'bg-indigo-100 text-indigo-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setIsModalOpen(true);
  };

  const openEdit = (b: BarcodeEntry) => {
    setEditingId(b.id);
    setForm({ code: b.barcodeNumber, itemId: b.itemId, barcodeType: b.barcodeType, description: b.description || '' });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) { setError('Barcode value is required.'); return; }
    if (!editingId && !form.itemId) { setError('Please select an item to link.'); return; }
    try {
      if (editingId) {
        await commonMastersService.updateBarcode(editingId, {
          code: form.code.trim(),
          barcodeType: form.barcodeType,
          description: form.description || undefined,
        });
      } else {
        await commonMastersService.createBarcode({
          code: form.code.trim(),
          itemId: form.itemId,
          companyId: DEFAULT_COMPANY_ID,
          barcodeType: form.barcodeType,
          description: form.description || undefined,
        });
      }
      setIsModalOpen(false);
      await loadBarcodes();
    } catch (e: any) {
      console.error('Failed to save barcode:', e);
      setError(e?.message || 'Failed to save barcode.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this barcode?')) return;
    try {
      await commonMastersService.deleteBarcode(id);
      await loadBarcodes();
    } catch (e) {
      console.error('Failed to delete barcode:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="">
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Barcode className="w-8 h-8 text-blue-600" />
                Barcode Master
              </h1>
              <p className="text-gray-600 mt-2">Manage product barcodes and QR codes</p>
            </div>
            <div className="flex gap-3">
              <button onClick={openCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Generate Barcode
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by barcode, item code, or item name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Barcodes</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{barcodes.length}</p>
              </div>
              <Barcode className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Barcodes</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {barcodes.filter(b => b.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Linked Items</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {new Set(barcodes.map(b => b.itemId)).size}
                </p>
              </div>
              <Scan className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Barcodes List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Barcode</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="px-3 py-10 text-center text-gray-400">Loading…</td></tr>
              ) : filteredBarcodes.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-10 text-center text-gray-400">No barcodes found.</td></tr>
              ) : filteredBarcodes.map(barcode => (
                <tr key={barcode.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <Barcode className="w-8 h-8 text-gray-400" />
                      <div className="font-mono font-medium text-gray-900">{barcode.barcodeNumber}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(barcode.barcodeType)}`}>
                      {barcode.barcodeType}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">{barcode.itemName || '—'}</div>
                    <div className="text-xs text-gray-500">{barcode.itemCode}</div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-500">{barcode.description || '—'}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      barcode.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {barcode.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(barcode)} className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <Edit3 className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Edit</span>
                      </button>
                      <button onClick={() => handleDelete(barcode.id)} className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-red-50 text-sm">
                        <Trash2 className="w-4 h-4 text-red-600" />
                        <span className="text-red-700">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-lg font-semibold">{editingId ? 'Edit Barcode' : 'Generate Barcode'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 px-5 py-4">
              {error && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Barcode Value *</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. 8901234567890"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={form.barcodeType}
                  onChange={(e) => setForm({ ...form, barcodeType: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {BARCODE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Linked Item {editingId ? '' : '*'}</label>
                <select
                  value={form.itemId}
                  onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                  disabled={!!editingId}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                >
                  <option value="">Select an item…</option>
                  {items.map((it) => <option key={it.id} value={it.id}>{it.code} — {it.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t px-5 py-4">
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSave} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                {editingId ? 'Save Changes' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeMaster;
