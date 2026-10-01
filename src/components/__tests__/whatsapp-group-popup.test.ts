import { describe, it, expect } from 'vitest';
import { isOnTargetPath } from '@/components/whatsapp-group-popup';

describe('WhatsAppGroupPopup path filter', () => {
  it('shows on home', () => {
    expect(isOnTargetPath('/')).toBe(true);
  });

  it('shows on /universities list', () => {
    expect(isOnTargetPath('/universities')).toBe(true);
  });

  it('shows on every /universities/[slug] detail page', () => {
    expect(isOnTargetPath('/universities/tsinghua-university')).toBe(true);
    expect(isOnTargetPath('/universities/peking-university/edit')).toBe(true);
  });

  it('hides on programs list/detail', () => {
    expect(isOnTargetPath('/programs')).toBe(false);
    expect(isOnTargetPath('/programs/computer-science-bsc-tsinghua')).toBe(false);
  });

  it('hides on scholarships list/detail', () => {
    expect(isOnTargetPath('/scholarships')).toBe(false);
    expect(isOnTargetPath('/scholarships/csc-bilateral-program')).toBe(false);
  });

  it('hides on guides (study-in-china content cluster)', () => {
    expect(isOnTargetPath('/guides/application')).toBe(false);
    expect(isOnTargetPath('/csca-exam')).toBe(false);
  });

  it('hides on auth portals (covered by ClientLayout, but defense in depth)', () => {
    expect(isOnTargetPath('/admin/programs')).toBe(false);
    expect(isOnTargetPath('/partner/applications')).toBe(false);
    expect(isOnTargetPath('/student/applications')).toBe(false);
  });

  it('hides on /news', () => {
    expect(isOnTargetPath('/news')).toBe(false);
    expect(isOnTargetPath('/news/csca-2026-april-deadline')).toBe(false);
  });

  it('hides on /contact + /assessment (intentional conversion pages)', () => {
    expect(isOnTargetPath('/contact')).toBe(false);
    expect(isOnTargetPath('/assessment')).toBe(false);
    expect(isOnTargetPath('/thank-you')).toBe(false);
  });

  it('handles null + empty gracefully', () => {
    expect(isOnTargetPath(null)).toBe(false);
    expect(isOnTargetPath('')).toBe(false);
  });

  it('does NOT match /university-prefixed paths that are not the section', () => {
    // Defense in depth: a slug like /university-of-foo shouldn't slip
    // through (it doesn't, since we require the segment after /universities).
    expect(isOnTargetPath('/universitiesly')).toBe(false);
    expect(isOnTargetPath('/universities-archive')).toBe(false);
  });
});