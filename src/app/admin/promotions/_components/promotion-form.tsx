'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Search, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { apiFetchJson } from '@/lib/api-client';
import { useToast } from '@/components/admin/toast';
import { useI18n } from '@/lib/i18n';
import { COMMON_COUNTRIES } from '@/lib/common-countries';
import type { PartnerPromotionWithDetails } from '@/lib/partner-promotion-mapper';

interface OptionUniversity {
  id: string;
  slug: string;
  name: string;
  nameCn: string | null;
  city: string | null;
  logo: string | null;
}

interface OptionProgram {
  id: string;
  slug: string;
  name: string;
  nameCn: string | null;
  degree: string | null;
  language: string | null;
  discipline: string | null;
  universitySlug: string | null;
}

interface FormState {
  universityId: string;
  programIds: string[];
  serviceFeeAmount: string;
  serviceFeeCurrency: string;
  visibility: 'partner_only' | 'public_and_partner';
  targetCountries: string[];
  restrictedCountries: string[];
  status: 'active' | 'paused' | 'archived';
  priority: string;
  internalNotes: string;
  partnerNotes: string;
}

const defaultForm: FormState = {
  universityId: '',
  programIds: [],
  serviceFeeAmount: '',
  serviceFeeCurrency: 'CNY',
  visibility: 'partner_only',
  targetCountries: [],
  restrictedCountries: [],
  status: 'active',
  priority: '0',
  internalNotes: '',
  partnerNotes: '',
};

function promotionToForm(p: PartnerPromotionWithDetails): FormState {
  return {
    universityId: p.universityId,
    programIds: [p.programId],
    serviceFeeAmount: p.serviceFeeAmount.toString(),
    serviceFeeCurrency: p.serviceFeeCurrency,
    visibility: p.visibility,
    targetCountries: p.targetCountries,
    restrictedCountries: p.restrictedCountries,
    status: p.status,
    priority: p.priority.toString(),
    internalNotes: p.internalNotes ?? '',
    partnerNotes: p.partnerNotes ?? '',
  };
}

