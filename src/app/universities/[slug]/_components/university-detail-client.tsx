'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DetailImage } from '@/components/public-detail/detail-image';
import { DetailFaq } from '@/components/public-detail/detail-faq';
import { buildUniversityFaqItems } from '@/lib/program-faq';
import { DetailEvidence, EvidenceSource } from '@/components/public-detail/detail-evidence';
import { datedIntake, verifiedEvidence } from '@/lib/catalog-verification';
import { DetailActionBar } from '@/components/public-detail/detail-action-bar';
import { useI18n } from '@/lib/i18n';
import type { University } from '@/lib/data';
import type { UniversityProgramPage } from '@/lib/university-programs';
import { ArrowLeft, ArrowRight, Check, Expand, MapPin } from 'lucide-react';
import UniversityLogo from '@/components/university-logo';
import { RelatedNews } from '@/components/RelatedNews';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DetailBack, DetailFacts, DetailNav, DetailNotice, DetailSection, DetailSpec, DetailSupport, detailContainer, detailCounsellingHref, detailLink, detailLinkOnDark, useDetailSection } from '@/components/public-detail/detail-ui';
import { UniversityPrograms } from '@/components/public-detail/university-programs';
import { detailText, localizedDetail, localizedItems } from '@/lib/detail-content';
import { track } from '@/lib/analytics';

interface UniversityDetailClientProps {
  university: University;
  programPage: UniversityProgramPage;
  programSummary: { total: number; scholarships: number };
  related: University[];
  fromQuery?: string;
}

const sectionKeys = ['overview', 'programs', 'admissions', 'scholarships', 'campusLife'] as const;

