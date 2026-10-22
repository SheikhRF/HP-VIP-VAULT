"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Users, Trash2, Loader2 } from "lucide-react";
import { ErrorBanner } from "@/components/ui/error-banner";

export default function UserRowActions({
  userId,
  role,
  userName,
  isSelf,
}: {
  userId: string;
  role: string | null;
  userName: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isAdmin = role === "admin";
  const nextRole = isAdmin ? "user" : "admin";

  const handleToggleRole = async () => {
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

  const handleRemove = async () => {
    const confirmed = confirm(
      `Permanently remove ${userName} from the Vault? This deletes their account and cannot be undone.`
    );
    if (!confirmed) return;

    setErrorMsg(null);
    setRemoving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Removal failed");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Removal failed");
      setRemoving(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2 pointer-events-auto">
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleRole}
          disabled={updating || removing}
          title={isAdmin ? "Revoke Admin Access" : "Grant Admin Access"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 ${
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
          {isAdmin ? "Revoke" : "Promote"}
        </button>

        <button
          onClick={handleRemove}
          disabled={updating || removing || isSelf}
          title={isSelf ? "You can't remove your own account" : "Remove user"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 border-white/10 text-gray-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
        >
          {removing ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
          Remove
        </button>
      </div>
      <ErrorBanner message={errorMsg} />
    </div>
  );
}
