'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { VendorComparisonMatrix, type ComparisonVendor } from '@/components/procurement/VendorComparisonMatrix';
import { procurementPagesService } from '@/services/procurement-pages.service';

export default function VendorComparisonPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<ComparisonVendor[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await procurementPagesService.getVendors();
        if (cancelled || !Array.isArray(rows)) return;
        const mapped: ComparisonVendor[] = rows.map((v: any) => {
          const addr = Array.isArray(v.addresses) ? v.addresses[0] : v.addresses;
          const cats = Array.isArray(v.categories) ? v.categories : [];
          const rating = Number(v.rating) || 0;
          return {
            id: v.id,
            name: v.tradeName || v.legalName || v.vendorCode || 'Vendor',
            location: addr ? [addr.city, addr.state].filter(Boolean).join(', ') : '',
            category: typeof cats[0] === 'string' ? cats[0] : cats[0]?.name || 'General',
            overallScore: Math.round(rating * 20),
            isPreferred: v.status === 'active' && rating >= 4,
            lastOrderDate: v.lastOrderDate || undefined,
            totalSpend: Number(v.totalSpendYTD) || 0,
            metrics: {
              price: 0,
              priceUnit: 'per unit',
              leadTime: 0,
              leadTimeUnit: 'days',
              qualityScore: Math.round(rating * 20),
              deliveryReliability: Math.round(rating * 20),
              financialStability: rating >= 4 ? 'A' : rating >= 3 ? 'B' : rating >= 2 ? 'C' : 'D',
              certifications: Array.isArray(v.certifications)
                ? v.certifications.map((c: any) => (typeof c === 'string' ? c : c?.name)).filter(Boolean)
                : [],
              paymentTerms: typeof v.paymentTerms === 'string' ? v.paymentTerms : v.paymentTerms?.terms || 'Net 30',
              minimumOrder: 0,
              warrantyPeriod: '—',
              supportLevel: '—',
            },
            strengths: [],
            weaknesses: [],
          };
        });
        setVendors(mapped);
      } catch {
        setVendors([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vendor Comparison Matrix</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Side-by-side vendor analysis with key metrics and certifications</p>
          </div>
        </div>
      </div>

      {/* Vendor Comparison Component */}
      <div className="p-6">
        <VendorComparisonMatrix
          {...(vendors.length > 0 ? { vendors } : {})}
          onVendorSelect={(vendorId) => router.push(`/procurement/vendors/${vendorId}`)}
          onRequestQuote={(vendorId) => router.push(`/procurement/rfq/create?vendorId=${vendorId}`)}
          onViewDetails={(vendorId) => router.push(`/procurement/vendors/${vendorId}`)}
        />
      </div>
    </div>
  );
}
