'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, Loader2, FileSearch } from 'lucide-react';
import {
  GoodsReceiptMatching,
  type ThreeWayMatch,
  type MatchingResult,
  type MatchStatus,
} from '@/components/procurement/GoodsReceiptMatching';
import { procurementPurchaseInvoiceService } from '@/services/procurement-purchase-invoice.service';

// ---- Defensive transforms: backend PurchaseInvoice + 3-way-match result -> ThreeWayMatch view model ----

const num = (v: unknown): number => {
  const n = typeof v === 'string' ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? (n as number) : 0;
};

const dateStr = (v: unknown): string => (v ? String(v).slice(0, 10) : '');

// Maps backend MatchingStatus enum + variance/exception hints onto the component's MatchStatus vocabulary.
const toMatchStatus = (raw?: string, isMatched?: boolean): MatchStatus => {
  const s = (raw || '').toLowerCase();
  if (s.includes('mismatch') || s.includes('reject')) return 'mismatch';
  if (s.includes('exception') || s.includes('variance') || s.includes('exceeded')) return 'exception';
  if (s.includes('partial') || s.includes('2-way') || s.includes('two')) return 'partial';
  if (isMatched || s.includes('3-way') || s.includes('three') || s.includes('matched')) return 'matched';
  return 'pending';
};

// Builds the ThreeWayMatch the GoodsReceiptMatching component renders from a raw backend invoice
// (which carries items[], goodsReceipts[], purchaseOrderNumber, etc.) plus the 3-way-match response.
const buildMatch = (invoice: any, matchResult: any): ThreeWayMatch => {
  const rawItems: any[] = Array.isArray(invoice?.items) ? invoice.items : [];
  const grn = Array.isArray(invoice?.goodsReceipts) && invoice.goodsReceipts.length > 0
    ? invoice.goodsReceipts[0]
    : undefined;

  const overallStatus = toMatchStatus(
    matchResult?.matchingDetails?.matchingStatus ?? invoice?.matchingStatus,
    matchResult?.matchingDetails?.isMatched ?? invoice?.isMatched,
  );

  // Per-line variances/exceptions if the backend returned any, keyed by line number for lookup.
  const variances: any[] = Array.isArray(matchResult?.matchingDetails?.variances)
    ? matchResult.matchingDetails.variances
    : [];
  const exceptions: any[] = Array.isArray(matchResult?.matchingDetails?.exceptions)
    ? matchResult.matchingDetails.exceptions
    : [];

  const matchingResults: MatchingResult[] = rawItems.map((it, idx) => {
    const lineNumber = num(it?.lineNumber) || idx + 1;
    const invoiceQty = num(it?.invoicedQuantity);
    const poQty = num(it?.orderedQuantity ?? it?.invoicedQuantity);
    const grQty = num(it?.receivedQuantity ?? it?.invoicedQuantity);
    const poPrice = num(it?.netUnitPrice ?? it?.unitPrice);
    const invoicePrice = num(it?.unitPrice);

    const qtyVar = invoiceQty - grQty;
    const priceVar = invoicePrice - poPrice;
    const totalVar = num(it?.totalAmount ?? it?.lineTotal) - poPrice * poQty;

    const lineIssues = [
      ...variances.filter((v: any) => num(v?.lineNumber) === lineNumber),
      ...exceptions.filter((e: any) => num(e?.lineNumber) === lineNumber),
    ]
      .map((x: any) => x?.description ?? x?.message)
      .filter(Boolean);

    let status: MatchStatus = 'matched';
    if (lineIssues.length > 0 || Math.abs(priceVar) > 0.001) status = 'exception';
    if (Math.abs(qtyVar) > 0.001) status = 'mismatch';

    return {
      lineNumber,
      itemCode: it?.itemCode || it?.itemId || `LINE-${lineNumber}`,
      description: it?.itemName || it?.description || '',
      poQty,
      grQty,
      invoiceQty,
      poPrice,
      invoicePrice,
      status,
      variance: { quantity: qtyVar, price: priceVar, total: totalVar },
      issues: lineIssues,
    };
  });

  return {
    id: invoice?.internalInvoiceNumber || invoice?.id || 'MATCH',
    overallStatus,
    tolerance: { quantity: 5, price: 2 },
    createdAt: invoice?.createdAt || new Date().toISOString(),
    purchaseOrder: {
      id: invoice?.purchaseOrderId || '',
      number: invoice?.purchaseOrderNumber || '—',
      date: dateStr(invoice?.purchaseOrderDate),
      vendor: invoice?.vendorName || '',
      currency: invoice?.currency || 'USD',
      totalAmount: num(invoice?.subtotal ?? invoice?.totalAmount),
      lines: rawItems.map((it, idx) => ({
        lineNumber: num(it?.lineNumber) || idx + 1,
        itemCode: it?.itemCode || it?.itemId || '',
        description: it?.itemName || it?.description || '',
        quantity: num(it?.orderedQuantity ?? it?.invoicedQuantity),
        unitPrice: num(it?.netUnitPrice ?? it?.unitPrice),
        totalAmount: num(it?.totalAmount ?? it?.lineTotal),
        uom: it?.uom || 'EA',
      })),
    },
    goodsReceipt: {
      id: grn?.grnId || '',
      number: grn?.grnNumber || '—',
      date: dateStr(grn?.grnDate),
      receivedBy: invoice?.receivedByName || '',
      totalAmount: num(grn?.amount ?? invoice?.totalAmount),
      lines: rawItems.map((it, idx) => {
        const receivedQty = num(it?.receivedQuantity ?? it?.invoicedQuantity);
        return {
          lineNumber: num(it?.lineNumber) || idx + 1,
          itemCode: it?.itemCode || it?.itemId || '',
          description: it?.itemName || it?.description || '',
          quantity: receivedQty,
          unitPrice: num(it?.unitPrice),
          totalAmount: num(it?.totalAmount ?? it?.lineTotal),
          uom: it?.uom || 'EA',
          receivedQty,
          acceptedQty: receivedQty,
          rejectedQty: 0,
        };
      }),
    },
    invoice: {
      id: invoice?.internalInvoiceNumber || invoice?.id || '',
      number: invoice?.vendorInvoiceNumber || invoice?.internalInvoiceNumber || '—',
      date: dateStr(invoice?.invoiceDate),
      dueDate: dateStr(invoice?.dueDate),
      totalAmount: num(invoice?.totalAmount),
      taxAmount: num(invoice?.totalTaxAmount),
      lines: rawItems.map((it, idx) => ({
        lineNumber: num(it?.lineNumber) || idx + 1,
        itemCode: it?.itemCode || it?.itemId || '',
        description: it?.itemName || it?.description || '',
        quantity: num(it?.invoicedQuantity),
        unitPrice: num(it?.unitPrice),
        totalAmount: num(it?.totalAmount ?? it?.lineTotal),
        uom: it?.uom || 'EA',
      })),
    },
    matchingResults,
  };
};

