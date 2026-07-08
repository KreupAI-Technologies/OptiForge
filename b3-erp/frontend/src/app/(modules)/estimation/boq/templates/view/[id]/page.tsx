'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Edit, Copy, Download, Trash2, Calendar, User, Hash, TrendingUp, AlertCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { exportToCsv } from '@/lib/export';
import { estimationTemplateService } from '@/services/estimation-template.service';

interface TemplateItem {
  id: string;
  itemCode: string;
  description: string;
  category: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  specifications: string;
}

interface TemplateView {
  id: string;
  name: string;
  templateCode: string;
  category: string;
  description: string;
  createdBy: string;
  createdAt: string;
  lastModified: string;
  usageCount: number;
  totalItems: number;
  estimatedValue: number;
  items: TemplateItem[];
}

const mapTemplate = (raw: any): TemplateView => {
  const items: TemplateItem[] = Array.isArray(raw?.items)
    ? raw.items.map((it: any, idx: number) => ({
        id: it?.id ?? String(idx + 1),
        itemCode: it?.itemCode ?? it?.itemNo ?? '',
        description: it?.description ?? '',
        category: it?.category ?? 'Other',
        unit: it?.unit ?? '',
        quantity: Number(it?.quantity ?? 0),
        rate: Number(it?.rate ?? it?.unitRate ?? 0),
        amount: Number(it?.amount ?? it?.totalAmount ?? 0),
        specifications: it?.specifications ?? '',
      }))
    : [];
  const estimatedValue = raw?.estimatedValue != null
    ? Number(raw.estimatedValue)
    : items.reduce((sum, i) => sum + i.amount, 0);
  return {
    id: raw?.id ?? '',
    name: raw?.name ?? '',
    templateCode: raw?.templateCode ?? raw?.code ?? raw?.id ?? '',
    category: raw?.category ?? raw?.templateType ?? 'Other',
    description: raw?.description ?? '',
    createdBy: raw?.createdBy ?? '',
    createdAt: raw?.createdAt ?? raw?.createdDate ?? '',
    lastModified: raw?.updatedAt ?? raw?.lastModified ?? raw?.createdAt ?? '',
    usageCount: Number(raw?.usageCount ?? 0),
    totalItems: raw?.totalItems != null ? Number(raw.totalItems) : items.length,
    estimatedValue,
    items,
  };
};

const formatDate = (value: string) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function ViewBOQTemplate() {
  const router = useRouter();
  const params = useParams();
  const templateId = params?.id as string;

  const [templateData, setTemplateData] = useState<TemplateView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await estimationTemplateService.findTemplateById(templateId);
        if (cancelled) return;
        if (!raw) {
          setTemplateData(null);
        } else {
          setTemplateData(mapTemplate(raw));
        }
      } catch (err) {
        console.error('Error loading template:', err);
        if (!cancelled) setError('Failed to load template. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [templateId]);

  const handleEdit = () => {
    router.push(`/estimation/boq/templates/edit/${templateId}`);
  };

  const handleUse = () => {
    router.push(`/estimation/boq/create?template=${templateId}`);
  };

  const handleExport = () => {
    if (!templateData) return;
    exportToCsv(`boq-template-${templateData.templateCode}`, templateData.items);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }
    setDeleting(true);
    try {
      await estimationTemplateService.deleteBoqTemplate(templateId);
      router.push('/estimation/boq/templates');
    } catch (err) {
      console.error('Error deleting template:', err);
      alert('Failed to delete template. Please try again.');
      setDeleting(false);
    }
  };

  const handleBack = () => {
    router.push('/estimation/boq/templates');
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading template...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 gap-3">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-red-600">{error}</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Back to Templates
        </button>
      </div>
    );
  }

  if (!templateData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 gap-3">
        <p className="text-gray-600">Template not found.</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Back to Templates
        </button>
      </div>
    );
  }

  // Group items by category
  const itemsByCategory = templateData.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, TemplateItem[]>);

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="flex-none bg-white border-b border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{templateData.name}</h1>
              <p className="text-sm text-gray-500 mt-1">{templateData.templateCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUse}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Use Template
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-2 disabled:opacity-60"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <div className="space-y-3">
          {/* Template Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Template Information</h2>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Category</p>
                <p className="text-base font-medium text-gray-900">{templateData.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Items</p>
                <p className="text-base font-medium text-gray-900 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  {templateData.totalItems}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Estimated Value</p>
                <p className="text-base font-medium text-gray-900">
                  ₹{templateData.estimatedValue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Times Used</p>
                <p className="text-base font-medium text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  {templateData.usageCount}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-base text-gray-700">{templateData.description}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-3">
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Created By
                </p>
                <p className="text-base font-medium text-gray-900">{templateData.createdBy || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Created At
                </p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(templateData.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Last Modified
                </p>
                <p className="text-base font-medium text-gray-900">
                  {formatDate(templateData.lastModified)}
                </p>
              </div>
            </div>
          </div>

          {/* BOQ Items by Category */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">BOQ Items</h2>

            {templateData.items.length === 0 && (
              <p className="text-sm text-gray-500 py-6 text-center">
                No items defined for this template.
              </p>
            )}

            {Object.entries(itemsByCategory).map(([category, items]) => (
              <div key={category} className="mb-8 last:mb-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">{category}</h3>
                  <span className="text-sm text-gray-500">
                    {items.length} items · ₹{items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-y border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item Code
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Specifications
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rate (₹)
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {item.itemCode}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {item.specifications}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {item.quantity.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-center">
                            {item.unit}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            {item.rate.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            {item.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 border-t-2 border-gray-300">
                        <td colSpan={6} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                          {category} Subtotal:
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                          ₹{items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ))}

            {/* Grand Total */}
            <div className="mt-6 pt-6 border-t-2 border-gray-300">
              <div className="flex justify-between items-center">
                <div className="text-base font-semibold text-gray-900">
                  Grand Total ({templateData.totalItems} items)
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹{templateData.estimatedValue.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
