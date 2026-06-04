'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { universities as staticUniversities, type University } from '@/lib/data';
import { ToastProvider, useToast } from '@/components/admin/toast';

interface UniversityFormData {
  slug: string;
  name: string;
  nameCn: string;
  city: string;
  cityCn: string;
  ranking: number;
  rating: number;
  type: string;
  typeCn: string;
  established: number;
  students: string;
  intlStudents: string;
  description: string;
  descriptionCn: string;
  popularPrograms: string;
  popularProgramsCn: string;
  tuitionUndergrad: string;
  tuitionGraduate: string;
  intake: string;
  intakeCn: string;
  disciplines: string;
  image: string;
  logo: string;
  qsRanking: string;
  qsWorldRanking: number;
  tags: string;
  tagsCn: string;
  accommodation: string;
  accommodationCn: string;
  accommodationCost: string;
  accommodationCostCn: string;
  accommodationTypes: string;
  accommodationTypesCn: string;
  gallery: string;
  scholarshipInfo: string;
  scholarshipInfoCn: string;
}

const defaultFormData: UniversityFormData = {
  slug: '',
  name: '',
  nameCn: '',
  city: '',
  cityCn: '',
  ranking: 0,
  rating: 4.0,
  type: 'Public University',
  typeCn: '公立大学',
  established: 1950,
  students: '',
  intlStudents: '',
  description: '',
  descriptionCn: '',
  popularPrograms: '',
  popularProgramsCn: '',
  tuitionUndergrad: '',
  tuitionGraduate: '',
  intake: '',
  intakeCn: '',
  disciplines: '',
  image: '',
  logo: '',
  qsRanking: '',
  qsWorldRanking: 0,
  tags: '',
  tagsCn: '',
  accommodation: '',
  accommodationCn: '',
  accommodationCost: '',
  accommodationCostCn: '',
  accommodationTypes: '',
  accommodationTypesCn: '',
  gallery: '',
  scholarshipInfo: '',
  scholarshipInfoCn: '',
};

function universityToForm(uni: University): UniversityFormData {
  return {
    slug: uni.slug || '',
    name: uni.name || '',
    nameCn: uni.nameCn || '',
    city: uni.city || '',
    cityCn: uni.cityCn || '',
    ranking: uni.ranking || 0,
    rating: uni.rating || 4.0,
    type: uni.type || '',
    typeCn: uni.typeCn || '',
    established: uni.established || 1950,
    students: uni.students || '',
    intlStudents: uni.intlStudents || '',
    description: uni.description || '',
    descriptionCn: uni.descriptionCn || '',
    popularPrograms: (uni.popularPrograms || []).join(', '),
    popularProgramsCn: (uni.popularProgramsCn || []).join(', '),
    tuitionUndergrad: uni.tuitionUndergrad || '',
    tuitionGraduate: uni.tuitionGraduate || '',
    intake: uni.intake || '',
    intakeCn: uni.intakeCn || '',
    disciplines: (uni.disciplines || []).join(', '),
    image: uni.image || '',
    logo: uni.logo || '',
    qsRanking: uni.qsRanking || '',
    qsWorldRanking: uni.qsWorldRanking || 0,
    tags: (uni.tags || []).join(', '),
    tagsCn: (uni.tagsCn || []).join(', '),
    accommodation: uni.accommodation || '',
    accommodationCn: uni.accommodationCn || '',
    accommodationCost: uni.accommodationCost || '',
    accommodationCostCn: uni.accommodationCostCn || '',
    accommodationTypes: (uni.accommodationTypes || []).join(', '),
    accommodationTypesCn: (uni.accommodationTypesCn || []).join(', '),
    gallery: (uni.gallery || []).join('\n'),
    scholarshipInfo: uni.scholarshipInfo || '',
    scholarshipInfoCn: uni.scholarshipInfoCn || '',
  };
}

