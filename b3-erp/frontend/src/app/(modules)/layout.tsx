'use client';

import { usePathname } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { ToastProvider } from '@/components/ui/Toast';
import { NotificationProvider } from '@/context/NotificationContext';
import { EnhancedToastProvider } from '@/components/ui/EnhancedToast';
import { ProjectProvider } from '@/context/ProjectContext';

export default function ModulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return undefined;
    const lastSegment = segments[segments.length - 1];
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <ProjectProvider>
      <NotificationProvider>
        <EnhancedToastProvider>
          <ToastProvider>
            <DashboardLayout pageTitle={getPageTitle()}>{children}</DashboardLayout>
          </ToastProvider>
        </EnhancedToastProvider>
      </NotificationProvider>
    </ProjectProvider>
  );
}
