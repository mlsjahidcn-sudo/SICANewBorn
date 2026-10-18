'use client';

/**
 * Preferred-universities multi-select by catalog slug.
 *
 * Same contract as the student self-profile picker
 * (`/student/profile`): chips + searchable checkbox list, capped at
 * CAMPAIGN_MAX_TARGETS so prefs align with the admin shortlist.
 *
 * Shared by admin student create + edit so the two forms cannot
 * drift (Phase C of admin uni/program pickers).
 */

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useI18n } from '@/lib/i18n';
import { CAMPAIGN_MAX_TARGETS } from '@/lib/application-campaign';

export interface PreferredUniversityOption {
  slug: string;
  name: string;
  nameCn?: string | null;
  logo?: string | null;
}

export interface PreferredUniversitiesFieldProps {
  value: string[];
  onChange: (slugs: string[]) => void;
  /** Cap. Defaults to CAMPAIGN_MAX_TARGETS (12). */
  max?: number;
  disabled?: boolean;
  id?: string;
}

export function PreferredUniversitiesField({
  value,
  onChange,
  max = CAMPAIGN_MAX_TARGETS,
  disabled = false,
  id = 'preferredUniversities',
}: PreferredUniversitiesFieldProps) {
  const { t, locale } = useI18n();
  const [universities, setUniversities] = useState<PreferredUniversityOption[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/universities?limit=500&sort=name')
      .then((r) => r.json())
      .then((d: { universities?: PreferredUniversityOption[] }) => {
        if (cancelled) return;
        setUniversities(
          (d.universities ?? []).map((u) => ({
            slug: u.slug,
            name: u.name,
            nameCn: u.nameCn ?? null,
            logo: u.logo ?? null,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setUniversities([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const uniLabel = (u: PreferredUniversityOption): string =>
    locale === 'zh' && u.nameCn ? u.nameCn : u.name;

  const labelForSlug = (slug: string): string => {
    const match = universities.find((u) => u.slug === slug);
    return match ? uniLabel(match) : slug;
  };

  const logoForSlug = (slug: string): string | null => {
    const match = universities.find((u) => u.slug === slug);
    return match?.logo ?? null;
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return universities;
    return universities.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.nameCn ?? '').toLowerCase().includes(q) ||
        u.slug.toLowerCase().includes(q),
    );
  }, [universities, search]);

  const toggle = (slug: string) => {
    if (disabled) return;
    if (value.includes(slug)) {
      onChange(value.filter((s) => s !== slug));
      return;
    }
    if (value.length >= max) return;
    onChange([...value, slug]);
  };

  return (
    <div className="space-y-2" id={id}>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-[#1B2A4A]">
          {t('adminStudentForm.fieldPreferredUniversities')}
        </Label>
        <span className="text-xs text-gray-500">
          {t('adminStudentForm.preferredUniversitiesCount', {
            count: value.length,
            max,
          })}
        </span>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((slug) => {
            const label = labelForSlug(slug);
            const logo = logoForSlug(slug);
            return (
              <span
                key={slug}
                className="inline-flex items-center gap-1.5 bg-[#1B2A4A]/10 text-[#1B2A4A] text-xs px-2 py-1"
              >
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logo}
                    alt=""
                    className="h-4 w-4 object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        'none';
                    }}
                  />
                ) : null}
                {label}
                {!disabled && (
                  <button
                    type="button"
                    aria-label={t(
                      'adminStudentForm.preferredUniversitiesRemove',
                      { name: label },
                    )}
                    className="hover:text-[#9B1B30]"
                    onClick={() => toggle(slug)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            );
          })}
        </div>
      )}

      {!disabled && (
        <div className="border border-gray-200 rounded-none">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-none border-0 border-b border-gray-200"
            placeholder={t('adminStudentForm.preferredUniversitiesSearch')}
          />
          <div className="max-h-48 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <p className="text-xs text-gray-500 px-1 py-2">
                {t('adminStudentForm.preferredUniversitiesLoading')}
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-xs text-gray-500 px-1 py-2">
                {t('adminStudentForm.preferredUniversitiesEmpty')}
              </p>
            ) : (
              filtered.slice(0, 80).map((u) => {
                const checked = value.includes(u.slug);
                const atCap = !checked && value.length >= max;
                return (
                  <label
                    key={u.slug}
                    className={`flex items-center gap-2 px-1 py-1.5 text-sm cursor-pointer ${
                      atCap
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={atCap}
                      onCheckedChange={() => toggle(u.slug)}
                      className="rounded-none"
                    />
                    {u.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={u.logo}
                        alt=""
                        className="h-5 w-5 object-contain shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            'none';
                        }}
                      />
                    ) : null}
                    <span className="truncate">{uniLabel(u)}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        {t('adminStudentForm.preferredUniversitiesHint', { max })}
      </p>
    </div>
  );
}
