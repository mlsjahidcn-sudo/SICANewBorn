'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ClipboardCopy,
  Edit,
  Flag,
  MoreHorizontal,
  RotateCcw,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useI18n } from '@/lib/i18n';
import {
  getPartnerApplicationDecisionLabel,
  getPartnerApplicationPriorityLabel,
  getPartnerApplicationStatusLabel,
} from '@/lib/partner-enum-labels';
import {
  PRIORITY_VARIANTS,
  SOURCE_LABEL_KEY,
  STATUS_VARIANTS,
} from '@/lib/partner-status-styles';
import type { PartnerApplication } from '@/lib/partner-application-mapper';

export interface ApplicationDetailHeaderProps {
  app: PartnerApplication;
  cloning: boolean;
  onClone: () => void;
  onRequestWithdrawal: () => void;
  onDelete: () => void;
}

/**
 * The header of the partner application detail page.
 *
 * Extracted from the page body so the page file stays about the
 * application data, not about chrome. The four actions collapse into a
 * dropdown below `md` — four outlined buttons wrap badly on a phone.
 */
export function ApplicationDetailHeader({
  app,
  cloning,
  onClone,
  onRequestWithdrawal,
  onDelete,
}: ApplicationDetailHeaderProps) {
  const { t } = useI18n();

  const canRequestWithdrawal = app.status !== 'Withdrawn';
  const sourceKey = app.source ? SOURCE_LABEL_KEY[app.source] : null;

  const editButton = (
    <Button asChild variant="outline" className="rounded-none">
      <Link href={`/partner/applications/${app.id}/edit`}>
        <Edit className="mr-2 h-4 w-4" />
        {t('partnerAppDetail.edit')}
      </Link>
    </Button>
  );

  const cloneButton = (
    <Button
      variant="outline"
      className="rounded-none"
      onClick={onClone}
      disabled={cloning}
      title={t('partnerAppDetail.cloneTooltip')}
    >
      <ClipboardCopy className="mr-2 h-4 w-4" />
      {t('partnerAppDetail.clone')}
    </Button>
  );

  const withdrawalButton = canRequestWithdrawal ? (
    <Button variant="outline" className="rounded-none" onClick={onRequestWithdrawal}>
      <RotateCcw className="mr-2 h-4 w-4" />
      {t('partnerAppDetail.requestWithdrawal')}
    </Button>
  ) : null;

  const deleteButton = (
    <Button
      variant="outline"
      onClick={onDelete}
      className="rounded-none border-red-300 text-red-600 hover:bg-red-50"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {t('partnerAppDetail.delete')}
    </Button>
  );

  return (
    <div className="flex items-start gap-4">
      <Link
        href="/partner/applications"
        className="p-2 hover:bg-gray-100 inline-flex flex-shrink-0"
        aria-label={t('partnerAppDetail.backToApplications')}
      >
        <ArrowLeft className="w-5 h-5 text-[#1B2A4A]" />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-[#1B2A4A]">{app.studentName}</h1>
          <Badge variant={STATUS_VARIANTS[app.status]} className="rounded-none">
            {getPartnerApplicationStatusLabel(app.status, t)}
          </Badge>
          <Badge variant="outline" className="rounded-none">
            {getPartnerApplicationDecisionLabel(app.decision, t)}
          </Badge>
          {app.priority && app.priority !== 'Normal' && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-none ${PRIORITY_VARIANTS[app.priority]}`}
              title={t('partnerAppDetail.priorityTitle')}
            >
              <Flag className="w-3 h-3" /> {getPartnerApplicationPriorityLabel(app.priority, t)}
            </span>
          )}
          {sourceKey && (
            <Badge variant="outline" className="rounded-none text-[#4B5563]">
              {t(`partnerAppDetail.source${sourceKey}` as 'partnerAppDetail.sourcePartnerPortal')}
            </Badge>
          )}
        </div>
        <p className="text-[#4B5563] mt-1 text-sm">
          {app.university && app.program
            ? `${app.university} · ${app.program}`
            : app.university || app.program || t('partnerAppDetail.pendingAssignmentHeader')}
          {app.applicationNumber && (
            <span className="ml-2 font-mono text-xs text-gray-400">
              {app.applicationNumber}
            </span>
          )}
        </p>
      </div>

      {/* Desktop: all four actions inline. Mobile: one dropdown. */}
      <div className="hidden md:flex flex-shrink-0">
        <ButtonGroup>
          {editButton}
          {cloneButton}
          {withdrawalButton}
          {deleteButton}
        </ButtonGroup>
      </div>

      <div className="md:hidden flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="rounded-none" aria-label={t('partnerAppDetail.actionsMenu')}>
              <MoreHorizontal className="h-4 w-4" />
              {t('partnerAppDetail.actions')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-none">
            <DropdownMenuItem asChild className="rounded-none">
              <Link href={`/partner/applications/${app.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                {t('partnerAppDetail.edit')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="rounded-none"
              onSelect={(e) => {
                e.preventDefault();
                onClone();
              }}
            >
              <ClipboardCopy className="mr-2 h-4 w-4" />
              {t('partnerAppDetail.clone')}
            </DropdownMenuItem>
            {canRequestWithdrawal && (
              <DropdownMenuItem
                className="rounded-none"
                onSelect={(e) => {
                  e.preventDefault();
                  onRequestWithdrawal();
                }}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {t('partnerAppDetail.requestWithdrawal')}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="rounded-none text-red-600"
              onSelect={(e) => {
                e.preventDefault();
                onDelete();
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t('partnerAppDetail.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default ApplicationDetailHeader;
