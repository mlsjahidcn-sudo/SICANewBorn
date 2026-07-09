'use client';

/**
 * Partner "pending approval" page.
 *
 * Shown by /partner/layout.tsx when the partner's status is 'pending'.
 * The user is signed in but can't use the portal until an admin
 * approves them. Sign-out is the only action available.
 */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, LogOut, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';

interface PartnerStatus {
  partner: {
    id: string;
    company_name: string;
    contact_person: string;
    email: string;
    status: string;
    created_at: string;
  };
  teamMember: { id: string; role: string; status: string; joined_at: string | null } | null;
}

export default function PartnerPendingPage() {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const [data, setData] = useState<PartnerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/partner/login');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/partner/login-status');
        const json = await res.json();
        if (cancelled) return;
        if (res.ok) {
          // If the status has changed to 'active' (admin approved while
          // we were on this page), bounce to the portal.
          if (json.partner?.status === 'active') {
            router.push('/partner');
            return;
          }
          if (json.partner?.status === 'rejected') {
            router.push('/partner/rejected');
            return;
          }
          setData(json);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.push('/partner/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <Spinner size="md" className="text-[#1B2A4A]" />
      </div>
    );
  }

  const companyName = data?.partner?.company_name;
  const email = data?.partner?.email || user?.email;

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#D4A853] mb-4">
            <Clock className="text-white" size={28} />
          </div>
          <h1 className="text-[#1B2A4A] text-2xl font-bold">{t('partnerPending.title')}</h1>
          <p className="text-[#4B5563] mt-2 text-sm">
            {companyName
              ? t('partnerPending.bodyWithCompany', { company: companyName, email: email || '' })
              : t('partnerPending.bodyGeneric')}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-8 space-y-4">
          <div className="space-y-2 text-sm">
            <p className="text-gray-700">
              <span className="font-medium">{t('partnerPending.whatNextTitle')}</span>
            </p>
            <ol className="list-decimal pl-6 text-gray-600 space-y-1">
              <li>{t('partnerPending.whatNext1')}</li>
              <li>{t('partnerPending.whatNext2')}</li>
              <li>{t('partnerPending.whatNext3')}</li>
            </ol>
          </div>

          <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-medium">{t('partnerPending.questionsTitle')}</span>{' '}
              {t('partnerPending.reachUs')}{' '}
              <a
                href="mailto:info@studyinchina.academy"
                className="text-[#9B1B30] hover:underline inline-flex items-center gap-1"
              >
                <Mail size={12} />
                {t('partnerPending.contactEmail')}
              </a>
            </p>
          </div>

          <div className="border-t pt-4 flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full"
            >
              {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
              {t('partnerPending.signOut')}
            </Button>
            <Link
              href="/"
              className="text-gray-500 hover:text-[#1B2A4A] text-sm flex items-center justify-center gap-1"
            >
              <ArrowLeft size={14} /> {t('partnerPending.backToSicaWebsite')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Button } from '@/components/ui/button';