function CountryMultiSelect({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COMMON_COUNTRIES;
    return COMMON_COUNTRIES.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.value.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [search]);

  const toggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#1F2937]">{label}</label>
      <div className="border border-gray-300 bg-white">
        <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('adminPromotions.form.countrySearchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 focus-visible:ring-0 h-8 px-0"
          />
        </div>
        <div className="h-48 overflow-y-auto p-2 space-y-1">
          {filtered.map((country) => {
            const checked = values.includes(country.value);
            return (
              <button
                key={country.value}
                type="button"
                onClick={() => toggle(country.value)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left transition-colors ${
                  checked ? 'bg-[#9B1B30]/10 text-[#9B1B30]' : 'hover:bg-gray-50'
                }`}
              >
                <span
                  className={`w-4 h-4 border flex items-center justify-center ${
                    checked ? 'bg-[#9B1B30] border-[#9B1B30]' : 'border-gray-300'
                  }`}
                >
                  {checked && <Check className="h-3 w-3 text-white" />}
                </span>
                <span className="flex-1">{country.label}</span>
                <span className="text-xs text-gray-400">{country.code}</span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4">{t('adminPromotions.form.countryNoMatches')}</div>
          )}
        </div>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 text-gray-700"
            >
              {v}
              <button type="button" onClick={() => toggle(v)} className="hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function PromotionForm({ promotionId }: { promotionId?: string }) {
  const router = useRouter();
  const { addToast } = useToast();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [universities, setUniversities] = useState<OptionUniversity[]>([]);
  const [programs, setPrograms] = useState<OptionProgram[]>([]);
  const [form, setForm] = useState<FormState>(defaultForm);
  const isEdit = !!promotionId;

  useEffect(() => {
    setOptionsLoading(true);
    apiFetchJson<{ universities: OptionUniversity[]; programs: OptionProgram[] }>(
      '/api/admin/promotions/options',
    )
      .then((res) => {
        setUniversities(res.universities || []);
        setPrograms(res.programs || []);
      })
      .catch((err) => {
        addToast(err instanceof Error ? err.message : t('adminPromotions.form.errorLoadOptions'), 'error');
      })
      .finally(() => setOptionsLoading(false));
  }, [addToast, t]);

  useEffect(() => {
    if (!promotionId) {
      setIsLoading(false);
      return;
    }
    apiFetchJson<{ promotion: PartnerPromotionWithDetails }>(`/api/admin/promotions/${promotionId}`)
      .then((res) => {
        setForm(promotionToForm(res.promotion));
      })
      .catch((err) => {
        addToast(err instanceof Error ? err.message : t('adminPromotions.form.errorLoadPromotion'), 'error');
      })
      .finally(() => setIsLoading(false));
  }, [promotionId, addToast, t]);

  const selectedUniversity = useMemo(
    () => universities.find((u) => u.id === form.universityId),
    [universities, form.universityId],
  );

  const programOptions = useMemo(() => {
    if (!selectedUniversity) return [];
    return programs.filter((p) => p.universitySlug === selectedUniversity.slug);
  }, [programs, selectedUniversity]);

  const universityOptions = useMemo(
    () =>
      universities.map((u) => ({
        value: u.id,
        label: u.name,
        sublabel: u.nameCn || u.city || undefined,
        logo: u.logo || undefined,
      })),
    [universities],
  );

  const handleChange = (field: keyof FormState, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUniversityChange = (universityId: string) => {
    setForm((prev) => ({
      ...prev,
      universityId,
      programIds: [],
    }));
  };

  const validate = (): string | null => {
    if (!form.universityId) return t('adminPromotions.form.errorUniversity');
    if (form.programIds.length === 0) return t('adminPromotions.form.errorProgram');
    const amount = parseFloat(form.serviceFeeAmount);
    if (!Number.isFinite(amount) || amount <= 0) return t('adminPromotions.form.errorAmount');
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      addToast(err, 'error');
      return;
    }

    setIsSaving(true);
    try {
      const basePayload = {
        universityId: form.universityId,
        serviceFeeAmount: parseFloat(form.serviceFeeAmount),
        serviceFeeCurrency: form.serviceFeeCurrency,
        visibility: form.visibility,
        targetCountries: form.targetCountries,
        restrictedCountries: form.restrictedCountries,
        status: form.status,
        priority: parseInt(form.priority, 10) || 0,
        internalNotes: form.internalNotes || null,
        partnerNotes: form.partnerNotes || null,
      };

      if (promotionId) {
        await apiFetchJson(`/api/admin/promotions/${promotionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...basePayload, programId: form.programIds[0] }),
        });
        addToast(t('adminPromotions.form.successUpdate'), 'success');
      } else {
        await Promise.all(
          form.programIds.map((programId) =>
            apiFetchJson('/api/admin/promotions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...basePayload, programId }),
            }),
          ),
        );
        addToast(t('adminPromotions.form.successCreate', { count: form.programIds.length }), 'success');
      }
      router.push('/admin/promotions');
    } catch (err) {
      addToast(err instanceof Error ? err.message : t('adminPromotions.form.errorSave'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || optionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.push('/admin/promotions')}
          className="p-2 text-[#1B2A4A] hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">
            {promotionId ? t('adminPromotions.form.editTitle') : t('adminPromotions.form.addTitle')}
          </h1>
          <p className="text-[#4B5563] text-sm mt-1">
            {promotionId
              ? t('adminPromotions.form.editSubtitle')
              : t('adminPromotions.form.addSubtitle')}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminPromotions.form.sectionProgram')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1">{t('adminPromotions.form.fieldUniversity')}</label>
            <SearchableSelect
              value={form.universityId}
              onChange={handleUniversityChange}
              options={universityOptions}
              placeholder={t('adminPromotions.form.placeholderUniversity')}
              emptyText={t('adminPromotions.form.emptyUniversity')}
              searchPlaceholder={t('adminPromotions.form.searchUniversity')}
              loading={optionsLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1">
              {isEdit ? t('adminPromotions.form.fieldProgramSingular') : t('adminPromotions.form.fieldProgramPlural')}
            </label>
            {isEdit ? (
              <div className="px-3 py-2 border border-gray-300 bg-gray-50 text-sm text-[#1F2937]">
                {programOptions.find((p) => p.id === form.programIds[0])?.name || '—'}
              </div>
            ) : (
              <div className="border border-gray-300 bg-white">
                {!selectedUniversity ? (
                  <div className="p-3 text-sm text-gray-500">
                    {t('adminPromotions.form.programEmptyUniversity')}
                  </div>
                ) : programOptions.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">
                    {t('adminPromotions.form.programEmptyNone')}
                  </div>
                ) : (
                  <div className="h-60 overflow-y-auto p-2 space-y-1">
                    {programOptions.map((program) => {
                      const checked = form.programIds.includes(program.id);
                      return (
                        <button
                          key={program.id}
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              programIds: checked
                                ? prev.programIds.filter((id) => id !== program.id)
                                : [...prev.programIds, program.id],
                            }));
                          }}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left transition-colors ${
                            checked ? 'bg-[#9B1B30]/10 text-[#9B1B30]' : 'hover:bg-gray-50'
                          }`}
                        >
                          <span
                            className={`w-4 h-4 border flex items-center justify-center ${
                              checked ? 'bg-[#9B1B30] border-[#9B1B30]' : 'border-gray-300'
                            }`}
                          >
                            {checked && <Check className="h-3 w-3 text-white" />}
                          </span>
                          <span className="flex-1">{program.name}</span>
                          <span className="text-xs text-gray-400">
                            {[program.degree, program.language].filter(Boolean).join(' · ')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {form.programIds.length > 0 && (
                  <div className="border-t border-gray-200 px-3 py-2 text-xs text-gray-600">
                    {t('adminPromotions.form.programsSelected', { count: form.programIds.length })}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminPromotions.form.sectionFee')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">{t('adminPromotions.form.fieldAmount')}</label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.serviceFeeAmount}
                onChange={(e) => handleChange('serviceFeeAmount', e.target.value)}
                placeholder={t('adminPromotions.form.placeholderAmount')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">{t('adminPromotions.form.fieldCurrency')}</label>
              <select
                value={form.serviceFeeCurrency}
                onChange={(e) => handleChange('serviceFeeCurrency', e.target.value)}
                className={inputClass}
              >
                <option value="CNY">CNY (¥)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminPromotions.form.sectionVisibility')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">{t('adminPromotions.form.fieldVisibility')}</label>
              <select
                value={form.visibility}
                onChange={(e) =>
                  handleChange('visibility', e.target.value as FormState['visibility'])
                }
                className={inputClass}
              >
                <option value="partner_only">{t('adminPromotions.form.visibilityPartnerOnly')}</option>
                <option value="public_and_partner">{t('adminPromotions.form.visibilityPublic')}</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {t('adminPromotions.form.visibilityHint')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">{t('adminPromotions.form.fieldStatus')}</label>
              <select
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value as FormState['status'])}
                className={inputClass}
              >
                <option value="active">{t('adminPromotions.form.statusActive')}</option>
                <option value="paused">{t('adminPromotions.form.statusPaused')}</option>
                <option value="archived">{t('adminPromotions.form.statusArchived')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">{t('adminPromotions.form.fieldPriority')}</label>
              <Input
                type="number"
                value={form.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                placeholder={t('adminPromotions.form.placeholderPriority')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminPromotions.form.sectionCountries')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CountryMultiSelect
            label={t('adminPromotions.form.fieldTargetCountries')}
            values={form.targetCountries}
            onChange={(values) => handleChange('targetCountries', values)}
          />
          <CountryMultiSelect
            label={t('adminPromotions.form.fieldRestrictedCountries')}
            values={form.restrictedCountries}
            onChange={(values) => handleChange('restrictedCountries', values)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminPromotions.form.sectionNotes')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1">{t('adminPromotions.form.fieldInternalNotes')}</label>
            <textarea
              value={form.internalNotes}
              onChange={(e) => handleChange('internalNotes', e.target.value)}
              rows={3}
              className={inputClass}
              placeholder={t('adminPromotions.form.placeholderInternalNotes')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1">{t('adminPromotions.form.fieldPartnerNotes')}</label>
            <textarea
              value={form.partnerNotes}
              onChange={(e) => handleChange('partnerNotes', e.target.value)}
              rows={3}
              className={inputClass}
              placeholder={t('adminPromotions.form.placeholderPartnerNotes')}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button
          type="submit"
          disabled={isSaving}
          className="bg-[#9B1B30] hover:bg-[#7A1625] text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving
            ? t('adminPromotions.form.saving')
            : promotionId
              ? t('adminPromotions.form.submitUpdate')
              : t('adminPromotions.form.submitCreate')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/promotions')}
        >
          {t('adminCommon.cancel')}
        </Button>
      </div>
    </form>
  );
}
