'use client';

/**
 * Phase 92: the picker grid used to live directly in page.tsx as one
 * 'use client' component that imported the full static universities
 * array from data.ts (~101KB module). The list is now fetched
 * server-side and passed in as a slim prop — only these 6 fields per
 * university reach the browser, and none of data.ts ships in the
 * client bundle for this route.
 */
import { useI18n } from '@/lib/i18n';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, GraduationCap, Check } from 'lucide-react';

export interface CompareUni {
  slug: string;
  name: string;
  nameCn?: string;
  cityCn?: string;
  rankingYear?: string;
  rankingSourceUrl?: string;
  logo: string;
  ranking: number;
  qsWorldRanking: number | null;
  city: string;
}

/**
 * Picker UI for the /universities/compare feature.
 *
 * User selects 2 universities from the grid, then clicks "Compare"
 * to navigate to the dedicated side-by-side page at
 * /universities/compare/[a]/vs/[b].
 *
 * The dedicated page is the SEO value — this picker is just for
 * users who don't have a specific pair in mind.
 */
export default function ComparePicker({ unis }: { unis: CompareUni[] }) {
  const router = useRouter();
  const { locale } = useI18n();
  const zh = locale === 'zh';
  const [search, setSearch] = useState('');
  const visible = unis.filter((u) => `${u.name} ${u.nameCn ?? ''} ${u.city} ${u.cityCn ?? ''}`.toLowerCase().includes(search.trim().toLowerCase()));
  const name = (u: CompareUni): string => zh && u.nameCn ? u.nameCn : u.name;
  const [selected, setSelected] = useState<string[]>([]);

  // Total number of unique pairs: C(n, 2). Updates as the list
  // grows so we never have a stale "28 pairs" footer once
  // universities are added.
  const totalPairs = (unis.length * (unis.length - 1)) / 2;

  const toggle = (slug: string) => {
    setSelected((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 2) return [prev[1], slug]; // replace the older selection
      return [...prev, slug];
    });
  };

  const handleCompare = () => {
    if (selected.length !== 2) return;
    const [a, b] = [...selected].sort();
    router.push(`/universities/compare/${a}/vs/${b}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Hero */}
      <section className="bg-[#1B2A4A] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-300 mb-4">
            <Link href="/" className="hover:text-white transition-colors">{zh ? '首页' : 'Home'}</Link>
            <span className="text-gray-500">/</span>
            <Link href="/universities" className="hover:text-white transition-colors">{zh ? '大学' : 'Universities'}</Link>
            <span className="text-gray-500">/</span>
            <span className="text-white font-medium">{zh ? '对比' : 'Compare'}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
            {zh ? '中国大学对比' : 'Compare Chinese Universities'}
          </h1>
          <p className="mt-3 text-lg text-gray-300 max-w-2xl">
            {zh ? '搜索并选择两所大学，对比排名、学费及项目。排名与费用请以当期官方来源为准。' : 'Search and select two universities to compare rankings, tuition and programs. Confirm ranking editions and current fees with official sources.'}
          </p>
        </div>
      </section>

      {/* Picker */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="flex flex-col justify-between mb-6 gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-bold text-[#1B2A4A]">
              {zh ? '选择两所大学' : 'Select 2 universities'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {selected.length === 0 && (zh ? '搜索院校或城市，然后选择两所大学。' : 'Search by university or city, then select two schools.')}
              {selected.length === 1 && (zh ? '再选一所即可继续。' : 'Pick one more to continue.')}
              {selected.length === 2 && (zh ? '已选两所，可以开始对比。' : 'Ready to compare. Click the button below.')}
            </p>
          </div>
          <button
            type="button"
            onClick={handleCompare}
            disabled={selected.length !== 2}
            className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#7A1526] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {zh ? '并排对比' : 'Compare side by side'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-6 space-y-3">
          <label className="block text-sm font-medium text-[#1B2A4A]" htmlFor="compare-search">{zh ? '搜索院校或城市' : 'Search university or city'}</label>
          <input id="compare-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} className="min-h-11 w-full border border-gray-300 bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-[#9B1B30]" />
          <div className="flex flex-wrap gap-2" aria-live="polite">
            {selected.map((slug) => { const u = unis.find((item) => item.slug === slug); return u ? <button type="button" key={slug} onClick={() => toggle(slug)} className="min-h-11 border border-[#9B1B30] bg-white px-3 text-sm text-[#1B2A4A]" aria-label={`${zh ? '移除' : 'Remove'} ${name(u)}`}>{name(u)} ×</button> : null; })}
          </div>
          <p className="text-xs text-gray-600">{zh ? `${visible.length} 所院校；不显示未公布或无效的排名。` : `${visible.length} universities; unpublished or invalid rankings are omitted.`}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {visible.map((u) => {
            const isSelected = selected.includes(u.slug);
            const order = selected.indexOf(u.slug) + 1;
            return (
              <button
                key={u.slug}
                type="button"
                onClick={() => toggle(u.slug)}
                className={[
                  'group relative text-left bg-white border-2 p-4 transition-all',
                  isSelected
                    ? 'border-[#9B1B30] shadow-md'
                    : 'border-gray-200 hover:border-[#1B2A4A] hover:shadow-sm',
                ].join(' ')}
                aria-pressed={isSelected}
              >
                {/* Selection badge */}
                <div
                  className={[
                    'absolute -top-2 -right-2 h-7 w-7 flex items-center justify-center text-xs font-bold',
                    isSelected
                      ? 'bg-[#9B1B30] text-white'
                      : 'bg-white border border-gray-300 text-gray-400',
                  ].join(' ')}
                >
                  {isSelected ? (order === 1 ? 'A' : <Check className="h-4 w-4" />) : '+'}
                </div>

                {/* Logo */}
                <div className="h-16 w-16 bg-white border border-gray-100 flex items-center justify-center mb-3">
                  {u.logo && u.logo.startsWith('http') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.logo} alt={u.name} className="h-12 w-12 object-contain" />
                  ) : (
                    <GraduationCap className="h-7 w-7 text-[#1B2A4A]" />
                  )}
                </div>

                <h3 className="font-semibold text-[#1B2A4A] text-sm leading-tight">
                  {name(u)}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {u.ranking > 0 ? `#${u.ranking} ${zh ? '中国' : 'in China'}` : ''}{u.qsWorldRanking && u.qsWorldRanking > 0 ? ` · QS #${u.qsWorldRanking}${u.rankingYear ? ` (${u.rankingYear})` : ''}` : ''}
                </p>
                {u.rankingYear ? null : <p className="mt-1 text-[10px] text-gray-500">{zh ? '排名年份待确认' : 'Ranking year unconfirmed'}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{zh && u.cityCn ? u.cityCn : u.city}, {zh ? '中国' : 'China'}</p>
              </button>
            );
          })}
        </div>
      </section>

      {visible.length === 0 ? <p className="mx-auto max-w-7xl px-4 pb-8 text-gray-600">{zh ? '未找到院校，请更换名称或城市。' : 'No universities match. Try another name or city.'}</p> : null}
      {/* Popular comparisons — links directly to the side-by-side
          pages so users (and search engines) can find the top pairs
          without using the picker. */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-xl font-bold text-[#1B2A4A] mb-4">{zh ? '常见院校对比' : 'Popular comparisons'}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {popularPairs.map(([a, b]) => {
            const uniA = unis.find((u) => u.slug === a);
            const uniB = unis.find((u) => u.slug === b);
            if (!uniA || !uniB) return null;
            return (
              <Link
                key={`${a}-${b}`}
                href={`/universities/compare/${a}/vs/${b}`}
                className="group flex items-center justify-between gap-2 bg-white border border-gray-200 hover:border-[#9B1B30] p-4 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#1B2A4A] group-hover:text-[#9B1B30] transition-colors truncate">
                    {uniA.name} vs {uniB.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    #{uniA.ranking} vs #{uniB.ranking} · {uniA.city} vs {uniB.city}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#9B1B30] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-gray-500">
          {zh ? `还可组合 ${Math.max(0, totalPairs - popularPairs.length)} 组对比，请使用上方选择器。` : `${Math.max(0, totalPairs - popularPairs.length)} more pairs available — use the picker above.`}
        </p>
      </section>
    </div>
  );
}

// Top-of-mind pairs for users. These get indexed first and surface
// prominently on the picker page. Order matters: top of list = most
// commonly searched. The picker can still produce any pair from the
// list. Pairs that don't have both sides in the list are hidden
// automatically (popularPairs.map filters with the
// `if (!uniA || !uniB) return null;` guard above).
const popularPairs: Array<[string, string]> = [
  ['tsinghua-university', 'peking-university'],
  ['tsinghua-university', 'fudan-university'],
  ['tsinghua-university', 'shanghai-jiao-tong-university'],
  ['tsinghua-university', 'zhejiang-university'],
  ['peking-university', 'fudan-university'],
  ['peking-university', 'shanghai-jiao-tong-university'],
  ['fudan-university', 'shanghai-jiao-tong-university'],
  ['zhejiang-university', 'nanjing-university'],
  ['wuhan-university', 'sun-yat-sen-university'],
];
