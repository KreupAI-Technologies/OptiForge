'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X, Mail, Phone, Building2, Briefcase, Calendar, Lock } from 'lucide-react';
import { userManagementService } from '@/services/user-management.service';

export default function CreateUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    joinDate: '',
    password: '',
    confirmPassword: '',
    sendCredentials: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = ['Operations', 'Sales', 'IT', 'HR', 'Finance', 'Marketing', 'Procurement', 'Production'];
  const roles = ['Administrator', 'Manager', 'Executive', 'Specialist', 'Analyst', 'Technician', 'Operator'];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.joinDate) newErrors.joinDate = 'Join date is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await userManagementService.createUser({
        employeeId: formData.email.split('@')[0],
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        department: formData.department,
        jobTitle: formData.role,
        roleId: formData.role,
        password: formData.password,
      });
      // Show success message and redirect
      router.push('/it-admin/users/active');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create user';
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Create New User</h1>
            <p className="text-slate-600 mt-1">Add a new user to the system</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 space-y-3">
          
          {/* Personal Information */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.firstName ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.lastName ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="flex text-sm font-medium text-slate-700 mb-2 items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.email ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="flex text-sm font-medium text-slate-700 mb-2 items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91-98765-43210"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.phone ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Work Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Department */}
              <div>
                <label className="flex text-sm font-medium text-slate-700 mb-2 items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.department ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && <p className="text-red-600 text-sm mt-1">{errors.department}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="flex text-sm font-medium text-slate-700 mb-2 items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.role ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                {errors.role && <p className="text-red-600 text-sm mt-1">{errors.role}</p>}
              </div>

              {/* Join Date */}
              <div>
                <label className="flex text-sm font-medium text-slate-700 mb-2 items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Join Date *
                </label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.joinDate ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.joinDate && <p className="text-red-600 text-sm mt-1">{errors.joinDate}</p>}
              </div>
            </div>
          </div>

          {/* Security */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Security</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Password */}
              <div>
                <label className="flex text-sm font-medium text-slate-700 mb-2 items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.password ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <input
              type="checkbox"
              id="sendCredentials"
              checked={formData.sendCredentials}
              onChange={(e) => setFormData(prev => ({ ...prev, sendCredentials: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="sendCredentials" className="text-sm text-blue-900">
              Send login credentials to user via email
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-3 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 font-medium flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
