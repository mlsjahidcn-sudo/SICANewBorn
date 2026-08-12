export const CACHE_TAGS: {
  universities: string;
  university: (slug: string) => string;
  programs: string;
  program: (slug: string) => string;
  scholarships: string;
  scholarship: (slug: string) => string;
} = {
  universities: 'universities',
  university: (slug: string) => `university:${slug}`,
  programs: 'programs',
  program: (slug: string) => `program:${slug}`,
  scholarships: 'scholarships',
  scholarship: (slug: string) => `scholarship:${slug}`,
};
