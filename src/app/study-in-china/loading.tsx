import { Skeleton } from '@/components/ui/skeleton';
export default function CityCatalogLoading(): React.JSX.Element {
  return <div aria-busy="true" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><Skeleton className="mb-4 h-10 w-2/3 rounded-none" /><Skeleton className="mb-6 h-5 w-full rounded-none" /><Skeleton className="mb-5 h-24 w-full rounded-none" /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((key) => <Skeleton key={key} className="h-64 w-full rounded-none" />)}</div></div>;
}
