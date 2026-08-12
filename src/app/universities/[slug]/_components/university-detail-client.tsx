'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { type University, type Program } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RelatedNews } from '@/components/RelatedNews';
import {
  MapPin,
  Star,
  Calendar,
  Users,
  Globe,
  Building2,
  GraduationCap,
  Award,
  BookOpen,
  DollarSign,
  Clock,
  ArrowRight,
  ChevronRight,
  Home,
  Sparkles,
  Handshake,
  PartyPopper,
  Trophy,
  Image as ImageIcon,
} from 'lucide-react';

import UniversityLogo from '@/components/university-logo';
import { DeadlineCountdown } from '@/components/deadline-countdown';
import { StickyApplyBar } from '@/components/StickyApplyBar';
import { VideoTestimonials } from '@/components/VideoTestimonials';
import { GetStartedCta } from '@/components/GetStartedCta';
import { track } from '@/lib/analytics';

interface UniversityDetailClientProps {
  university: University;
  programs: Program[];
  related: University[];
}

export default function UniversityDetailClient({
  university: uni,
  programs,
  related,
}: UniversityDetailClientProps) {
  const { t, locale } = useI18n();
  const [selectedImage, setSelectedImage] = useState(0);
  const slug = uni.slug;

  const safeArray = <T,>(v: T[] | null | undefined): T[] =>
    Array.isArray(v) ? v : [];
  const highlights = safeArray(
    locale === 'en' ? uni.highlights?.en : uni.highlights?.zh,
  );
  const tags = safeArray(locale === 'en' ? uni.tags : uni.tagsCn);
  const popularPrograms = safeArray(
    locale === 'en' ? uni.popularPrograms : uni.popularProgramsCn,
  );
  const accommodationTypes = safeArray(
    locale === 'en' ? uni.accommodationTypes : uni.accommodationTypesCn,
  );
  const highlightIcons = [Sparkles, Building2, Handshake, PartyPopper];
  const galleryImages =
    safeArray(uni.gallery).length > 0 ? safeArray(uni.gallery) : uni.image ? [uni.image] : [];

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#9B1B30] transition-colors">
              {t('nav.home')}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/universities" className="hover:text-[#9B1B30] transition-colors">
              {t('nav.universities')}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#1B2A4A] font-medium">
              {locale === 'en' ? uni.name : uni.nameCn}
            </span>
          </nav>
        </div>
      </div>

      {/* University Banner */}
      <section className="relative overflow-hidden bg-[#1B2A4A]">
        <div
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{ backgroundImage: `url(${uni.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1B2A4A] via-[#1B2A4A]/80 to-[#1B2A4A]/50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-start gap-6">
            <UniversityLogo src={uni.logo} variant="detail" />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                {locale === 'en' ? uni.name : uni.nameCn}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {locale === 'en' ? uni.city : uni.cityCn}, {t('common.china')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 fill-[#D4A853] text-[#D4A853]" />
                  {t('uni.qsWorldRankingValue', { ranking: uni.qsWorldRanking })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-[#D4A853] text-[#D4A853]" />
                  {uni.rating}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-none border border-white/30 bg-white/10 text-white"
                  >
                    <Award className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full lg:w-auto">
              {uni.applicationDeadline && (
                <div className="w-full sm:w-80 lg:w-72">
                  <DeadlineCountdown
                    deadline={uni.applicationDeadline}
                    locale={locale}
                    label={t('uni.applicationDeadlineLabel', {
                      name: locale === 'en' ? uni.name : uni.nameCn || uni.name,
                    })}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start border-b border-gray-200 bg-transparent h-auto p-0 gap-0 rounded-none overflow-x-auto overflow-y-hidden">
            {['overview', 'admissions', 'scholarships', 'campusLife'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="relative rounded-none border-b-2 border-transparent px-3 py-2.5 sm:px-4 sm:py-3 text-sm font-medium text-gray-500 whitespace-nowrap data-[state=active]:border-[#9B1B30] data-[state=active]:text-[#9B1B30] data-[state=active]:shadow-none"
              >
                {t(`uni.${tab === 'campusLife' ? 'campusLife' : tab}`)}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-8">
              <TabsContent value="overview">
                <div>
                  <h2 className="text-xl font-bold text-[#1B2A4A]">
                    {t('uni.about')} {locale === 'en' ? uni.name : uni.nameCn}
                  </h2>
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    {locale === 'en' ? uni.description : uni.descriptionCn}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: Calendar, label: t('uni.established'), value: String(uni.established) },
                    { icon: Building2, label: t('uni.type'), value: locale === 'en' ? uni.type : uni.typeCn },
                    { icon: Users, label: t('uni.students'), value: uni.students },
                    { icon: Globe, label: t('uni.intlStudents'), value: uni.intlStudents },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-none border border-gray-200 bg-white p-4 text-center"
                    >
                      <stat.icon className="mx-auto h-5 w-5 text-[#1B2A4A]" />
                      <p className="mt-2 text-lg font-bold text-[#1B2A4A]">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid sm:grid-cols-3 gap-6">
                  <div className="rounded-none border border-gray-200 bg-white p-5">
                    <h3 className="font-semibold text-[#1B2A4A] flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-[#1B2A4A]" />
                      {t('uni.popularPrograms')}
                    </h3>
                    <ul className="mt-3 space-y-1.5">
                      {popularPrograms.map((prog) => (
                        <li key={prog} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-[#9B1B30] shrink-0" />
                          {prog}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/programs?university=${encodeURIComponent(slug)}`}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#9B1B30] hover:underline"
                    >
                      {t('uni.viewAll')}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  <div className="rounded-none border border-gray-200 bg-white p-5">
                    <h3 className="font-semibold text-[#1B2A4A] flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-[#1B2A4A]" />
                      {t('uni.tuitionFees')}
                    </h3>
                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-xs text-gray-500">{t('uni.undergrad')}</p>
                        <p className="text-sm font-semibold text-[#1B2A4A]">{uni.tuitionUndergrad}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{t('uni.graduate')}</p>
                        <p className="text-sm font-semibold text-[#1B2A4A]">{uni.tuitionGraduate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-none border border-gray-200 bg-white p-5">
                    <h3 className="font-semibold text-[#1B2A4A] flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#1B2A4A]" />
                      {t('uni.intake')}
                    </h3>
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                      {locale === 'en' ? uni.intake : uni.intakeCn}
                    </p>
                    <Link
                      href={`/contact?interest=${encodeURIComponent(slug)}`}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#9B1B30] hover:underline"
                    >
                      {t('uni.viewAdmissions')}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                <div className="mt-6 rounded-none border border-gray-200 bg-white p-6">
                  <h2 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2">
                    <Home className="h-5 w-5 text-[#1B2A4A]" />
                    {t('uni.accommodation')}
                  </h2>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                    {locale === 'en' ? uni.accommodation : uni.accommodationCn}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 rounded-none border border-gray-200 bg-[#FAFAF8] px-4 py-2.5">
                      <DollarSign className="h-4 w-4 text-[#1B2A4A]" />
                      <div>
                        <p className="text-xs text-gray-500">{t('uni.estimatedCost')}</p>
                        <p className="text-sm font-bold text-[#1B2A4A]">
                          {locale === 'en' ? uni.accommodationCost : uni.accommodationCostCn}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-[#1B2A4A] mb-2">{t('uni.roomTypes')}</p>
                    <div className="flex flex-wrap gap-2">
                      {accommodationTypes.map((type) => (
                        <span
                          key={type}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-none border border-[#1B2A4A]/15 bg-[#1B2A4A]/5 text-[#1B2A4A]"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <AvailableProgramsSection programs={programs} locale={locale} />

                {highlights.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-xl font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#D4A853]" />
                      {t('uni.highlights')}
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {highlights.map((item, i) => {
                        const Icon = highlightIcons[i % highlightIcons.length];
                        return (
                          <div
                            key={item}
                            className="flex items-center gap-3 rounded-none border border-gray-200 bg-white p-4"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-[#1B2A4A15]">
                              <Icon className="h-5 w-5 text-[#1B2A4A]" />
                            </div>
                            <span className="text-sm font-medium text-[#1B2A4A]">{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="admissions" className="space-y-6">
                <div className="rounded-none border border-gray-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-[#1B2A4A]">
                    {t('uni.admissionRequirements')}
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="font-medium text-[#1B2A4A]">
                        {t('uni.undergradPrograms')}
                      </h4>
                      <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#9B1B30] shrink-0" />
                          {t('uni.admissionHsDiploma')}
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#9B1B30] shrink-0" />
                          {t('uni.admissionHsk4')}
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#9B1B30] shrink-0" />
                          {t('uni.admissionEnglish')}
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#9B1B30] shrink-0" />
                          {t('uni.admissionPassport')}
                        </li>
                      </ul>
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                      <h4 className="font-medium text-[#1B2A4A]">
                        {t('uni.graduatePrograms')}
                      </h4>
                      <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#9B1B30] shrink-0" />
                          {t('uni.admissionBachelor')}
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#9B1B30] shrink-0" />
                          {t('uni.admissionHsk5')}
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#9B1B30] shrink-0" />
                          {t('uni.admissionRecommendations')}
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#9B1B30] shrink-0" />
                          {t('uni.admissionResearch')}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="scholarships" className="space-y-6">
                <ScholarshipsTab uni={uni} programs={programs} locale={locale} />
              </TabsContent>

              <TabsContent value="campusLife" className="space-y-6">
                {galleryImages.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#1B2A4A] flex items-center gap-2 mb-4">
                      <ImageIcon className="h-5 w-5 text-[#1B2A4A]" />
                      {t('uni.campusGallery')}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {galleryImages.slice(0, 4).map((img, idx) => (
                        <div key={idx} className="overflow-hidden rounded-none relative h-48">
                          <Image
                            src={img}
                            alt={t('uni.campusViewAlt', { n: idx + 1 })}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                    {galleryImages.length > 4 && (
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {galleryImages.slice(4).map((img, idx) => (
                          <div key={idx} className="overflow-hidden rounded-none">
                            <img
                              src={img}
                              alt={t('uni.campusViewAlt', { n: idx + 5 })}
                              className="h-24 w-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="rounded-none border border-gray-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-[#1B2A4A]">
                    {t('uni.studentLife')}
                  </h3>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                    {t('uni.studentLifeDesc', { name: locale === 'en' ? uni.name : uni.nameCn || uni.name })}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: t('uni.dining'),
                      desc: t('uni.diningDesc'),
                    },
                    {
                      title: t('uni.sports'),
                      desc: t('uni.sportsDesc'),
                    },
                    {
                      title: t('uni.libraries'),
                      desc: t('uni.librariesDesc'),
                    },
                    {
                      title: t('uni.healthServices'),
                      desc: t('uni.healthServicesDesc'),
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-none border border-gray-200 bg-white p-5"
                    >
                      <h4 className="font-medium text-[#1B2A4A]">{item.title}</h4>
                      <p className="mt-1.5 text-sm text-gray-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </div>

            <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 self-start">
              <RelatedUniversitiesSidebar related={related} locale={locale} currentSlug={slug} />
              <div className="rounded-none border-2 border-[#9B1B30]/25 bg-[#1B2A4A08] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-none bg-[#9B1B30] text-white text-xs font-bold">
                    S
                  </div>
                  <span className="text-sm font-semibold text-[#1B2A4A]">
                    {t('uni.sicaSupportTitle')}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {t('uni.sicaSupportDesc')}
                </p>
                <Link
                  href={`/assessment?interest=${encodeURIComponent(slug)}&interestName=${encodeURIComponent(locale === 'en' ? uni.name : uni.nameCn || uni.name)}`}
                  onClick={() => {
                    track('apply_click', {
                      location: 'support_card',
                      locale,
                      slug,
                    });
                  }}
                  className="block"
                >
                  <Button className="mt-3 w-full bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold text-sm">
                    {t('cta.apply')}
                  </Button>
                </Link>
                <Link
                  href="/contact"
                  className="mt-2 block text-center text-xs font-semibold text-[#9B1B30] hover:underline"
                >
                  {t('uni.orTalkToCounselor')}
                </Link>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563] mb-2">
                    {t('productCompare.rowWhoApplies')}
                  </p>
                  <Link
                    href={`/resources?university=${encodeURIComponent(slug)}`}
                    onClick={() => {
                      track('apply_click', {
                        location: 'support_card_diy',
                        locale,
                        slug,
                      });
                    }}
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-[#1B2A4A] text-[#1B2A4A] hover:bg-[#1B2A4A] hover:text-white font-semibold text-sm"
                    >
                      {t('product.selfServe.ctaLabel')} →
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 text-center">
                  <GetStartedCta
                    variant="inline"
                    location="university_detail_support_card"
                    university={slug}
                  />
                </div>
              </div>
            </aside>
          </div>
        </Tabs>
      </section>

      <VideoTestimonials
        universityName={locale === 'en' ? uni.name : uni.nameCn || uni.name}
        location="university"
      />

      <div className="bg-[#FAFAF8] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RelatedNews
            label={uni.name}
            terms={[
              uni.name,
              uni.slug,
              uni.slug.replace(/-/g, ' '),
            ].join(', ')}
            category="university"
            locale={locale as 'en' | 'zh'}
          />
        </div>
      </div>

      <StickyApplyBar
        universityName={locale === 'en' ? uni.name : uni.nameCn || uni.name}
        universitySlug={uni.slug}
      />
    </>
  );
}

function RelatedUniversitiesSidebar({
  related,
  locale,
  currentSlug,
}: {
  related: University[];
  locale: 'en' | 'zh';
  currentSlug: string;
}) {
  const { t } = useI18n();
  if (related.length === 0) return null;
  return (
    <div className="rounded-none border-2 border-gray-200 bg-white">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#1B2A4A] flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#9B1B30]" />
          {t('uni.relatedUniversities')}
        </h3>
      </div>
      <ul className="divide-y divide-gray-100">
        {related.map((r) => (
          <li key={r.slug}>
            <Link
              href={`/universities/${r.slug}`}
              className="group flex items-center gap-3 p-3 hover:bg-[#FAFAF8] transition-colors"
            >
              {r.logo ? (
                <img
                  src={r.logo}
                  alt={r.name}
                  className="w-10 h-10 object-contain bg-[#FAFAF8] border border-gray-200 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 bg-[#1B2A4A]/10 border border-gray-200 shrink-0 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-[#1B2A4A]" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors truncate">
                  {locale === 'en' ? r.name : r.nameCn}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {locale === 'en' ? r.city : r.cityCn}
                  </span>
                  {r.qsWorldRanking ? (
                    <span className="text-[#1B2A4A] font-semibold ml-auto shrink-0">
                      {t('uni.qsWorldRankingValue', { ranking: r.qsWorldRanking })}
                    </span>
                  ) : null}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <div className="px-4 py-3 border-t border-gray-200 bg-[#FAFAF8] text-center">
        <Link
          href="/universities"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#9B1B30] hover:underline"
        >
          {t('uni.browseAll')}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function ScholarshipsTab({
  uni,
  programs,
  locale,
}: {
  uni: University;
  programs: Program[];
  locale: 'en' | 'zh';
}) {
  const { t } = useI18n();
  const scholarshipPrograms = programs.filter((p) => p.scholarshipAvailable);
  const uniInfo = locale === 'en' ? uni.scholarshipInfo : uni.scholarshipInfoCn;
  const uniName = locale === 'en' ? uni.name : uni.nameCn || uni.name;

  return (
    <>
      <div>
        <h3 className="text-lg font-semibold text-[#1B2A4A] flex items-center gap-2 mb-3">
          <Award className="h-5 w-5 text-[#D4A853]" />
          {t('uni.scholarshipsAt', { name: uniName })}
        </h3>
        {scholarshipPrograms.length > 0 ? (
          <div className="rounded-none border-2 border-[#D4A853]/30 bg-[#D4A853]/5 p-4 sm:p-5">
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              {t('uni.scholarshipProgramsDesc', {
                count: scholarshipPrograms.length,
                programLabel: t(scholarshipPrograms.length === 1 ? 'uni.scholarshipProgramSingular' : 'uni.scholarshipProgramPlural'),
                name: uniName,
              })}
            </p>
            <ul className="space-y-2">
              {scholarshipPrograms.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/programs/${p.slug}`}
                    className="group flex items-center gap-3 bg-white border border-[#D4A853]/30 hover:border-[#9B1B30] p-3 transition-colors"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#D4A853]/15 border border-[#D4A853]/40">
                      <Award className="h-4 w-4 text-[#D4A853]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors">
                        {locale === 'en' ? p.name : p.nameCn}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {p.degree}
                        {p.discipline ? ` · ${locale === 'en' ? p.discipline : p.disciplineCn}` : ''}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#9B1B30] transition-colors shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={`/programs?university=${encodeURIComponent(uni.slug)}`}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#9B1B30] hover:underline"
            >
              {t('uni.viewAllProgramsAtUniversity')}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="rounded-none border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-600 leading-relaxed">
              {t('uni.noScholarshipPrograms', { name: uniName })}
            </p>
            <Link
              href={`/programs?university=${encodeURIComponent(uni.slug)}`}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#9B1B30] hover:underline"
            >
              {t('uni.viewAllPrograms')}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>

      {uniInfo && (
        <div className="rounded-none border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-[#1B2A4A] flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-[#9B1B30]" />
            {t('uni.aboutScholarships')}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">{uniInfo}</p>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-[#1B2A4A] flex items-center gap-2 mb-3">
          <BookOpen className="h-5 w-5 text-[#1B2A4A]" />
          {t('uni.generalScholarships')}
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              title: t('uni.scholarshipCsc'),
              coverage: t('uni.scholarshipCscCoverage'),
              deadline: t('uni.scholarshipCscDeadline'),
            },
            {
              title: t('uni.scholarshipProvincial'),
              coverage: t('uni.scholarshipProvincialCoverage'),
              deadline: t('uni.scholarshipProvincialDeadline'),
            },
            {
              title: t('uni.scholarshipUniversity'),
              coverage: t('uni.scholarshipUniversityCoverage'),
              deadline: t('uni.scholarshipUniversityDeadline'),
            },
            {
              title: t('uni.scholarshipConfucius'),
              coverage: t('uni.scholarshipConfuciusCoverage'),
              deadline: t('uni.scholarshipConfuciusDeadline'),
            },
          ].map((s) => (
            <div
              key={s.title}
              className="rounded-none border border-gray-200 bg-white p-4"
            >
              <h4 className="font-semibold text-sm text-[#1B2A4A]">{s.title}</h4>
              <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">{s.coverage}</p>
              <p className="mt-1.5 text-[10px] text-gray-400 uppercase tracking-wider">
                {t('uni.scholDeadlineLabel')}: {s.deadline}
              </p>
            </div>
          ))}
        </div>
        <Link
          href="/guides/scholarships"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#9B1B30] hover:underline"
        >
          {t('uni.fullScholarshipsGuide')}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </>
  );
}

function AvailableProgramsSection({
  programs,
  locale,
}: {
  programs: Program[];
  locale: 'en' | 'zh';
}) {
  const { t } = useI18n();
  if (programs.length === 0) {
    return (
      <div className="rounded-none border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#1B2A4A]" />
          {t('uni.availablePrograms')}
        </h2>
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
          {t('uni.noProgramsMessage')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-none border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#1B2A4A]" />
          {t('uni.availablePrograms')}
        </h2>
        <span className="text-xs font-semibold text-[#1B2A4A] bg-[#1B2A4A]/10 px-2 py-1">
          {t('uni.programCountLabel', {
            count: programs.length,
            label: t(programs.length === 1 ? 'uni.programCountSingular' : 'uni.programCountPlural'),
          })}
        </span>
      </div>
      <div className="space-y-3">
        {programs.map((p) => (
          <Link
            key={p.slug}
            href={`/programs/${p.slug}`}
            className="group block rounded-none border border-gray-200 hover:border-[#9B1B30] bg-[#FAFAF8] hover:bg-white p-4 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors">
                  {locale === 'en' ? p.name : p.nameCn}
                </h3>
                {(p.discipline || p.disciplineCn) && (
                  <p className="text-xs text-[#4B5563] mt-0.5">
                    {locale === 'en' ? p.discipline : p.disciplineCn}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {p.degree && (
                  <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-[#9B1B30] text-white px-2 py-1">
                    {p.degree}
                  </span>
                )}
                {p.scholarshipAvailable && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#D4A853] border border-[#D4A853]/40 bg-[#D4A853]/10 px-1.5 py-0.5">
                    <Award className="h-2.5 w-2.5" />
                    {t('uni.scholarshipBadge')}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#4B5563]">
              {p.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {locale === 'en' ? p.duration : p.durationCn}
                </span>
              )}
              {p.language && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {p.language}
                </span>
              )}
              {p.tuition && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {p.tuition}
                </span>
              )}
              {p.intake && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {locale === 'en' ? p.intake : p.intakeCn}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Link
          href={`/programs?university=${encodeURIComponent(programs[0]?.universitySlug ?? '')}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#9B1B30] hover:underline"
        >
          {t('uni.viewAllPrograms')} <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
