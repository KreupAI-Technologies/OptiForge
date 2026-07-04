'use client';

import React, { useState, useEffect } from 'react';
import { AfterSalesPagesService } from '@/services/after-sales-pages.service';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Edit,
  Download,
  Mail,
  Printer,
  Calendar,
  Package,
  User,
  Phone,
  Building2,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingDown,
  Plus
} from 'lucide-react';

interface WarrantyClaim {
  id: string;
  claimNumber: string;
  dateRaised: string;
  issueDescription: string;
  claimAmount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  approvedAmount?: number;
}

export default function ViewWarrantyPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'details' | 'claims'>('details');

  // Mock Warranty Data
  const warranty = {
    id: params.id,
    warrantyNumber: 'WRN-2025-0001',
    warrantyType: 'Standard',
    status: 'Active',

    // Customer
    customer: {
      id: 'CUST-001',
      name: 'Sharma Kitchens Pvt Ltd',
      phone: '+91-98765-43210',
      email: 'rajesh.sharma@sharmakitchens.com',
      address: '123, MG Road, Koramangala, Bangalore, Karnataka - 560034'
    },

    // Period
    startDate: '2024-06-15',
    endDate: '2025-06-15',
    daysRemaining: 118,
    duration: 12, // months

    // Coverage
    coverage: 'Parts & Labor',
    coverageLimit: 50000,
    deductible: 0,
    remainingCoverage: 68, // percentage

    // Products
    products: [
      {
        id: 'P1',
        productName: 'Commercial Gas Range - 6 Burner',
        serialNumber: 'CGR-2024-123456',
        modelNumber: 'CGR-6B-PRO',
        purchaseDate: '2024-06-10',
        installationDate: '2024-06-15'
      },
      {
        id: 'P2',
        productName: 'Industrial Refrigerator - 4 Door',
        serialNumber: 'IR4D-2024-789012',
        modelNumber: 'IR-4D-COMM',
        purchaseDate: '2024-06-10',
        installationDate: '2024-06-15'
      }
    ],

    // Claims Summary
    claimCount: 3,
    totalClaimValue: 16000,
    approvedClaimValue: 14500,
    pendingClaims: 0,

    // Terms
    coverageInclusions: '• Manufacturing defects and component failures\n• Parts replacement for covered components\n• Labor charges for repairs\n• Emergency service calls\n• Annual preventive maintenance',
    coverageExclusions: '• Consumables and supplies\n• Cosmetic damage\n• Damage due to misuse or negligence\n• Unauthorized modifications\n• Normal wear and tear items',
    claimProcess: '1. Contact service hotline within 24 hours of issue\n2. Technician assessment and diagnosis\n3. Submit claim with photos and assessment report\n4. Claim review within 2 business days\n5. Approved repairs completed by authorized technician',

    // Extended Warranty Info
    isExtended: false,

    createdDate: '2024-06-15',
    lastModified: '2024-12-20'
  };

  // Claims loaded from the after-sales warranty-claims endpoint.
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await AfterSalesPagesService.warrantyClaims(params.id)) as any[];
        const mapped: WarrantyClaim[] = (Array.isArray(raw) ? raw : []).map((r: any) => ({
          id: String(r?.id ?? r?.claimNumber ?? ''),
          claimNumber: r?.claimNumber ?? r?.claimNo ?? String(r?.id ?? ''),
          dateRaised: r?.dateRaised ?? r?.claimDate ?? r?.createdAt ?? '',
          issueDescription: r?.issueDescription ?? r?.faultDescription ?? r?.description ?? '',
          claimAmount: Number(r?.claimAmount ?? r?.oemClaim ?? r?.companyBearing ?? 0) || 0,
          status: (r?.status ?? 'Pending') as WarrantyClaim['status'],
          approvedAmount: r?.approvedAmount != null ? Number(r.approvedAmount) : undefined,
        }));
        if (!cancelled) setClaims(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load claims');
          setClaims([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [params.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Expired': return 'bg-red-100 text-red-700';
      case 'Expiring Soon': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getClaimStatusColor = (status: WarrantyClaim['status']) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Approved': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{warranty.warrantyNumber}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(warranty.status)}`}>
              {warranty.status}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
              {warranty.warrantyType} Warranty
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Valid from {formatDate(warranty.startDate)} to {formatDate(warranty.endDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/after-sales-service/warranties/edit/${warranty.id}`)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4" />
            Download
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Mail className="w-4 h-4" />
            Email
          </button>
        </div>
      </div>

      {/* Coverage Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Days Remaining</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{warranty.daysRemaining}</div>
          <div className="text-xs text-gray-500 mt-1">Expires on {formatDate(warranty.endDate)}</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Claims Filed</span>
            <FileText className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{warranty.claimCount}</div>
          <div className="text-xs text-gray-500 mt-1">{warranty.pendingClaims} pending</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Claim Value</span>
            <TrendingDown className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(warranty.totalClaimValue)}</div>
          <div className="text-xs text-gray-500 mt-1">{formatCurrency(warranty.approvedClaimValue)} approved</div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Remaining Coverage</span>
            <Shield className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{warranty.remainingCoverage}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${warranty.remainingCoverage}%` }} />
          </div>
        </div>
      </div>

      {/* Expiring Soon Alert */}
      {warranty.daysRemaining < 90 && warranty.daysRemaining > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-orange-900">Warranty Expiring Soon</h3>
              <p className="text-sm text-orange-800 mt-1">
                This warranty will expire in {warranty.daysRemaining} days on {formatDate(warranty.endDate)}.
                Contact customer to discuss extended warranty options.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Warranty Details
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'claims'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Claims History ({claims.length})
          </button>
        </div>
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="space-y-3">
          {/* Customer Information */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Customer Name</div>
                    <div className="font-medium text-gray-900">{warranty.customer.name}</div>
                    <div className="text-xs text-gray-500">{warranty.customer.id}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="text-gray-900">{warranty.customer.phone}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="text-gray-900">{warranty.customer.email}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Address</div>
                    <div className="text-gray-900">{warranty.customer.address}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coverage Details */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Coverage Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Coverage Type</span>
                </div>
                <div className="text-gray-900">{warranty.coverage}</div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Coverage Limit</span>
                </div>
                <div className="text-gray-900">
                  {warranty.coverageLimit ? formatCurrency(warranty.coverageLimit) : 'Unlimited'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Per incident</div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Deductible</span>
                </div>
                <div className="text-gray-900">
                  {warranty.deductible ? formatCurrency(warranty.deductible) : 'No Deductible'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Customer pays per claim</div>
              </div>
            </div>
          </div>

          {/* Covered Products */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Covered Products ({warranty.products.length})</h2>
            <div className="space-y-2">
              {warranty.products.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">{product.productName}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Serial Number:</span>
                          <div className="font-medium text-gray-900">{product.serialNumber}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Model:</span>
                          <div className="font-medium text-gray-900">{product.modelNumber}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Purchase Date:</span>
                          <div className="font-medium text-gray-900">{formatDate(product.purchaseDate)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Installation Date:</span>
                          <div className="font-medium text-gray-900">{formatDate(product.installationDate)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Coverage Inclusions
              </h3>
              <div className="text-sm text-gray-700 whitespace-pre-line">{warranty.coverageInclusions}</div>
            </div>

            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                Coverage Exclusions
              </h3>
              <div className="text-sm text-gray-700 whitespace-pre-line">{warranty.coverageExclusions}</div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              Claim Process
            </h3>
            <div className="text-sm text-gray-700 whitespace-pre-line">{warranty.claimProcess}</div>
          </div>
        </div>
      )}

      {/* Claims Tab */}
      {activeTab === 'claims' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Claims History</h2>
              <p className="text-sm text-gray-500 mt-1">All warranty claims filed under this warranty</p>
            </div>
            <button
              onClick={() => router.push(`/after-sales-service/warranties/${warranty.id}/claims/new`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              File New Claim
            </button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Claim #</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date Raised</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Issue Description</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Claim Amount</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Approved Amount</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {claims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                        {claim.claimNumber}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">{formatDate(claim.dateRaised)}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 max-w-md">{claim.issueDescription}</td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(claim.claimAmount)}
                      </td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900 text-right">
                        {claim.approvedAmount ? formatCurrency(claim.approvedAmount) : '-'}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClaimStatusColor(claim.status)}`}>
                          {claim.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => router.push(`/after-sales-service/warranties/claims/${claim.id}`)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {claims.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500">No claims filed yet</p>
                <button
                  onClick={() => router.push(`/after-sales-service/warranties/${warranty.id}/claims/new`)}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  File your first claim
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
