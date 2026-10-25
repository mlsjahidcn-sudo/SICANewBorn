export interface CatalogVerification {
  sourceUrl?: string;
  verifiedAt?: string;
  intake?: string;
  intakeCn?: string;
  intakeStatus?: 'unknown' | 'open' | 'closed';
  deadline?: string;
  funding?: string;
  fundingCn?: string;
  rankingYear?: string;
  rankingSourceUrl?: string;
}

export function verifiedEvidence(value: CatalogVerification | undefined): boolean {
  return Boolean(value?.sourceUrl && value.verifiedAt);
}

export function datedIntake(recorded: string, evidence?: CatalogVerification): string {
  const value = evidence?.intake || recorded;
  return /\b20\d{2}\b/.test(value) ? value : '';
}
