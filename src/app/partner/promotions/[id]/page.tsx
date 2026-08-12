'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  Building2,
  Clock,
  Globe,
  GraduationCap,
  Languages,
  Loader2,
  MapPin,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import type { PartnerPromotionWithDetails } from '@/lib/partner-promotion-mapper';

interface PromotionDetail extends PartnerPromotionWithDetails {
  isCountryEligible: boolean;
}

export default function PartnerPromotionDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const router = useRouter();
  const [promotion, setPromotion] = useState<PromotionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = typeof params?.id === 'string' ? params.id : '';
    if (!id) return;
    let cancelled = false;
    apiFetchJson<{ promotion: PromotionDetail }>(`/api/partner/promotions/${id}`)
      .then((res) => {
        if (!cancelled) setPromotion(res.promotion);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load promotion');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#9B1B30]" />
      </div>
    );
  }

  if (error || !promotion) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.push('/partner/promotions')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1B2A4A]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to promotions
        </button>
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error || 'Promotion not found'}
        </div>
      </div>
    );
  }

  const p = promotion;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push('/partner/promotions')}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1B2A4A]"
      >
        <ArrowLeft className="h-4 w-4" /> {t('partnerPromotions.back')}
      </button>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">{p.program?.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-gray-600 mt-1">
            <Building2 className="h-4 w-4" />
            {p.university?.name}
            {p.university?.city && (
              <>
                <span className="text-gray-300">|</span>
                <MapPin className="h-4 w-4" />
                {p.university.city}
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {p.visibility === 'public_and_partner' ? (
            <Badge variant="outline" className="gap-1">
              <Globe className="h-3 w-3" /> {t('partnerPromotions.publicBadge')}
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <EyeOff className="h-3 w-3" /> {t('partnerPromotions.partnerOnlyBadge')}
            </Badge>
          )}
          {!p.isCountryEligible && (
            <Badge variant="secondary" className="gap-1 text-amber-700 bg-amber-50">
              <Ban className="h-3 w-3" /> {t('partnerPromotions.notForRegion')}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('partnerPromotions.programOverview')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50">
                  <GraduationCap className="h-5 w-5 text-[#9B1B30]" />
                  <div>
                    <div className="text-xs text-gray-500">{t('partnerPromotions.degree')}</div>
                    <div className="font-medium">{p.program?.degree || '—'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50">
                  <Languages className="h-5 w-5 text-[#9B1B30]" />
                  <div>
                    <div className="text-xs text-gray-500">{t('partnerPromotions.language')}</div>
                    <div className="font-medium">{p.program?.language || '—'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50">
                  <Clock className="h-5 w-5 text-[#9B1B30]" />
                  <div>
                    <div className="text-xs text-gray-500">{t('partnerPromotions.discipline')}</div>
                    <div className="font-medium">{p.program?.discipline || '—'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {p.partnerNotes && (
            <Card>
              <CardHeader>
                <CardTitle>{t('partnerPromotions.notesTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{p.partnerNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('partnerPromotions.feeTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-[#1B2A4A]">
                {p.serviceFeeCurrency === 'CNY' ? '¥' : p.serviceFeeCurrency === 'USD' ? '$' : '€'}
                {p.serviceFeeAmount.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">{t('partnerPromotions.feeDescription')}</p>
              {p.isCountryEligible && p.program?.slug && (
                <Link
                  href={`/partner/applications/new?programSlug=${encodeURIComponent(p.program.slug)}`}
                >
                  <Button className="w-full bg-[#9B1B30] hover:bg-[#7A1625] text-white">
                    {t('partnerPromotions.startApplication')} <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
              {!p.isCountryEligible && (
                <div className="text-sm text-amber-700 bg-amber-50 p-3">
                  {t('partnerPromotions.notAvailableRegion')}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('partnerPromotions.eligibilityTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {p.targetCountries.length > 0 ? (
                <div>
                  <span className="text-gray-500">{t('partnerPromotions.targetCountries')}:</span>{' '}
                  {p.targetCountries.join(', ')}
                </div>
              ) : (
                <div>
                  <span className="text-gray-500">{t('partnerPromotions.targetCountries')}:</span>{' '}
                  {t('partnerPromotions.targetAll')}
                </div>
              )}
              {p.restrictedCountries.length > 0 && (
                <div className="text-red-600">
                  <span className="text-gray-500">{t('partnerPromotions.restrictedCountries')}:</span>{' '}
                  {p.restrictedCountries.join(', ')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
