export default function RootLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF8]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-[#1B2A4A]/20 border-t-[#9B1B30] rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading SICA…</p>
      </div>
    </div>
  );
}
