'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  GraduationCap,
  Award,
  FileText,
  Info,
  MapPin,
  Globe,
  MessageCircle,
  Compass,
  Mail,
  CalendarClock,
} from 'lucide-react';

interface SubItem {
  href: string;
  label: string;
  desc: string;
  icon: React.ElementType;
}
interface SubSection {
  title: string;
  items: SubItem[];
}

interface MenuItem {
  label: string;
  type: 'link' | 'menu';
  href?: string;
  /** Pathname prefixes that mark this menu item as the "current section".
   *  Direct links and menus stay highlighted throughout these subtrees. */
  activeMatch?: string[];
  sections?: SubSection[];
  align?: 'end';
}

const CITY_KEYS = ['beijing', 'shanghai', 'guangzhou', 'hangzhou', 'nanjing', 'wuhan'] as const;
const TOP_COUNTRIES = ['india', 'indonesia', 'pakistan', 'nigeria', 'bangladesh', 'vietnam'] as const;

/** Own state in the keyed menu so navigation also resets an open panel. */
function DesktopNavigation({ children, label }: { children: ReactNode; label: string }): React.JSX.Element {
  const [openMenu, setOpenMenu] = useState('');

  return (
    <NavigationMenu
      aria-label={label}
      className="hidden shrink-0 flex-none xl:flex"
      viewport={false}
      value={openMenu}
      onValueChange={setOpenMenu}
      delayDuration={150}
      skipDelayDuration={300}
      onKeyDown={(event) => {
        // Radix handles Escape from panel links; also dismiss while the
        // trigger is still focused after opening with Enter or Space.
        if (event.key === 'Escape') setOpenMenu('');
      }}
    >
      {children}
    </NavigationMenu>
  );
}

