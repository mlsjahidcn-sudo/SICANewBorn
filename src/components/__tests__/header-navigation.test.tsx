import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from '@/components/header';
import { I18nProvider } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n-translations';

const route = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));

function renderHeader(locale: Locale = 'en'): ReturnType<typeof render> {
  return render(<I18nProvider initialLocale={locale}><Header /></I18nProvider>);
}

beforeEach(() => {
  route.pathname = '/';
  vi.stubGlobal('localStorage', { getItem: vi.fn().mockReturnValue(null), setItem: vi.fn() });
});

afterEach(() => vi.unstubAllGlobals());

describe('public desktop header navigation', () => {
  it('keeps the catalog links direct and the logo as the home destination', () => {
    renderHeader();
    const navigation = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(within(navigation).getByRole('link', { name: 'Programs' })).toHaveAttribute('href', '/programs');
    expect(within(navigation).getByRole('link', { name: 'Guides' })).toHaveAttribute('href', '/guides');
    expect(within(navigation).queryByRole('link', { name: 'Home' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'SICA — Home' })).toHaveAttribute('href', '/');
  });

  it.each([
    ['/programs/computer-science', 'Programs'],
    ['/guides/visa', 'Guides'],
    ['/universities/tsinghua', 'Universities'],
    ['/study-in-china/beijing', 'Universities'],
    ['/scholarships-for/bangladesh', 'Scholarships'],
    ['/scholarships/csc', 'Scholarships'],
    ['/counselling', 'Admissions'],
    ['/contact', 'About'],
  ])('highlights the owning section on %s', (pathname, label) => {
    route.pathname = pathname;
    renderHeader();
    const navigation = screen.getByRole('navigation', { name: 'Main navigation' });
    const current = navigation.querySelectorAll('[aria-current]');
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent(label);
    expect(current[0]).toHaveAttribute('aria-current', 'location');
  });

  it('marks direct destinations as the current page without matching similar prefixes', () => {
    route.pathname = '/programs';
    const view = renderHeader();
    expect(screen.getByRole('link', { name: 'Programs' })).toHaveAttribute('aria-current', 'page');
    route.pathname = '/programs-extra';
    view.rerender(<I18nProvider initialLocale="en"><Header /></I18nProvider>);
    expect(screen.getByRole('link', { name: 'Programs' })).not.toHaveAttribute('aria-current');
  });

  it('opens a submenu from the keyboard and returns focus on Escape', async () => {
    const user = userEvent.setup();
    renderHeader();
    const trigger = screen.getByRole('button', { name: 'Universities' });
    trigger.focus();
    await user.keyboard('{Enter}{ArrowDown}');
    const allUniversities = screen.getByRole('link', { name: /All Universities/ });
    await waitFor(() => expect(allUniversities).toHaveFocus());
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    expect(trigger).toHaveFocus();
  });

  it('dismisses a keyboard-opened menu before focus enters the panel', async () => {
    const user = userEvent.setup();
    renderHeader();
    const trigger = screen.getByRole('button', { name: 'Universities' });
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('closes an open submenu when the route changes', async () => {
    const view = renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Scholarships' }));
    expect(screen.getByRole('link', { name: 'Bangladesh' })).toHaveAttribute('href', '/scholarships-for/bangladesh');
    route.pathname = '/scholarships-for/bangladesh';
    view.rerender(<I18nProvider initialLocale="en"><Header /></I18nProvider>);
    expect(screen.getByRole('button', { name: 'Scholarships' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Bangladesh' })).not.toBeInTheDocument();
  });

  it('makes portal choices navigable menu items with real link destinations', async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(screen.getByRole('button', { name: 'Portal Login' }));
    const menu = screen.getByRole('menu');
    for (const [name, href] of [
      ['Student Portal', '/student/login'],
      ['Partner Portal', '/partner/login'],
      ['Admin Portal', '/admin/login'],
    ]) {
      const item = within(menu).getByRole('menuitem', { name });
      expect(item.tagName).toBe('A');
      expect(item).toHaveAttribute('href', href);
    }
    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Portal Login' })).toHaveFocus();
  });

  it('switches the navigation and utility labels between English and Chinese', async () => {
    const user = userEvent.setup();
    renderHeader();
    await user.click(screen.getByRole('button', { name: '中文' }));
    expect(screen.getByRole('navigation', { name: '主导航' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '关于' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '门户登录' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'EN' }));
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });
});
