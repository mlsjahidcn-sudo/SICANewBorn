// Phase 165 one-off: strip the dropped i18n keys from
// src/lib/i18n-translations.ts. Both en + zh blocks must
// drop together so the i18n parity gate stays green.
//
// Run from the repo root:
//   node scripts/phase-165-trim-webinar-i18n.js

const fs = require('fs');
const path = require('path');

const I18N_PATH = path.join(__dirname, '..', 'src', 'lib', 'i18n-translations.ts');
const src = fs.readFileSync(I18N_PATH, 'utf8');

// Keys Phase 165 drops — sessions/topics tabs, session/topic
// dialog fields, intake/degree/kind sub-enums, AI wizard
// strings, popup copy, closed-state banner copy, featured-
// university copy, stats card copy.
const DROPPED_KEYS = [
  'adminWebinars.sessionsTitle',
  'adminWebinars.sessionsSubtitle',
  'adminWebinars.addSession',
  'adminWebinars.editSession',
  'adminWebinars.sessionUpcomingBadge',
  'adminWebinars.sessionAutoRolloverHelp',
  'adminWebinars.scheduleNext',
  'adminWebinars.scheduleNextSuccess',
  'adminWebinars.scheduleNextCreated',
  'adminWebinars.sessionFieldSlug',
  'adminWebinars.sessionFieldSlugHelp',
  'adminWebinars.sessionFieldTitleEn',
  'adminWebinars.sessionFieldTitleZh',
  'adminWebinars.sessionFieldDescriptionEn',
  'adminWebinars.sessionFieldDescriptionZh',
  'adminWebinars.sessionFieldDate',
  'adminWebinars.sessionFieldDateHelp',
  'adminWebinars.sessionFieldTime',
  'adminWebinars.sessionFieldTimeHelp',
  'adminWebinars.sessionFieldDuration',
  'adminWebinars.sessionFieldJoinUrl',
  'adminWebinars.sessionFieldJoinUrlHelp',
  'adminWebinars.sessionFieldStatus',
  'adminWebinars.sessionFieldLabel',
  'adminWebinars.sessionFieldLabelHelp',
  'adminWebinars.sessionFieldLabelPlaceholder',
  'adminWebinars.sessionFieldWeekNumber',
  'adminWebinars.sessionFieldWeekNumberHelp',
  'adminWebinars.sessionFieldCreatedAt',
  'adminWebinars.sessionFieldUpdatedAt',
  'adminWebinars.sessionNoDate',
  'adminWebinars.sessionNoJoinUrl',
  'adminWebinars.errorSaveSession',
  'adminWebinars.errorDeleteSession',
  'adminWebinars.topicsTitle',
  'adminWebinars.topicsSubtitle',
  'adminWebinars.addTopic',
  'adminWebinars.editTopic',
  'adminWebinars.topicFieldIntake',
  'adminWebinars.topicFieldDegree',
  'adminWebinars.topicFieldTitleEn',
  'adminWebinars.topicFieldTitleZh',
  'adminWebinars.topicFieldBodyEn',
  'adminWebinars.topicFieldBodyZh',
  'adminWebinars.topicFieldUniversity',
  'adminWebinars.topicFieldKind',
  'adminWebinars.topicFieldDisplayOrder',
  'adminWebinars.topicSaved',
  'adminWebinars.topicDeleted',
  'adminWebinars.topicDeleteTitle',
  'adminWebinars.topicDeleteBody',
  'adminWebinars.topicNoTopics',
  'adminWebinars.errorSaveTopic',
  'adminWebinars.errorDeleteTopic',
  'adminWebinars.universityTopicsTitle',
  'adminWebinars.universityTopicsSubtitle',
  'adminWebinars.addUniversityTopic',
  'adminWebinars.intake.march2027',
  'adminWebinars.intake.september2027',
  'adminWebinars.intake.csc',
  'adminWebinars.intake.other',
  'adminWebinars.degree.chinese_language',
  'adminWebinars.degree.foundation',
  'adminWebinars.degree.bachelor',
  'adminWebinars.degree.master',
  'adminWebinars.degree.phd',
  'adminWebinars.degree.csc',
  'adminWebinars.kind.program',
  'adminWebinars.kind.scholarship',
  'adminWebinars.kind.timing',
  'adminWebinars.kind.requirement',
  'adminWebinars.statTotal',
  'adminWebinars.statToday',
  'adminWebinars.stat7d',
  'adminWebinars.stat30d',
  'adminWebinars.statByStatus',
  'adminWebinars.statByCountry',
  'adminWebinars.statByInterest',
  'adminWebinars.statBySource',
  'adminWebinars.errorStats',
  'adminWebinars.colSource',
  'adminWebinars.ai.openInNewTabTitle',
  'adminWebinars.ai.openInNewTabCta',
  'adminWebinars.topicFieldUniversity',
  'adminWebinars.topicFieldKind',
  'webinar.closedBanner.title',
  'webinar.closedBanner.body',
  'webinar.hero.closedTitle',
  'webinar.hero.closedBody',
  'webinar.hero.nextEyebrow',
  'webinar.hero.titleNoSession',
  'webinar.hero.subtitleNoSession',
  'webinar.hero.dateTba',
  'webinar.hero.ctaPrimaryClosed',
  'webinar.featuredEyebrow',
  'webinar.featuredTitle',
  'webinar.featuredSubtitle',
  'webinar.form.submitClosed',
  'webinar.popupAriaLabel',
  'webinar.popupEyebrow',
  'webinar.popupTitle',
  'webinar.popupBody',
  'webinar.popupCta',
  'webinar.popupTeaserEyebrow',
  'webinar.popupTeaserTitle',
  'webinar.popupTeaserBody',
  'webinar.popupTeaserCta',
  'webinar.popupDismiss',
  'webinar.card.noContent',
  'webinar.card.sections.program',
  'webinar.card.sections.scholarship',
  'webinar.card.sections.timing',
  'webinar.card.sections.requirement',
  'webinar.card.noTopicsAtAll',
];

