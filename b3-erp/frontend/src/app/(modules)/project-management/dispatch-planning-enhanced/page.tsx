'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { projectManagementService } from '@/services/ProjectManagementService';
import {
 Truck,
 Package,
 MapPin,
 Calendar,
 Users,
 CheckCircle,
 ArrowLeft,
 Building2,
 FileText,
 Clock,
 AlertCircle,
 Plus,
 Trash2,
 Route
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue
} from '@/components/ui/select';
import { StepIndicator } from '@/components/ui/StepIndicator';
import {
 useAutoSaveDraft,
 AutoSaveIndicator,
 DraftRecoveryBanner,
 useUnsavedChangesWarning,
 HelpIcon,
 FormProgressIndicator
} from '@/components/ui/FormUX';

interface DispatchItem {
 id: string;
 itemCode: string;
 description: string;
 quantity: number;
 weight: number;
 volume: number;
 packagingType: string;
 specialInstructions: string;
}

interface DispatchFormData {
 // Step 1: Basic Info
 projectId: string;
 projectName: string;
 dispatchNumber: string;
 dispatchDate: string;
 priority: string;

 // Step 2: Destination
 destinationType: string;
 customerName: string;
 contactPerson: string;
 contactPhone: string;
 address: string;
 city: string;
 state: string;
 pincode: string;
 deliveryInstructions: string;

 // Step 3: Items
 items: DispatchItem[];
 totalWeight: number;
 totalVolume: number;

 // Step 4: Transport
 transportMode: string;
 vehicleType: string;
 vehicleNumber: string;
 driverName: string;
 driverPhone: string;
 transportPartner: string;
 estimatedDepartureTime: string;
 estimatedArrivalTime: string;

 // Step 5: Documents & Review
 invoiceNumber: string;
 ewayBillNumber: string;
 packingSlipNumber: string;
 insuranceDetails: string;
 remarks: string;
}

const STEPS = [
 { id: 'basic', label: 'Basic Info', description: 'Dispatch details', icon: FileText },
 { id: 'destination', label: 'Destination', description: 'Delivery address', icon: MapPin },
 { id: 'items', label: 'Items', description: 'Items to dispatch', icon: Package },
 { id: 'transport', label: 'Transport', description: 'Vehicle & driver', icon: Truck },
 { id: 'review', label: 'Review', description: 'Confirm and dispatch', icon: CheckCircle },
];

const FORM_FIELDS = [
 { name: 'projectId', required: true },
 { name: 'dispatchDate', required: true },
 { name: 'customerName', required: true },
 { name: 'address', required: true },
 { name: 'city', required: true },
 { name: 'items', required: true, validate: (v: unknown) => Array.isArray(v) && v.length > 0 },
 { name: 'transportMode', required: true },
 { name: 'vehicleNumber', required: true },
 { name: 'driverName', required: true },
];

const mockProjects = [
 { id: 'PRJ-2025-001', name: 'Taj Hotels - Commercial Kitchen' },
 { id: 'PRJ-2025-002', name: 'BigBasket - Cold Room Installation' },
 { id: 'PRJ-2025-003', name: 'L&T Campus - Industrial Kitchen' },
 { id: 'PRJ-2025-004', name: 'ITC Grand - Bakery Equipment' },
];

const mockItems = [
 { code: 'EQ-CK-001', name: 'Gas Cooking Range - 6 Burner', weight: 120, volume: 2.5 },
 { code: 'EQ-CK-002', name: 'Commercial Tandoor', weight: 80, volume: 1.2 },
 { code: 'EQ-RF-001', name: 'Walk-in Cooler Panels', weight: 200, volume: 8 },
 { code: 'EQ-EX-001', name: 'Exhaust Hood with Filters', weight: 150, volume: 3.5 },
];

