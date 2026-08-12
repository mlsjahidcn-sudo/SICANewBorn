import type { Metadata } from "next";
import { buildLanguageAlternates } from "@/lib/alternates";
import Link from 'next/link';
import Image from 'next/image';
import { getServerT } from '@/lib/server-t';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  BookOpen,
  Award,
  Headphones,
  Star,
  DollarSign,
  Globe,
  Briefcase,
  Cpu,
  Wrench,
  TrendingUp,
  Heart,
  BrainCircuit,
  Languages,
  MessageSquare,
  FileText,
  Plane,
  Home,
  ArrowRight,
  MapPin,
  Newspaper,
  Calendar,
  Clock,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { getAllUniversities } from '@/lib/data-fetcher';
import { isSupabaseServerConfigured, getSupabaseServer } from '@/lib/supabase-server';
import { VideoTestimonials } from '@/components/VideoTestimonials';
import { GetStartedCta } from '@/components/GetStartedCta';

export const metadata: Metadata = {
  alternates: buildLanguageAlternates('/'),
};

// Home page is server-rendered. We re-fetch the live list on every
// request (with a 60s edge cache via `revalidate`) so newly-added
// AI-generated or admin-imported universidades automatically appear
// in the hero, partner logo strip, and any other university-driven
// section. Cached for 60s — same trade-off as the other RSC pages.
export const revalidate = 60;

