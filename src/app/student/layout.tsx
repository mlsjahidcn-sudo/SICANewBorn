// Phase 102: server-side wrapper that reads the `sica-locale` cookie
// and hands it to the client layout. Without this, the client
// I18nProvider starts in `en` (the default), then the layout's
// useEffect reads localStorage and swaps — a visible flash of English
// for non-English users on first paint.
//
// We split into a server wrapper + a client component because the
// client layout uses `useAuth`, `usePathname`, etc. — none of which
// can run inside a server component.
import { getServerLocale } from '@/lib/server-t';
import StudentLayoutClient from './student-layout-client';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLocale = await getServerLocale();
  return <StudentLayoutClient initialLocale={initialLocale}>{children}</StudentLayoutClient>;
}