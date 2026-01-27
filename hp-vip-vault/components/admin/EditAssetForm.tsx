"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { Save, Trash2, Loader2 } from "lucide-react";

export default function EditAssetForm({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
      .from("cars")
      .update(formData)
      .eq("car_id", initialData.car_id);

    if (!error) {
      router.refresh();
      router.push("/admin/dashboard");
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Identity Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em]">Identity & Specs</h3>
          <div className="space-y-4 bg-white/5 p-6 rounded-[2rem] border border-white/5">
            <div>
              <label className="text-[8px] uppercase font-bold text-gray-500 ml-1">Registration</label>
              <Input name="registration" value={formData.registration} onChange={handleChange} className="bg-black border-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="text-[8px] uppercase font-bold text-gray-500 ml-1">Power (HP)</label>
                <Input name="engine_power" value={formData.engine_power} onChange={handleChange} className="bg-black border-white/10" />
              </div>
              <div>
                <label className="text-[8px] uppercase font-bold text-gray-500 ml-1">0-60 (Sec)</label>
                <Input name="acceleration_0_100" value={formData.acceleration_0_100} onChange={handleChange} className="bg-black border-white/10" />
              </div>
            </div>
            <div>
              <label className="text-[8px] uppercase font-bold text-gray-500 ml-1">Current Odometer</label>
              <Input name="mileage" value={formData.mileage} onChange={handleChange} className="bg-black border-white/10" />
            </div>
          </div>
        </section>

        {/* Legal Status Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em]">Compliance Override</h3>
          <div className="space-y-4 bg-white/5 p-6 rounded-[2rem] border border-white/5">
            <div>
              <label className="text-[8px] uppercase font-bold text-gray-500 ml-1">MOT Status</label>
              <Input name="mot" value={formData.mot} onChange={handleChange} className="bg-black border-white/10" />
            </div>
            <div>
              <label className="text-[8px] uppercase font-bold text-gray-500 ml-1">Tax Status</label>
              <Input name="tax_status" value={formData.tax_status} onChange={handleChange} className="bg-black border-white/10" />
            </div>
            <div>
              <label className="text-[8px] uppercase font-bold text-gray-500 ml-1">Tax Due Date</label>
              <Input name="tax_due_date" value={formData.tax_due_date} onChange={handleChange} className="bg-black border-white/10" />
            </div>
          </div>
        </section>
      </div>

      {/* Control Bar */}
      <div className="flex justify-between items-center pt-10 border-t border-white/5">
        <button type="button" className="text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-50 transition-opacity">
          <Trash2 size={14} /> Decommission Asset
        </button>
        
        <button 
          type="submit" 
          disabled={loading}
          className="bg-orange-500 text-black px-12 py-4 rounded-full font-black uppercase text-[11px] tracking-[0.3em] hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          Commit Changes
        </button>
      </div>
    </form>
  );
}