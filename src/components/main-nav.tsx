'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
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
   *  Direct links match `href` exactly; menus match any of these prefixes. */
  activeMatch?: string[];
  sections?: SubSection[];
}

const CITY_KEYS = ['beijing', 'shanghai', 'guangzhou', 'hangzhou', 'nanjing', 'wuhan'] as const;
const TOP_COUNTRIES = ['india', 'indonesia', 'pakistan', 'nigeria', 'bangladesh', 'vietnam'] as const;

/**
 * MainNav — the public-site top navigation with hover submenus (desktop)
 * and a stacked, accordion-style menu (mobile). Brand-aligned:
 *  - Sharp corners (no rounded) per SICA convention
 *  - Crimson accent on hover/active (#9B1B30)
 *  - Submenu descriptions in muted gray for hierarchy
 *  - i18n: full en + zh coverage
 */
export function MainNav() {
  const { t } = useI18n();
  const pathname = usePathname() || '/';

  const cities = CITY_KEYS.map((slug) => ({
    slug,
    label: t(`nav.cities.${slug}`),
  }));
  const countries = TOP_COUNTRIES.map((slug) => ({
    slug,
    label: t(`nav.countries.${slug}`),
  }));

  // `isItemActive` decides whether a menu item is the "current section"
  // — used to apply `aria-current` + crimson text + bottom border on the
  // matching trigger so the user can see where they are in the IA.
  //
  // Direct links: match the exact `href` (Home `/` matches only `/`).
  // Menus: match any of the explicit `activeMatch` prefixes so the
  // section is highlighted for every page in that subtree.
  //   - "Universities" matches /universities/* + /study-in-china/*
  //     (By City is grouped under Universities in the IA)
  //   - "About SICA" also matches /contact because the About submenu is
  //     where Contact lives in the IA (Admissions submenu's Contact was
  //     deduped in S42).
  //   - "Admissions" matches /assessment only — /contact goes to About.
  const isItemActive = (item: MenuItem): boolean => {
    if (item.type === 'link') {
      return item.href === pathname;
    }
    return (
      item.activeMatch?.some(
        (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
      ) ?? false
    );
  };

  // Per-sub-item exact-path match — used to bold/highlight a row inside
  // an open submenu when the user is exactly on that page.
  const isSubItemActive = (href: string): boolean => {
    // Strip hash fragments for the comparison so /#why-study-in-china
    // matches pathname === '/' as a regular Home link.
    const [path] = href.split('#');
    return path === pathname;
  };

  const menuItems: MenuItem[] = [
    { type: 'link', href: '/', label: t('nav.home') },
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
              label: t('nav.universities.byCity'),
              desc: t('nav.universities.byCityDesc'),
              icon: MapPin,
            },
          ],
        },
        {
          title: t('nav.universities.byCity'),
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
      activeMatch: ['/scholarships'],
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
      activeMatch: ['/assessment'],
      sections: [
        {
          title: t('nav.admissions'),
          items: [
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
      label: t('nav.about'),
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
    // viewport={false} → each NavigationMenuContent renders in its
    // own trigger item (absolutely positioned under that trigger),
    // not in a single shared floating viewport. We were getting
    // "submenu shows under the wrong menu item" when the viewport
    // tried to re-position for content of mixed widths (some menus
    // are 280px wide, others 480px). Per-trigger positioning is the
    // simpler, more predictable layout.
    <NavigationMenu className="hidden lg:flex" viewport={false}>
      <NavigationMenuList>
        {menuItems.map((item) => {
          // Compute once per item — drives both `aria-current` and the
          // crimson-text + bottom-border treatment for the active section.
          const active = isItemActive(item);
          return item.type === 'link' ? (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink asChild>
                <Link
                  href={item.href!}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'group inline-flex h-9 w-max items-center justify-center px-3 py-2 text-sm font-medium transition-colors focus:outline-none',
                    active
                      ? 'text-[#9B1B30] font-semibold border-b-2 border-[#9B1B30]'
                      : 'text-gray-700 hover:text-[#9B1B30] focus:text-[#9B1B30]',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuTrigger
                aria-current={active ? 'page' : undefined}
                className={[
                  'group inline-flex h-9 w-max items-center justify-center px-3 py-2 text-sm font-medium transition-colors focus:outline-none data-[state=open]:text-[#9B1B30]',
                  active
                    ? 'text-[#9B1B30] font-semibold border-b-2 border-[#9B1B30]'
                    : 'text-gray-700 hover:text-[#9B1B30] focus:text-[#9B1B30]',
                ].join(' ')}
              >
                {item.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div
                  className={`grid ${
                    (item.sections?.length ?? 0) > 1
                      ? 'w-[480px] md:grid-cols-[1fr_140px]'
                      : 'w-[280px]'
                  } bg-white border border-[#1B2A4A] shadow-lg`}
                  style={{ borderRadius: 0 }}
                >
                  {item.sections?.map((section, idx) => (
                    <div
                      key={section.title}
                      className={
                        (item.sections?.length ?? 0) > 1
                          ? // Two-column layout: left = primary items (with
                            // subtle icons), right = compact city/country
                            // list (no icons, denser rows).
                            idx === 0
                            ? 'p-2 border-r border-gray-100'
                            : 'p-2 bg-[#FAFAF8]'
                          : 'p-2'
                      }
                    >
                      {/* Section title — only show when there are 2+
                          sections and this isn't the first one. */}
                      {(item.sections?.length ?? 0) > 1 && idx > 0 && (
                        <h3 className="mb-1 px-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9B1B30]">
                          {section.title}
                        </h3>
                      )}
                      <ul className={idx === 0 ? 'space-y-0.5' : 'space-y-px'}>
                        {section.items.map((sub) => {
                          // Compact mode for the right column: no icon,
                          // smaller text, single line.
                          const isCompact = idx > 0;
                          // Bold + crimson when this exact sub-link matches
                          // the current route — gives the user a visible
                          // "you are here" inside an open submenu.
                          const subActive = isSubItemActive(sub.href);
                          return (
                            // Composite key: a few menu items intentionally
                            // share a destination (e.g. `/assessment` shows
                            // up under both "Free Assessment" + "Apply Now"
                            // with different labels) but React still wants
                            // a unique key per row.
                            <li key={`${sub.href}::${sub.label}`}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={sub.href}
                                  aria-current={subActive ? 'page' : undefined}
                                  className={[
                                    'group flex select-none outline-none transition-colors',
                                    isCompact
                                      ? 'items-center px-1.5 py-1 text-[12px] group-hover:text-[#9B1B30]'
                                      : 'items-start gap-2 p-1.5',
                                    subActive
                                      ? 'bg-[#1B2A4A]/5'
                                      : 'hover:bg-[#1B2A4A]/5',
                                    subActive
                                      ? (isCompact ? 'text-[#9B1B30] font-semibold' : '[&_div]:text-[#9B1B30] [&_div]:font-semibold')
                                      : (isCompact ? 'text-[#1B2A4A]' : ''),
                                  ].filter(Boolean).join(' ')}
                                >
                                  {!isCompact && (
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-[#9B1B30] text-white group-hover:bg-[#7A1526] transition-colors">
                                      <sub.icon className="h-3.5 w-3.5" />
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div
                                      className={[
                                        'leading-tight transition-colors',
                                        isCompact
                                          ? 'text-[12px] font-medium truncate group-hover:text-[#9B1B30]'
                                          : 'text-[13px] font-semibold text-[#1B2A4A] group-hover:text-[#9B1B30]',
                                        subActive && isCompact ? 'text-[#9B1B30] font-semibold' : '',
                                        subActive && !isCompact ? 'text-[#9B1B30] font-bold' : '',
                                      ].filter(Boolean).join(' ')}
                                    >
                                      {sub.label}
                                    </div>
                                    {!isCompact && sub.desc && (
                                      <div className="mt-0.5 text-[11px] leading-snug text-[#4B5563] line-clamp-1">
                                        {sub.desc}
                                      </div>
                                    )}
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
