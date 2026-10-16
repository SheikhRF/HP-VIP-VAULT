"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Users, Loader2 } from "lucide-react";
import { ErrorBanner } from "@/components/ui/error-banner";

export default function RoleToggle({ userId, role, userName }: { userId: string; role: string; userName: string }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isAdmin = role === "admin";
  const nextRole = isAdmin ? "user" : "admin";

  const handleToggle = async () => {
    const confirmed = confirm(
      `${isAdmin ? "Revoke" : "Grant"} admin clearance for ${userName}? They will ${
        isAdmin ? "lose" : "gain"
      } access to the admin vault immediately.`
    );
    if (!confirmed) return;

    setErrorMsg(null);
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Role update failed");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Role update failed");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={handleToggle}
        disabled={updating}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 ${
          isAdmin
            ? "bg-orange-500/10 border-orange-500/20 text-orange-500 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
            : "bg-white/5 border-white/10 text-gray-400 hover:bg-orange-500/10 hover:border-orange-500/20 hover:text-orange-500"
        }`}
      >
        {updating ? (
          <Loader2 size={10} className="animate-spin" />
        ) : isAdmin ? (
          <Shield size={10} />
        ) : (
          <Users size={10} />
        )}
        {updating ? "Updating..." : isAdmin ? "Revoke Admin Access" : "Grant Admin Access"}
      </button>
      <ErrorBanner message={errorMsg} />
    </div>
  );
}
