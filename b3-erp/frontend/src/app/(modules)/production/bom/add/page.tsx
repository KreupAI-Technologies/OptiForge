'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { bomService } from '@/services/bom.service';
import { commonMastersService } from '@/services/common-masters.service';
import { ProductionOrphanService } from '@/services/production/production-orphan.service';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ArrowLeft,
  Save,
  FileText,
  X,
  Plus,
  Trash2,
  Search,
  ChevronDown,
  ChevronRight,
  IndianRupee,
  Package,
  Calendar,
  Clock,
  Percent,
  Box,
  ListTree,
  AlertCircle,
  CheckCircle,
  Info,
  Upload,
  Copy,
  Grid,
  ArrowUp,
  ArrowDown,
  Indent,
  Outdent,
  Eye,
  Layers,
  DollarSign,
  TrendingUp,
  Link2,
  Factory,
  Settings,
  FileSpreadsheet,
  BookTemplate,
} from 'lucide-react';

interface BOMComponent {
  id: string;
  level: number;
  itemCode: string;
  itemName: string;
  description: string;
  quantity: number;
  uom: string;
  itemType: 'raw_material' | 'component' | 'semi_finished' | 'assembly' | 'purchased_part';
  stockAvailable: number;
  costPerUnit: number;
  extendedCost: number;
  makeOrBuy: 'make' | 'buy';
  scrapPercent: number;
  isRequired: boolean;
  isPhantom: boolean;
  alternatives?: string;
  referenceDesignator?: string;
  assemblyNotes?: string;
  supplierPreference?: string;
  children?: BOMComponent[];
}

interface Product {
  code: string;
  name: string;
  description: string;
  drawingNumber: string;
  uom: string;
  category: string;
}

interface BOM {
  bomNumber: string;
  productCode: string;
  productName: string;
  productDescription: string;
  drawingNumber: string;
  version: string;
  revision: string;
  bomType: 'manufacturing' | 'engineering' | 'planning' | 'costing';
  effectiveDate: string;
  expiryDate: string;
  batchSize: number;
  leadTime: number;
  scrapPercentage: number;
  uom: string;
  components: BOMComponent[];
}

type ItemOption = { code: string; name: string; description: string; type: string; uom: string; stock: number; cost: number };
const mapItemType = (t?: string): string => {
  const key = (t || '').toLowerCase();
  if (key.includes('raw')) return 'raw_material';
  if (key.includes('semi')) return 'semi_finished';
  if (key.includes('assembl')) return 'assembly';
  if (key.includes('purchas')) return 'purchased_part';
  if (key.includes('component')) return 'component';
  return 'raw_material';
};

type ExistingBOMOption = { productCode: string; productName: string; bomNumber: string; version: string };

const itemTypeColors = {
  raw_material: 'bg-orange-100 text-orange-700',
  component: 'bg-blue-100 text-blue-700',
  semi_finished: 'bg-purple-100 text-purple-700',
  assembly: 'bg-teal-100 text-teal-700',
  purchased_part: 'bg-pink-100 text-pink-700',
};

const itemTypeLabels = {
  raw_material: 'Raw Material',
  component: 'Component',
  semi_finished: 'Semi-Finished',
  assembly: 'Assembly',
  purchased_part: 'Purchased Part',
};

const itemTypeFilters = [
  { value: '', label: 'All Types' },
  { value: 'raw_material', label: 'Raw Materials' },
  { value: 'component', label: 'Components' },
  { value: 'semi_finished', label: 'Semi-Finished' },
  { value: 'assembly', label: 'Assemblies' },
  { value: 'purchased_part', label: 'Purchased Parts' },
];

