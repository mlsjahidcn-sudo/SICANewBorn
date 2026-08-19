'use client';

import React, { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Award,
  Users,
  UserCheck,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ClipboardList,
  DollarSign,
  Newspaper,
  Mail,
  Building2,
  LayoutGrid,
  FileCheck,
  Send,
  Trophy,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { SicaLogo } from '@/components/sica-logo';
import { I18nProvider, useI18n } from '@/lib/i18n';

// Phase 37: nav items now reference i18n keys instead of inline
// `label` + `labelCn` pairs. The label value is the key suffix
// under `adminNav.*` so adding a new sidebar item means one key
// in each locale + one entry here.
const navItems = [
  { href: '/admin/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { href: '/admin/reports', key: 'reports', icon: BarChart3 },
  { href: '/admin/universities', key: 'universities', icon: GraduationCap },
  { href: '/admin/programs', key: 'programs', icon: BookOpen },
  { href: '/admin/scholarships', key: 'scholarships', icon: Award },
  { href: '/admin/news', key: 'news', icon: Newspaper },
  { href: '/admin/emails', key: 'emails', icon: Mail },
  { href: '/admin/leads', key: 'leads', icon: Users },
  { href: '/admin/students', key: 'students', icon: UserCheck },
  { href: '/admin/partner-students', key: 'partnerStudents', icon: Users },
  { href: '/admin/documents', key: 'documents', icon: FileCheck },
  { href: '/admin/partners', key: 'partners', icon: Building2 },
  // Phase 33: the standalone Partner Pipeline list page is
  // gone — folded into /admin/applications as a `?surface=partner`
  // deep-link. The admin still lands on the partner view via
  // the dashboard's "Pipeline by partner" stat card or the
  // Applications sidebar item with the "Partner" tab. The
  // partner detail page at /admin/partner-applications/[id]
  // is unchanged (admin is still the only role that can flip
  // status / decision for partner rows).
  { href: '/admin/fees', key: 'fees', icon: DollarSign },
  { href: '/admin/partner-fees', key: 'partnerFees', icon: DollarSign },
  { href: '/admin/promotions', key: 'promotions', icon: Sparkles },
  { href: '/admin/assessments', key: 'assessments', icon: ClipboardList },
  { href: '/admin/applications', key: 'applications', icon: FileText },
  // Phase 51: Success Stories — public showcase of admission notices.
  // Sits next to Applications because both surface student outcomes.
  { href: '/admin/admission-notices', key: 'admissionNotices', icon: Trophy },
  // Phase 46: Bulk WhatsApp send — admin tool for promotional blasts
  { href: '/admin/leads/bulk-send', key: 'bulkSend', icon: Send },
  // S34: Cohort View — read-only dashboard grouping apps by
  // intake. Sits right below Applications because it's the
  // "where am I in the pipeline" companion view.
  { href: '/admin/cohorts', key: 'cohorts', icon: LayoutGrid },
  { href: '/admin/settings', key: 'settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </AuthProvider>
    </I18nProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to login if auth check completed and there's no user.
  // We intentionally do NOT block render on `loading` — the sidebar and
  // header render immediately, only the user-specific bits (avatar, sign-out)
  // gate on `user`. The old behavior (full-screen spinner) made the page
  // appear "not accessible" if the auth context was slow or the tab was
  // backgrounded.
  useEffect(() => {
    if (!loading && !user) {
      const isAuthPage = pathname === '/admin/login' || pathname === '/admin/register';
      if (!isAuthPage) {
        router.push('/admin/login');
      }
    }
  }, [user, loading, pathname, router]);

  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/register';

  if (isAuthPage) {
    return <>{children}</>;
  }

  // If still resolving auth, render the shell with a small inline
  // indicator. User bits (avatar, sign-out) render as skeletons.
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex">
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
            <SicaLogo className="h-8 w-auto" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold whitespace-nowrap shrink-0">{t('adminNav.brand')}</span>
          </div>
          <div className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-400"
                >
                  <Icon size={18} />
                  <span>{t(`adminNav.${item.key}`)}</span>
                </div>
              );
            })}
          </div>
        </aside>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
            <div className="flex-1" />
            <div className="text-sm text-[#4B5563] flex items-center gap-2">
              <Spinner size="xs" />
              <span>{t('adminNav.loadingSession')}</span>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
    // Auth resolved with no user — the redirect effect above is about to
    // push us to /admin/login. Render a minimal placeholder to avoid a
    // flash of empty content during the navigation.
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
        <p className="text-sm text-[#4B5563]">{t('adminNav.redirectingToSignIn')}</p>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
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
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold whitespace-nowrap shrink-0">{t('adminNav.brand')}</span>
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
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#9B1B30]/10 text-[#9B1B30]'
                        : 'text-gray-600 hover:text-[#1B2A4A] hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{t(`adminNav.${item.key}`)}</span>
                    {isActive && <ChevronRight size={14} className="ml-auto" />}
                  </Link>
                );
              })}
            </nav>

            {/* User & Logout */}
            <div className="px-3 py-4 border-t border-gray-200">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-8 h-8 bg-[#9B1B30] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {user.email?.[0]?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#1B2A4A] text-sm truncate">{user.email}</div>
                  <div className="text-gray-500 text-xs">{t('adminNav.administrator')}</div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-gray-600 hover:text-[#1B2A4A] hover:bg-gray-100 transition-colors"
              >
                <LogOut size={18} />
                <span>{t('adminNav.signOut')}</span>
              </button>
            </div>
          </div>
      </aside>

      {/* Main content — min-w-0 is load-bearing: without it this flex
          child refuses to shrink below the content's intrinsic width,
          so wide tables (students list) blow out the whole page instead
          of scrolling inside their own overflow-x-auto container. */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
          <button
            className="lg:hidden text-[#1B2A4A]"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <div className="text-sm text-[#4B5563]">
            {user.email}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
