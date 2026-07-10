/**
 * common-countries.ts
 *
 * A curated list of the most common nationalities for SICA's
 * international-student partner CRM. Phase 49.2: replaces the
 * free-text nationality input on the partner student new + edit
 * forms with a `<Select>` of these values. Free-text was the
 * source of the "USA / United States / America / U.S.A." data
 * inconsistency — 4 different rows for the same country.
 *
 * Curated by reach (the top 40 markets SICA serves today). Not
 * exhaustive on purpose — a partner with a student from a rare
 * country can use the (Custom) option, which preserves the old
 * free-text path so we don't lose the long tail.
 *
 * The list is ordered by approximate enrollment volume for the
 * partner CRM, so the most common picks surface first when the
 * partner opens the dropdown.
 */

export interface CountryOption {
  /** Canonical English name — what we store in the DB. */
  value: string;
  /** Display label for the option (English). */
  label: string;
  /** ISO 3166-1 alpha-2 code, included in the sublabel for fast scanning. */
  code: string;
}

/**
 * The top 40 countries SICA's partner CRM typically sees, by
 * approximate enrollment volume. Values match the canonical
 * English name so the same string is stored as a free-text
 * nationality used to be.
 */
export const COMMON_COUNTRIES: CountryOption[] = [
  { value: 'Nigeria', label: 'Nigeria', code: 'NG' },
  { value: 'Bangladesh', label: 'Bangladesh', code: 'BD' },
  { value: 'Pakistan', label: 'Pakistan', code: 'PK' },
  { value: 'India', label: 'India', code: 'IN' },
  { value: 'Indonesia', label: 'Indonesia', code: 'ID' },
  { value: 'Egypt', label: 'Egypt', code: 'EG' },
  { value: 'Kenya', label: 'Kenya', code: 'KE' },
  { value: 'Ghana', label: 'Ghana', code: 'GH' },
  { value: 'Tanzania', label: 'Tanzania', code: 'TZ' },
  { value: 'Uganda', label: 'Uganda', code: 'UG' },
  { value: 'Ethiopia', label: 'Ethiopia', code: 'ET' },
  { value: 'Morocco', label: 'Morocco', code: 'MA' },
  { value: 'Sudan', label: 'Sudan', code: 'SD' },
  { value: 'Cameroon', label: 'Cameroon', code: 'CM' },
  { value: 'Senegal', label: 'Senegal', code: 'SN' },
  { value: 'Zambia', label: 'Zambia', code: 'ZM' },
  { value: 'Zimbabwe', label: 'Zimbabwe', code: 'ZW' },
  { value: 'Sri Lanka', label: 'Sri Lanka', code: 'LK' },
  { value: 'Nepal', label: 'Nepal', code: 'NP' },
  { value: 'Philippines', label: 'Philippines', code: 'PH' },
  { value: 'Vietnam', label: 'Vietnam', code: 'VN' },
  { value: 'Thailand', label: 'Thailand', code: 'TH' },
  { value: 'Myanmar', label: 'Myanmar', code: 'MM' },
  { value: 'Cambodia', label: 'Cambodia', code: 'KH' },
  { value: 'Mongolia', label: 'Mongolia', code: 'MN' },
  { value: 'Iran', label: 'Iran', code: 'IR' },
  { value: 'Iraq', label: 'Iraq', code: 'IQ' },
  { value: 'Syria', label: 'Syria', code: 'SY' },
  { value: 'Yemen', label: 'Yemen', code: 'YE' },
  { value: 'Afghanistan', label: 'Afghanistan', code: 'AF' },
  { value: 'Uzbekistan', label: 'Uzbekistan', code: 'UZ' },
  { value: 'Kazakhstan', label: 'Kazakhstan', code: 'KZ' },
  { value: 'Kyrgyzstan', label: 'Kyrgyzstan', code: 'KG' },
  { value: 'Tajikistan', label: 'Tajikistan', code: 'TJ' },
  { value: 'Russia', label: 'Russia', code: 'RU' },
  { value: 'United States', label: 'United States', code: 'US' },
  { value: 'United Kingdom', label: 'United Kingdom', code: 'GB' },
  { value: 'Canada', label: 'Canada', code: 'CA' },
  { value: 'Australia', label: 'Australia', code: 'AU' },
  { value: 'Germany', label: 'Germany', code: 'DE' },
];

/**
 * The "Custom" option value used to preserve the old free-text
 * path. When the partner picks this, the underlying state is the
 * empty string and the form renders a free-text <Input> for them
 * to type the long tail of countries we don't list.
 */
export const NATIONALITY_CUSTOM = '__custom__';
