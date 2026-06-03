'use client';

import { useState, type FormEvent } from 'react';
import { Spinner } from '@/components/ui/spinner';
import {
  Mail,
  AlertCircle,
} from 'lucide-react';

interface Props {
  formTitle: string;
  labels: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    messagePlaceholder: string;
    submit: string;
    subjectGeneral: string;
    subjectApplication: string;
    subjectScholarship: string;
    subjectVisa: string;
    subjectOther: string;
  };
  successMessages: {
    title: string;
    body: string;
    sendAnother: string;
  };
}

/**
 * Client island for the contact form. Submits to /api/leads.
 * Static layout (hero, contact info, QR codes, office hours) is
 * server-rendered by the page.
 */
export function ContactForm({ formTitle, labels, successMessages }: Props) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      kind: 'contact',
      name: data.get('name'),
      email: data.get('email'),
      phone: data.get('phone') || '',
      subject: data.get('subject'),
      message: data.get('message'),
      sourcePage: typeof window !== 'undefined' ? window.location.pathname : '/contact',
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Submission failed (${res.status})`);
      }
      setStatus('success');
      form.reset();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed');
      setStatus('error');
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-[#1F2937] mb-6">{formTitle}</h2>

      {status === 'success' ? (
        <div className="text-center py-12">
          <div className="h-16 w-16 bg-[#9B1B30]/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-[#9B1B30]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1F2937] mb-2">{successMessages.title}</h3>
          <p className="text-[#4B5563]">{successMessages.body}</p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-6 px-6 py-2 bg-[#9B1B30] text-white font-semibold text-sm uppercase tracking-wider hover:bg-[#7A1526] transition-colors duration-150"
          >
            {successMessages.sendAnother}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">
                {labels.name} *
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">
                {labels.email} *
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
                placeholder="john@example.com"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">
                {labels.phone}
              </label>
              <input
                type="tel"
                name="phone"
                className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
                placeholder="+1 234 567 890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">
                {labels.subject} *
              </label>
              <select
                name="subject"
                required
                defaultValue="general"
                className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
              >
                <option value="general">{labels.subjectGeneral}</option>
                <option value="application">{labels.subjectApplication}</option>
                <option value="scholarship">{labels.subjectScholarship}</option>
                <option value="visa">{labels.subjectVisa}</option>
                <option value="other">{labels.subjectOther}</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-1">
              {labels.message} *
            </label>
            <textarea
              name="message"
              required
              rows={5}
              className="w-full border border-gray-300 px-4 py-2.5 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30] resize-vertical"
              placeholder={labels.messagePlaceholder}
            />
          </div>
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full sm:w-auto px-8 py-3 bg-[#9B1B30] text-white font-semibold uppercase tracking-wider text-sm hover:bg-[#7A1526] transition-colors duration-150 flex items-center gap-2 disabled:opacity-50"
          >
            {status === 'submitting' ? (
              <>
                <Spinner size="sm" />
                Sending…
              </>
            ) : (
              labels.submit
            )}
          </button>
        </form>
      )}
    </div>
  );
}
