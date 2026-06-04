'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileText, AlertCircle, CheckCircle2, X, Plus, Trash2 } from 'lucide-react';
import { universities as staticUniversities } from '@/lib/data';
import { ToastProvider, useToast } from '@/components/admin/toast';

interface ParsedProgram {
  name: string;
  nameCn: string;
  degree: string;
  discipline: string;
  disciplineCn: string;
  language: string;
  duration: string;
  durationCn: string;
  tuition: string;
  intake: string;
  intakeCn: string;
  scholarshipAvailable: boolean;
  _valid: boolean;
  _error?: string;
}

const COLUMNS = [
  { key: 'name', label: 'Program Name', example: 'BSc in Computer Science' },
  { key: 'nameCn', label: '中文名称', example: '计算机科学学士' },
  { key: 'degree', label: 'Degree', example: 'Bachelor/Master/PhD' },
  { key: 'discipline', label: 'Discipline', example: 'Computer Science' },
  { key: 'disciplineCn', label: '学科(中)', example: '计算机科学' },
  { key: 'language', label: 'Language', example: 'English/Chinese/Bilingual' },
  { key: 'duration', label: 'Duration', example: '4 years' },
  { key: 'durationCn', label: '学制(中)', example: '4年' },
  { key: 'tuition', label: 'Tuition', example: '¥30,000/year' },
  { key: 'intake', label: 'Intake', example: 'September' },
  { key: 'intakeCn', label: '入学(中)', example: '9月' },
  { key: 'scholarshipAvailable', label: 'Scholarship', example: 'true/false' },
];

const FORMAT_HEADER = COLUMNS.map(c => c.key).join('|');
const FORMAT_EXAMPLE = 'BSc in Computer Science|计算机科学学士|Bachelor|Computer Science|计算机科学|English|4 years|4年|¥30,000/year|September|9月|true';

