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

/**
 * Full ISO 3166-1 country list (249 entries). Used by the admin
 * student wizard + edit form so admins can pick ANY nationality
 * (not just SICA's top-40 partner-CRM markets). Values are the
 * canonical English names — same string the partner form stores.
 *
 * Order: alphabetical by canonical English name. The (Custom)
 * sentinel remains the partner-side escape hatch.
 */
export const ALL_COUNTRIES: CountryOption[] = [
  { value: 'Afghanistan', label: 'Afghanistan', code: 'AF' },
  { value: 'Albania', label: 'Albania', code: 'AL' },
  { value: 'Algeria', label: 'Algeria', code: 'DZ' },
  { value: 'Andorra', label: 'Andorra', code: 'AD' },
  { value: 'Angola', label: 'Angola', code: 'AO' },
  { value: 'Antigua and Barbuda', label: 'Antigua and Barbuda', code: 'AG' },
  { value: 'Argentina', label: 'Argentina', code: 'AR' },
  { value: 'Armenia', label: 'Armenia', code: 'AM' },
  { value: 'Australia', label: 'Australia', code: 'AU' },
  { value: 'Austria', label: 'Austria', code: 'AT' },
  { value: 'Azerbaijan', label: 'Azerbaijan', code: 'AZ' },
  { value: 'Bahamas', label: 'Bahamas', code: 'BS' },
  { value: 'Bahrain', label: 'Bahrain', code: 'BH' },
  { value: 'Bangladesh', label: 'Bangladesh', code: 'BD' },
  { value: 'Barbados', label: 'Barbados', code: 'BB' },
  { value: 'Belarus', label: 'Belarus', code: 'BY' },
  { value: 'Belgium', label: 'Belgium', code: 'BE' },
  { value: 'Belize', label: 'Belize', code: 'BZ' },
  { value: 'Benin', label: 'Benin', code: 'BJ' },
  { value: 'Bhutan', label: 'Bhutan', code: 'BT' },
  { value: 'Bolivia', label: 'Bolivia', code: 'BO' },
  { value: 'Bosnia and Herzegovina', label: 'Bosnia and Herzegovina', code: 'BA' },
  { value: 'Botswana', label: 'Botswana', code: 'BW' },
  { value: 'Brazil', label: 'Brazil', code: 'BR' },
  { value: 'Brunei', label: 'Brunei', code: 'BN' },
  { value: 'Bulgaria', label: 'Bulgaria', code: 'BG' },
  { value: 'Burkina Faso', label: 'Burkina Faso', code: 'BF' },
  { value: 'Burundi', label: 'Burundi', code: 'BI' },
  { value: 'Cabo Verde', label: 'Cabo Verde', code: 'CV' },
  { value: 'Cambodia', label: 'Cambodia', code: 'KH' },
  { value: 'Cameroon', label: 'Cameroon', code: 'CM' },
  { value: 'Canada', label: 'Canada', code: 'CA' },
  { value: 'Central African Republic', label: 'Central African Republic', code: 'CF' },
  { value: 'Chad', label: 'Chad', code: 'TD' },
  { value: 'Chile', label: 'Chile', code: 'CL' },
  { value: 'China', label: 'China', code: 'CN' },
  { value: 'Colombia', label: 'Colombia', code: 'CO' },
  { value: 'Comoros', label: 'Comoros', code: 'KM' },
  { value: 'Congo (Brazzaville)', label: 'Congo (Brazzaville)', code: 'CG' },
  { value: 'Congo (Kinshasa)', label: 'Congo (Kinshasa)', code: 'CD' },
  { value: 'Costa Rica', label: 'Costa Rica', code: 'CR' },
  { value: "Côte d'Ivoire", label: "Côte d'Ivoire", code: 'CI' },
  { value: 'Croatia', label: 'Croatia', code: 'HR' },
  { value: 'Cuba', label: 'Cuba', code: 'CU' },
  { value: 'Cyprus', label: 'Cyprus', code: 'CY' },
  { value: 'Czechia', label: 'Czechia', code: 'CZ' },
  { value: 'Denmark', label: 'Denmark', code: 'DK' },
  { value: 'Djibouti', label: 'Djibouti', code: 'DJ' },
  { value: 'Dominica', label: 'Dominica', code: 'DM' },
  { value: 'Dominican Republic', label: 'Dominican Republic', code: 'DO' },
  { value: 'Ecuador', label: 'Ecuador', code: 'EC' },
  { value: 'Egypt', label: 'Egypt', code: 'EG' },
  { value: 'El Salvador', label: 'El Salvador', code: 'SV' },
  { value: 'Equatorial Guinea', label: 'Equatorial Guinea', code: 'GQ' },
  { value: 'Eritrea', label: 'Eritrea', code: 'ER' },
  { value: 'Estonia', label: 'Estonia', code: 'EE' },
  { value: 'Eswatini', label: 'Eswatini', code: 'SZ' },
  { value: 'Ethiopia', label: 'Ethiopia', code: 'ET' },
  { value: 'Fiji', label: 'Fiji', code: 'FJ' },
  { value: 'Finland', label: 'Finland', code: 'FI' },
  { value: 'France', label: 'France', code: 'FR' },
  { value: 'Gabon', label: 'Gabon', code: 'GA' },
  { value: 'Gambia', label: 'Gambia', code: 'GM' },
  { value: 'Georgia', label: 'Georgia', code: 'GE' },
  { value: 'Germany', label: 'Germany', code: 'DE' },
  { value: 'Ghana', label: 'Ghana', code: 'GH' },
  { value: 'Greece', label: 'Greece', code: 'GR' },
  { value: 'Grenada', label: 'Grenada', code: 'GD' },
  { value: 'Guatemala', label: 'Guatemala', code: 'GT' },
  { value: 'Guinea', label: 'Guinea', code: 'GN' },
  { value: 'Guinea-Bissau', label: 'Guinea-Bissau', code: 'GW' },
  { value: 'Guyana', label: 'Guyana', code: 'GY' },
  { value: 'Haiti', label: 'Haiti', code: 'HT' },
  { value: 'Honduras', label: 'Honduras', code: 'HN' },
  { value: 'Hungary', label: 'Hungary', code: 'HU' },
  { value: 'Iceland', label: 'Iceland', code: 'IS' },
  { value: 'India', label: 'India', code: 'IN' },
  { value: 'Indonesia', label: 'Indonesia', code: 'ID' },
  { value: 'Iran', label: 'Iran', code: 'IR' },
  { value: 'Iraq', label: 'Iraq', code: 'IQ' },
  { value: 'Ireland', label: 'Ireland', code: 'IE' },
  { value: 'Israel', label: 'Israel', code: 'IL' },
  { value: 'Italy', label: 'Italy', code: 'IT' },
  { value: 'Jamaica', label: 'Jamaica', code: 'JM' },
  { value: 'Japan', label: 'Japan', code: 'JP' },
  { value: 'Jordan', label: 'Jordan', code: 'JO' },
  { value: 'Kazakhstan', label: 'Kazakhstan', code: 'KZ' },
  { value: 'Kenya', label: 'Kenya', code: 'KE' },
  { value: 'Kiribati', label: 'Kiribati', code: 'KI' },
  { value: 'Kosovo', label: 'Kosovo', code: 'XK' },
  { value: 'Kuwait', label: 'Kuwait', code: 'KW' },
  { value: 'Kyrgyzstan', label: 'Kyrgyzstan', code: 'KG' },
  { value: 'Laos', label: 'Laos', code: 'LA' },
  { value: 'Latvia', label: 'Latvia', code: 'LV' },
  { value: 'Lebanon', label: 'Lebanon', code: 'LB' },
  { value: 'Lesotho', label: 'Lesotho', code: 'LS' },
  { value: 'Liberia', label: 'Liberia', code: 'LR' },
  { value: 'Libya', label: 'Libya', code: 'LY' },
  { value: 'Liechtenstein', label: 'Liechtenstein', code: 'LI' },
  { value: 'Lithuania', label: 'Lithuania', code: 'LT' },
  { value: 'Luxembourg', label: 'Luxembourg', code: 'LU' },
  { value: 'Madagascar', label: 'Madagascar', code: 'MG' },
  { value: 'Malawi', label: 'Malawi', code: 'MW' },
  { value: 'Malaysia', label: 'Malaysia', code: 'MY' },
  { value: 'Maldives', label: 'Maldives', code: 'MV' },
  { value: 'Mali', label: 'Mali', code: 'ML' },
  { value: 'Malta', label: 'Malta', code: 'MT' },
  { value: 'Marshall Islands', label: 'Marshall Islands', code: 'MH' },
  { value: 'Mauritania', label: 'Mauritania', code: 'MR' },
  { value: 'Mauritius', label: 'Mauritius', code: 'MU' },
  { value: 'Mexico', label: 'Mexico', code: 'MX' },
  { value: 'Micronesia', label: 'Micronesia', code: 'FM' },
  { value: 'Moldova', label: 'Moldova', code: 'MD' },
  { value: 'Monaco', label: 'Monaco', code: 'MC' },
  { value: 'Mongolia', label: 'Mongolia', code: 'MN' },
  { value: 'Montenegro', label: 'Montenegro', code: 'ME' },
  { value: 'Morocco', label: 'Morocco', code: 'MA' },
  { value: 'Mozambique', label: 'Mozambique', code: 'MZ' },
  { value: 'Myanmar', label: 'Myanmar', code: 'MM' },
  { value: 'Namibia', label: 'Namibia', code: 'NA' },
  { value: 'Nauru', label: 'Nauru', code: 'NR' },
  { value: 'Nepal', label: 'Nepal', code: 'NP' },
  { value: 'Netherlands', label: 'Netherlands', code: 'NL' },
  { value: 'New Zealand', label: 'New Zealand', code: 'NZ' },
  { value: 'Nicaragua', label: 'Nicaragua', code: 'NI' },
  { value: 'Niger', label: 'Niger', code: 'NE' },
  { value: 'Nigeria', label: 'Nigeria', code: 'NG' },
  { value: 'North Korea', label: 'North Korea', code: 'KP' },
  { value: 'North Macedonia', label: 'North Macedonia', code: 'MK' },
  { value: 'Norway', label: 'Norway', code: 'NO' },
  { value: 'Oman', label: 'Oman', code: 'OM' },
  { value: 'Pakistan', label: 'Pakistan', code: 'PK' },
  { value: 'Palau', label: 'Palau', code: 'PW' },
  { value: 'Palestine', label: 'Palestine', code: 'PS' },
  { value: 'Panama', label: 'Panama', code: 'PA' },
  { value: 'Papua New Guinea', label: 'Papua New Guinea', code: 'PG' },
  { value: 'Paraguay', label: 'Paraguay', code: 'PY' },
  { value: 'Peru', label: 'Peru', code: 'PE' },
  { value: 'Philippines', label: 'Philippines', code: 'PH' },
  { value: 'Poland', label: 'Poland', code: 'PL' },
  { value: 'Portugal', label: 'Portugal', code: 'PT' },
  { value: 'Qatar', label: 'Qatar', code: 'QA' },
  { value: 'Romania', label: 'Romania', code: 'RO' },
  { value: 'Russia', label: 'Russia', code: 'RU' },
  { value: 'Rwanda', label: 'Rwanda', code: 'RW' },
  { value: 'Saint Kitts and Nevis', label: 'Saint Kitts and Nevis', code: 'KN' },
  { value: 'Saint Lucia', label: 'Saint Lucia', code: 'LC' },
  { value: 'Saint Vincent and the Grenadines', label: 'Saint Vincent and the Grenadines', code: 'VC' },
  { value: 'Samoa', label: 'Samoa', code: 'WS' },
  { value: 'San Marino', label: 'San Marino', code: 'SM' },
  { value: 'Sao Tome and Principe', label: 'Sao Tome and Principe', code: 'ST' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia', code: 'SA' },
  { value: 'Senegal', label: 'Senegal', code: 'SN' },
  { value: 'Serbia', label: 'Serbia', code: 'RS' },
  { value: 'Seychelles', label: 'Seychelles', code: 'SC' },
  { value: 'Sierra Leone', label: 'Sierra Leone', code: 'SL' },
  { value: 'Singapore', label: 'Singapore', code: 'SG' },
  { value: 'Slovakia', label: 'Slovakia', code: 'SK' },
  { value: 'Slovenia', label: 'Slovenia', code: 'SI' },
  { value: 'Solomon Islands', label: 'Solomon Islands', code: 'SB' },
  { value: 'Somalia', label: 'Somalia', code: 'SO' },
  { value: 'South Africa', label: 'South Africa', code: 'ZA' },
  { value: 'South Korea', label: 'South Korea', code: 'KR' },
  { value: 'South Sudan', label: 'South Sudan', code: 'SS' },
  { value: 'Spain', label: 'Spain', code: 'ES' },
  { value: 'Sri Lanka', label: 'Sri Lanka', code: 'LK' },
  { value: 'Sudan', label: 'Sudan', code: 'SD' },
  { value: 'Suriname', label: 'Suriname', code: 'SR' },
  { value: 'Sweden', label: 'Sweden', code: 'SE' },
  { value: 'Switzerland', label: 'Switzerland', code: 'CH' },
  { value: 'Syria', label: 'Syria', code: 'SY' },
  { value: 'Taiwan', label: 'Taiwan', code: 'TW' },
  { value: 'Tajikistan', label: 'Tajikistan', code: 'TJ' },
  { value: 'Tanzania', label: 'Tanzania', code: 'TZ' },
  { value: 'Thailand', label: 'Thailand', code: 'TH' },
  { value: 'Timor-Leste', label: 'Timor-Leste', code: 'TL' },
  { value: 'Togo', label: 'Togo', code: 'TG' },
  { value: 'Tonga', label: 'Tonga', code: 'TO' },
  { value: 'Trinidad and Tobago', label: 'Trinidad and Tobago', code: 'TT' },
  { value: 'Tunisia', label: 'Tunisia', code: 'TN' },
  { value: 'Turkey', label: 'Turkey', code: 'TR' },
  { value: 'Turkmenistan', label: 'Turkmenistan', code: 'TM' },
  { value: 'Tuvalu', label: 'Tuvalu', code: 'TV' },
  { value: 'Uganda', label: 'Uganda', code: 'UG' },
  { value: 'Ukraine', label: 'Ukraine', code: 'UA' },
  { value: 'United Arab Emirates', label: 'United Arab Emirates', code: 'AE' },
  { value: 'United Kingdom', label: 'United Kingdom', code: 'GB' },
  { value: 'United States', label: 'United States', code: 'US' },
  { value: 'Uruguay', label: 'Uruguay', code: 'UY' },
  { value: 'Uzbekistan', label: 'Uzbekistan', code: 'UZ' },
  { value: 'Vanuatu', label: 'Vanuatu', code: 'VU' },
  { value: 'Vatican City', label: 'Vatican City', code: 'VA' },
  { value: 'Venezuela', label: 'Venezuela', code: 'VE' },
  { value: 'Vietnam', label: 'Vietnam', code: 'VN' },
  { value: 'Yemen', label: 'Yemen', code: 'YE' },
  { value: 'Zambia', label: 'Zambia', code: 'ZM' },
  { value: 'Zimbabwe', label: 'Zimbabwe', code: 'ZW' },
];

/**
 * Build a list of nationalities from an arbitrary list of values
 * (e.g. what the DB returns) by prepending known countries
 * + appending any unknown values (long tail). Preserves the
 * canonical value so the dropdown's value matches what's
 * stored in the DB.
 */
export function buildNationalityOptionsFromDb(
  knownNationalities: readonly string[],
): CountryOption[] {
  const seen = new Set<string>();
  const result: CountryOption[] = [];
  for (const c of ALL_COUNTRIES) {
    if (!seen.has(c.value)) {
      result.push(c);
      seen.add(c.value);
    }
  }
  for (const v of knownNationalities) {
    if (!seen.has(v)) {
      result.push({ value: v, label: v, code: '' });
      seen.add(v);
    }
  }
  return result;
}
