export const PROGRAM_DEGREES = ['Bachelor', 'Master', 'PhD', 'Chinese Language', 'Foundation', 'Non-degree'] as const;
export const PROGRAM_LANGUAGES = ['English', 'Chinese', 'Bilingual', 'To be confirmed'] as const;

export type ProgramDegree = (typeof PROGRAM_DEGREES)[number];
export type ProgramLanguage = (typeof PROGRAM_LANGUAGES)[number];
