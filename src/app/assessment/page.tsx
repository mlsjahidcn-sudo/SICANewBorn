import type { Metadata } from "next";
import { buildLanguageAlternates } from "@/lib/alternates";
import { FileText, Mail, MessageCircle, MapPin } from 'lucide-react';
import Image from 'next/image';
import { getServerT } from '@/lib/server-t';
import { AssessmentForm } from './assessment-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t('assessment.title'),
    description: t('assessment.description'),
    alternates: buildLanguageAlternates('/assessment'),
    openGraph: {
      title: t('assessment.title'),
      description: t('assessment.description'),
      url: '/assessment',
      images: ['/og-default.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('assessment.title'),
      description: t('assessment.description'),
      images: ['/og-default.png'],
    },
  };
}

export default async function AssessmentPage() {
  const t = await getServerT();
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
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white sm:text-4xl">{t('assessment.hero.title')}</h1>
          </div>
          <p className="mt-3 text-lg text-gray-300 max-w-xl">
            {t('assessment.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Assessment Form - Left */}
          <div className="lg:col-span-3">
            <AssessmentForm />
          </div>

          {/* Assessment Info & QR Codes - Right */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-[#1F2937] mb-4">{t('assessment.howItWorks.title')}</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="h-8 w-8 bg-[#9B1B30]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#9B1B30] font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1F2937] text-sm">{t('assessment.howItWorks.step1.title')}</h4>
                    <p className="text-xs text-[#4B5563]">
                      {t('assessment.howItWorks.step1.desc')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 bg-[#9B1B30]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#9B1B30] font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1F2937] text-sm">{t('assessment.howItWorks.step2.title')}</h4>
                    <p className="text-xs text-[#4B5563]">
                      {t('assessment.howItWorks.step2.desc')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-8 w-8 bg-[#9B1B30]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#9B1B30] font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#1F2937] text-sm">{t('assessment.howItWorks.step3.title')}</h4>
                    <p className="text-xs text-[#4B5563]">
                      {t('assessment.howItWorks.step3.desc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-[#1F2937] mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#1B2A4A]" />
                {t('assessment.contact.title')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-[#1B2A4A] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-[#1F2937]">{t('assessment.contact.email')}</div>
                    <a href="mailto:info@studyinchina.academy" className="text-sm text-[#4B5563] hover:text-[#9B1B30] transition-colors">
                      info@studyinchina.academy
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-[#1F2937] mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[#1B2A4A]" />
                {t('assessment.chat.title')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="bg-[#F3F4F6] border border-gray-200 p-3 inline-block">
                    <Image
                      src="/wechat-qr.jpeg"
                      alt={t('assessment.chat.wechat')}
                      width={180}
                      height={180}
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-semibold text-[#1F2937]">{t('assessment.chat.wechat')}</div>
                    <div className="text-xs text-[#4B5563]">{t('assessment.chat.scanToChat')}</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-[#F3F4F6] border border-gray-200 p-3 inline-block">
                    <Image
                      src="/whatsapp-qr.jpeg"
                      alt={t('assessment.chat.whatsapp')}
                      width={180}
                      height={180}
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-semibold text-[#1F2937]">{t('assessment.chat.whatsapp')}</div>
                    <div className="text-xs text-[#4B5563]">{t('assessment.chat.scanToChat')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