export default function DispatchPlanningEnhancedPage() {
 const router = useRouter();
 const { toast } = useToast();
 const [currentStep, setCurrentStep] = useState(0);
 const [errors, setErrors] = useState<Record<string, string>>({});
 const [showDraftBanner, setShowDraftBanner] = useState(true);
 const [itemCatalog, setItemCatalog] = useState(mockItems);

 useEffect(() => {
  let active = true;
  (async () => {
   try {
    const rows = await projectManagementService.listDispatchCatalog();
    if (!active || !rows || rows.length === 0) return;
    setItemCatalog(rows.map((r) => ({ code: r.code || '', name: r.name || '', weight: r.weight ?? 0, volume: r.volume ?? 0 })));
   } catch {
    // keep static fallback
   }
  })();
  return () => { active = false; };
 }, []);

 const [formData, setFormData] = useState<DispatchFormData>({
  // Step 1
  projectId: '',
  projectName: '',
  dispatchNumber: `DSP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
  dispatchDate: new Date().toISOString().split('T')[0],
  priority: 'normal',

  // Step 2
  destinationType: 'project_site',
  customerName: '',
  contactPerson: '',
  contactPhone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  deliveryInstructions: '',

  // Step 3
  items: [],
  totalWeight: 0,
  totalVolume: 0,

  // Step 4
  transportMode: '',
  vehicleType: '',
  vehicleNumber: '',
  driverName: '',
  driverPhone: '',
  transportPartner: '',
  estimatedDepartureTime: '',
  estimatedArrivalTime: '',

  // Step 5
  invoiceNumber: '',
  ewayBillNumber: '',
  packingSlipNumber: '',
  insuranceDetails: '',
  remarks: '',
 });

 // Auto-save functionality
 const { lastSaved, isSaving, hasDraft, clearDraft, restoreDraft } = useAutoSaveDraft(
  formData as unknown as Record<string, unknown>,
  { key: 'dispatch-planning-enhanced' }
 );

 // Unsaved changes warning
 const hasUnsavedChanges = Object.keys(formData).some(key => {
  const value = formData[key as keyof DispatchFormData];
  if (Array.isArray(value)) return value.length > 0;
  return value !== '';
 });
 useUnsavedChangesWarning(hasUnsavedChanges);

 const handleRestoreDraft = () => {
  const draft = restoreDraft();
  if (draft) {
   setFormData(draft as unknown as DispatchFormData);
   toast({ title: 'Draft Restored', description: 'Your previous progress has been restored.' });
  }
  setShowDraftBanner(false);
 };

 const handleDiscardDraft = () => {
  clearDraft();
  setShowDraftBanner(false);
 };

 const updateFormData = (field: keyof DispatchFormData, value: unknown) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  if (errors[field]) {
   setErrors(prev => {
    const next = { ...prev };
    delete next[field];
    return next;
   });
  }
 };

 const handleProjectChange = (projectId: string) => {
  const project = mockProjects.find(p => p.id === projectId);
  updateFormData('projectId', projectId);
  updateFormData('projectName', project?.name || '');
 };

 // Item management
 const addItem = () => {
  const newItem: DispatchItem = {
   id: Math.random().toString(36).substr(2, 9),
   itemCode: '',
   description: '',
   quantity: 1,
   weight: 0,
   volume: 0,
   packagingType: 'standard',
   specialInstructions: '',
  };
  const updatedItems = [...formData.items, newItem];
  updateFormData('items', updatedItems);
 };

 const updateItem = (id: string, field: keyof DispatchItem, value: unknown) => {
  const updatedItems = formData.items.map(item => {
   if (item.id === id) {
    const updated = { ...item, [field]: value };
    // Auto-fill from mock data if item code selected
    if (field === 'itemCode') {
     const mockItem = itemCatalog.find(m => m.code === value);
     if (mockItem) {
      updated.description = mockItem.name;
      updated.weight = mockItem.weight;
      updated.volume = mockItem.volume;
     }
    }
    return updated;
   }
   return item;
  });

  // Calculate totals
  const totalWeight = updatedItems.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
  const totalVolume = updatedItems.reduce((sum, item) => sum + (item.volume * item.quantity), 0);

  setFormData(prev => ({
   ...prev,
   items: updatedItems,
   totalWeight,
   totalVolume,
  }));
 };

 const removeItem = (id: string) => {
  const updatedItems = formData.items.filter(item => item.id !== id);
  const totalWeight = updatedItems.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
  const totalVolume = updatedItems.reduce((sum, item) => sum + (item.volume * item.quantity), 0);

  setFormData(prev => ({
   ...prev,
   items: updatedItems,
   totalWeight,
   totalVolume,
  }));
 };

 const validateStep = (step: number): boolean => {
  const newErrors: Record<string, string> = {};

  if (step === 0) {
   if (!formData.projectId) newErrors.projectId = 'Project is required';
   if (!formData.dispatchDate) newErrors.dispatchDate = 'Dispatch date is required';
  } else if (step === 1) {
   if (!formData.customerName) newErrors.customerName = 'Customer name is required';
   if (!formData.address) newErrors.address = 'Address is required';
   if (!formData.city) newErrors.city = 'City is required';
   if (!formData.pincode) newErrors.pincode = 'PIN code is required';
  } else if (step === 2) {
   if (formData.items.length === 0) newErrors.items = 'At least one item is required';
  } else if (step === 3) {
   if (!formData.transportMode) newErrors.transportMode = 'Transport mode is required';
   if (!formData.vehicleNumber) newErrors.vehicleNumber = 'Vehicle number is required';
   if (!formData.driverName) newErrors.driverName = 'Driver name is required';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
 };

 const handleNext = () => {
  if (validateStep(currentStep)) {
   if (currentStep < STEPS.length - 1) {
    setCurrentStep(currentStep + 1);
   }
  }
 };

 const handlePrevious = () => {
  if (currentStep > 0) {
   setCurrentStep(currentStep - 1);
  }
 };

 const handleSubmit = () => {
  if (validateStep(currentStep)) {
   clearDraft();
   toast({
    title: 'Dispatch Created',
    description: `Dispatch ${formData.dispatchNumber} has been successfully created and scheduled.`,
   });
   router.push('/project-management');
  }
 };

 const getPriorityColor = (priority: string) => {
  switch (priority) {
   case 'urgent': return 'bg-red-100 text-red-800';
   case 'high': return 'bg-orange-100 text-orange-800';
   case 'normal': return 'bg-blue-100 text-blue-800';
   case 'low': return 'bg-gray-100 text-gray-800';
   default: return 'bg-gray-100 text-gray-800';
  }
 };

 return (
  <div className="w-full py-2 space-y-3">
   {/* Header */}
   <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
     <Button variant="ghost" onClick={() => router.back()} className="p-0 hover:bg-transparent">
      <ArrowLeft className="w-6 h-6 text-gray-600" />
     </Button>
     <div>
      <h1 className="text-2xl font-bold text-gray-900">Create Dispatch</h1>
      <p className="text-sm text-gray-500">Phase 7: Logistics & Delivery - Plan shipment dispatch</p>
     </div>
    </div>
    <div className="flex items-center gap-2">
     <AutoSaveIndicator lastSaved={lastSaved} isSaving={isSaving} />
     <FormProgressIndicator
      fields={FORM_FIELDS}
      values={formData as unknown as Record<string, unknown>}
      variant="circular"
      size="sm"
      showFieldCount={false}
     />
    </div>
   </div>

   {/* Draft Recovery Banner */}
   {showDraftBanner && (
    <DraftRecoveryBanner
     hasDraft={hasDraft}
     onRestore={handleRestoreDraft}
     onDiscard={handleDiscardDraft}
    />
   )}

   {/* Step Indicator */}
   <Card>
    <CardContent className="pt-6">
     <StepIndicator
      steps={STEPS.map(s => ({ id: s.id, label: s.label, description: s.description }))}
      currentStep={currentStep}
      variant="default"
     />
    </CardContent>
   </Card>

   {/* Step Content */}
   <Card>
    <CardHeader>
     <CardTitle className="flex items-center gap-2">
      {(() => {
       const Icon = STEPS[currentStep].icon;
       return <Icon className="h-5 w-5 text-blue-600" />;
      })()}
      {STEPS[currentStep].label}
     </CardTitle>
     <CardDescription>{STEPS[currentStep].description}</CardDescription>
    </CardHeader>
    <CardContent>
     {/* Step 1: Basic Info */}
     {currentStep === 0 && (
      <div className="space-y-3">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
         <Label className="flex items-center gap-2">
          Project <span className="text-red-500">*</span>
          <HelpIcon content="Select the project for which items are being dispatched" />
         </Label>
         <Select value={formData.projectId} onValueChange={handleProjectChange}>
          <SelectTrigger className={errors.projectId ? 'border-red-500' : ''}>
           <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
           {mockProjects.map(project => (
            <SelectItem key={project.id} value={project.id}>
             {project.id} - {project.name}
            </SelectItem>
           ))}
          </SelectContent>
         </Select>
         {errors.projectId && <p className="text-sm text-red-500">{errors.projectId}</p>}
        </div>

        <div className="space-y-2">
         <Label>Dispatch Number</Label>
         <Input value={formData.dispatchNumber} disabled className="bg-gray-50" />
        </div>

        <div className="space-y-2">
         <Label className="flex items-center gap-2">
          Dispatch Date <span className="text-red-500">*</span>
          <HelpIcon content="Planned date for dispatch" />
         </Label>
         <Input
          type="date"
          value={formData.dispatchDate}
          onChange={(e) => updateFormData('dispatchDate', e.target.value)}
          className={errors.dispatchDate ? 'border-red-500' : ''}
         />
         {errors.dispatchDate && <p className="text-sm text-red-500">{errors.dispatchDate}</p>}
        </div>

        <div className="space-y-2">
         <Label className="flex items-center gap-2">
          Priority
          <HelpIcon content="Dispatch priority affects scheduling and route planning" />
         </Label>
         <Select value={formData.priority} onValueChange={(v) => updateFormData('priority', v)}>
          <SelectTrigger>
           <SelectValue />
          </SelectTrigger>
          <SelectContent>
           <SelectItem value="urgent">Urgent</SelectItem>
           <SelectItem value="high">High</SelectItem>
           <SelectItem value="normal">Normal</SelectItem>
           <SelectItem value="low">Low</SelectItem>
          </SelectContent>
         </Select>
        </div>
       </div>

       {formData.projectName && (
        <div className="p-4 bg-blue-50 rounded-lg">
         <div className="flex items-center gap-2 text-blue-800">
          <Building2 className="h-5 w-5" />
          <span className="font-medium">Selected Project:</span>
          <span>{formData.projectName}</span>
          <span className={`ml-auto px-2 py-1 rounded text-xs font-medium ${getPriorityColor(formData.priority)}`}>
           {formData.priority.toUpperCase()}
          </span>
         </div>
        </div>
       )}
      </div>
     )}

     {/* Step 2: Destination */}
     {currentStep === 1 && (
      <div className="space-y-3">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
         <Label>Destination Type</Label>
         <Select value={formData.destinationType} onValueChange={(v) => updateFormData('destinationType', v)}>
          <SelectTrigger>
           <SelectValue />
          </SelectTrigger>
          <SelectContent>
           <SelectItem value="project_site">Project Site</SelectItem>
           <SelectItem value="warehouse">Warehouse</SelectItem>
           <SelectItem value="customer_office">Customer Office</SelectItem>
           <SelectItem value="other">Other</SelectItem>
          </SelectContent>
         </Select>
        </div>

        <div className="space-y-2">
         <Label className="flex items-center gap-2">
          Customer Name <span className="text-red-500">*</span>
         </Label>
         <Input
          value={formData.customerName}
          onChange={(e) => updateFormData('customerName', e.target.value)}
          placeholder="Enter customer name"
          className={errors.customerName ? 'border-red-500' : ''}
         />
         {errors.customerName && <p className="text-sm text-red-500">{errors.customerName}</p>}
        </div>

        <div className="space-y-2">
         <Label>Contact Person</Label>
         <Input
          value={formData.contactPerson}
          onChange={(e) => updateFormData('contactPerson', e.target.value)}
          placeholder="Site contact person"
         />
        </div>

        <div className="space-y-2">
         <Label>Contact Phone</Label>
         <Input
          value={formData.contactPhone}
          onChange={(e) => updateFormData('contactPhone', e.target.value)}
          placeholder="+91 XXXXX XXXXX"
         />
        </div>
       </div>

       <div className="space-y-2">
        <Label className="flex items-center gap-2">
         Delivery Address <span className="text-red-500">*</span>
         <HelpIcon content="Complete address including building/plot number" />
        </Label>
        <Textarea
         value={formData.address}
         onChange={(e) => updateFormData('address', e.target.value)}
         placeholder="Enter complete delivery address"
         className={errors.address ? 'border-red-500' : ''}
         rows={3}
        />
        {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-2">
         <Label className="flex items-center gap-2">
          City <span className="text-red-500">*</span>
         </Label>
         <Input
          value={formData.city}
          onChange={(e) => updateFormData('city', e.target.value)}
          placeholder="City"
          className={errors.city ? 'border-red-500' : ''}
         />
         {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
        </div>

        <div className="space-y-2">
         <Label>State</Label>
         <Input
          value={formData.state}
          onChange={(e) => updateFormData('state', e.target.value)}
          placeholder="State"
         />
        </div>

        <div className="space-y-2">
         <Label className="flex items-center gap-2">
          PIN Code <span className="text-red-500">*</span>
         </Label>
         <Input
          value={formData.pincode}
          onChange={(e) => updateFormData('pincode', e.target.value)}
          placeholder="PIN Code"
          className={errors.pincode ? 'border-red-500' : ''}
         />
         {errors.pincode && <p className="text-sm text-red-500">{errors.pincode}</p>}
        </div>
       </div>

       <div className="space-y-2">
        <Label>Delivery Instructions</Label>
        <Textarea
         value={formData.deliveryInstructions}
         onChange={(e) => updateFormData('deliveryInstructions', e.target.value)}
         placeholder="Any special delivery instructions (e.g., loading dock, crane required)"
         rows={2}
        />
       </div>
      </div>
     )}

     {/* Step 3: Items */}
     {currentStep === 2 && (
      <div className="space-y-3">
       <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
         Add items to be dispatched
        </p>
        <Button onClick={addItem} variant="outline" size="sm">
         <Plus className="h-4 w-4 mr-2" />
         Add Item
        </Button>
       </div>

       {errors.items && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
         <AlertCircle className="h-4 w-4" />
         {errors.items}
        </div>
       )}

       {formData.items.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
         <Package className="h-12 w-12 mb-2 text-gray-300" />
         <p>No items added yet</p>
         <Button onClick={addItem} variant="link" className="mt-2">
          Click to add items
         </Button>
        </div>
       ) : (
        <div className="space-y-2">
         {formData.items.map((item, index) => (
          <Card key={item.id} className="p-4">
           <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
             {index + 1}
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
             <div className="space-y-2">
              <Label>Item Code</Label>
              <Select
               value={item.itemCode}
               onValueChange={(v) => updateItem(item.id, 'itemCode', v)}
              >
               <SelectTrigger>
                <SelectValue placeholder="Select item" />
               </SelectTrigger>
               <SelectContent>
                {itemCatalog.map(mi => (
                 <SelectItem key={mi.code} value={mi.code}>
                  {mi.code}
                 </SelectItem>
                ))}
               </SelectContent>
              </Select>
             </div>
             <div className="space-y-2">
              <Label>Description</Label>
              <Input
               value={item.description}
               onChange={(e) => updateItem(item.id, 'description', e.target.value)}
               placeholder="Item description"
              />
             </div>
             <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
               type="number"
               min="1"
               value={item.quantity}
               onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
              />
             </div>
             <div className="space-y-2">
              <Label>Packaging</Label>
              <Select
               value={item.packagingType}
               onValueChange={(v) => updateItem(item.id, 'packagingType', v)}
              >
               <SelectTrigger>
                <SelectValue />
               </SelectTrigger>
               <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="wooden_crate">Wooden Crate</SelectItem>
                <SelectItem value="pallet">Pallet</SelectItem>
                <SelectItem value="container">Container</SelectItem>
               </SelectContent>
              </Select>
             </div>
            </div>
            <Button
             variant="ghost"
             size="icon"
             onClick={() => removeItem(item.id)}
             className="text-red-500 hover:text-red-700"
            >
             <Trash2 className="h-4 w-4" />
            </Button>
           </div>
           <div className="ml-12 mt-2 flex gap-2 text-sm text-gray-500">
            <span>Weight: {item.weight * item.quantity} kg</span>
            <span>Volume: {(item.volume * item.quantity).toFixed(2)} m³</span>
           </div>
          </Card>
         ))}
        </div>
       )}

       {formData.items.length > 0 && (
        <Card className="bg-gray-50">
         <CardContent className="pt-6">
          <div className="flex justify-between items-center">
           <div className="flex gap-8">
            <div>
             <p className="text-sm text-gray-500">Total Items</p>
             <p className="text-xl font-bold">{formData.items.length}</p>
            </div>
            <div>
             <p className="text-sm text-gray-500">Total Weight</p>
             <p className="text-xl font-bold">{formData.totalWeight} kg</p>
            </div>
            <div>
             <p className="text-sm text-gray-500">Total Volume</p>
             <p className="text-xl font-bold">{formData.totalVolume.toFixed(2)} m³</p>
            </div>
           </div>
          </div>
         </CardContent>
        </Card>
       )}
      </div>
     )}

     {/* Step 4: Transport */}
     {currentStep === 3 && (
      <div className="space-y-3">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
         <Label className="flex items-center gap-2">
          Transport Mode <span className="text-red-500">*</span>
          <HelpIcon content="Select the mode of transportation" />
         </Label>
         <Select value={formData.transportMode} onValueChange={(v) => updateFormData('transportMode', v)}>
          <SelectTrigger className={errors.transportMode ? 'border-red-500' : ''}>
           <SelectValue placeholder="Select transport mode" />
          </SelectTrigger>
          <SelectContent>
           <SelectItem value="road">Road Transport</SelectItem>
           <SelectItem value="rail">Rail Freight</SelectItem>
           <SelectItem value="air">Air Cargo</SelectItem>
           <SelectItem value="sea">Sea Freight</SelectItem>
          </SelectContent>
         </Select>
         {errors.transportMode && <p className="text-sm text-red-500">{errors.transportMode}</p>}
        </div>

        <div className="space-y-2">
         <Label>Vehicle Type</Label>
         <Select value={formData.vehicleType} onValueChange={(v) => updateFormData('vehicleType', v)}>
          <SelectTrigger>
           <SelectValue placeholder="Select vehicle type" />
          </SelectTrigger>
          <SelectContent>
           <SelectItem value="tata_ace">Tata Ace (1 ton)</SelectItem>
           <SelectItem value="eicher_14ft">Eicher 14ft (3 ton)</SelectItem>
           <SelectItem value="taurus_20ft">Taurus 20ft (9 ton)</SelectItem>
           <SelectItem value="container_20ft">Container 20ft</SelectItem>
           <SelectItem value="container_40ft">Container 40ft</SelectItem>
           <SelectItem value="trailer">Trailer</SelectItem>
          </SelectContent>
         </Select>
        </div>

        <div className="space-y-2">
         <Label className="flex items-center gap-2">
          Vehicle Number <span className="text-red-500">*</span>
         </Label>
         <Input
          value={formData.vehicleNumber}
          onChange={(e) => updateFormData('vehicleNumber', e.target.value.toUpperCase())}
          placeholder="e.g., MH12AB1234"
          className={errors.vehicleNumber ? 'border-red-500' : ''}
         />
         {errors.vehicleNumber && <p className="text-sm text-red-500">{errors.vehicleNumber}</p>}
        </div>

        <div className="space-y-2">
         <Label>Transport Partner</Label>
         <Input
          value={formData.transportPartner}
          onChange={(e) => updateFormData('transportPartner', e.target.value)}
          placeholder="Transport company name"
         />
        </div>

        <div className="space-y-2">
         <Label className="flex items-center gap-2">
          Driver Name <span className="text-red-500">*</span>
         </Label>
         <Input
          value={formData.driverName}
          onChange={(e) => updateFormData('driverName', e.target.value)}
          placeholder="Driver's full name"
          className={errors.driverName ? 'border-red-500' : ''}
         />
         {errors.driverName && <p className="text-sm text-red-500">{errors.driverName}</p>}
        </div>

        <div className="space-y-2">
         <Label>Driver Phone</Label>
         <Input
          value={formData.driverPhone}
          onChange={(e) => updateFormData('driverPhone', e.target.value)}
          placeholder="+91 XXXXX XXXXX"
         />
        </div>

        <div className="space-y-2">
         <Label className="flex items-center gap-2">
          Est. Departure Time
          <HelpIcon content="Estimated time of departure from warehouse" />
         </Label>
         <Input
          type="datetime-local"
          value={formData.estimatedDepartureTime}
          onChange={(e) => updateFormData('estimatedDepartureTime', e.target.value)}
         />
        </div>

        <div className="space-y-2">
         <Label className="flex items-center gap-2">
          Est. Arrival Time
          <HelpIcon content="Estimated time of arrival at destination" />
         </Label>
         <Input
          type="datetime-local"
          value={formData.estimatedArrivalTime}
          onChange={(e) => updateFormData('estimatedArrivalTime', e.target.value)}
         />
        </div>
       </div>

       {formData.totalWeight > 0 && (
        <div className="p-4 bg-amber-50 rounded-lg">
         <div className="flex items-center gap-2 text-amber-800">
          <Route className="h-5 w-5" />
          <span className="font-medium">Load Summary:</span>
          <span>{formData.totalWeight} kg total weight</span>
          <span>|</span>
          <span>{formData.totalVolume.toFixed(2)} m³ volume</span>
         </div>
        </div>
       )}
      </div>
     )}

     {/* Step 5: Review */}
     {currentStep === 4 && (
      <div className="space-y-3">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-2">
         <Label>Invoice Number</Label>
         <Input
          value={formData.invoiceNumber}
          onChange={(e) => updateFormData('invoiceNumber', e.target.value)}
          placeholder="Invoice reference"
         />
        </div>

        <div className="space-y-2">
         <Label className="flex items-center gap-2">
          E-Way Bill Number
          <HelpIcon content="GST E-Way Bill number for goods movement" />
         </Label>
         <Input
          value={formData.ewayBillNumber}
          onChange={(e) => updateFormData('ewayBillNumber', e.target.value)}
          placeholder="E-Way Bill number"
         />
        </div>

        <div className="space-y-2">
         <Label>Packing Slip Number</Label>
         <Input
          value={formData.packingSlipNumber}
          onChange={(e) => updateFormData('packingSlipNumber', e.target.value)}
          placeholder="Packing slip reference"
         />
        </div>
       </div>

       <div className="space-y-2">
        <Label>Insurance Details</Label>
        <Textarea
         value={formData.insuranceDetails}
         onChange={(e) => updateFormData('insuranceDetails', e.target.value)}
         placeholder="Cargo insurance details (policy number, coverage)"
         rows={2}
        />
       </div>

       <div className="space-y-2">
        <Label>Remarks</Label>
        <Textarea
         value={formData.remarks}
         onChange={(e) => updateFormData('remarks', e.target.value)}
         placeholder="Any additional remarks or notes"
         rows={2}
        />
       </div>

       {/* Summary Cards */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="bg-gray-50">
         <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
           <FileText className="h-4 w-4 text-blue-600" />
           Dispatch Details
          </CardTitle>
         </CardHeader>
         <CardContent className="text-sm space-y-2">
          <div className="flex justify-between">
           <span className="text-gray-500">Dispatch No:</span>
           <span className="font-medium">{formData.dispatchNumber}</span>
          </div>
          <div className="flex justify-between">
           <span className="text-gray-500">Project:</span>
           <span className="font-medium">{formData.projectId}</span>
          </div>
          <div className="flex justify-between">
           <span className="text-gray-500">Date:</span>
           <span className="font-medium">{formData.dispatchDate}</span>
          </div>
          <div className="flex justify-between">
           <span className="text-gray-500">Priority:</span>
           <span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor(formData.priority)}`}>
            {formData.priority.toUpperCase()}
           </span>
          </div>
         </CardContent>
        </Card>

        <Card className="bg-gray-50">
         <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
           <MapPin className="h-4 w-4 text-blue-600" />
           Destination
          </CardTitle>
         </CardHeader>
         <CardContent className="text-sm space-y-2">
          <div className="flex justify-between">
           <span className="text-gray-500">Customer:</span>
           <span className="font-medium">{formData.customerName}</span>
          </div>
          <div className="flex justify-between">
           <span className="text-gray-500">City:</span>
           <span className="font-medium">{formData.city}, {formData.state}</span>
          </div>
          <div className="flex justify-between">
           <span className="text-gray-500">PIN Code:</span>
           <span className="font-medium">{formData.pincode}</span>
          </div>
         </CardContent>
        </Card>

        <Card className="bg-gray-50">
         <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
           <Package className="h-4 w-4 text-blue-600" />
           Load Summary
          </CardTitle>
         </CardHeader>
         <CardContent className="text-sm space-y-2">
          <div className="flex justify-between">
           <span className="text-gray-500">Total Items:</span>
           <span className="font-medium">{formData.items.length}</span>
          </div>
          <div className="flex justify-between">
           <span className="text-gray-500">Total Weight:</span>
           <span className="font-medium">{formData.totalWeight} kg</span>
          </div>
          <div className="flex justify-between">
           <span className="text-gray-500">Total Volume:</span>
           <span className="font-medium">{formData.totalVolume.toFixed(2)} m³</span>
          </div>
         </CardContent>
        </Card>

        <Card className="bg-gray-50">
         <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
           <Truck className="h-4 w-4 text-blue-600" />
           Transport Details
          </CardTitle>
         </CardHeader>
         <CardContent className="text-sm space-y-2">
          <div className="flex justify-between">
           <span className="text-gray-500">Mode:</span>
           <span className="font-medium capitalize">{formData.transportMode}</span>
          </div>
          <div className="flex justify-between">
           <span className="text-gray-500">Vehicle:</span>
           <span className="font-medium">{formData.vehicleNumber}</span>
          </div>
          <div className="flex justify-between">
           <span className="text-gray-500">Driver:</span>
           <span className="font-medium">{formData.driverName}</span>
          </div>
         </CardContent>
        </Card>
       </div>
      </div>
     )}
    </CardContent>
   </Card>

   {/* Navigation */}
   <div className="flex justify-between">
    <Button
     variant="outline"
     onClick={handlePrevious}
     disabled={currentStep === 0}
    >
     <ArrowLeft className="w-4 h-4 mr-2" />
     Previous
    </Button>

    {currentStep < STEPS.length - 1 ? (
     <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
      Next Step
      <CheckCircle className="w-4 h-4 ml-2" />
     </Button>
    ) : (
     <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
      <Truck className="w-4 h-4 mr-2" />
      Create Dispatch
     </Button>
    )}
   </div>
  </div>
 );
}
