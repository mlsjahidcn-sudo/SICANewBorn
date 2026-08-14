export default function RootLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8]">
      {/* Sticky header skeleton — mirrors header.tsx layout (h-16,
          border-b, bg-white/95) so the real header swaps in without
          any layout shift. */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="h-9 w-32 bg-gray-200 animate-pulse" />
          <div className="hidden lg:flex items-center gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 w-20 bg-gray-200 animate-pulse" />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-16 bg-gray-200 animate-pulse" />
            <div className="h-8 w-32 bg-gray-200 animate-pulse" />
            <div className="h-8 w-24 bg-gray-200 animate-pulse" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero skeleton — dark blue #1B2A4A matching the real hero
            background, with white/10 placeholder bars so the contrast
            reads correctly. Mirrors src/app/page.tsx:97-252 layout
            (5-col grid, 2 CTAs, 3 featured university cards). */}
        <section className="bg-[#1B2A4A]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="grid lg:grid-cols-5 gap-10 lg:gap-12 items-center">
              <div className="lg:col-span-3 max-w-2xl space-y-5">
                <div className="h-12 w-full max-w-xl bg-white/10 animate-pulse" />
                <div className="h-12 w-3/4 bg-white/10 animate-pulse" />
                <div className="h-5 w-full max-w-md bg-white/10 animate-pulse" />
                <div className="flex gap-3 pt-3">
                  <div className="h-12 w-32 bg-white/10 animate-pulse" />
                  <div className="h-12 w-32 bg-white/20 animate-pulse" />
                </div>
              </div>
              <div className="hidden lg:block lg:col-span-2 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-white/10 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Quick access cards — matches src/app/page.tsx:255-276
            (4-up grid with -mt-10 offset, light card backgrounds). */}
        <section className="relative -mt-10 z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white border border-gray-200 shadow-sm animate-pulse" />
            ))}
          </div>
        </section>

        {/* Why-China section — matches src/app/page.tsx:282-334
            (2-col grid: left text + 4 icon rows + CTA, right image).
            Uses bg-gray-200 because the section background is white. */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <div className="h-10 w-2/3 bg-gray-200 animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 animate-pulse" />
                ))}
              </div>
              <div className="h-10 w-40 bg-gray-200 animate-pulse" />
            </div>
            <div className="aspect-[5/4] bg-gray-200 animate-pulse" />
          </div>
        </section>

        {/* Stats strip — matches src/app/page.tsx:339-359 (4-up grid
            on dark blue background, gold numbers). */}
        <section className="bg-[#1B2A4A]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 text-center">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-white/10 animate-pulse" />
              ))}
            </div>
          </div>
        </section>

        {/* Sections below the stats strip (fields, services,
            testimonials, news, success stories, CTA) are intentionally
            omitted — by the time the user scrolls there, the homepage
            RSC has resolved and the real content replaces this
            skeleton. Keeps loading.tsx lean (~50 LoC) while still
            giving the user a recognizable page shape during the
            initial load. */}
      </main>

      {/* Footer skeleton — matches footer.tsx (white bg, top border,
          4-column grid). */}
      <footer className="bg-white border-t-2 border-[#1B2A4A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}