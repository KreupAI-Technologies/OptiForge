'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { crmService } from '@/services/crm.service';
import {
  ArrowLeft,
  Save,
  Building2,
  MapPin,
  Users,
  DollarSign,
  ShoppingCart,
  Truck,
  FileText,
  X,
  Plus,
  Phone,
  Mail,
  Globe,
  User,
  Calendar,
  Tag,
  CreditCard,
  Briefcase,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { useToast } from '@/components/ui';

// Comprehensive TypeScript Interface matching Enterprise ERP Systems
interface Address {
  id: string;
  addressType: 'billing' | 'shipping' | 'correspondence' | 'warehouse';
  buildingFlat: string;
  localityArea: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  isDefaultBilling: boolean;
  isDefaultShipping: boolean;
}

interface ContactPerson {
  id: string;
  role: 'primary' | 'billing' | 'technical' | 'purchasing' | 'decision_maker' | 'shipping';
  firstName: string;
  lastName: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  mobile: string;
  preferredContactMethod: 'email' | 'phone' | 'mobile';
  isPrimary: boolean;
}

interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  upiId: string;
}

interface CustomField {
  key: string;
  value: string;
}

interface CustomerFormData {
  // Step 1: General Data
  customerNumber: string;
  customerName: string;
  legalName: string;
  tradeName: string;
  customerGroup: 'wholesale' | 'retail' | 'distributor' | 'oem' | 'end_user' | '';
  customerClassification: 'A' | 'B' | 'C' | '';
  industrySector: string;
  companySize: string;
  annualRevenue: string;
  udyamNumber: string;
  gstNumber: string;
  panNumber: string;
  tanNumber: string;
  gstRegistrationType: string;
  website: string;
  generalEmail: string;
  generalPhone: string;

  // Step 2: Address Management
  addresses: Address[];

  // Step 3: Contact Persons
  contacts: ContactPerson[];

  // Step 4: Financial & Credit
  creditLimit: string;
  creditUsed: string;
  availableCredit: string;
  creditStatus: 'approved' | 'on_hold' | 'suspended' | 'review_required' | '';
  creditCheckRequired: boolean;
  paymentTerms: string;
  paymentMethod: string;
  dunningProcedure: string;
  interestCalculation: boolean;
  bankDetails: BankDetails;
  preferredCurrency: string;
  exchangeRateType: string;
  priceListAssignment: string;
  discountGroup: string;
  taxClassification: string;
  taxExempt: boolean;
  taxExemptReason: string;
  taxIdEin: string;

  // Step 5: Sales & Marketing
  salesOrganization: string;
  distributionChannel: string;
  division: string;
  salesOffice: string;
  salesGroup: string;
  accountManager: string;
  salesRepresentative: string;
  territoryAssignment: string;
  customerHierarchy: string;
  marketSegment: string;
  preferredVendorStatus: boolean;
  abcClassificationSales: 'A' | 'B' | 'C' | '';
  salesBlock: boolean;
  salesBlockReason: string;
  deliveryBlock: boolean;
  deliveryBlockReason: string;
  billingBlock: boolean;
  billingBlockReason: string;
  incoterms: string;
  shippingConditions: string;
  deliveryPriority: 'high' | 'medium' | 'low' | '';
  partialDeliveryAllowed: boolean;
  maxPartialDeliveries: string;

  // Step 6: Logistics & Shipping
  shippingMethod: string;
  preferredCarrier: string;
  freightTerms: string;
  shippingInstructions: string;
  loadingUnloadingTimes: string;
  dockHours: string;
  specialHandlingRequirements: string;
  insuranceRequired: boolean;
  warehouseAssignment: string;
  deliveryTolerance: string;
  pickingLocation: string;
  packingRequirements: string;
  labelingRequirements: string;
  routeSchedule: string;
  deliveryDayPreferences: string[];
  deliveryTimeWindow: string;

  // Step 7: Additional Information
  customerSince: string;
  accountStatus: 'active' | 'inactive' | 'suspended' | 'prospect' | 'closed' | '';
  businessRelationshipType: 'b2b' | 'b2c' | 'b2g' | '';
  customerLifecycleStage: 'prospect' | 'new' | 'growing' | 'mature' | 'at_risk' | 'churned' | '';
  riskRating: 'low' | 'medium' | 'high' | '';
  complianceStatus: string;
  certificationsRequired: string[];
  contractNumber: string;
  contractStartDate: string;
  contractEndDate: string;
  serviceLevelAgreement: string;
  specialInstructions: string;
  internalNotes: string;
  tags: string[];
  attachments: string[];
  customFields: CustomField[];
  dataPrivacyConsent: boolean;
  marketingConsent: boolean;
}

// Enterprise-level dropdown options
const industries = [
  'Kitchen Cabinet Manufacturing',
  'Custom Cabinetry',
  'Modular Kitchen Systems',
  'Commercial Kitchen Equipment',
  'Residential Kitchen Solutions',
  'Interior Design & Fit-Out',
  'Construction & General Contracting',
  'Real Estate Development',
  'Property Management',
  'Home Improvement Retail',
  'Wholesale Distribution',
  'Hospitality & Hotels',
  'Restaurant & Food Service',
  'Healthcare Facilities',
  'Educational Institutions',
  'Government & Public Sector',
  'Corporate Office Fit-Out',
  'Architecture & Design Firms',
  'Other',
];

