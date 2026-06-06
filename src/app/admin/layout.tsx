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
} from 'lucide-react';
import Link from 'next/link';
import { SicaLogo } from '@/components/sica-logo';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', labelCn: '仪表盘', icon: LayoutDashboard },
  { href: '/admin/universities', label: 'Universities', labelCn: '大学', icon: GraduationCap },
  { href: '/admin/programs', label: 'Programs', labelCn: '项目', icon: BookOpen },
  { href: '/admin/scholarships', label: 'Scholarships', labelCn: '奖学金', icon: Award },
  { href: '/admin/news', label: 'News', labelCn: '新闻', icon: Newspaper },
  { href: '/admin/emails', label: 'Emails', labelCn: '邮件', icon: Mail },
  { href: '/admin/leads', label: 'Leads', labelCn: '线索', icon: Users },
  { href: '/admin/students', label: 'Students', labelCn: '学生', icon: UserCheck },
  { href: '/admin/partners', label: 'Partners', labelCn: '合作方', icon: Building2 },
  // S27: Partner Pipeline — the only place in the system where the
  // admin can change a partner application's status / decision.
  // Distinct from /admin/applications (student applications) because
  // they live in separate tables.
  { href: '/admin/partner-applications', label: 'Partner Pipeline', labelCn: '合作方申请', icon: Building2 },
  { href: '/admin/fees', label: 'Fees', labelCn: '费用', icon: DollarSign },
  { href: '/admin/assessments', label: 'Assessments', labelCn: '评估', icon: ClipboardList },
  { href: '/admin/applications', label: 'Applications', labelCn: '申请', icon: FileText },
  // S34: Cohort View — read-only dashboard grouping apps by
  // intake. Sits right below Applications because it's the
  // "where am I in the pipeline" companion view.
  { href: '/admin/cohorts', label: 'Cohort View', labelCn: '入学批次', icon: LayoutGrid },
  { href: '/admin/settings', label: 'Settings', labelCn: '设置', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AuthProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
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
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Admin</span>
          </div>
          <div className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-400"
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
            <div className="flex-1" />
            <div className="text-sm text-[#4B5563] flex items-center gap-2">
              <Spinner size="xs" />
              <span>Loading session…</span>
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
        <p className="text-sm text-[#4B5563]">Redirecting to sign in…</p>
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
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Admin</span>
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
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#9B1B30]/10 text-[#9B1B30]'
                      : 'text-gray-600 hover:text-[#1B2A4A] hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
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
                <div className="text-gray-500 text-xs">Administrator</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-gray-600 hover:text-[#1B2A4A] hover:bg-gray-100 transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
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
