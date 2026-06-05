'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, GraduationCap, MapPin, Trophy, Banknote, BookOpen, Loader2 } from 'lucide-react';

export type ChatCardKind = 'university' | 'program';

export interface ChatCard {
  kind: ChatCardKind;
  slug: string;
}

interface ParsedSegment {
  type: 'text';
  content: string;
}
interface ParsedCard {
  type: 'card';
  kind: ChatCardKind;
  slug: string;
}
export type Segment = ParsedSegment | ParsedCard;

/**
 * Parse the assistant's text and split out inline card placeholders.
 *
 * Format:   [[CARD:university:tsinghua-university]]
 *           [[CARD:program:computer-science-bsc-tsinghua]]
 *
 * Anything outside the tag stays as a text segment. The tag itself
 * is consumed (not rendered as visible text). Unknown shapes
 * (missing kind, bad slug) are also dropped silently so a stray
 * tag never breaks the chat.
 *
 * Tag is on its own line in the source. We don't enforce that
 * strictly — a tag buried in the middle of a paragraph still
 * works, the line break just makes the AI prompt clearer.
 */
const CARD_RE = /\[\[CARD:(university|program):([a-z0-9-]+)\]\]/g;

export function parseAssistantText(text: string): Segment[] {
  if (!text) return [];
  const segments: Segment[] = [];
  let lastIndex = 0;
  // Reset regex state — `g` flag carries .lastIndex between calls
  CARD_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = CARD_RE.exec(text)) !== null) {
    const [full, kind, slug] = m;
    const start = m.index;
    if (start > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, start) });
    }
    if (kind === 'university' || kind === 'program') {
      segments.push({ type: 'card', kind, slug });
    }
    lastIndex = start + full.length;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }
  return segments;
}

/**
 * Inline card slot — renders a skeleton while the data loads, then
 * the actual card. Each card is fetched independently so a slow
 * slug doesn't block the rest of the message from rendering.
 */
