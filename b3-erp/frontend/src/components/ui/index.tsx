// Shared UI Primitives
// Central export file for all reusable UI components

// ============================================================================
// Phase 1 Components - Core UI Primitives
// ============================================================================

export { KPICard } from './KPICard';
export type { KPICardProps } from './KPICard';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

export {
  LoadingState,
  TableSkeleton,
  CardSkeleton,
  ChartSkeleton
} from './LoadingState';
export type { LoadingStateProps } from './LoadingState';

export { FilterPanel } from './FilterPanel';
export type { FilterPanelProps, FilterGroup, FilterOption } from './FilterPanel';

export { DataTable } from './DataTable';
export type { DataTableProps, Column } from './DataTable';

export { ChartWrapper } from './ChartWrapper';
export type { ChartWrapperProps } from './ChartWrapper';

export { PageToolbar } from './PageToolbar';
export type { PageToolbarProps, ToolbarAction } from './PageToolbar';

export { StatusBadge, NavItemWithStatus, isPlaceholderLink } from './StatusBadge';
export type { StatusBadgeProps, BadgeStatus, NavItemWithStatusProps } from './StatusBadge';

// ============================================================================
// Phase 2 Components - Form Components
// ============================================================================

export { FormWrapper } from './FormWrapper';
export type { FormWrapperProps, FormField } from './FormWrapper';

export { Input } from './input';
export type { InputProps } from './input';

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator } from './select';

export { Textarea } from './textarea';
export type { TextareaProps } from './textarea';

export { Checkbox } from './checkbox';
export type { CheckboxProps } from './checkbox';

export { Radio, RadioGroup } from './radio';
export type { RadioProps, RadioGroupProps, RadioOption } from './radio';

// ============================================================================
// Phase 2 Components - Modal & Dialog Components
// ============================================================================

export { ModalWrapper } from './ModalWrapper';
export type { ModalWrapperProps } from './ModalWrapper';

export { ConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps } from './ConfirmDialog';

export { DrawerPanel } from './DrawerPanel';
export type { DrawerPanelProps } from './DrawerPanel';

export { ToastProvider, useToast } from './toast';
export type { Toast } from './toast';

// ============================================================================
// Phase 2 Components - Navigation Components
// ============================================================================

export { TabPanel, TabContent } from './TabPanel';
export type { TabPanelProps, Tab, TabContentProps } from './TabPanel';

export { StepIndicator } from './StepIndicator';
export type { StepIndicatorProps, Step } from './StepIndicator';

export { BreadcrumbTrail } from './BreadcrumbTrail';
export type { BreadcrumbTrailProps, BreadcrumbItem } from './BreadcrumbTrail';

// ============================================================================
// Phase 2 Components - Omnichannel Components
// ============================================================================

export { ChannelSelector } from './ChannelSelector';
export type { ChannelSelectorProps, Channel, ChannelConfig } from './ChannelSelector';

export { QueueManager } from './QueueManager';
export type { QueueManagerProps, QueueItem, QueueStats } from './QueueManager';

export { UnifiedInbox } from './UnifiedInbox';
export type { UnifiedInboxProps, ConversationMessage } from './UnifiedInbox';

// ============================================================================
// Phase 2 Components - Data Visualization Components
// ============================================================================

export { ProgressBar, MultiProgressBar } from './ProgressBar';
export type { ProgressBarProps, MultiProgressBarProps } from './ProgressBar';

export { GaugeChart } from './GaugeChart';
export type { GaugeChartProps } from './GaugeChart';

export { SparklineChart } from './SparklineChart';
export type { SparklineChartProps } from './SparklineChart';

export { TimelineView } from './TimelineView';
export type { TimelineViewProps, TimelineEvent } from './TimelineView';

// ============================================================================
// Phase 3 Components - Mobile & Touch Optimization
// ============================================================================

export { ResponsiveDataTable } from './ResponsiveDataTable';
export type { ResponsiveDataTableProps, Column as ResponsiveColumn } from './ResponsiveDataTable';

export { TouchButton, IconButton, FloatingActionButton } from './TouchButton';
export type { TouchButtonProps, IconButtonProps, FABProps } from './TouchButton';

export { MobileBottomNav } from './MobileBottomNav';
export type { MobileBottomNavProps, NavItem } from './MobileBottomNav';

// ============================================================================
// Phase 4 Components - Form UX Enhancements
// ============================================================================

export {
  MultiStepForm,
  useMultiStepForm,
  FormProgressIndicator,
  useAutoSaveDraft,
  AutoSaveIndicator,
  DraftRecoveryBanner,
  useUnsavedChangesWarning,
  UnsavedChangesModal,
  FieldHelp,
  HelpIcon,
  useSmartDefaults,
  SmartDefaultField,
} from './FormUX';
export type {
  WizardStep,
  MultiStepFormProps,
  FormProgressIndicatorProps,
  FormFieldConfig,
  FieldHelpProps,
  SmartDefaultConfig,
} from './FormUX';
