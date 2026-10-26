'use client';

import Link from 'next/link';
import { DetailImage } from '@/components/public-detail/detail-image';
import { DetailFaq } from '@/components/public-detail/detail-faq';
import { buildProgramFaqItems } from '@/lib/program-faq';
import { DetailEvidence, EvidenceSource } from '@/components/public-detail/detail-evidence';
import { datedIntake, verifiedEvidence } from '@/lib/catalog-verification';
import { DetailActionBar } from '@/components/public-detail/detail-action-bar';
import { useI18n } from '@/lib/i18n';
import { type Program, type University } from '@/lib/data';
import { ArrowRight, Check, MapPin } from 'lucide-react';
import { RelatedNews } from '@/components/RelatedNews';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { DetailBack, DetailFacts, DetailNav, DetailNotice, DetailSection, DetailSpec, DetailSupport, detailContainer, detailCounsellingHref, detailLink, useDetailSection } from '@/components/public-detail/detail-ui';
import { catalogLabel, detailText, localizedDetail, localizedItems } from '@/lib/detail-content';
import { buildProgramHeading, teachingLanguageLabel } from '@/lib/program-seo';
import { track } from '@/lib/analytics';

interface ProgramDetailClientProps {
  program: Program;
  university: University | null;
  relatedPrograms: (Program & { universityName: string; universityNameCn: string })[];
  fromQuery: string;
  universityReturn?: string;
}

