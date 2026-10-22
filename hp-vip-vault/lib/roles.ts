import { Shield, Car, Users } from "lucide-react";

export type Role = "user" | "driver" | "admin";

export const ROLE_CONFIG: Record<Role, { label: string; icon: typeof Shield; activeClass: string }> = {
  admin: { label: "Admin", icon: Shield, activeClass: "bg-orange-500/10 border-orange-500/20 text-orange-500" },
  driver: { label: "Driver", icon: Car, activeClass: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  user: { label: "User", icon: Users, activeClass: "bg-white/5 border-white/10 text-gray-400" },
};

export const ROLE_CONFIRM_COPY: Record<Role, (userName: string) => string> = {
  admin: (userName) =>
    `Grant admin clearance for ${userName}? They will gain full access to the admin vault immediately.`,
  driver: (userName) =>
    `Set ${userName} as a driver? They will be able to log and edit their own trips immediately.`,
  user: (userName) =>
    `Revoke ${userName} to a plain user? They will lose admin access and/or the ability to log or edit trips immediately.`,
};

export function normalizeRole(role: string | null | undefined): Role {
  return role === "admin" || role === "driver" ? role : "user";
}
