'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Clock, CreditCard, Calendar, CheckCircle, AlertCircle, AlertTriangle, TrendingUp, Download, Upload } from 'lucide-react';
import { commonMastersService, PaymentTerm } from '@/services/common-masters.service';

const PaymentTermsMaster: React.FC = () => {
  const [terms, setTerms] = useState<PaymentTerm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      const data = await commonMastersService.getAllPaymentTerms();
      setTerms(data);
    } catch (error) {
      console.error('Failed to fetch payment terms:', error);
    } finally {
      setLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredTerms = terms.filter(t => {
    const matchesSearch = t.termName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.termCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.applicableTo === filterType || t.applicableTo === 'both';
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="">
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-green-600" />
                Payment Terms Master
              </h1>
              <p className="text-gray-600 mt-2">Manage payment conditions and terms</p>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Payment Term
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search payment terms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Types</option>
              <option value="purchase">Purchase Only</option>
              <option value="sales">Sales Only</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Terms</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{terms.length}</p>
              </div>
              <Calendar className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Purchase Terms</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {terms.filter(t => t.applicableTo === 'purchase' || t.applicableTo === 'both').length}
                </p>
              </div>
              <CreditCard className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sales Terms</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {terms.filter(t => t.applicableTo === 'sales' || t.applicableTo === 'both').length}
                </p>
              </div>
              <CreditCard className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">With Discounts</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {terms.filter(t => t.discountTerms).length}
                </p>
              </div>
              <AlertTriangle className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Payment Terms List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filteredTerms.map(term => (
            <div key={term.id} className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{term.termName}</h3>
                    {term.isDefault && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{term.termCode}</p>
                  <p className="text-sm text-gray-500">{term.description}</p>
                </div>
                <div className="flex gap-2">
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Eye className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">View</span>
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Edit className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">Edit</span>
                  </button>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{term.paymentType}</span>
                  {term.dueDays !== undefined && (
                    <span className="text-green-600 font-medium">• {term.dueDays} days</span>
                  )}
                </div>

                {term.installments && (
                  <div className="border border-gray-200 rounded p-3">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Installment Schedule</h4>
                    <div className="space-y-1">
                      {term.installments.map((inst: any, index: number) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="text-gray-600">Installment {inst.installmentNumber}:</span>
                          <span className="font-medium">{inst.percentage}% after {inst.daysAfter} days</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {term.discountTerms && (
                  <div className="flex items-center justify-between bg-green-50 rounded p-2 text-sm">
                    <span className="text-green-700">Early Payment Discount:</span>
                    <span className="font-medium text-green-800">
                      {term.discountTerms.discountPercentage}% within {term.discountTerms.discountDays} days
                    </span>
                  </div>
                )}

                {term.penaltyTerms && (
                  <div className="flex items-center justify-between bg-orange-50 rounded p-2 text-sm">
                    <span className="text-orange-700">Late Payment Penalty:</span>
                    <span className="font-medium text-orange-800">
                      {term.penaltyTerms.penaltyPercentage}% after {term.penaltyTerms.gracePeriodDays} days grace
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${term.applicableTo === 'both'
                      ? 'bg-purple-100 text-purple-800'
                      : term.applicableTo === 'purchase'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                    {term.applicableTo === 'both' ? 'Purchase & Sales' : term.applicableTo}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${term.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                    }`}>
                    {term.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentTermsMaster;
