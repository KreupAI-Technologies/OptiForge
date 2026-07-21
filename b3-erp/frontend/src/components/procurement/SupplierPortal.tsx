'use client';

import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, FileText, TrendingUp, CheckCircle, AlertCircle, Clock, Building2, RefreshCw, Settings, Download, Eye, Send, Package, Upload, BarChart3 } from 'lucide-react';
import { procurementPagesService } from '@/services/procurement-pages.service';

export type SupplierStatus = 'active' | 'pending' | 'suspended' | 'inactive';
export type CollaborationType = 'rfq' | 'po' | 'invoice' | 'quality' | 'general';
export type MessageStatus = 'unread' | 'read' | 'responded';

export interface SupplierProfile {
  id: string;
  name: string;
  code: string;
  status: SupplierStatus;
  category: string;
  rating: number;
  totalSpend: number;
  activeOrders: number;
  onTimeDelivery: number;
  qualityScore: number;
  paymentTerms: string;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  lastActivity: string;
}

export interface CollaborationMessage {
  id: string;
  supplierId: string;
  supplierName: string;
  type: CollaborationType;
  subject: string;
  message: string;
  status: MessageStatus;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  respondedAt?: string;
  attachments?: number;
}

export interface SupplierDocument {
  id: string;
  supplierId: string;
  supplierName: string;
  documentType: string;
  fileName: string;
  uploadedAt: string;
  expiryDate?: string;
  status: 'valid' | 'expiring' | 'expired';
  size: string;
}

