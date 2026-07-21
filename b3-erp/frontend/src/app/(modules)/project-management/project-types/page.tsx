'use client';

import { useState, useEffect } from 'react';
import { projectManagementService } from '@/services/ProjectManagementService';
import { EmptyState } from '@/components/ui/EmptyState';
import {
 FolderKanban,
 Plus,
 Edit,
 Trash2,
 Settings,
 ChevronRight,
 DollarSign,
 Clock,
 Users,
 FileText,
 CheckCircle,
 Tag,
 Copy,
 Eye,
} from 'lucide-react';
import {
 CreateProjectTypeModal,
 EditProjectTypeModal,
 DuplicateProjectTypeModal,
 DeleteProjectTypeModal,
 ManageCustomFieldsModal,
 ViewTypeDetailsModal,
 CreateCategoryModal,
 EditCategoryModal,
} from '@/components/project-management/ProjectTypesModals';

interface ProjectType {
 id: string;
 typeName: string;
 typeCode: string;
 category: 'Manufacturing' | 'Service' | 'Hybrid';
 description: string;
 industry: string;
 defaultDuration: string;
 budgetRange: string;
 requiredApprovals: number;
 defaultWorkflow: string;
 customFields: CustomField[];
 projectCount: number;
 activeProjects: number;
 avgSuccessRate: number;
 totalRevenue: number;
 isActive: boolean;
 createdDate: string;
 lastModified: string;
}

interface CustomField {
 fieldName: string;
 fieldType: 'Text' | 'Number' | 'Date' | 'Dropdown' | 'Boolean';
 isMandatory: boolean;
 options?: string[];
}

interface ProjectCategory {
 id: string;
 categoryName: string;
 categoryCode: string;
 description: string;
 parentCategory?: string;
 projectTypes: string[];
 color: string;
 icon: string;
 sortOrder: number;
 isActive: boolean;
}

