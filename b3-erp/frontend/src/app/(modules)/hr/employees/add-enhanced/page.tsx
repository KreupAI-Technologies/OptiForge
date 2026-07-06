'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  CreditCard,
  Heart,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  useAutoSaveDraft,
  AutoSaveIndicator,
  DraftRecoveryBanner,
  useUnsavedChangesWarning,
  HelpIcon,
} from '@/components/ui/FormUX';
import { StepIndicator, Step } from '@/components/ui/StepIndicator';
import { EmployeeService } from '@/services/employee.service';

interface EmployeeForm {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  department: string;
  position: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
  status: 'active' | 'inactive';
  joinDate: string;
  confirmationDate: string;
  manager: string;
  location: string;
  salary: number;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  panNumber: string;
  aadhaarNumber: string;
  uanNumber: string;
  esiNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  education: string;
  previousExperience: number;
  skills: string;
}

const getInitialForm = (): EmployeeForm => ({
  employeeId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  alternatePhone: '',
  dateOfBirth: '',
  gender: 'Male',
  bloodGroup: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  department: '',
  position: '',
  employmentType: 'full_time',
  status: 'active',
  joinDate: '',
  confirmationDate: '',
  manager: '',
  location: '',
  salary: 0,
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  panNumber: '',
  aadhaarNumber: '',
  uanNumber: '',
  esiNumber: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
  education: '',
  previousExperience: 0,
  skills: '',
});

const departments = ['Production', 'Quality', 'Maintenance', 'Engineering', 'HR', 'Finance', 'IT', 'Sales', 'Procurement'];
const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi',
];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const locations = ['Head Office - Mumbai', 'Plant 1 - Pune', 'Plant 2 - Chennai', 'Warehouse - Hyderabad', 'R&D Center - Bangalore'];

// Field help content
const FIELD_HELP = {
  employeeId: {
    title: 'Employee ID',
    content: 'Unique identifier for the employee. Click "Generate" to auto-generate based on company format.',
  },
  panNumber: {
    title: 'PAN Number',
    content: 'Permanent Account Number issued by Income Tax Department. Format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F).',
  },
  aadhaarNumber: {
    title: 'Aadhaar Number',
    content: '12-digit unique identification number issued by UIDAI. This is mandatory for EPF registration.',
  },
  ifscCode: {
    title: 'IFSC Code',
    content: 'Indian Financial System Code for bank transfers. Format: 4 letters (bank) + 0 + 6 alphanumeric (branch).',
  },
  uanNumber: {
    title: 'UAN (Universal Account Number)',
    content: '12-digit number allocated by EPFO. If new employee, this will be generated after EPF registration.',
  },
  esiNumber: {
    title: 'ESI Number',
    content: 'Employee State Insurance number. Required for employees earning below ESI threshold.',
  },
  confirmationDate: {
    title: 'Confirmation Date',
    content: 'Date when the employee is confirmed after probation period. Leave blank for new hires.',
  },
};

export default function AddEmployeeEnhancedPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<EmployeeForm>(getInitialForm);
  const [initialForm, setInitialForm] = useState<EmployeeForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  // Step definitions
  const steps: Step[] = [
    { id: '1', label: 'Personal', description: 'Basic details' },
    { id: '2', label: 'Address', description: 'Contact info' },
    { id: '3', label: 'Employment', description: 'Job details' },
    { id: '4', label: 'Payroll', description: 'Bank & statutory' },
    { id: '5', label: 'Emergency', description: 'Contacts & skills' },
    { id: '6', label: 'Review', description: 'Submit' },
  ];

  // Calculate completion
  const completionPercentage = useMemo(() => {
    let filled = 0;
    const total = 15;
    if (formData.employeeId) filled++;
    if (formData.firstName) filled++;
    if (formData.lastName) filled++;
    if (formData.email) filled++;
    if (formData.phone) filled++;
    if (formData.dateOfBirth) filled++;
    if (formData.address) filled++;
    if (formData.city) filled++;
    if (formData.department) filled++;
    if (formData.position) filled++;
    if (formData.joinDate) filled++;
    if (formData.bankName) filled++;
    if (formData.accountNumber) filled++;
    if (formData.emergencyContactName) filled++;
    if (currentStep === 5) filled++;
    return Math.round((filled / total) * 100);
  }, [formData, currentStep]);

  // Auto-save
  const { lastSaved, isSaving, hasDraft, clearDraft, restoreDraft } = useAutoSaveDraft(formData as unknown as Record<string, unknown>, {
    key: 'hr-employee-onboarding-draft',
    debounceMs: 2000,
    onRestore: (data) => {
      setFormData(data as unknown as EmployeeForm);
      setShowDraftBanner(false);
    },
  });

  // Unsaved changes
  const hasChanges = useMemo(() => {
    if (!initialForm) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialForm);
  }, [formData, initialForm]);

  useUnsavedChangesWarning(hasChanges);

  // Initialize
  useEffect(() => {
    const initial = getInitialForm();
    setFormData(initial);
    setInitialForm(initial);
    if (hasDraft) setShowDraftBanner(true);
  }, [hasDraft]);

  const handleInputChange = (field: keyof EmployeeForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[field];
        return n;
      });
    }
  };

  const generateEmployeeId = () => {
    const prefix = 'B3';
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    handleInputChange('employeeId', `${prefix}-${random}`);
  };

  // Validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID required';
      if (!formData.firstName.trim()) newErrors.firstName = 'First name required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone required';
      } else if (!/^[+]?[\d\s-]{10,}$/.test(formData.phone)) {
        newErrors.phone = 'Invalid phone number';
      }
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth required';
    }

    if (step === 1) {
      if (!formData.address.trim()) newErrors.address = 'Address required';
      if (!formData.city.trim()) newErrors.city = 'City required';
      if (!formData.state) newErrors.state = 'State required';
      if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode = 'Pincode must be 6 digits';
      }
    }

    if (step === 2) {
      if (!formData.department) newErrors.department = 'Department required';
      if (!formData.position.trim()) newErrors.position = 'Position required';
      if (!formData.joinDate) newErrors.joinDate = 'Join date required';
    }

    if (step === 3) {
      if (formData.panNumber && !/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(formData.panNumber)) {
        newErrors.panNumber = 'Invalid PAN format';
      }
      if (formData.aadhaarNumber && !/^\d{12}$/.test(formData.aadhaarNumber.replace(/\s/g, ''))) {
        newErrors.aadhaarNumber = 'Aadhaar must be 12 digits';
      }
      if (formData.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
        newErrors.ifscCode = 'Invalid IFSC format';
      }
    }

    if (step === 4) {
      if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = 'Emergency contact required';
      if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = 'Emergency phone required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      try {
        await EmployeeService.createEmployee({ companyId: 'default-company-id', ...formData } as any);
        clearDraft();
        alert('Employee created successfully!');
        router.push('/hr/employees');
      } catch (error) {
        console.error('Failed to create employee:', error);
        alert(error instanceof Error ? error.message : 'Failed to create employee');
      }
    }
  };

  const handleSaveDraft = async () => {
    try {
      await EmployeeService.createEmployee({ companyId: 'default-company-id', ...formData, status: 'draft' } as any);
      alert('Employee draft saved!');
      router.push('/hr/employees');
    } catch (error) {
      console.error('Failed to save draft:', error);
      alert(error instanceof Error ? error.message : 'Failed to save draft');
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Leave anyway?')) {
        router.push('/hr/employees');
      }
    } else {
      router.push('/hr/employees');
    }
  };

  return (
    <div className="w-full h-full px-3 py-2 overflow-auto">
      {/* Draft Recovery */}
      {showDraftBanner && (
        <DraftRecoveryBanner
          hasDraft={hasDraft}
          onRestore={() => { restoreDraft(); setShowDraftBanner(false); }}
          onDiscard={() => { clearDraft(); setShowDraftBanner(false); }}
        />
      )}

      {/* Header */}
      <div className="mb-3">
        <button onClick={handleCancel} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Employees</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
              <p className="text-gray-600 text-sm">Employee onboarding form</p>
            </div>
          </div>
          <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
        </div>
      </div>

      {/* Progress */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">Onboarding progress</span>
          <span className="text-sm font-medium text-gray-900">{completionPercentage}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${completionPercentage === 100 ? 'bg-green-500' : completionPercentage >= 75 ? 'bg-blue-500' : completionPercentage >= 50 ? 'bg-yellow-500' : 'bg-orange-500'}`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="mb-8">
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          onStepClick={(i) => { if (i <= currentStep) setCurrentStep(i); }}
          variant="circles"
        />
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        {/* Step 1: Personal Information */}
        {currentStep === 0 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  Employee ID *
                  <HelpIcon {...FIELD_HELP.employeeId} />
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.employeeId ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., B3-1234"
                  />
                  <button
                    type="button"
                    onClick={generateEmployeeId}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-1"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </button>
                </div>
                {errors.employeeId && <p className="text-xs text-red-500 mt-1">{errors.employeeId}</p>}
              </div>

              <div></div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="First name"
                />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Last name"
                />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="email@company.com"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="+91 98765 43210"
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select</option>
                  {bloodGroups.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Address */}
        {currentStep === 1 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Street address"
                />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="City"
                />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <select
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select State</option>
                  {indianStates.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.pincode ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="400001"
                  maxLength={6}
                />
                {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
                <input
                  type="tel"
                  value={formData.alternatePhone}
                  onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Employment */}
        {currentStep === 2 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-gray-500" />
              Employment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.position ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Job title"
                />
                {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => handleInputChange('employmentType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Location</label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Location</option>
                  {locations.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Join Date *</label>
                <input
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => handleInputChange('joinDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.joinDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.joinDate && <p className="text-xs text-red-500 mt-1">{errors.joinDate}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  Confirmation Date
                  <HelpIcon {...FIELD_HELP.confirmationDate} />
                </label>
                <input
                  type="date"
                  value={formData.confirmationDate}
                  onChange={(e) => handleInputChange('confirmationDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Manager</label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) => handleInputChange('manager', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Manager name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Payroll & Statutory */}
        {currentStep === 3 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-500" />
              Payroll & Statutory Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary (CTC)</label>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., HDFC Bank"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="Account number"
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
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${errors.ifscCode ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., HDFC0001234"
                  maxLength={11}
                />
                {errors.ifscCode && <p className="text-xs text-red-500 mt-1">{errors.ifscCode}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  PAN Number
                  <HelpIcon {...FIELD_HELP.panNumber} />
                </label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${errors.panNumber ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., ABCDE1234F"
                  maxLength={10}
                />
                {errors.panNumber && <p className="text-xs text-red-500 mt-1">{errors.panNumber}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  Aadhaar Number
                  <HelpIcon {...FIELD_HELP.aadhaarNumber} />
                </label>
                <input
                  type="text"
                  value={formData.aadhaarNumber}
                  onChange={(e) => handleInputChange('aadhaarNumber', e.target.value.replace(/\D/g, ''))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${errors.aadhaarNumber ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="1234 5678 9012"
                  maxLength={12}
                />
                {errors.aadhaarNumber && <p className="text-xs text-red-500 mt-1">{errors.aadhaarNumber}</p>}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  UAN Number
                  <HelpIcon {...FIELD_HELP.uanNumber} />
                </label>
                <input
                  type="text"
                  value={formData.uanNumber}
                  onChange={(e) => handleInputChange('uanNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="If existing"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  ESI Number
                  <HelpIcon {...FIELD_HELP.esiNumber} />
                </label>
                <input
                  type="text"
                  value={formData.esiNumber}
                  onChange={(e) => handleInputChange('esiNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="If applicable"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Emergency & Skills */}
        {currentStep === 4 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Heart className="h-5 w-5 text-gray-500" />
              Emergency Contact & Background
            </h3>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h4 className="font-semibold text-red-900 mb-3">Emergency Contact *</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.emergencyContactName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Contact name"
                  />
                  {errors.emergencyContactName && <p className="text-xs text-red-500 mt-1">{errors.emergencyContactName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.emergencyContactPhone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="+91 98765 43210"
                  />
                  {errors.emergencyContactPhone && <p className="text-xs text-red-500 mt-1">{errors.emergencyContactPhone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    value={formData.emergencyContactRelation}
                    onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Spouse, Parent"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <GraduationCap className="h-4 w-4" />
                  Education
                </label>
                <input
                  type="text"
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., B.Tech in Mechanical Engineering"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Previous Experience (Years)</label>
                <input
                  type="number"
                  value={formData.previousExperience}
                  onChange={(e) => handleInputChange('previousExperience', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5"
                  min="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                <textarea
                  value={formData.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List relevant skills, certifications, tools..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {currentStep === 5 && (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">Review & Submit</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-3">Personal Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Employee ID:</span><span className="font-medium">{formData.employeeId}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-medium">{formData.firstName} {formData.lastName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Email:</span><span className="font-medium">{formData.email}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Phone:</span><span className="font-medium">{formData.phone}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Gender:</span><span className="font-medium">{formData.gender}</span></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-3">Employment Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Department:</span><span className="font-medium">{formData.department}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Position:</span><span className="font-medium">{formData.position}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Type:</span><span className="font-medium capitalize">{formData.employmentType.replace('_', ' ')}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Join Date:</span><span className="font-medium">{formData.joinDate}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Location:</span><span className="font-medium">{formData.location || '-'}</span></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-3">Address</h4>
                <div className="text-sm">
                  <p className="text-gray-600">{formData.address}</p>
                  <p className="text-gray-600">{formData.city}, {formData.state} {formData.pincode}</p>
                  <p className="text-gray-600">{formData.country}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-900 mb-3">Bank & Statutory</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Bank:</span><span className="font-medium">{formData.bankName || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">PAN:</span><span className="font-medium font-mono">{formData.panNumber || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Aadhaar:</span><span className="font-medium font-mono">{formData.aadhaarNumber || '-'}</span></div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start space-x-3">
                <div className="text-green-600 mt-0.5">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 mb-1">Ready to Create Employee</h4>
                  <p className="text-sm text-green-800">
                    Please review all the information above. Once submitted, the employee record will be created
                    and onboarding tasks will be initiated.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between sticky bottom-0 bg-white border-t border-gray-200 py-4">
        <div>
          {currentStep > 0 && (
            <button onClick={prevStep} className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <ChevronLeft className="h-5 w-5" />
              <span>Previous</span>
            </button>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={handleSaveDraft} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Save Draft
          </button>
          {currentStep < 5 ? (
            <button onClick={nextStep} className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <span>Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button onClick={handleSubmit} className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Send className="h-5 w-5" />
              <span>Create Employee</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