export default function ThreeWayMatchPage() {
  const router = useRouter();
  const [match, setMatch] = useState<ThreeWayMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        // Pick the most recent invoice, then load its detail (carries items/GRN/PO refs) and run the 3-way match.
        const invoices = await procurementPurchaseInvoiceService.getInvoices();
        const first = Array.isArray(invoices) && invoices.length > 0 ? invoices[0] : null;
        if (!first?.id) {
          if (active) setMatch(null);
          return;
        }
        const [detail, matchResult] = await Promise.all([
          procurementPurchaseInvoiceService.getInvoiceById(first.id).catch(() => first),
          procurementPurchaseInvoiceService.performThreeWayMatch(first.id).catch(() => null),
        ]);
        if (active) setMatch(buildMatch(detail ?? first, matchResult));
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load matching data');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">3-Way Matching</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Visual PO-GRN-Invoice matching with variance detection and exception handling</p>
          </div>
        </div>
      </div>

      {/* Goods Receipt Matching Component */}
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500 dark:text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin mb-3" />
            <p className="text-sm">Loading matching data…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Unable to load matching data</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{error}</p>
          </div>
        ) : !match ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FileSearch className="h-8 w-8 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">No invoices to match</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">There are no purchase invoices available for three-way matching.</p>
          </div>
        ) : (
          <GoodsReceiptMatching
            match={match}
            onApprove={(matchId) => {
              console.log('Match approved:', matchId);
            }}
            onReject={(matchId, reason) => {
              console.log('Match rejected:', matchId, reason);
            }}
            onCreateException={(matchId, lineNumbers) => {
              console.log('Exception created:', matchId, lineNumbers);
            }}
            onAdjust={(matchId, adjustments) => {
              console.log('Adjustments made:', matchId, adjustments);
            }}
          />
        )}
      </div>
    </div>
  );
}
