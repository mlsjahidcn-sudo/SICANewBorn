'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Copy,
  AlertCircle,
  Mail,
  User,
  Phone,
  Globe,
  FileText,
  Percent,
  Loader2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';
import { apiFetchJson } from '@/lib/api-client';

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

interface FormData {
  email: string;
  company_name: string;
  contact_person: string;
  phone: string;
  country: string;
  notes: string;
  commission_rate: string;
  send_welcome_email: boolean;
}

const DEFAULTS: FormData = {
  email: '',
  company_name: '',
  contact_person: '',
  phone: '',
  country: '',
  notes: '',
  commission_rate: '',
  send_welcome_email: true,
};

interface CreatedPartner {
  id: string;
  company_name: string;
  email: string;
  contact_person: string;
}

export default function NewPartnerPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [form, setForm] = useState<FormData>(DEFAULTS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [createdPartner, setCreatedPartner] = useState<CreatedPartner | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const commissionRef = useRef<HTMLInputElement>(null);

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!form.email.trim()) {
      errs.email = t('adminPartnerNew.fieldEmailRequired');
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      errs.email = t('adminPartnerNew.errorEmailInvalid');
    }
    if (!form.company_name.trim()) {
      errs.company_name = t('adminPartnerNew.fieldCompanyNameRequired');
    }
    if (!form.contact_person.trim()) {
      errs.contact_person = t('adminPartnerNew.fieldContactPersonRequired');
    }
    if (form.commission_rate.trim()) {
      const parsed = parseFloat(form.commission_rate);
      if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
        errs.commission_rate = t('adminPartnerNew.errorCommissionRateRange');
      }
    }
    return errs;
  };

  const focusFirstError = (errs: Record<string, string>) => {
    const order = ['email', 'company_name', 'contact_person', 'commission_rate'] as const;
    const first = order.find((k) => errs[k]);
    if (!first) return;
    const refs: Record<string, React.RefObject<HTMLInputElement | null>> = {
      email: emailRef,
      company_name: companyRef,
      contact_person: contactRef,
      commission_rate: commissionRef,
    };
    const ref = refs[first];
    ref?.current?.focus();
    ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = async () => {
    setError(null);
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      focusFirstError(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        email: form.email.trim().toLowerCase(),
        company_name: form.company_name.trim(),
        contact_person: form.contact_person.trim(),
        send_welcome_email: form.send_welcome_email,
      };
      if (form.phone.trim()) body.phone = form.phone.trim();
      if (form.country.trim()) body.country = form.country.trim();
      if (form.notes.trim()) body.notes = form.notes.trim();
      if (form.commission_rate.trim()) {
        body.commission_rate = parseFloat(form.commission_rate);
      }

      const data = await apiFetchJson<{
        partner: CreatedPartner;
        temporaryPassword?: string;
      }>('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setCreatedPartner(data.partner);
      setTempPassword(data.temporaryPassword ?? null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('adminPartnerNew.errorServer');
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (value: string, field: 'email' | 'password') => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Clipboard blocked; user can copy manually.
    }
  };

  const handleCreateAnother = () => {
    setCreatedPartner(null);
    setTempPassword(null);
    setForm(DEFAULTS);
    setFieldErrors({});
    setError(null);
  };

  // Success state: temp password reveal
  if (createdPartner) {
    return (
      <div>
        <div className="max-w-2xl space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-[#1B2A4A]">
                  {t('adminPartnerNew.successTitle')}
                </h2>
                <p className="text-[#4B5563] mt-2">
                  {t('adminPartnerNew.successBody', {
                    company: createdPartner.company_name,
                  })}
                </p>
              </div>

              {tempPassword && (
                <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-amber-900 text-sm">
                        {t('adminPartnerNew.successPasswordLabel')}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 bg-white border border-amber-300 font-mono text-sm select-all">
                          {tempPassword}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(tempPassword, 'password')}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          {copiedField === 'password'
                            ? t('adminPartnerNew.successCopied')
                            : t('adminPartnerNew.successCopyPassword')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6">
                <div className="flex items-start gap-2">
                  <Mail className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-700 text-sm">
                      {t('adminPartnerNew.successEmailLabel')}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-white border border-gray-300 font-mono text-sm select-all">
                        {createdPartner.email}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(createdPartner.email, 'email')}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        {copiedField === 'email'
                          ? t('adminPartnerNew.successCopied')
                          : t('adminPartnerNew.successCopyEmail')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Button variant="outline" onClick={handleCreateAnother}>
                  {t('adminPartnerNew.successCreateAnother')}
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/partners">{t('adminPartnerNew.buttonCancel')}</Link>
                </Button>
                <Button className="bg-[#9B1B30] hover:bg-[#7A1526]" asChild>
                  <Link href={`/admin/partners/${createdPartner.id}`}>
                    {t('adminPartnerNew.successGotoPartner')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/partners" className="p-2 hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-3">
                <Building2 className="w-6 h-6" />
                {t('adminPartnerNew.title')}
                <Badge className="bg-[#1B2A4A] hover:bg-[#152138]">Admin</Badge>
              </h1>
              <p className="text-[#4B5563] mt-1">{t('adminPartnerNew.subtitle')}</p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* Company + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="company_name" className="text-[#1B2A4A]">
                  {t('adminPartnerNew.fieldCompanyName')} *
                </Label>
                <Input
                  id="company_name"
                  ref={companyRef}
                  value={form.company_name}
                  onChange={(e) => setField('company_name', e.target.value)}
                  className={`mt-2 ${fieldErrors.company_name ? 'border-red-500' : ''}`}
                  required
                />
                {fieldErrors.company_name && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.company_name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email" className="text-[#1B2A4A]">
                  {t('adminPartnerNew.fieldEmail')} *
                </Label>
                <Input
                  id="email"
                  ref={emailRef}
                  type="email"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  className={`mt-2 ${fieldErrors.email ? 'border-red-500' : ''}`}
                  required
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            {/* Contact + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="contact_person" className="text-[#1B2A4A]">
                  {t('adminPartnerNew.fieldContactPerson')} *
                </Label>
                <Input
                  id="contact_person"
                  ref={contactRef}
                  value={form.contact_person}
                  onChange={(e) => setField('contact_person', e.target.value)}
                  className={`mt-2 ${fieldErrors.contact_person ? 'border-red-500' : ''}`}
                  required
                />
                {fieldErrors.contact_person && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.contact_person}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone" className="text-[#1B2A4A]">
                  <Phone className="w-3 h-3 inline mr-1" />
                  {t('adminPartnerNew.fieldPhone')}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Country + Commission rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="country" className="text-[#1B2A4A]">
                  <Globe className="w-3 h-3 inline mr-1" />
                  {t('adminPartnerNew.fieldCountry')}
                </Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => setField('country', e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="commission_rate" className="text-[#1B2A4A]">
                  <Percent className="w-3 h-3 inline mr-1" />
                  {t('adminPartnerNew.fieldCommissionRate')}
                </Label>
                <Input
                  id="commission_rate"
                  ref={commissionRef}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.commission_rate}
                  onChange={(e) => setField('commission_rate', e.target.value)}
                  className={`mt-2 ${fieldErrors.commission_rate ? 'border-red-500' : ''}`}
                  placeholder="0–100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('adminPartnerNew.fieldCommissionRateHint')}
                </p>
                {fieldErrors.commission_rate && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.commission_rate}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes" className="text-[#1B2A4A]">
                <FileText className="w-3 h-3 inline mr-1" />
                {t('adminPartnerNew.fieldNotes')}
              </Label>
              <Textarea
                id="notes"
                rows={4}
                value={form.notes}
                onChange={(e) => setField('notes', e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Send welcome email checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                id="send_welcome_email"
                checked={form.send_welcome_email}
                onCheckedChange={(checked) =>
                  setField('send_welcome_email', checked === true)
                }
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label
                  htmlFor="send_welcome_email"
                  className="text-[#1B2A4A] cursor-pointer"
                >
                  <Mail className="w-3 h-3 inline mr-1" />
                  {t('adminPartnerNew.fieldSendWelcomeEmail')}
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-2 text-red-800 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between">
          <Button variant="outline" asChild>
            <Link href="/admin/partners">{t('adminPartnerNew.buttonCancel')}</Link>
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#9B1B30] hover:bg-[#7A1526]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('adminPartnerNew.buttonSubmitting')}
              </>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                {t('adminPartnerNew.buttonSubmit')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}