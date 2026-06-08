'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
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

export default function UniversityDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { t, locale } = useI18n();
  const [selectedImage, setSelectedImage] = useState(0);
  const [uni, setUni] = useState<University | undefined>(undefined);
  const [notFound, setNotFound] = useState(false);
  // Real programs from the programs table (linked via university_slug).
  // These are different from uni.popularPrograms (the AI-generated
  // string list) — these have their own detail pages at
  // /programs/[slug] and an admin-managed lifecycle.
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programsLoading, setProgramsLoading] = useState(true);
  // Related universities for the constant sidebar. Same-city
  // first, similar-rank tier as fallback. Computed once per
  // university load.
  const [related, setRelated] = useState<University[]>([]);

  useEffect(() => {
    setUni(undefined);
    setNotFound(false);
    setPrograms([]);
    setProgramsLoading(true);
    setRelated([]);

    // Fetch the target university first; we need its city + rank
    // to compute related-list, so this has to come before that.
    fetch(`/api/universities/${slug}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (data?.university) {
          setUni(data.university);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true));

    // Fetch programs linked to this university. The API supports
    // ?university=slug as a filter. We pull up to 50 — more than
    // enough for any single university (typical: 3-10 programs).
    fetch(`/api/programs?university=${encodeURIComponent(slug)}&limit=50`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.programs) setPrograms(data.programs);
      })
      .catch(() => {})
      .finally(() => setProgramsLoading(false));

    // Fetch a broad universities list (we need up to ~20 to choose
    // 5-6 related from). 100 is the API's default cap.
    fetch('/api/universities?limit=100')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const all: University[] = data?.universities ?? [];
        setRelated(pickRelated(all, slug, 6));
      })
      .catch(() => {});
  }, [slug]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center px-4">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">
          {locale === 'en' ? 'University not found' : '未找到该大学'}
        </h1>
        <p className="mt-2 text-gray-600 max-w-md">
          {locale === 'en'
            ? `We could not find a university with the slug "${slug}". It may have been removed, or the link is incorrect.`
            : `找不到 slug 为 "${slug}" 的大学。可能已被删除，或链接不正确。`}
        </p>
        <Link
          href="/universities"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#9B1B30] hover:bg-[#7A1526] text-white text-sm font-semibold uppercase tracking-wider transition-colors"
        >
          {locale === 'en' ? 'Browse all universities' : '浏览所有大学'}
        </Link>
      </div>
    );
  }

  if (!uni) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-gray-500">
          {locale === 'en' ? 'Loading…' : '加载中…'}
        </p>
      </div>
    );
  }

  // AI-generated universities can have null/undefined arrays for
  // highlights/tags/programs/etc. Normalize to safe arrays so .map()
  // never crashes — the page should always render, even on a
  // partially-filled row.
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
                  {locale === 'en' ? uni.city : uni.cityCn}, China
                </span>
                <span className="flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 fill-[#D4A853] text-[#D4A853]" />
                  QS World #{uni.qsWorldRanking}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 fill-[#D4A853] text-[#D4A853]" />
                  {uni.rating}
                </span>
              </div>
              {/* Classification Tags */}
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
              {/* Live countdown to the next application deadline. Now
                  the primary CTA in the hero (replaces the removed
                  Apply Now + Visit Website buttons). The user sees
                  the ticking urgency before they scroll for the
                  Apply button further down the page. The component
                  renders nothing if uni.applicationDeadline isn't
                  set — the admin should backfill the column. */}
              {uni.applicationDeadline && (
                <div className="w-full sm:w-80 lg:w-72">
                  <DeadlineCountdown
                    deadline={uni.applicationDeadline}
                    locale={locale}
                    label={
                      locale === 'en'
                        ? `${uni.name} · Application Deadline`
                        : `${uni.nameCn} · 申请截止`
                    }
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

          {/* Tabs share a 2-col grid + a constant sidebar so the
              right-rail (Related Universities + SICA CTA) stays
              visible on every tab, not just Overview. */}
          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Overview Tab */}
              <TabsContent value="overview">
                {/* About */}
                <div>
                  <h2 className="text-xl font-bold text-[#1B2A4A]">
                    {t('uni.about')} {locale === 'en' ? uni.name : uni.nameCn}
                  </h2>
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    {locale === 'en' ? uni.description : uni.descriptionCn}
                  </p>
                </div>

                {/* Key Stats */}
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

                {/* Quick Info Sections */}
                <div className="mt-6 grid sm:grid-cols-3 gap-6">
                  {/* Popular Programs */}
                  <div className="rounded-none border border-gray-200 bg-white p-5">
                    <h3 className="font-semibold text-[#1B2A4A] flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-[#1B2A4A]" />
                      {t('uni.popularPrograms')}
                    </h3>
                    <ul className="mt-3 space-y-1.5">
                      {popularPrograms.map(
                        (prog) => (
                          <li key={prog} className="text-sm text-gray-600 flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-[#9B1B30] shrink-0" />
                            {prog}
                          </li>
                        )
                      )}
                    </ul>
                    <Link
                      href={`/programs?university=${encodeURIComponent(slug)}`}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#9B1B30] hover:underline"
                    >
                      {t('uni.viewAll')}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  {/* Tuition Fees */}
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
                    {/* C2: removed 'View Fees' link. Was href="#"
                        (dead). There's no detailed fees section
                        to scroll to and no separate fees page —
                        the card already shows undergrad + grad
                        tuition inline. If we ever build a fees
                        detail block or page, this is where the
                        link should come back. */}
                  </div>

                  {/* Intake */}
                  <div className="rounded-none border border-gray-200 bg-white p-5">
                    <h3 className="font-semibold text-[#1B2A4A] flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#1B2A4A]" />
                      {t('uni.intake')}
                    </h3>
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                      {locale === 'en' ? uni.intake : uni.intakeCn}
                    </p>
                    {/* C2: was href="#". Intake is information-only
                        here (no detail page). The natural action is
                        to ask a counselor about admission timing for
                        this specific university. Send to /contact
                        with ?interest=<slug> so the form knows
                        which school the lead is asking about. */}
                    <Link
                      href={`/contact?interest=${encodeURIComponent(slug)}`}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#9B1B30] hover:underline"
                    >
                      {t('uni.viewAdmissions')}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Accommodation */}
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

                {/* Available Programs — real programs from the
                    programs table, not the AI shortlist. */}
                <AvailableProgramsSection
                  programs={programs}
                  loading={programsLoading}
                  locale={locale}
                />

                {/* Highlights */}
                {highlights.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-xl font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[#D4A853]" />
                      {locale === 'en' ? 'Highlights' : '亮点'}
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

          {/* Admissions Tab */}
          <TabsContent value="admissions" className="space-y-6">
            <div className="rounded-none border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-[#1B2A4A]">
                {locale === 'en' ? 'Admission Requirements' : '入学要求'}
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="font-medium text-[#1B2A4A]">
                    {locale === 'en' ? 'Undergraduate Programs' : '本科项目'}
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#9B1B30] shrink-0" />
                      {locale === 'en'
                        ? 'High school diploma or equivalent'
                        : '高中毕业证或同等学历'}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#9B1B30] shrink-0" />
                      {locale === 'en'
                        ? 'HSK 4 or above for Chinese-taught programs'
                        : '中文授课项目需 HSK 4 级及以上'}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#9B1B30] shrink-0" />
                      {locale === 'en'
                        ? 'IELTS 6.0 / TOEFL 80+ for English-taught programs'
                        : '英文授课项目需雅思 6.0 / 托福 80 分以上'}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#9B1B30] shrink-0" />
                      {locale === 'en'
                        ? 'Passport copy and application form'
                        : '护照复印件和申请表'}
                    </li>
                  </ul>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="font-medium text-[#1B2A4A]">
                    {locale === 'en' ? 'Graduate Programs' : '研究生项目'}
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#9B1B30] shrink-0" />
                      {locale === 'en'
                        ? "Bachelor's degree in a related field"
                        : '相关领域学士学位'}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#9B1B30] shrink-0" />
                      {locale === 'en'
                        ? 'HSK 5 or above for Chinese-taught programs'
                        : '中文授课项目需 HSK 5 级及以上'}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#9B1B30] shrink-0" />
                      {locale === 'en'
                        ? 'Two recommendation letters from professors'
                        : '两位教授的推荐信'}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#9B1B30] shrink-0" />
                      {locale === 'en'
                        ? 'Research proposal and academic transcripts'
                        : '研究计划和学术成绩单'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Scholarships Tab — university-specific.
              Top: programs at THIS university that offer scholarships
              (filtered from the programs table, by scholarshipAvailable).
              Middle: optional university-specific scholarshipInfo
              narrative. Bottom: the 4 general scholarship categories
              (CSC, provincial, university, Confucius) as background
              context — these aren't linked to specific universities
              in the data model. */}
          <TabsContent value="scholarships" className="space-y-6">
            <ScholarshipsTab
              uni={uni}
              programs={programs}
              locale={locale}
            />
          </TabsContent>

          {/* Campus Life Tab */}
          <TabsContent value="campusLife" className="space-y-6">
            {/* Campus Gallery Grid */}
            {galleryImages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#1B2A4A] flex items-center gap-2 mb-4">
                  <ImageIcon className="h-5 w-5 text-[#1B2A4A]" />
                  {locale === 'en' ? 'Campus Gallery' : '校园图集'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {galleryImages.slice(0, 4).map((img, idx) => (
                    <div key={idx} className="overflow-hidden rounded-none relative h-48">
                      <Image
                        src={img}
                        alt={`Campus view ${idx + 1}`}
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
                          alt={`Campus view ${idx + 5}`}
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
                {locale === 'en' ? 'Student Life' : '学生生活'}
              </h3>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                {locale === 'en'
                  ? `${uni.name} offers a vibrant campus experience with over 200 student organizations, modern sports facilities, international student associations, and cultural events throughout the year. The university provides on-campus housing for international students with options ranging from single rooms to shared apartments.`
                  : `${uni.nameCn}提供充满活力的校园体验，拥有200多个学生组织、现代化体育设施、国际学生协会和全年文化活动。大学为国际学生提供校内住宿，从单人间到合租公寓不等。`}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  title: locale === 'en' ? 'Dining' : '餐饮',
                  desc:
                    locale === 'en'
                      ? 'Multiple dining halls with halal, vegetarian, and international cuisine options'
                      : '多个餐厅提供清真、素食和国际美食选择',
                },
                {
                  title: locale === 'en' ? 'Sports' : '体育',
                  desc:
                    locale === 'en'
                      ? 'Gymnasiums, swimming pools, basketball courts, and running tracks'
                      : '体育馆、游泳池、篮球场和跑道',
                },
                {
                  title: locale === 'en' ? 'Libraries' : '图书馆',
                  desc:
                    locale === 'en'
                      ? 'Extensive collections with dedicated study spaces and 24/7 access during exams'
                      : '丰富的藏书，专用学习空间，考试期间24小时开放',
                },
                {
                  title: locale === 'en' ? 'Health Services' : '医疗服务',
                  desc:
                    locale === 'en'
                      ? 'On-campus medical center with international health insurance coverage'
                      : '校内医疗中心，国际医疗保险覆盖',
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

            {/* Constant right sidebar — same on every tab.
                Related Universidades (same city first, similar rank
                fallback) + SICA Support CTA. Sticky on desktop so
                it stays visible while the main column scrolls. */}
            <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 self-start">
              <RelatedUniversitiesSidebar
                related={related}
                locale={locale}
                currentSlug={slug}
              />
              {/* SICA Support Card — same CTA pattern the rest of
                  the site uses for "talk to a counselor" placements. */}
              <div className="rounded-none border-2 border-[#9B1B30]/25 bg-[#1B2A4A08] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-none bg-[#9B1B30] text-white text-xs font-bold">
                    S
                  </div>
                  <span className="text-sm font-semibold text-[#1B2A4A]">
                    {locale === 'en' ? 'SICA Application Support' : 'SICA 申请支持'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {locale === 'en'
                    ? 'Get personalized guidance from SICA counselors to apply to this university. We handle document prep, submission, and follow-up.'
                    : 'SICA 顾问为你提供个性化申请指导，从文件准备到提交跟进，全程协助。'}
                </p>
                {/* C1 (funnel audit): was a bare <Button> with no
                    href/onClick — clicks did nothing. Wrap in a
                    Link to /contact?interest=<slug> so the lead
                    lands on the contact form with the university
                    in the URL. Phase 25 (planned) will read the
                    ?interest param on the contact form and
                    pre-fill the subject/message. For now the
                    param shows up in sourcePage and in the
                    lead's URL when SICA's admin opens the row —
                    enough attribution to attribute conversions
                    to specific universities. */}
                <Link
                  href={`/contact?interest=${encodeURIComponent(slug)}`}
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
                  {locale === 'en' ? 'Or talk to a counselor' : '或联系顾问'}
                </Link>
              </div>
            </aside>
          </div>
        </Tabs>
      </section>

      {/* S37: reciprocal news widget — links this university page
          to recent SICA news posts that mention the university.
          Closes the catalog↔news interlinking loop that S36
          opened (post body already points to /universities/<slug>;
          this widget is the reverse). The widget does an
          on-mount fetch against /api/public/news-by-tag with
          multiple search terms (university name, slug tokens,
          slug without dashes) so a post tagged with "Tsinghua"
          matches even if the post body says "Tsinghua University". */}
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

      {/* Sticky "Apply" bar — once the user has scrolled past
          the hero on this long page, the primary CTA is
          otherwise lost above the fold. The bar reads the
          current university name + slug, labeles itself
          accordingly, and routes the Apply button into the
          /contact?interest=<slug> chain wired in Phase 24
          (so the contact form pre-fills the university). */}
      <StickyApplyBar
        universityName={locale === 'en' ? uni.name : uni.nameCn || uni.name}
        universitySlug={uni.slug}
      />
    </>
  );
}

/**
 * Pick N related universidades from a broad list. Strategy:
 *   1. Same city — strongest signal ("if you like X in Beijing,
 *      consider Y in Beijing too"). Most heavily weighted.
 *   2. Similar rank tier (within ±15 of the target's rank).
 *   3. Random fill from the rest if we don't have enough.
 *
 * The function never returns the target university itself. Pure
 * function — easy to unit-test if we want one later.
 */
function pickRelated(
  all: University[],
  currentSlug: string,
  limit: number,
): University[] {
  const others = all.filter((u) => u.slug !== currentSlug);
  const target = all.find((u) => u.slug === currentSlug);
  if (!target) {
    return others.slice(0, limit);
  }

  const sameCity = others.filter((u) => u.city === target.city);
  const similarRank = others.filter(
    (u) => u.city !== target.city && Math.abs((u.ranking ?? 999) - (target.ranking ?? 999)) <= 15,
  );
  const rest = others.filter(
    (u) => u.city !== target.city && Math.abs((u.ranking ?? 999) - (target.ranking ?? 999)) > 15,
  );

  // Shuffle the "rest" pool a bit so each page picks a different
  // mix when there are many ties. Static set so the result is
  // stable within a single page load (no hydration mismatches).
  const restShuffled = [...rest].sort((a, b) =>
    a.slug.localeCompare(b.slug) < 0 ? -1 : 1,
  );

  return [...sameCity, ...similarRank, ...restShuffled].slice(0, limit);
}

/**
 * Right-sidebar widget: a list of related universidades with
 * compact cards (logo + name + city + ranking badge). Each card
 * links to /universities/[slug]. Stays visible on every tab.
 */
function RelatedUniversitiesSidebar({
  related,
  locale,
  currentSlug,
}: {
  related: University[];
  locale: 'en' | 'zh';
  currentSlug: string;
}) {
  if (related.length === 0) return null;
  return (
    <div className="rounded-none border-2 border-gray-200 bg-white">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#1B2A4A] flex items-center gap-2">
          <Building2 className="h-4 w-4 text-[#9B1B30]" />
          {locale === 'en' ? 'Related Universities' : '相关院校'}
        </h3>
      </div>
      <ul className="divide-y divide-gray-100">
        {related.map((r) => {
          const isSameCity = r.city === currentSlug; // not used directly, but kept for future badge
          return (
            <li key={r.slug}>
              <Link
                href={`/universities/${r.slug}`}
                className="group flex items-center gap-3 p-3 hover:bg-[#FAFAF8] transition-colors"
              >
                {r.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
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
                        QS #{r.qsWorldRanking}
                      </span>
                    ) : null}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="px-4 py-3 border-t border-gray-200 bg-[#FAFAF8] text-center">
        <Link
          href="/universities"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#9B1B30] hover:underline"
        >
          {locale === 'en' ? 'Browse all universidades' : '浏览所有大学'}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

/**
 * Scholarships tab — university-specific.
 * Layout (top to bottom):
 *   1. Programs at this university that offer scholarships
 *      (filtered from `programs` by scholarshipAvailable === true).
 *      This is the most actionable info: "if you get into this
 *      program, you'll get a scholarship."
 *   2. Optional university-specific scholarshipInfo narrative
 *      (only shown when the field is populated — falls back to
 *      generic SICA-services copy otherwise).
 *   3. The 4 general scholarship categories (CSC, provincial,
 *      university, Confucius) as background context. These aren't
 *      linked to specific universities in the data model — the
 *      full guide at /guides/scholarships has the details.
 */
function ScholarshipsTab({
  uni,
  programs,
  locale,
}: {
  uni: University;
  programs: Program[];
  locale: 'en' | 'zh';
}) {
  const scholarshipPrograms = programs.filter((p) => p.scholarshipAvailable);
  const uniInfo = locale === 'en' ? uni.scholarshipInfo : uni.scholarshipInfoCn;

  return (
    <>
      {/* 1. University-specific: programs with scholarships */}
      <div>
        <h3 className="text-lg font-semibold text-[#1B2A4A] flex items-center gap-2 mb-3">
          <Award className="h-5 w-5 text-[#D4A853]" />
          {locale === 'en'
            ? `Scholarships at ${uni.name}`
            : `${uni.nameCn} 奖学金项目`}
        </h3>
        {scholarshipPrograms.length > 0 ? (
          <div className="rounded-none border-2 border-[#D4A853]/30 bg-[#D4A853]/5 p-4 sm:p-5">
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              {locale === 'en'
                ? `The following ${scholarshipPrograms.length} program${scholarshipPrograms.length === 1 ? '' : 's'} at ${uni.name} offer scholarship funding. Apply early — scholarship slots fill quickly.`
                : `${uni.nameCn} 以下 ${scholarshipPrograms.length} 个项目提供奖学金资助。请尽早申请——奖学金名额有限。`}
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
              {locale === 'en' ? 'View all programs at this university' : '查看本校所有项目'}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="rounded-none border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-600 leading-relaxed">
              {locale === 'en'
                ? `Scholarship availability for individual programs at ${uni.name} is being updated. Check back soon, or browse all ${uni.name} programs to see current offerings.`
                : `${uni.nameCn} 各项目的奖学金信息正在更新中。稍后查看，或浏览所有项目了解最新信息。`}
            </p>
            <Link
              href={`/programs?university=${encodeURIComponent(uni.slug)}`}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#9B1B30] hover:underline"
            >
              {locale === 'en' ? 'View all programs' : '查看所有项目'}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>

      {/* 2. Optional university-specific scholarshipInfo narrative */}
      {uniInfo && (
        <div className="rounded-none border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-[#1B2A4A] flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-[#9B1B30]" />
            {locale === 'en' ? 'About scholarships at this university' : '关于本校奖学金'}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">{uniInfo}</p>
        </div>
      )}

      {/* 3. General scholarship categories (background context).
          The full guide at /guides/scholarships has the details;
          this is just a quick reference. */}
      <div>
        <h3 className="text-lg font-semibold text-[#1B2A4A] flex items-center gap-2 mb-3">
          <BookOpen className="h-5 w-5 text-[#1B2A4A]" />
          {locale === 'en'
            ? 'General scholarships available in China'
            : '中国通用奖学金类别'}
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              title: locale === 'en' ? 'Chinese Government Scholarship (CSC)' : '中国政府奖学金 (CSC)',
              coverage:
                locale === 'en'
                  ? 'Full tuition, accommodation, stipend (¥2,500-3,500/month), and medical insurance'
                  : '全额学费、住宿、生活费（¥2,500-3,500/月）和医疗保险',
              deadline: locale === 'en' ? 'January - April annually' : '每年1月至4月',
            },
            {
              title: locale === 'en' ? 'Provincial Government Scholarship' : '省级政府奖学金',
              coverage:
                locale === 'en'
                  ? 'Partial or full tuition waiver, varies by province'
                  : '部分或全额学费减免，因省而异',
              deadline: locale === 'en' ? 'March - May annually' : '每年3月至5月',
            },
            {
              title: locale === 'en' ? 'University Scholarship' : '大学奖学金',
              coverage:
                locale === 'en'
                  ? 'Tuition waiver (partial or full) based on academic merit'
                  : '根据学术成绩减免学费（部分或全额）',
              deadline: locale === 'en' ? 'Rolling with application' : '随申请滚动',
            },
            {
              title: locale === 'en' ? 'Confucius Institute Scholarship' : '孔子学院奖学金',
              coverage:
                locale === 'en'
                  ? 'Full scholarship for Chinese language study programs'
                  : '中文学习项目全额奖学金',
              deadline: locale === 'en' ? 'February - April annually' : '每年2月至4月',
            },
          ].map((s) => (
            <div
              key={s.title}
              className="rounded-none border border-gray-200 bg-white p-4"
            >
              <h4 className="font-semibold text-sm text-[#1B2A4A]">{s.title}</h4>
              <p className="mt-1.5 text-xs text-gray-600 leading-relaxed">{s.coverage}</p>
              <p className="mt-1.5 text-[10px] text-gray-400 uppercase tracking-wider">
                {locale === 'en' ? 'Deadline' : '截止日期'}: {s.deadline}
              </p>
            </div>
          ))}
        </div>
        <Link
          href="/guides/scholarships"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#9B1B30] hover:underline"
        >
          {locale === 'en' ? 'Read the full scholarships guide' : '阅读完整奖学金指南'}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </>
  );
}

/**
 * Programs offered by this university, fetched from the programs
 * table (admin-managed, with their own detail pages at
 * /programs/[slug]). Distinct from uni.popularPrograms which is an
 * AI-generated shortlist of string labels stored on the university
 * itself — these are the real, citable, linkable programs.
 */
function AvailableProgramsSection({
  programs,
  loading,
  locale,
}: {
  programs: Program[];
  loading: boolean;
  locale: 'en' | 'zh';
}) {
  // Don't render the section at all while loading — saves vertical
  // space and avoids a flicker. If we end up with no programs, we
  // also skip the section (an empty "Available Programs" header
  // with no rows is noise).
  if (loading) {
    return (
      <div className="rounded-none border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#1B2A4A]" />
          {locale === 'en' ? 'Available Programs' : '可申请项目'}
        </h2>
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <span className="inline-block h-3 w-3 border-2 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
          {locale === 'en' ? 'Loading programs…' : '正在加载项目…'}
        </div>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="rounded-none border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#1B2A4A]" />
          {locale === 'en' ? 'Available Programs' : '可申请项目'}
        </h2>
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
          {locale === 'en'
            ? 'Program listings for this university are being curated. Check back soon, or contact a SICA counselor for current offerings.'
            : '本校的项目信息正在整理中。稍后再来查看，或联系 SICA 顾问了解最新项目。'}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-none border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-[#1B2A4A]" />
          {locale === 'en' ? 'Available Programs' : '可申请项目'}
        </h2>
        <span className="text-xs font-semibold text-[#1B2A4A] bg-[#1B2A4A]/10 px-2 py-1">
          {programs.length} {locale === 'en' ? (programs.length === 1 ? 'program' : 'programs') : '个项目'}
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
                    {locale === 'en' ? 'Scholarship' : '奖学金'}
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
          {locale === 'en' ? 'View all programs' : '查看全部项目'} <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
