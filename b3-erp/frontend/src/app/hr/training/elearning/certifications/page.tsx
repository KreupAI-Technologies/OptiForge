'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  Filter,
  Download,
  Share2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';

interface Certification {
  id: number | string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  image: string;
  skills: string[];
}

export default function CertificationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.get('/hr/elearning-courses')) as any[];
        const mapped: Certification[] = (Array.isArray(raw) ? raw : []).map((r) => ({
          id: r.id ?? '',
          title: r.title ?? r.name ?? '',
          issuer: r.issuer ?? '',
          issueDate: r.issueDate ?? '',
          expiryDate: r.expiryDate ?? 'Permanent',
          credentialId: r.credentialId ?? '',
          image: r.image ?? 'bg-gradient-to-br from-purple-500 to-indigo-600',
          skills: Array.isArray(r.skills) ? r.skills : [],
        }));
        if (!cancelled) setCertifications(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load certifications');
          setCertifications([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="h-8 w-8 text-purple-600" />
            My Certifications
          </h1>
          <p className="text-gray-500 mt-1">View and manage your professional credentials</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search certificates..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading certifications…
        </div>
      )}
      {loadError && !isLoading && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-3 text-white shadow-lg">
          <div className="flex items-center gap-2">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Certifications</p>
              <h2 className="text-3xl font-bold">12</h2>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex items-center gap-2">
          <div className="p-3 bg-green-50 rounded-lg">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Active Credentials</p>
            <h2 className="text-3xl font-bold text-gray-900">10</h2>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex items-center gap-2">
          <div className="p-3 bg-amber-50 rounded-lg">
            <Calendar className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Expiring Soon</p>
            <h2 className="text-3xl font-bold text-gray-900">2</h2>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {certifications.map((cert) => (
          <div key={cert.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden group">
            <div className={`h-32 ${cert.image} relative p-3 flex flex-col justify-between`}>
              <div className="flex justify-between items-start">
                <div className="bg-white/20 backdrop-blur-md p-2 rounded-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="px-2 py-1 bg-white/20 backdrop-blur-md rounded text-xs font-medium text-white">
                  {cert.expiryDate === 'Permanent' ? 'Permanent' : `Valid until ${cert.expiryDate.split(' ')[2]}`}
                </div>
              </div>
              <div className="absolute -bottom-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>

            <div className="p-6 pt-8 flex-1 flex flex-col">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">{cert.title}</h3>
                <p className="text-sm text-gray-500 font-medium mb-2">{cert.issuer}</p>

                <div className="space-y-2 text-sm text-gray-600 mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Issued</span>
                    <span className="font-medium">{cert.issueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Credential ID</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{cert.credentialId}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {cert.skills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-100 transition-colors">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Placeholder/Promo */}
        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-3 text-center hover:bg-gray-100 transition-colors cursor-pointer group">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
            <Award className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Detailed Certification?</h3>
          <p className="text-sm text-gray-500 max-w-xs mb-3">
            Upload an external certification to add it to your employee profile.
          </p>
          <button className="px-5 py-2 bg-white border border-gray-300 shadow-sm text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Upload Certificate
          </button>
        </div>
      </div>
    </div>
  );
}