/** Desktop navigation; the header owns the separate mobile link list. */
export function MainNav(): React.JSX.Element {
  const { t, locale } = useI18n();
  const pathname = usePathname() || '/';

  const cities = CITY_KEYS.map((slug) => ({
    slug,
    label: t(`nav.cities.${slug}`),
  }));
  const countries = TOP_COUNTRIES.map((slug) => ({
    slug,
    label: t(`nav.countries.${slug}`),
  }));

  const isItemActive = (item: MenuItem): boolean =>
    item.activeMatch?.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ) ?? item.href === pathname;

  // A home-page anchor is not the current page just because its pathname is '/'.
  const isSubItemActive = (href: string): boolean =>
    !href.includes('#') && href === pathname;

  const menuItems: MenuItem[] = [
    {
      type: 'menu',
      label: t('nav.universities'),
      activeMatch: ['/universities', '/study-in-china'],
      sections: [
        {
          title: t('nav.universities'),
          items: [
            {
              href: '/universities',
              label: t('nav.universities.all'),
              desc: t('nav.universities.allDesc'),
              icon: GraduationCap,
            },
            {
              href: '/study-in-china',
              label: t('cityFinder.allCities'),
              desc: t('nav.universities.byCityDesc'),
              icon: MapPin,
            },
          ],
        },
        {
          title: t('cityFinder.popularCities'),
          items: cities.map(({ slug, label }) => ({
            href: `/study-in-china/${slug}`,
            label,
            desc: '',
            icon: MapPin,
          })),
        },
      ],
    },
    {
      // S42: flattened to a direct link — the submenu held exactly one
      // item ("All Programs" → /programs) so a hover step was pure overhead.
      type: 'link',
      href: '/programs',
      activeMatch: ['/programs'],
      label: t('nav.programs'),
    },
    {
      type: 'menu',
      label: t('nav.scholarships'),
      activeMatch: ['/scholarships', '/scholarships-for'],
      sections: [
        {
          title: t('nav.scholarships'),
          items: [
            {
              href: '/scholarships',
              label: t('nav.scholarships.all'),
              desc: t('nav.scholarships.allDesc'),
              icon: Award,
            },
            {
              href: '/scholarships-for',
              label: t('nav.scholarships.byCountry'),
              desc: t('nav.scholarships.byCountryDesc'),
              icon: Globe,
            },
          ],
        },
        {
          title: t('nav.scholarships.byCountry'),
          items: countries.map(({ slug, label }) => ({
            href: `/scholarships-for/${slug}`,
            label,
            desc: '',
            icon: Globe,
          })),
        },
      ],
    },
    {
      type: 'menu',
      label: t('nav.admissions'),
      // Only /assessment highlights Admissions — /contact lives in
      // the About submenu, so it highlights About.
      activeMatch: ['/assessment', '/counselling'],
      sections: [
        {
          title: t('nav.admissions'),
          items: [
            {
              // Phase 114: free 10-min counselling booking — the
              // fastest-intent conversion path, so it leads the menu.
              href: '/counselling',
              label: t('nav.admissions.counselling'),
              desc: t('nav.admissions.counsellingDesc'),
              icon: CalendarClock,
            },
            {
              href: '/assessment',
              label: t('nav.admissions.assessment'),
              desc: t('nav.admissions.assessmentDesc'),
              icon: FileText,
            },
            {
              // S42: own i18n key (was reusing nav.about.contact) so the
              // Admissions submenu can label "Contact Us" with copy that
              // doesn't pretend to live under About.
              href: '/contact',
              label: t('nav.admissions.contact'),
              desc: t('nav.admissions.contactDesc'),
              icon: MessageCircle,
            },
          ],
        },
      ],
    },
    {
      type: 'link',
      href: '/guides',
      activeMatch: ['/guides'],
      label: t('nav.guides'),
    },
    {
      type: 'menu',
      label: t('nav.aboutShort'),
      align: 'end',
      // About owns /about + /contact. /contact was previously under
      // both Admissions and About (Phase 40/41 added it to Admissions
      // for parity); the dedup moved the visual ownership here.
      activeMatch: ['/about', '/contact'],
      sections: [
        {
          title: t('nav.about'),
          items: [
            {
              href: '/about',
              label: t('nav.about.about'),
              desc: t('nav.about.aboutDesc'),
              icon: Info,
            },
            {
              // S42: was '/' which silently dropped the user on the home
              // page without scrolling. Now anchors to the home section.
              href: '/#why-study-in-china',
              label: t('nav.about.whyChina'),
              desc: t('nav.about.whyChinaDesc'),
              icon: Compass,
            },
            {
              href: '/contact',
              label: t('nav.about.contact'),
              desc: t('nav.about.contactDesc'),
              icon: Mail,
            },
          ],
        },
      ],
    },
  ];

  return (
    // Keep panels anchored to their own trigger. Padding bridges the pointer
    // path into the panel; a margin here would leave a hover gap.
    <DesktopNavigation key={`${pathname}:${locale}`} label={t('nav.mainMenu')}>
      <NavigationMenuList className="gap-0.5">
        {menuItems.map((item) => {
          const active = isItemActive(item);
          const itemClassName = cn(
            'h-10 flex-row gap-1 rounded-none border-b-2 border-transparent bg-transparent px-2.5 py-2 text-sm font-semibold text-[#1B2A4A] transition-colors duration-150 hover:bg-[#1B2A4A]/5 hover:text-[#9B1B30] focus-visible:ring-2 focus-visible:ring-[#1B2A4A] focus-visible:ring-offset-2 motion-reduce:transition-none',
            active && 'border-[#9B1B30] text-[#9B1B30]',
          );

          return item.type === 'link' ? (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink asChild className={itemClassName}>
                <Link
                  href={item.href!}
                  aria-current={active ? (pathname === item.href ? 'page' : 'location') : undefined}
                >
                  {item.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuTrigger
                aria-current={active ? 'location' : undefined}
                className={cn(
                  itemClassName,
                  'data-[state=open]:bg-[#1B2A4A]/5 data-[state=open]:text-[#9B1B30] [&>svg]:text-[#1B2A4A]',
                )}
              >
                {item.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent
                className={cn(
                  'w-max p-0 pt-2 pr-0 group-data-[viewport=false]/navigation-menu:mt-0 group-data-[viewport=false]/navigation-menu:overflow-visible group-data-[viewport=false]/navigation-menu:rounded-none group-data-[viewport=false]/navigation-menu:border-0 group-data-[viewport=false]/navigation-menu:bg-transparent group-data-[viewport=false]/navigation-menu:shadow-none group-data-[viewport=false]/navigation-menu:duration-150 motion-reduce:animate-none!',
                  // The last panel opens toward the centre of the header.
                  item.align === 'end' && 'right-0 left-auto',
                )}
              >
                <div
                  className={cn(
                    'grid max-h-[calc(100dvh-6rem)] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-none border border-[#1B2A4A]/15 bg-white shadow-lg',
                    (item.sections?.length ?? 0) > 1
                      ? 'w-[520px] grid-cols-[minmax(0,1fr)_190px]'
                      : 'w-[360px]',
                  )}
                >
                  {item.sections?.map((section, index) => {
                    const compact = index > 0;
                    return (
                      <div
                        key={`${section.title}-${index}`}
                        className={cn('p-3', compact && 'border-l border-gray-200 bg-[#FAFAF8]')}
                      >
                        {(item.sections?.length ?? 0) > 1 && (
                          <h3 className="mb-2 px-2 text-xs font-semibold text-[#4B5563]">
                            {section.title}
                          </h3>
                        )}
                        <ul className="flex flex-col gap-1">
                          {section.items.map((sub) => {
                            const subActive = isSubItemActive(sub.href);
                            return (
                              <li key={sub.href}>
                                <NavigationMenuLink
                                  asChild
                                  className={cn(
                                    'group/nav-link flex min-h-9 flex-row rounded-none text-[#1B2A4A] transition-colors duration-150 hover:bg-[#1B2A4A]/5 focus-visible:bg-[#1B2A4A]/5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1B2A4A] motion-reduce:transition-none',
                                    compact ? 'items-center px-2 py-2' : 'items-start gap-3 p-3',
                                    subActive && 'bg-[#1B2A4A]/5',
                                  )}
                                >
                                  <Link href={sub.href} aria-current={subActive ? 'page' : undefined}>
                                    {!compact && (
                                      <span className="flex size-9 shrink-0 items-center justify-center bg-[#1B2A4A]/5">
                                        <sub.icon className="size-4 text-[#1B2A4A]" aria-hidden="true" />
                                      </span>
                                    )}
                                    <span className="min-w-0 flex-1">
                                      <span
                                        className={cn(
                                          'block text-sm leading-5 group-hover/nav-link:text-[#9B1B30]',
                                          compact ? 'font-medium' : 'font-semibold',
                                          subActive && 'font-semibold text-[#9B1B30]',
                                        )}
                                      >
                                        {sub.label}
                                      </span>
                                      {!compact && sub.desc && (
                                        <span className="mt-1 block text-xs leading-5 text-[#4B5563]">
                                          {sub.desc}
                                        </span>
                                      )}
                                    </span>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </DesktopNavigation>
  );
}
