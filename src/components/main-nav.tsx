'use client';

import Link from 'next/link';
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
  BookOpen,
  Award,
  FileText,
  Info,
  MapPin,
  Globe,
  MessageCircle,
  Compass,
  Send,
  Mail,
  Phone,
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

  const cities = CITY_KEYS.map((slug) => ({
    slug,
    label: t(`nav.cities.${slug}`),
  }));
  const countries = TOP_COUNTRIES.map((slug) => ({
    slug,
    label: t(`nav.countries.${slug}`),
  }));

  const menuItems: MenuItem[] = [
    { type: 'link', href: '/', label: t('nav.home') },
    {
      type: 'menu',
      label: t('nav.universities'),
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
      type: 'menu',
      label: t('nav.programs'),
      sections: [
        {
          title: t('nav.programs'),
          items: [
            {
              href: '/programs',
              label: t('nav.programs.all'),
              desc: t('nav.programs.allDesc'),
              icon: BookOpen,
            },
          ],
        },
      ],
    },
    {
      type: 'menu',
      label: t('nav.scholarships'),
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
              href: '/contact',
              label: t('nav.about.contact'),
              desc: t('nav.about.contactDesc'),
              icon: MessageCircle,
            },
            {
              href: '/assessment',
              label: t('nav.admissions.applyNow'),
              desc: t('nav.admissions.applyNowDesc'),
              icon: Send,
            },
          ],
        },
      ],
    },
    {
      type: 'link',
      href: '/guides',
      label: t('nav.guides'),
    },
    {
      type: 'menu',
      label: t('nav.about'),
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
              href: '/',
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
    <NavigationMenu className="hidden lg:flex">
      <NavigationMenuList>
        {menuItems.map((item) =>
          item.type === 'link' ? (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink asChild>
                <Link
                  href={item.href!}
                  className="group inline-flex h-9 w-max items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-[#9B1B30] focus:text-[#9B1B30] focus:outline-none"
                >
                  {item.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ) : (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuTrigger className="group inline-flex h-9 w-max items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-[#9B1B30] focus:text-[#9B1B30] focus:outline-none data-[state=open]:text-[#9B1B30]">
                {item.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div
                  className={`grid gap-3 p-4 ${
                    (item.sections?.length ?? 0) > 1
                      ? 'w-[640px] md:grid-cols-2'
                      : 'w-[420px]'
                  } bg-white border-2 border-[#1B2A4A] shadow-2xl`}
                  style={{ borderRadius: 0 }}
                >
                  {item.sections?.map((section) => (
                    <div key={section.title}>
                      {/* Section title — only show when there are 2+ sections
                          and this isn't the first one (so the left column
                          shows the primary items without a redundant heading). */}
                      {(item.sections?.length ?? 0) > 1 && section !== item.sections![0] && (
                        <h3 className="mb-2 mt-1 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9B1B30]">
                          {section.title}
                        </h3>
                      )}
                      <ul className="space-y-1">
                        {section.items.map((sub) => (
                          <li key={sub.href}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={sub.href}
                                className="group flex select-none items-start gap-3 p-2 outline-none transition-colors hover:bg-[#FAFAF8]"
                              >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#1B2A4A] text-white">
                                  <sub.icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-semibold leading-tight text-[#1B2A4A] group-hover:text-[#9B1B30]">
                                    {sub.label}
                                  </div>
                                  {sub.desc && (
                                    <div className="mt-0.5 text-xs leading-snug text-[#4B5563] line-clamp-1">
                                      {sub.desc}
                                    </div>
                                  )}
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ),
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
