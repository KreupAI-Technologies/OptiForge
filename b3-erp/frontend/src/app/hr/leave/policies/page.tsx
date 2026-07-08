'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Book, Scale, Calendar, AlertCircle, Download, ChevronDown, ChevronUp, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';

interface LeavePolicyRow {
  id: string;
  code: string;
  name: string;
  description: string;
  isPaid: boolean;
  maxDaysPerYear: number;
  allowCarryForward: boolean;
  maxCarryForward: number;
  allowEncashment: boolean;
  requiresApproval: boolean;
  requiresDocument: boolean;
  accrualType: string;
  status: string;
}

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function YesNo({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-green-600 text-xs"><CheckCircle2 className="w-3.5 h-3.5" /> Yes</span>
  ) : (
    <span className="inline-flex items-center gap-1 text-gray-400 text-xs"><XCircle className="w-3.5 h-3.5" /> No</span>
  );
}

export default function LeavePoliciesPage() {
  const [expandedSection, setExpandedSection] = useState<string>('general');
  const [policies, setPolicies] = useState<LeavePolicyRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.leaveTypes<any[]>()) as any[];
        const mapped: LeavePolicyRow[] = (raw ?? []).map((r, i) => ({
          id: String(r?.id ?? `${i}`),
          code: r?.code ?? '',
          name: r?.name ?? 'Unnamed Policy',
          description: r?.description ?? '',
          isPaid: Boolean(r?.isPaid ?? true),
          maxDaysPerYear: num(r?.maxDaysPerYear ?? r?.maxDays ?? r?.defaultDays),
          allowCarryForward: Boolean(r?.allowCarryForward ?? r?.carryForward),
          maxCarryForward: num(r?.maxCarryForward ?? r?.maxCarryForwardDays),
          allowEncashment: Boolean(r?.allowEncashment),
          requiresApproval: Boolean(r?.requiresApproval ?? true),
          requiresDocument: Boolean(r?.requiresDocument ?? r?.requiresDocumentation),
          accrualType: String(r?.accrualType ?? '—'),
          status: String(r?.status ?? 'Active'),
        }));
        if (!cancelled) setPolicies(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load leave policies');
          setPolicies([]);
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

  const totals = useMemo(() => {
    const active = policies.filter((p) => p.status.toLowerCase() === 'active').length;
    const paid = policies.filter((p) => p.isPaid).length;
    const carryFwd = policies.filter((p) => p.allowCarryForward).length;
    return { total: policies.length, active, paid, carryFwd };
  }, [policies]);

  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Book className="w-7 h-7 text-blue-600" />
            Leave Policies & Guidelines
          </h1>
          <p className="text-gray-600 mt-1">Company leave policies and regulations for all employees</p>
        </div>
        <button
          onClick={() => { if (typeof window !== 'undefined') window.print(); }}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </div>

      {/* Configured Leave Policies (live data) */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Configured Leave Policies
          </h2>
          {!isLoading && !loadError && (
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{totals.total} types</span>
              <span>{totals.active} active</span>
              <span>{totals.paid} paid</span>
            </div>
          )}
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading leave policies…
          </div>
        ) : loadError ? (
          <div className="flex items-center gap-2 py-10 justify-center text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{loadError}</span>
          </div>
        ) : policies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FileText className="w-9 h-9 mb-2 text-gray-300" />
            <p>No leave policies configured yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-2.5">Leave Type</th>
                  <th className="px-4 py-2.5">Days / Year</th>
                  <th className="px-4 py-2.5">Accrual</th>
                  <th className="px-4 py-2.5">Paid</th>
                  <th className="px-4 py-2.5">Carry Fwd</th>
                  <th className="px-4 py-2.5">Encashable</th>
                  <th className="px-4 py-2.5">Doc Required</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {policies.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      {p.code && <p className="text-xs text-gray-500">{p.code}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.maxDaysPerYear || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.accrualType}</td>
                    <td className="px-4 py-3"><YesNo value={p.isPaid} /></td>
                    <td className="px-4 py-3">
                      {p.allowCarryForward ? (
                        <span className="text-xs text-gray-700">Up to {p.maxCarryForward || '—'}</span>
                      ) : (
                        <YesNo value={false} />
                      )}
                    </td>
                    <td className="px-4 py-3"><YesNo value={p.allowEncashment} /></td>
                    <td className="px-4 py-3"><YesNo value={p.requiresDocument} /></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.status.toLowerCase() === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compliance Banner */}
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
        <div className="flex items-start gap-3">
          <Scale className="w-6 h-6 text-green-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900 mb-2">Legal Compliance</h3>
            <p className="text-sm text-green-800">
              Our leave policies are compliant with the <strong>Factories Act 1948</strong>, <strong>Maternity Benefit Act 1961</strong>,
              <strong> Shops and Establishments Act</strong>, and other applicable Indian labor laws. All employees are entitled to statutory benefits as mandated by law.
            </p>
          </div>
        </div>
      </div>

      {/* Policy Sections */}
      <div className="space-y-2">

        {/* General Leave Policy */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('general')}
            className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">General Leave Policy</h2>
            </div>
            {expandedSection === 'general' ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {expandedSection === 'general' && (
            <div className="p-6 border-t border-gray-200 space-y-2">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Eligibility</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• All permanent employees are entitled to leaves as per their employment category</li>
                  <li>• Probation employees: Limited leave entitlement (Casual Leave & Sick Leave only)</li>
                  <li>• Contract employees: As per contract terms</li>
                  <li>• Leave balance is calculated on calendar year basis (Jan 1 - Dec 31)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Leave Application Process</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• All leaves must be applied through the HR portal</li>
                  <li>• Advance application required (except emergency/medical cases)</li>
                  <li>• Supervisor approval mandatory before leave commencement</li>
                  <li>• Email confirmation will be sent upon approval/rejection</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Notice Period Requirements</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Earned Leave: Minimum 3 days advance notice</li>
                  <li>• Casual Leave: Minimum 1 day advance notice</li>
                  <li>• Festival Leave: Minimum 7 days advance notice</li>
                  <li>• Sick Leave: Intimation within 2 hours of shift start (emergency)</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Earned Leave */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('earned')}
            className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌴</span>
              <h2 className="text-lg font-semibold text-gray-900">Earned Leave (EL)</h2>
            </div>
            {expandedSection === 'earned' ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {expandedSection === 'earned' && (
            <div className="p-6 border-t border-gray-200 space-y-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800"><strong>Legal Basis:</strong> Factories Act 1948 - Section 79</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Entitlement</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• 18 days per year for permanent employees</li>
                  <li>• Accrual: 1.5 days per month</li>
                  <li>• Calculated based on completed service months</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Carry Forward & Encashment</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Maximum 30 days can be carried forward to next year</li>
                  <li>• Unutilized EL can be encashed (maximum 15 days per year)</li>
                  <li>• Encashment rate: Basic salary per day</li>
                  <li>• Encashment requests processed quarterly</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Conditions</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Minimum 3 days advance notice required</li>
                  <li>• Cannot be clubbed with unauthorized absence</li>
                  <li>• Saturdays and Sundays included in leave calculation</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Casual Leave */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('casual')}
            className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📅</span>
              <h2 className="text-lg font-semibold text-gray-900">Casual Leave (CL)</h2>
            </div>
            {expandedSection === 'casual' ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {expandedSection === 'casual' && (
            <div className="p-6 border-t border-gray-200 space-y-2">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Entitlement</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• 12 days per year</li>
                  <li>• Credited annually on January 1st</li>
                  <li>• Available for all permanent and probation employees</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Usage & Restrictions</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Cannot be carried forward to next year</li>
                  <li>• Not encashable</li>
                  <li>• Maximum 3 consecutive days at a time</li>
                  <li>• Cannot be combined with other leaves</li>
                  <li>• Half-day casual leave allowed (morning or afternoon)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Application Guidelines</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Minimum 1 day advance notice</li>
                  <li>• Same-day approval at supervisor's discretion</li>
                  <li>• Subject to operational requirements</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Sick Leave */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('sick')}
            className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏥</span>
              <h2 className="text-lg font-semibold text-gray-900">Sick Leave (SL)</h2>
            </div>
            {expandedSection === 'sick' ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {expandedSection === 'sick' && (
            <div className="p-6 border-t border-gray-200 space-y-2">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Entitlement</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• 12 days per year</li>
                  <li>• Accrues monthly (1 day per month)</li>
                  <li>• Up to 10 days can be carried forward</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Medical Certificate Requirements</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Not required for 1-2 days</li>
                  <li>• <strong>Mandatory for 3+ consecutive days</strong></li>
                  <li>• Certificate must be from registered medical practitioner</li>
                  <li>• Submit within 48 hours of returning to work</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Emergency Sick Leave</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Inform supervisor within 2 hours of shift start</li>
                  <li>• WhatsApp/SMS intimation acceptable initially</li>
                  <li>• Formal application must be submitted upon return</li>
                  <li>• Failure to intimate may result in leave without pay</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Maternity Leave */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('maternity')}
            className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👶</span>
              <h2 className="text-lg font-semibold text-gray-900">Maternity Leave (ML)</h2>
            </div>
            {expandedSection === 'maternity' ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {expandedSection === 'maternity' && (
            <div className="p-6 border-t border-gray-200 space-y-2">
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                <p className="text-sm text-pink-800"><strong>Legal Basis:</strong> Maternity Benefit Act 1961 (Amended 2017)</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Entitlement</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• <strong>26 weeks (182 days)</strong> for first two children</li>
                  <li>• 12 weeks for third child onwards</li>
                  <li>• 12 weeks for adoption/commissioning mother (child below 3 months)</li>
                  <li>• Fully paid leave with regular salary</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Eligibility</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Minimum 80 days of work in 12 months preceding expected delivery</li>
                  <li>• Applicable to all permanent female employees</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Application Process</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Inform HR at least 2 months before expected delivery date</li>
                  <li>• Submit medical certificate from registered practitioner</li>
                  <li>• Can commence up to 8 weeks before expected delivery</li>
                  <li>• Remaining period can be taken post-delivery</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Work From Home Option</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• After maternity leave, WFH option for additional period (role-dependent)</li>
                  <li>• Subject to work requirements and manager approval</li>
                  <li>• Maximum 6 months WFH post maternity leave</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Compensatory Off */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('comp')}
            className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏰</span>
              <h2 className="text-lg font-semibold text-gray-900">Compensatory Off (CH)</h2>
            </div>
            {expandedSection === 'comp' ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {expandedSection === 'comp' && (
            <div className="p-6 border-t border-gray-200 space-y-2">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">When Granted</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• For working on weekly off (Sunday/declared holiday)</li>
                  <li>• For overtime beyond 9 hours on production floor</li>
                  <li>• For national/festival holidays worked</li>
                  <li>• Automatically credited after supervisor approval</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Calculation</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• 1 day comp off for full day worked on holiday</li>
                  <li>• 0.5 day for half day worked</li>
                  <li>• Overtime: 1 comp off for every 8 hours beyond regular shift</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Usage & Validity</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• <strong>Must be availed within 90 days of credit</strong></li>
                  <li>• Expires after 90 days - not encashable</li>
                  <li>• Cannot be carried forward to next year</li>
                  <li>• Can be clubbed with other leaves</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Festival Leave */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('festival')}
            className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <h2 className="text-lg font-semibold text-gray-900">Festival Leave (FL)</h2>
            </div>
            {expandedSection === 'festival' ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          {expandedSection === 'festival' && (
            <div className="p-6 border-t border-gray-200 space-y-2">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Entitlement</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• 3 days per year (fixed festivals: Diwali, Holi, Eid)</li>
                  <li>• Additional 2 restricted holidays (employee's choice from list)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Planning & Application</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• <strong>Must apply minimum 7 days in advance</strong></li>
                  <li>• Subject to production schedule and team availability</li>
                  <li>• Maximum 50% of shift team can be on leave on same festival</li>
                  <li>• Preference given to relevant religious festivals</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Important Notes</h3>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  <li>• Cannot be carried forward or encashed</li>
                  <li>• Rotation policy applies for critical festivals (Diwali, Eid)</li>
                  <li>• Production staff may need to work on festivals (with double pay or comp off)</li>
                </ul>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* FAQs */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Q: What happens to unused leave at year end?</h3>
            <p className="text-sm text-gray-700 ml-4">A: Earned Leave can be carried forward (max 30 days) or encashed. Casual Leave and Sick Leave expire and cannot be carried forward.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Q: Can I take leave during probation period?</h3>
            <p className="text-sm text-gray-700 ml-4">A: Yes, probation employees are entitled to Casual Leave and Sick Leave only. Earned Leave accrual starts after confirmation.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Q: What if my leave is rejected?</h3>
            <p className="text-sm text-gray-700 ml-4">A: You will receive a rejection reason from your supervisor. You can reapply with different dates or discuss with your manager for alternative arrangements.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Q: Can I cancel approved leave?</h3>
            <p className="text-sm text-gray-700 ml-4">A: Yes, you can withdraw approved leave before it commences. Contact your supervisor immediately and cancel through the HR portal.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Q: How is leave calculated for shift workers?</h3>
            <p className="text-sm text-gray-700 ml-4">A: Leave is calculated based on calendar days, not shift days. If your leave period includes weekly offs or holidays, they are counted as part of your leave.</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
        <p className="text-sm text-blue-800">
          For any queries regarding leave policies, contact HR Department:
          <br />
          📧 Email: <strong>hr@company.com</strong>
          <br />
          📞 Phone: <strong>+91 80 1234 5678</strong> (Ext: 234)
          <br />
          🕐 HR Helpdesk Hours: Monday - Saturday, 9:00 AM - 6:00 PM
        </p>
      </div>
    </div>
  );
}
