import { Mail, MessageCircle, MapPin } from 'lucide-react';
import { getServerLocale } from '@/lib/server-t';
import { LEGAL_CONTACT, LEGAL_DOCS, type LegalDocSlug } from '@/lib/legal-docs';

/**
 * Shared renderer for the two legal documents (`/privacy` and
 * `/terms`).
 *
 * Both documents live in `src/lib/legal-docs.ts` as a bilingual
 * module (en + zh side by side) rather than as i18n keys — they are
 * long-form documents, not UI chrome. See that file's header comment
 * for the review caveat.
 *
 * Server component: the locale comes from the `sica-locale` cookie
 * (the same source the rest of the site's server-rendered copy uses),
 * so the document renders in the reader's language on first paint —
 * no client-side language flash, no hydration mismatch.
 *
 * Structure:
 *   1. Hero band — navy, title + last-updated date.
 *   2. Two-column body — sticky table of contents (lg) + sections.
 *   3. Contact block — the same email/WhatsApp/HQ triple the footer
 *      uses, so the reader can reach a human from the document.
 */
export async function LegalPage({ slug }: { slug: LegalDocSlug }) {
  const locale = await getServerLocale();
  const doc = LEGAL_DOCS[slug];
  const v = locale === 'zh' ? doc.zh : doc.en;

  return (
    <div className="bg-[#FAFAF8]">
      {/* ──────────────  Hero  ────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/hero-bg.avif)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B2A4A] via-[#1B2A4A]/80 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{v.title}</h1>
          <p className="mt-3 text-lg text-gray-300 max-w-2xl leading-relaxed">{v.intro}</p>
          <p className="mt-4 text-xs uppercase tracking-wider text-[#D4A853] font-semibold">
            {v.updatedLabel}
          </p>
        </div>
      </section>

      {/* ──────────────  Body  ────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-[240px_minmax(0,1fr)] gap-10 lg:gap-14">
          {/* Table of contents — sticky on desktop, inline on mobile */}
          <nav aria-label={v.title} className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">
              {locale === 'zh' ? '目录' : 'Contents'}
            </p>
            <ol className="space-y-1.5 border-l border-gray-200">
              {v.sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block border-l-2 border-transparent -ml-px pl-3 text-sm text-gray-600 hover:border-[#9B1B30] hover:text-[#9B1B30] transition-colors"
                  >
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Sections */}
          <article className="max-w-3xl">
            {v.sections.map((s) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-24 pb-10 mb-10 border-b border-gray-200 last:border-0 last:pb-0 last:mb-0"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-[#1B2A4A] mb-4">
                  {s.heading}
                </h2>
                {s.paragraphs.map((p, i) => (
                  <p key={i} className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                    {p}
                  </p>
                ))}
                {s.bullets && s.bullets.length > 0 && (
                  <ul className="space-y-2.5">
                    {s.bullets.map((b, i) => (
                      <li key={i} className="flex gap-3 text-sm sm:text-base text-gray-700 leading-relaxed">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-0.5 w-3 flex-shrink-0 bg-[#9B1B30]"
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* Contact block */}
            <div className="mt-10 bg-white border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-[#1F2937] mb-4">
                {locale === 'zh' ? '联系我们' : 'Contact us'}
              </h2>
              <div className="space-y-3">
                <a
                  href={`mailto:${LEGAL_CONTACT.email}`}
                  className="flex items-center gap-3 text-sm text-[#4B5563] hover:text-[#9B1B30] transition-colors"
                >
                  <Mail className="h-4 w-4 text-[#1B2A4A] flex-shrink-0" />
                  {LEGAL_CONTACT.email}
                </a>
                <a
                  href={`https://wa.me/8617325764171`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-[#4B5563] hover:text-[#9B1B30] transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-[#1B2A4A] flex-shrink-0" />
                  WhatsApp {LEGAL_CONTACT.whatsapp}
                </a>
                <div className="flex items-center gap-3 text-sm text-[#4B5563]">
                  <MapPin className="h-4 w-4 text-[#1B2A4A] flex-shrink-0" />
                  {LEGAL_CONTACT.address}
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
