'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Ban,
  Building2,
  EyeOff,
  Globe,
  Loader2,
  MapPin,
  Sparkles,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import { currencySymbol } from '@/lib/partner-fee-mapper';
import type { PartnerPromotionWithDetails } from '@/lib/partner-promotion-mapper';

interface PartnerPromotionListItem extends PartnerPromotionWithDetails {
  isCountryEligible: boolean;
}

interface UniversityGroup {
  university: PartnerPromotionListItem['university'];
  promotions: PartnerPromotionListItem[];
}

function feeRange(promotions: PartnerPromotionListItem[]): string {
  const amounts = promotions.map((p) => p.serviceFeeAmount);
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const currency = promotions[0]?.serviceFeeCurrency || 'CNY';
  const symbol = currencySymbol(currency);
  if (min === max) return `${symbol}${min.toLocaleString()}`;
  return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
}

export default function PartnerPromotionsPage() {
  const { t } = useI18n();
  const [promotions, setPromotions] = useState<PartnerPromotionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<UniversityGroup | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetchJson<{ promotions: PartnerPromotionListItem[] }>('/api/partner/promotions')
      .then((res) => {
        if (!cancelled) setPromotions(res.promotions || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : t('partnerPromotions.errorLoad'));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo<UniversityGroup[]>(() => {
    const map = new Map<string, UniversityGroup>();
    for (const p of promotions) {
      const key = p.university?.id || 'unknown';
      const existing = map.get(key);
      if (existing) {
        existing.promotions.push(p);
      } else {
        map.set(key, { university: p.university, promotions: [p] });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      (a.university?.name || '').localeCompare(b.university?.name || ''),
    );
  }, [promotions]);

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
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('partnerPromotions.university')}</TableHead>
                  <TableHead>{t('partnerPromotions.programs')}</TableHead>
                  <TableHead>{t('partnerPromotions.feeRange')}</TableHead>
                  <TableHead>{t('partnerPromotions.eligibility')}</TableHead>
                  <TableHead className="text-right">{t('partnerPromotions.action')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grouped.map((group) => {
                  const u = group.university;
                  const anyEligible = group.promotions.some((p) => p.isCountryEligible);
                  const allRestricted = group.promotions.every((p) => !p.isCountryEligible);
                  return (
                    <TableRow
                      key={u?.id || 'unknown'}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedGroup(group)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {u?.logo && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.logo}
                              alt=""
                              className="h-10 w-10 object-contain border border-gray-200 flex-shrink-0"
                            />
                          )}
                          <div>
                            <div className="font-medium text-[#1B2A4A]">{u?.name || t('partnerPromotions.unknownUniversity')}</div>
                            {u?.city && (
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {u.city}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {group.promotions.length} {' '}
                        {group.promotions.length === 1
                          ? t('partnerPromotions.programSingular')
                          : t('partnerPromotions.programPlural')}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-[#1B2A4A]">{feeRange(group.promotions)}</div>
                      </TableCell>
                      <TableCell>
                        {allRestricted ? (
                          <Badge variant="secondary" className="gap-1 text-amber-700 bg-amber-50">
                            <Ban className="h-3 w-3" /> {t('partnerPromotions.notForRegion')}
                          </Badge>
                        ) : anyEligible ? (
                          <Badge variant="outline" className="gap-1 text-green-700 bg-green-50">
                            {t('partnerPromotions.availableForRegion')}
                          </Badge>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGroup(group);
                          }}
                        >
                          {t('partnerPromotions.detailsButton')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedGroup} onOpenChange={(open) => !open && setSelectedGroup(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {selectedGroup?.university?.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedGroup.university.logo}
                    alt=""
                    className="h-12 w-12 object-contain border border-gray-200"
                  />
                )}
                <div>
                  <DialogTitle className="text-xl">
                    {selectedGroup?.university?.name || t('partnerPromotions.university')}
                  </DialogTitle>
                  {selectedGroup?.university?.city && (
                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {selectedGroup.university.city}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {selectedGroup?.promotions.map((p) => (
              <div
                key={p.id}
                className="border border-gray-200 p-4 hover:border-[#9B1B30]/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-[#1B2A4A]">{p.program?.name}</h3>
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
                    <div className="text-sm text-gray-600 mt-1">
                      {[p.program?.degree, p.program?.language, p.program?.discipline]
                        .filter(Boolean)
                        .join(' · ')}
                    </div>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <div className="text-2xl font-bold text-[#1B2A4A]">
                      {currencySymbol(p.serviceFeeCurrency)}
                      {p.serviceFeeAmount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">{t('partnerPromotions.serviceFeeLabel')}</div>
                  </div>
                </div>

                {(p.targetCountries.length > 0 || p.restrictedCountries.length > 0 || p.partnerNotes) && (
                  <div className="mt-3 text-sm space-y-1">
                    {p.targetCountries.length > 0 && (
                      <div className="text-gray-600">
                        <span className="text-gray-400">{t('partnerPromotions.targetLabel')}:</span>{' '}
                        {p.targetCountries.join(', ')}
                      </div>
                    )}
                    {p.restrictedCountries.length > 0 && (
                      <div className="text-red-600">
                        <span className="text-gray-400">{t('partnerPromotions.restrictedLabel')}:</span>{' '}
                        {p.restrictedCountries.join(', ')}
                      </div>
                    )}
                    {p.partnerNotes && (
                      <p className="text-gray-700 mt-2 whitespace-pre-line">{p.partnerNotes}</p>
                    )}
                  </div>
                )}

                {p.program?.slug && p.isCountryEligible && (
                  <div className="mt-4">
                    <Link
                      href={`/partner/applications/new?programSlug=${encodeURIComponent(p.program.slug)}`}
                    >
                      <Button className="w-full sm:w-auto bg-[#9B1B30] hover:bg-[#7A1625] text-white">
                        {t('partnerPromotions.applyButton')} <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
