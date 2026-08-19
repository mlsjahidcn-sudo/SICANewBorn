'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { programs as staticPrograms, universities as staticUniversities, type Program } from '@/lib/data';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { apiFetch } from '@/lib/api-client';

interface ProgramFormData {
  slug: string;
  name: string;
  nameCn: string;
  universitySlug: string;
  degree: string;
  discipline: string;
  disciplineCn: string;
  language: string;
  duration: string;
  durationCn: string;
  tuition: string;
  description: string;
  descriptionCn: string;
  requirements: string;
  requirementsCn: string;
  curriculum: string;
  curriculumCn: string;
  scholarshipAvailable: boolean;
  intake: string;
}

const defaultFormData: ProgramFormData = {
  slug: '',
  name: '',
  nameCn: '',
  universitySlug: '',
  degree: 'Bachelor',
  discipline: '',
  disciplineCn: '',
  language: 'English',
  duration: '',
  durationCn: '',
  tuition: '',
  description: '',
  descriptionCn: '',
  requirements: '',
  requirementsCn: '',
  curriculum: '',
  curriculumCn: '',
  scholarshipAvailable: false,
  intake: '',
};

function programToForm(prog: Program): ProgramFormData {
  return {
    slug: prog.slug || '',
    name: prog.name || '',
    nameCn: prog.nameCn || '',
    universitySlug: prog.universitySlug || '',
    degree: prog.degree || 'Bachelor',
    discipline: prog.discipline || '',
    disciplineCn: prog.disciplineCn || '',
    language: prog.language || 'English',
    duration: prog.duration || '',
    durationCn: prog.durationCn || '',
    tuition: prog.tuition || '',
    description: prog.description || '',
    descriptionCn: prog.descriptionCn || '',
    requirements: (prog.requirements || []).join('\n'),
    requirementsCn: (prog.requirementsCn || []).join('\n'),
    curriculum: (prog.curriculum || []).join('\n'),
    curriculumCn: (prog.curriculumCn || []).join('\n'),
    scholarshipAvailable: prog.scholarshipAvailable || false,
    intake: prog.intake || '',
  };
}

function ProgramFormInner({ slug }: { slug?: string }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProgramFormData>(defaultFormData);
  const isEdit = !!slug;

  useEffect(() => {
    if (slug) {
      const prog = staticPrograms.find(p => p.slug === slug);
      if (prog) {
        setForm(programToForm(prog));
      }
    }
  }, [slug]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        requirements: form.requirements.split('\n').filter(Boolean),
        requirementsCn: form.requirementsCn.split('\n').filter(Boolean),
        curriculum: form.curriculum.split('\n').filter(Boolean),
        curriculumCn: form.curriculumCn.split('\n').filter(Boolean),
      };

      if (isEdit) {
        const res = await apiFetch(`/api/programs/${slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        addToast('Program updated successfully', 'success');
      } else {
        const res = await apiFetch('/api/programs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        addToast('Program created successfully', 'success');
      }
      router.push('/admin/programs');
    } catch {
      addToast(isEdit ? 'Failed to update program' : 'Failed to create program', 'error');
    } finally {
      setSaving(false);
    }
  }, [form, isEdit, slug, router, addToast]);

  const inputClass = "w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]";

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/admin/programs')} className="p-2 text-[#1B2A4A] hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">{isEdit ? 'Edit Program' : 'Add Program'}</h1>
          <p className="text-[#4B5563] text-sm mt-1">{isEdit ? 'Update program information' : 'Add a new degree program'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange} required disabled={isEdit} className={inputClass + (isEdit ? ' bg-gray-100' : '')} placeholder="e.g. computer-science-bsc-tsinghua" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Program Name (English)</label>
              <input name="name" value={form.name} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Program Name (Chinese)</label>
              <input name="nameCn" value={form.nameCn} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">University</label>
              <select name="universitySlug" value={form.universitySlug} onChange={handleChange} required className={inputClass}>
                <option value="">Select University</option>
                {staticUniversities.map(u => (
                  <option key={u.slug} value={u.slug}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Degree Level</label>
              <select name="degree" value={form.degree} onChange={handleChange} className={inputClass}>
                <option value="Bachelor">Bachelor</option>
                <option value="Master">Master</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Discipline (English)</label>
              <input name="discipline" value={form.discipline} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Discipline (Chinese)</label>
              <input name="disciplineCn" value={form.disciplineCn} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Language</label>
              <select name="language" value={form.language} onChange={handleChange} className={inputClass}>
                <option value="English">English</option>
                <option value="Chinese">Chinese</option>
                <option value="Bilingual">Bilingual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Duration (English)</label>
              <input name="duration" value={form.duration} onChange={handleChange} required className={inputClass} placeholder="e.g. 4 years" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Duration (Chinese)</label>
              <input name="durationCn" value={form.durationCn} onChange={handleChange} className={inputClass} placeholder="e.g. 4年" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Tuition</label>
              <input name="tuition" value={form.tuition} onChange={handleChange} required className={inputClass} placeholder="e.g. ¥30,000/year" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Intake</label>
              <input name="intake" value={form.intake} onChange={handleChange} className={inputClass} placeholder="e.g. September" />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                name="scholarshipAvailable"
                checked={form.scholarshipAvailable}
                onChange={handleChange}
                className="w-4 h-4 accent-[#9B1B30]"
              />
              <label className="text-sm font-medium text-[#1F2937]">Scholarship Available</label>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Description</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Description (English)</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Description (Chinese)</label>
              <textarea name="descriptionCn" value={form.descriptionCn} onChange={handleChange} rows={4} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Requirements & Curriculum */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Requirements & Curriculum</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Requirements (one per line, English)</label>
              <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={5} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Requirements (one per line, Chinese)</label>
              <textarea name="requirementsCn" value={form.requirementsCn} onChange={handleChange} rows={5} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Curriculum (one per line, English)</label>
              <textarea name="curriculum" value={form.curriculum} onChange={handleChange} rows={5} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Curriculum (one per line, Chinese)</label>
              <textarea name="curriculumCn" value={form.curriculumCn} onChange={handleChange} rows={5} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#7A1526] transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isEdit ? 'Update Program' : 'Create Program'}
          </button>
          <button type="button" onClick={() => router.push('/admin/programs')} className="px-6 py-2.5 text-sm font-medium text-[#4B5563] border border-gray-300 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ProgramFormPage({ params }: { params: Promise<{ slug?: string }> }) {
  const [slug, setSlug] = useState<string | undefined>(undefined);
  useEffect(() => {
    params.then(p => setSlug(p.slug));
  }, [params]);

  return (
    <ToastProvider>
      <ProgramFormInner slug={slug} />
    </ToastProvider>
  );
}
