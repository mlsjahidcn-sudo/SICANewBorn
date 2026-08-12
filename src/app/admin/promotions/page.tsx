'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Sparkles,
  Eye,
  EyeOff,
  Globe,
  Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { apiFetchJson, apiFetch } from '@/lib/api-client';
import type { PartnerPromotionWithDetails } from '@/lib/partner-promotion-mapper';

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' },
];

const visibilityOptions = [
  { value: 'all', label: 'All Visibility' },
  { value: 'partner_only', label: 'Partner Only' },
  { value: 'public_and_partner', label: 'Public + Partner' },
];

export default function AdminPromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<PartnerPromotionWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [deletePromotion, setDeletePromotion] = useState<PartnerPromotionWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (visibilityFilter !== 'all') params.set('visibility', visibilityFilter);

      const res = await apiFetchJson<{ promotions: PartnerPromotionWithDetails[]; total: number }>(
        `/api/admin/promotions?${params}`,
      );
      setPromotions(res.promotions || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promotions');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, statusFilter, visibilityFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, visibilityFilter]);

  const handleDelete = async () => {
    if (!deletePromotion) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/api/admin/promotions/${deletePromotion.id}`, { method: 'DELETE' });
      setPromotions((prev) => prev.filter((p) => p.id !== deletePromotion.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setDeletePromotion(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete promotion');
    } finally {
      setIsDeleting(false);
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'active') return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    if (status === 'paused') return <Badge variant="secondary">Paused</Badge>;
    return <Badge variant="outline">Archived</Badge>;
  };

  const visibilityBadge = (visibility: string) => {
    if (visibility === 'public_and_partner') {
      return (
        <Badge variant="outline" className="gap-1">
          <Globe className="h-3 w-3" /> Public + Partner
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <EyeOff className="h-3 w-3" /> Partner Only
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Partner Promotions</h1>
          <p className="text-gray-600">
            Promote selected university programs to partners with custom service fees and restrictions.
          </p>
        </div>
        <Link href="/admin/promotions/new">
          <Button className="bg-[#9B1B30] hover:bg-[#7A1625] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Promotion
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search university or program..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm"
            >
              {visibilityOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>University / Program</TableHead>
                <TableHead>Service Fee</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Restrictions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    Loading promotions...
                  </TableCell>
                </TableRow>
              ) : promotions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No promotions found</p>
                    <p className="text-sm">Create a promoted program to share with partners.</p>
                  </TableCell>
                </TableRow>
              ) : (
                promotions.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium text-[#1B2A4A]">
                        {p.program?.name || 'Unknown Program'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {p.university?.name || 'Unknown University'}
                        {p.university?.city ? ` · ${p.university.city}` : ''}
                      </div>
                      <div className="text-xs text-gray-400">
                        {p.program?.degree} · {p.program?.language}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {p.serviceFeeCurrency === 'CNY' ? '¥' : '$'}
                        {p.serviceFeeAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">per student</div>
                    </TableCell>
                    <TableCell>{visibilityBadge(p.visibility)}</TableCell>
                    <TableCell>{statusBadge(p.status)}</TableCell>
                    <TableCell>
                      {p.targetCountries.length > 0 ? (
                        <div className="text-xs text-gray-600">
                          Target: {p.targetCountries.join(', ')}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400">All countries</div>
                      )}
                      {p.restrictedCountries.length > 0 && (
                        <div className="text-xs text-red-600 flex items-center gap-1 mt-1">
                          <Ban className="h-3 w-3" />
                          Excludes: {p.restrictedCountries.join(', ')}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/promotions/${p.id}/edit`} className="cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletePromotion(p)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {total > 20 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {(page - 1) * 20 + 1} - {Math.min(page * 20, total)} of {total}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page * 20 >= total}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!deletePromotion} onOpenChange={(open) => !open && setDeletePromotion(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Promotion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the promotion for{' '}
              <strong>{deletePromotion?.program?.name}</strong> at{' '}
              <strong>{deletePromotion?.university?.name}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePromotion(null)}>
              Cancel
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
