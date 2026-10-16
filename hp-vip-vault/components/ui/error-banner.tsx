export function ErrorBanner({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl">
      <span>{message}</span>
    </div>
  );
}
