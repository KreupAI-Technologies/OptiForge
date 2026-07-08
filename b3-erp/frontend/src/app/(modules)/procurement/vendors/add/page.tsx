'use client';

import { useState } from 'react';
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
  XCircle,
  ChevronRight,
  ChevronLeft,
  Building,
  Factory,
  Warehouse,
  FileCheck,
  AlertCircle,
  Landmark,
  Hash,
  Globe,
  Send,
} from 'lucide-react';

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
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const CATEGORY_OPTIONS = [
  'Raw Materials',
  'Finished Goods',
  'Components',
  'Services',
  'MRO (Maintenance, Repair, Operations)',
  'Packaging Materials',
  'Logistics & Transportation',
  'IT & Software',
  'Consultancy',
];

const MATERIAL_OPTIONS = [
  'Steel',
  'Cement',
  'Paint',
  'Chemicals',
  'Electrical Components',
  'Mechanical Parts',
  'Packaging Materials',
  'Plastics & Polymers',
  'Aluminum',
  'Copper',
  'Glass',
  'Rubber',
  'Textiles',
  'Wood & Timber',
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

export default function VendorAddPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<VendorFormData>({
    legalName: '',
    tradeName: '',
    vendorCode: generateVendorCode(),
    gstNumber: '',
    panNumber: '',
    cinNumber: '',
    msmeRegistration: '',
    website: '',
    contactPersons: [
      {
        id: '1',
        name: '',
        designation: '',
        mobile: '',
        email: '',
        department: '',
        isPrimary: true,
      },
    ],
    addresses: [
      {
        id: '1',
        type: 'registered',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pinCode: '',
        country: 'India',
      },
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newCertification, setNewCertification] = useState('');
  const [kycChecklist, setKycChecklist] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const validateGST = (gst: string): boolean => {
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
  };

  const validatePAN = (pan: string): boolean => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validateIFSC = (ifsc: string): boolean => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc);
  };

  const validatePinCode = (pin: string): boolean => {
    const pinRegex = /^[1-9][0-9]{5}$/;
    return pinRegex.test(pin);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateMobile = (mobile: string): boolean => {
    const mobileRegex = /^(\+91[\s-]?)?[0-9]{10}$/;
    return mobileRegex.test(mobile.replace(/\s/g, ''));
  };

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

  const addContactPerson = () => {
    const newContact: ContactPerson = {
      id: Date.now().toString(),
      name: '',
      designation: '',
      mobile: '',
      email: '',
      department: '',
      isPrimary: false,
    };
    setFormData((prev) => ({
      ...prev,
      contactPersons: [...prev.contactPersons, newContact],
    }));
  };

  const updateContactPerson = (id: string, field: keyof ContactPerson, value: any) => {
    setFormData((prev) => ({
      ...prev,
      contactPersons: prev.contactPersons.map((contact) =>
        contact.id === id ? { ...contact, [field]: value } : contact
      ),
    }));
  };

  const removeContactPerson = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      contactPersons: prev.contactPersons.filter((contact) => contact.id !== id),
    }));
  };

  const setPrimaryContact = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      contactPersons: prev.contactPersons.map((contact) => ({
        ...contact,
        isPrimary: contact.id === id,
      })),
    }));
  };

  const addAddress = () => {
    const newAddress: Address = {
      id: Date.now().toString(),
      type: 'office',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pinCode: '',
      country: 'India',
    };
    setFormData((prev) => ({
      ...prev,
      addresses: [...prev.addresses, newAddress],
    }));
  };

  const updateAddress = (id: string, field: keyof Address, value: any) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.map((address) =>
        address.id === id ? { ...address, [field]: value } : address
      ),
    }));
  };

  const removeAddress = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((address) => address.id !== id),
    }));
  };

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
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...newDocs],
      }));
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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.legalName.trim()) newErrors.legalName = 'Legal name is required';
      if (!formData.tradeName.trim()) newErrors.tradeName = 'Trade name is required';
      if (!validateGST(formData.gstNumber)) newErrors.gstNumber = 'Invalid GST number format';
      if (!validatePAN(formData.panNumber)) newErrors.panNumber = 'Invalid PAN number format';
    }

    if (step === 2) {
      if (formData.contactPersons.length === 0) {
        newErrors.contactPersons = 'At least one contact person is required';
      } else {
        formData.contactPersons.forEach((contact, index) => {
          if (!contact.name.trim()) newErrors[`contact_${index}_name`] = 'Name is required';
          if (contact.email && !validateEmail(contact.email)) {
            newErrors[`contact_${index}_email`] = 'Invalid email';
          }
          if (contact.mobile && !validateMobile(contact.mobile)) {
            newErrors[`contact_${index}_mobile`] = 'Invalid mobile number';
          }
        });
      }

      if (formData.addresses.length === 0) {
        newErrors.addresses = 'At least one address is required';
      } else {
        formData.addresses.forEach((addr, index) => {
          if (!addr.addressLine1.trim()) newErrors[`address_${index}_line1`] = 'Address is required';
          if (!addr.city.trim()) newErrors[`address_${index}_city`] = 'City is required';
          if (!addr.state) newErrors[`address_${index}_state`] = 'State is required';
          if (addr.pinCode && !validatePinCode(addr.pinCode)) {
            newErrors[`address_${index}_pin`] = 'Invalid PIN code';
          }
        });
      }
    }

    if (step === 3) {
      if (formData.ifscCode && !validateIFSC(formData.ifscCode)) {
        newErrors.ifscCode = 'Invalid IFSC code format';
      }
    }

    if (step === 4) {
      if (formData.categories.length === 0) {
        newErrors.categories = 'Select at least one category';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
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
      setSubmitSuccess('Vendor details saved as draft!');
      router.push('/procurement/vendors');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save vendor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      setSubmitError('Please complete all required fields');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      await vendorService.createVendor(buildVendorDto());
      setSubmitSuccess('Vendor submitted for approval successfully!');
      router.push('/procurement/vendors');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit vendor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
      router.push('/procurement/vendors');
    }
  };

  const getAddressIcon = (type: Address['type']) => {
    switch (type) {
      case 'registered':
        return <Building className="h-4 w-4" />;
      case 'factory':
        return <Factory className="h-4 w-4" />;
      case 'warehouse':
        return <Warehouse className="h-4 w-4" />;
      case 'office':
        return <Building2 className="h-4 w-4" />;
    }
  };

  const steps = [
    { number: 1, title: 'Basic Information', icon: Building2 },
    { number: 2, title: 'Contact Details', icon: User },
    { number: 3, title: 'Banking Information', icon: CreditCard },
    { number: 4, title: 'Categories & Products', icon: Package },
    { number: 5, title: 'Certifications & Documents', icon: Award },
    { number: 6, title: 'Terms & Review', icon: FileText },
  ];

  return (
    <div className="w-full h-full px-3 py-2 overflow-auto">
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
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            return (
              <div key={step.number} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      isCompleted
                        ? 'bg-green-600 border-green-600 text-white'
                        : isActive
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="h-6 w-6" /> : <StepIcon className="h-6 w-6" />}
                  </div>
                  <p
                    className={`text-sm font-medium mt-2 text-center ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Basic Information</h3>
              <p className="text-sm text-gray-600 mb-3">
                Enter the vendor's legal and trade information along with registration details.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Legal Name <span className="text-red-500">*</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trade Name <span className="text-red-500">*</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Number <span className="text-red-500">*</span>
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
                <p className="text-xs text-gray-500 mt-1">Format: 15 characters (2 digits + 13 alphanumeric)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PAN Number <span className="text-red-500">*</span>
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
                <p className="text-xs text-gray-500 mt-1">Format: 10 characters (5 letters + 4 digits + 1 letter)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CIN Number</label>
                <input
                  type="text"
                  value={formData.cinNumber}
                  onChange={(e) => handleInputChange('cinNumber', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="L27101MH1994PLC152925"
                  maxLength={21}
                />
                <p className="text-xs text-gray-500 mt-1">Corporate Identification Number (optional)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MSME Registration</label>
                <input
                  type="text"
                  value={formData.msmeRegistration}
                  onChange={(e) => handleInputChange('msmeRegistration', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="MSME-2024-12345"
                />
                <p className="text-xs text-gray-500 mt-1">Udyam/MSME registration number (optional)</p>
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
        {currentStep === 2 && (
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
                        <span className="text-sm font-medium text-gray-700">Contact Person {index + 1}</span>
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
                        {errors[`contact_${index}_name`] && (
                          <p className="text-xs text-red-500 mt-1">{errors[`contact_${index}_name`]}</p>
                        )}
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
                        {errors[`contact_${index}_mobile`] && (
                          <p className="text-xs text-red-500 mt-1">{errors[`contact_${index}_mobile`]}</p>
                        )}
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
                        {errors[`contact_${index}_email`] && (
                          <p className="text-xs text-red-500 mt-1">{errors[`contact_${index}_email`]}</p>
                        )}
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
              {errors.addresses && (
                <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-700">{errors.addresses}</p>
                </div>
              )}
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
                          placeholder="Building name, Street name"
                        />
                        {errors[`address_${index}_line1`] && (
                          <p className="text-xs text-red-500 mt-1">{errors[`address_${index}_line1`]}</p>
                        )}
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
                        {errors[`address_${index}_city`] && (
                          <p className="text-xs text-red-500 mt-1">{errors[`address_${index}_city`]}</p>
                        )}
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
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                        {errors[`address_${index}_state`] && (
                          <p className="text-xs text-red-500 mt-1">{errors[`address_${index}_state`]}</p>
                        )}
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
                        {errors[`address_${index}_pin`] && (
                          <p className="text-xs text-red-500 mt-1">{errors[`address_${index}_pin`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                        <input
                          type="text"
                          value={address.country}
                          onChange={(e) => updateAddress(address.id, 'country', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="India"
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
        {currentStep === 3 && (
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
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
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
                <p className="text-xs text-gray-500 mt-1">Format: 11 characters (4 letters + 7 alphanumeric)</p>
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
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h4 className="font-semibold text-gray-900 mb-2">Payment Terms</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credit Period (Days)</label>
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
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Terms</label>
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
        {currentStep === 4 && (
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
        {currentStep === 5 && (
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
                    <button
                      onClick={() => removeOtherCertification(cert)}
                      className="text-blue-700 hover:text-blue-900"
                    >
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
                            <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
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

        {/* Step 6: Terms & Review */}
        {currentStep === 6 && (
          <div className="space-y-3">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Review & Submit</h3>
              <p className="text-sm text-gray-600 mb-3">
                Review all the information and submit the vendor for approval.
              </p>
            </div>

            {/* Summary */}
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
                placeholder="Add any additional notes or remarks about the vendor..."
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
          {currentStep > 1 && (
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

          {currentStep < 6 ? (
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
