import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { getServerT } from '@/lib/server-t';
import { ContactForm } from './contact-form';

export default async function ContactPage() {
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
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{t('contact.title')}</h1>
          <p className="mt-3 text-lg text-gray-300 max-w-xl">{t('contact.subtitle')}</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact Form - Left */}
          <div className="lg:col-span-3">
            <ContactForm
              formTitle={t('contact.formTitle')}
              labels={{
                name: t('contact.name'),
                email: t('contact.email'),
                phone: t('contact.phone'),
                subject: t('contact.subject'),
                message: t('contact.message'),
                messagePlaceholder: t('contact.messagePlaceholder'),
                submit: t('contact.submit'),
                subjectGeneral: t('contact.subjectGeneral'),
                subjectApplication: t('contact.subjectApplication'),
                subjectScholarship: t('contact.subjectScholarship'),
                subjectVisa: t('contact.subjectVisa'),
                subjectOther: t('contact.subjectOther'),
              }}
              successMessages={{
                title: 'Message Sent!',
                body: 'Thank you for reaching out. Our team will get back to you within 24 hours.',
                sendAnother: 'Send Another Message',
              }}
            />
          </div>

          {/* Contact Info & QR Codes - Right */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <div className="bg-white border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-[#1F2937] mb-4">{t('contact.infoTitle')}</h2>
              <p className="text-sm text-[#4B5563] mb-6">{t('contact.infoDesc')}</p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-[#1B2A4A] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-[#1F2937]">{t('contact.emailLabel')}</div>
                    <a href="mailto:mlsjahid@qq.com" className="text-sm text-[#4B5563] hover:text-[#9B1B30] transition-colors">
                      mlsjahid@qq.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-[#1B2A4A] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-[#1F2937]">{t('contact.phoneLabel')}</div>
                    <a
                      href="https://wa.me/8617325764171"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#4B5563] hover:text-[#9B1B30] transition-colors"
                    >
                      +86 173 2576 4171
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#1B2A4A] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-[#1F2937]">{t('contact.addressLabel')}</div>
                    <div className="text-sm text-[#4B5563]">{t('contact.addressValue')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Codes */}
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-[#1F2937] mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-[#1B2A4A]" />
                Chat With Us
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="bg-[#F3F4F6] border border-gray-200 p-3 inline-block">
                    <Image
                      src="/wechat-qr.jpeg"
                      alt="WeChat QR Code"
                      width={140}
                      height={140}
                      className="object-contain"
                    />
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-semibold text-[#1F2937]">{t('contact.wechat')}</div>
                    <div className="text-xs text-[#4B5563]">{t('contact.wechatDesc')}</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-[#F3F4F6] border border-gray-200 p-3 inline-block">
                    <Image
                      src="/whatsapp-qr.jpeg"
                      alt="WhatsApp QR Code"
                      width={140}
                      height={140}
                      className="object-contain"
                    />
                  </div>
                  <div className="mt-2">
                    <div className="text-sm font-semibold text-[#1F2937]">{t('contact.whatsapp')}</div>
                    <div className="text-xs text-[#4B5563]">{t('contact.whatsappDesc')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-white border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-[#1F2937] mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#1B2A4A]" />
                {t('contact.hoursTitle')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#1F2937] font-medium">{t('contact.hoursWeekday')}</span>
                  <span className="text-[#4B5563]">{t('contact.hoursWeekdayTime')}</span>
                </div>
                <div className="border-t border-gray-100" />
                <div className="flex justify-between text-sm">
                  <span className="text-[#1F2937] font-medium">{t('contact.hoursSaturday')}</span>
                  <span className="text-[#4B5563]">{t('contact.hoursSaturdayTime')}</span>
                </div>
                <div className="border-t border-gray-100" />
                <div className="flex justify-between text-sm">
                  <span className="text-[#1F2937] font-medium">{t('contact.hoursSunday')}</span>
                  <span className="text-[#4B5563]">{t('contact.hoursSundayTime')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
