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
} from 'lucide-react';
import { universities as staticUniversities } from '@/lib/data';

export default async function HomePage() {
  const t = await getServerT();

  // Pick 3 featured universidades for the hero. Strategy: top 3 by
  // China ranking. If the static data set is small, fall back to
  // whatever's there. The list is server-rendered, so the cards
  // are baked into the initial HTML (no client fetch on first
  // paint). For a future "admin-curated featured" feature, add
  // a `featured: boolean` field and filter on that instead.
  const featured = [...staticUniversities]
    .sort((a, b) => a.ranking - b.ranking)
    .slice(0, 3);

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
                <Link href="/universities">
                  <Button
                    variant="outline"
                    className="border-white bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold px-7 py-3 text-base"
                  >
                    {t('hero.howToApply')}
                  </Button>
                </Link>
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

      {/* Why Study in China */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
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
              variant="outline"
              className="mt-8 border-[#9B1B30] text-[#9B1B30] hover:bg-[#9B1B30] hover:text-white font-semibold"
            >
              {t('why.learnMore')}
              <ArrowRight className="ml-2 h-4 w-4" />
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
            <Link href="/universities">
              <Button className="bg-[#9B1B30] hover:bg-[#7A1526] text-white font-semibold px-8 py-3 text-base">
                {t('cta.apply')}
              </Button>
            </Link>
            <Link href="mailto:mlsjahid@qq.com">
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
