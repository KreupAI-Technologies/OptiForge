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

interface SupplierPO {
  poNumber: string;
  poDate: string;
  deliveryDate: string;
  status: string;
  totalAmount: number;
  currency: string;
  receivedPercentage: number;
}

interface InvoiceForm {
  invoiceNumber: string;
  poNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: string;
  currency: string;
  notes: string;
}

interface QuoteForm {
  itemName: string;
  reference: string;
  quantity: string;
  unitPrice: string;
  currency: string;
  leadTimeDays: string;
  validUntil: string;
  notes: string;
}

interface CatalogForm {
  sku: string;
  name: string;
  category: string;
  uom: string;
  unitPrice: string;
  currency: string;
  leadTimeDays: string;
  status: string;
}

type ModalKind =
  | { type: 'pos'; supplier: SupplierProfile; pos: SupplierPO[] }
  | { type: 'invoice'; supplier: SupplierProfile }
  | { type: 'quote'; supplier: SupplierProfile }
  | { type: 'catalog'; supplier: SupplierProfile }
  | { type: 'documents'; supplier: SupplierProfile; docs: SupplierDocument[] }
  | { type: 'upload'; supplier: SupplierProfile }
  | { type: 'profile'; supplier: SupplierProfile }
  | { type: 'performance'; supplier: SupplierProfile }
  | { type: 'message'; supplier: SupplierProfile }
  | { type: 'messages' }
  | { type: 'manage-documents' }
  | { type: 'settings' };

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown): string => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
  ].join('\n');
}

