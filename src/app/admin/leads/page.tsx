'use client';

import React, { useState, useEffect } from 'react';
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
  Plus,
  Download,
  Search,
  Filter,
  Mail,
  Phone,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
  Trash2,
} from 'lucide-react';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: 'New' | 'In Progress' | 'Resolved' | 'Spam';
  notes: string | null;
  source_page: string | null;
  referrer: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string | null;
  resolved_at: string | null;
}

const STATUS_COLOR: Record<string, string> = {
  New: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  Resolved: 'bg-green-100 text-green-800',
  Spam: 'bg-gray-100 text-gray-700',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('limit', '100');
      const res = await apiFetchJson<{ leads: Lead[] }>(`/api/admin/leads?${params}`);
      setLeads(res.leads || []);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to load leads');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filtered = leads.filter((l) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      l.name?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.subject?.toLowerCase().includes(q) ||
      l.message?.toLowerCase().includes(q)
    );
  });

  const selected = leads.find((l) => l.id === selectedId) || null;

  const updateStatus = async (id: string, status: Lead['status']) => {
    setUpdatingId(id);
    try {
      await apiFetchJson(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      // Update local state
      setLeads((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, status, resolved_at: status === 'Resolved' ? new Date().toISOString() : l.resolved_at }
            : l,
        ),
      );
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Leads</h1>
          <p className="text-gray-500 mt-1">
            Contact form submissions from /contact. {leads.length} total.
          </p>
        </div>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      )}

      <div className="bg-white p-4 border border-gray-200 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search by name, email, subject, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <div className="flex items-center gap-2">
              <Filter size={16} />
              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Spam">Spam</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lead List */}
        <div className={`${selected ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-3`}>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="md" className="text-[#1B2A4A]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-gray-200 px-4 py-12 text-center text-gray-500">
              {leads.length === 0
                ? 'No leads yet. Submissions from /contact will appear here.'
                : 'No leads match your filters.'}
            </div>
          ) : (
            filtered.map((lead) => (
              <button
                key={lead.id}
                onClick={() => setSelectedId(lead.id)}
                className={`w-full text-left bg-white border ${
                  selectedId === lead.id ? 'border-[#9B1B30] ring-1 ring-[#9B1B30]' : 'border-gray-200'
                } p-4 hover:border-[#9B1B30]/50 transition-colors`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#1B2A4A] truncate">{lead.name}</h3>
                      <Badge className={STATUS_COLOR[lead.status]}>{lead.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{lead.email}</p>
                    <p className="text-sm text-gray-700 mt-1">
                      <span className="font-medium">{lead.subject}</span> ·{' '}
                      <span className="text-gray-500">{lead.message.slice(0, 80)}{lead.message.length > 80 ? '…' : ''}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">{formatDate(lead.created_at)}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Lead Detail Panel */}
        {selected && (
          <Card className="lg:col-span-1 h-fit sticky top-6">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">{selected.name}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">{formatDate(selected.created_at)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <a
                  href={`mailto:${selected.email}`}
                  className="flex items-center gap-2 text-[#1B2A4A] hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {selected.email}
                  <ExternalLink className="h-3 w-3" />
                </a>
                {selected.phone && (
                  <a
                    href={`tel:${selected.phone}`}
                    className="flex items-center gap-2 text-[#1B2A4A] hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {selected.phone}
                  </a>
                )}
                <div className="text-gray-600">
                  <span className="font-medium">Subject:</span> {selected.subject}
                </div>
                {selected.source_page && (
                  <div className="text-xs text-gray-500">
                    From: {selected.source_page}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 font-medium mb-2">Message</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{selected.message}</p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 font-medium mb-2">Status</p>
                <div className="flex flex-wrap gap-2">
                  {(['New', 'In Progress', 'Resolved', 'Spam'] as const).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={selected.status === s ? 'default' : 'outline'}
                      disabled={updatingId === selected.id}
                      onClick={() => updateStatus(selected.id, s)}
                      className={
                        selected.status === s
                          ? s === 'Resolved'
                            ? 'bg-green-600 hover:bg-green-700'
                            : s === 'Spam'
                              ? 'bg-gray-600 hover:bg-gray-700'
                              : 'bg-[#1B2A4A] hover:bg-[#152033]'
                          : ''
                      }
                    >
                      {updatingId === selected.id ? (
                        <Spinner size="xs" />
                      ) : selected.status === s ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : null}
                      {s}
                    </Button>
                  ))}
                </div>
                {selected.resolved_at && (
                  <p className="text-xs text-gray-500 mt-2">
                    Resolved at {formatDate(selected.resolved_at)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
