export function Loading({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--tc-gray-300)] border-t-[var(--tc-black)]" />
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex flex-1 items-center justify-center py-32">
      <Loading />
    </div>
  );
}
