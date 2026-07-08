'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { vendorService, type CreateVendorDto } from '@/services/VendorService';
import {
  ArrowLeft,
  Save,
  FileText,
  Building2,
  MapPin,
  User,
  CreditCard,
  Package,
  Award,
  Upload,
  Plus,
  Trash2,
  X,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Building,
  Factory,
  Warehouse,
  FileCheck,
  AlertCircle,
  Hash,
  Send,
} from 'lucide-react';
import {
  useAutoSaveDraft,
  AutoSaveIndicator,
  DraftRecoveryBanner,
  useUnsavedChangesWarning,
  HelpIcon,
  FormProgressIndicator,
} from '@/components/ui/FormUX';
import { StepIndicator, Step } from '@/components/ui/StepIndicator';

interface ContactPerson {
  id: string;
  name: string;
  designation: string;
  mobile: string;
  email: string;
  department: string;
  isPrimary: boolean;
}

interface Address {
  id: string;
  type: 'registered' | 'factory' | 'warehouse' | 'office';
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  url: string;
  file?: File;
  verified: boolean;
}

interface VendorFormData {
  legalName: string;
  tradeName: string;
  vendorCode: string;
  gstNumber: string;
  panNumber: string;
  cinNumber: string;
  msmeRegistration: string;
  website: string;
  contactPersons: ContactPerson[];
  addresses: Address[];
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  ifscCode: string;
  accountType: string;
  paymentNetDays: number;
  paymentMethod: string;
  discountTerms: string;
  categories: string[];
  specificMaterials: string[];
  iso9001: boolean;
  iso14001: boolean;
  ohsas18001: boolean;
  otherCertifications: string[];
  documents: Document[];
  initialRating: number;
  notes: string;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const CATEGORY_OPTIONS = [
  'Raw Materials', 'Finished Goods', 'Components', 'Services',
  'MRO (Maintenance, Repair, Operations)', 'Packaging Materials',
  'Logistics & Transportation', 'IT & Software', 'Consultancy',
];

const MATERIAL_OPTIONS = [
  'Steel', 'Cement', 'Paint', 'Chemicals', 'Electrical Components',
  'Mechanical Parts', 'Packaging Materials', 'Plastics & Polymers',
  'Aluminum', 'Copper', 'Glass', 'Rubber', 'Textiles', 'Wood & Timber',
  'Adhesives & Sealants',
];

const ACCOUNT_TYPES = ['Current Account', 'Savings Account', 'Cash Credit Account'];
const PAYMENT_METHODS = ['NEFT/RTGS', 'Cheque', 'LC (Letter of Credit)', 'Bank Transfer', 'UPI'];

const KYC_CHECKLIST = [
  { id: 'gst', label: 'GST Certificate', required: true },
  { id: 'pan', label: 'PAN Card', required: true },
  { id: 'bank', label: 'Cancelled Cheque', required: true },
  { id: 'msme', label: 'MSME Certificate', required: false },
  { id: 'iso', label: 'ISO Certificates', required: false },
  { id: 'address', label: 'Address Proof', required: true },
];

const generateVendorCode = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `VEN-${year}-${random}`;
};

const getInitialFormData = (): VendorFormData => ({
  legalName: '',
  tradeName: '',
  vendorCode: generateVendorCode(),
  gstNumber: '',
  panNumber: '',
  cinNumber: '',
  msmeRegistration: '',
  website: '',
  contactPersons: [
    { id: '1', name: '', designation: '', mobile: '', email: '', department: '', isPrimary: true },
  ],
  addresses: [
    { id: '1', type: 'registered', addressLine1: '', addressLine2: '', city: '', state: '', pinCode: '', country: 'India' },
  ],
  bankName: '',
  bankBranch: '',
  accountNumber: '',
  ifscCode: '',
  accountType: '',
  paymentNetDays: 30,
  paymentMethod: 'NEFT/RTGS',
  discountTerms: '',
  categories: [],
  specificMaterials: [],
  iso9001: false,
  iso14001: false,
  ohsas18001: false,
  otherCertifications: [],
  documents: [],
  initialRating: 3,
  notes: '',
});

