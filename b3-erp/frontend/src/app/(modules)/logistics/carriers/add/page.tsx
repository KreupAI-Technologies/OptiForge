'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogisticsService } from '@/services/logistics.service';
import {
  ArrowLeft,
  Save,
  X,
  Truck,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  CheckCircle2,
  Building2,
  User,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface CarrierForm {
  carrierCode: string;
  carrierName: string;
  carrierType: string;
  status: 'active' | 'inactive';

  contactPerson: string;
  email: string;
  phone: string;
  website: string;

  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;

  serviceTypes: string[];
  coverageArea: string;
  transportModes: string[];

  gstNumber: string;
  panNumber: string;

  bankName: string;
  accountNumber: string;
  ifscCode: string;

  insuranceCoverage: boolean;
  trackingEnabled: boolean;
  podEnabled: boolean;

  remarks: string;
}

const COMPANY_TYPE_MAP: Record<string, string> = {
  'fleet owner': 'Fleet Owner',
  'broker': 'Broker',
  'freight forwarder': 'Freight Forwarder',
  '3pl': '3PL',
  'courier': 'Courier',
  'courier service': 'Courier',
  'express delivery': 'Courier',
  'rail': 'Rail',
  'air': 'Air',
  'sea': 'Sea',
};

const SERVICE_TYPE_MAP: Record<string, string> = {
  'road': 'Road',
  'surface': 'Road',
  'surface premium': 'Road',
  'rail': 'Rail',
  'air': 'Air',
  'air express': 'Air',
  'express': 'Air',
  'sea': 'Sea',
  'courier': 'Courier',
  'multimodal': 'Multimodal',
};

function buildPayload(formData: CarrierForm): Record<string, any> {
  const payload: Record<string, any> = {
    companyCode: formData.carrierCode,
    companyName: formData.carrierName,
    address: formData.address,
    city: formData.city,
    state: formData.state,
    postalCode: formData.pincode,
    country: formData.country,
    email: formData.email,
    phone: formData.phone,
    contactPersonName: formData.contactPerson,
    contactPersonEmail: formData.email,
    contactPersonPhone: formData.phone,
  };

  // companyType — best-effort map; omit entirely if no match
  const mappedType = COMPANY_TYPE_MAP[(formData.carrierType || '').toLowerCase()];
  if (mappedType) {
    payload.companyType = mappedType;
  }

  // serviceTypes — normalize from serviceTypes + transportModes, dedupe, default ['Road']
  const rawServices = [...(formData.serviceTypes || []), ...(formData.transportModes || [])];
  const mappedServices = Array.from(
    new Set(
      rawServices
        .map(s => SERVICE_TYPE_MAP[(s || '').toLowerCase()])
        .filter((s): s is string => Boolean(s))
    )
  );
  payload.serviceTypes = mappedServices.length > 0 ? mappedServices : ['Road'];

  // Optional fields — include only when truthy
  if (formData.website) payload.website = formData.website;
  if (formData.gstNumber) payload.gstNumber = formData.gstNumber;
  if (formData.panNumber) payload.panNumber = formData.panNumber;
  if (formData.coverageArea) payload.serviceAreas = [formData.coverageArea];

  return payload;
}

export default function AddCarrierPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CarrierForm>({
    carrierCode: '',
    carrierName: '',
    carrierType: '',
    status: 'active',

    contactPerson: '',
    email: '',
    phone: '',
    website: '',

    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',

    serviceTypes: [],
    coverageArea: '',
    transportModes: [],

    gstNumber: '',
    panNumber: '',

    bankName: '',
    accountNumber: '',
    ifscCode: '',

    insuranceCoverage: false,
    trackingEnabled: false,
    podEnabled: false,

    remarks: '',
  });

  // Available options
  const carrierTypes = [
    'Courier Service',
    'Freight Forwarder',
    'Logistics Provider',
    'Transportation Company',
    'Express Delivery',
    'International Shipper',
  ];

  const allServiceTypes = [
    'Express',
    'Surface',
    'Surface Premium',
    'Air Express',
    'Same Day',
    'Next Day',
    'International',
    'Standard',
  ];

  const allTransportModes = ['Air', 'Surface', 'Rail', 'Sea', 'Multimodal'];

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi',
  ];

  const handleInputChange = (field: keyof CarrierForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const generateCarrierCode = () => {
    const prefix = 'CAR';
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const code = `${prefix}-${random}`;
    handleInputChange('carrierCode', code);
  };

  const handleServiceTypeToggle = (serviceType: string) => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(serviceType)
        ? prev.serviceTypes.filter(s => s !== serviceType)
        : [...prev.serviceTypes, serviceType]
    }));
  };

  const handleTransportModeToggle = (mode: string) => {
    setFormData(prev => ({
      ...prev,
      transportModes: prev.transportModes.includes(mode)
        ? prev.transportModes.filter(m => m !== mode)
        : [...prev.transportModes, mode]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.carrierCode.trim()) newErrors.carrierCode = 'Carrier code is required';
    if (!formData.carrierName.trim()) newErrors.carrierName = 'Carrier name is required';
    if (!formData.carrierType) newErrors.carrierType = 'Carrier type is required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[+]?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }

    if (formData.serviceTypes.length === 0) {
      newErrors.serviceTypes = 'Select at least one service type';
    }

    if (formData.transportModes.length === 0) {
      newErrors.transportModes = 'Select at least one transport mode';
    }

    if (formData.gstNumber && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d{1}[Z]{1}[A-Z\d]{1}$/.test(formData.gstNumber)) {
      newErrors.gstNumber = 'Invalid GST number format';
    }

    if (formData.panNumber && !/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(formData.panNumber)) {
      newErrors.panNumber = 'Invalid PAN number format';
    }

    if (formData.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      newErrors.ifscCode = 'Invalid IFSC code format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await LogisticsService.createTransportCompany(buildPayload(formData));
      router.push('/logistics/carriers');
    } catch (err) {
      console.error('Failed to create carrier', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/logistics/carriers');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3">
      <div className="w-full">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Carrier</h1>
              <p className="text-gray-600 mt-1">Register a new carrier for logistics operations</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Create Carrier
                </>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                <p className="text-sm text-gray-600">Carrier details and identification</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carrier Code <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.carrierCode}
                    onChange={(e) => handleInputChange('carrierCode', e.target.value.toUpperCase())}
                    className={`flex-1 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${errors.carrierCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="CAR-001"
                  />
                  <button
                    type="button"
                    onClick={generateCarrierCode}
                    className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all flex items-center gap-2"

                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
                {errors.carrierCode && (
                  <p className="mt-1 text-sm text-red-500">{errors.carrierCode}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carrier Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.carrierName}
                  onChange={(e) => handleInputChange('carrierName', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.carrierName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter carrier name"
                />
                {errors.carrierName && (
                  <p className="mt-1 text-sm text-red-500">{errors.carrierName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carrier Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.carrierType}
                  onChange={(e) => handleInputChange('carrierType', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.carrierType ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select carrier type</option>
                  {carrierTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.carrierType && (
                  <p className="mt-1 text-sm text-red-500">{errors.carrierType}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
                <p className="text-sm text-gray-600">Primary contact details</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contactPerson ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter contact person name"
                />
                {errors.contactPerson && (
                  <p className="mt-1 text-sm text-red-500">{errors.contactPerson}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="contact@carrier.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="+91 98765 43210"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="www.carrier.com"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Address Information</h2>
                <p className="text-sm text-gray-600">Carrier location details</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={2}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter full address"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter city"
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <option value="">Select state</option>
                    {indianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-500">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.pincode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="110003"
                    maxLength={6}
                  />
                  {errors.pincode && (
                    <p className="mt-1 text-sm text-red-500">{errors.pincode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="India"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Service Information</h2>
                <p className="text-sm text-gray-600">Services offered and coverage</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Service Types <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {allServiceTypes.map(service => (
                    <button
                      key={service}
                      type="button"
                      onClick={() => handleServiceTypeToggle(service)}
                      className={`px-4 py-2.5 rounded-lg border-2 font-medium transition-all ${formData.serviceTypes.includes(service)
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
                {errors.serviceTypes && (
                  <p className="mt-2 text-sm text-red-500">{errors.serviceTypes}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Transport Modes <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {allTransportModes.map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleTransportModeToggle(mode)}
                      className={`px-4 py-2.5 rounded-lg border-2 font-medium transition-all ${formData.transportModes.includes(mode)
                          ? 'bg-green-50 border-green-500 text-green-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                {errors.transportModes && (
                  <p className="mt-2 text-sm text-red-500">{errors.transportModes}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coverage Area <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.coverageArea}
                  onChange={(e) => handleInputChange('coverageArea', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Pan India, Regional, International"
                />
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Tax Information</h2>
                <p className="text-sm text-gray-600">GST and PAN details (Optional)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number
                </label>
                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase font-mono ${errors.gstNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="07AAACB1234F1Z5"
                  maxLength={15}
                />
                {errors.gstNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.gstNumber}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase font-mono ${errors.panNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="AAACB1234F"
                  maxLength={10}
                />
                {errors.panNumber && (
                  <p className="mt-1 text-sm text-red-500">{errors.panNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bank Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Bank Information</h2>
                <p className="text-sm text-gray-600">Payment and banking details (Optional)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter bank name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                  placeholder="12345678901234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase font-mono ${errors.ifscCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="HDFC0001234"
                  maxLength={11}
                />
                {errors.ifscCode && (
                  <p className="mt-1 text-sm text-red-500">{errors.ifscCode}</p>
                )}
              </div>
            </div>
          </div>

          {/* Features & Capabilities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Features & Capabilities</h2>
                <p className="text-sm text-gray-600">Available services and features</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="insuranceCoverage"
                  checked={formData.insuranceCoverage}
                  onChange={(e) => handleInputChange('insuranceCoverage', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="insuranceCoverage" className="flex-1">
                  <div className="font-semibold text-gray-900">Insurance Coverage</div>
                  <div className="text-sm text-gray-600">Carrier provides insurance for shipments</div>
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="trackingEnabled"
                  checked={formData.trackingEnabled}
                  onChange={(e) => handleInputChange('trackingEnabled', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="trackingEnabled" className="flex-1">
                  <div className="font-semibold text-gray-900">Real-time Tracking</div>
                  <div className="text-sm text-gray-600">Real-time shipment tracking available</div>
                </label>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="podEnabled"
                  checked={formData.podEnabled}
                  onChange={(e) => handleInputChange('podEnabled', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="podEnabled" className="flex-1">
                  <div className="font-semibold text-gray-900">Proof of Delivery (POD)</div>
                  <div className="text-sm text-gray-600">Digital proof of delivery collection</div>
                </label>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Additional Information</h2>
                <p className="text-sm text-gray-600">Notes and remarks</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional notes or remarks about this carrier"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Carrier...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Carrier
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
