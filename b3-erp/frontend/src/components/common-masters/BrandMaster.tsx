'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Tag, Star, DollarSign, Package, Download, Upload, Grid, List, Building2 } from 'lucide-react';
import { commonMastersService } from '@/services/common-masters.service';
import { pickAndParseCsv } from '@/lib/import';

interface Brand {
  id: string;
  brandCode: string;
  brandName: string;
  category: string;
  status: 'active' | 'inactive' | 'discontinued';
  description: string;
  manufacturer: string;
  origin: string;
  logoUrl?: string;
  website?: string;
  qualityRating: 'premium' | 'standard' | 'economy';
  certifications: string[];
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  marketSegment: 'luxury' | 'mid-range' | 'budget' | 'commercial';
  warranty: {
    period: number;
    unit: 'months' | 'years';
    terms: string;
  };
  salesInfo: {
    totalSales: number;
    itemCount: number;
    averagePrice: number;
    popularityRank: number;
  };
  contactInfo: {
    salesRep: string;
    phone: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const brandCategories = ['Cabinetry', 'Hardware', 'Appliances', 'Countertops', 'Flooring', 'Lighting', 'Plumbing', 'Tools'];
const qualityRatings = ['premium', 'standard', 'economy'];
const marketSegments = ['luxury', 'mid-range', 'budget', 'commercial'];
const origins = ['USA', 'Germany', 'Italy', 'Austria', 'Sweden', 'China', 'Canada', 'Other'];

export default function BrandMaster() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const data = await commonMastersService.getAllBrands();
      setBrands(data as unknown as Brand[]);
    } catch (error) {
      console.error('Failed to load brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const companyId = 'MAIN_COMPANY_ID';

  const handleImport = async () => {
    try {
      const rows = await pickAndParseCsv();
      if (!rows) return;
      if (rows.length === 0) { alert('The selected CSV file has no data rows.'); return; }
      const result = await commonMastersService.bulkCreate('brands', rows, companyId);
      await loadBrands();
      alert(`Import complete: ${result.created} created, ${result.skipped} skipped (of ${result.total} rows).`);
    } catch (error) {
      console.error('Error importing brands:', error);
      alert('Import failed. Please check the CSV format and try again.');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterQuality, setFilterQuality] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeTab, setActiveTab] = useState('basic');

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.brandCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || brand.category === filterCategory;
    const matchesQuality = filterQuality === 'all' || brand.qualityRating === filterQuality;
    const matchesStatus = filterStatus === 'all' || brand.status === filterStatus;

    return matchesSearch && matchesCategory && matchesQuality && matchesStatus;
  });

