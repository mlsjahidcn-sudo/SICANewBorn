'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { type University, type Program } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  useEffect(() => {
    setUni(undefined);
    setNotFound(false);
    setPrograms([]);
    setProgramsLoading(true);
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
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Button className="bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold px-6">
                {t('cta.apply')}
              </Button>
              <Button
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 font-semibold px-6"
              >
                {t('uni.visitWebsite')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start border-b border-gray-200 bg-transparent h-auto p-0 gap-0 rounded-none">
            {['overview', 'admissions', 'scholarships', 'campusLife'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="relative rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-gray-500 data-[state=active]:border-[#9B1B30] data-[state=active]:text-[#9B1B30] data-[state=active]:shadow-none"
              >
                {t(`uni.${tab === 'campusLife' ? 'campusLife' : tab}`)}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                <div className="grid sm:grid-cols-3 gap-6">
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
                      href="#"
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
                    <Link
                      href="#"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#9B1B30] hover:underline"
                    >
                      {t('uni.viewFees')}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
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
                    <Link
                      href="#"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#9B1B30] hover:underline"
                    >
                      {t('uni.viewAdmissions')}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Accommodation */}
                <div className="rounded-none border border-gray-200 bg-white p-6">
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

                {/* Available Programs — pulled from the programs
                    table (linked via university_slug). Different
                    from uni.popularPrograms (the AI-generated
                    shortlist). Each row links to /programs/[slug]. */}
                <AvailableProgramsSection
                  programs={programs}
                  loading={programsLoading}
                  locale={locale}
                />
              </div>

              {/* Sidebar - Image Gallery */}
              <div className="space-y-4">
                {/* Featured Image */}
                <div className="overflow-hidden rounded-none relative h-56">
                  <Image
                    src={galleryImages[selectedImage]}
                    alt={`${locale === 'en' ? uni.name : uni.nameCn} campus`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-all duration-300"
                  />
                </div>
                {/* Thumbnails */}
                {galleryImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {galleryImages.slice(0, 4).map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative overflow-hidden rounded-none h-16 w-full ${
                          selectedImage === idx ? 'ring-2 ring-[#9B1B30]' : ''
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Campus view ${idx + 1}`}
                          fill
                          sizes="80px"
                          className="object-cover hover:opacity-80 transition-opacity"
                        />
                        {idx === 3 && galleryImages.length > 4 && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="text-white text-xs font-semibold">+{galleryImages.length - 4}</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                {/* Gallery Label */}
                {galleryImages.length > 0 && (
                  <p className="flex items-center gap-1.5 text-xs text-gray-500">
                    <ImageIcon className="h-3.5 w-3.5 text-[#1B2A4A]" />
                    {galleryImages.length} {locale === 'en' ? 'photos' : '张照片'}
                  </p>
                )}
                {/* SICA Support Card */}
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
                  <Button className="mt-3 w-full bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold text-sm">
                    {t('cta.apply')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          </TabsContent>

          {/* Admissions Tab */}
          <TabsContent value="admissions" className="mt-8">
            <div className="max-w-3xl space-y-6">
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

              {/* SICA Help */}
              <div className="rounded-none border-2 border-[#9B1B30]/25 bg-[#1B2A4A08] p-6">
                <h3 className="font-semibold text-[#1B2A4A]">
                  {locale === 'en' ? 'Need Help with Your Application?' : '需要申请帮助？'}
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {locale === 'en'
                    ? 'SICA counselors can help you prepare your documents, meet deadlines, and communicate with the university admissions office. Book a free consultation today.'
                    : 'SICA 顾问可以帮你准备文件、赶上截止日期、与大学招生办沟通。立即预约免费咨询。'}
                </p>
                <Button className="mt-4 bg-[#C41E3A] hover:bg-[#A3182F] text-white font-semibold">
                  {t('cta.contact')}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Scholarships Tab */}
          <TabsContent value="scholarships" className="mt-8">
            <div className="max-w-3xl space-y-6">
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
              ].map((scholarship) => (
                <div
                  key={scholarship.title}
                  className="rounded-none border border-gray-200 bg-white p-6"
                >
                  <h3 className="font-semibold text-[#1B2A4A]">{scholarship.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {scholarship.coverage}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    {locale === 'en' ? 'Deadline' : '截止日期'}: {scholarship.deadline}
                  </p>
                </div>
              ))}

              <div className="rounded-none border-2 border-[#9B1B30]/25 bg-[#1B2A4A08] p-6">
                <h3 className="font-semibold text-[#1B2A4A]">
                  {locale === 'en' ? 'Scholarship Application Support' : '奖学金申请支持'}
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {locale === 'en'
                    ? 'SICA has helped hundreds of students secure scholarships. Our counselors will identify the best options for you and assist with every step of the application.'
                    : 'SICA 已帮助数百名学生获得奖学金。我们的顾问将为你找到最佳选择并协助每一步申请。'}
                </p>
                <Button className="mt-4 bg-[#C41E3A] hover:bg-[#A3182F] text-white font-semibold">
                  {t('cta.contact')}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Campus Life Tab */}
          <TabsContent value="campusLife" className="mt-8">
            <div className="max-w-3xl space-y-6">
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
            </div>
          </TabsContent>
        </Tabs>
      </section>
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
