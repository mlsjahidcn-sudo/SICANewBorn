export default function PartnerLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-4 border-[#1B2A4A]/20 border-t-[#9B1B30] rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading partner portal…</p>
      </div>
    </div>
  );
}
