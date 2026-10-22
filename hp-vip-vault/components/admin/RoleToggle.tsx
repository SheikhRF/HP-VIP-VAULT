"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Car, Users, Loader2 } from "lucide-react";
import { ErrorBanner } from "@/components/ui/error-banner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Role = "user" | "driver" | "admin";

const ROLE_CONFIG: Record<Role, { label: string; icon: typeof Shield; activeClass: string }> = {
  admin: { label: "Admin", icon: Shield, activeClass: "bg-orange-500/10 border-orange-500/20 text-orange-500" },
  driver: { label: "Driver", icon: Car, activeClass: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  user: { label: "User", icon: Users, activeClass: "bg-white/5 border-white/10 text-gray-400" },
};

const CONFIRM_COPY: Record<Role, (userName: string) => string> = {
  admin: (userName) =>
    `Grant admin clearance for ${userName}? They will gain full access to the admin vault immediately.`,
  driver: (userName) =>
    `Set ${userName} as a driver? They will be able to log and edit their own trips immediately.`,
  user: (userName) =>
    `Revoke ${userName} to a plain user? They will lose admin access and/or the ability to log or edit trips immediately.`,
};

export default function RoleToggle({ userId, role, userName }: { userId: string; role: string; userName: string }) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const currentRole: Role = role === "admin" || role === "driver" ? role : "user";

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
        message={pendingRole ? CONFIRM_COPY[pendingRole](userName) : ""}
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        onConfirm={() => pendingRole && commitRoleChange(pendingRole)}
        onCancel={() => setPendingRole(null)}
      />
    </div>
  );
}