function known(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export default function UniversityDetailClient({ university: uni, programPage, programSummary, related, fromQuery = '' }: UniversityDetailClientProps) {
  const { t, locale } = useI18n();
  const text = (en: unknown, zh?: unknown): string => localizedDetail(en, zh, locale);
  const name = text(uni.name, uni.nameCn);
  const city = text(uni.city, uni.cityCn);
  const missing = t('catalog.notPublished');
  const [section, selectSection] = useDetailSection(sectionKeys);
  const [imageIndex, setImageIndex] = useState<number | null>(null);
  const tags = localizedItems(uni.tags, uni.tagsCn, locale);
  const highlights = localizedItems(uni.highlights?.en, uni.highlights?.zh, locale);
  const popular = localizedItems(uni.popularPrograms, uni.popularProgramsCn, locale);
  const roomTypes = localizedItems(uni.accommodationTypes, uni.accommodationTypesCn, locale);
  const images = [...new Set([...(uni.gallery ?? []), uni.image].map(detailText).filter(Boolean))];
  const consultHref = detailCounsellingHref({ universitySlug: uni.slug, name });
  const sections = [
    { key: 'overview', label: t('uni.overview') },
    { key: 'programs', label: `${t('nav.programs')} (${programSummary.total})` },
    { key: 'admissions', label: t('uni.admissions') },
    { key: 'scholarships', label: t('detail.costsFunding') },
    { key: 'campusLife', label: t('uni.campusLife') },
  ];
  const evidence = uni.detailVerification;
  const listedIntake = datedIntake(text(uni.intake, uni.intakeCn), evidence);
  const heroFacts = [
    { label: t('detail.programCount'), value: String(programSummary.total) },
    { label: t('uni.undergrad'), value: text(uni.tuitionUndergrad) || missing },
    { label: t('uni.graduate'), value: text(uni.tuitionGraduate) || missing },
    { label: t('detail.datedIntake'), value: listedIntake || t('detail.confirmFunding') },
  ];
  const profile = [
    uni.established > 0 ? { label: t('uni.established'), value: String(uni.established) } : null,
    known(text(uni.type, uni.typeCn)) ? { label: t('uni.type'), value: text(uni.type, uni.typeCn) } : null,
    known(text(uni.students)) ? { label: t('uni.students'), value: text(uni.students) } : null,
    known(text(uni.intlStudents)) ? { label: t('uni.intlStudents'), value: text(uni.intlStudents) } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null);
  const openPrograms = (): void => {
    selectSection('programs');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('detail-section-nav')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };
  const changeImage = (direction: number): void => setImageIndex((value) => value === null ? null : (value + direction + images.length) % images.length);

  return (
    <div className="min-w-0 bg-[#FAFAF8] pb-16 text-[#1B2A4A]">
      <DetailBack href={fromQuery ? `/universities?${fromQuery}` : '/universities'}>{t('catalog.backToResults')}</DetailBack>

      <section className="relative isolate min-h-[240px] bg-[#1B2A4A]">
        <DetailImage src={detailText(uni.image) || '/hero-bg.avif'} alt="" priority sizes="100vw" className="-z-20 object-cover object-center" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#1B2A4A] via-[#1B2A4A]/90 to-[#1B2A4A]/40" />
        <div className={`${detailContainer} py-6 sm:py-10`}>
          <div className="flex max-w-3xl flex-col gap-5 sm:flex-row sm:items-start">
            <UniversityLogo src={uni.logo} variant="detail" />
            <div className="min-w-0">
              <h1 className="break-words text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">{name}</h1>
              <p className="mt-4 flex items-center gap-2 text-sm text-white/85">
                <span className="flex h-6 w-6 items-center justify-center bg-white">
                  <MapPin className="h-3.5 w-3.5 text-[#1B2A4A]" aria-hidden />
                </span>
                <span>{city || missing}, {t('common.china')}</span>
              </p>
              {tags.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <li key={tag} className="border border-white/25 px-2.5 py-1 text-xs font-medium text-white">{tag}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link data-detail-primary href={consultHref} onClick={() => track('apply_click', { location: 'university_hero', slug: uni.slug, locale })} className={`${detailLink} w-full sm:w-auto`}>
              {t('consultationCta.ctaPrimary')}
            </Link>
            <button type="button" onClick={openPrograms} className={`${detailLinkOnDark} w-full sm:w-auto`}>
              {t('uni.viewAllPrograms')} ({programSummary.total})
            </button>
          </div>
        </div>
      </section>

      {heroFacts.length > 0 ? (
        <div className={`${detailContainer} relative z-10 -mt-6`}>
          <DetailFacts facts={heroFacts} />
        </div>
      ) : null}

      <Tabs value={section} onValueChange={selectSection} className="gap-0">
        <DetailNav sections={sections} active={section} />
        <div className={`${detailContainer} grid min-w-0 items-start gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:py-10`}>
          <div className="min-w-0">
            <TabsContent value="overview" className="space-y-6">
              <DetailSection title={t('uni.about')}>
                <p className="whitespace-pre-line text-sm leading-7 text-gray-600 sm:text-base">{text(uni.description, uni.descriptionCn) || t('detail.universityDescriptionMissing')}</p>
                {profile.length > 0 ? (
                  <dl className="mt-6 grid gap-x-8 gap-y-5 border-t border-gray-100 pt-6 sm:grid-cols-2">
                    {profile.map((fact) => (
                      <div key={fact.label} className="min-w-0">
                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{fact.label}</dt>
                        <dd className="mt-1.5 break-words text-sm font-semibold leading-6 text-[#1B2A4A]">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                {uni.rating > 0 ? <p className="mt-6 border-t border-gray-100 pt-4 text-xs leading-5 text-gray-500">{t('detail.editorialRating', { rating: uni.rating })}</p> : null}
                {uni.qsWorldRanking > 0 && <p className="mt-4 text-sm text-[#1B2A4A]"><span className="bg-[#D4A853] px-2 py-1 font-semibold">QS #{uni.qsWorldRanking}</span>{evidence?.rankingYear && <span className="ml-2">{evidence.rankingYear}</span>}{evidence?.rankingSourceUrl ? <a href={evidence.rankingSourceUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-xs underline">{t('detail.viewSource')}</a> : <span className="ml-2 text-xs text-gray-500">{t('detail.rankingUnverified')}</span>}</p>}
                <EvidenceSource evidence={evidence} />
              </DetailSection>

              {highlights.length > 0 ? (
                <DetailSection title={t('uni.highlights')}>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {highlights.map((item) => (
                      <li key={item} className="flex items-start gap-3 border border-gray-100 bg-[#FAFAF8] p-4 text-sm leading-6 text-gray-600">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1B2A4A]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </DetailSection>
              ) : null}

              {popular.length > 0 ? (
                <DetailSection title={t('detail.popularSubjects')} lede={t('detail.subjectsNote')}>
                  <div className="flex flex-wrap gap-2">
                    {popular.map((subject) => (
                      <span key={subject} className="border border-gray-200 bg-[#FAFAF8] px-3 py-2 text-sm font-medium text-[#1B2A4A]">{subject}</span>
                    ))}
                  </div>
                </DetailSection>
              ) : null}

              {images.length > 0 ? (
                <DetailSection title={t('uni.campusGallery')}>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {images.slice(0, 4).map((src, i) => (
                      <button key={src} type="button" onClick={() => setImageIndex(i)} aria-label={t('detail.openCampusImage', { number: i + 1 })} className="group relative aspect-[4/3] overflow-hidden bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B1B30]">
                        <DetailImage src={src} alt={t('detail.campusImageAlt', { name, number: i + 1 })} sizes="(max-width: 640px) 45vw, 250px" className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" />
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => selectSection('campusLife')} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#9B1B30] hover:underline">
                    {t('detail.viewCampus')}
                    <ArrowRight className="h-4 w-4 text-[#1B2A4A]" />
                  </button>
                </DetailSection>
              ) : null}
            </TabsContent>

            <TabsContent value="programs">
              <UniversityPrograms slug={uni.slug} result={programPage} fromQuery={fromQuery} totalPrograms={programSummary.total} />
            </TabsContent>

            <TabsContent value="admissions" className="space-y-6">
              <DetailSection title={t('uni.admissionRequirements')} lede={t('detail.admissionsByProgram')}>
                <button type="button" onClick={openPrograms} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#9B1B30] hover:underline">
                  {t('detail.chooseForRequirements')}
                  <ArrowRight className="h-4 w-4 text-[#1B2A4A]" />
                </button>
              </DetailSection>
              <DetailSection title={t('detail.prepareDocuments')} lede={t('detail.documentsDisclaimer')}>
                <ul className="divide-y divide-gray-100 border-t border-gray-100">
                  {['detail.documentIdentity', 'detail.documentAcademic', 'detail.documentLanguage', 'detail.documentStudyPlan'].map((key) => (
                    <li key={key} className="flex items-start gap-3 py-4 text-sm leading-6 text-gray-600">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-[#1B2A4A]" />
                      {t(key)}
                    </li>
                  ))}
                </ul>
              </DetailSection>
              <DetailEvidence evidence={evidence} recordedIntake={text(uni.intake, uni.intakeCn)} recordedDeadline={uni.applicationDeadline?.slice(0, 10)} />
            </TabsContent>

            <TabsContent value="scholarships" className="space-y-6">
              <DetailSection title={t('uni.tuitionFees')} lede={t('detail.feeBasis')}>
                <DetailSpec rows={[
                  { label: t('uni.undergrad'), value: text(uni.tuitionUndergrad) || missing },
                  { label: t('uni.graduate'), value: text(uni.tuitionGraduate) || missing },
                  { label: t('uni.accommodation'), value: text(uni.accommodationCost, uni.accommodationCostCn) || missing },
                  { label: t('detail.otherCosts'), value: t('detail.confirmOtherCosts') },
                ]} />
              </DetailSection>
              <DetailSection title={t('uni.scholarships')}>
                <EvidenceSource evidence={evidence} />
                <p className="whitespace-pre-line text-sm leading-7 text-gray-600">{(verifiedEvidence(evidence) ? text(evidence?.funding, evidence?.fundingCn) : '') || text(uni.scholarshipInfo, uni.scholarshipInfoCn) || t('detail.fundingNote')}</p>
                {programSummary.scholarships > 0 ? (
                  <Link href={`/programs?university=${encodeURIComponent(uni.slug)}&scholarship=1`} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#9B1B30] hover:underline">
                    {t('detail.fundedProgramCount', { count: programSummary.scholarships })}
                    <ArrowRight className="h-4 w-4 text-[#1B2A4A]" />
                  </Link>
                ) : null}
              </DetailSection>
              <DetailNotice title={t('detail.generalFundingGuide')}>
                <p>{t('detail.generalFundingNote')}</p>
                <Link href="/guides/scholarships" className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold text-[#9B1B30] hover:underline">
                  {t('uni.fullScholarshipsGuide')}
                  <ArrowRight className="h-4 w-4 text-[#1B2A4A]" />
                </Link>
              </DetailNotice>
            </TabsContent>

            <TabsContent value="campusLife" className="space-y-6">
              <DetailSection title={t('uni.accommodation')}>
                <p className="text-sm leading-7 text-gray-600">{text(uni.accommodation, uni.accommodationCn) || t('detail.accommodationMissing')}</p>
                <dl className="mt-5 border-t border-gray-100 pt-5">
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{t('uni.estimatedCost')}</dt>
                  <dd className="mt-1.5 break-words text-sm font-semibold text-[#1B2A4A]">{text(uni.accommodationCost, uni.accommodationCostCn) || missing}</dd>
                </dl>
                {roomTypes.length > 0 ? (
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {roomTypes.map((type) => <li key={type} className="border border-gray-200 px-3 py-2 text-xs text-[#1B2A4A]">{type}</li>)}
                  </ul>
                ) : null}
              </DetailSection>
              <DetailSection title={t('uni.campusGallery')}>
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {images.map((src, i) => (
                      <button key={src} type="button" onClick={() => setImageIndex(i)} aria-label={t('detail.openCampusImage', { number: i + 1 })} className="group relative aspect-[4/3] overflow-hidden bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B1B30]">
                        <DetailImage src={src} alt={t('detail.campusImageAlt', { name, number: i + 1 })} sizes="(max-width: 640px) 45vw, 350px" className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105" />
                        <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center bg-white">
                          <Expand className="h-4 w-4 text-[#1B2A4A]" />
                        </span>
                      </button>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-500">{t('detail.galleryMissing')}</p>}
              </DetailSection>
            </TabsContent>
          </div>
          <aside className="min-w-0 lg:sticky lg:top-32">
            <DetailSupport name={name} universitySlug={uni.slug} />
          </aside>
        </div>
      </Tabs>

      <DetailFaq items={buildUniversityFaqItems(uni, programSummary.total, locale)} />
      <DetailActionBar href={consultHref} name={name} slug={uni.slug} assessmentHref={`/assessment?${new URLSearchParams({ university: uni.slug })}#assessment-form`} />

      {related.length > 0 ? (
        <section className="border-y border-gray-200 bg-white py-12">
          <div className={detailContainer}>
            <h2 className="text-2xl font-bold tracking-tight">{t('uni.relatedUniversities')}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((other) => (
                <Link key={other.slug} href={`/universities/${other.slug}${fromQuery ? `?from=${encodeURIComponent(fromQuery)}` : ''}`} className="group flex min-w-0 items-center gap-4 border border-gray-200 bg-white p-4 transition duration-150 hover:-translate-y-0.5 hover:border-[#9B1B30] hover:shadow-md">
                  <UniversityLogo src={other.logo} variant="sidebar" />
                  <span className="min-w-0">
                    <span className="block break-words text-sm font-semibold leading-6 group-hover:text-[#9B1B30]">{text(other.name, other.nameCn)}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>{text(other.city, other.cityCn)}</span>
                      {other.qsWorldRanking > 0 ? <span className="bg-[#D4A853] px-1.5 py-0.5 font-semibold text-[#1B2A4A]">QS #{other.qsWorldRanking}</span> : null}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <div className={`${detailContainer} py-12`}>
        <RelatedNews label={uni.name} terms={[uni.name, uni.slug, uni.slug.replace(/-/g, ' ')].join(', ')} category="university" locale={locale} />
      </div>

      <Dialog open={imageIndex !== null} onOpenChange={(open) => { if (!open) setImageIndex(null); }}>
        <DialogContent closeLabel={t('common.close')} className="max-h-[90dvh] max-w-4xl overflow-y-auto rounded-none border-gray-200 p-4 sm:max-w-4xl sm:p-6" onKeyDown={(event) => { if (event.key === 'ArrowRight') { event.preventDefault(); changeImage(1); } if (event.key === 'ArrowLeft') { event.preventDefault(); changeImage(-1); } }}>
          <DialogTitle className="pr-8 text-base text-[#1B2A4A]">{name}</DialogTitle>
          <DialogDescription aria-live="polite" aria-atomic="true">{t('detail.galleryPosition', { number: (imageIndex ?? 0) + 1, count: images.length })}</DialogDescription>
          {imageIndex !== null && images[imageIndex] ? (
            <div className="relative aspect-[4/3] bg-[#FAFAF8]">
              <DetailImage src={images[imageIndex]} alt={t('detail.campusImageAlt', { name, number: imageIndex + 1 })} sizes="(max-width: 768px) 90vw, 850px" className="object-contain" />
            </div>
          ) : null}
          {images.length > 1 ? (
            <div className="flex justify-between">
              <button type="button" onClick={() => changeImage(-1)} aria-label={t('detail.previousImage')} className="flex h-11 w-11 items-center justify-center border border-gray-300 text-[#1B2A4A] hover:border-[#9B1B30]"><ArrowLeft className="h-5 w-5" /></button>
              <button type="button" onClick={() => changeImage(1)} aria-label={t('detail.nextImage')} className="flex h-11 w-11 items-center justify-center border border-gray-300 text-[#1B2A4A] hover:border-[#9B1B30]"><ArrowRight className="h-5 w-5" /></button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
