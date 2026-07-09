// Recently Viewed
export { RecentlyViewed, RecentlyViewedProvider, useRecentlyViewed, useTrackPageVisit } from './RecentlyViewed';
export type { RecentPage, RecentlyViewedProps } from './RecentlyViewed';

// Favorites Manager
export { FavoritesManager, FavoritesProvider, useFavorites, FavoriteButton } from './FavoritesManager';
export type { FavoritePage, FavoriteFolder, FavoritesManagerProps } from './FavoritesManager';

// Breadcrumb Navigation
export { BreadcrumbNav, CompactBreadcrumb } from './BreadcrumbNav';
export type { BreadcrumbItem, BreadcrumbNavProps } from './BreadcrumbNav';

// Sidebar Context & State Management
export { SidebarProvider, useSidebar, useSidebarCollapse, useMobileSidebar } from './SidebarContext';
export type { SidebarState, SidebarContextValue } from './SidebarContext';

// Sidebar Search
export { SidebarSearch, useFlattenedMenuItems } from './SidebarSearch';
export type { SearchableMenuItem, SidebarSearchProps } from './SidebarSearch';

// Mobile Navigation
export { MobileNavigation, HamburgerButton } from './MobileNavigation';
export type { MobileMenuItem, MobileNavigationProps } from './MobileNavigation';
