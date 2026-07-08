'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { vendorService } from '@/services/VendorService';
import {
  ArrowLeft,
  Save,
  X,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Package,
  Award,
  FileText,
  Upload,
  Trash2,
  Plus,
  Star,
  Building,
  Factory,
  Warehouse,
  CheckCircle,
  XCircle,
  Globe,
  Briefcase,
  IndianRupee,
  Landmark,
  Hash,
  FileCheck,
  Download,
  Eye,
  AlertCircle,
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
  qualityAcceptanceCriteria: string;
  inspectionRequirements: string;
  documents: Document[];
  rating: number;
  status: 'active' | 'inactive' | 'on_hold' | 'blacklisted';
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

// Empty initial state — real values are loaded from the API in the effect
// below. No fabricated rows: fields render blank until the fetch populates them.
const emptyVendor: VendorFormData = {
  legalName: '',
  tradeName: '',
  vendorCode: '',
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
  qualityAcceptanceCriteria: '',
  inspectionRequirements: '',
  documents: [],
  rating: 0,
  status: 'active',
  notes: '',
};

export default function VendorEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [formData, setFormData] = useState<VendorFormData>(emptyVendor);
  const [newCertification, setNewCertification] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await vendorService.getVendorById(id)) as any;
        if (!cancelled && raw) {
          const bank = raw.bankDetails ?? {};
          const terms = raw.paymentTerms ?? {};
          const certs = raw.certifications ?? {};
          setFormData((prev) => ({
            ...prev,
            legalName: raw.legalName ?? prev.legalName,
            tradeName: raw.tradeName ?? prev.tradeName,
            vendorCode: raw.vendorCode ?? prev.vendorCode,
            gstNumber: raw.gstNumber ?? prev.gstNumber,
            panNumber: raw.panNumber ?? prev.panNumber,
            cinNumber: raw.cinNumber ?? prev.cinNumber,
            msmeRegistration: raw.msmeRegistration ?? prev.msmeRegistration,
            contactPersons: raw.contactPersons ?? prev.contactPersons,
            addresses: raw.addresses ?? prev.addresses,
            bankName: bank.bankName ?? prev.bankName,
            bankBranch: bank.branch ?? prev.bankBranch,
            accountNumber: bank.accountNumber ?? prev.accountNumber,
            ifscCode: bank.ifscCode ?? prev.ifscCode,
            accountType: bank.accountType ?? prev.accountType,
            paymentNetDays: terms.netDays ?? prev.paymentNetDays,
            paymentMethod: terms.paymentMethod ?? prev.paymentMethod,
            discountTerms: terms.discountTerms ?? prev.discountTerms,
            categories: raw.categories ?? prev.categories,
            specificMaterials: raw.specificMaterials ?? prev.specificMaterials,
            iso9001: certs.iso9001 ?? prev.iso9001,
            iso14001: certs.iso14001 ?? prev.iso14001,
            ohsas18001: certs.ohsas18001 ?? prev.ohsas18001,
            otherCertifications: certs.other ?? prev.otherCertifications,
            documents: raw.documents ?? prev.documents,
            rating: raw.rating != null ? Number(raw.rating) : prev.rating,
            status: (raw.status as VendorFormData['status']) ?? prev.status,
            notes: raw.notes ?? prev.notes,
          }));
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load vendor');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

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
      isPrimary: formData.contactPersons.length === 0,
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.legalName.trim()) newErrors.legalName = 'Legal name is required';
    if (!formData.tradeName.trim()) newErrors.tradeName = 'Trade name is required';
    if (!validateGST(formData.gstNumber)) newErrors.gstNumber = 'Invalid GST number format';
    if (!validatePAN(formData.panNumber)) newErrors.panNumber = 'Invalid PAN number format';
    if (formData.ifscCode && !validateIFSC(formData.ifscCode)) newErrors.ifscCode = 'Invalid IFSC code format';
    if (formData.contactPersons.length === 0) newErrors.contactPersons = 'At least one contact person is required';
    if (formData.addresses.length === 0) newErrors.addresses = 'At least one address is required';

    formData.addresses.forEach((addr, index) => {
      if (addr.pinCode && !validatePinCode(addr.pinCode)) {
        newErrors[`address_${index}_pin`] = 'Invalid PIN code';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) { alert('Please fix the validation errors'); return; }
    setIsSaving(true);
    try {
      await vendorService.updateVendor(id, {
        legalName: formData.legalName, tradeName: formData.tradeName, vendorCode: formData.vendorCode,
        gstNumber: formData.gstNumber, panNumber: formData.panNumber, cinNumber: formData.cinNumber,
        msmeRegistration: formData.msmeRegistration, contactPersons: formData.contactPersons, addresses: formData.addresses,
        bankDetails: { bankName: formData.bankName, branch: formData.bankBranch, accountNumber: formData.accountNumber, ifscCode: formData.ifscCode, accountType: formData.accountType },
        paymentTerms: { netDays: formData.paymentNetDays, paymentMethod: formData.paymentMethod, discountTerms: formData.discountTerms },
        categories: formData.categories, specificMaterials: formData.specificMaterials,
        certifications: { iso9001: formData.iso9001, iso14001: formData.iso14001, ohsas18001: formData.ohsas18001, other: formData.otherCertifications },
        documents: formData.documents, rating: formData.rating, status: formData.status, notes: formData.notes,
      } as any);
      alert('Vendor updated successfully!');
      router.push(`/procurement/vendors/view/${id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update vendor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      router.push(`/procurement/vendors/view/${id}`);
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

  return (
    <div className="w-full h-full px-3 py-2 overflow-auto">
      {isLoading && (<div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">Loading vendor...</div>)}
      {loadError && !isLoading && (<div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</div>)}
      {isSaving && (<div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">Saving changes...</div>)}
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={handleCancel}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Vendor Details</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Vendor</h1>
              <p className="text-gray-600 mt-1">{formData.vendorCode}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <span>Basic Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
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
                placeholder="Enter legal name"
              />
              {errors.legalName && <p className="text-xs text-red-500 mt-1">{errors.legalName}</p>}
            </div>
            <div>
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
                placeholder="Enter trade name"
              />
              {errors.tradeName && <p className="text-xs text-red-500 mt-1">{errors.tradeName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Code</label>
              <input
                type="text"
                value={formData.vendorCode}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Company Registration */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
            <FileCheck className="h-5 w-5 text-blue-600" />
            <span>Company Registration</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
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
            </div>
            <div>
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

        {/* Contact Persons */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>Contact Persons</span>
            </h3>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateContactPerson(contact.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => updateContactPerson(contact.id, 'email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span>Addresses</span>
            </h3>
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">Address Line 1</label>
                    <input
                      type="text"
                      value={address.addressLine1}
                      onChange={(e) => updateAddress(address.id, 'addressLine1', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Building name, Street name"
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => updateAddress(address.id, 'city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                    <select
                      value={address.state}
                      onChange={(e) => updateAddress(address.id, 'state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
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

        {/* Banking Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
            <Landmark className="h-5 w-5 text-blue-600" />
            <span>Banking Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
        </div>

        {/* Payment Terms */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span>Payment Terms</span>
          </h3>
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
                <option value="">Select Method</option>
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

        {/* Categories & Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span>Categories & Products Supplied</span>
          </h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CATEGORY_OPTIONS.map((category) => (
                  <label key={category} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {MATERIAL_OPTIONS.map((material) => (
                  <label key={material} className="flex items-center space-x-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
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
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
            <Award className="h-5 w-5 text-blue-600" />
            <span>Certifications</span>
          </h3>
          <div className="space-y-2">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Other Certifications</label>
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
          </div>
        </div>

        {/* Quality Parameters */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <span>Quality Parameters</span>
          </h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Acceptance Criteria</label>
              <textarea
                value={formData.qualityAcceptanceCriteria}
                onChange={(e) => handleInputChange('qualityAcceptanceCriteria', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Define quality acceptance criteria..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inspection Requirements</label>
              <textarea
                value={formData.inspectionRequirements}
                onChange={(e) => handleInputChange('inspectionRequirements', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Define inspection requirements..."
              />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Documents</span>
          </h3>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'General')}
                  className="hidden"
                />
                <div className="text-center">
                  <Upload className="h-6 w-6 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload documents</p>
                  <p className="text-xs text-gray-400 mt-1">GST, PAN, Bank, Certificates, etc.</p>
                </div>
              </label>
            </div>
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
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{doc.uploadDate}</span>
                    <span>{doc.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vendor Rating & Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
            <Star className="h-5 w-5 text-blue-600" />
            <span>Vendor Rating & Status</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5 Stars)</label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleInputChange('rating', star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= formData.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xl font-bold text-gray-900 ml-2">{formData.rating.toFixed(1)}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_hold">On Hold</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Notes & Remarks</span>
          </h3>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any additional notes or remarks about the vendor..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 sticky bottom-0 bg-white border-t border-gray-200 py-4 -mx-6 px-6">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Save className="h-5 w-5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
