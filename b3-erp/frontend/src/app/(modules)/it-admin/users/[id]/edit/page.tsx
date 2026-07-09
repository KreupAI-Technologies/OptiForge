'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, X, Mail, Phone, Building2, Briefcase, Shield } from 'lucide-react';
import {
  UserManagementService,
  UserStatus,
  UpdateUserDto,
} from '@/services/user-management.service';

const departments = ['Operations', 'Sales', 'IT', 'HR', 'Finance', 'Marketing', 'Procurement', 'Production', 'Quality', 'Warehouse', 'Human Resources'];
const roles = ['Administrator', 'Manager', 'Executive', 'Specialist', 'Analyst', 'Technician', 'Operator'];

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
    jobTitle: '',
    roleId: '',
    status: UserStatus.ACTIVE as UserStatus,
    twoFactorEnabled: false,
  });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const u = await UserManagementService.getUserById(userId);
        if (!mounted) return;
        setEmail(u.email);
        setFormData({
          firstName: u.firstName ?? '',
          lastName: u.lastName ?? '',
          phone: u.phone ?? '',
          department: u.department ?? '',
          jobTitle: u.jobTitle ?? '',
          roleId: u.roleId ?? '',
          status: u.status ?? UserStatus.ACTIVE,
          twoFactorEnabled: !!u.twoFactorEnabled,
        });
      } catch (err) {
        if (mounted) setLoadError(err instanceof Error ? err.message : 'Failed to load user.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const payload: UpdateUserDto = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        department: formData.department,
        jobTitle: formData.jobTitle,
        roleId: formData.roleId,
        status: formData.status,
        twoFactorEnabled: formData.twoFactorEnabled,
      };
      await UserManagementService.updateUser(userId, payload);
      router.push(`/it-admin/users/${userId}`);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to update user' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Edit User</h1>
            <p className="text-slate-600 mt-1">Update account information</p>
          </div>
        </div>

        {loading && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Loading user…
          </div>
        )}
        {!loading && loadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {!loading && !loadError && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 space-y-6">
            {errors.submit && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {errors.submit}
              </div>
            )}

            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.firstName ? 'border-red-500' : 'border-slate-300'}`}
                  />
                  {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.lastName ? 'border-red-500' : 'border-slate-300'}`}
                  />
                  {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
                </div>
                <div>
                  <label className="flex text-sm font-medium text-slate-700 mb-2 items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="flex text-sm font-medium text-slate-700 mb-2 items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">Work Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex text-sm font-medium text-slate-700 mb-2 items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.department ? 'border-red-500' : 'border-slate-300'}`}
                  >
                    <option value="">Select Department</option>
                    {(formData.department && !departments.includes(formData.department)
                      ? [formData.department, ...departments]
                      : departments
                    ).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.department && <p className="text-red-600 text-sm mt-1">{errors.department}</p>}
                </div>
                <div>
                  <label className="flex text-sm font-medium text-slate-700 mb-2 items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.jobTitle ? 'border-red-500' : 'border-slate-300'}`}
                  />
                  {errors.jobTitle && <p className="text-red-600 text-sm mt-1">{errors.jobTitle}</p>}
                </div>
                <div>
                  <label className="flex text-sm font-medium text-slate-700 mb-2 items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Role
                  </label>
                  <select
                    name="roleId"
                    value={formData.roleId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select Role</option>
                    {(formData.roleId && !roles.includes(formData.roleId)
                      ? [formData.roleId, ...roles]
                      : roles
                    ).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {Object.values(UserStatus).map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                id="twoFactorEnabled"
                checked={formData.twoFactorEnabled}
                onChange={(e) => setFormData((prev) => ({ ...prev, twoFactorEnabled: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="twoFactorEnabled" className="text-sm text-blue-900">
                Enable two-factor authentication for this user
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
