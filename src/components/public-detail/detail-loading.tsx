
import type { ReactElement } from 'react';
export function DetailLoading({ program = false }: { program?: boolean }): ReactElement {
  return <div className="min-h-screen bg-[#FAFAF8] motion-safe:animate-pulse" aria-busy="true">
    <div className="h-14 border-b border-gray-200 bg-white" />
    <div className={program ? 'h-24 bg-gray-200 sm:h-36' : 'h-56 bg-[#1B2A4A] sm:h-72'} />
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {program && <><div className="h-7 w-24 bg-gray-200" /><div className="mt-4 h-10 w-3/4 bg-gray-200" /><div className="mt-4 h-6 w-1/2 bg-gray-200" /></>}
      <div className="mt-6 grid grid-cols-2 gap-px border border-gray-200 bg-gray-200 sm:grid-cols-4">{[0, 1, 2, 3].map((item) => <div key={item} className="h-24 bg-white p-4"><div className="h-3 w-1/2 bg-gray-200" /><div className="mt-3 h-5 w-3/4 bg-gray-200" /></div>)}</div>
      <div className="my-6 h-12 border-y border-gray-200 bg-white" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"><div className="h-72 border border-gray-200 bg-white p-6"><div className="h-7 w-40 bg-gray-200" />{[0, 1, 2].map((item) => <div key={item} className="mt-5 h-4 bg-gray-200" />)}</div><div className="h-64 border border-gray-200 bg-white" /></div>
    </div>
  </div>;
}