export default function BOMAddPage() {
  const router = useRouter();
  const [bom, setBom] = useState<BOM>({
    bomNumber: `BOM-2025-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
    productCode: '',
    productName: '',
    productDescription: '',
    drawingNumber: '',
    version: 'V1.0',
    revision: 'R1',
    bomType: 'manufacturing',
    effectiveDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    batchSize: 1,
    leadTime: 0,
    scrapPercentage: 0,
    uom: '',
    components: [],
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [components, setComponents] = useState<BOMComponent[]>([]);
  const [showItemSearch, setShowItemSearch] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState('');
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedCopyBOM, setSelectedCopyBOM] = useState('');
  const [entryMethod, setEntryMethod] = useState<'manual' | 'copy' | 'import' | 'template'>('manual');
  const [items, setItems] = useState<ItemOption[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [existingBOMs, setExistingBOMs] = useState<ExistingBOMOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Assembly / BOM templates
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // JSON import (parsed component rows — not a file upload)
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // Excel file import (multipart upload to production/bom/import)
  const excelInputRef = useRef<HTMLInputElement>(null);
  const [excelImporting, setExcelImporting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Save current components as a reusable assembly template
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    // Auto-generate BOM number
    const generateBOMNumber = () => {
      const year = new Date().getFullYear();
      const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      return `BOM-${year}-${random}`;
    };

    setBom(prev => ({ ...prev, bomNumber: generateBOMNumber() }));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await commonMastersService.getItemsFull('default-company-id');
        const mapped: ItemOption[] = (raw || []).map((i) => ({
          code: i.code,
          name: i.name,
          description: i.description || '',
          type: mapItemType(i.itemType),
          uom: i.uom?.name || i.uom?.code || '',
          stock: 0,
          cost: i.costPrice ?? i.purchasePrice ?? 0,
        }));
        setItems(mapped);
        setProducts(
          (raw || [])
            .filter((i) => (i.itemType || '').toUpperCase().includes('FINISH') || (i.itemType || '').toUpperCase().includes('ASSEMBL'))
            .map((i) => ({
              code: i.code,
              name: i.name,
              description: i.description || '',
              drawingNumber: '',
              uom: i.uom?.name || i.uom?.code || '',
              category: i.itemType || '',
            }))
        );
      } catch {
        setItems([]);
        setProducts([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const boms = await bomService.getAllBOMs();
        setExistingBOMs(
          (boms || []).map((b) => ({
            productCode: b.productCode,
            productName: b.productName,
            bomNumber: b.bomCode,
            version: b.version,
          }))
        );
      } catch {
        setExistingBOMs([]);
      }
    })();
  }, []);

  const toggleComponent = (id: string) => {
    const newExpanded = new Set(expandedComponents);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedComponents(newExpanded);
  };

  const calculateExtendedCost = (quantity: number, costPerUnit: number): number => {
    return quantity * costPerUnit;
  };

  const calculateTotalCost = (comps: BOMComponent[]): number => {
    let total = 0;
    comps.forEach((comp) => {
      total += comp.extendedCost;
      if (comp.children) {
        total += calculateTotalCost(comp.children);
      }
    });
    return total;
  };

  const calculateMaterialCost = (comps: BOMComponent[]): number => {
    let total = 0;
    comps.forEach((comp) => {
      if (comp.itemType === 'raw_material' || comp.itemType === 'purchased_part') {
        total += comp.extendedCost;
      }
      if (comp.children) {
        total += calculateMaterialCost(comp.children);
      }
    });
    return total;
  };

  const handleProductChange = (productCode: string) => {
    const product = products.find((p) => p.code === productCode);
    if (product) {
      setSelectedProduct(product);
      setBom({
        ...bom,
        productCode: product.code,
        productName: product.name,
        productDescription: product.description,
        drawingNumber: product.drawingNumber,
        uom: product.uom,
      });
    }
  };

  const handleItemSelect = (componentId: string, item: any) => {
    const updateComponentItem = (comps: BOMComponent[]): BOMComponent[] => {
      return comps.map((comp) => {
        if (comp.id === componentId) {
          const newComp = {
            ...comp,
            itemCode: item.code,
            itemName: item.name,
            description: item.description,
            uom: item.uom,
            itemType: item.type,
            stockAvailable: item.stock,
            costPerUnit: item.cost,
            extendedCost: calculateExtendedCost(comp.quantity, item.cost),
          };
          return newComp;
        }
        if (comp.children) {
          return {
            ...comp,
            children: updateComponentItem(comp.children),
          };
        }
        return comp;
      });
    };

    setComponents(updateComponentItem(components));
    setShowItemSearch(null);
    setSearchQuery('');
    setItemTypeFilter('');
  };

  const handleQuantityChange = (componentId: string, quantity: number) => {
    const updateQuantity = (comps: BOMComponent[]): BOMComponent[] => {
      return comps.map((comp) => {
        if (comp.id === componentId) {
          return {
            ...comp,
            quantity,
            extendedCost: calculateExtendedCost(quantity, comp.costPerUnit),
          };
        }
        if (comp.children) {
          return {
            ...comp,
            children: updateQuantity(comp.children),
          };
        }
        return comp;
      });
    };

    setComponents(updateQuantity(components));
  };

  const handleScrapPercentChange = (componentId: string, scrapPercent: number) => {
    const updateScrap = (comps: BOMComponent[]): BOMComponent[] => {
      return comps.map((comp) => {
        if (comp.id === componentId) {
          return { ...comp, scrapPercent };
        }
        if (comp.children) {
          return {
            ...comp,
            children: updateScrap(comp.children),
          };
        }
        return comp;
      });
    };

    setComponents(updateScrap(components));
  };

  const addComponent = (level: number, parentId?: string) => {
    const newComponent: BOMComponent = {
      id: `new-${Date.now()}-${Math.random()}`,
      level,
      itemCode: '',
      itemName: '',
      description: '',
      quantity: 1,
      uom: '',
      itemType: 'raw_material',
      stockAvailable: 0,
      costPerUnit: 0,
      extendedCost: 0,
      makeOrBuy: 'buy',
      scrapPercent: 0,
      isRequired: true,
      isPhantom: false,
    };

    if (parentId) {
      const addToParent = (comps: BOMComponent[]): BOMComponent[] => {
        return comps.map((comp) => {
          if (comp.id === parentId) {
            return {
              ...comp,
              children: [...(comp.children || []), newComponent],
            };
          }
          if (comp.children) {
            return {
              ...comp,
              children: addToParent(comp.children),
            };
          }
          return comp;
        });
      };
      setComponents(addToParent(components));
      setExpandedComponents(new Set(Array.from(expandedComponents).concat(parentId)));
    } else {
      setComponents([...components, newComponent]);
    }
  };

  const removeComponent = (componentId: string) => {
    const removeFromTree = (comps: BOMComponent[]): BOMComponent[] => {
      return comps
        .filter((comp) => comp.id !== componentId)
        .map((comp) => ({
          ...comp,
          children: comp.children ? removeFromTree(comp.children) : undefined,
        }));
    };

    setComponents(removeFromTree(components));
  };

  const checkCircularReference = (components: BOMComponent[], productCode: string): boolean => {
    // Check if any component references the parent product (circular reference)
    for (const comp of components) {
      if (comp.itemCode === productCode) {
        return true;
      }
      if (comp.children && checkCircularReference(comp.children, productCode)) {
        return true;
      }
    }
    return false;
  };

  const checkDuplicateComponents = (components: BOMComponent[]): string[] => {
    const duplicates: string[] = [];
    const seen = new Set<string>();

    const checkDuplicates = (comps: BOMComponent[], level: number) => {
      comps.forEach((comp) => {
        if (comp.itemCode) {
          const key = `${level}-${comp.itemCode}`;
          if (seen.has(key)) {
            duplicates.push(`${comp.itemCode} (Level ${level})`);
          }
          seen.add(key);
        }
        if (comp.children) {
          checkDuplicates(comp.children, level + 1);
        }
      });
    };

    checkDuplicates(components, 0);
    return duplicates;
  };

  const validateBOM = (): boolean => {
    const errors: string[] = [];

    if (!bom.productCode) {
      errors.push('Please select a product');
    }

    if (!bom.version) {
      errors.push('Version is required');
    }

    if (components.length === 0) {
      errors.push('BOM must have at least one component');
    }

    // Check circular references
    if (checkCircularReference(components, bom.productCode)) {
      errors.push('Circular reference detected: Component cannot include the parent product');
    }

    // Check duplicates
    const duplicates = checkDuplicateComponents(components);
    if (duplicates.length > 0) {
      errors.push(`Duplicate components detected at same level: ${duplicates.join(', ')}`);
    }

    const validateComponents = (comps: BOMComponent[]) => {
      comps.forEach((comp) => {
        if (!comp.itemCode) {
          errors.push(`Component at level ${comp.level} is missing item code`);
        }
        if (comp.quantity <= 0) {
          errors.push(`${comp.itemCode || 'Unknown'}: Quantity must be greater than 0`);
        }
        if (comp.scrapPercent < 0 || comp.scrapPercent > 100) {
          errors.push(`${comp.itemCode || 'Unknown'}: Scrap percentage must be between 0 and 100`);
        }
        if (comp.children) {
          validateComponents(comp.children);
        }
      });
    };

    validateComponents(components);

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = async (status: 'draft' | 'submit' | 'activate') => {
    if (!validateBOM()) {
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        ...bom,
        productId: bom.productCode,
        bomType: bom.bomType,
        baseQuantity: bom.batchSize,
        effectiveDate: bom.effectiveDate,
        expiryDate: bom.expiryDate || undefined,
        description: bom.productDescription,
        components,
        status,
      };
      await bomService.createBOM(payload as any);
      router.push('/production/bom');
    } catch (error) {
      console.error('Failed to create BOM:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to create BOM. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel? All unsaved data will be lost.')) {
      router.push('/production/bom');
    }
  };

  const handleCopyFromExisting = async () => {
    if (!selectedCopyBOM) return;
    setSaveError(null);
    try {
      const all = await bomService.getAllBOMs();
      const source = (all || []).find((b) => b.bomCode === selectedCopyBOM);
      if (source) {
        const full = await bomService.getBOMById(source.id);
        const copied: BOMComponent[] = (full.components || []).map((c) => ({
          id: `copy-${Date.now()}-${Math.random()}`,
          level: 0,
          itemCode: c.itemCode,
          itemName: c.itemName,
          description: c.notes || '',
          quantity: c.quantity,
          uom: c.uom,
          itemType: 'component',
          stockAvailable: 0,
          costPerUnit: c.unitCost,
          extendedCost: calculateExtendedCost(c.quantity, c.unitCost),
          makeOrBuy: 'buy',
          scrapPercent: c.scrapPercentage,
          isRequired: true,
          isPhantom: c.isPhantom,
        }));
        setComponents(copied);
      }
      setShowCopyModal(false);
    } catch (error) {
      console.error('Failed to copy BOM:', error);
      setSaveError('Failed to copy the selected BOM.');
    }
  };

  // Import BOM components from a pasted JSON array of parsed rows (NOT a file
  // upload). Each row is mapped into the component grid; the user then saves
  // via the normal Save action (which POSTs to the BOM create endpoint).
  const openImportModal = () => {
    setImportText('');
    setImportError(null);
    setShowImportModal(true);
  };

  const handleImportRows = () => {
    setImportError(null);
    let parsed: any;
    try {
      parsed = JSON.parse(importText);
    } catch {
      setImportError('Invalid JSON. Paste an array of component rows.');
      return;
    }
    const rows = Array.isArray(parsed) ? parsed : parsed?.components;
    if (!Array.isArray(rows) || rows.length === 0) {
      setImportError('Expected a non-empty JSON array of component rows.');
      return;
    }
    const mapped: BOMComponent[] = rows.map((r: any) => {
      const quantity = Number(r?.quantity) || 0;
      const costPerUnit = Number(r?.unitCost ?? r?.costPerUnit) || 0;
      return {
        id: `import-${Date.now()}-${Math.random()}`,
        level: Number(r?.level) || 0,
        itemCode: String(r?.itemCode ?? ''),
        itemName: String(r?.itemName ?? ''),
        description: String(r?.description ?? ''),
        quantity,
        uom: String(r?.uom ?? 'PCS'),
        itemType: mapItemType(r?.itemType) as BOMComponent['itemType'],
        stockAvailable: 0,
        costPerUnit,
        extendedCost: calculateExtendedCost(quantity, costPerUnit),
        makeOrBuy: (r?.makeOrBuy === 'make' ? 'make' : 'buy') as 'make' | 'buy',
        scrapPercent: Number(r?.scrapPercentage ?? r?.scrapPercent) || 0,
        isRequired: true,
        isPhantom: !!r?.isPhantom,
      };
    });
    setComponents(mapped);
    setShowImportModal(false);
  };

  // Import from Excel — uploads the selected spreadsheet to
  // POST production/bom/import (multipart). The backend parses the file and
  // returns component rows, which are mapped into the grid for review/save.
  const handleExcelFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset the input so selecting the same file again re-triggers change.
    if (excelInputRef.current) excelInputRef.current.value = '';
    if (!file) return;
    setExcelImporting(true);
    setSaveError(null);
    setActionMessage(null);
    try {
      const res = await ProductionOrphanService.importBomFile(file, {
        productCode: bom.productCode,
        bomType: bom.bomType,
      });
      const rows = Array.isArray(res)
        ? res
        : Array.isArray(res?.components)
        ? res.components
        : Array.isArray(res?.data)
        ? res.data
        : [];
      const mapped: BOMComponent[] = rows.map((r: any) => {
        const quantity = Number(r?.quantity) || 0;
        const costPerUnit = Number(r?.unitCost ?? r?.costPerUnit) || 0;
        return {
          id: `xls-${Date.now()}-${Math.random()}`,
          level: Number(r?.level) || 0,
          itemCode: String(r?.itemCode ?? ''),
          itemName: String(r?.itemName ?? ''),
          description: String(r?.description ?? ''),
          quantity,
          uom: String(r?.uom ?? 'PCS'),
          itemType: mapItemType(r?.itemType) as BOMComponent['itemType'],
          stockAvailable: 0,
          costPerUnit,
          extendedCost: calculateExtendedCost(quantity, costPerUnit),
          makeOrBuy: (r?.makeOrBuy === 'make' ? 'make' : 'buy') as 'make' | 'buy',
          scrapPercent: Number(r?.scrapPercentage ?? r?.scrapPercent) || 0,
          isRequired: true,
          isPhantom: !!r?.isPhantom,
        };
      });
      if (mapped.length > 0) setComponents(mapped);
      setActionMessage(
        `Imported ${mapped.length} component${mapped.length === 1 ? '' : 's'} from "${file.name}". Review and save the BOM.`,
      );
    } catch (err: any) {
      setSaveError(err?.message ?? 'Failed to import the Excel file.');
    } finally {
      setExcelImporting(false);
    }
  };

  // Save current components as a reusable assembly template via
  // POST production/bom-templates.
  const openSaveTemplateModal = () => {
    if (components.length === 0) {
      setSaveError('Add at least one component before saving a template.');
      return;
    }
    setSaveError(null);
    setTemplateName(bom.productName || 'New Assembly Template');
    setShowSaveTemplateModal(true);
  };

  const handleSaveAsTemplate = async () => {
    if (components.length === 0) {
      setSaveError('Add at least one component before saving a template.');
      return;
    }
    const name = templateName.trim();
    if (!name) return;
    setSavingTemplate(true);
    setSaveError(null);
    setActionMessage(null);
    try {
      await ProductionOrphanService.createBomTemplate({
        name,
        code: `TPL-${Date.now()}`,
        bomType: bom.bomType,
        componentCount: components.length,
        components: components.map((c) => ({
          level: c.level,
          itemCode: c.itemCode,
          itemName: c.itemName,
          description: c.description,
          quantity: c.quantity,
          uom: c.uom,
          itemType: c.itemType,
          unitCost: c.costPerUnit,
          scrapPercentage: c.scrapPercent,
          makeOrBuy: c.makeOrBuy,
          isPhantom: c.isPhantom,
        })),
      });
      setShowSaveTemplateModal(false);
      setActionMessage(`Saved "${name}" as an assembly template.`);
    } catch (err: any) {
      setSaveError(err?.message ?? 'Failed to save the assembly template.');
    } finally {
      setSavingTemplate(false);
    }
  };

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    setSaveError(null);
    try {
      const res = await ProductionOrphanService.getBomTemplates();
      setTemplates(Array.isArray(res) ? res : []);
      setShowTemplateModal(true);
    } catch (err: any) {
      setSaveError(err?.message ?? 'Failed to load assembly templates.');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplateId) return;
    const tpl = templates.find((t) => String(t.id) === String(selectedTemplateId));
    const rows = Array.isArray(tpl?.components) ? tpl.components : [];
    const mapped: BOMComponent[] = rows.map((r: any) => {
      const quantity = Number(r?.quantity) || 0;
      const costPerUnit = Number(r?.unitCost ?? r?.costPerUnit) || 0;
      return {
        id: `tpl-${Date.now()}-${Math.random()}`,
        level: Number(r?.level) || 0,
        itemCode: String(r?.itemCode ?? ''),
        itemName: String(r?.itemName ?? ''),
        description: String(r?.description ?? ''),
        quantity,
        uom: String(r?.uom ?? 'PCS'),
        itemType: mapItemType(r?.itemType) as BOMComponent['itemType'],
        stockAvailable: 0,
        costPerUnit,
        extendedCost: calculateExtendedCost(quantity, costPerUnit),
        makeOrBuy: (r?.makeOrBuy === 'make' ? 'make' : 'buy') as 'make' | 'buy',
        scrapPercent: Number(r?.scrapPercentage ?? r?.scrapPercent) || 0,
        isRequired: true,
        isPhantom: !!r?.isPhantom,
      };
    });
    setComponents(mapped);
    if (tpl?.bomType) setBom((prev) => ({ ...prev, bomType: tpl.bomType }));
    setShowTemplateModal(false);
  };

  const renderComponentRow = (component: BOMComponent, parentId?: string): JSX.Element[] => {
    const isExpanded = expandedComponents.has(component.id);
    const hasChildren = component.children && component.children.length > 0;
    const isSearching = showItemSearch === component.id;

    const filteredItems = items.filter((item) => {
      const matchesSearch =
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !itemTypeFilter || item.type === itemTypeFilter;
      return matchesSearch && matchesType;
    });

    const rows: JSX.Element[] = [
      <tr key={component.id} className="hover:bg-gray-50 border-b border-gray-200">
        <td className="px-3 py-2">
          <div className="flex items-center space-x-2" style={{ paddingLeft: `${component.level * 24}px` }}>
            {hasChildren ? (
              <button
                onClick={() => toggleComponent(component.id)}
                className="p-0.5 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
              </button>
            ) : (
              <span className="w-5"></span>
            )}
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              {component.level}
            </span>
          </div>
        </td>
        <td className="px-3 py-2">
          <div className="relative">
            {!component.itemCode ? (
              <button
                onClick={() => setShowItemSearch(component.id)}
                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-left text-sm text-gray-500 hover:bg-blue-50 hover:border-blue-400 flex items-center justify-between"
              >
                <span>Click to select item...</span>
                <Search className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <div className="font-mono text-sm font-semibold text-gray-900">{component.itemCode}</div>
                  <div className="text-xs text-gray-600">{component.itemName}</div>
                  <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full mt-1 ${itemTypeColors[component.itemType]}`}>
                    {itemTypeLabels[component.itemType]}
                  </span>
                </div>
                <button
                  onClick={() => setShowItemSearch(component.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Search className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            )}

            {isSearching && (
              <div className="absolute top-full left-0 mt-1 w-[32rem] bg-white border border-gray-300 rounded-lg shadow-xl z-20">
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by code or name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={() => {
                        setShowItemSearch(null);
                        setSearchQuery('');
                        setItemTypeFilter('');
                      }}
                      className="p-2 hover:bg-gray-200 rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <select
                    value={itemTypeFilter}
                    onChange={(e) => setItemTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {itemTypeFilters.map((filter) => (
                      <option key={filter.value} value={filter.value}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <button
                        key={item.code}
                        onClick={() => handleItemSelect(component.id, item)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-0 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-mono text-sm font-semibold text-gray-900">{item.code}</div>
                            <div className="text-sm text-gray-700 mt-0.5">{item.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${itemTypeColors[item.type as keyof typeof itemTypeColors]}`}>
                                {itemTypeLabels[item.type as keyof typeof itemTypeLabels]}
                              </span>
                              <span className="text-xs text-gray-600">Stock: <span className="font-semibold">{item.stock}</span></span>
                              <span className="text-xs text-gray-600">UOM: <span className="font-semibold">{item.uom}</span></span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="flex items-center text-lg font-bold text-green-700">
                              <IndianRupee className="h-4 w-4" />
                              <span>{item.cost.toFixed(2)}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">per {item.uom}</div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <Package className="h-8 w-8 mb-2 text-gray-400" />
                      <p className="text-sm">No items found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </td>
        <td className="px-3 py-2">
          <input
            type="number"
            value={component.quantity}
            onChange={(e) => handleQuantityChange(component.id, parseFloat(e.target.value) || 0)}
            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.01"
            min="0"
          />
        </td>
        <td className="px-3 py-2 text-center">
          <span className="text-sm text-gray-700">{component.uom || '-'}</span>
        </td>
        <td className="px-3 py-2">
          <input
            type="number"
            value={component.scrapPercent}
            onChange={(e) => handleScrapPercentChange(component.id, parseFloat(e.target.value) || 0)}
            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.1"
            min="0"
            max="100"
          />
        </td>
        <td className="px-3 py-2 text-center">
          <span className={`text-sm font-semibold ${component.stockAvailable > 0 ? 'text-green-700' : 'text-red-700'}`}>
            {component.stockAvailable}
          </span>
        </td>
        <td className="px-3 py-2">
          <div className="flex items-center justify-end text-gray-900 text-sm">
            <IndianRupee className="h-3.5 w-3.5" />
            <span>{component.costPerUnit.toFixed(2)}</span>
          </div>
        </td>
        <td className="px-3 py-2">
          <div className="flex items-center justify-end text-blue-900 font-semibold text-sm">
            <IndianRupee className="h-4 w-4" />
            <span>{component.extendedCost.toFixed(2)}</span>
          </div>
        </td>
        <td className="px-3 py-2">
          <select
            value={component.makeOrBuy}
            onChange={(e) => {
              const updateMakeOrBuy = (comps: BOMComponent[]): BOMComponent[] => {
                return comps.map((comp) => {
                  if (comp.id === component.id) {
                    return { ...comp, makeOrBuy: e.target.value as 'make' | 'buy' };
                  }
                  if (comp.children) {
                    return { ...comp, children: updateMakeOrBuy(comp.children) };
                  }
                  return comp;
                });
              };
              setComponents(updateMakeOrBuy(components));
            }}
            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="make">Make</option>
            <option value="buy">Buy</option>
          </select>
        </td>
        <td className="px-3 py-2">
          <div className="flex items-center space-x-1">
            {component.level < 3 && (
              <button
                onClick={() => addComponent(component.level + 1, component.id)}
                className="p-1 hover:bg-blue-100 rounded text-blue-600"

              >
                <Plus className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => removeComponent(component.id)}
              className="p-1 hover:bg-red-100 rounded text-red-600"

            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>,
    ];

    if (isExpanded && hasChildren && component.children) {
      component.children.forEach((child) => {
        rows.push(...renderComponentRow(child, component.id));
      });
    }

    return rows;
  };

  const totalCost = calculateTotalCost(components);
  const materialCost = calculateMaterialCost(components);
  const laborCost = totalCost * 0.15; // Estimated 15% of total
  const overheadCost = totalCost * 0.10; // Estimated 10% of total
  const scrapCost = (materialCost * bom.scrapPercentage) / 100;
  const grandTotal = totalCost + laborCost + overheadCost + scrapCost;
  const suggestedPrice30 = grandTotal * 1.3;
  const suggestedPrice40 = grandTotal * 1.4;

  return (
    <div className="w-full h-full px-4 py-2">
      {/* Header */}
      <div className="mb-3">
        <button
          onClick={() => router.push('/production/bom')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to BOM List</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Bill of Materials</h1>
              <p className="text-sm text-gray-500 mt-1">BOM Number: <span className="font-semibold text-gray-700">{bom.bomNumber}</span></p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              ref={excelInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleExcelFileSelected}
              className="hidden"
            />
            <button
              onClick={() => excelInputRef.current?.click()}
              disabled={excelImporting}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>{excelImporting ? 'Importing…' : 'Import from Excel'}</span>
            </button>
            <button
              onClick={openSaveTemplateModal}
              disabled={savingTemplate || components.length === 0}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BookTemplate className="h-4 w-4" />
              <span>{savingTemplate ? 'Saving…' : 'Save as Template'}</span>
            </button>
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="h-4 w-4" />
              <span>{saving ? 'Saving…' : 'Save as Draft'}</span>
            </button>
            <button
              onClick={() => handleSave('submit')}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{saving ? 'Saving…' : 'Submit for Approval'}</span>
            </button>
            <button
              onClick={() => handleSave('activate')}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving…' : 'Activate'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-red-900 mb-2">Please fix the following errors:</h4>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Save Error */}
      {saveError && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{saveError}</p>
        </div>
      )}

      {/* Action Message (Excel import / template save) */}
      {actionMessage && (
        <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start justify-between space-x-2">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{actionMessage}</p>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-green-600 hover:text-green-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* BOM Details Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center space-x-2">
          <Package className="h-5 w-5 text-blue-600" />
          <span>BOM Header Information</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {/* Product Selection */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Product <span className="text-red-500">*</span>
            </label>
            <select
              value={bom.productCode}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a product to create BOM --</option>
              {products.map((product) => (
                <option key={product.code} value={product.code}>
                  {product.code} - {product.name}
                </option>
              ))}
            </select>
          </div>

          {/* BOM Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BOM Type</label>
            <select
              value={bom.bomType}
              onChange={(e) => setBom({ ...bom, bomType: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="manufacturing">Manufacturing BOM</option>
              <option value="engineering">Engineering BOM</option>
              <option value="planning">Planning BOM (MRP)</option>
              <option value="costing">Costing BOM</option>
            </select>
          </div>

          {/* Version */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
            <input
              type="text"
              value={bom.version}
              onChange={(e) => setBom({ ...bom, version: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="V1.0, V1.1, etc."
            />
          </div>

          {/* Effective Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
            <input
              type="date"
              value={bom.effectiveDate}
              onChange={(e) => setBom({ ...bom, effectiveDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Batch Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Size (Standard Lot)</label>
            <input
              type="number"
              value={bom.batchSize}
              onChange={(e) => setBom({ ...bom, batchSize: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="10"
              min="1"
            />
          </div>

          {/* Lead Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Lead Time (days)</label>
            <input
              type="number"
              value={bom.leadTime}
              onChange={(e) => setBom({ ...bom, leadTime: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="7"
              min="0"
            />
          </div>

          {/* Scrap Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scrap Percentage (Expected Waste)</label>
            <input
              type="number"
              value={bom.scrapPercentage}
              onChange={(e) => setBom({ ...bom, scrapPercentage: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="3.5"
              step="0.1"
              min="0"
              max="100"
            />
          </div>
        </div>

        {/* Product Details (Auto-populated) */}
        {selectedProduct && (
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Product Details (Auto-populated)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="font-medium text-blue-700">Product Code:</span>{' '}
                <span className="text-blue-900 font-semibold">{selectedProduct.code}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Product Name:</span>{' '}
                <span className="text-blue-900 font-semibold">{selectedProduct.name}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Drawing No:</span>{' '}
                <span className="text-blue-900 font-semibold">{selectedProduct.drawingNumber}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Category:</span>{' '}
                <span className="text-blue-900 font-semibold">{selectedProduct.category}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">UOM:</span>{' '}
                <span className="text-blue-900 font-semibold">{selectedProduct.uom}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Description:</span>{' '}
                <span className="text-blue-900">{selectedProduct.description}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Component Entry Methods */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center space-x-2">
          <Settings className="h-5 w-5 text-purple-600" />
          <span>Component Entry Methods</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <button
            onClick={() => {
              setEntryMethod('manual');
              addComponent(0);
            }}
            className={`p-4 border-2 rounded-lg text-left transition-all ${entryMethod === 'manual'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
              }`}
          >
            <Plus className="h-6 w-6 text-blue-600 mb-2" />
            <div className="font-semibold text-gray-900">Manual Entry</div>
            <div className="text-xs text-gray-600 mt-1">Add components one by one</div>
          </button>

          <button
            onClick={() => {
              setEntryMethod('copy');
              setShowCopyModal(true);
            }}
            className={`p-4 border-2 rounded-lg text-left transition-all ${entryMethod === 'copy'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-green-300 hover:bg-gray-50'
              }`}
          >
            <Copy className="h-6 w-6 text-green-600 mb-2" />
            <div className="font-semibold text-gray-900">Copy from Existing</div>
            <div className="text-xs text-gray-600 mt-1">Select product to copy from</div>
          </button>

          <button
            onClick={() => {
              setEntryMethod('import');
              openImportModal();
            }}
            className={`p-4 border-2 rounded-lg text-left transition-all ${entryMethod === 'import'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-purple-300 hover:bg-gray-50'
              }`}
          >
            <Upload className="h-6 w-6 text-purple-600 mb-2" />
            <div className="font-semibold text-gray-900">Import Components (JSON)</div>
            <div className="text-xs text-gray-600 mt-1">Paste parsed component rows</div>
          </button>

          <button
            onClick={() => {
              setEntryMethod('template');
              loadTemplates();
            }}
            disabled={loadingTemplates}
            className={`p-4 border-2 rounded-lg text-left transition-all disabled:opacity-60 ${entryMethod === 'template'
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-300 hover:border-orange-300 hover:bg-gray-50'
              }`}
          >
            <BookTemplate className="h-6 w-6 text-orange-600 mb-2" />
            <div className="font-semibold text-gray-900">Use Template</div>
            <div className="text-xs text-gray-600 mt-1">
              {loadingTemplates ? 'Loading templates…' : 'Common assembly templates'}
            </div>
          </button>
        </div>
      </div>

      {/* Components Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <ListTree className="h-5 w-5 text-green-600" />
            <span>Multi-Level Component Table</span>
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              <span>{showPreview ? 'Hide' : 'Preview'} Tree</span>
            </button>
            <button
              onClick={() => addComponent(0)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add Component</span>
            </button>
          </div>
        </div>

        {components.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-gray-300 rounded-lg">
            <Package className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No components added yet</p>
            <p className="text-sm text-gray-500 mt-1">Click "Add Component" to start building your BOM</p>
            <button
              onClick={() => addComponent(0)}
              className="mt-4 flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Component</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase">Level</th>
                  <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 uppercase">Item Code & Details</th>
                  <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase">Qty/Unit</th>
                  <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase">UOM</th>
                  <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase">Scrap %</th>
                  <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase">Stock</th>
                  <th className="px-3 py-3 text-right text-xs font-bold text-gray-700 uppercase">Cost/Unit</th>
                  <th className="px-3 py-3 text-right text-xs font-bold text-gray-700 uppercase">Extended</th>
                  <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase">Make/Buy</th>
                  <th className="px-3 py-3 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {components.map((component) => renderComponentRow(component))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cost Summary Section */}
      {components.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center space-x-2">
            <IndianRupee className="h-5 w-5 text-green-600" />
            <span>Cost Summary & Pricing</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Cost Breakdown */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
              <h4 className="text-md font-bold text-gray-900 mb-2">Cost Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                  <span className="text-sm font-medium text-gray-700">Material Cost:</span>
                  <div className="flex items-center text-lg font-bold text-gray-900">
                    <IndianRupee className="h-4 w-4" />
                    <span>{materialCost.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                  <span className="text-sm font-medium text-gray-700">Labor Cost (Est.):</span>
                  <div className="flex items-center text-lg font-bold text-gray-900">
                    <IndianRupee className="h-4 w-4" />
                    <span>{laborCost.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                  <span className="text-sm font-medium text-gray-700">Overhead (Est.):</span>
                  <div className="flex items-center text-lg font-bold text-gray-900">
                    <IndianRupee className="h-4 w-4" />
                    <span>{overheadCost.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-blue-200">
                  <span className="text-sm font-medium text-gray-700">Scrap Cost ({bom.scrapPercentage}%):</span>
                  <div className="flex items-center text-lg font-bold text-orange-700">
                    <IndianRupee className="h-4 w-4" />
                    <span>{scrapCost.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-3 rounded-lg border border-green-300">
                  <span className="text-md font-bold text-green-800">Total Product Cost:</span>
                  <div className="flex items-center text-2xl font-bold text-green-800">
                    <IndianRupee className="h-6 w-6" />
                    <span>{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggested Pricing */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
              <h4 className="text-md font-bold text-gray-900 mb-2 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Suggested Selling Price (with margin)</span>
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-green-200">
                  <span className="text-sm font-medium text-gray-700">Total Cost:</span>
                  <div className="flex items-center text-lg font-bold text-gray-900">
                    <IndianRupee className="h-4 w-4" />
                    <span>{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-green-200">
                  <span className="text-sm font-medium text-gray-700">Price with 30% Margin:</span>
                  <div className="flex items-center text-lg font-bold text-blue-700">
                    <IndianRupee className="h-4 w-4" />
                    <span>{suggestedPrice30.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-green-200">
                  <span className="text-sm font-medium text-gray-700">Price with 40% Margin:</span>
                  <div className="flex items-center text-lg font-bold text-green-700">
                    <IndianRupee className="h-4 w-4" />
                    <span>{suggestedPrice40.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-xs text-green-800 bg-green-100 p-3 rounded mt-3 border border-green-300">
                  <CheckCircle className="h-4 w-4 inline mr-1" />
                  Recommended selling price based on standard margin. Adjust based on market conditions.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Copy from Existing Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Copy from Existing BOM</h3>
              <p className="text-sm text-gray-600 mt-1">Select a product to copy BOM structure from</p>
            </div>
            <div className="p-6">
              {existingBOMs.length === 0 ? (
                <EmptyState
                  size="sm"
                  icon={FileText}
                  title="No existing BOMs"
                  description="There are no existing BOMs to copy from yet."
                />
              ) : (
                <div className="space-y-3">
                  {existingBOMs.map((item) => (
                    <label
                      key={item.bomNumber}
                      className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="copyBOM"
                        value={item.bomNumber}
                        checked={selectedCopyBOM === item.bomNumber}
                        onChange={(e) => setSelectedCopyBOM(e.target.value)}
                        className="h-4 w-4"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{item.productName}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {item.productCode} • {item.bomNumber} • {item.version}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => setShowCopyModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCopyFromExisting}
                disabled={!selectedCopyBOM}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Copy BOM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Components (JSON) Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Import Components (JSON)</h3>
              <button onClick={() => setShowImportModal(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm text-gray-600">
                Paste a JSON array of parsed component rows. Recognised fields:
                <code className="mx-1 text-xs bg-gray-100 px-1 rounded">
                  itemCode, itemName, quantity, uom, itemType, unitCost, scrapPercentage, makeOrBuy, level
                </code>
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={10}
                placeholder='[{"itemCode":"RM-001","itemName":"Steel Sheet","quantity":2,"uom":"KG","unitCost":85}]'
                className="w-full border border-gray-300 rounded-lg p-3 font-mono text-xs"
              />
              {importError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {importError}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImportRows}
                disabled={!importText.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import Rows
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assembly Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Use Assembly Template</h3>
              <button onClick={() => setShowTemplateModal(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {templates.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-8">
                  No assembly templates available.
                </div>
              ) : (
                <div className="space-y-2">
                  {templates.map((t: any) => (
                    <label
                      key={t.id}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer ${
                        String(selectedTemplateId) === String(t.id)
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="bom-template"
                        checked={String(selectedTemplateId) === String(t.id)}
                        onChange={() => setSelectedTemplateId(String(t.id))}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{t.name}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {t.code} • {t.componentCount ?? (t.components?.length ?? 0)} components
                          {t.category ? ` • ${t.category}` : ''}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyTemplate}
                disabled={!selectedTemplateId}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save as Assembly Template Modal */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Save as Assembly Template</h3>
              <button onClick={() => setShowSaveTemplateModal(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveAsTemplate();
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  autoFocus
                  required
                  placeholder="e.g. Standard Kitchen Cabinet Assembly"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Saves the current {components.length} component{components.length === 1 ? '' : 's'} as a reusable template.
                </p>
              </div>
            </form>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => setShowSaveTemplateModal(false)}
                disabled={savingTemplate}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsTemplate}
                disabled={savingTemplate || !templateName.trim()}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingTemplate ? 'Saving…' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
