'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  DollarSign,
  Calendar,
  Tag,
  FileText,
  Paperclip,
  Plus,
  X,
  Star,
  TrendingUp,
  Users,
  Briefcase,
  Target,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui';
import { crmService } from '@/services/crm.service';

// Import the same interfaces and data from add page
interface LeadFormData {
  firstName: string;
  lastName: string;
  title: string;
  company: string;
  website: string;
  industry: string;
  employeeCount: string;
  annualRevenue: string;
  email: string;
  phone: string;
  mobile: string;
  fax: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  status: string;
  rating: string;
  leadSource: string;
  leadSubSource: string;
  referredBy: string;
  campaign: string;
  estimatedValue: string;
  estimatedCloseDate: string;
  probability: string;
  productInterest: string[];
  customProducts: string[];
  assignedTo: string;
  teamAssignment: string;
  description: string;
  tags: string[];
  customFields: { [key: string]: string };
  linkedIn: string;
  twitter: string;
  facebook: string;
  gdprConsent: boolean;
  emailOptIn: boolean;
  smsOptIn: boolean;
  doNotCall: boolean;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

const leadSources = {
  'Website': ['Organic Search', 'Paid Search', 'Direct Traffic', 'Social Media', 'Email Campaign'],
  'Referral': ['Customer Referral', 'Partner Referral', 'Employee Referral', 'Affiliate'],
  'Events': ['Trade Show', 'Conference', 'Webinar', 'Workshop', 'Seminar'],
  'Advertising': ['Google Ads', 'LinkedIn Ads', 'Facebook Ads', 'Print Media', 'TV/Radio'],
  'Sales': ['Cold Call', 'Cold Email', 'Direct Mail', 'Sales Visit'],
  'Partners': ['Channel Partner', 'Reseller', 'Distributor', 'Strategic Alliance'],
  'Marketing': ['Content Download', 'Free Trial', 'Demo Request', 'Newsletter Signup'],
  'Other': ['Walk-in', 'Existing Customer', 'Unknown'],
};

const industries = [
  'Manufacturing', 'Technology', 'Healthcare', 'Finance', 'Retail', 'Education',
  'Real Estate', 'Construction', 'Transportation', 'Energy', 'Agriculture', 'Other'
];

const products = [
  'Modular Kitchen Solutions',
  'Kitchen Cabinets & Storage',
  'Kitchen Countertops (Granite/Quartz/Solid Surface)',
  'Kitchen Appliances & Fittings',
  'Custom Kitchen Design & Planning',
  'Kitchen Hardware & Accessories',
  'Wardrobe & Closet Systems',
  'Vanity Units & Bathroom Cabinets',
  'Home Interior Woodwork',
  'Office Furniture & Cabinetry',
  'Commercial Kitchen Equipment',
  'Installation & After-Sales Service',
];

export default function EditLeadPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const params = useParams();
  const leadId = params.id as string;
  const [currentStep, setCurrentStep] = useState(1);

  const emptyForm: LeadFormData = {
    firstName: '',
    lastName: '',
    title: '',
    company: '',
    website: '',
    industry: '',
    employeeCount: '',
    annualRevenue: '',
    email: '',
    phone: '',
    mobile: '',
    fax: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    status: 'new',
    rating: 'warm',
    leadSource: '',
    leadSubSource: '',
    referredBy: '',
    campaign: '',
    estimatedValue: '',
    estimatedCloseDate: '',
    probability: '50',
    productInterest: [],
    customProducts: [],
    assignedTo: '',
    teamAssignment: '',
    description: '',
    tags: [],
    customFields: {},
    linkedIn: '',
    twitter: '',
    facebook: '',
    gdprConsent: false,
    emailOptIn: true,
    smsOptIn: false,
    doNotCall: false,
  };