export default function ProjectTypesPage() {
 const [activeTab, setActiveTab] = useState<'types' | 'categories'>('types');
 const [searchTerm, setSearchTerm] = useState('');
 const [categoryFilter, setCategoryFilter] = useState('all');
 const [showCreateTypeModal, setShowCreateTypeModal] = useState(false);
 const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
 const [selectedType, setSelectedType] = useState<ProjectType | null>(null);
 const [selectedCategory, setSelectedCategory] = useState<any>(null);
 const [showDetailModal, setShowDetailModal] = useState(false);

 // New modal states
 const [showEditTypeModal, setShowEditTypeModal] = useState(false);
 const [showDuplicateTypeModal, setShowDuplicateTypeModal] = useState(false);
 const [showDeleteTypeModal, setShowDeleteTypeModal] = useState(false);
 const [showCustomFieldsModal, setShowCustomFieldsModal] = useState(false);
 const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
 const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);

 const [savingType, setSavingType] = useState(false);

 const reloadTypes = async () => {
  const rows = await projectManagementService.listPmProjectTypes();
  setProjectTypes(Array.isArray(rows) ? (rows as unknown as ProjectType[]) : []);
 };

 // Handlers for Project Types
 const handleCreateType = async (data: any) => {
  setSavingType(true);
  try {
   const created = await projectManagementService.createPmProjectType(data);
   if (!created) throw new Error('Create failed');
   await reloadTypes();
   setShowCreateTypeModal(false);
  } catch (err) {
   alert(err instanceof Error ? err.message : 'Failed to create project type');
  } finally {
   setSavingType(false);
  }
 };

 const handleEditType = (type: ProjectType) => {
  setSelectedType(type);
  setShowEditTypeModal(true);
 };

 const handleDuplicateType = (type: ProjectType) => {
  setSelectedType(type);
  setShowDuplicateTypeModal(true);
 };

 const handleDeleteType = (type: ProjectType) => {
  setSelectedType(type);
  setShowDeleteTypeModal(true);
 };

 const handleManageFields = (type: ProjectType) => {
  setSelectedType(type);
  setShowCustomFieldsModal(true);
 };

 const handleViewDetails = (type: ProjectType) => {
  setSelectedType(type);
  setShowViewDetailsModal(true);
 };

 const handleEditTypeSave = async (data: any) => {
  if (!selectedType) return;
  setSavingType(true);
  try {
   const updated = await projectManagementService.updatePmProjectType(selectedType.id, data);
   if (!updated) throw new Error('Update failed');
   await reloadTypes();
   setShowEditTypeModal(false);
   setSelectedType(null);
  } catch (err) {
   alert(err instanceof Error ? err.message : 'Failed to update project type');
  } finally {
   setSavingType(false);
  }
 };

 const handleDuplicateSave = async (data: any) => {
  setSavingType(true);
  try {
   const { id, ...rest } = data ?? {};
   const created = await projectManagementService.createPmProjectType(rest);
   if (!created) throw new Error('Duplicate failed');
   await reloadTypes();
   setShowDuplicateTypeModal(false);
   setSelectedType(null);
  } catch (err) {
   alert(err instanceof Error ? err.message : 'Failed to duplicate project type');
  } finally {
   setSavingType(false);
  }
 };

 const handleDeleteConfirm = async () => {
  if (selectedType) {
   try {
    await projectManagementService.deletePmProjectType(selectedType.id);
    setProjectTypes((prev) => prev.filter((t) => t.id !== selectedType.id));
   } catch (err) {
    alert(err instanceof Error ? err.message : 'Failed to delete project type');
   }
  }
  setShowDeleteTypeModal(false);
  setSelectedType(null);
 };

 const handleFieldsSave = async (data: any) => {
  if (!selectedType) {
   setShowCustomFieldsModal(false);
   return;
  }
  setSavingType(true);
  try {
   const customFields = data?.customFields ?? data;
   const updated = await projectManagementService.updatePmProjectType(selectedType.id, { customFields } as any);
   if (!updated) throw new Error('Save failed');
   await reloadTypes();
   setShowCustomFieldsModal(false);
   setSelectedType(null);
  } catch (err) {
   alert(err instanceof Error ? err.message : 'Failed to save custom fields');
  } finally {
   setSavingType(false);
  }
 };

 // Handlers for Categories, wired to the pm project-categories endpoints.
 const reloadCategories = async () => {
  const rows = await projectManagementService.listPmProjectCategories();
  setCategories(Array.isArray(rows) ? (rows as unknown as ProjectCategory[]) : []);
 };

 const handleCreateCategory = async (data: any) => {
  try {
   const created = await projectManagementService.createPmProjectCategory(data);
   if (!created) throw new Error('Create failed');
   await reloadCategories();
  } catch (err) {
   alert(err instanceof Error ? err.message : 'Failed to create category');
  } finally {
   setShowCreateCategoryModal(false);
  }
 };

 const handleEditCategory = (category: any) => {
  setSelectedCategory(category);
  setShowEditCategoryModal(true);
 };

 const handleEditCategorySave = async (data: any) => {
  try {
   if (selectedCategory?.id) {
    const updated = await projectManagementService.updatePmProjectCategory(selectedCategory.id, data);
    if (!updated) throw new Error('Update failed');
    await reloadCategories();
   }
  } catch (err) {
   alert(err instanceof Error ? err.message : 'Failed to update category');
  } finally {
   setShowEditCategoryModal(false);
   setSelectedCategory(null);
  }
 };

 const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
 const [loadingTypes, setLoadingTypes] = useState(true);

 useEffect(() => {
  setLoadingTypes(true);
  projectManagementService.listPmProjectTypes()
   .then((rows) => { setProjectTypes(Array.isArray(rows) ? (rows as unknown as ProjectType[]) : []); })
   .catch(() => { setProjectTypes([]); })
   .finally(() => { setLoadingTypes(false); });
 }, []);

 const [categories, setCategories] = useState<ProjectCategory[]>([]);

 useEffect(() => {
  projectManagementService.listPmProjectCategories()
   .then((rows) => { setCategories(Array.isArray(rows) ? (rows as unknown as ProjectCategory[]) : []); })
   .catch(() => { setCategories([]); });
 }, []);

 const filteredTypes = projectTypes.filter((type) => {
  const matchesSearch =
   type.typeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
   type.typeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
   type.description.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCategory = categoryFilter === 'all' || type.category === categoryFilter;
  return matchesSearch && matchesCategory;
 });

 const filteredCategories = categories.filter((category) =>
  category.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  category.categoryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
  category.description.toLowerCase().includes(searchTerm.toLowerCase())
 );

 const getCategoryColor = (category: string) => {
  switch (category) {
   case 'Manufacturing':
    return 'text-blue-600 bg-blue-50';
   case 'Service':
    return 'text-green-600 bg-green-50';
   case 'Hybrid':
    return 'text-purple-600 bg-purple-50';
   default:
    return 'text-gray-600 bg-gray-50';
  }
 };

 return (
  <div className="p-6">
   {/* Header */}
   <div className="mb-3">
    <div className="flex items-center justify-between mb-2">
     <div>
      <h1 className="text-3xl font-bold text-gray-900">Project Types & Categories</h1>
      <p className="text-gray-600 mt-1">Define and manage project types with custom workflows and fields</p>
     </div>
     <button
      onClick={() => activeTab === 'types' ? setShowCreateTypeModal(true) : setShowCreateCategoryModal(true)}
      className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
     >
      <Plus className="w-4 h-4" />
      {activeTab === 'types' ? 'Create Project Type' : 'Create Category'}
     </button>
    </div>

    {/* Quick Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
     <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-gray-600">Project Types</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{projectTypes.length}</p>
        <p className="text-xs text-green-600 mt-1">{projectTypes.filter(t => t.isActive).length} active</p>
       </div>
       <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
        <FolderKanban className="w-6 h-6 text-blue-600" />
       </div>
      </div>
     </div>

     <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-gray-600">Categories</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{categories.length}</p>
        <p className="text-xs text-green-600 mt-1">{categories.filter(c => c.isActive).length} active</p>
       </div>
       <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
        <Tag className="w-6 h-6 text-purple-600" />
       </div>
      </div>
     </div>

     <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-gray-600">Total Projects</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
         {projectTypes.reduce((sum, t) => sum + t.projectCount, 0)}
        </p>
        <p className="text-xs text-blue-600 mt-1">
         {projectTypes.reduce((sum, t) => sum + t.activeProjects, 0)} active
        </p>
       </div>
       <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
        <FileText className="w-6 h-6 text-green-600" />
       </div>
      </div>
     </div>

     <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
       <div>
        <p className="text-sm text-gray-600">Total Revenue</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
         ₹{(projectTypes.reduce((sum, t) => sum + t.totalRevenue, 0) / 10000000).toFixed(0)}Cr
        </p>
        <p className="text-xs text-green-600 mt-1">All time</p>
       </div>
       <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
        <DollarSign className="w-6 h-6 text-cyan-600" />
       </div>
      </div>
     </div>
    </div>
   </div>

   {/* Tabs */}
   <div className="flex border-b border-gray-200 mb-3">
    <button
     onClick={() => setActiveTab('types')}
     className={`px-3 py-2 font-medium ${
      activeTab === 'types'
       ? 'text-cyan-600 border-b-2 border-cyan-600'
       : 'text-gray-600 hover:text-gray-900'
     }`}
    >
     Project Types ({projectTypes.length})
    </button>
    <button
     onClick={() => setActiveTab('categories')}
     className={`px-3 py-2 font-medium ${
      activeTab === 'categories'
       ? 'text-cyan-600 border-b-2 border-cyan-600'
       : 'text-gray-600 hover:text-gray-900'
     }`}
    >
     Categories ({categories.length})
    </button>
   </div>

   {/* Filters */}
   <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-3">
    <div className="flex flex-col md:flex-row gap-2">
     <div className="flex-1">
      <input
       type="text"
       placeholder={`Search ${activeTab === 'types' ? 'project types' : 'categories'}...`}
       value={searchTerm}
       onChange={(e) => setSearchTerm(e.target.value)}
       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      />
     </div>
     {activeTab === 'types' && (
      <select
       value={categoryFilter}
       onChange={(e) => setCategoryFilter(e.target.value)}
       className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      >
       <option value="all">All Categories</option>
       <option value="Manufacturing">Manufacturing</option>
       <option value="Service">Service</option>
       <option value="Hybrid">Hybrid</option>
      </select>
     )}
    </div>
   </div>

   {/* Project Types Tab */}
   {activeTab === 'types' && !loadingTypes && filteredTypes.length === 0 && (
    <EmptyState
     icon={FolderKanban}
     title="No project types found"
     description={searchTerm || categoryFilter !== 'all'
      ? 'No project types match your current filters.'
      : 'Get started by creating your first project type.'}
     action={{ label: 'Create Project Type', onClick: () => setShowCreateTypeModal(true), icon: Plus }}
    />
   )}
   {activeTab === 'types' && (filteredTypes.length > 0 || loadingTypes) && (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
     {filteredTypes.map((type) => (
      <div key={type.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow">
       <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
         <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{type.typeName}</h3>
          <span className="text-xs font-mono text-gray-500">{type.typeCode}</span>
         </div>
         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(type.category)}`}>
          {type.category}
         </span>
        </div>
       </div>

       <p className="text-sm text-gray-600 mb-2 line-clamp-2">{type.description}</p>

       <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="bg-gray-50 rounded-lg p-3">
         <p className="text-xs text-gray-600 mb-1">Industry</p>
         <p className="text-sm font-medium text-gray-900">{type.industry}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
         <p className="text-xs text-gray-600 mb-1">Duration</p>
         <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {type.defaultDuration}
         </p>
        </div>
       </div>

       <div className="bg-gray-50 rounded-lg p-3 mb-2">
        <p className="text-xs text-gray-600 mb-1">Budget Range</p>
        <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
         <DollarSign className="w-3 h-3" /> {type.budgetRange}
        </p>
       </div>

       <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="text-center">
         <p className="text-lg font-bold text-gray-900">{type.projectCount}</p>
         <p className="text-xs text-gray-600">Total Projects</p>
        </div>
        <div className="text-center">
         <p className="text-lg font-bold text-blue-600">{type.activeProjects}</p>
         <p className="text-xs text-gray-600">Active</p>
        </div>
        <div className="text-center">
         <p className="text-lg font-bold text-green-600">{type.avgSuccessRate}%</p>
         <p className="text-xs text-gray-600">Success Rate</p>
        </div>
       </div>

       <div className="border-t border-gray-200 pt-4 mb-2">
        <div className="flex items-center justify-between text-sm mb-2">
         <span className="text-gray-600">Total Revenue:</span>
         <span className="font-medium text-gray-900">₹{(type.totalRevenue / 10000000).toFixed(1)}Cr</span>
        </div>
        <div className="flex items-center justify-between text-sm">
         <span className="text-gray-600">Custom Fields:</span>
         <span className="font-medium text-gray-900">{type.customFields.length} fields</span>
        </div>
       </div>

       {/* Action Buttons */}
       <div className="flex flex-wrap gap-2">
        <button
         onClick={() => handleViewDetails(type)}
         className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-3 py-2 border border-cyan-600 text-cyan-600 rounded-lg hover:bg-cyan-50 text-sm"
        >
         <Eye className="w-4 h-4" />
         View Details
        </button>
        <button
         onClick={() => handleEditType(type)}
         className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
         title="Edit"
        >
         <Edit className="w-4 h-4 text-gray-600" />
        </button>
        <button
         onClick={() => handleDuplicateType(type)}
         className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
         title="Duplicate"
        >
         <Copy className="w-4 h-4 text-gray-600" />
        </button>
        <button
         onClick={() => handleManageFields(type)}
         className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
         title="Manage Fields"
        >
         <Settings className="w-4 h-4 text-gray-600" />
        </button>
        <button
         onClick={() => handleDeleteType(type)}
         className="inline-flex items-center gap-2 px-3 py-2 border border-red-300 rounded-lg hover:bg-red-50 text-sm"
         title="Delete"
        >
         <Trash2 className="w-4 h-4 text-red-600" />
        </button>
       </div>
      </div>
     ))}
    </div>
   )}

   {/* Categories Tab */}
   {activeTab === 'categories' && filteredCategories.length === 0 && (
    <EmptyState
     icon={Tag}
     title="No categories available"
     description="Project categories are not yet available from the backend."
    />
   )}
   {activeTab === 'categories' && filteredCategories.length > 0 && (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
     {filteredCategories.map((category) => (
      <div
       key={category.id}
       className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-shadow"
       style={{ borderTopColor: category.color, borderTopWidth: '4px' }}
      >
       <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
         <h3 className="text-lg font-semibold text-gray-900 mb-1">{category.categoryName}</h3>
         <span className="text-xs font-mono text-gray-500">{category.categoryCode}</span>
        </div>
        <div className="flex gap-2">
         <button
          onClick={() => handleEditCategory(category)}
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
         >
          <Edit className="w-4 h-4 text-gray-600" />
          <span className="text-gray-700">Edit</span>
         </button>
        </div>
       </div>

       <p className="text-sm text-gray-600 mb-2">{category.description}</p>

       {category.parentCategory && (
        <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
         <ChevronRight className="w-4 h-4" />
         <span>Parent: {category.parentCategory}</span>
        </div>
       )}

       <div className="bg-gray-50 rounded-lg p-3 mb-2">
        <p className="text-xs text-gray-600 mb-2">Linked Project Types:</p>
        <div className="flex flex-wrap gap-1">
         {category.projectTypes.map((typeCode, idx) => (
          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-white border border-gray-200 text-gray-700">
           {typeCode}
          </span>
         ))}
        </div>
       </div>

       <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Sort Order:</span>
        <span className="font-medium text-gray-900">{category.sortOrder}</span>
       </div>
      </div>
     ))}
    </div>
   )}

   {/* All Modals */}
   <CreateProjectTypeModal
    isOpen={showCreateTypeModal}
    onClose={() => setShowCreateTypeModal(false)}
    onCreate={handleCreateType}
   />

   <EditProjectTypeModal
    isOpen={showEditTypeModal}
    onClose={() => {
     setShowEditTypeModal(false);
     setSelectedType(null);
    }}
    onSave={handleEditTypeSave}
    type={selectedType}
   />

   <DuplicateProjectTypeModal
    isOpen={showDuplicateTypeModal}
    onClose={() => {
     setShowDuplicateTypeModal(false);
     setSelectedType(null);
    }}
    onDuplicate={handleDuplicateSave}
    type={selectedType}
   />

   <DeleteProjectTypeModal
    isOpen={showDeleteTypeModal}
    onClose={() => {
     setShowDeleteTypeModal(false);
     setSelectedType(null);
    }}
    onDelete={handleDeleteConfirm}
    type={selectedType}
   />

   <ManageCustomFieldsModal
    isOpen={showCustomFieldsModal}
    onClose={() => {
     setShowCustomFieldsModal(false);
     setSelectedType(null);
    }}
    onSave={handleFieldsSave}
    type={selectedType}
   />

   <ViewTypeDetailsModal
    isOpen={showViewDetailsModal}
    onClose={() => {
     setShowViewDetailsModal(false);
     setSelectedType(null);
    }}
    type={selectedType}
   />

   <CreateCategoryModal
    isOpen={showCreateCategoryModal}
    onClose={() => setShowCreateCategoryModal(false)}
    onCreate={handleCreateCategory}
   />

   <EditCategoryModal
    isOpen={showEditCategoryModal}
    onClose={() => {
     setShowEditCategoryModal(false);
     setSelectedCategory(null);
    }}
    onSave={handleEditCategorySave}
    category={selectedCategory}
   />
  </div>
 );
}
