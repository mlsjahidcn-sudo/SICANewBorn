'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Ban, Globe, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import type { PartnerPromotionWithDetails } from '@/lib/partner-promotion-mapper';

interface PartnerPromotionListItem extends PartnerPromotionWithDetails {
  isCountryEligible: boolean;
}

export default function PartnerPromotionsPage() {
  const { t } = useI18n();
  const [promotions, setPromotions] = useState<PartnerPromotionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetchJson<{ promotions: PartnerPromotionListItem[] }>('/api/partner/promotions')
      .then((res) => {
        if (!cancelled) setPromotions(res.promotions || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load promotions');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#9B1B30]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
        {error}
        <button className="ml-2 underline" onClick={() => window.location.reload()}>
          {t('partnerPromotions.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('partnerPromotions.title')}</h1>
        <p className="text-gray-600">{t('partnerPromotions.subtitle')}</p>
      </div>

      {promotions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-gray-500">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">{t('partnerPromotions.emptyTitle')}</p>
            <p className="text-sm">{t('partnerPromotions.emptyBody')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {promotions.map((p) => (
            <Card key={p.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight">
                      {p.program?.name || 'Program'}
                    </CardTitle>
                    <div className="text-sm text-gray-600 mt-1">
                      {p.university?.name || 'University'}
                      {p.university?.city ? ` · ${p.university.city}` : ''}
                    </div>
                  </div>
                  {p.university?.logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.university.logo}
                      alt=""
                      className="h-10 w-10 object-contain border border-gray-200 flex-shrink-0"
                    />
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
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
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="mb-4">
                  <div className="text-sm text-gray-500">{t('partnerPromotions.serviceFeeLabel')}</div>
                  <div className="text-2xl font-bold text-[#1B2A4A]">
                    {p.serviceFeeCurrency === 'CNY' ? '¥' : p.serviceFeeCurrency === 'USD' ? '$' : '€'}
                    {p.serviceFeeAmount.toLocaleString()}
                  </div>
                </div>

                {p.targetCountries.length > 0 && (
                  <div className="text-xs text-gray-600 mb-1">
                    {t('partnerPromotions.targetLabel')}: {p.targetCountries.join(', ')}
                  </div>
                )}
                {p.restrictedCountries.length > 0 && (
                  <div className="text-xs text-red-600 mb-1">
                    {t('partnerPromotions.restrictedLabel')}: {p.restrictedCountries.join(', ')}
                  </div>
                )}

                {p.partnerNotes && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{p.partnerNotes}</p>
                )}

                <div className="mt-auto pt-4 flex gap-2">
                  <Link href={`/partner/promotions/${p.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      {t('partnerPromotions.detailsButton')}
                    </Button>
                  </Link>
                  {p.program?.slug && p.isCountryEligible && (
                    <Link
                      href={`/partner/applications/new?programSlug=${encodeURIComponent(p.program.slug)}`}
                      className="flex-1"
                    >
                      <Button className="w-full bg-[#9B1B30] hover:bg-[#7A1625] text-white">
                        {t('partnerPromotions.applyButton')} <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
