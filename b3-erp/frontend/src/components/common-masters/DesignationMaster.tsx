'use client';

import React, { useState } from 'react';
import { Briefcase, Plus, Search, Edit3, Trash2, Users, TrendingUp, Award } from 'lucide-react';

interface Designation {
  id: string;
  designationCode: string;
  designationName: string;
  description: string;

  department: string;
  level: 'entry' | 'junior' | 'mid' | 'senior' | 'executive' | 'cxo';
  reportingTo?: string;

  responsibilities: string[];
  qualifications: string[];

  salaryRange: {
    minSalary: number;
    maxSalary: number;
    currency: string;
  };

  requiredExperience: {
    minYears: number;
    maxYears?: number;
  };

  headcount: {
    sanctioned: number;
    current: number;
    vacant: number;
  };

  benefits: string[];

  status: 'active' | 'inactive' | 'on-hold';
  createdBy: string;
  createdAt: string;
}

import { hrMastersService } from '@/services/hr-masters.service';
import { commonMastersService } from '@/services/common-masters.service';

const COMPANY_ID = '1';

const DesignationMaster: React.FC = () => {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const data = await hrMastersService.getAllDesignations(COMPANY_ID);

      const transformedDesignations: Designation[] = data.map(item => ({
        id: item.id,
        designationCode: item.code,
        designationName: item.name,
        description: item.name,
        department: 'Unassigned',
        level: 'mid',
        responsibilities: [],
        qualifications: [],
        salaryRange: {
          minSalary: 0,
          maxSalary: 0,
          currency: 'INR'
        },
        requiredExperience: {
          minYears: 0
        },
        headcount: {
          sanctioned: 0,
          current: 0,
          vacant: 0
        },
        benefits: [],
        status: 'active',
        createdBy: 'System',
        createdAt: new Date().toISOString()
      }));

      setDesignations(transformedDesignations);
    } catch (error) {
      console.error('Error fetching designations:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDesignations();
  }, []);

  const openModal = (designation: Designation | null) => {
    setSelectedDesignation(designation);
    setFormCode(designation?.designationCode ?? '');
    setFormName(designation?.designationName ?? '');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formCode.trim()) { alert('Designation Code is required.'); return; }
    if (!formName.trim()) { alert('Designation Name is required.'); return; }
    try {
      setIsSaving(true);
      if (selectedDesignation) {
        await commonMastersService.updateDesignation(selectedDesignation.id, {
          code: formCode.trim(),
          name: formName.trim(),
        });
      } else {
        await commonMastersService.createDesignation({
          code: formCode.trim(),
          name: formName.trim(),
          companyId: COMPANY_ID,
        });
      }
      setIsModalOpen(false);
      await fetchDesignations();
      alert(`Designation ${selectedDesignation ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving designation:', error);
      alert('Failed to save designation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this designation?')) return;
    try {
      await commonMastersService.deleteDesignation(id);
      await fetchDesignations();
    } catch (error) {
      console.error('Error deleting designation:', error);
      alert('Failed to delete designation. Please try again.');
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const filteredDesignations = designations.filter(d => {
    const matchesSearch = d.designationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.designationCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || d.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const totalHeadcount = designations.reduce((sum, d) => sum + d.headcount.current, 0);
  const totalVacant = designations.reduce((sum, d) => sum + d.headcount.vacant, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="">
        <div className="bg-white rounded-lg shadow-sm p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-blue-600" />
                Designation Master
              </h1>
              <p className="text-gray-600 mt-2">Manage job positions and roles</p>
            </div>
            <button
              onClick={() => openModal(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Designation
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search designations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="entry">Entry Level</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior</option>
              <option value="executive">Executive</option>
              <option value="cxo">CXO</option>
            </select>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Designations</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{designations.length}</p>
              </div>
              <Briefcase className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Headcount</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{totalHeadcount}</p>
              </div>
              <Users className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vacant Positions</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{totalVacant}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-600 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {designations.filter(d => d.status === 'active').length}
                </p>
              </div>
              <Award className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Designations List */}
        <div className="space-y-2">
          {filteredDesignations.map(designation => (
            <div key={designation.id} className="bg-white rounded-lg shadow-sm p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{designation.designationName}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full uppercase font-medium ${designation.level === 'cxo'
                        ? 'bg-purple-100 text-purple-800'
                        : designation.level === 'executive' || designation.level === 'senior'
                          ? 'bg-blue-100 text-blue-800'
                          : designation.level === 'mid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                      {designation.level}
                    </span>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                      {designation.department}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{designation.designationCode}</p>
                  <p className="text-sm text-gray-500">{designation.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(designation)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Edit3 className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(designation.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span className="text-red-700">Delete</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {/* Headcount */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Headcount</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sanctioned:</span>
                      <span className="font-medium">{designation.headcount.sanctioned}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current:</span>
                      <span className="font-medium text-green-600">{designation.headcount.current}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vacant:</span>
                      <span className={`font-medium ${designation.headcount.vacant > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                        {designation.headcount.vacant}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Salary & Experience */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Compensation</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Min Salary:</span>
                      <span className="font-medium">
                        ₹{(designation.salaryRange.minSalary / 100000).toFixed(1)}L
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Salary:</span>
                      <span className="font-medium text-green-600">
                        ₹{(designation.salaryRange.maxSalary / 100000).toFixed(1)}L
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-medium">
                        {designation.requiredExperience.minYears}
                        {designation.requiredExperience.maxYears ? `-${designation.requiredExperience.maxYears}` : '+'} years
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reporting */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Reporting</h4>
                  <div className="space-y-1 text-sm">
                    {designation.reportingTo && (
                      <div>
                        <span className="text-gray-600">Reports To:</span>
                        <p className="font-medium">{designation.reportingTo}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Benefits:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {designation.benefits.slice(0, 3).map((benefit, index) => (
                          <span key={index} className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Responsibilities */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Responsibilities</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {designation.responsibilities.map((resp, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">
                {selectedDesignation ? 'Edit Designation' : 'Add New Designation'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation Code *
                </label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., MGR-01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter designation name"
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : `${selectedDesignation ? 'Update' : 'Create'} Designation`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignationMaster;