  const [formData, setFormData] = useState<LeadFormData>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prefill form from backend on mount
  useEffect(() => {
    if (!leadId) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data: any = await crmService.leads.getById(leadId);
        if (!cancelled && data) {
          const firstName = data.firstName ?? '';
          const lastName = data.lastName ?? '';
          setFormData({
            ...emptyForm,
            firstName,
            lastName: lastName || (data.name && !firstName ? String(data.name) : ''),
            title: data.title ?? data.jobTitle ?? '',
            company: data.company ?? data.companyName ?? '',
            website: data.website ?? '',
            industry: data.industry ?? '',
            employeeCount: data.employeeCount ?? '',
            annualRevenue: data.annualRevenue ?? '',
            email: data.email ?? '',
            phone: data.phone ?? '',
            mobile: data.mobile ?? '',
            fax: data.fax ?? '',
            street: data.street ?? '',
            city: data.city ?? '',
            state: data.state ?? '',
            postalCode: data.postalCode ?? '',
            country: data.country ?? '',
            status: data.status ?? 'new',
            rating: data.rating ?? 'warm',
            leadSource: data.leadSource ?? data.source ?? '',
            leadSubSource: data.leadSubSource ?? '',
            referredBy: data.referredBy ?? '',
            campaign: data.campaign ?? '',
            estimatedValue: data.estimatedValue != null ? String(data.estimatedValue) : '',
            estimatedCloseDate: data.estimatedCloseDate ?? '',
            probability: data.probability != null ? String(data.probability) : '50',
            productInterest: Array.isArray(data.productInterest) ? data.productInterest : [],
            customProducts: Array.isArray(data.customProducts) ? data.customProducts : [],
            assignedTo: data.assignedTo ?? '',
            teamAssignment: data.teamAssignment ?? '',
            description: data.description ?? '',
            tags: Array.isArray(data.tags) ? data.tags : [],
            customFields: data.customFields ?? {},
            linkedIn: data.linkedIn ?? '',
            twitter: data.twitter ?? '',
            facebook: data.facebook ?? '',
            gdprConsent: !!data.gdprConsent,
            emailOptIn: data.emailOptIn ?? true,
            smsOptIn: !!data.smsOptIn,
            doNotCall: !!data.doNotCall,
          });
          if (typeof data.leadScore === 'number') setLeadScore(data.leadScore);
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Failed to load lead');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newProduct, setNewProduct] = useState('');
  const [leadScore, setLeadScore] = useState(0);

  const updateFormData = (field: keyof LeadFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const toggleProductInterest = (product: string) => {
    const current = formData.productInterest;
    if (current.includes(product)) {
      updateFormData('productInterest', current.filter(p => p !== product));
    } else {
      updateFormData('productInterest', [...current, product]);
    }
  };

  const addCustomProduct = () => {
    if (newProduct.trim() && !formData.customProducts.includes(newProduct.trim()) && !formData.productInterest.includes(newProduct.trim())) {
      updateFormData('customProducts', [...formData.customProducts, newProduct.trim()]);
      updateFormData('productInterest', [...formData.productInterest, newProduct.trim()]);
      setNewProduct('');
    }
  };

  const removeCustomProduct = (product: string) => {
    updateFormData('customProducts', formData.customProducts.filter(p => p !== product));
    updateFormData('productInterest', formData.productInterest.filter(p => p !== product));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const newAttachment: Attachment = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        };
        setAttachments(prev => [...prev, newAttachment]);
      });
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const calculateLeadScore = () => {
    let score = 0;

    // Company size scoring
    if (formData.employeeCount === '1000+') score += 20;
    else if (formData.employeeCount === '500-999') score += 15;
    else if (formData.employeeCount === '100-499') score += 10;
    else if (formData.employeeCount === '50-99') score += 5;

    // Revenue scoring
    if (formData.annualRevenue === '$100M+') score += 20;
    else if (formData.annualRevenue === '$50M-$100M') score += 15;
    else if (formData.annualRevenue === '$10M-$50M') score += 10;
    else if (formData.annualRevenue === '$1M-$10M') score += 5;

    // Engagement scoring
    if (formData.email) score += 10;
    if (formData.phone) score += 10;
    if (formData.website) score += 5;

    // Interest level
    if (formData.rating === 'hot') score += 20;
    else if (formData.rating === 'warm') score += 10;

    // Product interest
    score += formData.productInterest.length * 5;

    // Source quality
    if (formData.leadSource === 'Referral') score += 15;
    else if (formData.leadSource === 'Events') score += 10;

    setLeadScore(Math.min(score, 100));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload: any = {
        ...formData,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : undefined,
        probability: formData.probability ? parseInt(formData.probability, 10) : undefined,
        leadScore,
      };
      await crmService.leads.update(leadId, payload);
      addToast({
        title: 'Lead Updated',
        message: `${formData.firstName} ${formData.lastName} from ${formData.company} has been updated successfully`,
        variant: 'success'
      });
      router.push('/crm/leads');
    } catch (e) {
      addToast({
        title: 'Update Failed',
        message: e instanceof Error ? e.message : 'Failed to update lead. Please try again.',
        variant: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, name: 'Basic Info', icon: User },
    { id: 2, name: 'Contact Details', icon: Phone },
    { id: 3, name: 'Lead Details', icon: TrendingUp },
    { id: 4, name: 'Opportunity', icon: Target },
    { id: 5, name: 'Additional Info', icon: FileText },
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
                <h1 className="text-2xl font-bold text-gray-900">Edit Lead</h1>
                <p className="text-sm text-gray-600">Update lead information - ID: {leadId}</p>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
              Loading lead…
            </div>
          )}
          {loadError && !isLoading && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </div>
          )}

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
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <User className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateFormData('title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="CEO, VP of Sales, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => updateFormData('company', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Acme Corporation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => updateFormData('website', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://www.example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    <select
                      value={formData.industry}
                      onChange={(e) => updateFormData('industry', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Industry</option>
                      {industries.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Employees</label>
                    <select
                      value={formData.employeeCount}
                      onChange={(e) => updateFormData('employeeCount', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Size</option>
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="50-99">50-99</option>
                      <option value="100-499">100-499</option>
                      <option value="500-999">500-999</option>
                      <option value="1000+">1000+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Annual Revenue</label>
                    <select
                      value={formData.annualRevenue}
                      onChange={(e) => updateFormData('annualRevenue', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Revenue Range</option>
                      <option value="<$1M">Less than $1M</option>
                      <option value="$1M-$10M">$1M - $10M</option>
                      <option value="$10M-$50M">$10M - $50M</option>
                      <option value="$50M-$100M">$50M - $100M</option>
                      <option value="$100M+">$100M+</option>
                    </select>
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

            {/* Step 2: Contact Details */}
            {currentStep === 2 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <Phone className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Contact Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="john.smith@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => updateFormData('mobile', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1 (555) 987-6543"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fax</label>
                    <input
                      type="tel"
                      value={formData.fax}
                      onChange={(e) => updateFormData('fax', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1 (555) 123-4568"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => updateFormData('street', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Main Street, Suite 100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="San Francisco"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => updateFormData('state', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="California"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => updateFormData('postalCode', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="94102"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => updateFormData('country', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="United States"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Social Media Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                      <input
                        type="url"
                        value={formData.linkedIn}
                        onChange={(e) => updateFormData('linkedIn', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                      <input
                        type="url"
                        value={formData.twitter}
                        onChange={(e) => updateFormData('twitter', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://twitter.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                      <input
                        type="url"
                        value={formData.facebook}
                        onChange={(e) => updateFormData('facebook', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://facebook.com/..."
                      />
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

            {/* Step 3: Lead Details */}
            {currentStep === 3 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Lead Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lead Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => updateFormData('status', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="proposal">Proposal Sent</option>
                      <option value="negotiation">In Negotiation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lead Rating</label>
                    <select
                      value={formData.rating}
                      onChange={(e) => updateFormData('rating', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="hot">Hot (Ready to Buy)</option>
                      <option value="warm">Warm (Interested)</option>
                      <option value="cold">Cold (Long-term Nurture)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lead Source <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.leadSource}
                      onChange={(e) => {
                        updateFormData('leadSource', e.target.value);
                        updateFormData('leadSubSource', '');
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Lead Source</option>
                      {Object.keys(leadSources).map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lead Sub-Source</label>
                    <select
                      value={formData.leadSubSource}
                      onChange={(e) => updateFormData('leadSubSource', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={!formData.leadSource}
                    >
                      <option value="">Select Sub-Source</option>
                      {formData.leadSource && leadSources[formData.leadSource as keyof typeof leadSources]?.map(subSource => (
                        <option key={subSource} value={subSource}>{subSource}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Referred By</label>
                    <input
                      type="text"
                      value={formData.referredBy}
                      onChange={(e) => updateFormData('referredBy', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Name of referrer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campaign</label>
                    <input
                      type="text"
                      value={formData.campaign}
                      onChange={(e) => updateFormData('campaign', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Campaign name or ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                    <select
                      value={formData.assignedTo}
                      onChange={(e) => updateFormData('assignedTo', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Sales Rep</option>
                      <option value="sarah-johnson">Sarah Johnson</option>
                      <option value="michael-chen">Michael Chen</option>
                      <option value="david-park">David Park</option>
                      <option value="emily-davis">Emily Davis</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team Assignment</label>
                    <select
                      value={formData.teamAssignment}
                      onChange={(e) => updateFormData('teamAssignment', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Team</option>
                      <option value="enterprise-sales">Enterprise Sales</option>
                      <option value="smb-sales">SMB Sales</option>
                      <option value="channel-partners">Channel Partners</option>
                      <option value="inside-sales">Inside Sales</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Compliance & Privacy</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.gdprConsent}
                        onChange={(e) => updateFormData('gdprConsent', e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">GDPR Consent Obtained</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.emailOptIn}
                        onChange={(e) => updateFormData('emailOptIn', e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Email Marketing Opt-in</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.smsOptIn}
                        onChange={(e) => updateFormData('smsOptIn', e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">SMS Marketing Opt-in</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.doNotCall}
                        onChange={(e) => updateFormData('doNotCall', e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Do Not Call</span>
                    </label>
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

            {/* Step 4: Opportunity Information */}
            {currentStep === 4 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Opportunity Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Deal Value</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.estimatedValue}
                        onChange={(e) => updateFormData('estimatedValue', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="50000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Close Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.estimatedCloseDate}
                        onChange={(e) => updateFormData('estimatedCloseDate', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Win Probability: {formData.probability}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={formData.probability}
                      onChange={(e) => updateFormData('probability', e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Product Interest</h3>

                  {/* Selected Products */}
                  {formData.productInterest.length > 0 && (
                    <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-3">Selected Products ({formData.productInterest.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.productInterest.map(product => (
                          <span
                            key={product}
                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium"
                          >
                            {product}
                            <button
                              onClick={() => {
                                if (formData.customProducts.includes(product)) {
                                  removeCustomProduct(product);
                                } else {
                                  toggleProductInterest(product);
                                }
                              }}
                              className="ml-2 hover:text-blue-200"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Selection List */}
                  <div className="border border-gray-300 rounded-lg p-3 max-h-80 overflow-y-auto bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {products.map(product => (
                        <label key={product} className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.productInterest.includes(product)}
                            onChange={() => toggleProductInterest(product)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 flex-1">{product}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Add Custom Product */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add Custom Product/Service</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newProduct}
                        onChange={(e) => setNewProduct(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomProduct()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter custom product or service"
                      />
                      <button
                        onClick={addCustomProduct}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                      >
                        <Plus className="h-5 w-5" />
                        <span>Add</span>
                      </button>
                    </div>
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

            {/* Step 5: Additional Information */}
            {currentStep === 5 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 mb-2">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Additional Information</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description / Notes</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter any additional information about this lead, including conversation notes, special requirements, pain points, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Paperclip className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop files
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, DOCX, XLS, XLSX, images (Max 10MB each)
                      </p>
                    </label>
                  </div>

                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {attachments.map(attachment => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center space-x-3">
                            <Paperclip className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                              <p className="text-xs text-gray-500">
                                {(attachment.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeAttachment(attachment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Lead Score Calculation</h3>
                      <button
                        onClick={calculateLeadScore}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Calculate Score
                      </button>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              leadScore >= 75
                                ? 'bg-green-500'
                                : leadScore >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${leadScore}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-blue-900">{leadScore}</div>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">
                      <AlertCircle className="inline h-3 w-3 mr-1" />
                      Score based on company size, revenue, engagement level, and source quality
                    </p>
                  </div>
                </div>

                <div className="flex justify-start pt-4">
                  <button
                    onClick={() => setCurrentStep(4)}
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

      {/* Fixed Footer with Save Button */}
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
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            <span>{isSubmitting ? 'Updating…' : 'Update Lead'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