export default async function HomePage() {
  const t = await getServerT();

  // Pick 3 featured universidades for the hero. Strategy: top 3 by
  // China ranking. If the list is empty, fall back to whatever's
  // there. The list is server-rendered, so the cards are baked
  // into the initial HTML (no client fetch on first paint).
  const liveUnis = await getAllUniversities();
  const featured = [...liveUnis]
    .sort((a, b) => a.ranking - b.ranking)
    .slice(0, 3);

  // S38: latest news for the home page widget. Server-rendered so
  // the cards are in the initial HTML (good for SEO + LLMs that
  // don't run JS). Only the 3 most recent published posts. Same
  // RLS-aware fetch pattern as the sitemap — admin/service-role
  // path is fine, the published-only filter is enforced at the DB
  // level too.
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
  // Map the raw DB category → human label. Mirrors the same
  // dictionary the /news index uses so the badges look identical
  // across pages.
  const CATEGORY_LABEL_HOME: Record<string, string> = {
    announcement: 'Announcement',
    partnership: 'Partnership',
    scholarship: 'Scholarship',
    university: 'University news',
    event: 'Event',
    guide: 'Study guide',
  };
  let latestNews: NewsTeaser[] = [];
  if (isSupabaseServerConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { data } = await supabase
        .from('news_posts')
        .select(
          'slug, title_en, title_zh, excerpt_en, cover_image, category, tags, published_at, read_time_minutes',
        )
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3);
      if (data) latestNews = data as NewsTeaser[];
    }
  }

  // Phase 51: latest 3 published admission notices for the home
  // page Success Stories block. RLS on admission_notices already
  // scopes to is_published=TRUE so we don't need to add the filter
  // here — but we add it explicitly so the page is robust if RLS
  // is ever weakened in a future migration. The headline "10,000+
  // students admitted" number is a hardcoded marketing stat
  // (see i18n.successStories.countLabel) — not derived from the
  // showcase count.
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
  let latestAdmissions: AdmissionTeaser[] = [];
  if (isSupabaseServerConfigured()) {
    const supabase = getSupabaseServer();
    if (supabase) {
      const { data } = await supabase
        .from('admission_notices')
        .select('id, student_name, university_name, program, degree, intake, country, image_path')
        .eq('is_published', true)
        .order('display_order', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(3);
      if (data) latestAdmissions = data as AdmissionTeaser[];
    }
  }
  // Build the public URL for each image. The admission-notices
  // bucket is public-read so getPublicUrl() is sufficient.
  function admissionImageUrl(imagePath: string): string {
    const supabaseUrl =
      process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    return `${supabaseUrl}/storage/v1/object/public/admission-notices/${imagePath}`;
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(/hero-bg.avif)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B2A4A] via-[#1B2A4A]/95 to-[#1B2A4A]/40" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-3 max-w-2xl">
              {/* Phase 2 funnel: 2-product path selector above the
                  hero headline. The visitor picks which product they
                  want before any CTA fires. The 2-pill design is
                  intentionally low-friction — no "choose your path"
                  gate, no expanded copy. Just two clear options that
                  route to the right product. */}
              <div className="mb-6 inline-flex flex-wrap items-stretch border border-white/20 bg-white/5 backdrop-blur-sm">
                <Link
                  href="/assessment"
                  className="group flex-1 sm:flex-none px-5 py-3 hover:bg-[#9B1B30] transition-colors"
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#D4A853] mb-1 group-hover:text-white">
                    {t('choosePath.path1Label')}
                  </div>
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Sparkles className="h-4 w-4 text-[#D4A853] group-hover:text-white" />
                    {t('choosePath.fullService')}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 group-hover:text-white/80">
                    {t('choosePath.fullServiceHint')}
                  </div>
                </Link>
                <div className="hidden sm:block w-px bg-white/20" />
                <Link
                  href="/resources"
                  className="group flex-1 sm:flex-none px-5 py-3 hover:bg-white/10 transition-colors"
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9B1B30] mb-1 group-hover:text-white">
                    {t('choosePath.path2Label')}
                  </div>
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <BookOpen className="h-4 w-4 text-white/80" />
                    {t('choosePath.selfServe')}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 group-hover:text-white/80">
                    {t('choosePath.selfServeHint')}
                  </div>
                </Link>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.05]">
                {t('hero.title')}
                <br />
                <span className="text-white">{t('hero.tagline')}</span>
              </h1>
              <p className="mt-5 text-base text-gray-300 leading-relaxed sm:text-lg max-w-xl">
                {t('hero.subtitle')}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/universities">
                  <Button className="bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold px-7 py-3 text-base">
                    {t('hero.explore')}
                  </Button>
                </Link>
                {/* H1 (funnel audit): was also /universities.
                    Two CTAs pointing at the same page is a
                    wasted opportunity. The secondary button
                    reads "How to Apply" — that's a question,
                    not a browse action. The /guides/application
                    page answers it with the actual process
                    (documents, timeline, fees) at zero
                    commitment. Funnel split:
                      - /universities  : browse
                      - /guides/application : learn
                      - /get-started  : compare packages
                      - /assessment    : commit (bottom CTA) */}
                <Link href="/guides/application">
                  <Button
                    variant="outline"
                    className="border-white bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold px-7 py-3 text-base"
                  >
                    {t('hero.howToApply')}
                  </Button>
                </Link>
                {/* Phase 58: explicit "Get started" CTA pointing
                    at the /get-started sales page (Phase 57).
                    Distinct from /assessment (the 4-step
                    commit-level intake) and /resources (the
                    self-serve DIY escape). This is the
                    mid-commit slot — visitor is interested
                    enough to want a quote, not ready for a
                    4-step form yet. Sparkles icon + crimson
                    hero button makes it visually distinct
                    from the existing 2 buttons. */}
                <GetStartedCta variant="hero" location="home_hero" />
              </div>
            </div>

            {/* Right side: 3 featured universidad cards. Hidden on
                mobile (the hero text is enough); visible on lg+
                where there's horizontal space. Stacks vertically
                with a small gap so each card is distinct. */}
            <div className="hidden lg:block lg:col-span-2 space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-2 flex items-center gap-2">
                <span className="h-px w-6 bg-white/40" />
                {t('hero.featured', { default: 'Featured Top Universities' })}
              </div>
              {featured.map((u) => (
                <Link
                  key={u.slug}
                  href={`/universities/${u.slug}`}
                  className="group flex items-center gap-3 bg-white/95 hover:bg-white p-3 border-2 border-transparent hover:border-[#D4A853] transition-all duration-200"
                >
                  {/* Plain <img> instead of UniversityLogo because
                      the existing component only supports 'card' (big
                      64x64) and 'detail' (88x88 round) variants. The
                      hero card needs an inline 40x40 square logo. */}
                  {u.logo && u.logo.startsWith('http') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={u.logo}
                      alt={u.name}
                      className="w-10 h-10 object-contain bg-white border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-[#1B2A4A]/10 border border-gray-200 shrink-0 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-[#1B2A4A]" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors truncate">
                        {u.name}
                      </h3>
                      <span className="shrink-0 inline-flex items-center justify-center bg-[#9B1B30] text-white text-[10px] font-bold w-5 h-5">
                        {u.ranking}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#4B5563] mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{u.city}, China</span>
                      {u.qsWorldRanking ? (
                        <span className="ml-auto text-[10px] font-semibold text-[#1B2A4A] shrink-0">
                          QS #{u.qsWorldRanking}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#9B1B30] group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="relative -mt-10 z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: GraduationCap, label: t('quick.top'), desc: t('quick.top.desc') },
            { icon: BookOpen, label: t('quick.diverse'), desc: t('quick.diverse.desc') },
            { icon: Award, label: t('quick.scholarships'), desc: t('quick.scholarships.desc') },
            { icon: Headphones, label: t('quick.support'), desc: t('quick.support.desc') },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 rounded-none border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md text-center"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-none bg-[#1B2A4A15]"
              >
                <item.icon className="h-5 w-5 text-[#1B2A4A]" />
              </div>
              <h3 className="text-sm font-semibold text-[#1B2A4A]">{item.label}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Study in China — S42: id="why-study-in-china" matches the
          hash on the About submenu's "Why Study in China" link, so the
          page actually scrolls here instead of silently reloading. */}
      <section
        id="why-study-in-china"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 scroll-mt-20"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-[#1B2A4A15]">
                    <item.icon className="h-5 w-5 text-[#1B2A4A]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1B2A4A]">{item.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              asChild
              variant="outline"
              className="mt-8 border-[#9B1B30] text-[#9B1B30] hover:bg-[#9B1B30] hover:text-white font-semibold"
            >
              {/* Phase 1 fix: was a bare <Button> with no onClick/href —
                  dead click on the home page. Routes to /about which
                  actually has the SICA story behind the "Why study in
                  China" pitch. */}
              <Link href="/about">
                {t('why.learnMore')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="relative flex items-center justify-center">
            <Image
              src="/why-study-china.avif"
              alt="Study in China"
              width={500}
              height={400}
              className="w-full max-w-lg mx-auto"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 500px"
            />
          </div>
        </div>
      </section>

      {/* By the Numbers — hard stats that LLMs and humans can cite.
          The number should be accurate to the data we have. Update
          when verified numbers change. */}
      <section className="bg-[#1B2A4A] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 text-center">
            {[
              { value: '50+', label: 'Partner Universities' },
              { value: '200+', label: 'Programs Available' },
              { value: '30+', label: 'Countries Represented' },
              { value: '95%', label: 'Visa Success Rate' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl sm:text-5xl font-extrabold text-[#D4A853]">
                  {stat.value}
                </div>
                <div className="mt-2 text-xs sm:text-sm text-gray-300 uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner University Logos — trust signal. Uses the same
          image URLs as the university cards (already CDN-cached). */}
      <section className="bg-[#FAFAF8] border-y border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-6">
            Trusted by students at China's top universities
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 sm:gap-6 items-center">
            {liveUnis.slice(0, 8).map((u) => (
              <Link
                key={u.slug}
                href={`/universities/${u.slug}`}
                className="group flex flex-col items-center gap-2"
                title={u.name}
              >
                {u.logo && u.logo.startsWith('http') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={u.logo}
                    alt={u.name}
                    className="h-10 sm:h-12 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-200"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-10 sm:h-12 w-10 sm:w-12 bg-white border border-gray-200 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-[#1B2A4A]" />
                  </div>
                )}
                <span className="text-[10px] sm:text-xs text-gray-500 text-center line-clamp-1 group-hover:text-[#9B1B30] transition-colors">
                  {u.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Fields */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1B2A4A] sm:text-4xl text-center">
            {t('fields.title')}
          </h2>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Cpu, label: t('fields.cs') },
              { icon: Wrench, label: t('fields.engineering') },
              { icon: TrendingUp, label: t('fields.business') },
              { icon: Heart, label: t('fields.medicine') },
              { icon: BrainCircuit, label: t('fields.ai') },
              { icon: Languages, label: t('fields.languages') },
            ].map((item) => (
              <Link
                key={item.label}
                href="/universities"
                className="group flex flex-col items-center gap-3 rounded-none border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-none transition-colors bg-[#1B2A4A12]"
                >
                  <item.icon className="h-7 w-7 text-[#1B2A4A]" />
                </div>
                <span className="text-sm font-semibold text-[#1B2A4A] text-center">{item.label}</span>
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

      {/* SICA Services */}
      <section id="about" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1B2A4A] sm:text-4xl">{t('sica.title')}</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">{t('sica.subtitle')}</p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: MessageSquare, title: t('sica.consult'), desc: t('sica.consult.desc'), step: '01' },
            { icon: FileText, title: t('sica.application'), desc: t('sica.application.desc'), step: '02' },
            { icon: Plane, title: t('sica.visa'), desc: t('sica.visa.desc'), step: '03' },
            { icon: Home, title: t('sica.arrival'), desc: t('sica.arrival.desc'), step: '04' },
          ].map((item) => (
            <div
              key={item.step}
              className="relative rounded-none border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="absolute top-4 right-4 text-3xl font-extrabold text-gray-100">
                {item.step}
              </span>
              <div className="flex h-11 w-11 items-center justify-center rounded-none bg-[#1B2A4A15]">
                <item.icon className="h-5 w-5 text-[#1B2A4A]" />
              </div>
              <h3 className="mt-4 font-semibold text-[#1B2A4A]">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials — social proof. Replaced the previous
          text-only PLACEHOLDER cards with two real student
          review videos (Telia from Gabon + a current SICA
          student on a Chinese university campus). The
          <VideoTestimonials /> component is reused on every
          university detail page so the same trust signal
          surfaces wherever a prospective student is reading
          about a specific school. */}
      <VideoTestimonials location="home" />

      {/* S38: Latest from SICA News — server-rendered teaser row.
          Closes the home-page → news interlinking loop so the
          most visible page on the site (/) actively surfaces
          fresh news. Pulls only published posts, latest 3, so the
          section collapses cleanly when the news table is empty
          (the site won't look broken during the first week
          before any AI posts exist). Renders as a 3-up card grid
          matching the visual language of the rest of the home
          page, with a "View all news →" link to the /news index. */}
      {latestNews.length > 0 && (
        <section className="bg-[#FAFAF8] border-t border-gray-200 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9B1B30] mb-2">
                  <Newspaper className="h-4 w-4" />
                  Newsroom
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A]">
                  Latest from SICA
                </h2>
                <p className="mt-2 text-sm text-[#4B5563] max-w-2xl">
                  Updates on Chinese universidades, scholarships, and
                  partnerships — curated by the SICA Editorial Team.
                </p>
              </div>
              <Link
                href="/news"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#9B1B30] hover:underline whitespace-nowrap"
              >
                View all news
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestNews.map((post) => (
                <Link
                  key={post.slug}
                  href={`/news/${post.slug}`}
                  className="group block bg-white border-2 border-gray-200 hover:border-[#9B1B30] transition-colors p-5"
                >
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-2">
                      <span className="font-semibold uppercase tracking-wider text-[#9B1B30]">
                        {CATEGORY_LABEL_HOME[post.category] || post.category}
                      </span>
                      {post.published_at && (
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
                      )}
                      {post.read_time_minutes ? (
                        <>
                          <span>·</span>
                          <Clock className="h-3 w-3" />
                          {post.read_time_minutes} min read
                        </>
                      ) : null}
                    </div>
                    <h3 className="font-bold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors leading-snug line-clamp-2">
                      {post.title_en}
                    </h3>
                    {post.excerpt_en && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {post.excerpt_en}
                      </p>
                    )}
                </Link>
              ))}
            </div>
            <div className="sm:hidden mt-6 text-center">
              <Link
                href="/news"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#9B1B30] hover:underline"
              >
                View all news
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Phase 51: Success Stories — top 3 published admission
          notices as visual social proof. Renders before the final
          CTA so the user sees real admit letters right before the
          conversion ask. */}
      {latestAdmissions.length > 0 && (
        <section className="bg-white border-t border-gray-200 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#9B1B30] mb-2">
                  <Trophy className="h-4 w-4" />
                  Success Stories
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A]">
                  Real admission results
                </h2>
                <p className="mt-2 text-sm text-[#4B5563] max-w-2xl">
                  Over 10,000+ SICA students admitted to top Chinese universities — verified, current intake.
                </p>
              </div>
              <Link
                href="/success-stories"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#9B1B30] hover:underline whitespace-nowrap"
              >
                View all success stories
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestAdmissions.map((a) => (
                <Link
                  key={a.id}
                  href="/success-stories"
                  className="group block bg-white border-2 border-gray-200 hover:border-[#9B1B30] transition-colors overflow-hidden"
                >
                  <div className="relative aspect-[3/4] bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={admissionImageUrl(a.image_path)}
                      alt={`${a.student_name} — ${a.university_name}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors leading-snug line-clamp-2 text-sm">
                        {a.university_name}
                      </h3>
                      {a.degree && (
                        <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-[#9B1B30] border border-[#9B1B30] px-1.5 py-0.5 rounded-none">
                          {a.degree}
                        </span>
                      )}
                    </div>
                    {a.program && (
                      <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                        {a.program}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
                      {a.country && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {a.country}
                        </span>
                      )}
                      {a.intake && <span>{a.intake}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/success-stories"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#9B1B30] hover:bg-[#7a1626] text-white font-semibold rounded-none transition-colors"
              >
                <Trophy className="h-4 w-4" />
                See 10,000+ success stories
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(/hero-bg.avif)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B2A4A] via-[#1B2A4A]/80 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{t('cta.title')}</h2>
          <p className="mt-4 text-lg text-gray-300">{t('cta.subtitle')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {/* H2 (funnel audit): was /universities. The
                bottom-of-page CTA is the highest-intent slot
                on the home — the user has seen the hero, the
                why-SICA, the featured schools, the testimonials,
                the news, and now they're being asked "ready to
                take the next step?". Sending them back to
                /universities to browse more is wrong; the
                right move is the structured 4-step intake
                (/assessment) which captures goal + background
                + budget and is the highest-signal funnel
                path. /contact stays as a softer secondary
                for users who want to talk first instead of
                filling the form. */}
            <Link href="/assessment">
              <Button className="bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold px-8 py-3 text-base">
                {t('cta.apply')}
              </Button>
            </Link>
            <Link href="mailto:info@studyinchina.academy">
              <Button
                variant="outline"
                className="border-white bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold px-8 py-3 text-base"
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
