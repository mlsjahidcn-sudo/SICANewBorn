import Link from 'next/link';

export const metadata = {
  title: 'Page not found | SICA',
};

export default function RootNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF8] px-4 text-center">
      <div className="max-w-md">
        <h1 className="text-5xl font-bold text-[#9B1B30]">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-[#1B2A4A]">Page not found</h2>
        <p className="mt-3 text-gray-600">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-[#9B1B30] hover:bg-[#7A1526] text-white text-sm font-semibold transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/universities"
            className="inline-flex items-center justify-center px-6 py-2.5 border border-[#1B2A4A] text-[#1B2A4A] hover:bg-[#1B2A4A] hover:text-white text-sm font-semibold transition-colors"
          >
            Browse universities
          </Link>
        </div>
      </div>
    </div>
  );
}
