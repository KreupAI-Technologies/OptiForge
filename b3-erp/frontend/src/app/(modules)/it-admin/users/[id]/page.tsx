'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Shield,
  ShieldCheck,
  Clock,
  User as UserIcon,
} from 'lucide-react';
import { UserManagementService, User, UserStatus } from '@/services/user-management.service';

function statusBadge(status?: UserStatus) {
  switch (status) {
    case UserStatus.ACTIVE:
      return 'bg-green-100 text-green-700 border-green-200';
    case UserStatus.INACTIVE:
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case UserStatus.SUSPENDED:
      return 'bg-red-100 text-red-700 border-red-200';
    case UserStatus.PENDING:
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

function fmtDate(value?: Date | string) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await UserManagementService.getUserById(userId);
        if (mounted) setUser(data);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load user.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const displayName = user
    ? user.displayName || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-200 rounded-lg text-slate-600"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">User Details</h1>
              <p className="text-slate-600 mt-1">View account information</p>
            </div>
          </div>
          {user && (
            <button
              onClick={() => router.push(`/it-admin/users/${user.id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        {loading && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Loading user…
          </div>
        )}
        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && user && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 space-y-6">
            {/* Identity */}
            <div className="flex items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <UserIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">{displayName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-500">{user.employeeId}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge(user.status)}`}
                  >
                    {String(user.status ?? '').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Personal */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
                <Field icon={<Phone className="w-4 h-4" />} label="Phone" value={user.phone || '—'} />
              </div>
            </div>

            {/* Work */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Work Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field icon={<Building2 className="w-4 h-4" />} label="Department" value={user.department || '—'} />
                <Field icon={<Briefcase className="w-4 h-4" />} label="Job Title" value={user.jobTitle || '—'} />
                <Field icon={<Shield className="w-4 h-4" />} label="Role" value={user.roleName || user.roleId || '—'} />
                <Field
                  icon={user.twoFactorEnabled ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                  label="Two-Factor Auth"
                  value={user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                />
              </div>
            </div>

            {/* Activity */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field icon={<Clock className="w-4 h-4" />} label="Last Login" value={fmtDate(user.lastLogin)} />
                <Field icon={<Clock className="w-4 h-4" />} label="Password Changed" value={fmtDate(user.passwordChangedAt)} />
                <Field icon={<Calendar className="w-4 h-4" />} label="Created" value={fmtDate(user.createdAt)} />
                <Field icon={<Calendar className="w-4 h-4" />} label="Last Updated" value={fmtDate(user.updatedAt)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-sm text-slate-500 mb-1">
        {icon}
        {label}
      </p>
      <p className="font-medium text-slate-900 break-words">{value}</p>
    </div>
  );
}
