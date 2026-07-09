// Mobile Optimization Components
// Feature 23: Mobile-first responsive components

// Responsive Table - Card view on mobile, table on desktop
export {
  ResponsiveTable,
  useIsMobile,
} from './ResponsiveTable';
export type {
  ResponsiveColumn,
  ResponsiveTableProps,
} from './ResponsiveTable';

// Touch-Friendly Buttons - 44x44px minimum touch targets
export {
  TouchButton,
  TouchIconButton,
  FAB,
  TouchLink,
  TouchListItem,
} from './TouchButton';
export type {
  TouchButtonVariant,
  TouchButtonSize,
  TouchButtonProps,
  TouchIconButtonProps,
  FABProps,
  TouchLinkProps,
  TouchListItemProps,
} from './TouchButton';

// PWA Support - Install as app on mobile
export {
  PWAInstallPrompt,
  PWAUpdatePrompt,
  usePWA,
  isStandalone,
  isIOS,
  canInstall,
} from './PWAInstall';
export type {
  PWAInstallProps,
  PWAUpdatePromptProps,
} from './PWAInstall';

// Offline Mode - View cached data when offline
export {
  OfflineProvider,
  useOffline,
  OfflineIndicator,
  SyncStatusPanel,
  OfflineDataWrapper,
  OfflineActionButton,
  CacheManager,
} from './OfflineMode';
export type {
  CachedItem,
  PendingAction,
  SyncStatus,
  OfflineContextValue,
  OfflineProviderProps,
  OfflineIndicatorProps,
  SyncStatusPanelProps,
  OfflineDataWrapperProps,
  OfflineActionButtonProps,
  CacheManagerProps,
} from './OfflineMode';