  const handleAddBrand = () => {
    setEditingBrand(null);
    setShowModal(true);
    setActiveTab('basic');
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setShowModal(true);
    setActiveTab('basic');
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      await commonMastersService.deleteBrand(id);
      await loadBrands();
    } catch (error) {
      console.error('Failed to delete brand:', error);
      alert('Failed to delete brand.');
    }
  };

  const handleSaveBrand = async (brandData: any) => {
    try {
      const isActive = brandData.status ? brandData.status === 'active' : true;
      if (editingBrand) {
        await commonMastersService.updateBrand(editingBrand.id, {
          name: brandData.name,
          isActive,
        });
      } else {
        await commonMastersService.createBrand({
          name: brandData.name,
          companyId,
        });
      }
      setShowModal(false);
      await loadBrands();
    } catch (error) {
      console.error('Failed to save brand:', error);
      alert('Failed to save brand.');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      discontinued: 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`;
  };

  const getQualityBadge = (quality: string) => {
    const colors = {
      premium: 'bg-purple-100 text-purple-800',
      standard: 'bg-blue-100 text-blue-800',
      economy: 'bg-gray-100 text-gray-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[quality as keyof typeof colors]}`;
  };

  const getSegmentBadge = (segment: string) => {
    const colors = {
      luxury: 'bg-yellow-100 text-yellow-800',
      'mid-range': 'bg-blue-100 text-blue-800',
      budget: 'bg-green-100 text-green-800',
      commercial: 'bg-gray-100 text-gray-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[segment as keyof typeof colors]}`;
  };

  return (
    <div className="p-6">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Tag className="w-8 h-8 text-blue-600" />
              Brand Master
            </h1>
            <p className="text-gray-600">Manage brand information and specifications</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleImport} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleAddBrand}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Brand
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {brandCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={filterQuality}
            onChange={(e) => setFilterQuality(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Quality</option>
            {qualityRatings.map(quality => (
              <option key={quality} value={quality}>{quality}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="discontinued">Discontinued</option>
          </select>
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price Range</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Info</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{brand.brandName}</div>
                        <div className="text-sm text-gray-500">{brand.brandCode}</div>
                        <div className="text-sm text-gray-500">{brand.manufacturer}</div>
                        <div className="text-sm text-gray-500">{brand.origin}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{brand.category}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={getQualityBadge(brand.qualityRating)}>
                          {brand.qualityRating}
                        </span>
                        <div className="text-xs text-gray-500">
                          Rank #{brand.salesInfo.popularityRank}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${brand.priceRange.min} - ${brand.priceRange.max}
                      </div>
                      <span className={getSegmentBadge(brand.marketSegment)}>
                        {brand.marketSegment}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${brand.salesInfo.totalSales.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{brand.salesInfo.itemCount} items</div>
                      <div className="text-sm text-gray-500">Avg: ${brand.salesInfo.averagePrice}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={getStatusBadge(brand.status)}>
                        {brand.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditBrand(brand)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                        >
                          <Edit className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">Edit</span>
                        </button>
                        <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                          <Eye className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-700">View</span>
                        </button>
                        <button
                          onClick={() => handleDeleteBrand(brand.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                          <span className="text-red-600">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredBrands.map((brand) => (
            <div key={brand.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{brand.brandName}</h3>
                  <p className="text-sm text-gray-500">{brand.brandCode}</p>
                  <p className="text-sm text-gray-500">{brand.manufacturer}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditBrand(brand)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBrand(brand.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 mb-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{brand.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Origin:</span>
                  <span className="font-medium">{brand.origin}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Price Range:</span>
                  <span className="font-medium">${brand.priceRange.min}-${brand.priceRange.max}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Sales:</span>
                  <span className="font-medium">${brand.salesInfo.totalSales.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={getStatusBadge(brand.status)}>
                  {brand.status}
                </span>
                <span className={getQualityBadge(brand.qualityRating)}>
                  {brand.qualityRating}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <BrandModal
          brand={editingBrand}
          onSave={handleSaveBrand}
          onClose={() => setShowModal(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
}

interface BrandModalProps {
  brand: Brand | null;
  onSave: (brand: any) => void;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

function BrandModal({ brand, onSave, onClose, activeTab, setActiveTab }: BrandModalProps) {
  const [formData, setFormData] = useState({
    brandCode: brand?.brandCode || '',
    brandName: brand?.brandName || '',
    category: brand?.category || '',
    status: brand?.status || 'active',
    description: brand?.description || '',
    manufacturer: brand?.manufacturer || '',
    origin: brand?.origin || '',
    logoUrl: brand?.logoUrl || '',
    website: brand?.website || '',
    qualityRating: brand?.qualityRating || 'standard',
    certifications: brand?.certifications || [],
    priceRange: brand?.priceRange || {
      min: 0,
      max: 0,
      currency: 'USD'
    },
    marketSegment: brand?.marketSegment || 'mid-range',
    warranty: brand?.warranty || {
      period: 1,
      unit: 'years',
      terms: ''
    },
    salesInfo: brand?.salesInfo || {
      totalSales: 0,
      itemCount: 0,
      averagePrice: 0,
      popularityRank: 1
    },
    contactInfo: brand?.contactInfo || {
      salesRep: '',
      phone: '',
      email: ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Tag },
    { id: 'details', label: 'Details', icon: Building2 },
    { id: 'pricing', label: 'Pricing & Market', icon: DollarSign },
    { id: 'sales', label: 'Sales & Contact', icon: Star }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {brand ? 'Edit Brand' : 'Add New Brand'}
          </h2>
        </div>

        <div className="flex border-b border-gray-200">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-96">
          <div className="px-3 py-2">
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand Code</label>
                  <input
                    type="text"
                    value={formData.brandCode}
                    onChange={(e) => setFormData({ ...formData, brandCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {brandCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                  <select
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Origin</option>
                    {origins.map(origin => (
                      <option key={origin} value={origin}>{origin}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quality Rating</label>
                  <select
                    value={formData.qualityRating}
                    onChange={(e) => setFormData({ ...formData, qualityRating: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {qualityRatings.map(rating => (
                      <option key={rating} value={rating}>{rating}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Terms</label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      placeholder="Period"
                      value={formData.warranty.period}
                      onChange={(e) => setFormData({ ...formData, warranty: { ...formData.warranty, period: Number(e.target.value) } })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <select
                      value={formData.warranty.unit}
                      onChange={(e) => setFormData({ ...formData, warranty: { ...formData.warranty, unit: e.target.value as any } })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Terms"
                      value={formData.warranty.terms}
                      onChange={(e) => setFormData({ ...formData, warranty: { ...formData.warranty, terms: e.target.value } })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                  <input
                    type="number"
                    value={formData.priceRange.min}
                    onChange={(e) => setFormData({ ...formData, priceRange: { ...formData.priceRange, min: Number(e.target.value) } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                  <input
                    type="number"
                    value={formData.priceRange.max}
                    onChange={(e) => setFormData({ ...formData, priceRange: { ...formData.priceRange, max: Number(e.target.value) } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={formData.priceRange.currency}
                    onChange={(e) => setFormData({ ...formData, priceRange: { ...formData.priceRange, currency: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Market Segment</label>
                  <select
                    value={formData.marketSegment}
                    onChange={(e) => setFormData({ ...formData, marketSegment: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {marketSegments.map(segment => (
                      <option key={segment} value={segment}>{segment}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'sales' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sales Representative</label>
                  <input
                    type="text"
                    value={formData.contactInfo.salesRep}
                    onChange={(e) => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, salesRep: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.contactInfo.phone}
                    onChange={(e) => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, phone: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(e) => setFormData({ ...formData, contactInfo: { ...formData.contactInfo, email: e.target.value } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Popularity Rank</label>
                  <input
                    type="number"
                    value={formData.salesInfo.popularityRank}
                    onChange={(e) => setFormData({ ...formData, salesInfo: { ...formData.salesInfo, popularityRank: Number(e.target.value) } })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="px-3 py-2 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {brand ? 'Update Brand' : 'Create Brand'}
          </button>
        </div>
      </div>
    </div>
  );
}