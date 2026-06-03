'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, Bell, Lock, Building2, Shield, Key, CheckCircle, AlertCircle, Loader2, Mail, Phone, MapPin, Calendar, Percent } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetchJson } from '@/lib/api-client';

interface Partner {
  id: string;
  email: string;
  company_name: string;
  contact_person: string;
  status: string;
  commission_rate: number;
  created_at?: string;
  updated_at?: string;
}

export default function PartnerSettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiFetchJson<{ partner: Partner }>('/api/partner/me');
      setPartner(res.partner);
      setCompanyName(res.partner.company_name ?? '');
      setContactPerson(res.partner.contact_person ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load partner profile.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Auto-dismiss toast after 3s
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      if (!companyName.trim()) {
        setMessage({ type: 'error', text: 'Company name is required.' });
        return;
      }
      await apiFetchJson<{ partner: Partner }>('/api/partner/me', {
        method: 'PATCH',
        body: JSON.stringify({
          company_name: companyName.trim(),
          contact_person: contactPerson.trim(),
        }),
      });
      setMessage({ type: 'success', text: 'Account settings saved successfully.' });
      await load();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse w-48" />
        <div className="h-64 bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (error && !partner) {
    return (
      <Card className="rounded-none border-red-200 bg-red-50">
        <CardContent className="p-6 text-red-700">
          <p className="font-medium">Couldn't load partner profile</p>
          <p className="text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!partner) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Settings</h1>
        <p className="text-[#4B5563] mt-1">Manage your partner account settings</p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 px-4 py-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 sticky top-4">
            <nav className="p-2 space-y-1">
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                  activeTab === 'account' ? 'bg-[#9B1B30]/10 text-[#9B1B30]' : 'text-[#1B2A4A] hover:bg-gray-100'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Account</span>
              </button>
              <button
                onClick={() => setActiveTab('rates')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                  activeTab === 'rates' ? 'bg-[#9B1B30]/10 text-[#9B1B30]' : 'text-[#1B2A4A] hover:bg-gray-100'
                }`}
              >
                <Key className="w-4 h-4" />
                <span>Rates & Status</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                  activeTab === 'security' ? 'bg-[#9B1B30]/10 text-[#9B1B30]' : 'text-[#1B2A4A] hover:bg-gray-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Security</span>
              </button>
            </nav>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {activeTab === 'account' && (
            <form onSubmit={handleSaveAccount}>
              <Card className="rounded-none">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-[#1B2A4A]">Company Information</h2>
                    <p className="text-sm text-[#4B5563] mt-1">
                      The basic info that appears on your partner profile and in reports.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="companyName" className="text-[#1B2A4A] mb-2 block">
                        Company Name <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        className="rounded-none"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson" className="text-[#1B2A4A] mb-2 block">
                        Contact Person
                      </Label>
                      <Input
                        id="contactPerson"
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="rounded-none"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2 pt-1">
                      <Mail className="h-4 w-4 text-[#4B5563]" />
                      <span className="text-sm text-[#4B5563]">Email:</span>
                      <span className="text-sm font-medium text-[#1B2A4A]">{partner.email}</span>
                      <span className="text-xs text-[#4B5563] italic ml-2">
                        (managed by SICA admin)
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-none bg-[#9B1B30] hover:bg-[#7a1626]"
                    >
                      {isSaving ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Saving…
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          )}

          {activeTab === 'rates' && (
            <Card className="rounded-none">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">Rates & Status</h2>
                  <p className="text-sm text-[#4B5563] mt-1">
                    Your current service rates and partner status.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 border border-gray-200">
                    <div className="text-sm text-[#4B5563] flex items-center gap-1">
                      <Percent className="h-4 w-4" /> Service Rate
                    </div>
                    <div className="text-2xl font-bold text-[#1B2A4A] mt-1">
                      {partner.commission_rate ?? 0}%
                    </div>
                    <div className="text-xs text-[#4B5563] mt-1">
                      Commission per successful application
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200">
                    <div className="text-sm text-[#4B5563]">Partner Status</div>
                    <div className="mt-1">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium ${
                          partner.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {partner.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#4B5563] mt-1">
                      Set by SICA admin
                    </div>
                  </div>
                </div>

                {partner.created_at && (
                  <div className="flex items-center gap-2 text-sm pt-2">
                    <Calendar className="h-4 w-4 text-[#4B5563]" />
                    <span className="text-[#4B5563]">Joined:</span>
                    <span className="text-[#1B2A4A] font-medium">
                      {new Date(partner.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}

                <div className="p-4 bg-yellow-50 border border-yellow-200">
                  <div className="text-sm text-yellow-800">
                    <strong>Note:</strong> To request changes to your commission rate or status,
                    please contact the SICA admin team.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="rounded-none">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#1B2A4A]">Security</h2>
                  <p className="text-sm text-[#4B5563] mt-1">
                    Authentication for partner accounts is managed by Supabase.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#4B5563]" />
                    <span className="text-[#1B2A4A] font-medium">Password</span>
                  </div>
                  <p className="text-[#4B5563]">
                    To reset your password, use the Supabase "Forgot password" link on the login
                    page. A password-reset email will be sent to <strong>{partner.email}</strong>.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200">
                  <div className="text-sm text-blue-800">
                    <strong>Coming soon:</strong> In-app password change + 2FA. For now, the
                    Supabase recovery flow is the canonical path.
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