const companySizes = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

const paymentTermsOptions = [
  'Advance Payment',
  'Net 15 days',
  'Net 30 days',
  'Net 45 days',
  '30-60-90 days',
  'PDC (Post Dated Cheque)',
  'Against Delivery',
];

const paymentMethodOptions = [
  'NEFT/RTGS',
  'UPI',
  'Cheque',
  'Cash',
  'Demand Draft',
  'LC (Letter of Credit)',
];

const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR', 'MXN'];

const incotermsOptions = [
  'EXW (Ex Works)',
  'FCA (Free Carrier)',
  'FOB (Free on Board)',
  'CFR (Cost and Freight)',
  'CIF (Cost, Insurance and Freight)',
  'CPT (Carriage Paid To)',
  'CIP (Carriage and Insurance Paid To)',
  'DAP (Delivered at Place)',
  'DPU (Delivered at Place Unloaded)',
  'DDP (Delivered Duty Paid)',
];

const shippingMethodOptions = [
  'Ground',
  'Air Freight',
  'Sea Freight',
  'Express',
  'LTL (Less Than Truckload)',
  'FTL (Full Truckload)',
  'Courier',
  'Rail',
  'Intermodal',
];

const freightTermsOptions = ['Prepaid', 'Collect', 'Third Party'];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const certificationOptions = [
  'ISO 9001',
  'ISO 14001',
  'FDA Approved',
  'CE Certified',
  'UL Listed',
  'OSHA Compliant',
  'Green Building Certified',
  'Energy Star',
];

const indianStates = [
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'Delhi',
  'Gujarat',
  'West Bengal',
  'Rajasthan',
  'Uttar Pradesh',
  'Telangana',
  'Kerala',
  'Andhra Pradesh',
  'Madhya Pradesh',
  'Haryana',
  'Punjab',
  'Bihar',
];

const indianBanks = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
];

const gstTypes = ['Regular', 'Composition', 'Unregistered'];

// Empty form shape used to initialise controlled inputs before the real
// customer is loaded from the API on mount.
const emptyCustomerData: CustomerFormData = {
  customerNumber: '',
  customerName: '',
  legalName: '',
  tradeName: '',
  customerGroup: 'wholesale',
  customerClassification: 'A',
  industrySector: '',
  companySize: '',
  annualRevenue: '',
  udyamNumber: '',
  gstNumber: '',
  panNumber: '',
  tanNumber: '',
  gstRegistrationType: 'regular',
  website: '',
  generalEmail: '',
  generalPhone: '',

  addresses: [],

  contacts: [],

  creditLimit: '',
  creditUsed: '',
  availableCredit: '',
  creditStatus: 'approved',
  creditCheckRequired: false,
  paymentTerms: '',
  paymentMethod: '',
  dunningProcedure: '',
  interestCalculation: false,
  bankDetails: {
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    upiId: '',
  },
  preferredCurrency: 'INR',
  exchangeRateType: '',
  priceListAssignment: '',
  discountGroup: '',
  taxClassification: '',
  taxExempt: false,
  taxExemptReason: '',
  taxIdEin: '',

  salesOrganization: '',
  distributionChannel: '',
  division: '',
  salesOffice: '',
  salesGroup: '',
  accountManager: '',
  salesRepresentative: '',
  territoryAssignment: '',
  customerHierarchy: '',
  marketSegment: '',
  preferredVendorStatus: false,
  abcClassificationSales: 'A',
  salesBlock: false,
  salesBlockReason: '',
  deliveryBlock: false,
  deliveryBlockReason: '',
  billingBlock: false,
  billingBlockReason: '',
  incoterms: '',
  shippingConditions: '',
  deliveryPriority: 'high',
  partialDeliveryAllowed: false,
  maxPartialDeliveries: '',

  shippingMethod: '',
  preferredCarrier: '',
  freightTerms: '',
  shippingInstructions: '',
  loadingUnloadingTimes: '',
  dockHours: '',
  specialHandlingRequirements: '',
  insuranceRequired: false,
  warehouseAssignment: '',
  deliveryTolerance: '',
  pickingLocation: '',
  packingRequirements: '',
  labelingRequirements: '',
  routeSchedule: '',
  deliveryDayPreferences: [],
  deliveryTimeWindow: '',

  customerSince: '',
  accountStatus: 'active',
  businessRelationshipType: 'b2b',
  customerLifecycleStage: 'mature',
  riskRating: 'low',
  complianceStatus: '',
  certificationsRequired: [],
  contractNumber: '',
  contractStartDate: '',
  contractEndDate: '',
  serviceLevelAgreement: '',
  specialInstructions: '',
  internalNotes: '',
  tags: [],
  attachments: [],
  customFields: [],
  dataPrivacyConsent: true,
  marketingConsent: true,
};

