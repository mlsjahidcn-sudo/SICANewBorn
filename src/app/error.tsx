'use client';

import { useEffect } from 'react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console in development; Sentry or similar can be added here.
    // eslint-disable-next-line no-console
    console.error('Root error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF8] px-4 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Something went wrong</h1>
        <p className="mt-3 text-gray-600">
          We hit an unexpected error. Try refreshing the page, or contact SICA support if it persists.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-gray-400 font-mono">Ref: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center px-6 py-2.5 bg-[#9B1B30] hover:bg-[#7A1526] text-white text-sm font-semibold transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