const SupplierPortal: React.FC = () => {
  const [activeView, setActiveView] = useState<'suppliers' | 'collaboration' | 'documents'>('suppliers');
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  // Supplier profiles derived from real vendor data (procurement/supplier-portal/suppliers).
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);

  // Collaboration messages (procurement/supplier-portal/messages).
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);

  // Supplier documents (procurement/supplier-portal/documents).
  const [documents, setDocuments] = useState<SupplierDocument[]>([]);

  const reloadPortal = React.useCallback(async () => {
    try {
      const [sup, msg, doc] = await Promise.all([
        procurementPagesService.getSupplierPortalSuppliers(),
        procurementPagesService.getSupplierPortalMessages(),
        procurementPagesService.getSupplierPortalDocuments(),
      ]);
      setSuppliers(
        (Array.isArray(sup) ? sup : []).map((s: any): SupplierProfile => ({
          id: String(s?.id ?? ''),
          name: String(s?.name ?? ''),
          code: String(s?.code ?? ''),
          status: (s?.status ?? 'inactive') as SupplierStatus,
          category: String(s?.category ?? ''),
          rating: Number(s?.rating) || 0,
          totalSpend: Number(s?.totalSpend) || 0,
          activeOrders: Number(s?.activeOrders) || 0,
          onTimeDelivery: Number(s?.onTimeDelivery) || 0,
          qualityScore: Number(s?.qualityScore) || 0,
          paymentTerms: String(s?.paymentTerms ?? ''),
          contact: {
            name: String(s?.contact?.name ?? ''),
            email: String(s?.contact?.email ?? ''),
            phone: String(s?.contact?.phone ?? ''),
          },
          lastActivity: String(s?.lastActivity ?? ''),
        })),
      );
      setMessages(
        (Array.isArray(msg) ? msg : []).map((m: any): CollaborationMessage => ({
          id: String(m?.id ?? ''),
          supplierId: String(m?.supplierId ?? ''),
          supplierName: String(m?.supplierName ?? ''),
          type: (m?.type ?? 'general') as CollaborationType,
          subject: String(m?.subject ?? ''),
          message: String(m?.message ?? ''),
          status: (m?.status ?? 'unread') as MessageStatus,
          priority: (m?.priority ?? 'medium') as 'low' | 'medium' | 'high',
          createdAt: m?.createdAt ? String(m.createdAt).slice(0, 16).replace("T", " ") : "",
          respondedAt: m?.respondedAt ? String(m.respondedAt).slice(0, 16).replace("T", " ") : undefined,
          attachments: Number(m?.attachments) || 0,
        })),
      );
      setDocuments(
        (Array.isArray(doc) ? doc : []).map((d: any): SupplierDocument => ({
          id: String(d?.id ?? ''),
          supplierId: String(d?.supplierId ?? ''),
          supplierName: String(d?.supplierName ?? ''),
          documentType: String(d?.documentType ?? ''),
          fileName: String(d?.fileName ?? ''),
          uploadedAt: d?.createdAt ? String(d.createdAt).slice(0, 10) : "",
          expiryDate: d?.expiryDate ? String(d.expiryDate).slice(0, 10) : undefined,
          status: (d?.status ?? 'valid') as SupplierDocument['status'],
          size: String(d?.size ?? ''),
        })),
      );
    } catch (err) {
      console.error('Failed to load supplier portal data:', err);
    }
  }, []);

  useEffect(() => {
    reloadPortal();
  }, [reloadPortal]);

  const getStatusColor = (status: SupplierStatus): string => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMessageStatusColor = (status: MessageStatus): string => {
    switch (status) {
      case 'unread': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-gray-100 text-gray-800';
      case 'responded': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getDocumentStatusColor = (status: string): string => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'expiring': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handler Functions
  const handleViewPOs = (supplier: SupplierProfile) => {
    console.log('Viewing POs for:', supplier.id);

    const mockPOs = [
      { poNumber: 'PO-2025-1245', date: '2025-10-15', amount: 125000, items: 45, status: 'Open', delivery: '2025-10-30' },
      { poNumber: 'PO-2025-1198', date: '2025-10-10', amount: 89500, items: 28, status: 'Delivered', delivery: '2025-10-22' },
      { poNumber: 'PO-2025-1156', date: '2025-10-05', amount: 156000, items: 62, status: 'In Transit', delivery: '2025-10-25' },
      { poNumber: 'PO-2025-1089', date: '2025-09-28', amount: 73200, items: 31, status: 'Completed', delivery: '2025-10-12' },
      { poNumber: 'PO-2025-0987', date: '2025-09-15', amount: 94800, items: 38, status: 'Completed', delivery: '2025-09-30' }
    ];

    alert(`Purchase Orders: ${supplier.name}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSUPPLIER INFORMATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSupplier: ${supplier.name}\nCode: ${supplier.code}\nCategory: ${supplier.category}\nPayment Terms: ${supplier.paymentTerms}\nActive Orders: ${supplier.activeOrders}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPURCHASE ORDERS (Last 90 Days)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${mockPOs.map((po, idx) =>
  `${idx + 1}. ${po.poNumber}\n   Date Issued: ${po.date}\n   Amount: $${po.amount.toLocaleString()}\n   Items: ${po.items} line items\n   Delivery Date: ${po.delivery}\n   Status: ${po.status.toUpperCase()}\n   ${po.status === 'Open' ? '   ⚠️ Action Required: Confirm delivery date' : po.status === 'In Transit' ? '   ✈️ Shipment in progress' : po.status === 'Delivered' ? '   ✓ Awaiting invoice submission' : '   ✓ Closed'}`
).join('\n\n')}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPO SUMMARY\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nTotal POs (90 days): ${mockPOs.length}\nOpen POs: ${mockPOs.filter(po => po.status === 'Open').length}\nIn Transit: ${mockPOs.filter(po => po.status === 'In Transit').length}\nTotal Value: $${mockPOs.reduce((sum, po) => sum + po.amount, 0).toLocaleString()}\nTotal Items: ${mockPOs.reduce((sum, po) => sum + po.items, 0)} line items\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPO ACTIONS AVAILABLE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n• View full PO details and line items\n• Download PO PDF\n• Acknowledge PO receipt\n• Update delivery schedule\n• Submit advanced ship notice (ASN)\n• Request PO modifications\n• Track shipment status\n• Upload shipping documents\n• View payment status\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nNEXT ACTIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${supplier.activeOrders > 0 ? `⏰ PENDING ACTIONS (${supplier.activeOrders} POs):\n- PO-2025-1245: Confirm delivery date by Oct 25\n- PO-2025-1156: Submit ASN before shipment\n- Update tracking for in-transit orders\n\n` : '✓ No pending PO actions\n\n'}RECENT ACTIVITY:\n- Last order received: ${mockPOs[0].date}\n- Last delivery: ${mockPOs.find(po => po.status === 'Completed')?.delivery}\n- On-time delivery rate: ${supplier.onTimeDelivery}%\n\nClick on any PO number to view complete details, line items, specifications, and documents.`);
  };

  const handleSubmitInvoice = (supplier: SupplierProfile) => {
    console.log('Submitting invoice for:', supplier.id);

    const eligiblePOs = ['PO-2025-1198 ($89,500 - Delivered Oct 22)', 'PO-2025-1089 ($73,200 - Delivered Oct 12)', 'PO-2025-0987 ($94,800 - Delivered Sep 30)'];

    alert(`Submit Invoice: ${supplier.name}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSUPPLIER DETAILS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSupplier: ${supplier.name}\nCode: ${supplier.code}\nPayment Terms: ${supplier.paymentTerms}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nINVOICE SUBMISSION FORM\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nREQUIRED INFORMATION:\n\n1. BASIC DETAILS:\n   □ Invoice Number (your reference)\n   □ Invoice Date\n   □ Currency (USD, EUR, etc.)\n   □ Payment Due Date\n\n2. SELECT PURCHASE ORDER:\n   ${eligiblePOs.length > 0 ? `Available POs for invoicing:\n   ${eligiblePOs.map((po, idx) => `${idx + 1}. ${po}`).join('\n   ')}` : 'No completed POs available for invoicing'}\n\n3. LINE ITEMS:\n   □ Match PO line items (auto-populated)\n   □ Quantity delivered\n   □ Unit price (must match PO)\n   □ Total amount per line\n   □ Tax/VAT if applicable\n\n4. ATTACHMENTS:\n   □ Invoice PDF (required)\n   □ Proof of delivery/packing slip\n   □ Quality certificates (if required)\n   □ Shipping documents\n   □ Other supporting documents\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nINVOICE SUBMISSION RULES\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✓ REQUIREMENTS:\n- PO must be fully/partially delivered\n- Invoice amount ≤ PO amount\n- All required documents attached\n- Invoice format: PDF, max 10MB\n- Valid tax ID/VAT number\n\n⚠️ COMMON REJECTION REASONS:\n- Missing PO reference\n- Price mismatch with PO\n- Missing delivery confirmation\n- Incorrect billing details\n- Duplicate invoice number\n- Missing required certificates\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPAYMENT PROCESS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nUpon submission:\n1. VALIDATION (1-2 hours):\n   - Auto-check PO match\n   - Verify pricing\n   - Validate documents\n\n2. REVIEW (2-3 business days):\n   - AP team review\n   - Manager approval (if >$10K)\n   - Resolve any discrepancies\n\n3. PAYMENT (${supplier.paymentTerms}):\n   - Payment scheduled\n   - Email notification sent\n   - Funds transferred via ACH/Wire\n\nPAYMENT TRACKING:\n- Real-time status updates\n- Email notifications at each stage\n- Expected payment date displayed\n- Remittance advice sent\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSUPPORT & ASSISTANCE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nQuestions?\n📧 Email: ap@company.com\n📞 Phone: 1-800-PAY-FAST\n💬 Portal: Live chat (Mon-Fri 9-5 EST)\n\nFor invoice status inquiries:\n- Check "My Invoices" tab\n- Use invoice tracking feature\n- Contact AP team with invoice #\n\nProceed to invoice submission form?`);
  };

  const handleUpdateCatalog = (supplier: SupplierProfile) => {
    console.log('Updating catalog for:', supplier.id);

    alert(`Update Product Catalog: ${supplier.name}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSUPPLIER INFORMATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSupplier: ${supplier.name}\nCode: ${supplier.code}\nCategory: ${supplier.category}\nCurrent Catalog Items: 247\nLast Update: 2025-09-15\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCATALOG UPDATE OPTIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1. ADD NEW PRODUCTS:\n   - Upload product data (Excel/CSV template)\n   - Product name and description\n   - SKU/part number\n   - Category/classification\n   - Unit of measure\n   - Pricing (unit price, MOQ, volume discounts)\n   - Lead time and availability\n   - Specifications and datasheet\n   - Images (up to 5 per product)\n   - Compliance certifications\n\n2. UPDATE EXISTING PRODUCTS:\n   - Search by SKU/name\n   - Modify pricing\n   - Update availability/lead time\n   - Change specifications\n   - Add/update images\n   - Update certifications\n   - Mark as discontinued\n\n3. BULK UPDATE:\n   - Download current catalog (Excel)\n   - Make changes offline\n   - Upload updated file\n   - System validates changes\n   - Review and confirm updates\n\n4. PRICE UPDATES:\n   - Individual product pricing\n   - Category-wide price changes\n   - Volume discount tiers\n   - Promotional pricing (with dates)\n   - Contract-based pricing\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nUPLOAD REQUIREMENTS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nDATA FIELDS (Required*):\n* Product Name\n* SKU/Part Number\n* Category\n* Unit Price\n* Unit of Measure\n* Lead Time (days)\n  Description (500 char max)\n  Manufacturer Part Number\n  Technical Specifications\n  Datasheet URL/PDF\n  Minimum Order Quantity\n  Stock Availability\n\nIMAGE REQUIREMENTS:\n- Format: JPG, PNG\n- Max size: 5MB per image\n- Recommended: 1200x1200px\n- White/transparent background\n- Multiple angles if applicable\n\nDOCUMENT REQUIREMENTS:\n- Datasheets: PDF, max 20MB\n- Certifications: PDF (ISO, RoHS, etc.)\n- Safety data sheets (if applicable)\n- CAD files (optional)\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nAPPROVAL PROCESS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1. SUBMISSION:\n   - Upload catalog updates\n   - System validates format\n   - Check for duplicates/errors\n\n2. AUTO-APPROVAL:\n   ✓ Price updates < 10%\n   ✓ Specification corrections\n   ✓ Image/description updates\n   → APPROVED IMMEDIATELY\n\n3. MANUAL REVIEW (2-3 days):\n   - New product additions\n   - Price increases > 10%\n   - Category changes\n   - Major specification changes\n   → Category Manager Review\n\n4. ACTIVATION:\n   - Approved items go live\n   - Email confirmation sent\n   - Catalog version updated\n   - Buyers notified of changes\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCATALOG FEATURES\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✓ Searchable by buyers\n✓ Filterable by category/specs\n✓ Quick quote requests\n✓ Add to RFQ directly\n✓ Price history tracking\n✓ Automated updates to buyer favorites\n✓ Integration with procurement system\n✓ Analytics: views, quotes, orders\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nHELP & RESOURCES\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📥 Download Excel template\n📚 Catalog management guide (PDF)\n🎥 Video tutorial (12 min)\n💬 Live chat support\n📧 Email: catalog@company.com\n\nBEST PRACTICES:\n- Update catalog monthly\n- Keep descriptions detailed & accurate\n- Use high-quality images\n- Set realistic lead times\n- Include all certifications\n- Respond to buyer questions promptly\n\nProceed to catalog update form?`);
  };

  const handleDownloadDocuments = (supplier: SupplierProfile) => {
    console.log('Downloading documents for:', supplier.id);

    const supplierDocs = documents.filter(doc => doc.supplierId === supplier.id);

    alert(`Download Documents: ${supplier.name}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSUPPLIER DOCUMENTS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${supplierDocs.length > 0 ? supplierDocs.map((doc, idx) =>
  `${idx + 1}. ${doc.documentType}\n   File: ${doc.fileName}\n   Size: ${doc.size}\n   Uploaded: ${doc.uploadedAt}\n   ${doc.expiryDate ? `Expires: ${doc.expiryDate}` : 'No expiry'}\n   Status: ${doc.status.toUpperCase()}\n   ${doc.status === 'expired' ? '❌ RENEWAL REQUIRED' : doc.status === 'expiring' ? '⚠️ EXPIRES SOON' : '✓ Valid'}`
).join('\n\n') : 'No documents on file'}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDOCUMENT CATEGORIES\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1. COMPLIANCE CERTIFICATES:\n   - ISO certifications (9001, 14001, etc.)\n   - Industry-specific certifications\n   - Environmental compliance\n   - Safety certifications\n\n2. LEGAL & TAX:\n   - Business registration\n   - Tax forms (W9, VAT registration)\n   - Insurance certificates\n   - NDA/Contracts\n\n3. QUALITY DOCUMENTS:\n   - Quality assurance plans\n   - Material safety data sheets (MSDS)\n   - Product certifications\n   - Test reports & inspections\n\n4. OPERATIONAL:\n   - Product catalogs\n   - Price lists\n   - Technical specifications\n   - User manuals\n\n5. TRANSACTION DOCUMENTS:\n   - Purchase orders (PDFs)\n   - Invoices and receipts\n   - Shipping documents\n   - Delivery confirmations\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDOWNLOAD OPTIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSINGLE DOWNLOAD:\n□ Select document from list\n□ Click download icon\n□ File downloads immediately\n\nBULK DOWNLOAD:\n□ Select multiple documents (checkboxes)\n□ Click "Download Selected"\n□ ZIP file created and downloaded\n\nDOWNLOAD ALL:\n□ Download complete document package\n□ All supplier documents in one ZIP\n□ Organized by category folders\n\nSCHEDULED REPORTS:\n□ Weekly/monthly document summary\n□ Expiring certificates alert\n□ New documents notification\n□ Automated delivery via email\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nUPLOAD NEW DOCUMENTS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nEasily upload additional documents:\n1. Click "Upload Document"\n2. Select document type/category\n3. Add description and expiry date\n4. Choose file (PDF, max 20MB)\n5. Submit for review\n\nAuto-notifications:\n- Procurement team notified\n- Approval within 1-2 days\n- Certificate expiry reminders (30 days)\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDOCUMENT STATUS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nValid Documents: ${supplierDocs.filter(d => d.status === 'valid').length}\nExpiring Soon: ${supplierDocs.filter(d => d.status === 'expiring').length}\nExpired: ${supplierDocs.filter(d => d.status === 'expired').length}\n\n${supplierDocs.filter(d => d.status === 'expiring' || d.status === 'expired').length > 0 ? `⚠️ ACTION REQUIRED:\n${supplierDocs.filter(d => d.status === 'expiring' || d.status === 'expired').map(d => `- ${d.documentType}: ${d.status === 'expired' ? 'EXPIRED' : 'Expires ' + d.expiryDate}`).join('\n')}\n\nPlease upload renewed certificates to maintain compliance status.` : '✓ All documents are current and valid.'}\n\nSelect documents to download?`);
  };

  const handleMessageBuyer = async (supplier: SupplierProfile) => {
    const subject = window.prompt(`Message to buyer regarding ${supplier.name}\n\nSubject:`);
    if (!subject) return;
    const body = window.prompt('Message body:');
    if (!body) return;
    try {
      await procurementPagesService.createSupplierPortalMessage({
        supplierId: supplier.id,
        supplierName: supplier.name,
        type: 'general',
        subject,
        message: body,
        status: 'unread',
        priority: 'medium',
      });
      await reloadPortal();
      setActiveView('collaboration');
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleViewSupplierProfile = (supplier: SupplierProfile) => {
    console.log('Viewing profile for:', supplier.id);

    alert(`Supplier Profile: ${supplier.name}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCOMPANY INFORMATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSupplier Name: ${supplier.name}\nSupplier Code: ${supplier.code}\nCategory: ${supplier.category}\nStatus: ${supplier.status.toUpperCase()}\nOverall Rating: ${supplier.rating}/5.0 ⭐\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCONTACT INFORMATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nPrimary Contact: ${supplier.contact.name}\nEmail: ${supplier.contact.email}\nPhone: ${supplier.contact.phone}\nLast Activity: ${supplier.lastActivity}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPERFORMANCE METRICS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nOn-Time Delivery: ${supplier.onTimeDelivery}%\nQuality Score: ${supplier.qualityScore}%\nResponsiveness: ${95 + Math.random() * 5}%\nCompliance Rate: ${98 + Math.random() * 2}%\n\nPERFORMANCE TREND:\n${supplier.onTimeDelivery >= 95 ? '📈 Excellent - Consistently exceeding targets' : supplier.onTimeDelivery >= 90 ? '✓ Good - Meeting expectations' : supplier.onTimeDelivery >= 85 ? '⚠️ Fair - Needs improvement' : '❌ Poor - Action required'}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nBUSINESS RELATIONSHIP\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nTotal Spend (YTD): $${supplier.totalSpend.toLocaleString()}\nActive Orders: ${supplier.activeOrders}\nPayment Terms: ${supplier.paymentTerms}\nCredit Limit: $${(supplier.totalSpend * 1.5).toLocaleString()}\n\nRELATIONSHIP TYPE:\n${supplier.totalSpend >= 2000000 ? '⭐ Strategic Partner' : supplier.totalSpend >= 1000000 ? '✓ Preferred Supplier' : '○ Standard Supplier'}\n\nPARTNERSHIP SINCE: 2023-03-15\nCONTRACT STATUS: Active (expires 2026-03-14)\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCAPABILITIES & CERTIFICATIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCertifications:\n✓ ISO 9001:2015 (Quality Management)\n✓ ISO 14001:2015 (Environmental)\n${supplier.category === 'Electronic Components' ? '✓ IPC-A-610 (Electronics)\n✓ RoHS Compliance' : supplier.category === 'Raw Materials' ? '✓ Material certifications\n✓ Safety compliance' : '✓ Industry-specific certs'}\n\nCapabilities:\n- ${supplier.category} manufacturing\n- Just-in-time delivery\n- Custom product development\n- Quality inspection & testing\n- Technical support\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nRECENT ACTIVITY\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nLast 30 Days:\n• Orders placed: ${Math.ceil(supplier.activeOrders / 2)}\n• Invoices submitted: ${Math.ceil(supplier.activeOrders / 3)}\n• Messages exchanged: ${Math.ceil(supplier.activeOrders * 1.5)}\n• Documents uploaded: ${Math.ceil(supplier.activeOrders / 4)}\n• Deliveries completed: ${Math.ceil(supplier.activeOrders / 2.5)}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nQUICK ACTIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n• View all purchase orders\n• Submit new invoice\n• Send message to buyer\n• Update product catalog\n• Download documents\n• View contract details\n• Check payment status\n• Update contact information\n• Request quote\n• View performance scorecard`);
  };

  const handleRefresh = () => {
    void reloadPortal();
  };

  // Real document register upload (metadata record) -> POST + reload.
  const handleUploadDocument = async (supplier?: SupplierProfile) => {
    const target = supplier ?? suppliers[0];
    if (!target) {
      alert('No supplier available to attach a document to.');
      return;
    }
    const documentType = window.prompt('Document type (e.g. ISO 9001 Certificate):');
    if (!documentType) return;
    const fileName = window.prompt('File name (e.g. iso9001.pdf):');
    if (!fileName) return;
    const expiryDate = window.prompt('Expiry date (YYYY-MM-DD, optional):') || undefined;
    try {
      await procurementPagesService.createSupplierPortalDocument({
        supplierId: target.id,
        supplierName: target.name,
        documentType,
        fileName,
        expiryDate,
        status: 'valid',
      });
      await reloadPortal();
      setActiveView('documents');
    } catch (err) {
      console.error('Failed to upload document:', err);
      alert('Failed to upload document. Please try again.');
    }
  };

  const handleSettings = () => {
    console.log('Opening supplier portal settings...');
    alert('Supplier Portal Settings\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n1. NOTIFICATION PREFERENCES\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nEmail Notifications:\n□ New purchase orders\n□ PO modifications/cancellations\n□ Payment processed\n□ Invoice approved/rejected\n□ Message from buyer\n□ Document expiring soon\n□ Performance scorecard updates\n□ System announcements\n\nNotification Frequency:\n○ Real-time (immediate)\n● Daily digest (8 AM)\n○ Weekly summary (Mondays)\n\nNotification Recipients:\n- Add additional email addresses\n- Role-based routing\n- Escalation contacts\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n2. PORTAL APPEARANCE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nDisplay Options:\n□ Dark mode\n□ Compact view\n□ Show/hide metrics dashboard\n□ Default landing page\n□ Items per page (10/25/50/100)\n\nLanguage:\n● English\n○ Spanish\n○ French\n○ German\n○ Chinese\n\nTime Zone: EST (UTC-5)\nDate Format: MM/DD/YYYY\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n3. DOCUMENT MANAGEMENT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nAuto-Upload Settings:\n- Enable automatic catalog sync\n- Schedule: Daily/Weekly/Monthly\n- FTP/SFTP credentials\n- File format: Excel/CSV/XML\n\nDocument Retention:\n- Archive after: 90 days/1 year/2 years\n- Auto-download confirmations\n- Backup to external storage\n\nExpiry Reminders:\n□ 60 days before expiry\n□ 30 days before expiry (default)\n□ 15 days before expiry\n□ 7 days before expiry\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n4. USER ACCESS MANAGEMENT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCurrent Users:\n- ${supplier.contact.name} (Admin)\n- Add additional users\n- Assign roles and permissions\n\nUser Roles:\n- Admin: Full access\n- Finance: Invoices & payments\n- Operations: POs & deliveries\n- Sales: Catalog & messaging\n- View-only: Read access\n\nSecurity:\n□ Require password change every 90 days\n□ Enable two-factor authentication\n□ Session timeout: 30 minutes\n□ IP address restrictions\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n5. INTEGRATION SETTINGS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nAPI Access:\n□ Enable API for system integration\n- Generate API key\n- API documentation\n- Webhook configuration\n- Rate limits\n\nEDI Integration:\n□ Enable EDI transactions\n- EDI partner ID\n- Transaction sets (850, 810, 856)\n- Testing environment\n\nThird-Party Integrations:\n□ Accounting software (QuickBooks, SAP)\n□ Shipping carriers (FedEx, UPS)\n□ Inventory management systems\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n6. CATALOG SETTINGS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nCatalog Display:\n□ Show pricing to all buyers\n□ Show inventory levels\n□ Show lead times\n□ Allow custom quotes\n\nPricing Rules:\n- Volume discount tiers\n- Contract-based pricing\n- Seasonal pricing\n- Promotional periods\n\nUpdate Approval:\n○ Auto-approve all updates\n● Require approval for new products\n○ Require approval for all changes\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n7. PAYMENT & BILLING\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nPayment Methods:\n☑ ACH/Direct deposit (preferred)\n□ Wire transfer\n□ Check\n\nBanking Information:\n- Bank name: [Update]\n- Account number: [Update]\n- Routing number: [Update]\n- Swift code: [Update]\n\nInvoice Preferences:\n- Default payment terms: ${supplier.paymentTerms}\n- Invoice format: PDF/XML\n- Early payment discount: 2% 10 Net 30\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n8. SUPPORT & HELP\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nHelp Resources:\n📚 User guide & tutorials\n🎥 Video training library\n💬 Live chat support\n📧 Email support ticket\n📞 Phone support hotline\n\nFeedback:\n- Submit feature requests\n- Report issues\n- Rate your experience\n\nSave configuration changes?');
  };

  const handleExportData = () => {
    console.log('Exporting supplier portal data...');
    alert('Export Supplier Portal Data\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nEXPORT OPTIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1. PURCHASE ORDERS:\n   - All POs (last 90 days)\n   - Open/active POs only\n   - Completed POs\n   - PO line item details\n   \n   Format: Excel, CSV, PDF\n   Includes: PO number, date, amount, status, line items\n\n2. INVOICES & PAYMENTS:\n   - Invoice history\n   - Payment status and dates\n   - Remittance details\n   - Aging report\n   \n   Format: Excel, CSV, PDF\n   Date range: Configurable\n\n3. PERFORMANCE METRICS:\n   - Delivery performance\n   - Quality scores\n   - Response times\n   - Trend analysis\n   \n   Format: Excel dashboard, PDF report\n   Charts: Timeline, comparisons\n\n4. PRODUCT CATALOG:\n   - Complete catalog export\n   - Pricing information\n   - Inventory levels\n   - Product specifications\n   \n   Format: Excel, CSV, XML\n   Template: Standard/custom\n\n5. COMMUNICATIONS:\n   - Message history\n   - Collaboration threads\n   - Notifications log\n   \n   Format: PDF, CSV\n   Date range: Last 30/60/90 days\n\n6. DOCUMENTS:\n   - All uploaded documents\n   - Certificates and compliance\n   - Organized by category\n   \n   Format: ZIP archive\n   Includes: Original files + index\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSCHEDULED EXPORTS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nAutomate regular exports:\n□ Daily - New POs and changes\n□ Weekly - Invoice summary\n□ Monthly - Performance report\n□ Quarterly - Complete data export\n\nDelivery Method:\n☑ Email attachment\n□ FTP/SFTP upload\n□ API webhook\n□ Cloud storage (Dropbox, Google Drive)\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nCUSTOM EXPORT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSelect data fields:\n☑ Supplier information\n☑ Contact details\n☑ PO information\n☑ Invoice & payment data\n☑ Performance metrics\n□ Communication logs\n□ Document metadata\n\nDate Range: Last 90 days\nFormat: Excel (.xlsx)\nDelivery: Download immediately\n\nProceed with export?');
  };

  const handleViewMessages = () => {
    console.log('Viewing messages...');

    const unreadCount = messages.filter(m => m.status === 'unread').length;

    alert(`Message Center\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nMESSAGE SUMMARY\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nTotal Messages: ${messages.length}\nUnread: ${unreadCount}\nRead: ${messages.filter(m => m.status === 'read').length}\nResponded: ${messages.filter(m => m.status === 'responded').length}\n\nHigh Priority: ${messages.filter(m => m.priority === 'high').length}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nRECENT MESSAGES\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${messages.slice(0, 5).map((msg, idx) =>
  `${idx + 1}. [${msg.type.toUpperCase()}] ${msg.subject}\n   From: ${msg.supplierName}\n   Date: ${msg.createdAt}\n   Status: ${msg.status.toUpperCase()}\n   Priority: ${msg.priority.toUpperCase()}\n   ${msg.attachments ? `📎 ${msg.attachments} attachment(s)` : ''}\n   ${msg.status === 'unread' ? '⚠️ NEEDS ATTENTION' : msg.status === 'responded' ? `✓ Responded ${msg.respondedAt}` : '👁 Read'}`
).join('\n\n')}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nACTIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n• View all messages\n• Compose new message\n• Filter by type/status\n• Search messages\n• Mark all as read\n• Archive old messages\n• Set up message rules`);
  };

  const handleManageDocuments = () => {
    console.log('Managing documents...');

    const validDocs = documents.filter(d => d.status === 'valid').length;
    const expiringDocs = documents.filter(d => d.status === 'expiring').length;
    const expiredDocs = documents.filter(d => d.status === 'expired').length;

    alert(`Document Management Center\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDOCUMENT OVERVIEW\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nTotal Documents: ${documents.length}\n✓ Valid: ${validDocs}\n⚠️ Expiring Soon: ${expiringDocs}\n❌ Expired: ${expiredDocs}\n\nTotal Storage: ${(documents.length * 2.5).toFixed(1)} MB\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDOCUMENT CATEGORIES\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${Array.from(new Set(documents.map(d => d.documentType))).map((type, idx) =>
  `${idx + 1}. ${type}: ${documents.filter(d => d.documentType === type).length} document(s)`
).join('\n')}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nRECENT UPLOADS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${documents.slice(0, 3).map((doc, idx) =>
  `${idx + 1}. ${doc.fileName}\n   Type: ${doc.documentType}\n   Uploaded: ${doc.uploadedAt}\n   Size: ${doc.size}\n   Status: ${doc.status.toUpperCase()}`
).join('\n\n')}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nACTION ITEMS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${expiredDocs > 0 || expiringDocs > 0 ? `❗ ATTENTION REQUIRED:\n${documents.filter(d => d.status === 'expired' || d.status === 'expiring').map(d =>
  `- ${d.documentType}: ${d.status === 'expired' ? 'EXPIRED ' + d.expiryDate : 'Expires ' + d.expiryDate}`
).join('\n')}\n\nPlease upload renewed documents to maintain compliance.\n\n` : '✓ All documents are current.\n\n'}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nQUICK ACTIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n• Upload new document\n• Renew expiring certificate\n• Download all documents\n• View document history\n• Set expiry reminders\n• Organize by category\n• Share with buyer`);
  };

  const handleTrackPerformance = (supplier: SupplierProfile) => {
    console.log('Tracking performance for:', supplier.id);

    alert(`Performance Tracking: ${supplier.name}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPERFORMANCE SCORECARD\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nOVERALL RATING: ${supplier.rating}/5.0 ⭐\n\nKEY METRICS:\n\n1. ON-TIME DELIVERY: ${supplier.onTimeDelivery}%\n   Target: ≥ 95%\n   Trend: ${supplier.onTimeDelivery >= 95 ? '📈 Above target' : supplier.onTimeDelivery >= 90 ? '→ Meeting expectations' : '📉 Below target'}\n   Last 12 months: ${(supplier.onTimeDelivery - 2).toFixed(1)}% → ${supplier.onTimeDelivery}%\n\n2. QUALITY SCORE: ${supplier.qualityScore}%\n   Target: ≥ 98%\n   Defect Rate: ${(100 - supplier.qualityScore).toFixed(1)}%\n   Rejection Rate: ${((100 - supplier.qualityScore) / 2).toFixed(2)}%\n   Returns: ${Math.floor((100 - supplier.qualityScore) * 10)} units (YTD)\n\n3. RESPONSIVENESS: ${(95 + Math.random() * 5).toFixed(1)}%\n   Avg Response Time: 4.2 hours\n   Target: < 8 hours\n   Quote Turnaround: 1.8 days\n   Issue Resolution: 2.3 days\n\n4. COMPLIANCE: ${(98 + Math.random() * 2).toFixed(1)}%\n   Certifications: Up to date\n   Documentation: Complete\n   Safety Records: Excellent\n   Environmental: Compliant\n\n5. COST COMPETITIVENESS: ${(90 + Math.random() * 10).toFixed(1)}%\n   Price vs Market: ${Math.random() > 0.5 ? 'Competitive' : 'Above average'}\n   Cost Savings (YTD): $${(supplier.totalSpend * 0.05).toLocaleString()}\n   Value for Money: High\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPERFORMANCE TRENDS (12 Months)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nOn-Time Delivery:\nQ1: ${(supplier.onTimeDelivery - 3).toFixed(1)}%\nQ2: ${(supplier.onTimeDelivery - 1.5).toFixed(1)}%\nQ3: ${(supplier.onTimeDelivery - 0.5).toFixed(1)}%\nQ4: ${supplier.onTimeDelivery}% (Current)\nTrend: ↗ Improving\n\nQuality Score:\nQ1: ${(supplier.qualityScore - 1).toFixed(1)}%\nQ2: ${(supplier.qualityScore - 0.5).toFixed(1)}%\nQ3: ${supplier.qualityScore}%\nQ4: ${supplier.qualityScore}% (Current)\nTrend: → Stable\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nSTRENGTHS & OPPORTUNITIES\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSTRENGTHS:\n✓ Consistently high quality (${supplier.qualityScore}%)\n✓ Excellent on-time delivery\n✓ Quick response to issues\n✓ Strong technical support\n✓ Competitive pricing\n\nOPPORTUNITIES:\n${supplier.onTimeDelivery < 95 ? '• Improve delivery timeliness\n' : ''}${supplier.qualityScore < 98 ? '• Reduce defect rate\n' : ''}• Expand product offerings\n• Implement EDI for faster processing\n• Offer volume discounts\n• Enhance sustainability practices\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nBUSINESS IMPACT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSpend Analysis:\nTotal Spend (YTD): $${supplier.totalSpend.toLocaleString()}\nOrders Placed: ${supplier.activeOrders * 8}\nAvg Order Value: $${(supplier.totalSpend / (supplier.activeOrders * 8)).toLocaleString()}\nGrowth vs Last Year: +${(15 + Math.random() * 10).toFixed(1)}%\n\nValue Created:\n✓ Cost Savings: $${(supplier.totalSpend * 0.05).toLocaleString()}\n✓ Quality Improvement: ${Math.floor(Math.random() * 50 + 10)} fewer defects\n✓ Lead Time Reduction: ${Math.floor(Math.random() * 5 + 2)} days\n✓ Process Efficiency: +${(10 + Math.random() * 10).toFixed(1)}%\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nRECOMMENDATIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n${supplier.rating >= 4.8 ? '⭐ STRATEGIC PARTNER RECOMMENDATION:\n- Increase business volume\n- Negotiate long-term contract\n- Collaborative product development\n- Preferred supplier status\n- Joint cost reduction initiatives' : supplier.rating >= 4.5 ? '✓ PREFERRED SUPPLIER:\n- Maintain current relationship\n- Explore growth opportunities\n- Address minor performance gaps\n- Annual business review' : '⚠️ DEVELOPMENT NEEDED:\n- Performance improvement plan\n- Quarterly reviews\n- Address quality/delivery issues\n- Consider alternative suppliers'}\n\nNext Review Date: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`);
  };

  const renderSuppliers = () => (
    <div className="space-y-2">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <div className="bg-white p-3 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Suppliers</p>
              <p className="text-2xl font-bold text-gray-900">
                {suppliers.filter(s => s.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spend (YTD)</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(suppliers.reduce((sum, s) => sum + s.totalSpend, 0) / 1000000).toFixed(1)}M
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {suppliers.reduce((sum, s) => sum + s.activeOrders, 0)}
              </p>
            </div>
            <FileText className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. On-Time Delivery</p>
              <p className="text-2xl font-bold text-gray-900">
                {(suppliers.reduce((sum, s) => sum + s.onTimeDelivery, 0) / suppliers.length).toFixed(1)}%
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Supplier List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Supplier</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Rating</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Total Spend</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Active Orders</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">On-Time %</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Quality Score</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Contact</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                        <div className="text-sm text-gray-500">{supplier.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{supplier.category}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(supplier.status)}`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span className="text-sm font-medium text-gray-900">{supplier.rating}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                    ${(supplier.totalSpend / 1000000).toFixed(2)}M
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{supplier.activeOrders}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`text-sm font-medium ${supplier.onTimeDelivery >= 95 ? 'text-green-600' : supplier.onTimeDelivery >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {supplier.onTimeDelivery}%
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`text-sm font-medium ${supplier.qualityScore >= 95 ? 'text-green-600' : supplier.qualityScore >= 90 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {supplier.qualityScore}%
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    <div>{supplier.contact.name}</div>
                    <div className="text-xs">{supplier.contact.email}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewPOs(supplier)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-blue-300 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm transition-colors"
                        title="View Purchase Orders"
                      >
                        <Package className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-700">View POs</span>
                      </button>
                      <button
                        onClick={() => handleSubmitInvoice(supplier)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-green-300 bg-green-50 rounded-lg hover:bg-green-100 text-sm transition-colors"
                        title="Submit Invoice"
                      >
                        <Upload className="w-4 h-4 text-green-600" />
                        <span className="text-green-700">Invoice</span>
                      </button>
                      <button
                        onClick={() => handleUpdateCatalog(supplier)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-purple-300 bg-purple-50 rounded-lg hover:bg-purple-100 text-sm transition-colors"
                        title="Update Catalog"
                      >
                        <FileText className="w-4 h-4 text-purple-600" />
                        <span className="text-purple-700">Catalog</span>
                      </button>
                      <button
                        onClick={() => handleDownloadDocuments(supplier)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 bg-gray-50 rounded-lg hover:bg-gray-100 text-sm transition-colors"
                        title="Download Documents"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleMessageBuyer(supplier)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-amber-300 bg-amber-50 rounded-lg hover:bg-amber-100 text-sm transition-colors"
                        title="Message Buyer"
                      >
                        <Send className="w-4 h-4 text-amber-600" />
                      </button>
                      <button
                        onClick={() => handleTrackPerformance(supplier)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-indigo-300 bg-indigo-50 rounded-lg hover:bg-indigo-100 text-sm transition-colors"
                        title="Track Performance"
                      >
                        <BarChart3 className="w-4 h-4 text-indigo-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCollaboration = () => (
    <div className="space-y-2">
      {/* Message Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread Messages</p>
              <p className="text-2xl font-bold text-gray-900">
                {messages.filter(m => m.status === 'unread').length}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Responded</p>
              <p className="text-2xl font-bold text-gray-900">
                {messages.filter(m => m.status === 'responded').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">
                {messages.filter(m => m.priority === 'high').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="bg-white rounded-lg shadow">
        <div className="divide-y divide-gray-200">
          {messages.map((msg) => (
            <div key={msg.id} className={`p-6 hover:bg-gray-50 ${msg.status === 'unread' ? 'bg-blue-50' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getMessageStatusColor(msg.status)}`}>
                      {msg.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${msg.type === 'rfq' ? 'bg-purple-100 text-purple-800' : msg.type === 'po' ? 'bg-blue-100 text-blue-800' : msg.type === 'quality' ? 'bg-red-100 text-red-800' : msg.type === 'invoice' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {msg.type.toUpperCase()}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor(msg.priority)}`}>
                      {msg.priority} priority
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">{msg.subject}</h4>
                  <p className="text-sm text-gray-600 mb-2">{msg.supplierName}</p>
                  <p className="text-sm text-gray-700 mb-3">{msg.message}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Created: {msg.createdAt}</span>
                    {msg.respondedAt && <span>Responded: {msg.respondedAt}</span>}
                    {msg.attachments && (
                      <span className="flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        {msg.attachments} attachment{msg.attachments > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button
          onClick={() => handleUploadDocument()}
          className="flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </button>
      </div>
      {/* Document Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valid Documents</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(d => d.status === 'valid').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(d => d.status === 'expiring').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(d => d.status === 'expired').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Supplier</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Document Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">File Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Uploaded</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Expiry Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider">Size</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{doc.supplierName}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{doc.documentType}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                      <FileText className="h-4 w-4 mr-1" />
                      {doc.fileName}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{doc.uploadedAt}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {doc.expiryDate || 'N/A'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDocumentStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{doc.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Supplier Portal</h2>
              <p className="text-blue-100">Supplier collaboration, documents, and performance tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleViewMessages()}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="View Messages"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
            </button>
            <button
              onClick={() => handleManageDocuments()}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Manage Documents"
            >
              <FileText className="h-4 w-4" />
              <span>Documents</span>
            </button>
            <button
              onClick={handleExportData}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Export Data"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleSettings}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveView('suppliers')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeView === 'suppliers'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Suppliers</span>
          </div>
        </button>
        <button
          onClick={() => setActiveView('collaboration')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeView === 'collaboration'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Collaboration</span>
          </div>
        </button>
        <button
          onClick={() => setActiveView('documents')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeView === 'documents'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Documents</span>
          </div>
        </button>
      </div>

      {/* Content */}
      {activeView === 'suppliers' && renderSuppliers()}
      {activeView === 'collaboration' && renderCollaboration()}
      {activeView === 'documents' && renderDocuments()}
    </div>
  );
};

export default SupplierPortal;
