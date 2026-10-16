"use client";

import { useState } from "react";
import { RefreshCcw, CheckCircle2, AlertCircle, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { ErrorBanner } from "@/components/ui/error-banner";

export function SyncFleetButton({ lastSync }: { lastSync: string }) {
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const router = useRouter();

  // Helper to calculate days
  const getDays = (dateString: string) => {
    if (!dateString) return "STALE";
    const last = new Date(dateString);
    const today = new Date();
    const diff = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    return diff === 0 ? "LIVE" : `${diff} DAYS AGO`;
  };

  const handleSync = async () => {
    setSyncError(null);
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/sync-dvla", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        if (data?.failed > 0) {
          setSyncError(`Sync completed with ${data.failed} car(s) failing to update.`);
        }
        router.refresh();
      } else {
        setSyncError(data?.error || "Sync failed — DVLA service may be unavailable.");
      }
    } catch (err) {
      setSyncError("Sync failed — network error.");
    } finally {
      setSyncing(false);
    }
  };

  const daysSince = getDays(lastSync);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-2 pl-5 rounded-full">
        {/* Telemetry Status */}
        <div className="flex flex-col">
          <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.2em] leading-none">Last sync</span>
          <span className={`text-[10px] font-black italic tracking-widest mt-1 ${daysSince === 'LIVE' ? 'text-green-500' : 'text-orange-500'}`}>
            {daysSince}
          </span>
        </div>

        <div className="h-8 w-[1px] bg-white/10" />

        {/* The Button */}
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-white text-black px-5 py-2 rounded-full font-black uppercase tracking-widest text-[9px] transition-all hover:bg-orange-500 disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCcw size={12} className={syncing ? 'animate-spin' : ''} />
          {syncing ? "SYNCING..." : "RE-SYNC"}
        </button>
      </div>
      <ErrorBanner message={syncError} />
    </div>
  );
}