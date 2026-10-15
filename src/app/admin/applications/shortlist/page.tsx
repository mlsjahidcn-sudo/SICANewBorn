import type { Metadata } from 'next';
import ShortlistBuilder from './_components/shortlist-builder';

export const metadata: Metadata = {
  title: 'New Shortlist | SICA Admin',
  description: 'Create a multi-university application shortlist',
};

export default function NewShortlistPage() {
  return <ShortlistBuilder />;
}
