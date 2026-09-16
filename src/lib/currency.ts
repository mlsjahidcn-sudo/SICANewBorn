/**
 * currency.ts
 *
 * Single source of truth for currency formatting.
 *
 * Re-exported from `partner-fee-mapper.ts` for backward compatibility — new
 * imports should come from here directly.
 */

export function currencySymbol(currency: string): string {
  switch (currency) {
    case 'CNY':
      return '¥';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    default:
      return currency;
  }
}