function downloadCsv(filename: string, rows: Array<Record<string, unknown>>): void {
  const csv = toCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const SupplierPortal: React.FC = () => {
  const [activeView, setActiveView] = useState<'suppliers' | 'collaboration' | 'documents'>('suppliers');

  // Supplier profiles derived from real vendor data (procurement/supplier-portal/suppliers).
  const [suppliers, setSuppliers] = useState<SupplierProfile[]>([]);

  // Collaboration messages (procurement/supplier-portal/messages).
  const [messages, setMessages] = useState<CollaborationMessage[]>([]);

  // Supplier documents (procurement/supplier-portal/documents).
  const [documents, setDocuments] = useState<SupplierDocument[]>([]);

  // Active modal (view/detail/form). Client-side; no window.alert/prompt.
  const [modal, setModal] = useState<ModalKind | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const emptyInvoice: InvoiceForm = {
    invoiceNumber: '', poNumber: '', invoiceDate: '', dueDate: '', amount: '', currency: 'USD', notes: '',
  };
  const emptyQuote: QuoteForm = {
    itemName: '', reference: '', quantity: '', unitPrice: '', currency: 'USD', leadTimeDays: '', validUntil: '', notes: '',
  };
  const emptyCatalog: CatalogForm = {
    sku: '', name: '', category: '', uom: 'EA', unitPrice: '', currency: 'USD', leadTimeDays: '', status: 'active',
  };
  const [invoiceForm, setInvoiceForm] = useState<InvoiceForm>(emptyInvoice);
  const [quoteForm, setQuoteForm] = useState<QuoteForm>(emptyQuote);
  const [catalogForm, setCatalogForm] = useState<CatalogForm>(emptyCatalog);
  const [messageForm, setMessageForm] = useState<{ subject: string; body: string }>({ subject: '', body: '' });
  const [uploadForm, setUploadForm] = useState<{ documentType: string; fileName: string; expiryDate: string }>({ documentType: '', fileName: '', expiryDate: '' });

  const closeModal = () => {
    setModal(null);
    setFormError(null);
    setSubmitting(false);
  };

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

  // Handler Functions — all open client-side modals or wire to real services.
  const handleViewPOs = async (supplier: SupplierProfile) => {
    setFormError(null);
    try {
      const raw = await procurementPagesService.getSupplierPortalPurchaseOrders(supplier.id);
      const pos: SupplierPO[] = (Array.isArray(raw) ? raw : []).map((p: any): SupplierPO => ({
        poNumber: String(p?.poNumber ?? ''),
        poDate: p?.poDate ? String(p.poDate).slice(0, 10) : '',
        deliveryDate: p?.deliveryDate ? String(p.deliveryDate).slice(0, 10) : '',
        status: String(p?.status ?? ''),
        totalAmount: Number(p?.totalAmount) || 0,
        currency: String(p?.currency ?? 'USD'),
        receivedPercentage: Number(p?.receivedPercentage) || 0,
      }));
      setModal({ type: 'pos', supplier, pos });
    } catch (err) {
      setModal({ type: 'pos', supplier, pos: [] });
      setFormError(err instanceof Error ? err.message : 'Failed to load purchase orders');
    }
  };

  const handleSubmitInvoice = (supplier: SupplierProfile) => {
    setInvoiceForm(emptyInvoice);
    setFormError(null);
    setModal({ type: 'invoice', supplier });
  };

  const submitInvoice = async (supplier: SupplierProfile) => {
    if (!invoiceForm.invoiceNumber.trim() || !invoiceForm.amount.trim()) {
      setFormError('Invoice number and amount are required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await procurementPagesService.createSupplierInvoice({
        supplierId: supplier.id,
        supplierName: supplier.name,
        invoiceNumber: invoiceForm.invoiceNumber.trim(),
        poNumber: invoiceForm.poNumber.trim() || undefined,
        invoiceDate: invoiceForm.invoiceDate || undefined,
        dueDate: invoiceForm.dueDate || undefined,
        amount: Number(invoiceForm.amount) || 0,
        currency: invoiceForm.currency,
        notes: invoiceForm.notes.trim() || undefined,
        status: 'submitted',
      });
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit invoice');
      setSubmitting(false);
    }
  };

  const handleSubmitQuote = (supplier: SupplierProfile) => {
    setQuoteForm(emptyQuote);
    setFormError(null);
    setModal({ type: 'quote', supplier });
  };

  const submitQuote = async (supplier: SupplierProfile) => {
    if (!quoteForm.itemName.trim() || !quoteForm.unitPrice.trim()) {
      setFormError('Item name and unit price are required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await procurementPagesService.createSupplierQuote({
        supplierId: supplier.id,
        supplierName: supplier.name,
        itemName: quoteForm.itemName.trim(),
        reference: quoteForm.reference.trim() || undefined,
        quantity: Number(quoteForm.quantity) || 0,
        unitPrice: Number(quoteForm.unitPrice) || 0,
        currency: quoteForm.currency,
        leadTimeDays: quoteForm.leadTimeDays ? Number(quoteForm.leadTimeDays) : undefined,
        validUntil: quoteForm.validUntil || undefined,
        notes: quoteForm.notes.trim() || undefined,
        status: 'submitted',
      });
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit quote');
      setSubmitting(false);
    }
  };

  const handleUpdateCatalog = (supplier: SupplierProfile) => {
    setCatalogForm(emptyCatalog);
    setFormError(null);
    setModal({ type: 'catalog', supplier });
  };

  const submitCatalog = async (supplier: SupplierProfile) => {
    if (!catalogForm.sku.trim() || !catalogForm.name.trim()) {
      setFormError('SKU and product name are required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await procurementPagesService.upsertSupplierCatalogItem({
        supplierId: supplier.id,
        supplierName: supplier.name,
        sku: catalogForm.sku.trim(),
        name: catalogForm.name.trim(),
        category: catalogForm.category.trim() || undefined,
        uom: catalogForm.uom.trim() || undefined,
        unitPrice: Number(catalogForm.unitPrice) || 0,
        currency: catalogForm.currency,
        leadTimeDays: catalogForm.leadTimeDays ? Number(catalogForm.leadTimeDays) : undefined,
        status: catalogForm.status,
      });
      closeModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update catalog');
      setSubmitting(false);
    }
  };

  const handleDownloadDocuments = async (supplier: SupplierProfile) => {
    setFormError(null);
    try {
      const raw = await procurementPagesService.getSupplierPortalDocuments(supplier.id);
      const docs: SupplierDocument[] = (Array.isArray(raw) ? raw : []).map((d: any): SupplierDocument => ({
        id: String(d?.id ?? ''),
        supplierId: String(d?.supplierId ?? ''),
        supplierName: String(d?.supplierName ?? ''),
        documentType: String(d?.documentType ?? ''),
        fileName: String(d?.fileName ?? ''),
        uploadedAt: d?.createdAt ? String(d.createdAt).slice(0, 10) : '',
        expiryDate: d?.expiryDate ? String(d.expiryDate).slice(0, 10) : undefined,
        status: (d?.status ?? 'valid') as SupplierDocument['status'],
        size: String(d?.size ?? ''),
      }));
      setModal({ type: 'documents', supplier, docs });
    } catch (err) {
      setModal({ type: 'documents', supplier, docs: [] });
      setFormError(err instanceof Error ? err.message : 'Failed to load documents');
    }
  };

  const exportSupplierDocuments = (docs: SupplierDocument[], supplier: SupplierProfile) => {
    downloadCsv(
      `documents-${supplier.code || supplier.id}.csv`,
      docs.map((d) => ({
        documentType: d.documentType,
        fileName: d.fileName,
        uploadedAt: d.uploadedAt,
        expiryDate: d.expiryDate ?? '',
        status: d.status,
        size: d.size,
      })),
    );
  };

  const handleMessageBuyer = (supplier: SupplierProfile) => {
    setMessageForm({ subject: '', body: '' });
    setFormError(null);
    setModal({ type: 'message', supplier });
  };

  const submitMessage = async (supplier: SupplierProfile) => {
    if (!messageForm.subject.trim() || !messageForm.body.trim()) {
      setFormError('Subject and message body are required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await procurementPagesService.createSupplierPortalMessage({
        supplierId: supplier.id,
        supplierName: supplier.name,
        type: 'general',
        subject: messageForm.subject.trim(),
        message: messageForm.body.trim(),
        status: 'unread',
        priority: 'medium',
      });
      await reloadPortal();
      closeModal();
      setActiveView('collaboration');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to send message');
      setSubmitting(false);
    }
  };

  const handleViewSupplierProfile = (supplier: SupplierProfile) => {
    setFormError(null);
    setModal({ type: 'profile', supplier });
  };

  const handleRefresh = () => {
    void reloadPortal();
  };

  // Real document register upload (metadata record) -> POST + reload.
  const handleUploadDocument = (supplier?: SupplierProfile) => {
    const target = supplier ?? suppliers[0];
    if (!target) {
      setFormError('No supplier available to attach a document to.');
      return;
    }
    setUploadForm({ documentType: '', fileName: '', expiryDate: '' });
    setFormError(null);
    setModal({ type: 'upload', supplier: target });
  };

  const submitUpload = async (supplier: SupplierProfile) => {
    if (!uploadForm.documentType.trim() || !uploadForm.fileName.trim()) {
      setFormError('Document type and file name are required.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await procurementPagesService.createSupplierPortalDocument({
        supplierId: supplier.id,
        supplierName: supplier.name,
        documentType: uploadForm.documentType.trim(),
        fileName: uploadForm.fileName.trim(),
        expiryDate: uploadForm.expiryDate || undefined,
        status: 'valid',
      });
      await reloadPortal();
      closeModal();
      setActiveView('documents');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to upload document');
      setSubmitting(false);
    }
  };

  const handleSettings = () => {
    setFormError(null);
    setModal({ type: 'settings' });
  };

  const handleExportData = () => {
    // Export the live portal dataset (suppliers) to CSV, client-side.
    downloadCsv(
      'supplier-portal-suppliers.csv',
      suppliers.map((s) => ({
        name: s.name,
        code: s.code,
        category: s.category,
        status: s.status,
        rating: s.rating,
        totalSpend: s.totalSpend,
        activeOrders: s.activeOrders,
        onTimeDelivery: s.onTimeDelivery,
        qualityScore: s.qualityScore,
        paymentTerms: s.paymentTerms,
        contactName: s.contact.name,
        contactEmail: s.contact.email,
        lastActivity: s.lastActivity,
      })),
    );
  };

  const handleViewMessages = () => {
    setFormError(null);
    setModal({ type: 'messages' });
  };

  const handleManageDocuments = () => {
    setFormError(null);
    setModal({ type: 'manage-documents' });
  };

  const handleTrackPerformance = (supplier: SupplierProfile) => {
    setFormError(null);
    setModal({ type: 'performance', supplier });
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
                        onClick={() => handleSubmitQuote(supplier)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-teal-300 bg-teal-50 rounded-lg hover:bg-teal-100 text-sm transition-colors"
                        title="Submit Quote"
                      >
                        <FileText className="w-4 h-4 text-teal-600" />
                        <span className="text-teal-700">Quote</span>
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
                      <button
                        onClick={() => handleViewSupplierProfile(supplier)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 bg-slate-50 rounded-lg hover:bg-slate-100 text-sm transition-colors"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4 text-slate-600" />
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

      {modal && renderModal()}
    </div>
  );

  function renderModal() {
    if (!modal) return null;
    const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500';
    const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

    let title = '';
    let body: React.ReactNode = null;
    let footer: React.ReactNode = (
      <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Close</button>
    );

    if (modal.type === 'pos') {
      title = `Purchase Orders — ${modal.supplier.name}`;
      body = modal.pos.length === 0 ? (
        <p className="text-sm text-gray-500">No purchase orders on record for this supplier.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2 pr-3">PO Number</th>
                <th className="py-2 pr-3">PO Date</th>
                <th className="py-2 pr-3">Delivery</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3 text-right">Amount</th>
                <th className="py-2 pr-3 text-right">Received %</th>
              </tr>
            </thead>
            <tbody>
              {modal.pos.map((po) => (
                <tr key={po.poNumber} className="border-b hover:bg-gray-50">
                  <td className="py-2 pr-3 font-medium">{po.poNumber}</td>
                  <td className="py-2 pr-3">{po.poDate}</td>
                  <td className="py-2 pr-3">{po.deliveryDate}</td>
                  <td className="py-2 pr-3">{po.status}</td>
                  <td className="py-2 pr-3 text-right">{po.currency} {po.totalAmount.toLocaleString()}</td>
                  <td className="py-2 pr-3 text-right">{po.receivedPercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      footer = (
        <div className="flex gap-2">
          {modal.pos.length > 0 && (
            <button
              onClick={() => downloadCsv(`pos-${modal.supplier.code || modal.supplier.id}.csv`, modal.pos as unknown as Array<Record<string, unknown>>)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
          <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Close</button>
        </div>
      );
    } else if (modal.type === 'invoice') {
      const s = modal.supplier;
      title = `Submit Invoice — ${s.name}`;
      body = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Invoice Number *</label>
            <input className={inputCls} value={invoiceForm.invoiceNumber} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>PO Number</label>
            <input className={inputCls} value={invoiceForm.poNumber} onChange={(e) => setInvoiceForm({ ...invoiceForm, poNumber: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Invoice Date</label>
            <input type="date" className={inputCls} value={invoiceForm.invoiceDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Due Date</label>
            <input type="date" className={inputCls} value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Amount *</label>
            <input type="number" className={inputCls} value={invoiceForm.amount} onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Currency</label>
            <input className={inputCls} value={invoiceForm.currency} onChange={(e) => setInvoiceForm({ ...invoiceForm, currency: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Notes</label>
            <textarea className={inputCls} rows={2} value={invoiceForm.notes} onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })} />
          </div>
        </div>
      );
      footer = (
        <div className="flex gap-2">
          <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={() => submitInvoice(s)} disabled={submitting} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50">
            {submitting ? 'Submitting…' : 'Submit Invoice'}
          </button>
        </div>
      );
    } else if (modal.type === 'quote') {
      const s = modal.supplier;
      title = `Submit Quote — ${s.name}`;
      body = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className={labelCls}>Item Name *</label>
            <input className={inputCls} value={quoteForm.itemName} onChange={(e) => setQuoteForm({ ...quoteForm, itemName: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Reference (RFQ/PO)</label>
            <input className={inputCls} value={quoteForm.reference} onChange={(e) => setQuoteForm({ ...quoteForm, reference: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Quantity</label>
            <input type="number" className={inputCls} value={quoteForm.quantity} onChange={(e) => setQuoteForm({ ...quoteForm, quantity: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Unit Price *</label>
            <input type="number" className={inputCls} value={quoteForm.unitPrice} onChange={(e) => setQuoteForm({ ...quoteForm, unitPrice: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Currency</label>
            <input className={inputCls} value={quoteForm.currency} onChange={(e) => setQuoteForm({ ...quoteForm, currency: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Lead Time (days)</label>
            <input type="number" className={inputCls} value={quoteForm.leadTimeDays} onChange={(e) => setQuoteForm({ ...quoteForm, leadTimeDays: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Valid Until</label>
            <input type="date" className={inputCls} value={quoteForm.validUntil} onChange={(e) => setQuoteForm({ ...quoteForm, validUntil: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Notes</label>
            <textarea className={inputCls} rows={2} value={quoteForm.notes} onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })} />
          </div>
        </div>
      );
      footer = (
        <div className="flex gap-2">
          <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={() => submitQuote(s)} disabled={submitting} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50">
            {submitting ? 'Submitting…' : 'Submit Quote'}
          </button>
        </div>
      );
    } else if (modal.type === 'catalog') {
      const s = modal.supplier;
      title = `Update Catalog — ${s.name}`;
      body = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>SKU *</label>
            <input className={inputCls} value={catalogForm.sku} onChange={(e) => setCatalogForm({ ...catalogForm, sku: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Product Name *</label>
            <input className={inputCls} value={catalogForm.name} onChange={(e) => setCatalogForm({ ...catalogForm, name: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <input className={inputCls} value={catalogForm.category} onChange={(e) => setCatalogForm({ ...catalogForm, category: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Unit of Measure</label>
            <input className={inputCls} value={catalogForm.uom} onChange={(e) => setCatalogForm({ ...catalogForm, uom: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Unit Price</label>
            <input type="number" className={inputCls} value={catalogForm.unitPrice} onChange={(e) => setCatalogForm({ ...catalogForm, unitPrice: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Currency</label>
            <input className={inputCls} value={catalogForm.currency} onChange={(e) => setCatalogForm({ ...catalogForm, currency: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Lead Time (days)</label>
            <input type="number" className={inputCls} value={catalogForm.leadTimeDays} onChange={(e) => setCatalogForm({ ...catalogForm, leadTimeDays: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select className={inputCls} value={catalogForm.status} onChange={(e) => setCatalogForm({ ...catalogForm, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
        </div>
      );
      footer = (
        <div className="flex gap-2">
          <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={() => submitCatalog(s)} disabled={submitting} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
            {submitting ? 'Saving…' : 'Save Catalog Item'}
          </button>
        </div>
      );
    } else if (modal.type === 'documents') {
      title = `Documents — ${modal.supplier.name}`;
      body = modal.docs.length === 0 ? (
        <p className="text-sm text-gray-500">No documents on file for this supplier.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3">File</th>
                <th className="py-2 pr-3">Uploaded</th>
                <th className="py-2 pr-3">Expiry</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {modal.docs.map((d) => (
                <tr key={d.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 pr-3">{d.documentType}</td>
                  <td className="py-2 pr-3 text-blue-600">{d.fileName}</td>
                  <td className="py-2 pr-3">{d.uploadedAt}</td>
                  <td className="py-2 pr-3">{d.expiryDate ?? '—'}</td>
                  <td className="py-2 pr-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${getDocumentStatusColor(d.status)}`}>{d.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      footer = (
        <div className="flex gap-2">
          {modal.docs.length > 0 && (
            <button onClick={() => exportSupplierDocuments(modal.docs, modal.supplier)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" /> Download List (CSV)
            </button>
          )}
          <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Close</button>
        </div>
      );
    } else if (modal.type === 'upload') {
      const s = modal.supplier;
      title = `Upload Document — ${s.name}`;
      body = (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Document Type *</label>
            <input className={inputCls} placeholder="e.g. ISO 9001 Certificate" value={uploadForm.documentType} onChange={(e) => setUploadForm({ ...uploadForm, documentType: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>File Name *</label>
            <input className={inputCls} placeholder="e.g. iso9001.pdf" value={uploadForm.fileName} onChange={(e) => setUploadForm({ ...uploadForm, fileName: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Expiry Date</label>
            <input type="date" className={inputCls} value={uploadForm.expiryDate} onChange={(e) => setUploadForm({ ...uploadForm, expiryDate: e.target.value })} />
          </div>
        </div>
      );
      footer = (
        <div className="flex gap-2">
          <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={() => submitUpload(s)} disabled={submitting} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50">
            {submitting ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      );
    } else if (modal.type === 'message') {
      const s = modal.supplier;
      title = `Message Buyer — ${s.name}`;
      body = (
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Subject *</label>
            <input className={inputCls} value={messageForm.subject} onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })} />
          </div>
          <div>
            <label className={labelCls}>Message *</label>
            <textarea className={inputCls} rows={4} value={messageForm.body} onChange={(e) => setMessageForm({ ...messageForm, body: e.target.value })} />
          </div>
        </div>
      );
      footer = (
        <div className="flex gap-2">
          <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={() => submitMessage(s)} disabled={submitting} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 disabled:opacity-50">
            {submitting ? 'Sending…' : 'Send Message'}
          </button>
        </div>
      );
    } else if (modal.type === 'profile') {
      const s = modal.supplier;
      title = `Supplier Profile — ${s.name}`;
      body = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div><span className="text-gray-500">Code:</span> <span className="font-medium">{s.code}</span></div>
          <div><span className="text-gray-500">Category:</span> <span className="font-medium">{s.category}</span></div>
          <div><span className="text-gray-500">Status:</span> <span className="font-medium">{s.status}</span></div>
          <div><span className="text-gray-500">Rating:</span> <span className="font-medium">{s.rating}/5.0</span></div>
          <div><span className="text-gray-500">Contact:</span> <span className="font-medium">{s.contact.name || '—'}</span></div>
          <div><span className="text-gray-500">Email:</span> <span className="font-medium">{s.contact.email || '—'}</span></div>
          <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{s.contact.phone || '—'}</span></div>
          <div><span className="text-gray-500">Payment Terms:</span> <span className="font-medium">{s.paymentTerms || '—'}</span></div>
          <div><span className="text-gray-500">Total Spend (YTD):</span> <span className="font-medium">${s.totalSpend.toLocaleString()}</span></div>
          <div><span className="text-gray-500">Active Orders:</span> <span className="font-medium">{s.activeOrders}</span></div>
          <div><span className="text-gray-500">On-Time Delivery:</span> <span className="font-medium">{s.onTimeDelivery}%</span></div>
          <div><span className="text-gray-500">Quality Score:</span> <span className="font-medium">{s.qualityScore}%</span></div>
          <div><span className="text-gray-500">Last Activity:</span> <span className="font-medium">{s.lastActivity || '—'}</span></div>
        </div>
      );
    } else if (modal.type === 'performance') {
      const s = modal.supplier;
      title = `Performance — ${s.name}`;
      body = (
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-500">Overall Rating</div>
              <div className="text-2xl font-bold">{s.rating}/5.0</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-500">On-Time Delivery</div>
              <div className="text-2xl font-bold">{s.onTimeDelivery}%</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-500">Quality Score</div>
              <div className="text-2xl font-bold">{s.qualityScore}%</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-gray-500">Total Spend (YTD)</div>
              <div className="text-2xl font-bold">${s.totalSpend.toLocaleString()}</div>
            </div>
          </div>
          <p className="text-gray-500">Metrics reflect the current vendor record. On-time delivery and quality scores are 0 until evaluation data is captured.</p>
        </div>
      );
    } else if (modal.type === 'messages') {
      const unread = messages.filter((m) => m.status === 'unread').length;
      title = 'Message Center';
      body = (
        <div className="space-y-3 text-sm">
          <div className="flex gap-4">
            <span>Total: <strong>{messages.length}</strong></span>
            <span>Unread: <strong>{unread}</strong></span>
            <span>High priority: <strong>{messages.filter((m) => m.priority === 'high').length}</strong></span>
          </div>
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages yet.</p>
          ) : (
            <div className="divide-y max-h-96 overflow-y-auto">
              {messages.map((m) => (
                <div key={m.id} className="py-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getMessageStatusColor(m.status)}`}>{m.status}</span>
                    <span className="font-medium">{m.subject}</span>
                  </div>
                  <div className="text-gray-500 text-xs">{m.supplierName} · {m.createdAt}</div>
                  <div className="text-gray-700">{m.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } else if (modal.type === 'manage-documents') {
      title = 'Document Management';
      const byType = Array.from(new Set(documents.map((d) => d.documentType)));
      body = (
        <div className="space-y-3 text-sm">
          <div className="flex gap-4">
            <span>Total: <strong>{documents.length}</strong></span>
            <span>Valid: <strong>{documents.filter((d) => d.status === 'valid').length}</strong></span>
            <span>Expiring: <strong>{documents.filter((d) => d.status === 'expiring').length}</strong></span>
            <span>Expired: <strong>{documents.filter((d) => d.status === 'expired').length}</strong></span>
          </div>
          <div>
            <div className="font-medium mb-1">By type</div>
            {byType.length === 0 ? <p className="text-gray-500">No documents.</p> : (
              <ul className="list-disc pl-5">
                {byType.map((t) => (
                  <li key={t}>{t}: {documents.filter((d) => d.documentType === t).length}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      );
      footer = (
        <div className="flex gap-2">
          <button onClick={() => { closeModal(); handleUploadDocument(); }} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center gap-2">
            <Upload className="w-4 h-4" /> Upload Document
          </button>
          <button onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Close</button>
        </div>
      );
    } else if (modal.type === 'settings') {
      title = 'Supplier Portal Settings';
      body = (
        <div className="space-y-3 text-sm">
          <label className="flex items-center justify-between">
            <span>Email notifications for new POs</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
          <label className="flex items-center justify-between">
            <span>Certificate expiry reminders (30 days)</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
          <label className="flex items-center justify-between">
            <span>Require approval for new catalog items</span>
            <input type="checkbox" defaultChecked className="rounded" />
          </label>
          <div>
            <label className={labelCls}>Items per page</label>
            <select className={inputCls} defaultValue="25">
              <option>10</option><option>25</option><option>50</option><option>100</option>
            </select>
          </div>
          <p className="text-gray-500">Display-only preferences (client-side).</p>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeModal}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>
          <div className="px-5 py-4">
            {formError && (
              <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{formError}</div>
            )}
            {body}
          </div>
          <div className="px-5 py-3 border-t flex justify-end">{footer}</div>
        </div>
      </div>
    );
  }
};

export default SupplierPortal;