// Field help content
const FIELD_HELP = {
  legalName: {
    title: 'Legal Name',
    content: 'The official registered name of the company as per legal documents. This should match GST and PAN registrations.',
  },
  tradeName: {
    title: 'Trade Name',
    content: 'The brand or commonly known name the vendor operates under. This may differ from the legal name.',
  },
  gstNumber: {
    title: 'GST Number (GSTIN)',
    content: 'The 15-character Goods and Services Tax Identification Number. Format: 2 state digits + 10 PAN characters + 1 entity code + 1 default + 1 check digit.',
  },
  panNumber: {
    title: 'PAN Number',
    content: 'Permanent Account Number issued by Income Tax Department. Format: 5 letters + 4 digits + 1 letter.',
  },
  cinNumber: {
    title: 'Corporate Identification Number',
    content: 'CIN is a unique 21-character alphanumeric identifier assigned to companies registered with the MCA.',
  },
  msmeRegistration: {
    title: 'MSME/Udyam Registration',
    content: 'Registration number under the MSME Development Act. Vendors with MSME registration may qualify for preferential payment terms.',
  },
  ifscCode: {
    title: 'IFSC Code',
    content: 'Indian Financial System Code used for electronic transfers. Format: First 4 characters = Bank code, 5th = 0, Last 6 = Branch code.',
  },
  paymentNetDays: {
    title: 'Credit Period',
    content: 'Number of days within which payment should be made from the date of invoice. Common terms: Net 30, Net 45, Net 60.',
  },
  discountTerms: {
    title: 'Discount Terms',
    content: 'Early payment discounts. Example: "2/10 Net 30" means 2% discount if paid within 10 days, otherwise full payment due in 30 days.',
  },
};

