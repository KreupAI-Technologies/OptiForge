'use client';

import React from 'react';
import { ArrowLeft, Edit, Copy, Download, Trash2, Calendar, User, Hash, TrendingUp } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { exportToCsv } from '@/lib/export';

// Mock data - would come from API
const templateData = {
  id: '1',
  name: 'Standard Commercial Building',
  templateCode: 'BOQ-TEMP-001',
  category: 'Construction',
  description: 'Comprehensive BOQ template for standard commercial building projects including civil, electrical, and plumbing works.',
  createdBy: 'John Smith',
  createdAt: '2024-01-15',
  lastModified: '2024-03-10',
  usageCount: 24,
  totalItems: 45,
  estimatedValue: 2500000,
  items: [
    {
      id: '1',
      itemCode: 'CIVIL-001',
      description: 'Excavation for foundation',
      category: 'Civil Works',
      unit: 'cu.m',
      quantity: 150,
      rate: 450,
      amount: 67500,
      specifications: 'As per IS 1200 standards',
    },
    {
      id: '2',
      itemCode: 'CIVIL-002',
      description: 'RCC M25 grade concrete for foundation',
      category: 'Civil Works',
      unit: 'cu.m',
      quantity: 120,
      rate: 6500,
      amount: 780000,
      specifications: 'As per IS 456:2000',
    },
    {
      id: '3',
      itemCode: 'CIVIL-003',
      description: 'Brick masonry in cement mortar 1:6',
      category: 'Civil Works',
      unit: 'sq.m',
      quantity: 450,
      rate: 850,
      amount: 382500,
      specifications: 'Class A bricks as per IS 1077',
    },
    {
      id: '4',
      itemCode: 'ELEC-001',
      description: 'Main electrical panel 400A',
      category: 'Electrical Works',
      unit: 'nos',
      quantity: 1,
      rate: 85000,
      amount: 85000,
      specifications: 'As per IE rules',
    },
    {
      id: '5',
      itemCode: 'ELEC-002',
      description: 'PVC conduit 25mm dia',
      category: 'Electrical Works',
      unit: 'm',
      quantity: 500,
      rate: 120,
      amount: 60000,
      specifications: 'Heavy duty ISI marked',
    },
    {
      id: '6',
      itemCode: 'PLUMB-001',
      description: 'CPVC pipes 20mm dia',
      category: 'Plumbing Works',
      unit: 'm',
      quantity: 300,
      rate: 180,
      amount: 54000,
      specifications: 'Astral/Supreme make',
    },
    {
      id: '7',
      itemCode: 'PLUMB-002',
      description: 'Water storage tank 1000L',
      category: 'Plumbing Works',
      unit: 'nos',
      quantity: 2,
      rate: 15000,
      amount: 30000,
      specifications: 'Sintex/Penguin make',
    },
    {
      id: '8',
      itemCode: 'FINISH-001',
      description: 'Internal wall plastering 12mm thick',
      category: 'Finishing Works',
      unit: 'sq.m',
      quantity: 1200,
      rate: 320,
      amount: 384000,
      specifications: 'Cement mortar 1:4',
    },
    {
      id: '9',
      itemCode: 'FINISH-002',
      description: 'Premium emulsion paint',
      category: 'Finishing Works',
      unit: 'sq.m',
      quantity: 1200,
      rate: 85,
      amount: 102000,
      specifications: 'Asian Paints/Berger',
    },
    {
      id: '10',
      itemCode: 'FINISH-003',
      description: 'Vitrified tiles 600x600mm',
      category: 'Finishing Works',
      unit: 'sq.m',
      quantity: 400,
      rate: 650,
      amount: 260000,
      specifications: 'Johnson/Kajaria make',
    },
  ],
};

export default function ViewBOQTemplate() {
  const router = useRouter();
  const params = useParams();
  const templateId = params?.id as string;

  const handleEdit = () => {
    router.push(`/estimation/boq/templates/edit/${templateId}`);
  };

  const handleUse = () => {
    router.push(`/estimation/boq/create?template=${templateId}`);
  };

  const handleExport = () => {
    exportToCsv(`boq-template-${templateData.templateCode}`, templateData.items);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      console.log('Deleting template:', templateId);
      router.push('/estimation/boq/templates');
    }
  };

  const handleBack = () => {
    router.push('/estimation/boq/templates');
  };

  // Group items by category
  const itemsByCategory = templateData.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof templateData.items>);

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
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
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
                <p className="text-base font-medium text-gray-900">{templateData.createdBy}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Created At
                </p>
                <p className="text-base font-medium text-gray-900">
                  {new Date(templateData.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Last Modified
                </p>
                <p className="text-base font-medium text-gray-900">
                  {new Date(templateData.lastModified).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* BOQ Items by Category */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">BOQ Items</h2>

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
