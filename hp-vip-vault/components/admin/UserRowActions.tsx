"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, ChevronDown, Check } from "lucide-react";
import { ErrorBanner } from "@/components/ui/error-banner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ROLE_CONFIG, ROLE_CONFIRM_COPY, normalizeRole, type Role } from "@/lib/roles";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const [pendingRemove, setPendingRemove] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const currentRole = normalizeRole(role);

  useEffect(() => {
    if (!menuOpen) return;

    const closeMenu = (e: Event) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    const closeOnReflow = () => setMenuOpen(false);

    document.addEventListener("mousedown", closeMenu);
    window.addEventListener("scroll", closeOnReflow, true);
    window.addEventListener("resize", closeOnReflow);
    return () => {
      document.removeEventListener("mousedown", closeMenu);
      window.removeEventListener("scroll", closeOnReflow, true);
      window.removeEventListener("resize", closeOnReflow);
    };
  }, [menuOpen]);

  const openMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setMenuPos({ top: rect.bottom + 8, left: rect.left });
    setMenuOpen(true);
  };

  const handleSelectRole = (nextRole: Role) => {
    setMenuOpen(false);
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

  const commitRemove = async () => {
    setPendingRemove(false);
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

  const CurrentIcon = ROLE_CONFIG[currentRole].icon;

  return (
    <div className="flex flex-col items-start gap-2 pointer-events-auto">
      <div className="flex items-center gap-2">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => (menuOpen ? setMenuOpen(false) : openMenu())}
          disabled={updating || removing}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 ${ROLE_CONFIG[currentRole].activeClass}`}
        >
          {updating ? <Loader2 size={10} className="animate-spin" /> : <CurrentIcon size={10} />}
          {ROLE_CONFIG[currentRole].label}
          <ChevronDown size={10} className={`transition-transform ${menuOpen ? "rotate-180" : ""}`} />
        </button>

        <button
          onClick={() => setPendingRemove(true)}
          disabled={updating || removing || isSelf}
          title={isSelf ? "You can't remove your own account" : "Remove user"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 border-white/10 text-gray-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
        >
          {removing ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
          Remove
        </button>
      </div>

      {menuOpen &&
        menuPos &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: menuPos.top, left: menuPos.left }}
            className="fixed z-[200] w-40 bg-[#0a0a0a] border border-white/10 rounded-2xl p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-150"
          >
            {(Object.keys(ROLE_CONFIG) as Role[]).map((roleOption) => {
              const { label, icon: Icon } = ROLE_CONFIG[roleOption];
              const isActive = roleOption === currentRole;
              return (
                <button
                  key={roleOption}
                  type="button"
                  onClick={() => handleSelectRole(roleOption)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors ${
                    isActive ? "bg-white/5 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={10} />
                  <span className="flex-1 text-left">{label}</span>
                  {isActive && <Check size={10} className="text-orange-500" />}
                </button>
              );
            })}
          </div>,
          document.body
        )}

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

      <ConfirmDialog
        open={pendingRemove}
        title="Remove Member"
        message={`Permanently remove ${userName} from the Vault? This deletes their account and cannot be undone.`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={commitRemove}
        onCancel={() => setPendingRemove(false)}
      />
    </div>
  );
}
