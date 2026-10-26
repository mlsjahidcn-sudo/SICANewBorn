import type { Metadata } from 'next';
import ShortlistBuilder from './_components/shortlist-builder';
import { documentTitle } from '@/lib/document-title';

export const metadata: Metadata = {
  title: documentTitle('New Shortlist | SICA Admin'),
  description: 'Create a multi-university application shortlist',
};

export default function NewShortlistPage() {
  return <ShortlistBuilder />;
}
