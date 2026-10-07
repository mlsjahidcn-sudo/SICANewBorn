'use client';

import React, { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api-client';
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
  MessageSquare,
  Mail,
  Building2,
  LayoutGrid,
  FileCheck,
  Send,
  Trophy,
  BarChart3,
  Sparkles,
  Key,
  Webhook,
  CalendarClock,
  Megaphone,
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
  // Phase 121: chatbot FAQ knowledge base + automation. The FAQ
  // editor is the landing tab; Automation is a sub-nav inside.
  { href: '/admin/chatbot/faqs', key: 'chatbot', icon: MessageSquare },
  { href: '/admin/emails', key: 'emails', icon: Mail },
  { href: '/admin/leads', key: 'leads', icon: Users },
  // Phase 139: webinar landing-page signups (March/Sept 2027
  // Intake + CSC Scholarship). Read-only list page at
  // /admin/webinar-signups; the form lives at the public
  // /webinar-2027-intake-csc route.
  { href: '/admin/webinar-signups', key: 'webinars', icon: Megaphone },
  // Phase 114: free counselling session bookings from /counselling.
  { href: '/admin/counselling', key: 'counselling', icon: CalendarClock },
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
  // S34: Cohort View — read-only dashboard grouping apps by
  // intake. Sits right below Applications because it's the
  // "where am I in the pipeline" companion view.
  { href: '/admin/cohorts', key: 'cohorts', icon: LayoutGrid },
  // Phase 62: B2B API Keys — admin UI to issue + revoke scoped
  // API keys for external integrators calling /v1/catalog/*.
  // Sits under Cohorts because it's a power-user / config surface
  // rather than a day-to-day ops tab.
  { href: '/admin/api-keys', key: 'apiKeys', icon: Key },
  // Phase 72 (C-5): B2B webhooks — admin view of /v1/webhooks
  // subscriptions + per-subscription delivery log. Sits under
  // API Keys because they share the B2B-integration surface.
  { href: '/admin/webhooks', key: 'webhooks', icon: Webhook },
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
  // roleGate: 'unknown' while loading, 'admin' once /api/admin/me
  // confirms the user is on the admin list, 'non-admin' when the
  // API rejects the session as 401/403. The previous implementation
  // trusted `useAuth().user` (which only proves the JWT is valid
  // — it doesn't say what role the user is) and rendered the
  // admin shell for every logged-in student/partner until the
  // next render. We now hide admin children until the role check
  // resolves, and force a logout when the API explicitly rejects
  // a non-admin caller.
  const [roleGate, setRoleGate] = useState<'unknown' | 'admin' | 'non-admin'>('unknown');

  // While the auth context is resolving or the role check hasn't
  // returned, keep the public auth pages (login + register)
  // rendered so the user can sign in. For every other admin page
  // we render a placeholder rather than the page content until
  // the role check is complete — this prevents a logged-in
  // student/partner from seeing the admin shell + children for a
  // single frame while the redirect effect fires.
  useEffect(() => {
    if (!loading && !user) {
      const isAuthPage = pathname === '/admin/login' || pathname === '/admin/register';
      if (!isAuthPage) {
        router.push('/admin/login');
      }
      setRoleGate('unknown');
      return;
    }
    if (loading || !user) {
      setRoleGate('unknown');
      return;
    }
    // User signed in — confirm they're an admin before rendering
    // the shell. The auth context's `user` only proves a valid
    // JWT; the role lives in admin_profiles. We use apiFetch
    // (NOT bare fetch) so the Supabase session's access_token is
    // attached as `Authorization: Bearer ...` — without it the
    // route 401s on "Not authenticated", which the S144 role gate
    // interprets as "non-admin" and signs the user out, locking
    // every legitimate admin out of the portal. S144 follow-up.
    let cancelled = false;
    setRoleGate('unknown');
    apiFetch('/api/admin/profile', { cache: 'no-store' })
      .then((r) => {
        if (cancelled) return;
        if (r.ok) {
          setRoleGate('admin');
        } else if (r.status === 401 || r.status === 403) {
          // 401 (no auth) shouldn't happen — auth context already
          // resolved with a user. 403 (auth but not admin) is the
          // interesting case: a student/partner that landed here
          // somehow.
          setRoleGate('non-admin');
          // Force sign-out so they don't carry an entry-token session
          // they can't use here. /admin/login is public so they can
          // sign in with an admin account if they have one.
          signOut().finally(() => router.push('/admin/login'));
        } else {
          // 5xx (DB outage, etc.) — keep the loading placeholder up
          // so the user can retry. Don't sign out on a transient
          // server error.
          setRoleGate('unknown');
        }
      })
      .catch(() => {
        if (cancelled) return;
        // Network blip — keep the loading placeholder up. The
        // safety timeout in AuthProvider (5s) will resolve loading
        // so we don't hang forever.
        setRoleGate('unknown');
      });
    return () => {
      cancelled = true;
    };
  }, [user, loading, pathname, router, signOut]);

  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/register';

  if (isAuthPage) {
    return <>{children}</>;
  }

  // Don't render admin children while loading, while the auth
  // context hasn't resolved, or while the role check is still in
  // flight. A logged-in student/partner hitting /admin/dashboard
  // directly used to see the sidebar + their (empty) children for
  // one render before the redirect effect fired; now they see a
  // loading placeholder instead.
  if (loading || !user || roleGate === 'unknown') {
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
            {/* Children are intentionally not rendered here — see
                the comment at the top of the effect. We render
                only a small inline status. */}
            <div className="text-sm text-[#4B5563] flex items-center gap-2">
              <Spinner size="xs" />
              <span>{t('adminNav.loadingSession')}</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (roleGate === 'non-admin') {
    // The role check rejected this user. The effect above is about
    // to sign them out + redirect; render a tiny placeholder in
    // the meantime.
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
