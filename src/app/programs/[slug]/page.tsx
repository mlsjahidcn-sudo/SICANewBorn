'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { programs as staticPrograms, universities as staticUniversities, degreeTypes, degreeTypesCn, languages, languagesCn, type Program, type University } from '@/lib/data';
import { ChevronRight, Clock, Banknote, GraduationCap, Globe, Award, BookOpen, CheckCircle, ArrowRight, MapPin } from 'lucide-react';
import UniversityLogo from '@/components/university-logo';
import { RelatedNews } from '@/components/RelatedNews';

type TabKey = 'overview' | 'requirements' | 'curriculum' | 'tuition';
type LoadState = 'loading' | 'ok' | 'not-found' | 'error';

export default function ProgramDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [program, setProgram] = useState<Program | null>(null);
  const [university, setUniversity] = useState<University | null>(null);
  const [state, setState] = useState<LoadState>('loading');

  // Fetch the program from the live API on mount / slug change. Falls
  // back to the static data row if the API is unreachable (e.g. dev
  // mode without Supabase configured) or returns 404. Admin-imported
  // programs that don't exist in data.ts will resolve correctly here
  // because the API hits the programs table directly.
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setState('loading');
    setProgram(null);
    setUniversity(null);

    (async () => {
      try {
        const res = await fetch(`/api/programs/${encodeURIComponent(slug)}`);
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          const fetchedProgram: Program | null = data.program ?? null;
          if (!fetchedProgram) {
            setState('not-found');
            return;
          }
          setProgram(fetchedProgram);

          // Resolve the university. Use the API for the same
          // reason (newly-added AI-generated universities may
          // not be in static data.ts).
          if (fetchedProgram.universitySlug) {
            try {
              const uniRes = await fetch(
                `/api/universities/${encodeURIComponent(fetchedProgram.universitySlug)}`,
              );
              if (uniRes.ok) {
                const uniData = await uniRes.json();
                if (uniData.university) setUniversity(uniData.university);
              } else {
                // 404 from API → try static fallback
                const fallback = staticUniversities.find(
                  (u) => u.slug === fetchedProgram.universitySlug,
                );
                if (fallback) setUniversity(fallback);
              }
            } catch {
              // ignore uni fetch error — sidebar will simply omit the card
            }
          }
          setState('ok');
        } else if (res.status === 404) {
          // Program not in DB. Try static fallback for pre-seeded
          // programs, else 404.
          const fallback = staticPrograms.find((p) => p.slug === slug);
          if (fallback) {
            setProgram(fallback);
            const u = staticUniversities.find(
              (uni) => uni.slug === fallback.universitySlug,
            );
            if (u) setUniversity(u);
            setState('ok');
          } else {
            setState('not-found');
          }
        } else {
          setState('error');
        }
      } catch {
        // Network error / API unreachable — try static fallback
        if (cancelled) return;
        const fallback = staticPrograms.find((p) => p.slug === slug);
        if (fallback) {
          setProgram(fallback);
          const u = staticUniversities.find(
            (uni) => uni.slug === fallback.universitySlug,
          );
          if (u) setUniversity(u);
          setState('ok');
        } else {
          setState('not-found');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (state === 'loading') {
    return (
      <main className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <span className="inline-block h-4 w-4 border-2 border-[#1B2A4A] border-t-transparent rounded-full animate-spin" />
          {locale === 'en' ? 'Loading program…' : '正在加载项目…'}
        </div>
      </main>
    );
  }

  if (state === 'not-found' || !program) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">
            {locale === 'en' ? 'Program not found' : '未找到该项目'}
          </p>
          <Link
            href="/programs"
            className="text-sm text-[#9B1B30] hover:underline"
          >
            {locale === 'en' ? '← Back to all programs' : '← 返回项目列表'}
          </Link>
        </div>
      </main>
    );
  }

  if (state === 'error') {
    return (
      <main className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">
            {locale === 'en'
              ? 'Failed to load this program. Please try again later.'
              : '加载该项目失败，请稍后重试。'}
          </p>
          <Link
            href="/programs"
            className="text-sm text-[#9B1B30] hover:underline"
          >
            {locale === 'en' ? '← Back to all programs' : '← 返回项目列表'}
          </Link>
        </div>
      </main>
    );
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: t('prog.overview') },
    { key: 'requirements', label: t('prog.requirements') },
    { key: 'curriculum', label: t('prog.curriculum') },
    { key: 'tuition', label: t('prog.tuitionFees') },
  ];

  const degreeColor = (degree: string) => {
    switch (degree) {
      case 'Bachelor': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Master': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'PhD': return 'bg-amber-50 text-amber-800 border-amber-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#9B1B30] transition-colors">
              {locale === 'en' ? 'Home' : '首页'}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/programs" className="hover:text-[#9B1B30] transition-colors">
              {t('prog.title')}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#1B2A4A] font-medium truncate">
              {locale === 'zh' ? program.nameCn : program.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Program Header */}
      <section className="bg-[#1B2A4A] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              {/* Degree + Language badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`inline-block border px-3 py-1 text-xs font-semibold ${degreeColor(program.degree)}`}>
                  {locale === 'zh'
                    ? degreeTypesCn[degreeTypes.indexOf(program.degree)]
                    : program.degree}
                </span>
                <span className="inline-flex items-center gap-1 border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white">
                  <Globe className="h-3.5 w-3.5" />
                  {locale === 'zh'
                    ? languagesCn[languages.indexOf(program.language)]
                    : program.language}
                </span>
                {program.scholarshipAvailable && (
                  <span className="inline-flex items-center gap-1 border border-[#D4A853]/30 bg-[#D4A853]/10 px-3 py-1 text-xs font-medium text-[#D4A853]">
                    <Award className="h-3.5 w-3.5" />
                    {t('prog.scholarship')}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {locale === 'zh' ? program.nameCn : program.name}
              </h1>

              {university && (
                <Link
                  href={`/universities/${university.slug}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {locale === 'zh' ? university.nameCn : university.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    — {locale === 'zh' ? university.cityCn : university.city}
                  </span>
                </Link>
              )}
            </div>

            <div className="flex gap-3 lg:flex-col lg:items-end">
              <Link
                href={`/assessment?major=${encodeURIComponent(locale === 'zh' ? program.nameCn : program.name)}&program=${encodeURIComponent(program.slug)}`}
                className="rounded-none border border-white/30 bg-transparent px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 hover:text-white transition-colors"
              >
                {t('prog.applyViaSica')}
              </Link>
            </div>
          </div>

          {/* Key Stats Row */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-2xl">
            <div className="border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Clock className="h-3.5 w-3.5" />
                {t('prog.duration')}
              </div>
              <p className="text-white font-semibold text-sm">
                {locale === 'zh' ? program.durationCn : program.duration}
              </p>
            </div>
            <div className="border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Banknote className="h-3.5 w-3.5" />
                {t('prog.tuitionLabel')}
              </div>
              <p className="text-white font-semibold text-sm">{program.tuition}</p>
            </div>
            <div className="border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <GraduationCap className="h-3.5 w-3.5" />
                {t('prog.intake')}
              </div>
              <p className="text-white font-semibold text-sm">
                {locale === 'zh' ? program.intakeCn : program.intake}
              </p>
            </div>
            <div className="border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <BookOpen className="h-3.5 w-3.5" />
                {t('prog.language')}
              </div>
              <p className="text-white font-semibold text-sm">
                {locale === 'zh'
                  ? languagesCn[languages.indexOf(program.language)]
                  : program.language}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-16 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap border-b-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border-[#9B1B30] text-[#9B1B30]'
                    : 'border-transparent text-gray-500 hover:text-[#1B2A4A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:flex lg:gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">{t('prog.aboutProgram')}</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {locale === 'zh' ? program.descriptionCn : program.description}
                </p>

                {/* Quick highlights */}
                <div className="grid gap-3 sm:grid-cols-2 mb-6">
                  <div className="flex items-start gap-3 border border-gray-200 bg-white p-4">
                    <Clock className="h-5 w-5 text-[#1B2A4A] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">{t('prog.duration')}</p>
                      <p className="font-semibold text-[#1B2A4A] text-sm">{locale === 'zh' ? program.durationCn : program.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 border border-gray-200 bg-white p-4">
                    <Banknote className="h-5 w-5 text-[#1B2A4A] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">{t('prog.tuitionLabel')}</p>
                      <p className="font-semibold text-[#1B2A4A] text-sm">{program.tuition}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 border border-gray-200 bg-white p-4">
                    <GraduationCap className="h-5 w-5 text-[#1B2A4A] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">{t('prog.degree')}</p>
                      <p className="font-semibold text-[#1B2A4A] text-sm">
                        {locale === 'zh' ? degreeTypesCn[degreeTypes.indexOf(program.degree)] : program.degree}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 border border-gray-200 bg-white p-4">
                    <Globe className="h-5 w-5 text-[#1B2A4A] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">{t('prog.language')}</p>
                      <p className="font-semibold text-[#1B2A4A] text-sm">
                        {locale === 'zh' ? languagesCn[languages.indexOf(program.language)] : program.language}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'requirements' && (
              <div>
                <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">{t('prog.requirements')}</h2>
                <div className="border border-gray-200 bg-white p-5">
                  <ul className="space-y-3">
                    {(locale === 'zh' ? program.requirementsCn : program.requirements).map((req, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-[#9B1B30] shrink-0 mt-0.5" />
                        <span className="text-gray-600 text-sm leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {program.scholarshipAvailable && (
                  <div className="mt-6 border border-[#D4A853]/30 bg-[#D4A853]/5 p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-[#D4A853]" />
                      <h3 className="font-semibold text-[#1B2A4A]">{t('prog.scholarshipInfo')}</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {locale === 'en'
                        ? 'This program offers scholarship opportunities for qualified international students. Contact SICA for detailed scholarship application guidance.'
                        : '该项目为符合条件的国际学生提供奖学金机会。联系SICA获取详细的奖学金申请指导。'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div>
                <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">{t('prog.curriculum')}</h2>
                <div className="border border-gray-200 bg-white p-5">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(locale === 'zh' ? program.curriculumCn : program.curriculum).map((course, i) => (
                      <div key={i} className="flex items-center gap-2.5 py-2 border-b border-gray-100 last:border-0">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-[#1B2A4A] text-white text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="text-sm text-gray-700">{course}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tuition' && (
              <div>
                <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">{t('prog.tuitionFees')}</h2>
                <div className="border border-gray-200 bg-white p-5 mb-6">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">{t('prog.tuitionLabel')}</span>
                    <span className="font-bold text-[#1B2A4A] text-lg">{program.tuition}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">{t('prog.duration')}</span>
                    <span className="font-semibold text-[#1B2A4A]">{locale === 'zh' ? program.durationCn : program.duration}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">{t('prog.intake')}</span>
                    <span className="font-semibold text-[#1B2A4A]">{locale === 'zh' ? program.intakeCn : program.intake}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-600">{t('prog.scholarship')}</span>
                    <span className={`font-semibold ${program.scholarshipAvailable ? 'text-[#9B1B30]' : 'text-gray-400'}`}>
                      {program.scholarshipAvailable ? t('prog.scholarship') : t('prog.noScholarship')}
                    </span>
                  </div>
                </div>

                <div className="border border-gray-200 bg-[#FAFAF8] p-5">
                  <h3 className="font-semibold text-[#1B2A4A] mb-2">{t('prog.howToApply')}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {locale === 'en'
                      ? 'SICA can help you with the entire application process. From document preparation to university communication, our team ensures a smooth and successful application.'
                      : 'SICA可以帮助你完成整个申请流程。从文件准备到与大学沟通，我们的团队确保申请顺利成功。'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="mt-8 lg:mt-0 lg:w-80 shrink-0">
            {/* University Card */}
            {university && (
              <div className="border border-gray-200 bg-white p-5 mb-5">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">{t('prog.university')}</h3>
                <Link
                  href={`/universities/${university.slug}`}
                  className="flex items-center gap-3 group"
                >
                  {university.logo && university.logo.startsWith('http') ? (
                    <UniversityLogo src={university.logo} variant="sidebar" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center bg-[#1B2A4A] text-white font-bold text-lg shrink-0">
                      {(university.name || '').charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors">
                      {locale === 'zh' ? university.nameCn : university.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {locale === 'zh' ? university.cityCn : university.city} · {university.qsRanking}
                    </p>
                  </div>
                </Link>
              </div>
            )}

            {/* SICA Support Card */}
            <div className="border border-[#9B1B30]/20 bg-[#9B1B30]/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center bg-[#9B1B30] text-white text-xs font-bold">
                  S
                </div>
                <h3 className="font-bold text-[#9B1B30]">{t('prog.applyViaSica')}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {t('prog.sicaHelp')}
              </p>
              <ul className="space-y-2 mb-4">
                {(locale === 'en'
                  ? ['Free consultation & program matching', 'Document review & submission', 'Visa application guidance', 'Post-arrival support']
                  : ['免费咨询与项目匹配', '文件审核与提交', '签证申请指导', '入学后支持']
                ).map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-[#9B1B30] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={`/assessment?major=${encodeURIComponent(locale === 'zh' ? program.nameCn : program.name)}&program=${encodeURIComponent(program.slug)}`}
                className="flex w-full items-center justify-center gap-2 rounded-none bg-[#9B1B30] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#7A1526]"
              >
                {t('cta.apply')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* S37: reciprocal news widget — links this program page
          to recent SICA news posts that mention the program or
          its host university. */}
      {program && (
        <div className="bg-[#FAFAF8] py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <RelatedNews
              label={program.name}
              terms={[
                program.name,
                program.nameCn || '',
                university?.name || '',
                program.universitySlug,
                program.slug,
                program.slug.replace(/-/g, ' '),
              ].filter(Boolean).join(', ')}
              category="university"
              locale={locale as 'en' | 'zh'}
            />
          </div>
        </div>
      )}
    </main>
  );
}