export default function VendorAddEnhancedPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<VendorFormData>(getInitialFormData);
  const [initialFormData, setInitialFormData] = useState<VendorFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newCertification, setNewCertification] = useState('');
  const [kycChecklist, setKycChecklist] = useState<Record<string, boolean>>({});
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Calculate form completion percentage
  const completionPercentage = useMemo(() => {
    let filledFields = 0;
    let totalFields = 15; // Core required fields

    if (formData.legalName) filledFields++;
    if (formData.tradeName) filledFields++;
    if (formData.gstNumber) filledFields++;
    if (formData.panNumber) filledFields++;
    if (formData.contactPersons[0]?.name) filledFields++;
    if (formData.contactPersons[0]?.email || formData.contactPersons[0]?.mobile) filledFields++;
    if (formData.addresses[0]?.addressLine1) filledFields++;
    if (formData.addresses[0]?.city) filledFields++;
    if (formData.addresses[0]?.state) filledFields++;
    if (formData.bankName) filledFields++;
    if (formData.accountNumber) filledFields++;
    if (formData.ifscCode) filledFields++;
    if (formData.categories.length > 0) filledFields++;
    if (formData.documents.length > 0) filledFields++;
    if (currentStep === 5) filledFields++; // Review step

    return Math.round((filledFields / totalFields) * 100);
  }, [formData, currentStep]);

  // Auto-save hook
  const { lastSaved, isSaving, hasDraft, clearDraft, restoreDraft } = useAutoSaveDraft(
    formData as unknown as Record<string, unknown>,
    {
      key: 'vendor-onboarding-draft',
      debounceMs: 2000,
      onRestore: (data) => {
        setFormData(data as unknown as VendorFormData);
        setShowDraftBanner(false);
      },
    }
  );

  // Check for unsaved changes
  const hasChanges = useMemo(() => {
    if (!initialFormData) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  }, [formData, initialFormData]);

  // Unsaved changes warning
  useUnsavedChangesWarning(hasChanges);

  // Initialize form data
  useEffect(() => {
    const initial = getInitialFormData();
    setFormData(initial);
    setInitialFormData(initial);
    if (hasDraft) {
      setShowDraftBanner(true);
    }
  }, [hasDraft]);

  // Step definitions for StepIndicator
  const steps: Step[] = [
    { id: '1', label: 'Basic Info', description: 'Company details' },
    { id: '2', label: 'Contacts', description: 'Contact & addresses' },
    { id: '3', label: 'Banking', description: 'Payment details' },
    { id: '4', label: 'Categories', description: 'Products & services' },
    { id: '5', label: 'Documents', description: 'Certifications' },
    { id: '6', label: 'Review', description: 'Submit for approval' },
  ];

  // Validation functions
  const validateGST = (gst: string): boolean => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst);
  const validatePAN = (pan: string): boolean => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  const validateIFSC = (ifsc: string): boolean => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
  const validatePinCode = (pin: string): boolean => /^[1-9][0-9]{5}$/.test(pin);
  const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateMobile = (mobile: string): boolean => /^(\+91[\s-]?)?[0-9]{10}$/.test(mobile.replace(/\s/g, ''));

  const handleInputChange = (field: keyof VendorFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Contact person management
  const addContactPerson = () => {
    const newContact: ContactPerson = {
      id: Date.now().toString(),
      name: '', designation: '', mobile: '', email: '', department: '', isPrimary: false,
    };
    setFormData((prev) => ({ ...prev, contactPersons: [...prev.contactPersons, newContact] }));
  };

  const updateContactPerson = (id: string, field: keyof ContactPerson, value: any) => {
    setFormData((prev) => ({
      ...prev,
      contactPersons: prev.contactPersons.map((c) => c.id === id ? { ...c, [field]: value } : c),
    }));
  };

  const removeContactPerson = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      contactPersons: prev.contactPersons.filter((c) => c.id !== id),
    }));
  };

  const setPrimaryContact = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      contactPersons: prev.contactPersons.map((c) => ({ ...c, isPrimary: c.id === id })),
    }));
  };

  // Address management
  const addAddress = () => {
    const newAddress: Address = {
      id: Date.now().toString(),
      type: 'office', addressLine1: '', addressLine2: '', city: '', state: '', pinCode: '', country: 'India',
    };
    setFormData((prev) => ({ ...prev, addresses: [...prev.addresses, newAddress] }));
  };

  const updateAddress = (id: string, field: keyof Address, value: any) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.map((a) => a.id === id ? { ...a, [field]: value } : a),
    }));
  };

  const removeAddress = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((a) => a.id !== id),
    }));
  };

  // Certification management
  const addOtherCertification = () => {
    if (newCertification.trim() && !formData.otherCertifications.includes(newCertification.trim())) {
      setFormData((prev) => ({
        ...prev,
        otherCertifications: [...prev.otherCertifications, newCertification.trim()],
      }));
      setNewCertification('');
    }
  };

  const removeOtherCertification = (cert: string) => {
    setFormData((prev) => ({
      ...prev,
      otherCertifications: prev.otherCertifications.filter((c) => c !== cert),
    }));
  };

  // Document management
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = e.target.files;
    if (files) {
      const newDocs: Document[] = Array.from(files).map((file) => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: type,
        uploadDate: new Date().toISOString().split('T')[0],
        size: `${(file.size / 1024).toFixed(0)} KB`,
        url: URL.createObjectURL(file),
        file: file,
        verified: false,
      }));
      setFormData((prev) => ({ ...prev, documents: [...prev.documents, ...newDocs] }));
    }
  };

  const removeDocument = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((doc) => doc.id !== id),
    }));
  };

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleMaterial = (material: string) => {
    setFormData((prev) => ({
      ...prev,
      specificMaterials: prev.specificMaterials.includes(material)
        ? prev.specificMaterials.filter((m) => m !== material)
        : [...prev.specificMaterials, material],
    }));
  };

  const toggleKycItem = (id: string) => {
    setKycChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.legalName.trim()) newErrors.legalName = 'Legal name is required';
      if (!formData.tradeName.trim()) newErrors.tradeName = 'Trade name is required';
      if (!validateGST(formData.gstNumber)) newErrors.gstNumber = 'Invalid GST format';
      if (!validatePAN(formData.panNumber)) newErrors.panNumber = 'Invalid PAN format';
    }

    if (step === 1) {
      if (formData.contactPersons.length === 0) {
        newErrors.contactPersons = 'At least one contact required';
      } else {
        formData.contactPersons.forEach((c, i) => {
          if (!c.name.trim()) newErrors[`contact_${i}_name`] = 'Name required';
          if (c.email && !validateEmail(c.email)) newErrors[`contact_${i}_email`] = 'Invalid email';
          if (c.mobile && !validateMobile(c.mobile)) newErrors[`contact_${i}_mobile`] = 'Invalid mobile';
        });
      }
      if (formData.addresses.length === 0) {
        newErrors.addresses = 'At least one address required';
      } else {
        formData.addresses.forEach((a, i) => {
          if (!a.addressLine1.trim()) newErrors[`address_${i}_line1`] = 'Address required';
          if (!a.city.trim()) newErrors[`address_${i}_city`] = 'City required';
          if (!a.state) newErrors[`address_${i}_state`] = 'State required';
          if (a.pinCode && !validatePinCode(a.pinCode)) newErrors[`address_${i}_pin`] = 'Invalid PIN';
        });
      }
    }

    if (step === 2) {
      if (formData.ifscCode && !validateIFSC(formData.ifscCode)) {
        newErrors.ifscCode = 'Invalid IFSC format';
      }
    }

    if (step === 3) {
      if (formData.categories.length === 0) {
        newErrors.categories = 'Select at least one category';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const buildVendorDto = (): CreateVendorDto => {
    const primaryContact = formData.contactPersons.find((c) => c.isPrimary) ?? formData.contactPersons[0];
    const primaryAddress = formData.addresses.find((a) => a.type === 'registered') ?? formData.addresses[0];
    const addressStr = primaryAddress
      ? [primaryAddress.addressLine1, primaryAddress.addressLine2, primaryAddress.city, primaryAddress.state, primaryAddress.pinCode, primaryAddress.country]
          .filter(Boolean)
          .join(', ')
      : '';
    return {
      vendorCode: formData.vendorCode,
      vendorName: formData.legalName || formData.tradeName,
      contactPerson: primaryContact?.name ?? '',
      email: primaryContact?.email ?? '',
      phone: primaryContact?.mobile ?? '',
      address: addressStr,
      taxId: formData.gstNumber || formData.panNumber || undefined,
      paymentTerms: formData.paymentNetDays ? `Net ${formData.paymentNetDays}` : undefined,
      currency: 'INR',
      vendorType: 'Manufacturer',
      category: formData.categories[0] ?? 'Raw Materials',
    };
  };

  const handleSaveDraft = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      await vendorService.createVendor(buildVendorDto());
      clearDraft();
      setSubmitSuccess('Vendor details saved as draft!');
      router.push('/procurement/vendors');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save vendor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      await vendorService.createVendor(buildVendorDto());
      clearDraft();
      setSubmitSuccess('Vendor submitted for approval successfully!');
      router.push('/procurement/vendors');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit vendor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.push('/procurement/vendors');
      }
    } else {
      router.push('/procurement/vendors');
    }
  };

  const handleRestoreDraft = () => {
    restoreDraft();
    setShowDraftBanner(false);
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftBanner(false);
  };

  const getAddressIcon = (type: Address['type']) => {
    switch (type) {
      case 'registered': return <Building className="h-4 w-4" />;
      case 'factory': return <Factory className="h-4 w-4" />;
      case 'warehouse': return <Warehouse className="h-4 w-4" />;
      case 'office': return <Building2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full h-full px-3 py-2 overflow-auto">
      {/* Draft Recovery Banner */}
      {showDraftBanner && (
        <DraftRecoveryBanner
          onRestore={handleRestoreDraft}
          onDiscard={handleDiscardDraft}
          lastSaved={lastSaved}
        />
      )}
      {submitError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</div>
      )}
      {submitSuccess && (
        <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{submitSuccess}</div>
      )}
      {submitting && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">Saving vendor...</div>
      )}

      {/* Header */}
      <div className="mb-3">
        <button
          onClick={handleCancel}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Vendors</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Vendor</h1>
              <p className="text-gray-600 mt-1 flex items-center space-x-2">
                <Hash className="h-4 w-4" />
                <span>{formData.vendorCode}</span>
              </p>
            </div>
          </div>

          {/* Auto-save indicator */}
          <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
        </div>
      </div>

      {/* Form Progress Bar */}
      <div className="mb-2">
        <FormProgressIndicator
          completedFields={completionPercentage}
          totalFields={100}
          variant="bar"
          showPercentage
          label="Form completion"
        />
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={(index) => {
            if (index <= currentStep) setCurrentStep(index);
          }}
          variant="default"
        />
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        {/* Step 1: Basic Information */}
        {currentStep === 0 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Basic Information</h3>
              <p className="text-sm text-gray-600 mb-3">
                Enter the vendor's legal and trade information along with registration details.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  Legal Name <span className="text-red-500">*</span>
                  <HelpIcon {...FIELD_HELP.legalName} />
                </label>
                <input
                  type="text"
                  value={formData.legalName}
                  onChange={(e) => handleInputChange('legalName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.legalName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., JSW Steel Limited"
                />
                {errors.legalName && <p className="text-xs text-red-500 mt-1">{errors.legalName}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  Trade Name <span className="text-red-500">*</span>
                  <HelpIcon {...FIELD_HELP.tradeName} />
                </label>
                <input
                  type="text"
                  value={formData.tradeName}
                  onChange={(e) => handleInputChange('tradeName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tradeName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., JSW Steel"
                />
                {errors.tradeName && <p className="text-xs text-red-500 mt-1">{errors.tradeName}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  GST Number <span className="text-red-500">*</span>
                  <HelpIcon {...FIELD_HELP.gstNumber} />
                </label>
                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                    errors.gstNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="27AAACJ0308G1Z4"
                  maxLength={15}
                />
                {errors.gstNumber && <p className="text-xs text-red-500 mt-1">{errors.gstNumber}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  PAN Number <span className="text-red-500">*</span>
                  <HelpIcon {...FIELD_HELP.panNumber} />
                </label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                    errors.panNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="AAACJ0308G"
                  maxLength={10}
                />
                {errors.panNumber && <p className="text-xs text-red-500 mt-1">{errors.panNumber}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  CIN Number
                  <HelpIcon {...FIELD_HELP.cinNumber} />
                </label>
                <input
                  type="text"
                  value={formData.cinNumber}
                  onChange={(e) => handleInputChange('cinNumber', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="L27101MH1994PLC152925"
                  maxLength={21}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  MSME Registration
                  <HelpIcon {...FIELD_HELP.msmeRegistration} />
                </label>
                <input
                  type="text"
                  value={formData.msmeRegistration}
                  onChange={(e) => handleInputChange('msmeRegistration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="MSME-2024-12345"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Contact Details */}
        {currentStep === 1 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact Details</h3>
              <p className="text-sm text-gray-600 mb-3">Add contact persons and addresses for the vendor.</p>
            </div>

            {/* Contact Persons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Contact Persons</h4>
                <button
                  onClick={addContactPerson}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Contact</span>
                </button>
              </div>
              {errors.contactPersons && (
                <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-700">{errors.contactPersons}</p>
                </div>
              )}
              <div className="space-y-2">
                {formData.contactPersons.map((contact, index) => (
                  <div key={contact.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Contact {index + 1}</span>
                        {contact.isPrimary && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-blue-600 text-white rounded-full">
                            Primary
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {!contact.isPrimary && (
                          <button
                            onClick={() => setPrimaryContact(contact.id)}
                            className="text-xs px-2 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                          >
                            Set as Primary
                          </button>
                        )}
                        <button
                          onClick={() => removeContactPerson(contact.id)}
                          className="text-red-600 hover:text-red-800"
                          disabled={formData.contactPersons.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => updateContactPerson(contact.id, 'name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                            errors[`contact_${index}_name`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Designation</label>
                        <input
                          type="text"
                          value={contact.designation}
                          onChange={(e) => updateContactPerson(contact.id, 'designation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Job title"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Mobile</label>
                        <input
                          type="tel"
                          value={contact.mobile}
                          onChange={(e) => updateContactPerson(contact.id, 'mobile', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                            errors[`contact_${index}_mobile`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={contact.email}
                          onChange={(e) => updateContactPerson(contact.id, 'email', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                            errors[`contact_${index}_email`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                        <input
                          type="text"
                          value={contact.department}
                          onChange={(e) => updateContactPerson(contact.id, 'department', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Sales, Accounts, etc."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Addresses */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Addresses</h4>
                <button
                  onClick={addAddress}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Address</span>
                </button>
              </div>
              <div className="space-y-2">
                {formData.addresses.map((address, index) => (
                  <div key={address.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getAddressIcon(address.type)}
                        <select
                          value={address.type}
                          onChange={(e) => updateAddress(address.id, 'type', e.target.value)}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                        >
                          <option value="registered">Registered Office</option>
                          <option value="factory">Factory</option>
                          <option value="warehouse">Warehouse</option>
                          <option value="office">Branch Office</option>
                        </select>
                      </div>
                      <button
                        onClick={() => removeAddress(address.id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={formData.addresses.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Address Line 1 *</label>
                        <input
                          type="text"
                          value={address.addressLine1}
                          onChange={(e) => updateAddress(address.id, 'addressLine1', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                            errors[`address_${index}_line1`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Building, Street"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Address Line 2</label>
                        <input
                          type="text"
                          value={address.addressLine2}
                          onChange={(e) => updateAddress(address.id, 'addressLine2', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Area, Locality"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">City *</label>
                        <input
                          type="text"
                          value={address.city}
                          onChange={(e) => updateAddress(address.id, 'city', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                            errors[`address_${index}_city`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">State *</label>
                        <select
                          value={address.state}
                          onChange={(e) => updateAddress(address.id, 'state', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                            errors[`address_${index}_state`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select State</option>
                          {INDIAN_STATES.map((state) => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">PIN Code</label>
                        <input
                          type="text"
                          value={address.pinCode}
                          onChange={(e) => updateAddress(address.id, 'pinCode', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono ${
                            errors[`address_${index}_pin`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="400051"
                          maxLength={6}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                        <input
                          type="text"
                          value={address.country}
                          onChange={(e) => updateAddress(address.id, 'country', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Banking Information */}
        {currentStep === 2 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Banking Information</h3>
              <p className="text-sm text-gray-600 mb-3">Enter the vendor's bank account details for payments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="HDFC Bank"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <input
                  type="text"
                  value={formData.bankBranch}
                  onChange={(e) => handleInputChange('bankBranch', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Branch name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="50200012345678"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  IFSC Code
                  <HelpIcon {...FIELD_HELP.ifscCode} />
                </label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                    errors.ifscCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="HDFC0001234"
                  maxLength={11}
                />
                {errors.ifscCode && <p className="text-xs text-red-500 mt-1">{errors.ifscCode}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                <select
                  value={formData.accountType}
                  onChange={(e) => handleInputChange('accountType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  {ACCOUNT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Payment Terms</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    Credit Period (Days)
                    <HelpIcon {...FIELD_HELP.paymentNetDays} />
                  </label>
                  <input
                    type="number"
                    value={formData.paymentNetDays}
                    onChange={(e) => handleInputChange('paymentNetDays', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="30"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    Discount Terms
                    <HelpIcon {...FIELD_HELP.discountTerms} />
                  </label>
                  <input
                    type="text"
                    value={formData.discountTerms}
                    onChange={(e) => handleInputChange('discountTerms', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2/10 Net 45"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Categories & Products */}
        {currentStep === 3 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Categories & Products Supplied</h3>
              <p className="text-sm text-gray-600 mb-3">
                Select the categories and specific materials that this vendor supplies.
              </p>
            </div>

            {errors.categories && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-700">{errors.categories}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {CATEGORY_OPTIONS.map((category) => (
                  <label
                    key={category}
                    className="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Specific Materials</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {MATERIAL_OPTIONS.map((material) => (
                  <label
                    key={material}
                    className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.specificMaterials.includes(material)}
                      onChange={() => toggleMaterial(material)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{material}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Certifications & Documents */}
        {currentStep === 4 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Certifications & Documents</h3>
              <p className="text-sm text-gray-600 mb-3">
                Select applicable certifications and upload required documents.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Standard Certifications</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.iso9001}
                    onChange={(e) => handleInputChange('iso9001', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium">ISO 9001</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.iso14001}
                    onChange={(e) => handleInputChange('iso14001', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium">ISO 14001</span>
                </label>
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ohsas18001}
                    onChange={(e) => handleInputChange('ohsas18001', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium">OHSAS 18001</span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Other Certifications</h4>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOtherCertification()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter certification name"
                />
                <button
                  onClick={addOtherCertification}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.otherCertifications.map((cert, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center space-x-2"
                  >
                    <span>{cert}</span>
                    <button onClick={() => removeOtherCertification(cert)} className="text-blue-700 hover:text-blue-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Document Upload</h4>
              <div className="mb-2">
                <label className="flex flex-col items-center justify-center px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e, 'General')}
                    className="hidden"
                  />
                  <Upload className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 font-medium">Click to upload documents</p>
                  <p className="text-xs text-gray-400 mt-1">GST Certificate, PAN Card, Bank Details, Certificates</p>
                </label>
              </div>
              {formData.documents.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {formData.documents.map((doc) => (
                    <div key={doc.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <FileCheck className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900 text-sm truncate max-w-[150px]">{doc.name}</p>
                            <p className="text-xs text-gray-500">{doc.type}</p>
                          </div>
                        </div>
                        <button onClick={() => removeDocument(doc.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{doc.size}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>KYC Document Checklist</span>
              </h4>
              <div className="space-y-2">
                {KYC_CHECKLIST.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center space-x-3 p-2 hover:bg-blue-100 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={kycChecklist[item.id] || false}
                      onChange={() => toggleKycItem(item.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-blue-900">
                      {item.label}
                      {item.required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review & Submit */}
        {currentStep === 5 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Review & Submit</h3>
              <p className="text-sm text-gray-600 mb-3">
                Review all the information and submit the vendor for approval.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="font-semibold text-gray-900 mb-3">Vendor Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Legal Name</p>
                  <p className="font-medium text-gray-900">{formData.legalName || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Trade Name</p>
                  <p className="font-medium text-gray-900">{formData.tradeName || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">GST Number</p>
                  <p className="font-medium text-gray-900 font-mono">{formData.gstNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Contact Persons</p>
                  <p className="font-medium text-gray-900">{formData.contactPersons.length}</p>
                </div>
                <div>
                  <p className="text-gray-500">Addresses</p>
                  <p className="font-medium text-gray-900">{formData.addresses.length}</p>
                </div>
                <div>
                  <p className="text-gray-500">Categories</p>
                  <p className="font-medium text-gray-900">{formData.categories.length}</p>
                </div>
                <div>
                  <p className="text-gray-500">Documents</p>
                  <p className="font-medium text-gray-900">{formData.documents.length}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment Terms</p>
                  <p className="font-medium text-gray-900">Net {formData.paymentNetDays} Days</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes & Remarks</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any additional notes about the vendor..."
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">Vendor Onboarding Workflow</h4>
                  <p className="text-sm text-yellow-800">
                    Once submitted, this vendor will go through the approval workflow. The vendor will be set to
                    "Pending Approval" status until approved by the purchasing manager.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between sticky bottom-0 bg-white border-t border-gray-200 py-4">
        <div>
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Previous</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveDraft}
            disabled={submitting}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Save as Draft
          </button>

          {currentStep < 5 ? (
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <span>Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
              <span>{submitting ? 'Submitting...' : 'Submit for Approval'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
