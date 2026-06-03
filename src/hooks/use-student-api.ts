'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

// Types matching our API responses
export interface StudentProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string;
  nationality?: string;
  date_of_birth?: string;
  passport_number?: string;
  passport_expiry?: string;
  current_address?: string;
  permanent_address?: string;
  highest_education?: string;
  school_name?: string;
  graduation_year?: string;
  gpa?: string;
  english_proficiency?: string;
  english_score?: string;
  target_degree?: string;
  target_field?: string;
  target_intake?: string;
  preferred_universities?: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StudentApplication {
  id: string;
  student_id: string;
  university_id: string;
  university_name?: string;
  program_id?: string;
  program_name?: string;
  status: string;
  submitted_at?: string;
  decision_date?: string;
  decision?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentDocument {
  id: string;
  student_id: string;
  category: string;
  name: string;
  file_url?: string;
  file_size?: number;
  mime_type?: string;
  status: string;
  verified_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentStats {
  total_applications: number;
  submitted_applications: number;
  pending_applications: number;
  accepted_applications: number;
  total_documents: number;
  verified_documents: number;
  pending_documents: number;
}

// API Hook for Student Profile
export function useStudentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/student/profile');
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<StudentProfile>) => {
    try {
      setError(null);
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      return data.profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
  };
}

// API Hook for Student Applications
export function useStudentApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/student/applications');
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      const data = await response.json();
      setApplications(data.applications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getApplication = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/student/applications/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch application');
      }
      
      const data = await response.json();
      return data.application;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const createApplication = async (applicationData: {
    university_id: string;
    program_id?: string;
    program_name?: string;
    notes?: string;
    document_ids?: string[];
  }) => {
    try {
      setError(null);
      const response = await fetch('/api/student/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        throw new Error('Failed to create application');
      }

      const data = await response.json();
      await fetchApplications();
      return data.application;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  return {
    applications,
    isLoading,
    error,
    fetchApplications,
    getApplication,
    createApplication,
  };
}

// API Hook for Student Documents
export function useStudentDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/student/documents');
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const data = await response.json();
      setDocuments(data.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getDocument = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/student/documents/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }
      
      const data = await response.json();
      return data.document;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const uploadDocument = async (documentData: {
    category: string;
    name: string;
    file_url?: string;
    file_size?: number;
    mime_type?: string;
  }) => {
    try {
      setError(null);
      const response = await fetch('/api/student/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const data = await response.json();
      await fetchDocuments();
      return data.document;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updateDocument = async (id: string, documentData: Partial<StudentDocument>) => {
    try {
      setError(null);
      const response = await fetch(`/api/student/documents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });

      if (!response.ok) {
        throw new Error('Failed to update document');
      }

      const data = await response.json();
      await fetchDocuments();
      return data.document;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      setError(null);
      const response = await fetch(`/api/student/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      await fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  return {
    documents,
    isLoading,
    error,
    fetchDocuments,
    getDocument,
    uploadDocument,
    updateDocument,
    deleteDocument,
  };
}

// API Hook for Student Stats
export function useStudentStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      // We'll calculate stats from applications and documents
      const [appsResponse, docsResponse] = await Promise.all([
        fetch('/api/student/applications'),
        fetch('/api/student/documents'),
      ]);

      if (!appsResponse.ok || !docsResponse.ok) {
        throw new Error('Failed to fetch stats');
      }

      const appsData = await appsResponse.json();
      const docsData = await docsResponse.json();

      const applications = appsData.applications || [];
      const documents = docsData.documents || [];

      const calculatedStats: StudentStats = {
        total_applications: applications.length,
        submitted_applications: applications.filter((a: StudentApplication) => a.status === 'Submitted').length,
        pending_applications: applications.filter((a: StudentApplication) => a.status === 'Pending' || a.status === 'In Review').length,
        accepted_applications: applications.filter((a: StudentApplication) => a.status === 'Accepted').length,
        total_documents: documents.length,
        verified_documents: documents.filter((d: StudentDocument) => d.status === 'Verified').length,
        pending_documents: documents.filter((d: StudentDocument) => d.status === 'Pending').length,
      };

      setStats(calculatedStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
  };
}
