'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ToastProvider, useToast } from '@/components/admin/toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  highestEducation: string;
  major: string;
  hskScore: string;
  ieltsScore: string;
  toeflScore: string;
  targetUniversities: string;
  targetPrograms: string;
  intendedIntake: string;
  source: string;
  status: string;
  notes: string;
}

const defaultFormData: LeadFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  highestEducation: '',
  major: '',
  hskScore: '',
  ieltsScore: '',
  toeflScore: '',
  targetUniversities: '',
  targetPrograms: '',
  intendedIntake: '',
  source: 'website',
  status: 'new',
  notes: '',
};

function LeadFormPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState<LeadFormData>(defaultFormData);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const leadData = {
        ...formData,
        hskScore: formData.hskScore ? parseInt(formData.hskScore) : null,
        ieltsScore: formData.ieltsScore ? parseFloat(formData.ieltsScore) : null,
        toeflScore: formData.toeflScore ? parseInt(formData.toeflScore) : null,
        targetUniversities: formData.targetUniversities.split(',').map(s => s.trim()).filter(Boolean),
        targetPrograms: formData.targetPrograms.split(',').map(s => s.trim()).filter(Boolean),
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });

      if (!res.ok) throw new Error('Failed to create lead');
      addToast('Lead created successfully', 'success');
      router.push('/admin/leads');
    } catch (error) {
      addToast('Failed to create lead', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Add New Lead</h1>
          <p className="text-gray-500">Create a new lead entry</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+86 138 0000 0000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="Country of origin"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Education Background</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="highestEducation">Highest Education</Label>
                <Select
                  value={formData.highestEducation}
                  onValueChange={(v) => setFormData({ ...formData, highestEducation: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select education" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high_school">High School</SelectItem>
                    <SelectItem value="bachelor">Bachelor&apos;s Degree</SelectItem>
                    <SelectItem value="master">Master&apos;s Degree</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="major">Major</Label>
                <Input
                  id="major"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  placeholder="Current or previous major"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hskScore">HSK Score (1-6)</Label>
                <Input
                  id="hskScore"
                  type="number"
                  min="1"
                  max="6"
                  value={formData.hskScore}
                  onChange={(e) => setFormData({ ...formData, hskScore: e.target.value })}
                  placeholder="HSK level"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ieltsScore">IELTS Score (0-9)</Label>
                <Input
                  id="ieltsScore"
                  type="number"
                  min="0"
                  max="9"
                  step="0.5"
                  value={formData.ieltsScore}
                  onChange={(e) => setFormData({ ...formData, ieltsScore: e.target.value })}
                  placeholder="IELTS score"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toeflScore">TOEFL Score (0-120)</Label>
                <Input
                  id="toeflScore"
                  type="number"
                  min="0"
                  max="120"
                  value={formData.toeflScore}
                  onChange={(e) => setFormData({ ...formData, toeflScore: e.target.value })}
                  placeholder="TOEFL score"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Intent</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetUniversities">Target Universities (comma separated)</Label>
              <Input
                id="targetUniversities"
                value={formData.targetUniversities}
                onChange={(e) => setFormData({ ...formData, targetUniversities: e.target.value })}
                placeholder="Tsinghua University, Peking University"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetPrograms">Target Programs (comma separated)</Label>
              <Input
                id="targetPrograms"
                value={formData.targetPrograms}
                onChange={(e) => setFormData({ ...formData, targetPrograms: e.target.value })}
                placeholder="Computer Science, Business Administration"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="intendedIntake">Intended Intake</Label>
              <Input
                id="intendedIntake"
                value={formData.intendedIntake}
                onChange={(e) => setFormData({ ...formData, intendedIntake: e.target.value })}
                placeholder="September 2025"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Select
                  value={formData.source}
                  onValueChange={(v) => setFormData({ ...formData, source: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="social_media">Social Media</SelectItem>
                    <SelectItem value="event">Event/Fair</SelectItem>
                    <SelectItem value="partner">Partner Agency</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Lead</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or follow-up information..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#9B1B30] hover:bg-[#7a1526]" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Lead'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function LeadNewPage() {
  return (
    <ToastProvider>
      <LeadFormPage />
    </ToastProvider>
  );
}
