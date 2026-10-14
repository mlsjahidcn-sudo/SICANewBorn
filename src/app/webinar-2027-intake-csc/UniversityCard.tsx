/**
 * Phase 162: per-university card section of the public webinar
 * page. Async RSC — calls `getServerT()` for the i18n keys
 * directly. Reads the 4 university-kind topic rows for a
 * single featured school and lays them out as 4 stacked
 * blocks inside one card.
 *
 * Topics grouped by `kind`:
 *   - program     → programs available at the school
 *   - scholarship → the school's scholarship(s)
 *   - timing      → best time to apply
 *   - requirement → admission requirements
 *
 * Empty `kind` rows render as a small grey placeholder so the
 * admin / visitor can spot gaps at a glance.
 */

import { Building2 } from 'lucide-react';
import { getServerT } from '@/lib/server-t';
import type { WebinarTopic, WebinarTopicKind } from '@/lib/webinar-sessions';

interface UniversityCardProps {
  university: {
    id: string;
    slug: string;
    name: string;
    nameZh: string;
    city: string | null;
    logo: string | null;
  };
  topicsByKind: Partial<Record<WebinarTopicKind, WebinarTopic>>;
}

const KIND_ORDER: WebinarTopicKind[] = ['program', 'scholarship', 'timing', 'requirement'];

export async function UniversityCard({ university, topicsByKind }: UniversityCardProps) {
  const t = await getServerT();
  const hasAnyTopic = KIND_ORDER.some((k) => topicsByKind[k]);

  return (
    <div className="bg-white border-2 border-[#1B2A4A]/15 flex flex-col">
      {/* Card header — logo + name + city */}
      <div className="p-5 border-b border-gray-200 flex items-start gap-4">
        <UniversityLogo logo={university.logo} name={university.name} />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-[#1B2A4A] leading-tight">
            {university.name}
          </h3>
          <p className="text-sm text-[#4B5563] mt-0.5">{university.nameZh}</p>
          {university.city && (
            <p className="text-xs text-[#9B1B30] font-semibold mt-1">
              {university.city}
            </p>
          )}
        </div>
      </div>

      {/* 4 kind blocks — empty kinds render as a tiny placeholder
          so admins / visitors see which section has no copy yet */}
      <div className="p-5 space-y-4 flex-1">
        {KIND_ORDER.map((kind) => {
          const topic = topicsByKind[kind];
          const sectionTitle = t(`webinar.card.sections.${kind}`);
          return (
            <div key={kind}>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B1B30] mb-1.5">
                {sectionTitle}
              </p>
              {topic ? (
                <p className="text-sm text-[#1F2937] leading-relaxed whitespace-pre-line">
                  {topic.bodyEn}
                </p>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  {t('webinar.card.noContent')}
                </p>
              )}
            </div>
          );
        })}
        {!hasAnyTopic && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2 mt-2">
            {t('webinar.card.noTopicsAtAll')}
          </p>
        )}
      </div>
    </div>
  );
}

function UniversityLogo({ logo, name }: { logo: string | null; name: string }) {
  if (!logo) {
    return (
      <div className="flex-shrink-0 h-14 w-14 bg-[#1B2A4A]/10 flex items-center justify-center">
        <Building2 className="h-7 w-7 text-[#1B2A4A]" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      alt={`${name} logo`}
      className="flex-shrink-0 h-14 w-14 object-contain bg-white border border-gray-200"
      loading="lazy"
    />
  );
}