function UniversityFormInner({ slug }: { slug?: string }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<UniversityFormData>(defaultFormData);
  const isEdit = !!slug;

  useEffect(() => {
    if (slug) {
      // Fetch from API to get the latest saved data (not static)
      fetch(`/api/universities/${slug}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.university) {
            setForm(universityToForm(data.university));
          } else {
            // Fallback to static data
            const uni = staticUniversities.find(u => u.slug === slug);
            if (uni) setForm(universityToForm(uni));
          }
        })
        .catch(() => {
          const uni = staticUniversities.find(u => u.slug === slug);
          if (uni) setForm(universityToForm(uni));
        });
    }
  }, [slug]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'ranking' || name === 'established' || name === 'qsWorldRanking' ? parseInt(value) || 0 : name === 'rating' ? parseFloat(value) || 0 : value,
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        popularPrograms: form.popularPrograms.split(',').map(s => s.trim()).filter(Boolean),
        popularProgramsCn: form.popularProgramsCn.split(',').map(s => s.trim()).filter(Boolean),
        disciplines: form.disciplines.split(',').map(s => s.trim()).filter(Boolean),
        tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
        tagsCn: form.tagsCn.split(',').map(s => s.trim()).filter(Boolean),
        accommodation: form.accommodation,
        accommodationCn: form.accommodationCn,
        accommodationCost: form.accommodationCost,
        accommodationCostCn: form.accommodationCostCn,
        accommodationTypes: form.accommodationTypes.split(',').map(s => s.trim()).filter(Boolean),
        accommodationTypesCn: form.accommodationTypesCn.split(',').map(s => s.trim()).filter(Boolean),
        gallery: form.gallery.split('\n').map(s => s.trim()).filter(Boolean),
      };

      if (isEdit) {
        const res = await fetch(`/api/universities/${slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        addToast('University updated successfully', 'success');
      } else {
        const res = await fetch('/api/universities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        addToast('University created successfully', 'success');
      }
      router.push('/admin/universities');
    } catch {
      addToast(isEdit ? 'Failed to update university' : 'Failed to create university', 'error');
    } finally {
      setSaving(false);
    }
  }, [form, isEdit, slug, router, addToast]);

  const inputClass = "w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]";

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/admin/universities')}
          className="p-2 text-[#1B2A4A] hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">
            {isEdit ? 'Edit University' : 'Add University'}
          </h1>
          <p className="text-[#4B5563] text-sm mt-1">
            {isEdit ? 'Update university information' : 'Add a new university to the platform'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Slug</label>
              <input name="slug" value={form.slug} onChange={handleChange} required disabled={isEdit} className={inputClass + (isEdit ? ' bg-gray-100' : '')} placeholder="e.g. tsinghua-university" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Name (English)</label>
              <input name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="e.g. Tsinghua University" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Name (Chinese)</label>
              <input name="nameCn" value={form.nameCn} onChange={handleChange} required className={inputClass} placeholder="e.g. 清华大学" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">City (English)</label>
              <input name="city" value={form.city} onChange={handleChange} required className={inputClass} placeholder="e.g. Beijing" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">City (Chinese)</label>
              <input name="cityCn" value={form.cityCn} onChange={handleChange} required className={inputClass} placeholder="e.g. 北京" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Ranking in China</label>
              <input name="ranking" type="number" value={form.ranking} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Rating (1-5)</label>
              <input name="rating" type="number" step="0.1" min="1" max="5" value={form.rating} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Type (English)</label>
              <input name="type" value={form.type} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Type (Chinese)</label>
              <input name="typeCn" value={form.typeCn} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Established Year</label>
              <input name="established" type="number" value={form.established} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Total Students</label>
              <input name="students" value={form.students} onChange={handleChange} className={inputClass} placeholder="e.g. 50,000+" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">International Students</label>
              <input name="intlStudents" value={form.intlStudents} onChange={handleChange} className={inputClass} placeholder="e.g. 4,000+" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Description</h2>
          <div className="space-y-4">
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

        {/* Programs & Tuition */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Programs & Tuition</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Popular Programs (comma-separated)</label>
              <input name="popularPrograms" value={form.popularPrograms} onChange={handleChange} className={inputClass} placeholder="Computer Science, Engineering, Business" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Popular Programs Chinese (comma-separated)</label>
              <input name="popularProgramsCn" value={form.popularProgramsCn} onChange={handleChange} className={inputClass} placeholder="计算机科学, 工程, 商学" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Undergraduate Tuition</label>
              <input name="tuitionUndergrad" value={form.tuitionUndergrad} onChange={handleChange} className={inputClass} placeholder="e.g. ¥25,000-30,000/year" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Graduate Tuition</label>
              <input name="tuitionGraduate" value={form.tuitionGraduate} onChange={handleChange} className={inputClass} placeholder="e.g. ¥30,000-50,000/year" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Intake (English)</label>
              <input name="intake" value={form.intake} onChange={handleChange} className={inputClass} placeholder="e.g. September" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Intake (Chinese)</label>
              <input name="intakeCn" value={form.intakeCn} onChange={handleChange} className={inputClass} placeholder="e.g. 9月" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Disciplines (comma-separated)</label>
              <input name="disciplines" value={form.disciplines} onChange={handleChange} className={inputClass} placeholder="Engineering, Science, Business, Medicine" />
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Media & Ranking</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Banner Image URL</label>
              <input name="image" value={form.image} onChange={handleChange} className={inputClass} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Logo URL</label>
              <input name="logo" value={form.logo} onChange={handleChange} className={inputClass} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">QS Ranking Display Text</label>
              <input name="qsRanking" value={form.qsRanking} onChange={handleChange} className={inputClass} placeholder="e.g. #25 QS World 2025" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">QS World Ranking (Number)</label>
              <input name="qsWorldRanking" type="number" value={form.qsWorldRanking} onChange={handleChange} className={inputClass} placeholder="e.g. 25" />
            </div>
          </div>
        </div>

        {/* Classification Tags */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Classification Tags</h2>
          <p className="text-sm text-[#4B5563] mb-4">Enter classification tags separated by commas. Common tags: 985, 211, Double First Class</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Tags (English, comma-separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange} className={inputClass} placeholder="e.g. 985, 211, Double First Class" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Tags (Chinese, comma-separated)</label>
              <input name="tagsCn" value={form.tagsCn} onChange={handleChange} className={inputClass} placeholder="e.g. 985工程, 211工程, 双一流" />
            </div>
          </div>
          {/* Quick tag buttons */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Quick add:</span>
            {['985', '211', 'Double First Class'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  const current = form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [];
                  if (!current.includes(tag)) {
                    setForm(prev => ({
                      ...prev,
                      tags: prev.tags ? `${prev.tags}, ${tag}` : tag,
                    }));
                  }
                }}
                className="text-xs font-medium px-2.5 py-1 border border-[#1B2A4A]/20 bg-[#1B2A4A]/5 text-[#1B2A4A] hover:bg-[#1B2A4A]/10 transition-colors"
              >
                + {tag}
              </button>
            ))}
            {['985工程', '211工程', '双一流'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  const current = form.tagsCn ? form.tagsCn.split(',').map(s => s.trim()).filter(Boolean) : [];
                  if (!current.includes(tag)) {
                    setForm(prev => ({
                      ...prev,
                      tagsCn: prev.tagsCn ? `${prev.tagsCn}, ${tag}` : tag,
                    }));
                  }
                }}
                className="text-xs font-medium px-2.5 py-1 border border-[#9B1B30]/20 bg-[#9B1B30]/5 text-[#9B1B30] hover:bg-[#9B1B30]/10 transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Accommodation */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Accommodation</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Accommodation Description (English)</label>
              <textarea name="accommodation" value={form.accommodation} onChange={handleChange} rows={3} className={inputClass} placeholder="Describe on-campus housing options for international students..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Accommodation Description (Chinese)</label>
              <textarea name="accommodationCn" value={form.accommodationCn} onChange={handleChange} rows={3} className={inputClass} placeholder="描述国际学生校内住宿选择..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Cost Range (English)</label>
                <input name="accommodationCost" value={form.accommodationCost} onChange={handleChange} className={inputClass} placeholder="e.g. ¥800 - 2,500/month" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Cost Range (Chinese)</label>
                <input name="accommodationCostCn" value={form.accommodationCostCn} onChange={handleChange} className={inputClass} placeholder="e.g. ¥800 - 2,500/月" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Room Types (English, comma-separated)</label>
                <input name="accommodationTypes" value={form.accommodationTypes} onChange={handleChange} className={inputClass} placeholder="e.g. Single Room, Double Room, Shared Apartment" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-1">Room Types (Chinese, comma-separated)</label>
                <input name="accommodationTypesCn" value={form.accommodationTypesCn} onChange={handleChange} className={inputClass} placeholder="e.g. 单人间, 双人间, 合租公寓" />
              </div>
            </div>
          </div>

          {/* Campus Gallery */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-base font-semibold text-[#1B2A4A] mb-4">Campus Gallery</h3>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Gallery Image URLs (one URL per line)</label>
              <textarea
                name="gallery"
                value={form.gallery}
                onChange={handleChange}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30] font-mono"
                placeholder={"https://images.unsplash.com/photo-xxx?w=800&q=80\nhttps://images.unsplash.com/photo-yyy?w=800&q=80\nhttps://images.unsplash.com/photo-zzz?w=800&q=80"}
              />
              <p className="mt-1 text-xs text-gray-400">Paste image URLs, one per line. Used for campus gallery display.</p>
              {form.gallery && form.gallery.split('\n').filter(s => s.trim()).length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {form.gallery.split('\n').filter(s => s.trim()).map((url, idx) => (
                    <div key={idx} className="relative overflow-hidden border border-gray-200">
                      <img src={url.trim()} alt={`Preview ${idx + 1}`} className="h-20 w-full object-cover" />
                      <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5">{idx + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scholarship Information */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-1">Scholarship Information</h2>
          <p className="text-sm text-[#4B5563] mb-4">
            University-specific scholarship narrative. Shown on the Scholarships tab of the
            public university detail page between the per-program list and the general
            categories. Each university has its own scholarships — write them out as text
            here (e.g. which scholarships this university offers, coverage, eligibility,
            how to apply, deadlines, links).
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Scholarship Info (English)</label>
              <textarea
                name="scholarshipInfo"
                value={form.scholarshipInfo}
                onChange={handleChange}
                rows={6}
                className={inputClass}
                placeholder="e.g. Tsinghua University offers the following scholarships for international students: ..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Scholarship Info (Chinese)</label>
              <textarea
                name="scholarshipInfoCn"
                value={form.scholarshipInfoCn}
                onChange={handleChange}
                rows={6}
                className={inputClass}
                placeholder="例如：清华大学为国际学生提供以下奖学金：..."
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#9B1B30] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#7A1526] transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : isEdit ? 'Update University' : 'Create University'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/universities')}
            className="px-6 py-2.5 text-sm font-medium text-[#4B5563] border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function UniversityFormPage({ params }: { params: Promise<{ slug?: string }> }) {
  const [slug, setSlug] = useState<string | undefined>(undefined);
  useEffect(() => {
    params.then(p => setSlug(p.slug));
  }, [params]);

  return (
    <ToastProvider>
      <UniversityFormInner slug={slug} />
    </ToastProvider>
  );
}
