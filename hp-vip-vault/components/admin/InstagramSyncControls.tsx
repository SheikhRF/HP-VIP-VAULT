"use client";

import { useState } from "react";
import { RefreshCcw, Instagram } from "lucide-react";
import { useRouter } from "next/navigation";
import { ErrorBanner } from "@/components/ui/error-banner";

export function InstagramSyncControls() {
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const router = useRouter();

  const handleSync = async () => {
    setSyncError(null);
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/sync-instagram", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        router.refresh();
      } else {
        setSyncError(data?.error || "Instagram sync failed.");
      }
    } catch {
      setSyncError("Instagram sync failed — network error.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 pl-5 rounded-full">
        <a
          href="/api/admin/instagram-oauth"
          className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
        >
          <Instagram size={12} />
          Connect
        </a>

        <div className="h-8 w-[1px] bg-white/10" />

        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-white text-black px-5 py-2 rounded-full font-black uppercase tracking-widest text-[9px] transition-all hover:bg-orange-500 disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCcw size={12} className={syncing ? "animate-spin" : ""} />
          {syncing ? "SYNCING..." : "SYNC INSTAGRAM"}
        </button>
      </div>
      <ErrorBanner message={syncError} />
    </div>
  );
}
