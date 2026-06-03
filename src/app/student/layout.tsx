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
} from 'lucide-react';
import Link from 'next/link';
import { Chatbot } from '@/components/ai/Chatbot';

const navItems = [
  { href: '/student', label: 'Dashboard', labelCn: '仪表盘', icon: LayoutDashboard },
  { href: '/student/profile', label: 'My Profile', labelCn: '个人资料', icon: User },
  { href: '/student/documents', label: 'Documents', labelCn: '文档', icon: FileUp },
  { href: '/student/applications', label: 'Applications', labelCn: '申请', icon: GraduationCap },
  { href: '/student/settings', label: 'Settings', labelCn: '设置', icon: Settings },
];

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
            <div className="w-9 h-9 bg-[#9B1B30] flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <div className="text-[#1B2A4A] font-bold text-sm tracking-wide">SICA</div>
              <div className="text-gray-500 text-xs">Student Portal</div>
            </div>
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
