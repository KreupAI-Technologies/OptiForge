'use client';

import React, { useState, useEffect } from 'react';
import {
  Phone,
  Search,
  Plus,
  ArrowRight,
  LifeBuoy,
  User,
  Building,
  Mail,
  ShieldAlert,
  Flame,
  HardHat,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Stethoscope,
  AlertCircle
} from 'lucide-react';
import { HrSafetyService, SafetyDrill } from '@/services/hr-safety.service';

interface InternalContact {
  id: string;
  name: string;
  role: string;
  dept: string;
  ext: string;
  mobile: string;
  status: string;
}

interface ExternalService {
  name: string;
  service: string;
  phone: string;
  alt: string;
}

export default function EmergencyContactsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [internalContacts, setInternalContacts] = useState<InternalContact[]>([]);
  const [externalServices, setExternalServices] = useState<ExternalService[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const rows = await HrSafetyService.getDrills('contact');
        const internal: InternalContact[] = rows
          .filter((r: SafetyDrill) => !r.serviceType)
          .map((row: SafetyDrill) => {
            const meta = (row.meta || {}) as any;
            return {
              id: String(row.code ?? row.id ?? ''),
              name: row.contactName ?? row.name ?? '',
              role: row.role ?? '',
              dept: row.department ?? '',
              ext: meta.ext ?? '',
              mobile: row.phone ?? '',
              status: row.status ?? '',
            };
          });
        const external: ExternalService[] = rows
          .filter((r: SafetyDrill) => r.serviceType)
          .map((row: SafetyDrill) => {
            const meta = (row.meta || {}) as any;
            return {
              name: row.contactName ?? row.name ?? '',
              service: row.serviceType ?? '',
              phone: row.phone ?? '',
              alt: meta.alt ?? '-',
            };
          });
        if (!cancelled) {
          setInternalContacts(internal);
          setExternalServices(external);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load emergency contacts');
          setInternalContacts([]);
          setExternalServices([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6 space-y-3">
      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" />
          Loading emergency contacts…
        </div>
      )}
      {loadError && !loading && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {loadError}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Phone className="h-8 w-8 text-orange-600" />
            Emergency Contacts Registry
          </h1>
          <p className="text-gray-500 mt-1">Centralized directory for internal response teams and external emergency services</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 shadow-sm transition-colors border border-red-700 uppercase tracking-widest gap-2">
            <ShieldAlert className="w-4 h-4" />
            Trigger Alert
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* External Rapid Contacts */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Building className="w-3.5 h-3.5" /> External Services
          </h3>
          <div className="space-y-2">
            {externalServices.map((service, idx) => (
              <div key={idx} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm group hover:border-red-200 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">{service.service}</span>
                  <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-red-400" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{service.name}</h4>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-black text-gray-900 tracking-tighter">{service.phone}</span>
                  <a
                    href={service.phone ? `tel:${service.phone.replace(/[^+\d]/g, '')}` : undefined}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                    aria-label={`Call ${service.name}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-orange-600 p-3 rounded-xl text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-2">Crisis Mode</h4>
              <p className="text-xs text-orange-50 text-opacity-80 leading-relaxed font-medium">
                In the event of a site-wide evacuation, these contacts are automatically shared with all employees via SMS/Push.
              </p>
              <button className="mt-4 w-full py-2 bg-white text-orange-600 rounded-lg text-xs font-bold shadow-sm hover:bg-orange-50 transition-colors">
                Test Notification
              </button>
            </div>
            <ShieldAlert className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 rotate-12" />
          </div>
        </div>

        {/* Internal Response Team */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Internal Response Team (ERT)</h3>
                <div className="h-4 w-px bg-gray-200"></div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 rounded text-[10px] font-bold text-green-600">
                  <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
                  {internalContacts.filter((c) => c.status === 'On Duty').length} Members Active
                </div>
              </div>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, role or department..."
                  className="w-full pl-10 pr-4 py-1.5 border border-gray-200 rounded-lg text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100">
              {internalContacts.map((contact) => (
                <div key={contact.id} className="bg-white p-3 hover:bg-gray-50 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-400 border border-gray-100 group-hover:border-orange-200 transition-colors">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 uppercase tracking-tight">{contact.name}</h4>
                        <p className="text-[10px] text-gray-500 font-medium italic mt-0.5">{contact.role}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${contact.status === 'On Duty' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                      }`}>
                      {contact.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Department</p>
                      <p className="text-xs font-bold text-gray-700 flex items-center gap-2 italic">
                        <HardHat className="w-3.5 h-3.5 text-blue-400" /> {contact.dept}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Station Extension</p>
                      <p className="text-xs font-bold text-gray-700 flex items-center gap-2 italic">
                        <Phone className="w-3.5 h-3.5 text-blue-400" /> Ext. {contact.ext}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2">
                    <a
                      href={contact.mobile ? `tel:${contact.mobile.replace(/[^+\d]/g, '')}` : undefined}
                      className={`flex-1 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2 ${contact.mobile ? '' : 'pointer-events-none opacity-50'}`}
                      aria-label={`Call ${contact.name}`}
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Mobile
                    </a>
                    <a
                      href={contact.mobile ? `sms:${contact.mobile.replace(/[^+\d]/g, '')}` : undefined}
                      className={`flex-1 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2 ${contact.mobile ? '' : 'pointer-events-none opacity-50'}`}
                      aria-label={`Message ${contact.name}`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Send Alert
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
              <button className="text-xs font-bold text-gray-500 hover:text-orange-600 transition-colors uppercase tracking-widest flex items-center gap-2">
                Load More Safety Representatives <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Response Guidelines Sidenote */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2">
              <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-blue-900 mb-1">Medical First Aiders</h4>
                <p className="text-[11px] text-blue-700 leading-relaxed font-medium italic">
                  All highlighted internal personnel are certified Life Support providers. In case of cardiac arrest, use the AED located in Block B Lobby.
                </p>
              </div>
            </div>
            <div className="p-6 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
              <div className="p-2 bg-white rounded-lg text-red-600 shadow-sm">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-900 mb-1">Fire Response</h4>
                <p className="text-[11px] text-red-700 leading-relaxed font-medium italic">
                  Evacuation Wardens must ensure all personnel are accounted for at the East Assembly Point before external services arrive.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
