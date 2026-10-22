"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ErrorBanner } from "@/components/ui/error-banner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ROLE_CONFIG, ROLE_CONFIRM_COPY, normalizeRole, type Role } from "@/lib/roles";

export default function RoleToggle({ userId, role, userName }: { userId: string; role: string; userName: string }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const currentRole: Role = normalizeRole(role);

  const handleSelect = (nextRole: Role) => {
    if (nextRole === currentRole) return;
    setPendingRole(nextRole);
  };

  const commitRoleChange = async (nextRole: Role) => {
    setPendingRole(null);
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
      <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-full">
        {(Object.keys(ROLE_CONFIG) as Role[]).map((roleOption) => {
          const { label, icon: Icon, activeClass } = ROLE_CONFIG[roleOption];
          const isActive = roleOption === currentRole;
          return (
            <button
              key={roleOption}
              onClick={() => handleSelect(roleOption)}
              disabled={updating}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 ${
                isActive ? activeClass : "bg-transparent border-transparent text-gray-600 hover:text-gray-300"
              }`}
            >
              {updating && isActive ? <Loader2 size={10} className="animate-spin" /> : <Icon size={10} />}
              {label}
            </button>
          );
        })}
      </div>
      <ErrorBanner message={errorMsg} />
      <ConfirmDialog
        open={pendingRole !== null}
        title={pendingRole === "admin" ? "Grant Admin" : pendingRole === "driver" ? "Set Driver" : "Revoke Access"}
        message={pendingRole ? ROLE_CONFIRM_COPY[pendingRole](userName) : ""}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={() => pendingRole && commitRoleChange(pendingRole)}
        onCancel={() => setPendingRole(null)}
      />
    </div>
  );
}
