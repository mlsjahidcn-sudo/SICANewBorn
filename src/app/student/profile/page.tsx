'use client';

import { useState, useEffect } from 'react';
import { User, Edit, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StudentProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 animate-pulse rounded-none" />
          <div className="h-96 bg-gray-200 animate-pulse rounded-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">My Profile</h1>
          <p className="text-[#4B5563] mt-1">Manage your personal information</p>
        </div>
        <Button 
          variant={isEditing ? "default" : "outline"} 
          className="rounded-none"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input defaultValue="John" disabled={!isEditing} className="rounded-none" />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input defaultValue="Smith" disabled={!isEditing} className="rounded-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input defaultValue="john.smith@example.com" disabled className="rounded-none" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input defaultValue="+1 202 555 0123" disabled={!isEditing} className="rounded-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nationality</Label>
                <Input defaultValue="United States" disabled={!isEditing} className="rounded-none" />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input defaultValue="2000-05-15" type="date" disabled={!isEditing} className="rounded-none" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education & Preferences */}
        <Card className="rounded-none">
          <CardHeader>
            <CardTitle>Education & Preferences</CardTitle>
            <CardDescription>Your academic background</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Highest Education</Label>
              <Input defaultValue="High School" disabled={!isEditing} className="rounded-none" />
            </div>
            <div className="space-y-2">
              <Label>School Name</Label>
              <Input defaultValue="Lincoln High School" disabled={!isEditing} className="rounded-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Graduation Year</Label>
                <Input defaultValue="2018" disabled={!isEditing} className="rounded-none" />
              </div>
              <div className="space-y-2">
                <Label>GPA</Label>
                <Input defaultValue="3.8" disabled={!isEditing} className="rounded-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>English Proficiency</Label>
              <Input defaultValue="IELTS - 7.0" disabled={!isEditing} className="rounded-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Degree</Label>
                <Input defaultValue="Bachelor" disabled={!isEditing} className="rounded-none" />
              </div>
              <div className="space-y-2">
                <Label>Target Intake</Label>
                <Input defaultValue="September 2024" disabled={!isEditing} className="rounded-none" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Field of Study</Label>
              <Input defaultValue="Computer Science" disabled={!isEditing} className="rounded-none" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
