import Link from 'next/link';
import { Users, Eye, Heart, Globe, Building, GraduationCap, Award, Clock } from 'lucide-react';
import { getServerT } from '@/lib/server-t';

export default async function AboutPage() {
  const t = await getServerT();

  const stats = [
    { icon: Users, value: t('about.statsStudents'), label: t('about.statsStudentsLabel') },
    { icon: Building, value: t('about.statsUniversities'), label: t('about.statsUniversitiesLabel') },
    { icon: Clock, value: t('about.statsYears'), label: t('about.statsYearsLabel') },
    { icon: Globe, value: t('about.statsCountries'), label: t('about.statsCountriesLabel') },
  ];

  const values = [
    { icon: Award, title: t('about.valueProfessionalism'), desc: t('about.valueProfessionalismDesc') },
    { icon: Eye, title: t('about.valueTransparency'), desc: t('about.valueTransparencyDesc') },
    { icon: Heart, title: t('about.valueStudentFirst'), desc: t('about.valueStudentFirstDesc') },
    { icon: Globe, title: t('about.valueCultural'), desc: t('about.valueCulturalDesc') },
  ];

  const team = [
    { name: 'Dr. Li Wei', role: 'Founder & Director', desc: 'Former international student advisor at Tsinghua University with 15+ years in education consulting.' },
    { name: 'Sarah Chen', role: 'Head of Admissions', desc: 'Bilingual consultant specializing in application strategy and university placement.' },
    { name: 'Zhang Ming', role: 'Scholarship Advisor', desc: 'Expert in CSC and provincial scholarship applications with a 95% success rate.' },
    { name: 'Emma Liu', role: 'Student Services Manager', desc: 'Dedicated to ensuring smooth transitions for students arriving in China.' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/hero-bg.avif)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B2A4A] via-[#1B2A4A]/80 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{t('about.title')}</h1>
          <p className="mt-3 text-lg text-gray-300 max-w-xl">{t('about.subtitle')}</p>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937] mb-4">{t('about.missionTitle')}</h2>
            <p className="text-[#4B5563] leading-relaxed">{t('about.missionDesc')}</p>
          </div>
          <div className="relative">
            <div className="bg-[#1B2A4A] p-8 text-white">
              <GraduationCap className="h-12 w-12 text-white/80 mb-4" />
              <blockquote className="text-lg font-medium leading-relaxed">
                &ldquo;We believe every student deserves access to world-class education, regardless of where they come from. China&apos;s universidades offer incredible opportunities, and SICA is here to open that door.&rdquo;
              </blockquote>
              <p className="mt-4 text-gray-400">— Dr. Li Wei, Founder</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#1B2A4A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-8 w-8 text-[#D4A853] mx-auto mb-3" />
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#1F2937] mb-4">{t('about.storyTitle')}</h2>
          <p className="text-[#4B5563] leading-relaxed">{t('about.storyDesc')}</p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#F3F4F6]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-[#1F2937] text-center mb-10">{t('about.valuesTitle')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow duration-150"
              >
                <value.icon className="h-8 w-8 text-[#1B2A4A] mb-4" />
                <h3 className="text-lg font-semibold text-[#1F2937] mb-2">{value.title}</h3>
                <p className="text-sm text-[#4B5563] leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-[#1F2937] text-center mb-10">{t('about.teamTitle')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div
              key={member.name}
              className="bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow duration-150"
            >
              <div className="h-20 w-20 bg-[#F3F4F6] flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-[#1B2A4A]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1F2937] text-center">{member.name}</h3>
              <p className="text-sm text-[#9B1B30] font-medium text-center mt-1">{member.role}</p>
              <p className="text-sm text-[#4B5563] leading-relaxed mt-3 text-center">{member.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/hero-bg.avif)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B2A4A] via-[#1B2A4A]/80 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">{t('about.ctaTitle')}</h2>
          <p className="mt-3 text-gray-300 max-w-xl mx-auto">{t('about.ctaDesc')}</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/universities"
              className="inline-flex items-center px-6 py-3 bg-[#9B1B30] text-white font-semibold uppercase tracking-wider text-sm hover:bg-[#7A1526] transition-colors duration-150"
            >
              {t('hero.explore')}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-white text-white font-semibold uppercase tracking-wider text-sm bg-transparent hover:bg-white/10 hover:text-white transition-colors duration-150"
            >
              {t('nav.contact')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
