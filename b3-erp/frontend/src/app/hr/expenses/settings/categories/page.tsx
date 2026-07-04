'use client';

import { useState, useEffect } from 'react';
import { HrPagesService } from '@/services/hr-pages.service';
import { List, Plus, Edit2, Trash2, X, Check, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  requiresReceipt: boolean;
  requiresApproval: boolean;
  maxAmount: number | null;
  isActive: boolean;
  usageCount: number;
}

export default function ExpenseCategoriesPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const rows = await HrPagesService.expenseBudgets<any[]>();
        if (!cancelled) setCategories(Array.isArray(rows) ? (rows as any) : []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load data');
          setCategories([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [formData, setFormData] = useState<Partial<ExpenseCategory>>({
    name: '',
    description: '',
    requiresReceipt: true,
    requiresApproval: false,
    maxAmount: null,
    isActive: true
  });

  const handleAdd = () => {
    setFormData({
      name: '',
      description: '',
      requiresReceipt: true,
      requiresApproval: false,
      maxAmount: null,
      isActive: true
    });
    setShowAddModal(true);
  };

  const handleEdit = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setFormData(category);
    setShowEditModal(true);
  };

  const handleDelete = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleSaveAdd = () => {
    if (!formData.name || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newCategory: ExpenseCategory = {
      id: `cat-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      requiresReceipt: formData.requiresReceipt || false,
      requiresApproval: formData.requiresApproval || false,
      maxAmount: formData.maxAmount || null,
      isActive: formData.isActive !== undefined ? formData.isActive : true,
      usageCount: 0
    };

    setCategories([...categories, newCategory]);
    setShowAddModal(false);
    toast({
      title: "Category Added",
      description: `${newCategory.name} has been created successfully`
    });
  };

  const handleSaveEdit = () => {
    if (!selectedCategory || !formData.name || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setCategories(categories.map(cat =>
      cat.id === selectedCategory.id
        ? { ...cat, ...formData }
        : cat
    ));

    setShowEditModal(false);
    toast({
      title: "Category Updated",
      description: `${formData.name} has been updated successfully`
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedCategory) return;

    if (selectedCategory.usageCount > 0) {
      toast({
        title: "Cannot Delete",
        description: `This category has ${selectedCategory.usageCount} expenses. Deactivate instead.`,
        variant: "destructive"
      });
      setShowDeleteModal(false);
      return;
    }

    setCategories(categories.filter(cat => cat.id !== selectedCategory.id));
    setShowDeleteModal(false);
    toast({
      title: "Category Deleted",
      description: `${selectedCategory.name} has been deleted`
    });
  };

  const toggleActive = (category: ExpenseCategory) => {
    setCategories(categories.map(cat =>
      cat.id === category.id
        ? { ...cat, isActive: !cat.isActive }
        : cat
    ));

    toast({
      title: category.isActive ? "Category Deactivated" : "Category Activated",
      description: `${category.name} is now ${category.isActive ? 'inactive' : 'active'}`
    });
  };

  const CategoryModal = ({ title, onSave, onClose }: { title: string; onSave: () => void; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="border-b border-gray-200 px-3 py-2 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Name*</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Travel, Meals, Supplies"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description*</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Describe what expenses fall under this category"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Amount (₹)</label>
            <input
              type="number"
              value={formData.maxAmount || ''}
              onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Leave empty for no limit"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requiresReceipt}
                onChange={(e) => setFormData({ ...formData, requiresReceipt: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Requires Receipt</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requiresApproval}
                onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Requires Approval</span>
            </label>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Active Category</span>
          </label>
        </div>

        <div className="border-t border-gray-200 px-3 py-2 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Save Category
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full px-3 py-2">
      <div className="mb-3 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <List className="h-7 w-7 text-purple-600" />
            Expense Categories
          </h1>
          <p className="text-sm text-gray-600 mt-1">Manage expense categories and rules</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 font-medium"
        >
          <Plus className="h-5 w-5" />
          Add Category
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-3">
          <div className="text-sm text-purple-700">Total Categories</div>
          <div className="text-3xl font-bold text-purple-900 mt-1">{categories.length}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-3">
          <div className="text-sm text-green-700">Active</div>
          <div className="text-3xl font-bold text-green-900 mt-1">{categories.filter(c => c.isActive).length}</div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="text-sm text-gray-700">Inactive</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{categories.filter(c => !c.isActive).length}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-3">
          <div className="text-sm text-blue-700">Total Usage</div>
          <div className="text-3xl font-bold text-blue-900 mt-1">{categories.reduce((sum, c) => sum + c.usageCount, 0)}</div>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Max Amount</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rules</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-700 max-w-xs truncate">{category.description}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-900">
                      {category.maxAmount ? `₹${category.maxAmount.toLocaleString('en-IN')}` : 'No limit'}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      {category.requiresReceipt && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Receipt</span>
                      )}
                      {category.requiresApproval && (
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">Approval</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm text-gray-700">{category.usageCount} expenses</div>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => toggleActive(category)}
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        category.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                        disabled={category.usageCount > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-purple-900 mb-1">Category Management Guidelines</h3>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Categories with existing expenses cannot be deleted, only deactivated</li>
              <li>• Requires Receipt: Employees must attach receipt to claim expenses</li>
              <li>• Requires Approval: Expenses need manager approval before processing</li>
              <li>• Max Amount: System will flag expenses exceeding this limit</li>
              <li>• Inactive categories won't appear in expense submission form</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <CategoryModal
          title="Add New Category"
          onSave={handleSaveAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showEditModal && (
        <CategoryModal
          title="Edit Category"
          onSave={handleSaveEdit}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start gap-3">
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Category</h3>
                  <p className="text-sm text-gray-700">
                    Are you sure you want to delete "{selectedCategory.name}"?
                  </p>
                  {selectedCategory.usageCount > 0 && (
                    <p className="text-sm text-red-600 mt-2">
                      This category has {selectedCategory.usageCount} expenses and cannot be deleted.
                      Please deactivate it instead.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 px-3 py-2 flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              {selectedCategory.usageCount === 0 && (
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
