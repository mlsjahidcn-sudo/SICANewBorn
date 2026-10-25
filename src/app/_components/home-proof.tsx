import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { CSSProperties } from 'react';
import {
  ArrowRight,
  BrainCircuit,
  Briefcase,
  Calendar,
  Clock,
  Cpu,
  DollarSign,
  FileText,
  Globe,
  Heart,
  Home,
  MapPin,
  Languages,
  MessageSquare,
  Newspaper,
  Plane,
  Star,
  Trophy,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import { ConsultationActivity } from '@/components/ConsultationActivity';
import { Button } from '@/components/ui/button';
import { getCatalogCounts } from '@/lib/data-fetcher';
import { getServerT } from '@/lib/server-t';
import { formatCount, getStat } from '@/lib/site-stats';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';

const VideoTestimonials = dynamic(
  () => import('@/components/VideoTestimonials').then((m) => m.VideoTestimonials),
);

export function HomeProofSkeleton() {
  return (
    <div aria-hidden className="bg-[#FAFAF8]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-10 w-72 bg-[#F3F4F6]" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="h-40 bg-[#F3F4F6]" />
          <div className="h-40 bg-[#F3F4F6]" />
        </div>
      </div>
    </div>
  );
}

interface NewsTeaser {
  slug: string;
  title_en: string;
  title_zh: string | null;
  excerpt_en: string | null;
  cover_image: string | null;
  category: string;
  tags: string[];
  published_at: string | null;
  read_time_minutes: number | null;
}

async function fetchLatestNews(): Promise<NewsTeaser[]> {
  if (!isSupabaseServerConfigured()) return [];
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  const { data } = await supabase
    .from('news_posts')
    .select(
      'slug, title_en, title_zh, excerpt_en, cover_image, category, tags, published_at, read_time_minutes',
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(3);
  return (data as NewsTeaser[]) || [];
}

interface AdmissionTeaser {
  id: string;
  student_name: string;
  university_name: string;
  program: string | null;
  degree: string | null;
  intake: string | null;
  country: string | null;
  image_path: string;
}

async function fetchLatestAdmissions(): Promise<AdmissionTeaser[]> {
  if (!isSupabaseServerConfigured()) return [];
  const supabase = getSupabaseServer();
  if (!supabase) return [];
  const { data } = await supabase
    .from('admission_notices')
    .select('id, student_name, university_name, program, degree, intake, country, image_path')
    .eq('is_published', true)
    .order('display_order', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(3);
  return (data as AdmissionTeaser[]) || [];
}

function admissionImageUrl(imagePath: string): string {
  const supabaseUrl =
    process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return `${supabaseUrl}/storage/v1/object/public/admission-notices/${imagePath}`;
}

export async function HomeProof() {
  const [t, latestNews, latestAdmissions, counts] = await Promise.all([
    getServerT(),
    fetchLatestNews(),
    fetchLatestAdmissions(),
    getCatalogCounts(),
  ]);

  const categoryLabels: Record<string, string> = {
    announcement: t('news.category.announcement'),
    partnership: t('news.category.partnership'),
    scholarship: t('news.category.scholarship'),
    university: t('news.category.university'),
    event: t('news.category.event'),
    guide: t('news.category.guide'),
  };

  const stats = [
    {
      value: getStat('partnerUniversities') || formatCount(counts.universities),
      label: t('home.stats.partnerUniversities'),
    },
    {
      value: getStat('countriesServed'),
      label: t('home.stats.countriesRepresented'),
    },
    {
      value: getStat('studentsHelped'),
      label: t('home.stats.studentsHelped'),
    },
    {
      value: getStat('admissionRate'),
      label: t('home.stats.admissionRate'),
    },
    {
      value: getStat('visaRate'),
      label: t('home.stats.visaSuccessRate'),
    },
    {
      value: formatCount(counts.programs),
      label: t('home.stats.programsAvailable'),
    },
    {
      value: formatCount(counts.scholarships),
      label: t('home.stats.scholarshipsListed'),
    },
  ].filter((stat) => stat.value && stat.value.trim().length > 0);

  return (
    <>
      <section
        id="why-study-in-china"
        className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-[#1B2A4A] sm:text-4xl">{t('why.title')}</h2>
            <div className="mt-8 space-y-6">
              {[
                { icon: Star, title: t('why.quality'), desc: t('why.quality.desc') },
                { icon: DollarSign, title: t('why.affordable'), desc: t('why.affordable.desc') },
                { icon: Globe, title: t('why.culture'), desc: t('why.culture.desc') },
                { icon: Briefcase, title: t('why.global'), desc: t('why.global.desc') },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#1B2A4A15]">
                    <item.icon className="h-5 w-5 text-[#1B2A4A]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B2A4A]">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-[#1B2A4A]">
              {t('why.trustLine')}
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-8 border-[#9B1B30] font-semibold text-[#9B1B30] hover:bg-[#9B1B30] hover:text-white"
            >
              <Link href="/about">
                {t('why.learnMore')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="relative flex items-center justify-center">
            <Image
              src="/why-study-china.avif"
              alt={t('why.title')}
              width={500}
              height={400}
              className="mx-auto w-full max-w-lg"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 500px"
            />
          </div>
        </div>
      </section>

      {stats.length > 0 ? (
        <section className="bg-[#1B2A4A] text-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div
              className="stat-band grid gap-6 text-center sm:gap-8"
              style={{ '--stat-cols': String(stats.length) } as CSSProperties}
            >
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={
                    stats.length % 2 === 1 && index === stats.length - 1
                      ? 'col-span-2 min-w-0'
                      : 'min-w-0'
                  }
                >
                  <div className="text-3xl font-extrabold tracking-tight text-[#D4A853] sm:text-4xl lg:text-5xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-[11px] uppercase tracking-wider text-gray-300 sm:text-sm">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-[#1B2A4A] sm:text-4xl">
            {t('fields.title')}
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { icon: Cpu, label: t('fields.cs'), href: '/universities' },
              { icon: Wrench, label: t('fields.engineering'), href: '/universities' },
              { icon: TrendingUp, label: t('fields.business'), href: '/universities' },
              { icon: Heart, label: t('fields.medicine'), href: '/mbbs-in-china' },
              { icon: BrainCircuit, label: t('fields.ai'), href: '/universities' },
              { icon: Languages, label: t('fields.languages'), href: '/universities' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex flex-col items-center gap-3 border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center bg-[#1B2A4A12]">
                  <item.icon className="h-7 w-7 text-[#1B2A4A]" />
                </div>
                <span className="text-center text-sm font-semibold text-[#1B2A4A]">{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/universities"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#9B1B30] hover:underline"
            >
              {t('fields.viewAll')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-[#1B2A4A] sm:text-4xl">{t('sica.title')}</h2>
          <p className="mt-4 leading-relaxed text-gray-600">{t('sica.subtitle')}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: MessageSquare, title: t('sica.consult'), desc: t('sica.consult.desc'), step: '01' },
            {
              icon: FileText,
              title: t('sica.application'),
              desc: t('sica.application.desc'),
              step: '02',
              link: '/china-university-application-deadlines',
              linkLabel: t('home.deadlinesLink'),
            },
            { icon: Plane, title: t('sica.visa'), desc: t('sica.visa.desc'), step: '03' },
            { icon: Home, title: t('sica.arrival'), desc: t('sica.arrival.desc'), step: '04' },
          ].map((item) => (
            <div
              key={item.step}
              className="relative border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="absolute right-4 top-4 text-3xl font-extrabold text-gray-100">
                {item.step}
              </span>
              <div className="flex h-11 w-11 items-center justify-center bg-[#1B2A4A15]">
                <item.icon className="h-5 w-5 text-[#1B2A4A]" />
              </div>
              <h3 className="mt-4 font-semibold text-[#1B2A4A]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.desc}</p>
              {'link' in item && item.link ? (
                <Link
                  href={item.link}
                  className="mt-2 inline-block text-sm font-medium text-[#9B1B30] hover:underline"
                >
                  {item.linkLabel}
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <VideoTestimonials location="home" />
      <ConsultationActivity variant="compact" />

      {latestNews.length > 0 ? (
        <section className="border-t border-gray-200 bg-[#FAFAF8] py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9B1B30]">
                  <Newspaper className="h-4 w-4 text-[#1B2A4A]" />
                  {t('home.news.eyebrow')}
                </div>
                <h2 className="text-2xl font-bold text-[#1B2A4A] sm:text-3xl">
                  {t('home.news.title')}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-[#4B5563]">{t('home.news.subtitle')}</p>
              </div>
              <Link
                href="/news"
                className="hidden items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-[#9B1B30] hover:underline sm:inline-flex"
              >
                {t('home.news.viewAll')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestNews.map((post) => (
                <Link
                  key={post.slug}
                  href={`/news/${post.slug}`}
                  className="group block border-2 border-gray-200 bg-white p-5 transition-colors hover:border-[#9B1B30]"
                >
                  <div className="mb-2 flex items-center gap-2 text-[10px] text-gray-500">
                    <span className="font-semibold uppercase tracking-wider text-[#9B1B30]">
                      {categoryLabels[post.category] || post.category}
                    </span>
                    {post.published_at ? (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.published_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </>
                    ) : null}
                    {post.read_time_minutes ? (
                      <>
                        <span>·</span>
                        <Clock className="h-3 w-3" />
                        {t('home.news.minRead', { minutes: post.read_time_minutes })}
                      </>
                    ) : null}
                  </div>
                  <h3 className="line-clamp-2 font-bold leading-snug text-[#1B2A4A] transition-colors group-hover:text-[#9B1B30]">
                    {post.title_en}
                  </h3>
                  {post.excerpt_en ? (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">{post.excerpt_en}</p>
                  ) : null}
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center sm:hidden">
              <Link
                href="/news"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#9B1B30] hover:underline"
              >
                {t('home.news.viewAll')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {latestAdmissions.length > 0 ? (
        <section className="border-t border-gray-200 bg-white py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9B1B30]">
                  <Trophy className="h-4 w-4 text-[#1B2A4A]" />
                  {t('successStories.eyebrow')}
                </div>
                <h2 className="text-2xl font-bold text-[#1B2A4A] sm:text-3xl">
                  {t('successStories.title')}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-[#4B5563]">
                  {t('successStories.countLabel')}
                </p>
              </div>
              <Link
                href="/success-stories"
                className="hidden items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-[#9B1B30] hover:underline sm:inline-flex"
              >
                {t('successStories.viewAll')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestAdmissions.map((notice) => (
                <Link
                  key={notice.id}
                  href="/success-stories"
                  className="group block overflow-hidden border-2 border-gray-200 bg-white transition-colors hover:border-[#9B1B30]"
                >
                  <div className="relative aspect-[3/4] bg-gray-100">
                    <Image
                      src={admissionImageUrl(notice.image_path)}
                      alt={`${notice.student_name} — ${notice.university_name}`}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[#1B2A4A] transition-colors group-hover:text-[#9B1B30]">
                        {notice.university_name}
                      </h3>
                      {notice.degree ? (
                        <span className="flex-shrink-0 border border-[#9B1B30] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9B1B30]">
                          {notice.degree}
                        </span>
                      ) : null}
                    </div>
                    {notice.program ? (
                      <p className="mb-2 line-clamp-1 text-xs text-gray-600">{notice.program}</p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
                      {notice.country ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-[#1B2A4A]" />
                          {notice.country}
                        </span>
                      ) : null}
                      {notice.intake ? <span>{notice.intake}</span> : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/success-stories"
                className="inline-flex items-center gap-2 bg-[#9B1B30] px-8 py-3 font-semibold text-white transition-colors hover:bg-[#7a1626]"
              >
                <Trophy className="h-4 w-4" />
                {t('successStories.ctaButton')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-[#1B2A4A]">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{t('cta.title')}</h2>
          <p className="mt-4 text-lg text-gray-300">{t('cta.subtitle')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/assessment">
              <Button className="bg-[#9B1B30] px-8 py-3 text-base font-semibold text-white hover:bg-[#7A1526]">
                {t('cta.apply')}
              </Button>
            </Link>
            <Link href="mailto:info@studyinchina.academy">
              <Button
                variant="outline"
                className="border-white bg-transparent px-8 py-3 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
              >
                {t('cta.contact')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
