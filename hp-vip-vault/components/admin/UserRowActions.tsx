"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { ErrorBanner } from "@/components/ui/error-banner";

type Role = "user" | "driver" | "admin";

const ROLE_LABEL: Record<Role, string> = { user: "User", driver: "Driver", admin: "Admin" };

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
  const currentRole: Role = role === "admin" || role === "driver" ? role : "user";

  const handleRoleChange = async (nextRole: Role) => {
    if (nextRole === currentRole) return;

    const confirmed = confirm(
      `Change ${userName} from ${ROLE_LABEL[currentRole]} to ${ROLE_LABEL[nextRole]}? This takes effect immediately.`
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
        <div className="relative">
          <select
            value={currentRole}
            disabled={updating || removing}
            onChange={(e) => handleRoleChange(e.target.value as Role)}
            className="appearance-none bg-white/5 border border-white/10 text-gray-300 text-[9px] font-black uppercase tracking-widest rounded-full px-3 py-1.5 pr-6 outline-none disabled:opacity-50 hover:border-orange-500/30 transition-all"
          >
            <option value="user">User</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
          {updating && (
            <Loader2 size={10} className="animate-spin absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          )}
        </div>

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
