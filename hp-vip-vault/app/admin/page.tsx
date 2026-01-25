import Link from "next/link";
import { PlusCircle, ShieldAlert } from "lucide-react";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-black text-gray-100 p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-10">
        
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-l-4 border-orange-500 pl-6 bg-[#1a1a1a] py-6 rounded-r-3xl shadow-2xl">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase flex items-center gap-3">
              <ShieldAlert className="text-orange-500 h-8 w-8" />
              Vault <span className="text-orange-500">Control</span>
            </h1>
            <p className="text-gray-500 text-[10px] tracking-[0.4em] uppercase font-bold mt-1">
              High-Performance Admin Management
            </p>
          </div>

          {/* Add Car Redirect Button */}
          <Link 
            href="/admin/add-car" 
            className="group flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-black px-8 py-4 rounded-full font-black uppercase tracking-tighter transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(249,115,22,0.4)]"
          >
            <PlusCircle className="h-5 w-5" />
            Add New Vehicle
          </Link>
        </div>

        {/* Quick Stats / Placeholder Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Active Listings", value: "24", color: "text-orange-500" },
            { label: "Pending Approvals", value: "03", color: "text-white" },
            { label: "System Health", value: "Optimal", color: "text-green-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-3xl text-center shadow-xl">
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">{stat.label}</p>
              <p className={`text-2xl font-black italic ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}