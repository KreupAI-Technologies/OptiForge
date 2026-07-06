'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { crmService } from '@/services/crm.service';
import { ArrowLeft, Building2, User, MapPin, CreditCard, Tag } from 'lucide-react';
import {
  MultiStepForm,
  useMultiStepForm,
  FormProgressIndicator,
  useAutoSaveDraft,
  AutoSaveIndicator,
  DraftRecoveryBanner,
  useUnsavedChangesWarning,
  HelpIcon,
  useSmartDefaults,
} from '@/components/ui';

// Step Components using useMultiStepForm hook
function CompanyInfoStep() {
  const { formData, setFormData } = useMultiStepForm();

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Company Information</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Enter basic company details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Company Name *
            <HelpIcon content="Legal registered name as it appears on official documents." />
          </label>
          <input
            type="text"
            value={(formData.companyName as string) || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            placeholder="Acme Corporation"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Industry *
            <HelpIcon content="Primary industry sector for segmentation and reporting." />
          </label>
          <select
            value={(formData.industry as string) || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
          >
            <option value="">Select industry...</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="technology">Technology</option>
            <option value="healthcare">Healthcare</option>
            <option value="retail">Retail</option>
            <option value="automotive">Automotive</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Website</label>
          <input
            type="url"
            value={(formData.website as string) || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            placeholder="https://www.example.com"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Employee Count</label>
          <select
            value={(formData.employeeCount as string) || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, employeeCount: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
          >
            <option value="">Select range...</option>
            <option value="1-50">1-50</option>
            <option value="51-200">51-200</option>
            <option value="201-500">201-500</option>
            <option value="500+">500+</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function ContactStep() {
  const { formData, setFormData } = useMultiStepForm();

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Primary Contact</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Main point of contact at this organization.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">First Name *</label>
          <input
            type="text"
            value={(formData.firstName as string) || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Last Name *</label>
          <input
            type="text"
            value={(formData.lastName as string) || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email *
            <HelpIcon content="Order confirmations and invoices will be sent to this address." />
          </label>
          <input
            type="email"
            value={(formData.email as string) || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Phone *</label>
          <input
            type="tel"
            value={(formData.phone as string) || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
          />
        </div>
      </div>
    </div>
  );
}

function AddressStep() {
  const { formData, setFormData } = useMultiStepForm();

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Business Address</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Primary address for shipping and correspondence.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Street Address *</label>
          <input
            type="text"
            value={(formData.address as string) || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">City *</label>
          <input
            type="text"
            value={(formData.city as string) || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">State *</label>
          <input
            type="text"
            value={(formData.state as string) || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Postal Code *</label>
          <input
            type="text"
            value={(formData.postalCode as string) || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Country *</label>
          <select
            value={(formData.country as string) || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
          >
            <option value="">Select...</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
            <option value="IN">India</option>
            <option value="DE">Germany</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function BillingStep() {
  const { formData, setFormData } = useMultiStepForm();

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Billing & Payment</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Configure billing preferences. (Optional)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Payment Terms
            <HelpIcon content="Net 30 means payment is due within 30 days of invoice date." />
          </label>
          <select
            value={(formData.paymentTerms as string) || 'net30'}
            onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
          >
            <option value="due_on_receipt">Due on Receipt</option>
            <option value="net15">Net 15</option>
            <option value="net30">Net 30</option>
            <option value="net45">Net 45</option>
            <option value="net60">Net 60</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Credit Limit
            <HelpIcon content="Maximum credit amount. Leave at 0 for prepay only." />
          </label>
          <input
            type="number"
            value={(formData.creditLimit as number) || 0}
            onChange={(e) => setFormData(prev => ({ ...prev, creditLimit: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            min="0"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Currency</label>
          <select
            value={(formData.currency as string) || 'USD'}
            onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="INR">INR - Indian Rupee</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Tax ID</label>
          <input
            type="text"
            value={(formData.taxId as string) || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            placeholder="XX-XXXXXXX"
          />
        </div>
      </div>
    </div>
  );
}

function ClassificationStep() {
  const { formData, setFormData } = useMultiStepForm();
  const tags = ['Strategic', 'Key Account', 'New', 'VIP', 'At Risk'];

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Classification</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Categorize for proper management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Customer Type *</label>
          <select
            value={(formData.customerType as string) || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, customerType: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
          >
            <option value="">Select...</option>
            <option value="direct">Direct Customer</option>
            <option value="distributor">Distributor</option>
            <option value="reseller">Reseller</option>
            <option value="oem">OEM Partner</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Segment</label>
          <select
            value={(formData.segment as string) || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, segment: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
          >
            <option value="">Select...</option>
            <option value="enterprise">Enterprise</option>
            <option value="mid-market">Mid-Market</option>
            <option value="smb">SMB</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  const current = (formData.tags as string[]) || [];
                  setFormData(prev => ({
                    ...prev,
                    tags: current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag]
                  }));
                }}
                className={`px-3 py-1.5 rounded-full text-sm ${
                  ((formData.tags as string[]) || []).includes(tag)
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function AddCustomerEnhancedPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  const { lastSaved, isSaving, hasDraft, clearDraft, restoreDraft } = useAutoSaveDraft(formData, {
    key: 'customer-add-enhanced',
    debounceMs: 2000,
  });

  const hasChanges = Object.values(formData).some(v => v !== '' && v !== 0 && (!Array.isArray(v) || v.length > 0));
  useUnsavedChangesWarning(hasChanges);

  const smartDefaults = useSmartDefaults([
    { field: 'currency', source: 'localStorage', key: 'lastCurrency', fallback: 'USD' },
    { field: 'paymentTerms', source: 'localStorage', key: 'lastPaymentTerms', fallback: 'net30' },
    { field: 'country', source: 'localStorage', key: 'lastCountry', fallback: 'US' },
  ], {});

  useEffect(() => {
    if (Object.keys(smartDefaults).length > 0) {
      setFormData(prev => ({ ...smartDefaults, ...prev }));
    }
  }, [smartDefaults]);

  useEffect(() => {
    if (hasDraft) setShowDraftBanner(true);
  }, [hasDraft]);

  const steps = [
    { id: 'company', label: 'Company', description: 'Basic info', icon: Building2 },
    { id: 'contact', label: 'Contact', description: 'Primary contact', icon: User },
    { id: 'address', label: 'Address', description: 'Location', icon: MapPin },
    { id: 'billing', label: 'Billing', description: 'Payment', icon: CreditCard, isOptional: true },
    { id: 'classification', label: 'Classify', description: 'Categories', icon: Tag },
  ];

  const formFields = [
    { name: 'companyName', required: true },
    { name: 'industry', required: true },
    { name: 'firstName', required: true },
    { name: 'lastName', required: true },
    { name: 'email', required: true, validate: (v: unknown) => typeof v === 'string' && v.includes('@') },
    { name: 'phone', required: true },
    { name: 'address', required: true },
    { name: 'city', required: true },
    { name: 'state', required: true },
    { name: 'postalCode', required: true },
    { name: 'country', required: true },
    { name: 'customerType', required: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Customer (Enhanced)</h1>
              <p className="text-sm text-gray-600">With FormUX: Auto-save, Progress, Field Help</p>
            </div>
          </div>
          <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
        </div>
      </div>

      <div className="w-full p-3 space-y-3">
        <DraftRecoveryBanner
          hasDraft={showDraftBanner}
          onRestore={() => { const d = restoreDraft(); if (d) setFormData(d); setShowDraftBanner(false); }}
          onDiscard={() => { clearDraft(); setShowDraftBanner(false); }}
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <FormProgressIndicator fields={formFields} values={formData} variant="bar" showPercentage showFieldCount />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <MultiStepForm
            steps={steps}
            onComplete={async (data) => {
              try {
                await crmService.customers.create({
                  ...data,
                  name: data.companyName ?? data.name,
                  companyId: 'default-company-id',
                });
              } catch (err) {
                // keep draft on failure so the user doesn't lose data
                return;
              }
              clearDraft();
              localStorage.setItem('lastCurrency', String(data.currency || 'USD'));
              localStorage.setItem('lastPaymentTerms', String(data.paymentTerms || 'net30'));
              localStorage.setItem('lastCountry', String(data.country || 'US'));
              router.push('/crm/customers');
            }}
            allowSkipOptional
            showProgressBar
            showStepList
          >
            <CompanyInfoStep />
            <ContactStep />
            <AddressStep />
            <BillingStep />
            <ClassificationStep />
          </MultiStepForm>
        </div>
      </div>
    </div>
  );
}
