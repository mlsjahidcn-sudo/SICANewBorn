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
  programId: string;
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
  programId: '',
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
    programId: p.programId,
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
            placeholder="Search countries..."
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
            <div className="text-sm text-gray-500 text-center py-4">No countries match</div>
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [universities, setUniversities] = useState<OptionUniversity[]>([]);
  const [programs, setPrograms] = useState<OptionProgram[]>([]);
  const [form, setForm] = useState<FormState>(defaultForm);

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
        addToast(err instanceof Error ? err.message : 'Failed to load options', 'error');
      })
      .finally(() => setOptionsLoading(false));
  }, [addToast]);

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
        addToast(err instanceof Error ? err.message : 'Failed to load promotion', 'error');
      })
      .finally(() => setIsLoading(false));
  }, [promotionId, addToast]);

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

  const programSelectOptions = useMemo(
    () =>
      programOptions.map((p) => ({
        value: p.id,
        label: p.name,
        sublabel: [p.degree, p.language, p.discipline].filter(Boolean).join(' · ') || undefined,
      })),
    [programOptions],
  );

  const handleChange = (field: keyof FormState, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUniversityChange = (universityId: string) => {
    setForm((prev) => ({
      ...prev,
      universityId,
      programId: '',
    }));
  };

  const validate = (): string | null => {
    if (!form.universityId) return 'Please select a university';
    if (!form.programId) return 'Please select a program';
    const amount = parseFloat(form.serviceFeeAmount);
    if (!Number.isFinite(amount) || amount <= 0) return 'Service fee must be a positive number';
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
      const payload = {
        universityId: form.universityId,
        programId: form.programId,
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
          body: JSON.stringify(payload),
        });
        addToast('Promotion updated successfully', 'success');
      } else {
        await apiFetchJson('/api/admin/promotions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        addToast('Promotion created successfully', 'success');
      }
      router.push('/admin/promotions');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to save promotion', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || optionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
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
            {promotionId ? 'Edit Promotion' : 'Add Promotion'}
          </h1>
          <p className="text-[#4B5563] text-sm mt-1">
            {promotionId
              ? 'Update the promoted program, fee, and restrictions.'
              : 'Choose a university program to promote to partners.'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program & University</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1">University *</label>
            <SearchableSelect
              value={form.universityId}
              onChange={handleUniversityChange}
              options={universityOptions}
              placeholder="Select a university"
              emptyText="No universities found"
              searchPlaceholder="Search universities..."
              loading={optionsLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1">Program *</label>
            <SearchableSelect
              value={form.programId}
              onChange={(value) => handleChange('programId', value)}
              options={programSelectOptions}
              placeholder={selectedUniversity ? 'Select a program' : 'Select a university first'}
              emptyText="No programs found for this university"
              searchPlaceholder="Search programs..."
              disabled={!selectedUniversity}
              loading={optionsLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Fee</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Amount *</label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.serviceFeeAmount}
                onChange={(e) => handleChange('serviceFeeAmount', e.target.value)}
                placeholder="e.g. 5000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Currency</label>
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
          <CardTitle>Visibility & Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Visibility</label>
              <select
                value={form.visibility}
                onChange={(e) =>
                  handleChange('visibility', e.target.value as FormState['visibility'])
                }
                className={inputClass}
              >
                <option value="partner_only">Partner Only</option>
                <option value="public_and_partner">Public + Partner</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Partner Only hides the service-fee promotion from public pages.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value as FormState['status'])}
                className={inputClass}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Priority</label>
              <Input
                type="number"
                value={form.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                placeholder="Higher = shown first"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Country Restrictions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CountryMultiSelect
            label="Target Countries (leave empty for all)"
            values={form.targetCountries}
            onChange={(values) => handleChange('targetCountries', values)}
          />
          <CountryMultiSelect
            label="Restricted Countries"
            values={form.restrictedCountries}
            onChange={(values) => handleChange('restrictedCountries', values)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1">Internal Notes</label>
            <textarea
              value={form.internalNotes}
              onChange={(e) => handleChange('internalNotes', e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Admin-only notes about this promotion"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1">Partner-Facing Notes</label>
            <textarea
              value={form.partnerNotes}
              onChange={(e) => handleChange('partnerNotes', e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Notes shown to partners on the promotion detail page"
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
          {isSaving ? 'Saving...' : promotionId ? 'Update Promotion' : 'Create Promotion'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/promotions')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
