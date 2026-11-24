import type { Scholarship } from '@/lib/data';
import type { Locale } from '@/lib/i18n-translations';
import { cscCountryDeadlines, CSC_DEADLINES_PATH, CSC_DEADLINES_REVIEWED_AT } from '@/lib/csc-deadlines';

type DeadlineScholarship = Pick<Scholarship, 'slug' | 'deadline' | 'deadlineCn'>;

export function scholarshipDeadline(scholarship: DeadlineScholarship, locale: Locale): { label: string; note: string; href?: string } {
  const zh = locale === 'zh';
  if (scholarship.slug === 'csc-bilateral-program') {
    return {
      label: zh ? '2027/28：按国家渠道确认' : '2027/28: country-specific deadlines',
      note: zh ? `包含 2026 年 12 月截止的渠道；请查阅各国日期、提交要求及官方来源。核查日期：${CSC_DEADLINES_REVIEWED_AT}。` : `Some channels close in December 2026. Check country dates, delivery requirements and official sources. Reviewed ${CSC_DEADLINES_REVIEWED_AT}.`,
      href: CSC_DEADLINES_PATH,
    };
  }
  const raw = (zh ? scholarship.deadlineCn : scholarship.deadline)?.trim();
  return {
    label: raw && !/^(null|undefined)$/i.test(raw) ? raw : (zh ? '日期尚未确认' : 'Date not confirmed'),
    note: zh ? '季节范围仅供规划，不代表当期截止日。以本年度受理渠道或院校通知为准。' : 'Seasonal ranges are planning guidance, not a confirmed current-cycle cutoff. Check the current channel or university notice.',
  };
}

function datedDeadline(scholarship: DeadlineScholarship): number | null {
  if (scholarship.slug === 'csc-bilateral-program') {
    const dates = cscCountryDeadlines.filter((row) => row.status === 'confirmed' && row.deadline).map((row) => Date.parse(`${row.deadline}T00:00:00Z`));
    return dates.length ? Math.min(...dates) : null;
  }
  return /^\d{4}-\d{2}-\d{2}$/.test(scholarship.deadline) && Number.isFinite(Date.parse(scholarship.deadline)) ? Date.parse(scholarship.deadline) : null;
}

/** Dated entries first; undated planning windows follow in calendar-month order. */
export function compareScholarshipDeadlines(a: DeadlineScholarship, b: DeadlineScholarship): number {
  const ad = datedDeadline(a);
  const bd = datedDeadline(b);
  if (ad !== null || bd !== null) return ad === null ? 1 : bd === null ? -1 : ad - bd;
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const month = (text: string): number => {
    const index = months.findIndex((value) => text.toLowerCase().includes(value));
    return index < 0 ? 12 : index;
  };
  return month(a.deadline) - month(b.deadline) || a.slug.localeCompare(b.slug);
}
