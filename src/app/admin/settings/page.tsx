'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, Lock, Building2 } from 'lucide-react';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { apiFetch } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';

function SettingsPageInner() {
  const { addToast } = useToast();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'site'>('profile');
  const [profile, setProfile] = useState({ fullName: '', email: '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [siteSettings, setSiteSettings] = useState({
    contactEmail: 'info@studyinchina.academy',
    phone: '+86-173-2576-4171',
    wechat: 'mlsjahid',
    whatsapp: '+8617325764171',
    address: 'Guangzhou, China',
    officeHours: 'Mon-Fri: 9:00 AM - 6:00 PM (CST)',
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiFetch('/api/admin/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile({ fullName: data.profile.full_name || '', email: data.profile.email || '' });
          }
        }
      } catch {
        // ignore
      }
    }
    loadProfile();
  }, []);

  const handleProfileSave = useCallback(() => {
    addToast(t('adminSettings.profileSuccess'), 'success');
  }, [addToast, t]);

  const handlePasswordChange = useCallback(() => {
    if (passwords.newPass !== passwords.confirm) {
      addToast(t('adminSettings.passwordMismatch'), 'error');
      return;
    }
    if (passwords.newPass.length < 8) {
      addToast(t('adminSettings.passwordTooShort'), 'error');
      return;
    }
    addToast(t('adminSettings.passwordSuccess'), 'success');
    setPasswords({ current: '', newPass: '', confirm: '' });
  }, [passwords, addToast, t]);

  const handleSiteSave = useCallback(() => {
    addToast(t('adminSettings.siteSuccess'), 'success');
  }, [addToast, t]);

  const tabs = [
    { id: 'profile' as const, label: t('adminSettings.tabProfile'), icon: User },
    { id: 'password' as const, label: t('adminSettings.tabPassword'), icon: Lock },
    { id: 'site' as const, label: t('adminSettings.tabSite'), icon: Building2 },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1F2937]">{t('adminSettings.title')}</h1>
        <p className="text-[#4B5563] text-sm mt-1">{t('adminSettings.subtitle')}</p>
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#9B1B30] text-[#9B1B30]'
                : 'border-transparent text-[#4B5563] hover:text-[#1F2937]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="bg-white border border-gray-200 p-6 max-w-xl">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">{t('adminSettings.sectionProfile')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">{t('adminSettings.fieldFullName')}</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile(p => ({ ...p, fullName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">{t('adminSettings.fieldEmail')}</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <button
              onClick={handleProfileSave}
              className="bg-[#9B1B30] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#7A1526] transition-colors"
            >
              {t('adminSettings.saveProfile')}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="bg-white border border-gray-200 p-6 max-w-xl">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">{t('adminSettings.sectionPassword')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">{t('adminSettings.fieldCurrentPassword')}</label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">{t('adminSettings.fieldNewPassword')}</label>
              <input
                type="password"
                value={passwords.newPass}
                onChange={(e) => setPasswords(p => ({ ...p, newPass: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">{t('adminSettings.fieldConfirmPassword')}</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            {passwords.newPass && passwords.confirm && passwords.newPass !== passwords.confirm && (
              <p className="text-red-600 text-sm">{t('adminSettings.passwordMismatch')}</p>
            )}
            <button
              onClick={handlePasswordChange}
              className="bg-[#9B1B30] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#7A1526] transition-colors"
            >
              {t('adminSettings.updatePassword')}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'site' && (
        <div className="bg-white border border-gray-200 p-6 max-w-xl">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">{t('adminSettings.sectionSite')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">{t('adminSettings.fieldContactEmail')}</label>
              <input
                type="email"
                value={siteSettings.contactEmail}
                onChange={(e) => setSiteSettings(s => ({ ...s, contactEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">{t('adminSettings.fieldPhone')}</label>
              <input
                type="text"
                value={siteSettings.phone}
                onChange={(e) => setSiteSettings(s => ({ ...s, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">{t('adminSettings.fieldWechat')}</label>
              <input
                type="text"
                value={siteSettings.wechat}
                onChange={(e) => setSiteSettings(s => ({ ...s, wechat: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">{t('adminSettings.fieldWhatsapp')}</label>
              <input
                type="text"
                value={siteSettings.whatsapp}
                onChange={(e) => setSiteSettings(s => ({ ...s, whatsapp: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">{t('adminSettings.fieldAddress')}</label>
              <textarea
                value={siteSettings.address}
                onChange={(e) => setSiteSettings(s => ({ ...s, address: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">{t('adminSettings.fieldOfficeHours')}</label>
              <input
                type="text"
                value={siteSettings.officeHours}
                onChange={(e) => setSiteSettings(s => ({ ...s, officeHours: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <button
              onClick={handleSiteSave}
              className="bg-[#9B1B30] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#7A1526] transition-colors"
            >
              {t('adminSettings.saveSettings')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ToastProvider>
      <SettingsPageInner />
    </ToastProvider>
  );
}
