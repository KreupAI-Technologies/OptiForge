'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Award, Plus, Search, Edit2, Trash2, CheckCircle2,
  XCircle, Star, DollarSign, Package, TrendingUp
} from 'lucide-react';
import { manufacturingMastersService, MaterialGrade as BackendMaterialGrade } from '@/services/manufacturing-masters.service';
import { commonMastersService } from '@/services/common-masters.service';

interface MaterialGrade {
  id: string;
  code: string;
  name: string;
  category: 'Plywood' | 'MDF' | 'Particle Board' | 'HDF' | 'Solid Wood' | 'Laminates' | 'Hardware';
  grade: 'Premium' | 'Standard' | 'Economy' | 'Export Quality';
  specifications: {
    thickness?: number;
    density?: number;
    moistureContent?: number;
    bondingQuality?: string;
    formaldehydeEmission?: string;
  };
  qualityStandards: string[];
  applications: string[];
  features: string[];
  pricePerUnit: number;
  unit: string;
  minOrderQuantity: number;
  availableSizes: string[];
  supplierRating: number;
  leadTime: string;
  certifications: string[];
  warranty: string;
  status: string;
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
  };
}

export default function MaterialGradeMaster() {
  const companyId = '123e4567-e89b-12d3-a456-426614174000';
  const [materialGrades, setMaterialGrades] = useState<MaterialGrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<MaterialGrade | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState<string>('All');

  const codeRef = React.useRef<HTMLInputElement>(null);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const categoryRef = React.useRef<HTMLSelectElement>(null);
  const gradeRef = React.useRef<HTMLSelectElement>(null);
  const thicknessRef = React.useRef<HTMLInputElement>(null);
  const densityRef = React.useRef<HTMLInputElement>(null);
  const moistureContentRef = React.useRef<HTMLInputElement>(null);
  const pricePerUnitRef = React.useRef<HTMLInputElement>(null);
  const minOrderQuantityRef = React.useRef<HTMLInputElement>(null);
  const supplierRatingRef = React.useRef<HTMLInputElement>(null);
  const statusRef = React.useRef<HTMLSelectElement>(null);

  useEffect(() => {
    fetchMaterialGrades();
  }, []);

  const fetchMaterialGrades = async () => {
    try {
      setIsLoading(true);
      const data = await manufacturingMastersService.getAllMaterialGrades(companyId);

      const mapped: MaterialGrade[] = data.map(mg => ({
        id: mg.id,
        code: mg.code,
        name: mg.name,
        category: mg.category as any,
        grade: mg.grade as any,
        specifications: {
          thickness: mg.specifications?.thickness,
          density: mg.specifications?.density,
          moistureContent: mg.specifications?.moistureContent,
          bondingQuality: mg.specifications?.bondingQuality,
          formaldehydeEmission: mg.specifications?.formaldehydeEmission
        },
        qualityStandards: mg.qualityStandards,
        applications: mg.applications,
        features: mg.features,
        pricePerUnit: mg.pricePerUnit,
        unit: mg.unit || 'per unit',
        minOrderQuantity: mg.minOrderQuantity,
        availableSizes: mg.availableSizes,
        supplierRating: mg.supplierRating,
        leadTime: mg.leadTime || '',
        certifications: mg.certifications,
        warranty: mg.warranty || '',
        status: mg.status
      }));

      setMaterialGrades(mapped);
    } catch (error) {
      console.error('Error fetching material grades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (grade: MaterialGrade) => {
    setSelectedGrade(grade);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const code = codeRef.current?.value?.trim() || '';
    const name = nameRef.current?.value?.trim() || '';
    const category = categoryRef.current?.value || '';
    const grade = gradeRef.current?.value || '';
    const thickness = Number(thicknessRef.current?.value);
    const density = Number(densityRef.current?.value);
    const moistureContent = Number(moistureContentRef.current?.value);
    const pricePerUnit = Number(pricePerUnitRef.current?.value);
    const minOrderQuantity = Number(minOrderQuantityRef.current?.value);
    const supplierRating = supplierRatingRef.current?.value || '';
    const status = statusRef.current?.value || '';

    if (!code || !name) {
      alert('Code and Name are required');
      return;
    }

    const payload = {
      code,
      name,
      companyId,
      category,
      grade,
      pricePerUnit,
      minOrderQuantity,
      supplierRating: Number(supplierRating),
      status,
      specifications: { thickness, density, moistureContent }
    };

    try {
      if (selectedGrade) {
        await commonMastersService.updateMaterialGrade(selectedGrade.id, payload as any);
      } else {
        await commonMastersService.createMaterialGrade(payload as any);
      }
      setIsModalOpen(false);
      await fetchMaterialGrades();
    } catch (error) {
      console.error('Error saving material grade:', error);
      alert('Failed to save material grade');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this material grade?')) {
      try {
        await commonMastersService.deleteMaterialGrade(id);
        await fetchMaterialGrades();
      } catch (error) {
        console.error('Error deleting material grade:', error);
        alert('Failed to delete material grade');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      'Inactive': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
      'Discontinued': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-3 w-3" />
        {status}
      </span>
    );
  };

  const getGradeBadge = (grade: string) => {
    const gradeConfig = {
      'Premium': 'bg-purple-100 text-purple-800',
      'Standard': 'bg-blue-100 text-blue-800',
      'Economy': 'bg-green-100 text-green-800',
      'Export Quality': 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${gradeConfig[grade as keyof typeof gradeConfig]}`}>
        <Award className="h-3 w-3" />
        {grade}
      </span>
    );
  };

  const filteredGrades = useMemo(() => {
    return materialGrades.filter(grade => {
      const matchesSearch = grade.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grade.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grade.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = filterGrade === 'All' || grade.grade === filterGrade;
      return matchesSearch && matchesGrade;
    });
  }, [materialGrades, searchTerm, filterGrade]);

  return (
    <div className="p-6 ">
      <div className="mb-3">
        <h2 className="text-2xl font-bold mb-2">Material Grade Master</h2>
        <p className="text-gray-600">Manage material quality specifications and grade classifications</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search material grades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Grades</option>
                <option value="Premium">Premium</option>
                <option value="Standard">Standard</option>
                <option value="Economy">Economy</option>
                <option value="Export Quality">Export Quality</option>
              </select>
            </div>
            <button
              onClick={() => {
                setSelectedGrade(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Material Grade
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category & Grade
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specifications
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price & MOQ
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality Rating
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGrades.map((grade) => (
                <tr key={grade.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{grade.name}</div>
                      <div className="text-xs text-gray-500">{grade.code}</div>
                      <div className="text-xs text-gray-400">Lead: {grade.leadTime}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <div className="flex items-center gap-1 text-sm mb-1">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span>{grade.category}</span>
                      </div>
                      {getGradeBadge(grade.grade)}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-xs space-y-1">
                      {grade.specifications.thickness && (
                        <div>Thickness: {grade.specifications.thickness}mm</div>
                      )}
                      {grade.specifications.density && (
                        <div>Density: {grade.specifications.density} kg/m³</div>
                      )}
                      {grade.specifications.formaldehydeEmission && (
                        <div className="text-green-600 font-medium">
                          {grade.specifications.formaldehydeEmission}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-green-600 font-medium">
                        <DollarSign className="h-3 w-3" />
                        ₹{grade.pricePerUnit}
                      </div>
                      <div className="text-xs text-gray-500">{grade.unit}</div>
                      <div className="text-xs text-gray-400">MOQ: {grade.minOrderQuantity}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{grade.supplierRating}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {grade.certifications.slice(0, 2).join(', ')}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {getStatusBadge(grade.status)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(grade)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(grade.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {selectedGrade ? 'Edit Material Grade' : 'Add New Material Grade'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code *
                    </label>
                    <input
                      ref={codeRef}
                      type="text"
                      defaultValue={selectedGrade?.code}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="MAT-XXX-XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      ref={nameRef}
                      type="text"
                      defaultValue={selectedGrade?.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Material grade name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      ref={categoryRef}
                      defaultValue={selectedGrade?.category || 'Plywood'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Plywood">Plywood</option>
                      <option value="MDF">MDF</option>
                      <option value="Particle Board">Particle Board</option>
                      <option value="HDF">HDF</option>
                      <option value="Solid Wood">Solid Wood</option>
                      <option value="Laminates">Laminates</option>
                      <option value="Hardware">Hardware</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade *
                    </label>
                    <select
                      ref={gradeRef}
                      defaultValue={selectedGrade?.grade || 'Standard'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Premium">Premium</option>
                      <option value="Standard">Standard</option>
                      <option value="Economy">Economy</option>
                      <option value="Export Quality">Export Quality</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thickness (mm)
                    </label>
                    <input
                      ref={thicknessRef}
                      type="number"
                      defaultValue={selectedGrade?.specifications.thickness}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Density (kg/m³)
                    </label>
                    <input
                      ref={densityRef}
                      type="number"
                      defaultValue={selectedGrade?.specifications.density}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Moisture %
                    </label>
                    <input
                      ref={moistureContentRef}
                      type="number"
                      defaultValue={selectedGrade?.specifications.moistureContent}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price/Unit (₹) *
                    </label>
                    <input
                      ref={pricePerUnitRef}
                      type="number"
                      defaultValue={selectedGrade?.pricePerUnit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Order Qty
                    </label>
                    <input
                      ref={minOrderQuantityRef}
                      type="number"
                      defaultValue={selectedGrade?.minOrderQuantity}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier Rating
                    </label>
                    <input
                      ref={supplierRatingRef}
                      type="number"
                      step="0.1"
                      max="5"
                      defaultValue={selectedGrade?.supplierRating}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    ref={statusRef}
                    defaultValue={selectedGrade?.status || 'Active'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Material Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