function CardSlot({ kind, slug }: ChatCard) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/${kind === 'university' ? 'universities' : 'programs'}/${encodeURIComponent(slug)}`);
        if (cancelled) return;
        if (!res.ok) {
          setErrored(true);
          return;
        }
        const json = await res.json();
        const item = (json.university ?? json.program) as Record<string, unknown> | undefined;
        if (cancelled) return;
        if (item) {
          setData(item);
        } else {
          setErrored(true);
        }
      } catch {
        if (!cancelled) setErrored(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [kind, slug]);

  if (errored) {
    return (
      <div className="my-2 inline-flex items-center gap-1.5 text-xs text-gray-500 italic">
        <span>(couldn't load {kind} card)</span>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="my-2 inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-xs text-gray-500">
        <Loader2 size={12} className="animate-spin" />
        Loading {kind}…
      </div>
    );
  }

  return kind === 'university' ? (
    <UniversityCard data={data} />
  ) : (
    <ProgramCard data={data} />
  );
}

/**
 * Compact university card — navy bg, white text, gold rank
 * indicator. Sized to fit in the 80% chat bubble width.
 */
function UniversityCard({ data }: { data: Record<string, unknown> }) {
  const slug = data.slug as string;
  const name = (data.name as string) ?? slug;
  const nameCn = (data.nameCn as string) ?? '';
  const city = (data.city as string) ?? '';
  const cityCn = (data.cityCn as string) ?? '';
  const logo = (data.logo as string) ?? '';
  const ranking = typeof data.ranking === 'number' ? data.ranking : null;
  const qsRanking = (data.qsRanking as string) ?? '';
  const qsWorldRanking = typeof data.qsWorldRanking === 'number' ? data.qsWorldRanking : null;
  const type = (data.type as string) ?? '';

  return (
    <Link
      href={`/universities/${slug}`}
      className="group my-2 block w-full bg-[#1B2A4A] hover:bg-[#243456] text-white border-l-4 border-[#D4A853] transition-colors"
    >
      <div className="flex items-stretch gap-3 p-3">
        {/* Logo */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-white p-1.5">
          {logo && logo.startsWith('http') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={name} className="h-full w-full object-contain" />
          ) : (
            <GraduationCap className="h-7 w-7 text-[#1B2A4A]" />
          )}
        </div>
        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-bold text-sm leading-tight truncate">{name}</h4>
              {nameCn && (
                <div className="text-[11px] text-gray-300 truncate">{nameCn}</div>
              )}
            </div>
            <ArrowRight
              size={16}
              className="shrink-0 text-[#D4A853] group-hover:translate-x-0.5 transition-transform"
            />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-300">
            <span className="flex items-center gap-1">
              <MapPin size={10} />
              {city}
              {cityCn && <span className="text-gray-400">· {cityCn}</span>}
            </span>
            {ranking && ranking > 0 && (
              <span className="flex items-center gap-1 text-[#D4A853] font-semibold">
                <Trophy size={10} />
                #{ranking} in China
              </span>
            )}
            {qsWorldRanking && qsWorldRanking > 0 && (
              <span className="text-gray-400">QS #{qsWorldRanking}</span>
            )}
          </div>
          {type && (
            <div className="mt-1 text-[10px] text-gray-400 uppercase tracking-wider">{type}</div>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * Compact program card — white bg, crimson accent. Slightly
 * different visual from the university card so users can tell
 * the difference at a glance.
 */
function ProgramCard({ data }: { data: Record<string, unknown> }) {
  const slug = data.slug as string;
  const name = (data.name as string) ?? slug;
  const nameCn = (data.nameCn as string) ?? '';
  const degree = (data.degree as string) ?? '';
  const discipline = (data.discipline as string) ?? '';
  const language = (data.language as string) ?? '';
  const duration = (data.duration as string) ?? '';
  const tuition = (data.tuition as string) ?? '';
  const scholarshipAvailable = Boolean(data.scholarshipAvailable);
  const universityName = (data.universityName as string) ?? '';

  return (
    <Link
      href={`/programs/${slug}`}
      className="group my-2 block w-full bg-white hover:bg-[#FAFAF8] border border-gray-200 hover:border-[#9B1B30] border-l-4 border-l-[#9B1B30] transition-colors"
    >
      <div className="flex items-stretch gap-3 p-3">
        {/* Icon */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center bg-[#9B1B30] text-white">
          <BookOpen size={24} />
        </div>
        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-bold text-sm leading-tight text-[#1B2A4A] truncate">{name}</h4>
              {nameCn && (
                <div className="text-[11px] text-gray-500 truncate">{nameCn}</div>
              )}
            </div>
            <ArrowRight
              size={16}
              className="shrink-0 text-[#9B1B30] group-hover:translate-x-0.5 transition-transform"
            />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-600">
            {degree && (
              <span className="inline-block bg-[#9B1B30] text-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                {degree}
              </span>
            )}
            {discipline && <span>{discipline}</span>}
            {language && <span className="text-gray-500">{language}</span>}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-600">
            {duration && (
              <span className="flex items-center gap-1">
                <span className="text-gray-400">⏱</span>
                {duration}
              </span>
            )}
            {tuition && (
              <span className="flex items-center gap-1">
                <Banknote size={10} />
                {tuition}
              </span>
            )}
            {scholarshipAvailable && (
              <span className="inline-block text-[10px] font-semibold text-[#D4A853] border border-[#D4A853]/40 bg-[#D4A853]/10 px-1.5 py-0.5">
                Scholarship
              </span>
            )}
          </div>
          {universityName && (
            <div className="mt-1 text-[10px] text-gray-500 truncate">
              at {universityName}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * Render a full assistant message as an interleaved sequence of
 * text segments and card slots. Text is rendered as plain
 * paragraphs (whitespace-preserved); cards are async-loaded
 * inline slots.
 */
export function AssistantContent({ text }: { text: string }) {
  const segments = parseAssistantText(text);
  if (segments.length === 0) return null;
  return (
    <div className="space-y-2">
      {segments.map((seg, i) =>
        seg.type === 'text' ? (
          seg.content.trim() ? (
            <div key={i} className="text-sm leading-relaxed whitespace-pre-wrap">
              {seg.content}
            </div>
          ) : null
        ) : (
          <CardSlot key={`${seg.kind}-${seg.slug}-${i}`} kind={seg.kind} slug={seg.slug} />
        ),
      )}
    </div>
  );
}