export default function EditCustomerPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const params = useParams();
  const customerId = params.id as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CustomerFormData>(emptyCustomerData);

  useEffect(() => {
    let active = true;
    if (!customerId) return;
    (async () => {
      try {
        const raw: any = await crmService.customers.getById(customerId);
        if (active && raw) {
          setFormData((prev) => ({
            ...prev,
            ...raw,
            customerName: raw.customerName ?? raw.name ?? prev.customerName,
          }));
        }
      } catch (err) {
        // keep empty defaults on failure
      }
    })();
    return () => {
      active = false;
    };
  }, [customerId]);

  const [newTag, setNewTag] = useState('');
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    addressType: 'billing',
    buildingFlat: '',
    localityArea: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    isDefaultBilling: false,
    isDefaultShipping: false,
  });
  const [newContact, setNewContact] = useState<Partial<ContactPerson>>({
    role: 'primary',
    firstName: '',
    lastName: '',
    title: '',
    department: '',
    email: '',
    phone: '',
    mobile: '',
    preferredContactMethod: 'email',
    isPrimary: false,
  });

  const updateFormData = (field: keyof CustomerFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Calculate available credit automatically
      if (field === 'creditLimit' || field === 'creditUsed') {
        const limit = parseFloat(field === 'creditLimit' ? value : updated.creditLimit) || 0;
        const used = parseFloat(field === 'creditUsed' ? value : updated.creditUsed) || 0;
        updated.availableCredit = (limit - used).toString();
      }

      return updated;
    });
  };

  const addAddress = () => {
    if (newAddress.buildingFlat && newAddress.city) {
      const address: Address = {
        id: Date.now().toString(),
        addressType: newAddress.addressType || 'billing',
        buildingFlat: newAddress.buildingFlat || '',
        localityArea: newAddress.localityArea || '',
        city: newAddress.city || '',
        state: newAddress.state || '',
        pinCode: newAddress.pinCode || '',
        country: newAddress.country || 'India',
        isDefaultBilling: newAddress.isDefaultBilling || false,
        isDefaultShipping: newAddress.isDefaultShipping || false,
      };
      updateFormData('addresses', [...formData.addresses, address]);
      setNewAddress({
        addressType: 'billing',
        buildingFlat: '',
        localityArea: '',
        city: '',
        state: '',
        pinCode: '',
        country: 'India',
        isDefaultBilling: false,
        isDefaultShipping: false,
      });
    }
  };

  const removeAddress = (id: string) => {
    updateFormData('addresses', formData.addresses.filter(a => a.id !== id));
  };

  const addContact = () => {
    if (newContact.firstName && newContact.lastName && newContact.email) {
      const contact: ContactPerson = {
        id: Date.now().toString(),
        role: newContact.role || 'primary',
        firstName: newContact.firstName || '',
        lastName: newContact.lastName || '',
        title: newContact.title || '',
        department: newContact.department || '',
        email: newContact.email || '',
        phone: newContact.phone || '',
        mobile: newContact.mobile || '',
        preferredContactMethod: newContact.preferredContactMethod || 'email',
        isPrimary: newContact.isPrimary || false,
      };
      updateFormData('contacts', [...formData.contacts, contact]);
      setNewContact({
        role: 'primary',
        firstName: '',
        lastName: '',
        title: '',
        department: '',
        email: '',
        phone: '',
        mobile: '',
        preferredContactMethod: 'email',
        isPrimary: false,
      });
    }
  };

  const removeContact = (id: string) => {
    updateFormData('contacts', formData.contacts.filter(c => c.id !== id));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    updateFormData('tags', formData.tags.filter(t => t !== tag));
  };

  const addCustomField = () => {
    const key = prompt('Enter field name:');
    const value = prompt('Enter field value:');
    if (key && value) {
      updateFormData('customFields', [...formData.customFields, { key, value }]);
    }
  };

  const removeCustomField = (index: number) => {
    updateFormData('customFields', formData.customFields.filter((_, i) => i !== index));
  };

  const toggleDeliveryDay = (day: string) => {
    if (formData.deliveryDayPreferences.includes(day)) {
      updateFormData('deliveryDayPreferences', formData.deliveryDayPreferences.filter(d => d !== day));
    } else {
      updateFormData('deliveryDayPreferences', [...formData.deliveryDayPreferences, day]);
    }
  };

  const toggleCertification = (cert: string) => {
    if (formData.certificationsRequired.includes(cert)) {
      updateFormData('certificationsRequired', formData.certificationsRequired.filter(c => c !== cert));
    } else {
      updateFormData('certificationsRequired', [...formData.certificationsRequired, cert]);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload: any = {
        ...formData,
        name: formData.customerName,
        companyId: 'default-company-id',
      };
      await crmService.customers.update(customerId, payload);
      addToast({
        title: 'Customer Updated',
        message: `${formData.customerName} (${formData.customerNumber}) has been updated successfully`,
        variant: 'success'
      });
      router.push('/crm/customers');
    } catch (err) {
      addToast({
        title: 'Error',
        message: 'Failed to update customer. Please try again.',
        variant: 'error'
      });
    }
  };

  const steps = [
    { id: 1, name: 'General Data', icon: Building2 },
    { id: 2, name: 'Address Management', icon: MapPin },
    { id: 3, name: 'Contact Persons', icon: Users },
    { id: 4, name: 'Financial & Credit', icon: DollarSign },
    { id: 5, name: 'Sales & Marketing', icon: ShoppingCart },
    { id: 6, name: 'Logistics & Shipping', icon: Truck },
    { id: 7, name: 'Additional Info', icon: FileText },
  ];

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
                <p className="text-sm text-gray-600">Update customer profile information - ID: {customerId}</p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-3 bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className={`flex items-center space-x-3 ${
                        currentStep === step.id
                          ? 'text-blue-600'
                          : currentStep > step.id
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                          currentStep === step.id
                            ? 'border-blue-600 bg-blue-50'
                            : currentStep > step.id
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-sm hidden md:block">{step.name}</span>
                    </button>
                    {index < steps.length - 1 && (
                      <div className="flex-1 mx-4">
                        <div
                          className={`h-1 rounded ${
                            currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            {/* Step 1: General Data */}
            {currentStep === 1 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <Building2 className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">General Data</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customerNumber}
                      onChange={(e) => updateFormData('customerNumber', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      placeholder="CUST-2025-0001"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => updateFormData('customerName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Modern Kitchen Designs Ltd"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Legal Name</label>
                    <input
                      type="text"
                      value={formData.legalName}
                      onChange={(e) => updateFormData('legalName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Modern Kitchen Designs Limited"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trade Name / DBA</label>
                    <input
                      type="text"
                      value={formData.tradeName}
                      onChange={(e) => updateFormData('tradeName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="MKD Kitchens"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.customerGroup}
                      onChange={(e) => updateFormData('customerGroup', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Group</option>
                      <option value="wholesale">Wholesale</option>
                      <option value="retail">Retail</option>
                      <option value="distributor">Distributor</option>
                      <option value="oem">OEM</option>
                      <option value="end_user">End User</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Classification</label>
                    <select
                      value={formData.customerClassification}
                      onChange={(e) => updateFormData('customerClassification', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Classification</option>
                      <option value="A">A - High Value</option>
                      <option value="B">B - Medium Value</option>
                      <option value="C">C - Low Value</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry Sector <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.industrySector}
                      onChange={(e) => updateFormData('industrySector', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Industry</option>
                      {industries.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                    <select
                      value={formData.companySize}
                      onChange={(e) => updateFormData('companySize', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Size</option>
                      {companySizes.map(size => (
                        <option key={size} value={size}>{size} employees</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Annual Revenue</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.annualRevenue}
                        onChange={(e) => updateFormData('annualRevenue', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="5000000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Udyam Registration Number</label>
                    <input
                      type="text"
                      value={formData.udyamNumber}
                      onChange={(e) => updateFormData('udyamNumber', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="UDYAM-MH-12-1234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GST Number (GSTIN)</label>
                    <input
                      type="text"
                      value={formData.gstNumber}
                      onChange={(e) => updateFormData('gstNumber', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="27AAAAA0000A1Z5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                    <input
                      type="text"
                      value={formData.panNumber}
                      onChange={(e) => updateFormData('panNumber', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="AAAPL1234C"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">TAN Number</label>
                    <input
                      type="text"
                      value={formData.tanNumber}
                      onChange={(e) => updateFormData('tanNumber', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="MUMM12345A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GST Registration Type</label>
                    <select
                      value={formData.gstRegistrationType}
                      onChange={(e) => updateFormData('gstRegistrationType', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Type</option>
                      {gstTypes.map((type) => (
                        <option key={type} value={type.toLowerCase()}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => updateFormData('website', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://www.company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      General Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.generalEmail}
                        onChange={(e) => updateFormData('generalEmail', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="info@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      General Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.generalPhone}
                        onChange={(e) => updateFormData('generalPhone', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Address Management */}
            {currentStep === 2 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <MapPin className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Address Management</h2>
                </div>

                {/* Existing Addresses */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Existing Addresses</h3>
                  {formData.addresses.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                      <MapPin className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-gray-500">No addresses added yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {formData.addresses.map((address) => (
                        <div key={address.id} className="border border-gray-300 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                              {address.addressType}
                            </span>
                            <button
                              onClick={() => removeAddress(address.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="text-sm text-gray-700 space-y-1">
                            <p className="font-medium">{address.buildingFlat}</p>
                            {address.localityArea && <p>{address.localityArea}</p>}
                            <p>{address.city}, {address.state} {address.pinCode}</p>
                            <p>{address.country}</p>
                          </div>
                          <div className="mt-3 flex gap-2">
                            {address.isDefaultBilling && (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                Default Billing
                              </span>
                            )}
                            {address.isDefaultShipping && (
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                Default Shipping
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add New Address */}
                <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Add New Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                      <select
                        value={newAddress.addressType}
                        onChange={(e) => setNewAddress({...newAddress, addressType: e.target.value as any})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="billing">Billing</option>
                        <option value="shipping">Shipping</option>
                        <option value="correspondence">Correspondence</option>
                        <option value="warehouse">Warehouse</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Building/Flat No.</label>
                      <input
                        type="text"
                        value={newAddress.buildingFlat}
                        onChange={(e) => setNewAddress({...newAddress, buildingFlat: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Building 123, 4th Floor"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Locality/Area</label>
                      <input
                        type="text"
                        value={newAddress.localityArea}
                        onChange={(e) => setNewAddress({...newAddress, localityArea: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Andheri Industrial Estate"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Mumbai"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <select
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="">Select State</option>
                        {indianStates.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                      <input
                        type="text"
                        value={newAddress.pinCode}
                        onChange={(e) => setNewAddress({...newAddress, pinCode: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="400001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        value={newAddress.country}
                        onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="India"
                      />
                    </div>

                    <div className="md:col-span-2 flex gap-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newAddress.isDefaultBilling}
                          onChange={(e) => setNewAddress({...newAddress, isDefaultBilling: e.target.checked})}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Set as Default Billing</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newAddress.isDefaultShipping}
                          onChange={(e) => setNewAddress({...newAddress, isDefaultShipping: e.target.checked})}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Set as Default Shipping</span>
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <button
                        onClick={addAddress}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                      >
                        <Plus className="h-5 w-5" />
                        <span>Add Address</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Contact Persons */}
            {currentStep === 3 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Contact Persons</h2>
                </div>

                {/* Existing Contacts */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Existing Contacts</h3>
                  {formData.contacts.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                      <Users className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-gray-500">No contacts added yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {formData.contacts.map((contact) => (
                        <div key={contact.id} className="border border-gray-300 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className="inline-flex px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize mb-2">
                                {contact.role.replace('_', ' ')}
                              </span>
                              {contact.isPrimary && (
                                <span className="ml-2 inline-flex px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                                  Primary
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => removeContact(contact.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                          <div className="text-sm text-gray-700 space-y-1">
                            <p className="font-semibold text-base">{contact.firstName} {contact.lastName}</p>
                            <p className="text-gray-600">{contact.title} - {contact.department}</p>
                            <div className="flex items-center text-gray-600 mt-2">
                              <Mail className="h-4 w-4 mr-2" />
                              <span>{contact.email}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              <span>{contact.phone}</span>
                            </div>
                            {contact.mobile && (
                              <div className="flex items-center text-gray-600">
                                <Phone className="h-4 w-4 mr-2" />
                                <span>{contact.mobile} (Mobile)</span>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Preferred: {contact.preferredContactMethod}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add New Contact */}
                <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Add New Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <select
                        value={newContact.role}
                        onChange={(e) => setNewContact({...newContact, role: e.target.value as any})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="primary">Primary</option>
                        <option value="billing">Billing</option>
                        <option value="technical">Technical</option>
                        <option value="purchasing">Purchasing</option>
                        <option value="decision_maker">Decision Maker</option>
                        <option value="shipping">Shipping</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={newContact.firstName}
                        onChange={(e) => setNewContact({...newContact, firstName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="John"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={newContact.lastName}
                        onChange={(e) => setNewContact({...newContact, lastName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Smith"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={newContact.title}
                        onChange={(e) => setNewContact({...newContact, title: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Sales Manager"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <input
                        type="text"
                        value={newContact.department}
                        onChange={(e) => setNewContact({...newContact, department: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Sales"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="john.smith@company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                      <input
                        type="tel"
                        value={newContact.mobile}
                        onChange={(e) => setNewContact({...newContact, mobile: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="+1 (555) 987-6543"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact Method</label>
                      <select
                        value={newContact.preferredContactMethod}
                        onChange={(e) => setNewContact({...newContact, preferredContactMethod: e.target.value as any})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="mobile">Mobile</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newContact.isPrimary}
                          onChange={(e) => setNewContact({...newContact, isPrimary: e.target.checked})}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Set as Primary Contact</span>
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <button
                        onClick={addContact}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                      >
                        <Plus className="h-5 w-5" />
                        <span>Add Contact</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Financial & Credit */}
            {currentStep === 4 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Financial & Credit Management</h2>
                </div>

                {/* Credit Information */}
                <div className="border border-gray-300 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Credit Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Credit Limit</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          value={formData.creditLimit}
                          onChange={(e) => updateFormData('creditLimit', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="50000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Credit Used</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          value={formData.creditUsed}
                          onChange={(e) => updateFormData('creditUsed', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="15000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Available Credit</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          value={formData.availableCredit}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          placeholder="35000"
                          disabled
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Credit Status</label>
                      <select
                        value={formData.creditStatus}
                        onChange={(e) => updateFormData('creditStatus', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Status</option>
                        <option value="approved">Approved</option>
                        <option value="on_hold">On Hold</option>
                        <option value="suspended">Suspended</option>
                        <option value="review_required">Review Required</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.creditCheckRequired}
                          onChange={(e) => updateFormData('creditCheckRequired', e.target.checked)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Credit Check Required for Orders</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Payment Terms */}
                <div className="border border-gray-300 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Terms</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                      <select
                        value={formData.paymentTerms}
                        onChange={(e) => updateFormData('paymentTerms', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {paymentTermsOptions.map(term => (
                          <option key={term} value={term}>{term}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => updateFormData('paymentMethod', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {paymentMethodOptions.map(method => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dunning Procedure</label>
                      <input
                        type="text"
                        value={formData.dunningProcedure}
                        onChange={(e) => updateFormData('dunningProcedure', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Standard"
                      />
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 h-full">
                        <input
                          type="checkbox"
                          checked={formData.interestCalculation}
                          onChange={(e) => updateFormData('interestCalculation', e.target.checked)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Enable Interest Calculation on Overdue</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="border border-gray-300 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Bank Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                      <select
                        value={formData.bankDetails.bankName}
                        onChange={(e) => updateFormData('bankDetails', {...formData.bankDetails, bankName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Bank</option>
                        {indianBanks.map((bank) => (
                          <option key={bank} value={bank}>{bank}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                      <input
                        type="text"
                        value={formData.bankDetails.accountNumber}
                        onChange={(e) => updateFormData('bankDetails', {...formData.bankDetails, accountNumber: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="****1234"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                      <input
                        type="text"
                        value={formData.bankDetails.ifscCode}
                        onChange={(e) => updateFormData('bankDetails', {...formData.bankDetails, ifscCode: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="HDFC0001234"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                      <input
                        type="text"
                        value={formData.bankDetails.branchName}
                        onChange={(e) => updateFormData('bankDetails', {...formData.bankDetails, branchName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Andheri West, Mumbai"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                      <input
                        type="text"
                        value={formData.bankDetails.upiId}
                        onChange={(e) => updateFormData('bankDetails', {...formData.bankDetails, upiId: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="companyname@hdfcbank"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing & Tax */}
                <div className="border border-gray-300 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing & Tax Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Currency</label>
                      <select
                        value={formData.preferredCurrency}
                        onChange={(e) => updateFormData('preferredCurrency', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {currencies.map(curr => (
                          <option key={curr} value={curr}>{curr}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Exchange Rate Type</label>
                      <input
                        type="text"
                        value={formData.exchangeRateType}
                        onChange={(e) => updateFormData('exchangeRateType', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Standard"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price List Assignment</label>
                      <input
                        type="text"
                        value={formData.priceListAssignment}
                        onChange={(e) => updateFormData('priceListAssignment', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Wholesale Price List"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discount Group</label>
                      <input
                        type="text"
                        value={formData.discountGroup}
                        onChange={(e) => updateFormData('discountGroup', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tier 1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tax Classification</label>
                      <input
                        type="text"
                        value={formData.taxClassification}
                        onChange={(e) => updateFormData('taxClassification', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Taxable"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID / EIN</label>
                      <input
                        type="text"
                        value={formData.taxIdEin}
                        onChange={(e) => updateFormData('taxIdEin', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="12-3456789"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.taxExempt}
                          onChange={(e) => updateFormData('taxExempt', e.target.checked)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Tax Exempt</span>
                      </label>
                    </div>

                    {formData.taxExempt && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tax Exemption Reason</label>
                        <input
                          type="text"
                          value={formData.taxExemptReason}
                          onChange={(e) => updateFormData('taxExemptReason', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Non-profit organization"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 5: Sales & Marketing */}
            {currentStep === 5 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Sales & Marketing</h2>
                </div>

                {/* Sales Organization */}
                <div className="border border-gray-300 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Organization</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sales Organization</label>
                      <input
                        type="text"
                        value={formData.salesOrganization}
                        onChange={(e) => updateFormData('salesOrganization', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="US East"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Distribution Channel</label>
                      <input
                        type="text"
                        value={formData.distributionChannel}
                        onChange={(e) => updateFormData('distributionChannel', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Direct Sales"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Division</label>
                      <input
                        type="text"
                        value={formData.division}
                        onChange={(e) => updateFormData('division', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Kitchen & Bath"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sales Office</label>
                      <input
                        type="text"
                        value={formData.salesOffice}
                        onChange={(e) => updateFormData('salesOffice', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="New York"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sales Group</label>
                      <input
                        type="text"
                        value={formData.salesGroup}
                        onChange={(e) => updateFormData('salesGroup', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Commercial Sales"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Territory Assignment</label>
                      <input
                        type="text"
                        value={formData.territoryAssignment}
                        onChange={(e) => updateFormData('territoryAssignment', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Northeast"
                      />
                    </div>
                  </div>
                </div>

                {/* Account Management */}
                <div className="border border-gray-300 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Manager</label>
                      <select
                        value={formData.accountManager}
                        onChange={(e) => updateFormData('accountManager', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Account Manager</option>
                        <option value="sarah-johnson">Sarah Johnson</option>
                        <option value="michael-chen">Michael Chen</option>
                        <option value="david-park">David Park</option>
                        <option value="emily-davis">Emily Davis</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sales Representative</label>
                      <select
                        value={formData.salesRepresentative}
                        onChange={(e) => updateFormData('salesRepresentative', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Sales Rep</option>
                        <option value="john-williams">John Williams</option>
                        <option value="lisa-anderson">Lisa Anderson</option>
                        <option value="robert-brown">Robert Brown</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer Hierarchy</label>
                      <input
                        type="text"
                        value={formData.customerHierarchy}
                        onChange={(e) => updateFormData('customerHierarchy', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="National Account"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Market Segment</label>
                      <input
                        type="text"
                        value={formData.marketSegment}
                        onChange={(e) => updateFormData('marketSegment', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Mid-Market"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ABC Classification (Sales)</label>
                      <select
                        value={formData.abcClassificationSales}
                        onChange={(e) => updateFormData('abcClassificationSales', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Classification</option>
                        <option value="A">A - High Volume</option>
                        <option value="B">B - Medium Volume</option>
                        <option value="C">C - Low Volume</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 h-full">
                        <input
                          type="checkbox"
                          checked={formData.preferredVendorStatus}
                          onChange={(e) => updateFormData('preferredVendorStatus', e.target.checked)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Preferred Vendor Status</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Sales Blocks */}
                <div className="border border-gray-300 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Sales Blocks & Controls</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.salesBlock}
                          onChange={(e) => updateFormData('salesBlock', e.target.checked)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Sales Block Enabled</span>
                      </label>
                    </div>
                    {formData.salesBlock && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sales Block Reason</label>
                        <input
                          type="text"
                          value={formData.salesBlockReason}
                          onChange={(e) => updateFormData('salesBlockReason', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Reason for sales block"
                        />
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.deliveryBlock}
                          onChange={(e) => updateFormData('deliveryBlock', e.target.checked)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Delivery Block Enabled</span>
                      </label>
                    </div>
                    {formData.deliveryBlock && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Block Reason</label>
                        <input
                          type="text"
                          value={formData.deliveryBlockReason}
                          onChange={(e) => updateFormData('deliveryBlockReason', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Reason for delivery block"
                        />
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.billingBlock}
                          onChange={(e) => updateFormData('billingBlock', e.target.checked)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Billing Block Enabled</span>
                      </label>
                    </div>
                    {formData.billingBlock && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Billing Block Reason</label>
                        <input
                          type="text"
                          value={formData.billingBlockReason}
                          onChange={(e) => updateFormData('billingBlockReason', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Reason for billing block"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Terms */}
                <div className="border border-gray-300 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Delivery Terms</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Incoterms</label>
                      <select
                        value={formData.incoterms}
                        onChange={(e) => updateFormData('incoterms', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {incotermsOptions.map(term => (
                          <option key={term} value={term}>{term}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Conditions</label>
                      <input
                        type="text"
                        value={formData.shippingConditions}
                        onChange={(e) => updateFormData('shippingConditions', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Standard"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Priority</label>
                      <select
                        value={formData.deliveryPriority}
                        onChange={(e) => updateFormData('deliveryPriority', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 h-full">
                        <input
                          type="checkbox"
                          checked={formData.partialDeliveryAllowed}
                          onChange={(e) => updateFormData('partialDeliveryAllowed', e.target.checked)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Partial Delivery Allowed</span>
                      </label>
                    </div>

                    {formData.partialDeliveryAllowed && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Partial Deliveries</label>
                        <input
                          type="number"
                          value={formData.maxPartialDeliveries}
                          onChange={(e) => updateFormData('maxPartialDeliveries', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="3"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentStep(6)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Logistics & Shipping */}
            {currentStep === 6 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <Truck className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Logistics & Shipping</h2>
                </div>

                {/* Shipping Configuration */}
                <div className="border border-gray-300 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Shipping Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Method</label>
                      <select
                        value={formData.shippingMethod}
                        onChange={(e) => updateFormData('shippingMethod', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {shippingMethodOptions.map(method => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Carrier</label>
                      <input
                        type="text"
                        value={formData.preferredCarrier}
                        onChange={(e) => updateFormData('preferredCarrier', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="FedEx"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Freight Terms</label>
                      <select
                        value={formData.freightTerms}
                        onChange={(e) => updateFormData('freightTerms', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {freightTermsOptions.map(term => (
                          <option key={term} value={term}>{term}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center space-x-2 h-full">
                        <input
                          type="checkbox"
                          checked={formData.insuranceRequired}
                          onChange={(e) => updateFormData('insuranceRequired', e.target.checked)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Insurance Required</span>
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Instructions</label>
                      <textarea
                        value={formData.shippingInstructions}
                        onChange={(e) => updateFormData('shippingInstructions', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Call 24 hours before delivery"
                      />
                    </div>
                  </div>
                </div>

                {/* Warehouse & Dock Information */}
                <div className="border border-gray-300 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Warehouse & Dock Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse Assignment</label>
                      <input
                        type="text"
                        value={formData.warehouseAssignment}
                        onChange={(e) => updateFormData('warehouseAssignment', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Warehouse A"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Picking Location</label>
                      <input
                        type="text"
                        value={formData.pickingLocation}
                        onChange={(e) => updateFormData('pickingLocation', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Zone B-12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Loading/Unloading Times</label>
                      <input
                        type="text"
                        value={formData.loadingUnloadingTimes}
                        onChange={(e) => updateFormData('loadingUnloadingTimes', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="30 minutes"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dock Hours</label>
                      <input
                        type="text"
                        value={formData.dockHours}
                        onChange={(e) => updateFormData('dockHours', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="8:00 AM - 5:00 PM"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Tolerance (%)</label>
                      <input
                        type="number"
                        value={formData.deliveryTolerance}
                        onChange={(e) => updateFormData('deliveryTolerance', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Route Schedule</label>
                      <input
                        type="text"
                        value={formData.routeSchedule}
                        onChange={(e) => updateFormData('routeSchedule', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tuesday/Thursday"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Special Handling Requirements</label>
                      <textarea
                        value={formData.specialHandlingRequirements}
                        onChange={(e) => updateFormData('specialHandlingRequirements', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Fragile items - Handle with care"
                      />
                    </div>
                  </div>
                </div>

                {/* Packing & Labeling */}
                <div className="border border-gray-300 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Packing & Labeling</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Packing Requirements</label>
                      <input
                        type="text"
                        value={formData.packingRequirements}
                        onChange={(e) => updateFormData('packingRequirements', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Shrink wrap pallets"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Labeling Requirements</label>
                      <input
                        type="text"
                        value={formData.labelingRequirements}
                        onChange={(e) => updateFormData('labelingRequirements', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Barcode labels on all packages"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Preferences */}
                <div className="border border-gray-300 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Delivery Preferences</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Delivery Days</label>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map(day => (
                          <button
                            key={day}
                            onClick={() => toggleDeliveryDay(day)}
                            className={`px-4 py-2 rounded-lg border transition-colors ${
                              formData.deliveryDayPreferences.includes(day)
                                ? 'bg-blue-100 border-blue-600 text-blue-700'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Time Window</label>
                      <input
                        type="text"
                        value={formData.deliveryTimeWindow}
                        onChange={(e) => updateFormData('deliveryTimeWindow', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="8:00 AM - 11:00 AM"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentStep(7)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            )}

            {/* Step 7: Additional Information */}
            {currentStep === 7 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Additional Information</h2>
                </div>

                {/* Account Status */}
                <div className="border border-gray-300 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer Since</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          value={formData.customerSince}
                          onChange={(e) => updateFormData('customerSince', e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                      <select
                        value={formData.accountStatus}
                        onChange={(e) => updateFormData('accountStatus', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                        <option value="prospect">Prospect</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Relationship Type</label>
                      <select
                        value={formData.businessRelationshipType}
                        onChange={(e) => updateFormData('businessRelationshipType', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="b2b">B2B (Business to Business)</option>
                        <option value="b2c">B2C (Business to Consumer)</option>
                        <option value="b2g">B2G (Business to Government)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Customer Lifecycle Stage</label>
                      <select
                        value={formData.customerLifecycleStage}
                        onChange={(e) => updateFormData('customerLifecycleStage', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="prospect">Prospect</option>
                        <option value="new">New</option>
                        <option value="growing">Growing</option>
                        <option value="mature">Mature</option>
                        <option value="at_risk">At Risk</option>
                        <option value="churned">Churned</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Risk Rating</label>
                      <select
                        value={formData.riskRating}
                        onChange={(e) => updateFormData('riskRating', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low Risk</option>
                        <option value="medium">Medium Risk</option>
                        <option value="high">High Risk</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Compliance Status</label>
                      <input
                        type="text"
                        value={formData.complianceStatus}
                        onChange={(e) => updateFormData('complianceStatus', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Compliant"
                      />
                    </div>
                  </div>
                </div>

                {/* Contract Information */}
                <div className="border border-gray-300 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Contract Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contract Number</label>
                      <input
                        type="text"
                        value={formData.contractNumber}
                        onChange={(e) => updateFormData('contractNumber', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="CNT-2025-1234"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Service Level Agreement</label>
                      <input
                        type="text"
                        value={formData.serviceLevelAgreement}
                        onChange={(e) => updateFormData('serviceLevelAgreement', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Standard SLA - 48 hour response"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contract Start Date</label>
                      <input
                        type="date"
                        value={formData.contractStartDate}
                        onChange={(e) => updateFormData('contractStartDate', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contract End Date</label>
                      <input
                        type="date"
                        value={formData.contractEndDate}
                        onChange={(e) => updateFormData('contractEndDate', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                <div className="border border-gray-300 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Required Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {certificationOptions.map(cert => (
                      <button
                        key={cert}
                        onClick={() => toggleCertification(cert)}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                          formData.certificationsRequired.includes(cert)
                            ? 'bg-green-100 border-green-600 text-green-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {cert}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes & Instructions */}
                <div className="border border-gray-300 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes & Instructions</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                      <textarea
                        value={formData.specialInstructions}
                        onChange={(e) => updateFormData('specialInstructions', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter any special handling instructions, delivery preferences, or important notes..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
                      <textarea
                        value={formData.internalNotes}
                        onChange={(e) => updateFormData('internalNotes', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Internal notes for team members (not visible to customer)..."
                      />
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="border border-gray-300 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-blue-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add a tag and press Enter"
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Custom Fields */}
                <div className="border border-gray-300 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Fields</h3>
                  {formData.customFields.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {formData.customFields.map((field, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{field.key}:</span>
                            <span className="text-sm text-gray-700 ml-2">{field.value}</span>
                          </div>
                          <button
                            onClick={() => removeCustomField(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={addCustomField}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add Custom Field</span>
                  </button>
                </div>

                {/* Consent & Compliance */}
                <div className="border border-gray-300 rounded-lg p-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Consent & Compliance</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.dataPrivacyConsent}
                        onChange={(e) => updateFormData('dataPrivacyConsent', e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Data Privacy Consent (GDPR/CCPA)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.marketingConsent}
                        onChange={(e) => updateFormData('marketingConsent', e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Marketing Communications Consent</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-start pt-4">
                  <button
                    onClick={() => setCurrentStep(6)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Footer with Update Button */}
      <div className="border-t border-gray-200 bg-white px-3 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-5 w-5" />
            <span>Update Customer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
