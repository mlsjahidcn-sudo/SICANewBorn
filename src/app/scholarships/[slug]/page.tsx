'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { scholarships } from '@/lib/data';
import { ChevronRight, Clock, Globe, GraduationCap, Gift, CheckCircle, ExternalLink, ArrowRight, ShieldCheck, FileText, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RelatedNews } from '@/components/RelatedNews';

export default function ScholarshipDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useState('overview');

  const scholarship = scholarships.find((s) => s.slug === slug);

  if (!scholarship) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Scholarship Not Found</h1>
          <Link href="/scholarships" className="text-[#9B1B30] hover:underline">
            Back to Scholarships
          </Link>
        </div>
      </main>
    );
  }

  const tabs = [
    { id: 'overview', label: t('schol.overview') },
    { id: 'benefits', label: t('schol.coverageBenefits') },
    { id: 'eligibility', label: t('schol.eligibility') },
    { id: 'apply', label: t('schol.howToApply') },
  ];

  const name = locale === 'zh' ? scholarship.nameCn : scholarship.name;
  const description = locale === 'zh' ? scholarship.descriptionCn : scholarship.description;
  const coverageItems = locale === 'zh' ? scholarship.coverageCn : scholarship.coverage;
  const degreeItems = locale === 'zh' ? scholarship.degreeLevelsCn : scholarship.degreeLevels;
  const reqItems = locale === 'zh' ? scholarship.requirementsCn : scholarship.requirements;
  const benefitItems = locale === 'zh' ? scholarship.benefitsCn : scholarship.benefits;
  const appMethod = locale === 'zh' ? scholarship.applicationMethodCn : scholarship.applicationMethod;
  const duration = locale === 'zh' ? scholarship.durationCn : scholarship.duration;
  const deadline = locale === 'zh' ? scholarship.deadlineCn : scholarship.deadline;
  const regions = locale === 'zh' ? scholarship.eligibleRegionsCn : scholarship.eligibleRegions;

  // Phase 46 GEO/AEO: FAQPage JSON-LD. Built from the scholarship
  // data so the questions + answers are always consistent with
  // what's shown on the page. LLM engines (ChatGPT, Perplexity,
  // Google AI) read this directly when composing answers.
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale === 'zh' ? 'zh' : 'en',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What does the ${name} scholarship cover?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The ${name} scholarship covers: ${coverageItems.join(', ')}.`,
        },
      },
      {
        '@type': 'Question',
        name: `Who is eligible for the ${name} scholarship?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Eligible applicants: ${regions}. Applicable degree levels: ${degreeItems.join(', ')}. Additional requirements: ${reqItems.join('; ')}.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the application deadline for the ${name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The ${name} application deadline is ${deadline}. SICA recommends applying at least 8 weeks before the deadline to allow for document preparation and translation.`,
        },
      },
      {
        '@type': 'Question',
        name: `How do I apply for the ${name} scholarship?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${appMethod} SICA's admissions team can help with application preparation, document review, and submission. Submit a free assessment at https://studyinchina.academy/assessment to get started.`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="min-h-screen bg-[#FAFAF8]">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-[#9B1B30] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/scholarships" className="hover:text-[#9B1B30] transition-colors">{t('nav.scholarships')}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#1F2937] font-medium truncate max-w-xs">{name}</span>
        </nav>
      </div>

      {/* Header */}
      <section className="bg-[#1B2A4A] text-white py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                scholarship.type === 'Full'
                  ? 'bg-[#9B1B30] text-white'
                  : 'bg-white/20 text-white'
              }`}
            >
              <Gift className="w-3 h-3" />
              {locale === 'zh' ? scholarship.typeCn : scholarship.type} {t('schol.type')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-white/10 text-gray-200">
              <Clock className="w-3 h-3" />
              {deadline}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-6">{name}</h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 p-4">
              <div className="flex items-center gap-2 text-gray-300 text-xs mb-1">
                <GraduationCap className="w-3.5 h-3.5" />
                {t('schol.degreeLevels')}
              </div>
              <p className="text-sm font-medium text-white">
                {degreeItems.slice(0, 2).join(', ')}
                {degreeItems.length > 2 && '...'}
              </p>
            </div>
            <div className="bg-white/10 p-4">
              <div className="flex items-center gap-2 text-gray-300 text-xs mb-1">
                <Globe className="w-3.5 h-3.5" />
                {t('schol.eligibleRegions')}
              </div>
              <p className="text-sm font-medium text-white truncate">{regions}</p>
            </div>
            <div className="bg-white/10 p-4">
              <div className="flex items-center gap-2 text-gray-300 text-xs mb-1">
                <Clock className="w-3.5 h-3.5" />
                {t('schol.duration')}
              </div>
              <p className="text-sm font-medium text-white">{duration}</p>
            </div>
            <div className="bg-white/10 p-4">
              <div className="flex items-center gap-2 text-gray-300 text-xs mb-1">
                <Gift className="w-3.5 h-3.5" />
                {t('schol.coverage')}
              </div>
              <p className="text-sm font-medium text-white">{coverageItems.length} {locale === 'zh' ? '项资助' : 'items'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="border-b border-gray-200 bg-white sticky top-[65px] z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#9B1B30] text-[#9B1B30]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-6">{t('schol.overview')}</h2>
                <p className="text-gray-600 leading-relaxed mb-8">{description}</p>

                {/* Coverage Quick View */}
                <div className="bg-white border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-bold text-[#1F2937] mb-4">{t('schol.coverage')}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {coverageItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#9B1B30] flex-shrink-0" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Degree Levels */}
                <div className="bg-white border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-[#1F2937] mb-4">{t('schol.degreeLevels')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {degreeItems.map((level, i) => (
                      <span key={i} className="px-3 py-1.5 bg-[#1B2A4A10] text-[#1B2A4A] text-sm">
                        {level}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'benefits' && (
              <div>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-6">{t('schol.coverageBenefits')}</h2>

                {/* Coverage Details */}
                <div className="bg-white border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-bold text-[#1F2937] mb-4">{t('schol.coverage')}</h3>
                  <div className="space-y-3">
                    {coverageItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-[#FAFAF8]">
                        <CheckCircle className="w-5 h-5 text-[#9B1B30] flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Benefits */}
                <div className="bg-white border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-[#1F2937] mb-4">{t('schol.benefits')}</h3>
                  <div className="space-y-3">
                    {benefitItems.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-[#FAFAF8]">
                        <div className="w-6 h-6 bg-[#9B1B30] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'eligibility' && (
              <div>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-6">{t('schol.eligibility')}</h2>

                {/* Requirements */}
                <div className="bg-white border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-bold text-[#1F2937] mb-4">{t('schol.requirements')}</h3>
                  <div className="space-y-3">
                    {reqItems.map((req, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-[#1B2A4A] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <span className="text-gray-700">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Eligible Regions */}
                <div className="bg-white border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-[#1F2937] mb-3">{t('schol.eligibleRegions')}</h3>
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#1B2A4A]" />
                    <span className="text-gray-700">{regions}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'apply' && (
              <div>
                <h2 className="text-2xl font-bold text-[#1F2937] mb-6">{t('schol.howToApply')}</h2>

                {/* Application Method */}
                <div className="bg-white border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-bold text-[#1F2937] mb-3">{t('schol.applicationMethod')}</h3>
                  <p className="text-gray-700 leading-relaxed">{appMethod}</p>
                </div>

                {/* Important Dates */}
                <div className="bg-white border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-bold text-[#1F2937] mb-4">{t('schol.keyInfo')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-[#FAFAF8]">
                      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        {t('schol.deadlineLabel')}
                      </div>
                      <p className="font-semibold text-[#1F2937]">{deadline}</p>
                    </div>
                    <div className="p-4 bg-[#FAFAF8]">
                      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        {t('schol.duration')}
                      </div>
                      <p className="font-semibold text-[#1F2937]">{duration}</p>
                    </div>
                  </div>
                </div>

                {/* Official Link */}
                <div className="bg-white border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-[#1F2937] mb-3">{t('schol.officialLink')}</h3>
                  <a
                    href={scholarship.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#9B1B30] hover:text-[#7A1526] font-medium transition-colors"
                  >
                    {scholarship.officialLink}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* SICA Support Card */}
            <div className="bg-[#1B2A4A] text-white p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#9B1B30] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">{t('schol.sicaCardTitle')}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                {t('schol.sicaCardDesc')}
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-200">
                  <FileText className="w-4 h-4 text-[#D4A853]" />
                  {locale === 'zh' ? '奖学金匹配与选校建议' : 'Scholarship matching & selection'}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-200">
                  <FileText className="w-4 h-4 text-[#D4A853]" />
                  {locale === 'zh' ? '申请材料审核与润色' : 'Application review & polishing'}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-200">
                  <FileText className="w-4 h-4 text-[#D4A853]" />
                  {locale === 'zh' ? '面试辅导与模拟' : 'Interview coaching & prep'}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-200">
                  <HeartHandshake className="w-4 h-4 text-[#D4A853]" />
                  {locale === 'zh' ? '全程免费服务' : '100% Free service'}
                </li>
              </ul>
              <Button className="w-full bg-[#9B1B30] hover:bg-[#7A1526] text-white rounded-none font-bold uppercase tracking-wide text-sm">
                {t('schol.applyViaSica')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Quick Info */}
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="font-bold text-[#1F2937] mb-4">{t('schol.keyInfo')}</h3>
              <div className="space-y-4">
                <div>
                  <dt className="text-xs text-gray-500 mb-1">{t('schol.type')}</dt>
                  <dd className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-bold ${
                      scholarship.type === 'Full'
                        ? 'bg-[#9B1B30] text-white'
                        : 'bg-[#1B2A4A] text-white'
                    }`}>
                      {locale === 'zh' ? scholarship.typeCn : scholarship.type}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 mb-1">{t('schol.deadlineLabel')}</dt>
                  <dd className="text-sm font-medium text-[#1F2937]">{deadline}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 mb-1">{t('schol.duration')}</dt>
                  <dd className="text-sm font-medium text-[#1F2937]">{duration}</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500 mb-1">{t('schol.eligibleRegions')}</dt>
                  <dd className="text-sm font-medium text-[#1F2937]">{regions}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* S37: reciprocal news widget — links this scholarship page
          to recent SICA news posts that mention the scholarship
          by name (CSC, Confucius, Beijing Government, etc.). */}
      <div className="bg-[#FAFAF8] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RelatedNews
            label={scholarship.name}
            terms={[
              scholarship.name,
              scholarship.slug,
              scholarship.slug.replace(/-/g, ' '),
            ].join(', ')}
            category="scholarship"
            locale={locale as 'en' | 'zh'}
          />
        </div>
      </div>
    </main>
    </>
  );
}
