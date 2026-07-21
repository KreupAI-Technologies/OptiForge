'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    Tag, Plus, Search, Filter, Edit2, Trash2, MoreVertical,
    Users, TrendingUp, DollarSign, Percent, Calendar, Shield,
    CheckCircle2, XCircle, AlertCircle, Award, Star, Target,
    Package
} from 'lucide-react';
import { commonMastersService, VendorCategory } from '@/services/common-masters.service';

export default function VendorCategoryMaster() {
    const [categories, setCategories] = useState<VendorCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<VendorCategory | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setIsLoading(true);
            const data = await commonMastersService.getAllVendorCategories();
            setCategories(data);
        } catch (error) {
            console.error('Failed to load vendor categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const companyId = 'MAIN_COMPANY_ID';

    const handleEdit = (category: VendorCategory) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await commonMastersService.deleteVendorCategory(id);
            await loadCategories();
        } catch (error) {
            console.error('Failed to delete vendor category:', error);
            alert('Failed to delete vendor category.');
        }
    };

    const handleSave = async (form: HTMLFormElement) => {
        const fd = new FormData(form);
        const name = String(fd.get('name') || '').trim();
        const description = String(fd.get('description') || '').trim();
        if (!name) {
            alert('Category name is required.');
            return;
        }
        try {
            if (selectedCategory) {
                await commonMastersService.updateVendorCategory(selectedCategory.id, { name, description });
            } else {
                await commonMastersService.createVendorCategory({ name, description, companyId });
            }
            setIsModalOpen(false);
            await loadCategories();
        } catch (error) {
            console.error('Failed to save vendor category:', error);
            alert('Failed to save vendor category.');
        }
    };

    const filteredCategories = useMemo(() => {
        return categories.filter(category => {
            const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'All' ||
                (filterStatus === 'Active' && category.isActive) ||
                (filterStatus === 'Inactive' && !category.isActive);
            return matchesSearch && matchesStatus;
        });
    }, [categories, searchTerm, filterStatus]);

    return (
        <div className="p-6 ">
            <div className="mb-3">
                <h2 className="text-2xl font-bold mb-2">Vendor Category Master</h2>
                <p className="text-gray-600">Define and manage vendor classification categories</p>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                        <div className="flex flex-1 gap-2">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="All">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedCategory(null);
                                setIsModalOpen(true);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Category
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCategories.map((category) => (
                                <tr key={category.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
                                                <Package className="h-4 w-4" />
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-gray-500">{category.description || '-'}</td>
                                    <td className="px-3 py-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {category.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-800">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-800">
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            {selectedCategory ? 'Edit Vendor Category' : 'Add New Vendor Category'}
                        </h3>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSave(e.currentTarget);
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    defaultValue={selectedCategory?.name}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter category name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    defaultValue={selectedCategory?.description || ''}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Enter description"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Save Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
