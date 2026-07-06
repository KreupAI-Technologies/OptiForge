'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import {
  Shield,
  Save,
  X,
  Plus,
  Trash2,
  Calendar,
  FileText,
  Package,
  User,
  Building2,
  AlertCircle,
  Info,
  Search
} from 'lucide-react';

interface CoveredProduct {
  id: string;
  productName: string;
  serialNumber: string;
  modelNumber: string;
  purchaseDate: string;
  installationDate: string;
}

export default function AddWarrantyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [warrantyType, setWarrantyType] = useState<'Standard' | 'Extended' | 'Manufacturer' | 'Dealer'>('Standard');
  const [warrantyNumber, setWarrantyNumber] = useState('WRN-2025-AUTO');
  const [status, setStatus] = useState<'Active' | 'Draft'>('Draft');

  // Customer Details
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Warranty Period
  const [startDate, setStartDate] = useState('');
  const [warrantyDuration, setWarrantyDuration] = useState('12');
  const [endDate, setEndDate] = useState('');

  // Coverage Details
  const [coverage, setCoverage] = useState<'Parts Only' | 'Labor Only' | 'Parts & Labor' | 'Comprehensive'>('Parts & Labor');
  const [coverageLimit, setCoverageLimit] = useState('');
  const [deductible, setDeductible] = useState('0');

  // Extended Warranty Details
  const [isExtended, setIsExtended] = useState(false);
  const [baseWarrantyNumber, setBaseWarrantyNumber] = useState('');
  const [baseWarrantyEndDate, setBaseWarrantyEndDate] = useState('');

  // Products
  const [coveredProducts, setCoveredProducts] = useState<CoveredProduct[]>([
    {
      id: '1',
      productName: '',
      serialNumber: '',
      modelNumber: '',
      purchaseDate: '',
      installationDate: ''
    }
  ]);

  // Terms
  const [coverageInclusions, setCoverageInclusions] = useState('');
  const [coverageExclusions, setCoverageExclusions] = useState('');
  const [claimProcess, setClaimProcess] = useState('');
  const [notes, setNotes] = useState('');

  // Mock customer list
  const mockCustomers = [
    { id: 'CUST-001', name: 'Sharma Kitchens Pvt Ltd', phone: '+91-98765-43210', email: 'contact@sharmakitchens.com' },
    { id: 'CUST-002', name: 'Prestige Developers', phone: '+91-98765-43211', email: 'info@prestigedev.com' },
    { id: 'CUST-003', name: 'Royal Restaurant Chain', phone: '+91-98765-43212', email: 'admin@royalrest.com' },
  ];

  const addProduct = () => {
    const newProduct: CoveredProduct = {
      id: Date.now().toString(),
      productName: '',
      serialNumber: '',
      modelNumber: '',
      purchaseDate: '',
      installationDate: ''
    };
    setCoveredProducts([...coveredProducts, newProduct]);
  };

  const removeProduct = (id: string) => {
    if (coveredProducts.length > 1) {
      setCoveredProducts(coveredProducts.filter(p => p.id !== id));
    }
  };

  const updateProduct = (id: string, field: keyof CoveredProduct, value: string) => {
    setCoveredProducts(coveredProducts.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const calculateEndDate = (start: string, months: string) => {
    if (!start || !months) return;
    const startDate = new Date(start);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + parseInt(months));
    setEndDate(endDate.toISOString().split('T')[0]);
  };

  React.useEffect(() => {
    calculateEndDate(startDate, warrantyDuration);
  }, [startDate, warrantyDuration]);

  const buildPayload = () => ({
    warrantyType,
    warrantyNumber,
    status,
    customerId,
    customerName,
    customerPhone,
    customerEmail,
    startDate,
    warrantyDuration,
    endDate,
    coverage,
    coverageLimit,
    deductible,
    isExtended,
    baseWarrantyNumber,
    baseWarrantyEndDate,
    coveredProducts,
    coverageInclusions,
    coverageExclusions,
    claimProcess,
    notes,
    createdBy: 'system',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await AfterSalesPagesService.createWarranty(buildPayload());
      router.push('/after-sales-service/warranties');
    } catch (err) {
      console.error('Create failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Register New Warranty</h1>
            <p className="text-sm text-gray-500 mt-1">Register product warranty for customer</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save Warranty'}
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warranty Type <span className="text-red-500">*</span>
              </label>
              <select
                value={warrantyType}
                onChange={(e) => setWarrantyType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Standard">Standard Warranty</option>
                <option value="Extended">Extended Warranty</option>
                <option value="Manufacturer">Manufacturer Warranty</option>
                <option value="Dealer">Dealer Warranty</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warranty Number
              </label>
              <input
                type="text"
                value={warrantyNumber}
                onChange={(e) => setWarrantyNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Auto-generated"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
              </select>
            </div>
          </div>

          {warrantyType === 'Extended' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-900 mb-2">Extended Warranty Details</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-blue-900 mb-1">
                        Base Warranty Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={baseWarrantyNumber}
                        onChange={(e) => setBaseWarrantyNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="WRN-2024-XXXX"
                        required={warrantyType === 'Extended'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-blue-900 mb-1">
                        Base Warranty End Date
                      </label>
                      <input
                        type="date"
                        value={baseWarrantyEndDate}
                        onChange={(e) => setBaseWarrantyEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Customer Information */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Customer Information</h2>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Customer <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type to search customer..."
                required
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              {customerName && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {mockCustomers
                    .filter(c => c.name.toLowerCase().includes(customerName.toLowerCase()))
                    .map(customer => (
                      <div
                        key={customer.id}
                        onClick={() => {
                          setCustomerId(customer.id);
                          setCustomerName(customer.name);
                          setCustomerPhone(customer.phone);
                          setCustomerEmail(customer.email);
                        }}
                        className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        <div className="text-xs text-gray-500">{customer.id} • {customer.phone}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
              <input
                type="text"
                value={customerId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+91-98765-43210"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="customer@example.com"
                required
              />
            </div>
          </div>
        </div>

        {/* Warranty Period */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Warranty Period</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Usually the purchase or installation date</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (months) <span className="text-red-500">*</span>
              </label>
              <select
                value={warrantyDuration}
                onChange={(e) => setWarrantyDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="6">6 Months</option>
                <option value="12">12 Months (1 Year)</option>
                <option value="18">18 Months</option>
                <option value="24">24 Months (2 Years)</option>
                <option value="36">36 Months (3 Years)</option>
                <option value="48">48 Months (4 Years)</option>
                <option value="60">60 Months (5 Years)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Auto-calculated: {formatDate(endDate)}</p>
            </div>
          </div>
        </div>

        {/* Coverage Details */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Coverage Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coverage Type <span className="text-red-500">*</span>
              </label>
              <select
                value={coverage}
                onChange={(e) => setCoverage(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Parts Only">Parts Only</option>
                <option value="Labor Only">Labor Only</option>
                <option value="Parts & Labor">Parts & Labor</option>
                <option value="Comprehensive">Comprehensive (All Inclusive)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coverage Limit (₹)
              </label>
              <input
                type="number"
                value={coverageLimit}
                onChange={(e) => setCoverageLimit(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Leave empty for unlimited"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum claim amount per incident</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deductible (₹)
              </label>
              <input
                type="number"
                value={deductible}
                onChange={(e) => setDeductible(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">Customer pays this amount per claim</p>
            </div>
          </div>
        </div>

        {/* Covered Products */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Covered Products</h2>
            <button
              type="button"
              onClick={addProduct}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          <div className="space-y-2">
            {coveredProducts.map((product, index) => (
              <div key={product.id} className="border border-gray-200 rounded-md p-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Product {index + 1}</span>
                  </div>
                  {coveredProducts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={product.productName}
                      onChange={(e) => updateProduct(product.id, 'productName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Commercial Gas Range - 6 Burner"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Serial Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={product.serialNumber}
                      onChange={(e) => updateProduct(product.id, 'serialNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="SN-123456789"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Model Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={product.modelNumber}
                      onChange={(e) => updateProduct(product.id, 'modelNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="MODEL-XYZ-2024"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Purchase Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={product.purchaseDate}
                      onChange={(e) => updateProduct(product.id, 'purchaseDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Installation Date
                    </label>
                    <input
                      type="date"
                      value={product.installationDate}
                      onChange={(e) => updateProduct(product.id, 'installationDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage Terms */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Coverage Terms & Conditions</h2>

          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Inclusions</label>
              <textarea
                value={coverageInclusions}
                onChange={(e) => setCoverageInclusions(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="List what is covered under this warranty (e.g., manufacturing defects, component failures)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Exclusions</label>
              <textarea
                value={coverageExclusions}
                onChange={(e) => setCoverageExclusions(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="List what is NOT covered (e.g., misuse, wear and tear, unauthorized repairs)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Claim Process</label>
              <textarea
                value={claimProcess}
                onChange={(e) => setClaimProcess(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe the claim filing process and requirements"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Internal notes (not visible to customer)"
              />
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Warranty Registration Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Ensure all product serial numbers are accurately recorded</li>
                <li>Warranty start date is typically the purchase or installation date</li>
                <li>Keep supporting documents (invoice, installation certificate) attached</li>
                <li>Customer will receive warranty certificate via email</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving Warranty...' : 'Save Warranty'}
          </button>
        </div>
      </form>
    </div>
  );
}
