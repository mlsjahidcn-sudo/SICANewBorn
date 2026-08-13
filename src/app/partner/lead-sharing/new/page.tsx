'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import { getPartnerLeadStatusLabel } from '@/lib/partner-enum-labels';
import type { PartnerLeadStatus } from '@/lib/partner-lead-mapper';
import { PARTNER_LEAD_STATUSES } from '@/lib/partner-lead-mapper';

interface FormData {
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  interestedProgram: string;
  status: PartnerLeadStatus;
  notes: string;
}

const INITIAL: FormData = {
  leadName: '',
  leadEmail: '',
  leadPhone: '',
  interestedProgram: '',
  status: 'New',
  notes: '',
};

export default function PartnerNewLeadPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [formData, setFormData] = useState<FormData>(INITIAL);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.leadName.trim()) {
      setError(t('partnerLeadNew.errorLeadNameRequired'));
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        leadName: formData.leadName.trim(),
        leadEmail: formData.leadEmail.trim() || undefined,
        leadPhone: formData.leadPhone.trim() || undefined,
        interestedProgram: formData.interestedProgram.trim() || undefined,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
      };
      const res = await apiFetchJson<{ lead: { id: string } }>('/api/partner/leads', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      router.push(`/partner/lead-sharing/${res.lead.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('partnerLeadNew.errorCreate'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/partner/lead-sharing" className="p-2 hover:bg-gray-100 inline-flex">
          <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('partnerLeadNew.title')}</h1>
          <p className="text-[#4B5563] mt-1 text-sm">{t('partnerLeadNew.subtitle')}</p>
        </div>
      </div>

      {error && (
        <Card className="rounded-none border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="rounded-none">
          <CardContent className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">{t('partnerLeadNew.sectionInfo')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="leadName" className="text-[#1B2A4A] mb-2 block">
                    {t('partnerLeadNew.fieldLeadName')} <span className="text-red-600">{t('partnerCommon.requiredAsterisk')}</span>
                  </Label>
                  <Input id="leadName" name="leadName" value={formData.leadName} onChange={handleInputChange} required className="rounded-none" />
                </div>
                <div>
                  <Label htmlFor="leadEmail" className="text-[#1B2A4A] mb-2 block">{t('partnerLeadNew.fieldEmail')}</Label>
                  <Input id="leadEmail" name="leadEmail" type="email" value={formData.leadEmail} onChange={handleInputChange} className="rounded-none" placeholder={t('partnerLeadNew.fieldEmailPlaceholder')} />
                </div>
                <div>
                  <Label htmlFor="leadPhone" className="text-[#1B2A4A] mb-2 block">{t('partnerLeadNew.fieldPhone')}</Label>
                  <Input id="leadPhone" name="leadPhone" type="tel" value={formData.leadPhone} onChange={handleInputChange} className="rounded-none" placeholder={t('partnerLeadNew.fieldPhonePlaceholder')} />
                </div>
                <div>
                  <Label htmlFor="interestedProgram" className="text-[#1B2A4A] mb-2 block">{t('partnerLeadNew.fieldInterestedProgram')}</Label>
                  <Input id="interestedProgram" name="interestedProgram" value={formData.interestedProgram} onChange={handleInputChange} className="rounded-none" placeholder={t('partnerLeadNew.fieldInterestedProgramPlaceholder')} />
                </div>
                <div>
                  <Label htmlFor="status" className="text-[#1B2A4A] mb-2 block">{t('partnerLeadNew.fieldStatus')}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, status: value as PartnerLeadStatus }))
                    }
                  >
                    <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PARTNER_LEAD_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{getPartnerLeadStatusLabel(s, t)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="notes" className="text-[#1B2A4A] mb-2 block">{t('partnerLeadNew.fieldNotes')}</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="rounded-none"
                placeholder={t('partnerLeadNew.fieldNotesPlaceholder')}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-6">
          <Link href="/partner/lead-sharing">
            <Button type="button" variant="outline" className="rounded-none" disabled={isSaving}>
              {t('partnerLeadNew.cancel')}
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? t('partnerLeadNew.creating') : t('partnerLeadNew.createLead')}
          </Button>
        </div>
      </form>
    </div>
  );
}