function BulkImportContent() {
  const router = useRouter();
  const { addToast } = useToast();
  const [universitySlug, setUniversitySlug] = useState('');
  const [rawText, setRawText] = useState('');
  const [parsedPrograms, setParsedPrograms] = useState<ParsedProgram[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);

  // Live university list — fetched from the API so newly
  // AI-generated universities appear here, not just the 8 hard-
  // coded in src/lib/data.ts. We merge with the static list as
  // a fallback so the page still works in dev / offline.
  const [universities, setUniversities] = useState<
    Array<{ slug: string; name: string; nameCn: string }>
  >(staticUniversities.map((u) => ({ slug: u.slug, name: u.name, nameCn: u.nameCn })));

  useEffect(() => {
    // Fetch all universities from the API. If the API returns
    // rows, replace the static list. If the API fails (e.g. dev
    // without Supabase), keep the static list.
    fetch('/api/universities?limit=200')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const rows: Array<{ slug: string; name: string; nameCn: string }> | undefined =
          data?.universities;
        if (rows && rows.length > 0) {
          // De-dupe by slug — DB rows can overlap with the static
          // list. Sort alphabetically by name for the dropdown.
          const merged = new Map<string, { slug: string; name: string; nameCn: string }>();
          for (const u of staticUniversities) merged.set(u.slug, u);
          for (const u of rows) merged.set(u.slug, u);
          setUniversities(
            Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name)),
          );
        }
      })
      .catch(() => {
        // Keep static list on error
      });
  }, []);

  const parseText = useCallback(() => {
    if (!rawText.trim()) {
      addToast('Please paste program data first', 'error');
      return;
    }

    const lines = rawText.trim().split('\n').filter(l => l.trim());
    const programs: ParsedProgram[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Skip header line
      if (line.startsWith('name|') || line.startsWith('name\t')) {
        continue;
      }

      const parts = line.split(/[|\t]/).map(p => p.trim());

      if (parts.length < 4) {
        programs.push({
          name: '', nameCn: '', degree: '', discipline: '', disciplineCn: '',
          language: 'English', duration: '', durationCn: '', tuition: '',
          intake: 'September', intakeCn: '9月', scholarshipAvailable: false,
          _valid: false, _error: `Line ${i + 1}: needs at least 4 fields (name|nameCn|degree|discipline)`,
        });
        continue;
      }

      const p: ParsedProgram = {
        name: parts[0] || '',
        nameCn: parts[1] || '',
        degree: parts[2] || 'Bachelor',
        discipline: parts[3] || '',
        disciplineCn: parts[4] || '',
        language: parts[5] || 'English',
        duration: parts[6] || '',
        durationCn: parts[7] || '',
        tuition: parts[8] || '',
        intake: parts[9] || 'September',
        intakeCn: parts[10] || '9月',
        scholarshipAvailable: parts[11] === 'true',
        _valid: true,
      };

      if (!p.name || !p.degree || !p.discipline) {
        p._valid = false;
        p._error = `Line ${i + 1}: name, degree, and discipline are required`;
      }

      programs.push(p);
    }

    if (programs.length === 0) {
      addToast('No valid program data found', 'error');
      return;
    }

    setParsedPrograms(programs);
    setIsPreviewMode(true);
  }, [rawText, addToast]);

  const removeProgram = (index: number) => {
    setParsedPrograms(prev => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (!universitySlug) {
      addToast('Please select a university', 'error');
      return;
    }

    const validPrograms = parsedPrograms.filter(p => p._valid);
    if (validPrograms.length === 0) {
      addToast('No valid programs to import', 'error');
      return;
    }

    setIsImporting(true);

    try {
      const programs = validPrograms.map(p => ({
        name: p.name,
        nameCn: p.nameCn,
        universitySlug,
        degree: p.degree,
        discipline: p.discipline,
        disciplineCn: p.disciplineCn,
        language: p.language,
        duration: p.duration,
        durationCn: p.durationCn,
        tuition: p.tuition,
        intake: p.intake,
        intakeCn: p.intakeCn,
        scholarshipAvailable: p.scholarshipAvailable,
        description: '',
        descriptionCn: '',
        requirements: [],
        requirementsCn: [],
        curriculum: [],
        curriculumCn: [],
      }));

      const res = await fetch('/api/programs/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programs }),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast(data.error || 'Import failed', 'error');
        setIsImporting(false);
        return;
      }

      setImportResult({
        success: data.imported || 0,
        errors: [],
      });

      addToast(`Successfully imported ${data.imported} programs`, 'success');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Import failed';
      addToast(msg, 'error');
      setImportResult({ success: 0, errors: [msg] });
    } finally {
      setIsImporting(false);
    }
  };

  const resetForm = () => {
    setRawText('');
    setParsedPrograms([]);
    setIsPreviewMode(false);
    setImportResult(null);
  };

  const validCount = parsedPrograms.filter(p => p._valid).length;
  const invalidCount = parsedPrograms.filter(p => !p._valid).length;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/programs')}
            className="flex items-center gap-2 text-[#1B2A4A] hover:text-[#9B1B30] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Programs</span>
          </button>
          <div className="h-5 w-px bg-gray-300" />
          <h1 className="text-xl font-bold text-[#1B2A4A]">Bulk Import Programs</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {importResult ? (
          /* Success State */
          <div className="bg-white border border-gray-200 rounded-none p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#1B2A4A] mb-2">Import Complete</h2>
            <p className="text-[#4B5563] mb-6">
              Successfully imported <span className="font-bold text-green-600">{importResult.success}</span> programs
            </p>
            {importResult.errors.length > 0 && (
              <div className="mb-6 text-left">
                <p className="text-sm font-medium text-red-600 mb-2">Errors:</p>
                {importResult.errors.map((err, i) => (
                  <p key={i} className="text-sm text-red-500">{err}</p>
                ))}
              </div>
            )}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={resetForm}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-none text-[#1B2A4A] hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Import More
              </button>
              <button
                onClick={() => router.push('/admin/programs')}
                className="px-4 py-2 bg-[#9B1B30] text-white rounded-none hover:bg-[#7A1526] transition-colors"
              >
                View Programs
              </button>
            </div>
          </div>
        ) : !isPreviewMode ? (
          /* Input Mode */
          <div className="space-y-6">
            {/* Format Guide */}
            <div className="bg-white border border-gray-200 rounded-none p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-[#1B2A4A]" />
                <h2 className="text-lg font-semibold text-[#1B2A4A]">Format Guide</h2>
              </div>
              <p className="text-sm text-[#4B5563] mb-3">
                Paste one program per line. Separate fields with <code className="bg-gray-100 px-1.5 py-0.5 rounded-none text-[#1B2A4A] font-mono text-xs">|</code> (pipe) or <code className="bg-gray-100 px-1.5 py-0.5 rounded-none text-[#1B2A4A] font-mono text-xs">Tab</code>. Minimum required fields: name, nameCn, degree, discipline.
              </p>
              <div className="bg-[#1B2A4A] rounded-none p-4 text-sm font-mono text-gray-300 overflow-x-auto">
                <div className="text-[#D4A853] mb-1">{'/* Column order */'}</div>
                <div className="text-green-400 mb-3">{FORMAT_HEADER}</div>
                <div className="text-[#D4A853] mb-1">{'/* Example */'}</div>
                <div className="text-green-400">{FORMAT_EXAMPLE}</div>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-3 text-[#1B2A4A] font-semibold">#</th>
                      <th className="text-left py-2 pr-3 text-[#1B2A4A] font-semibold">Field</th>
                      <th className="text-left py-2 pr-3 text-[#1B2A4A] font-semibold">Required</th>
                      <th className="text-left py-2 text-[#1B2A4A] font-semibold">Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COLUMNS.map((col, i) => (
                      <tr key={col.key} className="border-b border-gray-100">
                        <td className="py-1.5 pr-3 text-[#4B5563]">{i + 1}</td>
                        <td className="py-1.5 pr-3 font-mono text-[#1B2A4A]">{col.key}</td>
                        <td className="py-1.5 pr-3">
                          {i < 4 ? (
                            <span className="text-red-600 font-medium">Yes</span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                        <td className="py-1.5 text-[#4B5563]">{col.example}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* University Selector */}
            <div className="bg-white border border-gray-200 rounded-none p-6">
              <label className="block text-sm font-semibold text-[#1B2A4A] mb-2">
                Target University <span className="text-red-600">*</span>
              </label>
              <select
                value={universitySlug}
                onChange={(e) => setUniversitySlug(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-none text-[#1B2A4A] bg-white focus:outline-none focus:border-[#9B1B30]"
              >
                <option value="">Select a university...</option>
                {universities.map(u => (
                  <option key={u.slug} value={u.slug}>{u.name} ({u.nameCn})</option>
                ))}
              </select>
            </div>

            {/* Paste Area */}
            <div className="bg-white border border-gray-200 rounded-none p-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-[#1B2A4A]">
                  Program Data <span className="text-red-600">*</span>
                </label>
                <span className="text-xs text-[#4B5563]">
                  {rawText.trim() ? `${rawText.trim().split('\n').filter(l => l.trim() && !l.trim().startsWith('name|')).length} lines detected` : 'Paste your data below'}
                </span>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`${FORMAT_HEADER}\n${FORMAT_EXAMPLE}`}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-none font-mono text-sm text-[#1B2A4A] bg-white focus:outline-none focus:border-[#9B1B30] resize-y"
              />
            </div>

            {/* Parse Button */}
            <div className="flex justify-end">
              <button
                onClick={parseText}
                disabled={!rawText.trim() || !universitySlug}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#9B1B30] text-white rounded-none font-semibold hover:bg-[#7A1526] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                Parse & Preview
              </button>
            </div>
          </div>
        ) : (
          /* Preview Mode */
          <div className="space-y-6">
            {/* Summary Bar */}
            <div className="bg-white border border-gray-200 rounded-none p-4 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-[#1B2A4A]">{validCount} valid</span>
                </div>
                {invalidCount > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">{invalidCount} invalid</span>
                  </div>
                )}
                <div className="text-sm text-[#4B5563]">
                  University: <span className="font-medium text-[#1B2A4A]">{universities.find(u => u.slug === universitySlug)?.name || universitySlug}</span>
                </div>
              </div>
              <button
                onClick={() => { setIsPreviewMode(false); setParsedPrograms([]); }}
                className="text-sm text-[#9B1B30] hover:underline"
              >
                Edit Data
              </button>
            </div>

            {/* Preview Table */}
            <div className="bg-white border border-gray-200 rounded-none overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#1B2A4A] text-white">
                      <th className="text-left py-3 px-3 font-semibold w-8">#</th>
                      <th className="text-left py-3 px-3 font-semibold">Program Name</th>
                      <th className="text-left py-3 px-3 font-semibold">中文名称</th>
                      <th className="text-left py-3 px-3 font-semibold">Degree</th>
                      <th className="text-left py-3 px-3 font-semibold">Discipline</th>
                      <th className="text-left py-3 px-3 font-semibold">Language</th>
                      <th className="text-left py-3 px-3 font-semibold">Duration</th>
                      <th className="text-left py-3 px-3 font-semibold">Tuition</th>
                      <th className="text-left py-3 px-3 font-semibold">Scholarship</th>
                      <th className="text-left py-3 px-3 font-semibold w-10">Status</th>
                      <th className="text-left py-3 px-3 font-semibold w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedPrograms.map((p, i) => (
                      <tr
                        key={i}
                        className={`border-b border-gray-100 ${p._valid ? 'bg-white' : 'bg-red-50'}`}
                      >
                        <td className="py-2.5 px-3 text-[#4B5563]">{i + 1}</td>
                        <td className="py-2.5 px-3 font-medium text-[#1B2A4A]">{p.name || '—'}</td>
                        <td className="py-2.5 px-3 text-[#4B5563]">{p.nameCn || '—'}</td>
                        <td className="py-2.5 px-3">
                          <span className="inline-block px-2 py-0.5 text-xs font-semibold border border-gray-300 rounded-none text-[#1B2A4A]">
                            {p.degree}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#4B5563]">{p.discipline || '—'}</td>
                        <td className="py-2.5 px-3 text-[#4B5563]">{p.language}</td>
                        <td className="py-2.5 px-3 text-[#4B5563]">{p.duration || '—'}</td>
                        <td className="py-2.5 px-3 text-[#4B5563]">{p.tuition || '—'}</td>
                        <td className="py-2.5 px-3 text-center">
                          {p.scholarshipAvailable ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 inline" />
                          ) : (
                            <X className="w-4 h-4 text-gray-300 inline" />
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {p._valid ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <span title={p._error}>
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => removeProgram(i)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Error Details */}
            {invalidCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-none p-4">
                <h3 className="text-sm font-semibold text-red-800 mb-2">Errors</h3>
                {parsedPrograms.filter(p => !p._valid).map((p, i) => (
                  <p key={i} className="text-xs text-red-600">{p._error}</p>
                ))}
              </div>
            )}

            {/* Import Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setIsPreviewMode(false); setParsedPrograms([]); }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-none text-[#1B2A4A] hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Edit
              </button>
              <button
                onClick={handleImport}
                disabled={isImporting || validCount === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#9B1B30] text-white rounded-none font-semibold hover:bg-[#7A1526] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                {isImporting ? 'Importing...' : `Import ${validCount} Programs`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BulkImportPage() {
  return (
    <ToastProvider>
      <BulkImportContent />
    </ToastProvider>
  );
}
