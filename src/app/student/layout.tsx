'use client';

import React, { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { I18nProvider } from '@/lib/i18n';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  FileText,
  FileUp,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  GraduationCap,
  Bell,
} from 'lucide-react';
import Link from 'next/link';
import { SicaLogo } from '@/components/sica-logo';
import { Chatbot } from '@/components/ai/Chatbot';
import { apiFetchJson } from '@/lib/api-client';
import type { StudentApplication } from '@/lib/application-mapper';

// S32: Notifications nav item carries the unread badge. The
// layout polls the unread-count endpoint every 30s + on
// focus + on route change. `withUnreadBadge: true` is the
// marker the nav loop checks to render the red badge.
const navItems = [
  { href: '/student', label: 'Dashboard', labelCn: '仪表盘', icon: LayoutDashboard },
  { href: '/student/notifications', label: 'Notifications', labelCn: '通知', icon: Bell, withUnreadBadge: true },
  { href: '/student/profile', label: 'My Profile', labelCn: '个人资料', icon: User },
  { href: '/student/documents', label: 'Documents', labelCn: '文档', icon: FileUp },
  { href: '/student/applications', label: 'Applications', labelCn: '申请', icon: GraduationCap },
  { href: '/student/settings', label: 'Settings', labelCn: '设置', icon: Settings },
];

/**
 * Phase 2: notification badge on the Applications sidebar item.
 * Counts anything that needs student attention:
 *   - Documents Requested  → red badge (urgent: admin is waiting on you)
 *   - Draft                → gold badge (resumable: you started but didn't submit)
 * The badge color follows the highest-severity bucket present; if
 * no attention items exist, no badge is shown.
 */
function useAttentionCount(): { count: number; severity: 'urgent' | 'resumable' | null } {
  const [apps, setApps] = useState<StudentApplication[]>([]);
  const fetchAttention = React.useCallback(async () => {
    try {
      const data = await apiFetchJson<{ applications: StudentApplication[] }>(
        '/api/student/applications',
      );
      setApps(data.applications || []);
    } catch {
      // Silent — sidebar badge is a nice-to-have, not a blocker.
      // The /applications page itself will surface real errors.
    }
  }, []);
  useEffect(() => {
    fetchAttention();
  }, [fetchAttention]);
  // Re-fetch when the route changes (covers /applications → / → /applications)
  // and when the tab regains focus (covers coming back from the
  // documents page where the student uploaded a file).
  const pathname = usePathname();
  useEffect(() => {
    fetchAttention();
  }, [pathname, fetchAttention]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onFocus = () => fetchAttention();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchAttention]);
  const requested = apps.filter((a) => a.status === 'Documents Requested').length;
  const drafts = apps.filter((a) => a.status === 'Draft').length;
  const count = requested + drafts;
  const severity: 'urgent' | 'resumable' | null =
    requested > 0 ? 'urgent' : drafts > 0 ? 'resumable' : null;
  return { count, severity };
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <StudentLayoutInner>{children}</StudentLayoutInner>
      </AuthProvider>
    </I18nProvider>
  );
}

function StudentLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { count: attentionCount, severity: attentionSeverity } = useAttentionCount();
  // S32: unread student_notifications count for the bell badge.
  // Polled every 30s + on focus + on route change. Same pattern
  // as the partner layout (S30).
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      const isAuthPage = pathname === '/student/login' || pathname === '/student/register';
      if (!isAuthPage) {
        router.push('/student/login');
      }
    }
  }, [user, loading, mounted, pathname, router]);

  // S32: poll unread notifications count for the sidebar bell
  // badge. Mirrors the partner layout (S30). Cheap query
  // (head:true + RLS-scoped), 30s cadence is fine.
  useEffect(() => {
    let cancelled = false;
    const fetchUnread = async () => {
      try {
        const { count } = await apiFetchJson<{ count: number }>(
          '/api/student/notifications/unread-count',
        );
        if (!cancelled) setUnreadNotifCount(count || 0);
      } catch (err) {
        // Non-fatal — the badge just keeps its last value.
        console.warn('[student layout] unread-count fetch failed:', err);
      }
    };
    fetchUnread();
    const onFocus = () => fetchUnread();
    window.addEventListener('focus', onFocus);
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchUnread();
    }, 30_000);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [pathname, user]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1B2A4A]">
        <Spinner size="md" className="text-white" />
      </div>
    );
  }

  const isAuthPage = pathname === '/student/login' || pathname === '/student/register';

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/student/login');
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
            <SicaLogo className="h-8 w-auto" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Student</span>
            <button
              className="ml-auto lg:hidden text-gray-500 hover:text-[#1B2A4A]"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              // Two badge systems run side-by-side here:
              //   - Phase 2: Applications link shows an attention
              //     badge (urgent = docs needed, resumable = drafts).
              //     The existing 'attention' color palette.
              //   - S32: Notifications link shows a red badge with
              //     the unread count. Both can show simultaneously.
              const isAppsAttention =
                item.href === '/student/applications' && attentionCount > 0;
              const isUnreadNotif =
                'withUnreadBadge' in item && item.withUnreadBadge && unreadNotifCount > 0;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#9B1B30]/10 text-[#9B1B30]'
                      : 'text-gray-600 hover:text-[#1B2A4A] hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span className="flex-1">{item.label}</span>
                  {isAppsAttention && (
                    <span
                      title={
                        attentionSeverity === 'urgent'
                          ? `${attentionCount} application(s) need documents from you`
                          : `${attentionCount} draft application(s) ready to submit`
                      }
                      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-full ${
                        attentionSeverity === 'urgent'
                          ? 'bg-[#9B1B30] text-white'
                          : 'bg-[#D4A853] text-[#1B2A4A]'
                      }`}
                    >
                      {attentionCount}
                    </span>
                  )}
                  {isUnreadNotif && (
                    <span
                      title={`${unreadNotifCount} unread notification${unreadNotifCount === 1 ? '' : 's'}`}
                      className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold bg-[#9B1B30] text-white"
                    >
                      {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                    </span>
                  )}
                  {isActive && <ChevronRight size={14} />}
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="px-3 py-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 bg-[#9B1B30] flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user.email?.[0]?.toUpperCase() || 'S'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#1B2A4A] truncate">
                  {user.email}
                </div>
                <div className="text-xs text-gray-500">Student</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar for mobile */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#9B1B30] flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="font-bold text-[#1B2A4A]">SICA</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:text-[#1B2A4A]"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
        
        {/* AI Chatbot */}
        <Chatbot />
      </div>
    </div>
  );
}