// Phase 165: also drop ALL keys under the `adminWebinars.ai.*`
// namespace (the AI brief wizard was never applied to the live
// DB in Phase 163 — only the test fixture keys exist in the
// i18n file). Use a prefix-based sweep.
const DROPPED_PREFIXES = [
  'adminWebinars.ai.',
];

let removedCount = 0;
let out = src;

for (const key of DROPPED_KEYS) {
  const escaped = key.replace(/\./g, '\\.');
  // Match a key line: leading indent + quoted key + colon + quoted
  // string value + optional trailing comma + optional trailing
  // comment, then newline. The string value may contain escaped
  // quotes (\\.) but we don't expect any in the dropped keys.
  const re = new RegExp(
    `^[ \\t]*'${escaped}'\\s*:\\s*'[^'\\\\]*(?:\\\\.[^'\\\\]*)*'\\s*,?\\s*(?:\\/\\/[^\\n]*)?\\n`,
    'gm',
  );
  const before = out;
  out = out.replace(re, '');
  if (out !== before) removedCount++;
}

// Prefix-based sweep — drop every key whose prefix matches.
for (const prefix of DROPPED_PREFIXES) {
  const escapedPrefix = prefix.replace(/\./g, '\\.');
  // Match the same line shape as above, but with any sub-key.
  const re = new RegExp(
    `^[ \\t]*'${escapedPrefix}[^']*'\\s*:\\s*'[^'\\\\]*(?:\\\\.[^'\\\\]*)*'\\s*,?\\s*(?:\\/\\/[^\\n]*)?\\n`,
    'gm',
  );
  let prefixRemoved = 0;
  const before = out;
  out = out.replace(re, () => { prefixRemoved++; return ''; });
  if (out !== before) removedCount += prefixRemoved;
}

fs.writeFileSync(I18N_PATH, out);
const status = removedCount === DROPPED_KEYS.length ? 'OK' : 'INCOMPLETE';
console.log(`[${status}] removed ${removedCount} / ${DROPPED_KEYS.length} keys`);
