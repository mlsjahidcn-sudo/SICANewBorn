'use client';

import React, { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Share2,
  Settings,
  UserCog,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
} from 'lucide-react';
import Link from 'next/link';
import { SicaLogo } from '@/components/sica-logo';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { I18nProvider, useI18n } from '@/lib/i18n';
import { apiFetchJson } from '@/lib/api-client';

// Fees nav item REMOVED (Phase 3): partner orgs never see fees /
// service charge. Admin manages those in /admin/fees. Labels are
// translation keys — resolved via t() at render time so the
// sidebar flips with the locale.
const navItems = [
  { labelKey: 'partnerNav.dashboard', href: '/partner', icon: LayoutDashboard },
  // S30: Notifications nav item surfaces the partner's unread count
  // (badge). The badge is polled every 30s by the layout.
  { labelKey: 'partnerNav.notifications', href: '/partner/notifications', icon: Bell, withUnreadBadge: true },
  { labelKey: 'partnerNav.students', href: '/partner/students', icon: Users },
  { labelKey: 'partnerNav.applications', href: '/partner/applications', icon: FileText },
  { labelKey: 'partnerNav.leadSharing', href: '/partner/lead-sharing', icon: Share2 },
  { labelKey: 'partnerNav.team', href: '/partner/team', icon: UserCog, ownerOnly: true },
  { labelKey: 'partnerNav.settings', href: '/partner/settings', icon: Settings },
];

interface PartnerMe {
  id: string;
  email: string;
  company_name: string;
  contact_person: string;
  status: string;
  commission_rate: number | null;
}

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <PartnerLayoutInner>{children}</PartnerLayoutInner>
      </AuthProvider>
    </I18nProvider>
  );
}

function PartnerLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading, signOut } = useAuth();
  const { t } = useI18n();
  const [partner, setPartner] = useState<PartnerMe | null>(null);
  const [role, setRole] = useState<'owner' | 'member' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // S30: unread partner-notifications count for the sidebar bell
  // badge. Polled every 30s + on focus + after route change. Cheap
  // query (head: true + RLS-scoped), so the cadence is fine.
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || authLoading) return;

    const isAuthPage =
      pathname === '/partner/login' ||
      pathname === '/partner/register' ||
      pathname === '/partner/pending' ||
      pathname === '/partner/rejected' ||
      pathname === '/partner/accept-invite';

    if (!user && !isAuthPage) {
      router.push('/partner/login');
      return;
    }
    if (isAuthPage) {
      setIsLoading(false);
      return;
    }

    // Phase 3: status gate. If the partner isn't 'active' yet, route
    // them to the right waiting page.
    let cancelled = false;
    (async () => {
      const { supabase } = await import('@/lib/supabase-browser');
      if (!supabase) {
        if (!cancelled) setAuthError(t('partnerLayout.configMissing'));
        if (!cancelled) setIsLoading(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        if (!cancelled) router.push('/partner/login');
        return;
      }
      const res = await fetch('/api/partner/login-status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (cancelled) return;
      if (res.ok) {
        const body = await res.json();
        const status = body.partner?.status as string | undefined;
        if (status === 'pending') {
          router.push('/partner/pending');
          return;
        }
        if (status === 'rejected') {
          router.push('/partner/rejected');
          return;
        }
        if (status === 'suspended') {
          setAuthError(t('partnerLayout.suspendedMessage'));
          setIsLoading(false);
          return;
        }
        // active
        setPartner({
          id: body.partner.id,
          email: body.partner.email,
          company_name: body.partner.company_name,
          contact_person: body.partner.contact_person,
          status: body.partner.status,
          commission_rate: null,
        });
        setRole(body.teamMember?.role ?? null);
        setIsLoading(false);
      } else {
        setAuthError(t('partnerLayout.notLinkedToPartner'));
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mounted, authLoading, user, pathname, router, t]);

  // S30: poll unread notifications count for the sidebar bell
  // badge. Mirrors the S17 student-portal pattern. The fetch
  // goes through apiFetchJson so it gets the Bearer token from
  // localStorage and any auth errors are surfaced.
  useEffect(() => {
    let cancelled = false;
    const fetchUnread = async () => {
      try {
        const { count } = await apiFetchJson<{ count: number }>(
          '/api/partner/notifications/unread-count',
        );
        if (!cancelled) setUnreadNotifCount(count || 0);
      } catch (err) {
        // Non-fatal — the badge just keeps its last value. We
        // don't want a transient 401 to spam the partner with
        // a toast.
        console.warn('[partner layout] unread-count fetch failed:', err);
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

  const handleLogout = async () => {
    await signOut();
    setPartner(null);
    router.push('/partner/login');
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1B2A4A]">
        <Spinner size="md" className="text-white" />
      </div>
    );
  }

  const isAuthPage = pathname === '/partner/login' || pathname === '/partner/register';

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6] p-6">
        <div className="max-w-md w-full bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-[#1B2A4A] mb-3">{t('partnerLayout.accessDeniedTitle')}</h1>
          <p className="text-gray-600 text-sm mb-6">{authError}</p>
          <button
            onClick={handleLogout}
            className="bg-[#9B1B30] text-white px-6 py-2 font-medium hover:bg-[#7A1526]"
          >
            {t('partnerLayout.signOut')}
          </button>
        </div>
      </div>
    );
  }

  if (!partner) {
    return null;
  }

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
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{t('partnerNav.partnerBadge')}</span>
            <button
              className="ml-auto lg:hidden text-gray-500 hover:text-[#1B2A4A]"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems
              .filter((item) => !('ownerOnly' in item && item.ownerOnly) || role === 'owner')
              .map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                // S30: notifications nav item shows a red badge
                // with the unread count. Hidden when count is 0.
                const showBadge =
                  'withUnreadBadge' in item && item.withUnreadBadge && unreadNotifCount > 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#9B1B30]/10 text-[#9B1B30]'
                        : 'text-gray-600 hover:text-[#1B2A4A] hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="flex-1">{t(item.labelKey)}</span>
                    {showBadge && (
                      <span
                        className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-semibold bg-[#9B1B30] text-white"
                        title={t(
                          unreadNotifCount === 1
                            ? 'partnerNav.unreadNotifTitle'
                            : 'partnerNav.unreadNotifTitlePlural',
                          { count: unreadNotifCount },
                        )}
                      >
                        {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                      </span>
                    )}
                    {isActive && <ChevronRight size={14} />}
                  </Link>
                );
              })}
          </nav>

          {/* Partner & Logout */}
          <div className="px-3 py-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 bg-[#9B1B30] flex items-center justify-center">
                <div className="text-white text-xs font-bold">
                  {partner.email[0]?.toUpperCase() || 'P'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[#1B2A4A] text-sm truncate">
                  {partner.contact_person || partner.email}
                </div>
                <div className="text-gray-500 text-xs">{t('partnerNav.partnerRole')}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-gray-600 hover:text-[#1B2A4A] hover:bg-gray-100 transition-colors"
            >
              <LogOut size={18} />
              <span>{t('partnerNav.signOut')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
          <button
            className="lg:hidden text-[#1B2A4A]"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <div className="text-sm text-[#4B5563]">{partner.email}</div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
