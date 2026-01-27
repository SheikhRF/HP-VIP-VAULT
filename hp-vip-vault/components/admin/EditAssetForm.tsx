"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { 
  Save, Trash2, Loader2, Wind, Scaling, Coins, MapPin, Settings2 
} from "lucide-react";

export default function EditAssetForm({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/admin/update-car", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        router.push("/admin/dashboard");
        router.refresh();
      }
    } catch (err) {
      alert("System link failure.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    // Convert to number for bigint/integer fields
    const val = type === "number" ? (value === "" ? null : Number(value)) : value;
    setFormData({ ...formData, [name]: val });
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-12 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* SECTION: TECHNICAL INTELLIGENCE */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] flex items-center gap-2">
            <Wind size={14} /> Technical Intelligence
          </h3>
          <div className="space-y-4 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Acceleration (0-100)" name="acceleration_0_100" value={formData.acceleration_0_100} onChange={handleChange} />
              <Field label="Max Speed" name="max_speed" value={formData.max_speed} onChange={handleChange} />
              <Field label="Engine Power" name="engine_power" value={formData.engine_power} onChange={handleChange} />
              <Field label="Max Torque" name="max_torque" value={formData.max_torque} onChange={handleChange} />
              <Field label="Engine Capacity" name="engine_capacity" value={formData.engine_capacity} onChange={handleChange} />
              <Field label="Cylinder Layout" name="cylinder_layout" value={formData.cylinder_layout} onChange={handleChange} />
              <Field label="No. of Cylinders" name="number_of_cylinders" type="number" value={formData.number_of_cylinders} onChange={handleChange} />
              <Field label="Gearbox Type" name="gearbox_type" value={formData.gearbox_type} onChange={handleChange} />
              <Field label="No. of Gears" name="number_of_gears" type="number" value={formData.number_of_gears} onChange={handleChange} />
              <Field label="Drive Wheels" name="drive_wheels" value={formData.drive_wheels} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* SECTION: CHASSIS & LOGISTICS */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] flex items-center gap-2">
            <Scaling size={14} /> Chassis & Logistics
          </h3>
          <div className="space-y-4 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Body Type" name="body_type" value={formData.body_type} onChange={handleChange} />
              <Field label="Curb Weight" name="curb_weight" value={formData.curb_weight} onChange={handleChange} />
              <Field label="Fuel Capacity" name="fuel_tank_capacity" value={formData.fuel_tank_capacity} onChange={handleChange} />
              <Field label="Trunk Capacity" name="max_trunk_capacity" value={formData.max_trunk_capacity} onChange={handleChange} />
              <Field label="Seats" name="number_of_seats" type="number" value={formData.number_of_seats} onChange={handleChange} />
              <Field label="Location" name="location" value={formData.location} onChange={handleChange} icon={<MapPin size={8} />} />
              
              <div className="col-span-2 space-y-4 pt-2">
                 <div className="grid grid-cols-2 gap-4">
                    <Field label="Current Mileage" name="mileage" type="number" value={formData.mileage} onChange={handleChange} />
                    <Field label="Asset Valuation (Price)" name="price" type="number" value={formData.price} onChange={handleChange} />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: COMPLIANCE OVERRIDE */}
      <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] flex items-center gap-2">
            <Settings2 size={14} /> Compliance Protocol
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
              <Field label="MOT Status" name="mot" value={formData.mot} onChange={handleChange} />
              <Field label="Tax Status" name="tax_status" value={formData.tax_status} onChange={handleChange} />
              <Field type="date" label="Tax Due Date" name="tax_due_date" value={formData.tax_due_date} onChange={handleChange} />
          </div>
      </div>

      {/* ACTION BAR */}
      <div className="flex justify-between items-center pt-10 border-t border-white/5">
        <button type="button" className="text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-50 transition-all">
          <Trash2 size={14} /> Decommission Asset
        </button>
        <button type="submit" disabled={loading} className="bg-orange-500 text-black px-12 py-4 rounded-full font-black uppercase text-[11px] tracking-[0.3em] hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)]">
          {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
          Commit Overrides
        </button>
      </div>
    </form>
  );
}

function Field({ label, name, value, onChange, type = "text", icon }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[8px] font-black uppercase text-gray-500 ml-1 flex items-center gap-1">
        {icon} {label}
      </label>
      <Input 
        type={type}
        name={name} 
        value={value ?? ""} 
        onChange={onChange} 
        className="bg-black border-white/5 text-white font-mono text-xs h-9 focus:border-orange-500/50 transition-colors" 
      />
    </div>
  );
}