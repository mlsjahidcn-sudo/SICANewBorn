import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { translations } from '@/lib/i18n-translations';

const mocks = vi.hoisted(() => ({ api: vi.fn(), locale: { value: 'en' as 'en' | 'zh' }, user: { id: 's1' } }));
vi.mock('@/lib/api-client', () => ({ apiFetchJson: mocks.api, ApiError: class extends Error {} }));
vi.mock('@/lib/auth-context', () => ({ useAuth: () => ({ user: mocks.user, loading: false }) }));
vi.mock('@/lib/i18n', () => {
  const t = (key: string, params?: Record<string, string | number>): string => {
    let value = translations[mocks.locale.value][key] ?? key;
    for (const [name, replacement] of Object.entries(params ?? {})) value = value.replaceAll(`{{${name}}}`, String(replacement));
    return value;
  };
  return { useI18n: () => ({ t, locale: mocks.locale.value }) };
});
import StudentDashboard from '@/app/student/page';
import PartnerDashboard from '@/app/partner/page';

function card(title: string): HTMLElement {
  const element = screen.getByText(title).closest<HTMLElement>('[data-slot="card"]');
  if (!element) throw new Error(`Missing card: ${title}`);
  return element;
}

beforeEach(() => {
  mocks.api.mockReset();
  mocks.locale.value = 'en';
});

describe('student dashboard', () => {
  function fixtures(): void {
    mocks.api.mockImplementation(async (url: string) => {
      if (url === '/api/student/applications?limit=2') return { applications: [{
        id: 'a1', university: 'Tsinghua University', universityNameCn: '清华大学',
        program: 'Computer Science', programNameCn: '计算机科学', status: 'Under Review', intake: '2027 Fall',
      }] };
      if (url === '/api/student/applications/stats') return { total: 37, pending: 23, accepted: 11, documentsRequested: 4, drafts: 3 };
      if (url === '/api/student/documents') return { data: [] };
      if (url === '/api/student/notifications?limit=3') return { notifications: [] };
      if (url === '/api/student/profile') return { data: null };
      throw new Error(`Unexpected request: ${url}`);
    });
  }

  it('renders API field names, full counts and attention items outside the recent page', async () => {
    fixtures();
    render(<StudentDashboard />);
    expect(await screen.findByText(/Tsinghua University/)).toBeInTheDocument();
    expect(screen.getByText('Computer Science')).toBeInTheDocument();
    expect(within(card(translations.en['student.totalApplications'])).getByText('37')).toBeInTheDocument();
    expect(within(card(translations.en['student.pendingReview'])).getByText('23')).toBeInTheDocument();
    expect(within(card(translations.en['student.acceptedOffers'])).getByText('11')).toBeInTheDocument();
    expect(screen.getByText('4 applications need documents from you')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: `Tsinghua University ${translations.en['student.progressUnderReview']}` })).toBeInTheDocument();
  });

  it('uses the API Chinese name fields when the locale is Chinese', async () => {
    fixtures();
    mocks.locale.value = 'zh';
    render(<StudentDashboard />);
    expect(await screen.findByText('清华大学')).toBeInTheDocument();
    expect(screen.getByText('计算机科学')).toBeInTheDocument();
  });
});

describe('partner dashboard', () => {
  it('shows full-dataset active and accepted totals instead of counting its recent rows', async () => {
    mocks.api.mockImplementation(async (url: string) => {
      if (url === '/api/partner/students?limit=100') return { students: [], total: 200 };
      if (url === '/api/partner/applications?limit=100') return { applications: [{
        id: 'p1', studentName: 'Amina', university: 'Tsinghua University', program: 'Computer Science', status: 'In Review', createdAt: '2026-10-21T00:00:00Z',
      }], total: 145 };
      if (url === '/api/partner/applications/stats') return { active: 123, accepted: 17 };
      if (url === '/api/partner/team') return { team: [] };
      if (url.startsWith('/api/partner/documents')) return { documents: [] };
      throw new Error(`Unexpected request: ${url}`);
    });
    render(<PartnerDashboard />);
    expect(await screen.findByText(/Tsinghua University/)).toBeInTheDocument();
    expect(within(card(translations.en['partnerDashboard.activeApplications'])).getByText('123')).toBeInTheDocument();
    expect(within(card(translations.en['partnerDashboard.accepted'])).getByText('17')).toBeInTheDocument();
    expect(within(card(translations.en['partnerDashboard.totalStudents'])).getByText('200')).toBeInTheDocument();
  });
});
