'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { scholarships as staticScholarships, type Scholarship } from '@/lib/data';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { apiFetch } from '@/lib/api-client';

interface ScholarshipFormData {
  slug: string;
  name: string;
  nameCn: string;
  type: string;
  degreeLevels: string;
  degreeLevelsCn: string;
  eligibleRegions: string;
  eligibleRegionsCn: string;
  duration: string;
  durationCn: string;
  description: string;
  descriptionCn: string;
  coverage: string;
  coverageCn: string;
  requirements: string;
  requirementsCn: string;
  applicationMethod: string;
  applicationMethodCn: string;
  deadline: string;
}

const defaultFormData: ScholarshipFormData = {
  slug: '',
  name: '',
  nameCn: '',
  type: 'Full',
  degreeLevels: '',
  degreeLevelsCn: '',
  eligibleRegions: '',
  eligibleRegionsCn: '',
  duration: '',
  durationCn: '',
  description: '',
  descriptionCn: '',
  coverage: '',
  coverageCn: '',
  requirements: '',
  requirementsCn: '',
  applicationMethod: '',
  applicationMethodCn: '',
  deadline: '',
};

function scholarshipToForm(s: Scholarship): ScholarshipFormData {
  return {
    slug: s.slug || '',
    name: s.name || '',
    nameCn: s.nameCn || '',
    type: s.type || 'Full',
    degreeLevels: (s.degreeLevels || []).join(', '),
    degreeLevelsCn: (s.degreeLevelsCn || []).join(', '),
    eligibleRegions: s.eligibleRegions || '',
    eligibleRegionsCn: s.eligibleRegionsCn || '',
    duration: s.duration || '',
    durationCn: s.durationCn || '',
    description: s.description || '',
    descriptionCn: s.descriptionCn || '',
    coverage: Array.isArray(s.coverage) ? s.coverage.join('\n') : String(s.coverage || ''),
    coverageCn: Array.isArray(s.coverageCn) ? s.coverageCn.join('\n') : String(s.coverageCn || ''),
    requirements: Array.isArray(s.requirements) ? s.requirements.join('\n') : '',
    requirementsCn: Array.isArray(s.requirementsCn) ? s.requirementsCn.join('\n') : '',
    applicationMethod: s.applicationMethod || '',
    applicationMethodCn: s.applicationMethodCn || '',
    deadline: s.deadline || '',
  };
}

function ScholarshipFormInner({ slug }: { slug?: string }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ScholarshipFormData>(defaultFormData);
  const isEdit = !!slug;

  useEffect(() => {
    if (slug) {
      const schol = staticScholarships.find(s => s.slug === slug);
      if (schol) {
        setForm(scholarshipToForm(schol));
      }
    }
  }, [slug]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        degreeLevels: form.degreeLevels.split(',').map(s => s.trim()).filter(Boolean),
        degreeLevelsCn: form.degreeLevelsCn.split(',').map(s => s.trim()).filter(Boolean),
        coverage: form.coverage.split('\n').filter(Boolean),
        coverageCn: form.coverageCn.split('\n').filter(Boolean),
        requirements: form.requirements.split('\n').filter(Boolean),
        requirementsCn: form.requirementsCn.split('\n').filter(Boolean),
        applicationMethod: form.applicationMethod.split('\n').filter(Boolean),
        applicationMethodCn: form.applicationMethodCn.split('\n').filter(Boolean),
      };

      if (isEdit) {
        const res = await apiFetch(`/api/scholarships/${slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        addToast('Scholarship updated successfully', 'success');
      } else {
        const res = await apiFetch('/api/scholarships', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        addToast('Scholarship created successfully', 'success');
      }
      router.push('/admin/scholarships');
    } catch {
      addToast(isEdit ? 'Failed to update scholarship' : 'Failed to create scholarship', 'error');
    } finally {
      setSaving(false);
    }
  }, [form, isEdit, slug, router, addToast]);

  const inputClass = "w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]";

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push('/admin/scholarships')} className="p-2 text-[#1B2A4A] hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">{isEdit ? 'Edit Scholarship' : 'Add Scholarship'}</h1>
          <p className="text-[#4B5563] text-sm mt-1">{isEdit ? 'Update scholarship information' : 'Add a new scholarship program'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange} required disabled={isEdit} className={inputClass + (isEdit ? ' bg-gray-100' : '')} placeholder="e.g. csc-bilateral-program" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Name (English)</label>
              <input name="name" value={form.name} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Name (Chinese)</label>
              <input name="nameCn" value={form.nameCn} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Type</label>
              <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
                <option value="Full">Full</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Degree Levels (comma-separated, English)</label>
              <input name="degreeLevels" value={form.degreeLevels} onChange={handleChange} className={inputClass} placeholder="Bachelor, Master, PhD" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Degree Levels (comma-separated, Chinese)</label>
              <input name="degreeLevelsCn" value={form.degreeLevelsCn} onChange={handleChange} className={inputClass} placeholder="学士, 硕士, 博士" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Eligible Regions (English)</label>
              <input name="eligibleRegions" value={form.eligibleRegions} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Eligible Regions (Chinese)</label>
              <input name="eligibleRegionsCn" value={form.eligibleRegionsCn} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Duration (English)</label>
              <input name="duration" value={form.duration} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Duration (Chinese)</label>
              <input name="durationCn" value={form.durationCn} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Deadline</label>
              <input name="deadline" value={form.deadline} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Application Method (English)</label>
              <input name="applicationMethod" value={form.applicationMethod} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Application Method (Chinese)</label>
              <input name="applicationMethodCn" value={form.applicationMethodCn} onChange={handleChange} className={inputClass} />
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

        {/* Coverage, Requirements, Process */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Coverage, Requirements & Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Coverage (one per line, English)</label>
              <textarea name="coverage" value={form.coverage} onChange={handleChange} rows={4} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Coverage (one per line, Chinese)</label>
              <textarea name="coverageCn" value={form.coverageCn} onChange={handleChange} rows={4} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Requirements (one per line, English)</label>
              <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={4} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Requirements (one per line, Chinese)</label>
              <textarea name="requirementsCn" value={form.requirementsCn} onChange={handleChange} rows={4} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Application Process (one per line, English)</label>
              <textarea name="applicationMethod" value={form.applicationMethod} onChange={handleChange} rows={4} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Application Process (one per line, Chinese)</label>
              <textarea name="applicationMethodCn" value={form.applicationMethodCn} onChange={handleChange} rows={4} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#7A1526] transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isEdit ? 'Update Scholarship' : 'Create Scholarship'}
          </button>
          <button type="button" onClick={() => router.push('/admin/scholarships')} className="px-6 py-2.5 text-sm font-medium text-[#4B5563] border border-gray-300 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ScholarshipFormPage({ params }: { params: Promise<{ slug?: string }> }) {
  const [slug, setSlug] = useState<string | undefined>(undefined);
  useEffect(() => {
    params.then(p => setSlug(p.slug));
  }, [params]);

  return (
    <ToastProvider>
      <ScholarshipFormInner slug={slug} />
    </ToastProvider>
  );
}
