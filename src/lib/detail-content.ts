/** Shared public presentation rules: preserve source fees and never print null placeholders. */
export function detailText(value: unknown): string {
  if (typeof value !== 'string') return '';
  const text = value.trim();
  return /^(null|undefined|n\/a|to be confirmed)$/i.test(text) ? '' : text;
}

export function localizedDetail(en: unknown, zh: unknown, locale: 'en' | 'zh'): string {
  return (locale === 'zh' ? detailText(zh) : '') || detailText(en) || detailText(zh);
}

export function localizedItems(en: string[] | undefined, zh: string[] | undefined, locale: 'en' | 'zh'): string[] {
  const clean = (values: string[] | undefined): string[] => (values ?? []).map(detailText).filter(Boolean);
  const preferred = clean(locale === 'zh' ? zh : en);
  return preferred.length ? preferred : clean(locale === 'zh' ? en : zh);
}

export function catalogLabel(value: string, locale: 'en' | 'zh'): string {
  if (locale === 'en') return value;
  const labels: Record<string, string> = { Bachelor: '本科', Master: '硕士', PhD: '博士', 'Chinese Language': '汉语进修', Foundation: '预科', 'Non-degree': '非学历', English: '英语', Chinese: '中文', Bilingual: '双语', 'To be confirmed': '待确认' };
  return labels[value] || value;
}

/** Return links are restricted to the same public university detail route. */
export function safeUniversityReturn(value: unknown, universitySlug: string): string {
  if (typeof value !== 'string' || !value.startsWith(`/universities/${universitySlug}`)) return '';
  try {
    const url = new URL(value, 'https://sica.invalid');
    return url.origin === 'https://sica.invalid' && url.pathname === `/universities/${universitySlug}`
      ? `${url.pathname}${url.search}${url.hash === '#detail-section-nav' ? url.hash : ''}` : '';
  } catch { return ''; }
}