export default function ProgramDetailClient({ program, university, relatedPrograms, fromQuery, universityReturn = '' }: ProgramDetailClientProps) {
  const { t, locale } = useI18n();
  const text = (en: unknown, zh?: unknown): string => localizedDetail(en, zh, locale);
  const name = text(program.name, program.nameCn);
  const uniName = university ? text(university.name, university.nameCn) : '';
  const missing = t('catalog.notPublished');
  const requirements = localizedItems(program.requirements, program.requirementsCn, locale);
  const curriculum = localizedItems(program.curriculum, program.curriculumCn, locale);
  const keys = ['overview', 'requirements', 'tuition', ...(curriculum.length ? ['curriculum'] : [])];
  const [section, selectSection] = useDetailSection(keys);
  const degreeSource = detailText(program.degree);
  const degree = degreeSource ? catalogLabel(degreeSource, locale) : '';
  const language = text(program.language) ? catalogLabel(program.language, locale) : missing;
  const taughtLabel = teachingLanguageLabel(program.language, locale);
  const heading = buildProgramHeading({ major: name, degree, university: uniName });
  const returnHref = universityReturn || (fromQuery ? `/programs?${fromQuery}` : '/programs');
  const scholarship = program.scholarshipAvailable === true ? t('detail.fundingListed') : program.scholarshipAvailable === false ? t('detail.noFundingListed') : t('detail.confirmFunding');
  const consultHref = detailCounsellingHref({
    universitySlug: program.universitySlug,
    name: uniName || name,
    programSlug: program.slug,
    programName: name,
  });
  const sections = [
    { key: 'overview', label: t('prog.overview') },
    { key: 'requirements', label: t('prog.requirements') },
    { key: 'tuition', label: t('detail.costsFunding') },
    ...(curriculum.length ? [{ key: 'curriculum', label: t('prog.curriculum') }] : []),
  ];
  const evidence = program.detailVerification;
  const listedIntake = datedIntake(text(program.intake, program.intakeCn), evidence);
  const facts = [
    { label: t('prog.duration'), value: text(program.duration, program.durationCn) || missing },
    { label: t('prog.tuitionLabel'), value: text(program.tuition) || missing },
    { label: t('detail.datedIntake'), value: listedIntake || t('detail.confirmFunding') },
    { label: t('prog.language'), value: language },
  ];
  const universityHref = university ? (universityReturn || `/universities/${university.slug}`) : '';

  return (
    <div className="min-w-0 bg-[#FAFAF8] pb-16 text-[#1B2A4A]">
      <DetailBack href={returnHref}>{universityReturn ? t('detail.backUniversity') : t('prog.backToResults')}</DetailBack>

      <header className="border-b border-gray-200 bg-white">
        {university && text(university.image) ? (
          <div className="relative h-20 bg-[#1B2A4A] sm:h-32 lg:h-40">
            <DetailImage src={university.image} alt="" priority sizes="100vw" className="object-cover object-center" />
          </div>
        ) : null}
        <div className={detailContainer}>
          <div className="py-5 sm:py-7">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              {degree ? <span className="bg-[#1B2A4A] px-2.5 py-1 text-white">{degree}</span> : null}
              {program.scholarshipAvailable === true ? <span className="border border-[#9B1B30]/30 bg-[#9B1B30]/5 px-2.5 py-1 text-[#9B1B30]">{t('detail.fundingListed')}</span> : null}
            </div>
            <div className="mt-3 grid min-w-0 items-center gap-x-6 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
            <h1 className="max-w-4xl break-words text-2xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{heading}</h1>
            {taughtLabel ? <p className="mt-2 text-sm font-semibold text-[#1B2A4A]">{taughtLabel}</p> : null}
            {university ? (
              <Link href={universityHref} className="mt-3 inline-flex max-w-full items-center gap-2 text-sm transition-colors duration-150 hover:text-[#9B1B30]">

                <span className="min-w-0 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="block font-semibold text-[#1B2A4A]">{uniName}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="h-3.5 w-3.5 text-[#1B2A4A]" />
                    {text(university.city, university.cityCn) || missing}, {t('common.china')}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#1B2A4A]" />
              </Link>
            ) : null}
            </div>
            <div className="mt-4 lg:mt-0">
              <Link data-detail-primary href={consultHref} onClick={() => track('apply_click', { location: 'program_hero', slug: program.slug, locale })} className={`${detailLink} w-full sm:w-auto`}>
                {t('consultationCta.ctaPrimary')}
              </Link>
            </div>
            </div>
            <div className="mt-5"><DetailFacts facts={facts} /></div>
          </div>
        </div>
      </header>

      <Tabs value={section} onValueChange={selectSection} className="gap-0">
        <DetailNav sections={sections} active={section} />
        <div className={`${detailContainer} grid min-w-0 items-start gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-10`}>
          <div className="min-w-0 space-y-6">
            <TabsContent value="overview" className="space-y-6">
              <DetailSection title={t('prog.aboutProgram')}>
                <p className="whitespace-pre-line text-sm leading-7 text-gray-600 sm:text-base">{text(program.description, program.descriptionCn) || t('detail.programDescriptionMissing')}</p>
                <EvidenceSource evidence={evidence} />
              </DetailSection>
              {program.scholarshipAvailable === true ? (
                <DetailNotice title={t('detail.fundingListed')}>{t('detail.fundingFlagNote')}</DetailNotice>
              ) : (
                <DetailNotice title={t('detail.fundingNoteTitle')}>{t('detail.fundingNote')}</DetailNotice>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => selectSection('requirements')} className="border border-gray-200 bg-white p-5 text-left transition-colors duration-150 hover:border-[#9B1B30]">
                  <span className="block text-base font-semibold text-[#1B2A4A]">{t('prog.requirements')}</span>
                  <span className="mt-2 block text-sm leading-6 text-gray-600">{requirements.length > 0 ? t('detail.publishedRequirements') : t('detail.requirementsMissingTitle')}</span>
                </button>
                <button type="button" onClick={() => selectSection('tuition')} className="border border-gray-200 bg-white p-5 text-left transition-colors duration-150 hover:border-[#9B1B30]">
                  <span className="block text-base font-semibold text-[#1B2A4A]">{t('detail.costsFunding')}</span>
                  <span className="mt-2 block text-sm leading-6 text-gray-600">{text(program.tuition) || missing}</span>
                </button>
              </div>
            </TabsContent>

            <TabsContent value="requirements" className="space-y-6">
              <DetailSection title={t('prog.requirements')} lede={t('detail.requirementsNote')}>
                {requirements.length > 0 ? (
                  <ul className="divide-y divide-gray-100 border-t border-gray-100">
                    {requirements.map((item, i) => (
                      <li key={`${i}-${item}`} className="flex items-start gap-3 py-4 text-sm leading-6 text-gray-600">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-[#1B2A4A]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <DetailNotice title={t('detail.requirementsMissingTitle')}><p>{t('detail.requirementsMissing')}</p><Link href={consultHref} className="mt-3 inline-flex min-h-11 items-center font-semibold text-[#9B1B30] underline">{t('detail.confirmRequirements')}</Link></DetailNotice>
                )}
                <EvidenceSource evidence={evidence} />
              </DetailSection>
              <DetailEvidence evidence={evidence} recordedIntake={text(program.intake, program.intakeCn)} />
            </TabsContent>

            <TabsContent value="tuition" className="space-y-6">
              <DetailSection title={t('detail.costsFunding')} lede={t('detail.feeBasis')}>
                <DetailSpec rows={[
                  { label: t('prog.tuitionLabel'), value: text(program.tuition) || missing },
                  { label: t('uni.accommodation'), value: university ? text(university.accommodationCost, university.accommodationCostCn) || missing : missing },
                  { label: t('detail.otherCosts'), value: t('detail.confirmOtherCosts') },
                  { label: t('detail.fundingStatus'), value: scholarship },
                ]} />
                {university ? <p className="mt-3 text-xs leading-6 text-gray-500">{t('detail.accommodationBasis', { name: uniName })}</p> : null}
              </DetailSection>
              <DetailNotice title={t('detail.fundingNoteTitle')}>{(verifiedEvidence(evidence) ? text(evidence?.funding, evidence?.fundingCn) : '') || t('detail.fundingNote')}<EvidenceSource evidence={evidence} /></DetailNotice>
              <Link href="/guides/scholarships" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#9B1B30] hover:underline">
                {t('uni.fullScholarshipsGuide')}
                <ArrowRight className="h-4 w-4 text-[#1B2A4A]" />
              </Link>
            </TabsContent>

            {curriculum.length > 0 ? (
              <TabsContent value="curriculum">
                <DetailSection title={t('prog.curriculum')}>
                  <ol className="divide-y divide-gray-100 border-t border-gray-100">
                    {curriculum.map((course, i) => (
                      <li key={`${i}-${course}`} className="flex gap-4 py-4 text-sm leading-6 text-gray-600">
                        <span className="w-8 shrink-0 font-semibold tabular-nums text-[#1B2A4A]">{String(i + 1).padStart(2, '0')}</span>
                        <span>{course}</span>
                      </li>
                    ))}
                  </ol>
                </DetailSection>
              </TabsContent>
            ) : null}
          </div>

          <aside className="min-w-0 space-y-4 lg:sticky lg:top-32">
            <DetailSupport name={uniName || name} universitySlug={program.universitySlug} programSlug={program.slug} programName={name} />
            <Link href={`/programs?university=${encodeURIComponent(program.universitySlug)}`} className="flex items-center gap-3 border border-gray-200 bg-white p-5 text-sm font-semibold transition-colors duration-150 hover:border-[#9B1B30]">
              <span className="min-w-0 flex-1">{t('detail.moreAtUniversity')}</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-[#1B2A4A]" />
            </Link>
          </aside>
        </div>
      </Tabs>

      <DetailFaq items={buildProgramFaqItems(program, uniName, locale)} />
      <DetailActionBar href={consultHref} name={`${name}${uniName ? ` — ${uniName}` : ''}`} slug={program.slug} assessmentHref={`/assessment?${new URLSearchParams({ university: program.universitySlug, program: program.slug })}#assessment-form`} />

      {relatedPrograms.length > 0 ? (
        <section className="border-y border-gray-200 bg-white py-12">
          <div className={detailContainer}>
            <h2 className="text-2xl font-bold tracking-tight">{t('prog.relatedPrograms')}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedPrograms.map((item) => (
                <Link key={item.slug} href={`/programs/${item.slug}${fromQuery || (universityReturn && item.universitySlug === program.universitySlug) ? `?${new URLSearchParams({ ...(fromQuery ? { from: fromQuery } : {}), ...(universityReturn && item.universitySlug === program.universitySlug ? { returnTo: universityReturn } : {}) })}` : ''}`} onClick={() => track('program_click', { slug: item.slug, position: 0, locale })} className="group flex min-h-full min-w-0 flex-col border border-gray-200 bg-white p-5 transition duration-150 hover:-translate-y-0.5 hover:border-[#9B1B30] hover:shadow-md">
                  <p className="text-xs font-medium text-gray-500">{catalogLabel(item.degree, locale)}{item.language ? ` · ${catalogLabel(item.language, locale)}` : ''}</p>
                  <p className="mt-2 text-xs font-semibold text-[#9B1B30]">{t(item.universitySlug === program.universitySlug ? 'detail.sameUniversity' : 'detail.similarSubject')}</p>
                  <h3 className="mt-3 break-words text-base font-semibold leading-6 group-hover:text-[#9B1B30]">{text(item.name, item.nameCn)}</h3>
                  <p className="mt-2 break-words text-xs leading-5 text-gray-600">{text(item.universityName, item.universityNameCn)}</p>
                  <p className="mt-3 text-sm font-medium text-[#1B2A4A]">{text(item.tuition) || missing}</p>
                  <p className="mt-1 text-xs text-gray-500">{text(item.intake, item.intakeCn) || missing}</p>
                  <span className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-[#9B1B30]">
                    {t('prog.viewDetails')}
                    <ArrowRight className="h-4 w-4 text-[#1B2A4A]" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className={`${detailContainer} py-12`}>
        <RelatedNews label={program.name} terms={[program.name, program.nameCn, university?.name, program.universitySlug].filter(Boolean).join(', ')} category="university" locale={locale} />
      </div>
    </div>
  );
}
