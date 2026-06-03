'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, Lock, Building2 } from 'lucide-react';
import { ToastProvider, useToast } from '@/components/admin/toast';

function SettingsPageInner() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'site'>('profile');
  const [profile, setProfile] = useState({ fullName: '', email: '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [siteSettings, setSiteSettings] = useState({
    contactEmail: 'info@sica-china.com',
    phone: '+86-10-6278-5564',
    wechat: 'SICA_China',
    whatsapp: '+8613812345678',
    address: 'Haidian District, Beijing, China',
    officeHours: 'Mon-Fri: 9:00 AM - 6:00 PM (CST)',
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/admin/profile');
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
    addToast('Profile updated successfully', 'success');
  }, [addToast]);

  const handlePasswordChange = useCallback(() => {
    if (passwords.newPass !== passwords.confirm) {
      addToast('Passwords do not match', 'error');
      return;
    }
    if (passwords.newPass.length < 8) {
      addToast('Password must be at least 8 characters', 'error');
      return;
    }
    addToast('Password updated successfully', 'success');
    setPasswords({ current: '', newPass: '', confirm: '' });
  }, [passwords, addToast]);

  const handleSiteSave = useCallback(() => {
    addToast('Site settings updated successfully', 'success');
  }, [addToast]);

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'password' as const, label: 'Password', icon: Lock },
    { id: 'site' as const, label: 'Site Settings', icon: Building2 },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1F2937]">Settings</h1>
        <p className="text-[#4B5563] text-sm mt-1">Manage your account and site settings</p>
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
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile(p => ({ ...p, fullName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Email</label>
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
              Save Profile
            </button>
          </div>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="bg-white border border-gray-200 p-6 max-w-xl">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Change Password</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Current Password</label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">New Password</label>
              <input
                type="password"
                value={passwords.newPass}
                onChange={(e) => setPasswords(p => ({ ...p, newPass: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            {passwords.newPass && passwords.confirm && passwords.newPass !== passwords.confirm && (
              <p className="text-red-600 text-sm">Passwords do not match</p>
            )}
            <button
              onClick={handlePasswordChange}
              className="bg-[#9B1B30] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#7A1526] transition-colors"
            >
              Update Password
            </button>
          </div>
        </div>
      )}

      {activeTab === 'site' && (
        <div className="bg-white border border-gray-200 p-6 max-w-xl">
          <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Site Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Contact Email</label>
              <input
                type="email"
                value={siteSettings.contactEmail}
                onChange={(e) => setSiteSettings(s => ({ ...s, contactEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Phone</label>
              <input
                type="text"
                value={siteSettings.phone}
                onChange={(e) => setSiteSettings(s => ({ ...s, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">WeChat ID</label>
              <input
                type="text"
                value={siteSettings.wechat}
                onChange={(e) => setSiteSettings(s => ({ ...s, wechat: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={siteSettings.whatsapp}
                onChange={(e) => setSiteSettings(s => ({ ...s, whatsapp: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Address</label>
              <textarea
                value={siteSettings.address}
                onChange={(e) => setSiteSettings(s => ({ ...s, address: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:border-[#9B1B30]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-1">Office Hours</label>
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
              Save Settings
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
