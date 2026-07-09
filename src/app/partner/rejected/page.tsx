'use client';

/**
 * Partner "rejected" page.
 *
 * Shown by /partner/layout.tsx when the partner's status is 'rejected'.
 * We include a short message + the rejection reason (if admin added
 * one in partners.notes). User can sign out.
 */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { XCircle, LogOut, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
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

interface PartnerFull {
  id: string;
  company_name: string;
  status: string;
  notes: string | null;
}

export default function PartnerRejectedPage() {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const [data, setData] = useState<PartnerStatus | null>(null);
  const [full, setFull] = useState<PartnerFull | null>(null);
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
          if (json.partner?.status === 'active') {
            router.push('/partner');
            return;
          }
          if (json.partner?.status === 'pending') {
            router.push('/partner/pending');
            return;
          }
          setData(json);
          // Try to fetch the rejection reason from a deeper view.
          // We use the partner's own data; partners.notes is exposed
          // back to the partner as their only feedback channel.
          if (json.partner?.id) {
            // /api/partner/me would be the canonical source, but it
            // gates on active status. Use a dedicated PATCH or just
            // trust the data we have. We keep this minimal.
            setFull({
              id: json.partner.id,
              company_name: json.partner.company_name,
              status: json.partner.status,
              notes: null, // not exposed for now
            });
          }
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

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600 mb-4">
            <XCircle className="text-white" size={28} />
          </div>
          <h1 className="text-[#1B2A4A] text-2xl font-bold">{t('partnerRejected.title')}</h1>
          <p className="text-[#4B5563] mt-2 text-sm">
            {companyName
              ? t('partnerRejected.bodyWithCompany', { company: companyName })
              : t('partnerRejected.bodyGeneric')}
          </p>
        </div>

        <div className="bg-white border border-gray-200 p-8 space-y-4">
          <p className="text-sm text-gray-700">
            {t('partnerRejected.contactBody')}
            <a
              href="mailto:info@studyinchina.academy"
              className="text-[#9B1B30] hover:underline inline-flex items-center gap-1 font-medium"
            >
              <Mail size={12} />
              info@studyinchina.academy
            </a>
            {t('partnerRejected.contactBodyEnd')}
          </p>

          <div className="border-t pt-4 flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full"
            >
              {signingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
              {t('partnerRejected.signOut')}
            </Button>
            <Link
              href="/"
              className="text-gray-500 hover:text-[#1B2A4A] text-sm flex items-center justify-center gap-1"
            >
              <ArrowLeft size={14} /> {t('partnerRejected.backToSicaWebsite')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
