'use client';

/**
 * Admin: unified leads inbox — Phase 2.1 lead workflow.
 *
 * One list, one filter bar, three source tables (contact / chat /
 * assessment). Each row links to the detail page where you can
 * change status, write notes, assign, and view the timeline.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Mail,
  Phone,
  MessageCircle,
  Loader2,
  AlertCircle,
  ArrowRight,
  Globe,
  GraduationCap,
  FileText,
} from 'lucide-react';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';

type LeadType = 'contact' | 'chat' | 'assessment';

interface UnifiedLead {
  lead_type: LeadType;
  lead_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  country: string | null;
  program: string | null;
  subject: string | null;
  message: string | null;
  status: string | null;
  notes: string | null;
  assigned_to: string | null;
  last_contacted_at: string | null;
  contact_attempts: number;
  source_page: string | null;
  referrer: string | null;
  created_at: string;
  updated_at: string | null;
}

interface LeadsResponse {
  leads: UnifiedLead[];
  total: number;
  counts: { contact: number; chat: number; assessment: number; total: number };
}

const STATUS_COLOR: Record<string, string> = {
  New: 'bg-blue-100 text-blue-800',
  Pending: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  Reviewed: 'bg-yellow-100 text-yellow-800',
  Resolved: 'bg-green-100 text-green-800',
  Accepted: 'bg-green-100 text-green-800',
  Qualified: 'bg-green-100 text-green-800',
  Spam: 'bg-gray-100 text-gray-700',
  Unqualified: 'bg-gray-100 text-gray-700',
  Rejected: 'bg-red-100 text-red-800',
  Contacted: 'bg-purple-100 text-purple-800',
};

const TYPE_COLOR: Record<LeadType, string> = {
  contact: 'bg-[#1B2A4A] text-white',
  chat: 'bg-[#9B1B30] text-white',
  assessment: 'bg-[#D4A853] text-[#1B2A4A]',
};

const TYPE_LABEL: Record<LeadType, string> = {
  contact: 'Contact',
  chat: 'Chat',
  assessment: 'Assessment',
};

const STATUS_OPTIONS: Record<LeadType, string[]> = {
  contact: ['New', 'In Progress', 'Resolved', 'Spam'],
  chat: ['New', 'Contacted', 'Qualified', 'Unqualified'],
  assessment: ['Pending', 'Reviewed', 'Contacted', 'Accepted', 'Rejected'],
};

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<UnifiedLead[]>([]);
  const [counts, setCounts] = useState({ contact: 0, chat: 0, assessment: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<LeadType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [q, setQ] = useState('');

  // Reset status when type changes (status enums differ)
  useEffect(() => {
    setStatusFilter('all');
  }, [typeFilter]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (countryFilter.trim()) params.set('country', countryFilter.trim());
      if (assigneeFilter !== 'all') params.set('assignee', assigneeFilter);
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);
      if (q.trim()) params.set('q', q.trim());
      params.set('limit', '100');
      const res = await apiFetchJson<LeadsResponse>(`/api/admin/leads?${params}`);
      setLeads(res.leads || []);
      setCounts(res.counts || { contact: 0, chat: 0, assessment: 0, total: 0 });
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, statusFilter, countryFilter, assigneeFilter, fromDate, toDate, q]);

  useEffect(() => {
    load();
  }, [load]);

  const statusOptions: string[] = useMemo(
    () => (typeFilter === 'all' ? [] : STATUS_OPTIONS[typeFilter]),
    [typeFilter],
  );

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const openDetail = (lead: UnifiedLead) => {
    router.push(`/admin/leads/${lead.lead_id}?type=${lead.lead_type}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Leads</h1>
          <p className="text-gray-500 mt-1">
            Unified inbox across contact form, chat, and assessment submissions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="px-3 py-1 bg-[#1B2A4A] text-white">
            Contact {counts.contact}
          </span>
          <span className="px-3 py-1 bg-[#9B1B30] text-white">
            Chat {counts.chat}
          </span>
          <span className="px-3 py-1 bg-[#D4A853] text-[#1B2A4A]">
            Assessment {counts.assessment}
          </span>
        </div>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      {/* Filter bar */}
      <div className="bg-white p-4 border border-gray-200 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search name, email, WhatsApp, program, message..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as LeadType | 'all')}>
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <SelectValue placeholder="Type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="contact">Contact</SelectItem>
              <SelectItem value="chat">Chat</SelectItem>
              <SelectItem value="assessment">Assessment</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions.map((s: string) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              <SelectItem value="me">Me</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Globe size={14} />
            <Input
              placeholder="Country"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="w-[150px]"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>From</span>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-[150px]"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>To</span>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-[150px]"
            />
          </div>
          {(countryFilter || assigneeFilter !== 'all' || fromDate || toDate || q) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCountryFilter('');
                setAssigneeFilter('all');
                setFromDate('');
                setToDate('');
                setQ('');
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Lead list */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="md" className="text-[#1B2A4A]" />
          </div>
        ) : leads.length === 0 ? (
          <div className="bg-white border border-gray-200 px-4 py-12 text-center text-gray-500">
            No leads match your filters.
          </div>
        ) : (
          <div className="space-y-2">
            {leads.map((lead) => (
              <button
                key={`${lead.lead_type}:${lead.lead_id}`}
                onClick={() => openDetail(lead)}
                className="w-full text-left bg-white border border-gray-200 p-4 hover:border-[#9B1B30]/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-start gap-1 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 font-semibold ${TYPE_COLOR[lead.lead_type]}`}>
                      {TYPE_LABEL[lead.lead_type]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[#1B2A4A] truncate">
                        {lead.name || '(no name)'}
                      </h3>
                      {lead.status && (
                        <Badge className={STATUS_COLOR[lead.status] || 'bg-gray-100 text-gray-800'}>
                          {lead.status}
                        </Badge>
                      )}
                      {lead.assigned_to ? (
                        <span className="text-xs text-gray-500">Assigned</span>
                      ) : (
                        <span className="text-xs text-[#9B1B30]">Unassigned</span>
                      )}
                      {lead.contact_attempts > 0 && (
                        <span className="text-xs text-gray-500">
                          · {lead.contact_attempts} contact{lead.contact_attempts === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-gray-600">
                      {lead.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {lead.email}
                        </span>
                      )}
                      {lead.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {lead.phone}
                        </span>
                      )}
                      {lead.whatsapp && (
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {lead.whatsapp}
                        </span>
                      )}
                      {lead.country && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" /> {lead.country}
                        </span>
                      )}
                    </div>
                    {lead.program && (
                      <p className="text-sm text-gray-700 mt-1 flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        <span className="font-medium">{lead.program}</span>
                      </p>
                    )}
                    {lead.subject && (
                      <p className="text-sm text-gray-700 mt-1 flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span className="font-medium">{lead.subject}</span>
                      </p>
                    )}
                    {lead.message && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{lead.message}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">{formatDate(lead.created_at)}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
