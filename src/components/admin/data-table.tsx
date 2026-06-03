'use client';

import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useState } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: string;
  searchPlaceholder?: string;
  searchFields?: string[];
  pageSize?: number;
  actions?: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  searchPlaceholder = 'Search...',
  searchFields = [],
  pageSize = 10,
  actions,
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = searchFields.length > 0
    ? data.filter((item) =>
        searchFields.some((field) => {
          const val = item[field];
          return typeof val === 'string' && val.toLowerCase().includes(search.toLowerCase());
        })
      )
    : data;

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        const aStr = typeof aVal === 'string' ? aVal : String(aVal ?? '');
        const bStr = typeof bVal === 'string' ? bVal : String(bVal ?? '');
        return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      })
    : filtered;

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
            style={{ borderRadius: 0 }}
          />
        </div>
        <span className="text-sm text-[#4B5563]">
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="overflow-x-auto border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-semibold text-[#1F2937] ${col.sortable ? 'cursor-pointer hover:text-[#9B1B30] select-none' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <span className="text-[#9B1B30]">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right font-semibold text-[#1F2937]">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-[#4B5563]">
                  No data found
                </td>
              </tr>
            ) : (
              paged.map((item) => (
                <tr
                  key={String(item[keyField])}
                  className={`border-t border-gray-100 hover:bg-[#FAFAF8] ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-[#4B5563]">
                      {col.render ? col.render(item) : String(item[col.key] ?? '')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-[#4B5563]">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              style={{ borderRadius: 0 }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages)
              .map((page, idx, arr) => (
                <span key={page}>
                  {idx > 0 && arr[idx - 1] !== page - 1 && (
                    <span className="px-1 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm border ${page === currentPage ? 'bg-[#9B1B30] text-white border-[#9B1B30]' : 'border-gray-300 hover:bg-gray-50'}`}
                    style={{ borderRadius: 0 }}
                  >
                    {page}
                  </button>
                </span>
              ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              style={{ borderRadius: 0 }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
