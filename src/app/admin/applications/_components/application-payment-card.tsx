'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { APPLICATION_PAYMENT_STATUS_DISPLAY, type PaymentAggregate } from '@/lib/payment-aggregate';
import { useI18n } from '@/lib/i18n';

export function ApplicationPaymentCard({ payment, onRetry }: { payment: PaymentAggregate | null; onRetry: () => void }): React.ReactNode {
  const { t } = useI18n();
  return <Card className="rounded-none gap-4 py-4 shadow-none">
    <CardHeader><CardTitle className="text-sm">{t('adminAppReview.payment')}</CardTitle></CardHeader>
    <CardContent className="flex flex-col gap-3">
      {payment ? <>
        <Badge variant="outline" className="rounded-none self-start">{APPLICATION_PAYMENT_STATUS_DISPLAY[payment.status].label}</Badge>
        {payment.feeCount > 0 ? <dl className="flex flex-col gap-3 text-sm">
          {Object.keys(payment.totalByCurrency).map(currency => <div key={currency} className="flex flex-col gap-1 border-b pb-2 last:border-0">
            <dt className="font-medium">{currency}</dt>
            <dd className="tabular-nums text-muted-foreground">{t('adminAppReview.paid')} {payment.paidByCurrency[currency]?.toFixed(2) ?? '0.00'} / {payment.totalByCurrency[currency]?.toFixed(2) ?? '0.00'}</dd>
            {(payment.outstandingByCurrency[currency] ?? 0) > 0 && <dd className="tabular-nums">{t('adminAppReview.outstanding')}: {payment.outstandingByCurrency[currency].toFixed(2)} {currency}</dd>}
          </div>)}
        </dl> : <p className="text-sm text-muted-foreground">{t('adminAppReview.noFees')}</p>}
      </> : <Alert className="rounded-none">
        <AlertTitle>{t('adminAppReview.paymentUnavailable')}</AlertTitle>
        <AlertDescription>{t('adminAppReview.paymentUnknown')}<Button variant="outline" size="sm" onClick={onRetry}>{t('common.retry')}</Button></AlertDescription>
      </Alert>}
      <Link href="/admin/fees" className="text-sm text-[#1B2A4A] underline underline-offset-4">{t('adminAppReview.feeManagement')}</Link>
    </CardContent>
  </Card>;
}
