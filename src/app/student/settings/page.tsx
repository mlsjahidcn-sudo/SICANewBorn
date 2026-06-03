'use client';

import { useState, useEffect } from 'react';
import { Settings, User, Bell, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function StudentSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded-none w-48" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-gray-200 animate-pulse rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Settings</h1>
        <p className="text-[#4B5563] mt-1">Manage your account preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <Card className="rounded-none">
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-[#1B2A4A]" />
              <div>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#1B2A4A]">Email Address</p>
                <p className="text-sm text-[#4B5563]">john.smith@example.com</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-none">Change</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#1B2A4A]">Password</p>
                <p className="text-sm text-[#4B5563]">Last changed 3 months ago</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-none">Change</Button>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <Button variant="destructive" className="rounded-none">Delete Account</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="rounded-none">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-[#1B2A4A]" />
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure your notification preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="font-medium text-[#1B2A4A]">Email Notifications</Label>
                <p className="text-sm text-[#4B5563]">Receive updates via email</p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="application-updates" className="font-medium text-[#1B2A4A]">Application Updates</Label>
                <p className="text-sm text-[#4B5563]">Get notified about application status changes</p>
              </div>
              <Switch id="application-updates" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="document-updates" className="font-medium text-[#1B2A4A]">Document Updates</Label>
                <p className="text-sm text-[#4B5563]">Get notified when documents are verified</p>
              </div>
              <Switch id="document-updates" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
        <Card className="rounded-none">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-[#1B2A4A]" />
              <div>
                <CardTitle>Language & Region</CardTitle>
                <CardDescription>Choose your language and region</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="font-medium text-[#1B2A4A]">Language</Label>
              <div className="flex gap-2 mt-2">
                <Button variant="default" size="sm" className="rounded-none">English</Button>
                <Button variant="outline" size="sm" className="rounded-none">中文</Button>
              </div>
            </div>
            <div>
              <Label className="font-medium text-[#1B2A4A]">Timezone</Label>
              <p className="text-sm text-[#4B5563] mt-1">Eastern Standard Time (EST)</p>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="rounded-none">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-[#1B2A4A]" />
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your security settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[#1B2A4A]">Two-Factor Authentication</p>
                <p className="text-sm text-[#4B5563]">Add an extra layer of security</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-none">Enable</Button>
            </div>
            <div>
              <p className="font-medium text-[#1B2A4A]">Active Sessions</p>
              <p className="text-sm text-[#4B5563]">Current browser • 1 other device</p>
              <Button variant="outline" size="sm" className="rounded-none mt-2">View All</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
