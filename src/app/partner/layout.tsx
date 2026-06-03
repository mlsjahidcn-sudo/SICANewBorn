'use client';

import React, { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  Share2,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/lib/auth-context';

const navItems = [
  { name: 'Dashboard', href: '/partner', icon: LayoutDashboard },
  { name: 'Students', href: '/partner/students', icon: Users },
  { name: 'Applications', href: '/partner/applications', icon: FileText },
  { name: 'Fees', href: '/partner/fees', icon: DollarSign },
  { name: 'Lead Sharing', href: '/partner/lead-sharing', icon: Share2 },
  { name: 'Settings', href: '/partner/settings', icon: Settings },
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
    <AuthProvider>
      <PartnerLayoutInner>{children}</PartnerLayoutInner>
    </AuthProvider>
  );
}

function PartnerLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading, signOut } = useAuth();
  const [partner, setPartner] = useState<PartnerMe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || authLoading) return;

    const isAuthPage = pathname === '/partner/login' || pathname === '/partner/register';

    if (!user && !isAuthPage) {
      router.push('/partner/login');
      return;
    }
    if (isAuthPage) {
      setIsLoading(false);
      return;
    }

    // Verify the user has a partner record before showing the portal.
    let cancelled = false;
    (async () => {
      const { supabase } = await import('@/lib/supabase-browser');
      if (!supabase) {
        if (!cancelled) setAuthError('Supabase is not configured');
        if (!cancelled) setIsLoading(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        if (!cancelled) router.push('/partner/login');
        return;
      }
      const res = await fetch('/api/partner/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (cancelled) return;
      if (res.ok) {
        const body = await res.json();
        setPartner(body.partner);
        setIsLoading(false);
      } else {
        setAuthError('Your account is not linked to a partner profile.');
        setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mounted, authLoading, user, pathname, router]);

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
          <h1 className="text-xl font-bold text-[#1B2A4A] mb-3">Access Denied</h1>
          <p className="text-gray-600 text-sm mb-6">{authError}</p>
          <button
            onClick={handleLogout}
            className="bg-[#9B1B30] text-white px-6 py-2 font-medium hover:bg-[#7A1526]"
          >
            Sign Out
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
            <div className="w-9 h-9 bg-[#9B1B30] flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <div className="text-[#1B2A4A] font-bold text-sm tracking-wide">SICA</div>
              <div className="text-gray-500 text-xs">Partner Portal</div>
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
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#9B1B30]/10 text-[#9B1B30]'
                      : 'text-gray-600 hover:text-[#1B2A4A] hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto" />}
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
                <div className="text-gray-500 text-xs">Partner</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
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
          <div className="text-sm text-[#4B5563]">{partner.email}</div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
