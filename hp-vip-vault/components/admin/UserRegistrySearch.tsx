"use client";

import { useState, useMemo } from "react";
import { Search, X, Shield, Users, Route } from "lucide-react";
import Link from "next/link";
import GlowCopy from "@/components/ui/glow-copy";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  updated_at: string;
  tripCount: number;
};

export default function UserRegistrySearch({ users }: { users: UserRow[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter((user) => {
      const searchStr = `${user.name ?? ""} ${user.email} ${user.role ?? ""}`.toLowerCase();
      return searchStr.includes(q);
    });
  }, [searchQuery, users]);

  return (
    <div className="space-y-6">
      {/* SEARCH BAR */}
      <div className="relative">
        <Search
          className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="IDENTIFY MEMBER BY NAME, EMAIL, OR CLEARANCE..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#060606] border border-white/5 text-white font-mono text-xs h-16 rounded-2xl pl-16 pr-12 outline-none transition-all placeholder:text-gray-800 uppercase tracking-widest focus:ring-1 focus:ring-orange-500/50 focus:shadow-[0_0_25px_rgba(249,115,22,0.1)]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {searchQuery && (
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">
          {filteredUsers.length} member{filteredUsers.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* USERS TABLE */}
      <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              <th className="px-8 py-6 text-[8px] font-black uppercase text-gray-500 tracking-[0.3em]">Identity</th>
              <th className="px-8 py-6 text-[8px] font-black uppercase text-gray-500 tracking-[0.3em]">Clearance</th>
              <th className="px-8 py-6 text-[8px] font-black uppercase text-gray-500 tracking-[0.3em]">Drives</th>
              <th className="px-8 py-6 text-[8px] font-black uppercase text-gray-500 tracking-[0.3em]">Last Uplink</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="group relative hover:bg-white/[0.01] transition-colors cursor-pointer">
                <td className="px-8 py-6 relative">
                  <Link href={`/admin/users/${user.id}`} className="absolute inset-0 z-0" />

                  <div className="flex flex-col relative z-10 pointer-events-none">
                    <span className="text-xs font-black uppercase italic text-white group-hover:text-orange-500 transition-colors mb-1">
                      {user.name}
                    </span>
                    <div className="pointer-events-auto">
                      <GlowCopy
                        text={user.email}
                        className="text-[10px] font-mono text-gray-600 uppercase tracking-tighter"
                      />
                    </div>
                  </div>
                </td>

                <td className="px-8 py-6 relative z-10 pointer-events-none">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                    user.role === 'admin'
                      ? 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}>
                    {user.role === 'admin' ? <Shield size={10} /> : <Users size={10} />}
                    {user.role}
                  </div>
                </td>

                <td className="px-8 py-6 relative z-10 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <Route size={14} className="text-gray-700" />
                    <span className="text-sm font-black italic text-white">
                      {user.tripCount}
                    </span>
                    <span className="text-[8px] font-black uppercase text-gray-700 tracking-widest ml-1">Drives</span>
                  </div>
                </td>

                <td className="px-8 py-6 relative z-10 pointer-events-none">
                  <span className="text-[10px] font-bold text-gray-500 uppercase italic">
                    {new Date(user.updated_at).toLocaleDateString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-700">
              No member matches current query
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
