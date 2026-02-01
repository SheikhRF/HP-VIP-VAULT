"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { 
  Save, Trash2, Loader2, Wind, Scaling, Coins, MapPin, Settings2, ShieldAlert, Camera, X, Plus, 
  Calendar
} from "lucide-react";
import imageCompression from 'browser-image-compression'; 

export default function EditAssetForm({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState(initialData);
  const [photosToRemove, setPhotosToRemove] = useState<string[]>([]); // Track URLs to delete
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const router = useRouter();

  const handleDecommission = async () => {
    const confirmDelete = confirm(
      `SYSTEM WARNING: You are about to decommission ${formData.make} ${formData.model}. This action is irreversible. Proceed?`
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/admin/update-car", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          car_id: formData.car_id, 
          isDelete: true 
        }),
      });

      const result = await response.json();
      if (result.success) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      alert(`Decommissioning Failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const fd = new FormData();
      
      // 1. Append basic data
      Object.keys(formData).forEach(key => {
        if (key !== 'pictures') { 
           fd.append(key, formData[key] ?? "");
        }
      });

      // 2. Append the list of photos to remove
      fd.append("removed_photos", JSON.stringify(photosToRemove));

      // 3. Process new photo uploads
      if (newPhotos.length > 0) {
        setIsCompressing(true);
        const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1920, useWebWorker: true };
        const compressed = await Promise.all(
          newPhotos.map(file => imageCompression(file, options))
        );
        compressed.forEach(file => fd.append("photos", file));
        setIsCompressing(false);
      }

      const response = await fetch("/api/admin/update-car", {
        method: "POST",
        body: fd, 
      });

      const result = await response.json();
      if (result.success) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      alert(err.message || "System link failure.");
    } finally {
      setLoading(false);
      setIsCompressing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === "number") {
      if (value === "" || value === "-") {
        setFormData({ ...formData, [name]: null });
        return;
      }
      const num = Number(value);
      if (!isNaN(num)) {
        setFormData({ ...formData, [name]: num });
      }
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const togglePhotoRemoval = (url: string) => {
    if (photosToRemove.includes(url)) {
      setPhotosToRemove(photosToRemove.filter(p => p !== url));
    } else {
      setPhotosToRemove([...photosToRemove, url]);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-12 pb-20">
      
      {/* IDENTITY SECTION */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] flex items-center gap-2">
          <ShieldAlert size={14} /> Asset Identity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-gray-500 ml-1">Registration</label>
              <Input 
                name="registration" 
                value={formData.registration ?? ""} 
                onChange={handleChange} 
                maxLength={7}
                className="bg-black border-orange-500/30 text-orange-500 font-black uppercase tracking-widest text-lg h-12 focus:border-orange-500 transition-colors" 
              />
            </div>
            <Field label="Make" name="make" value={formData.make} onChange={handleChange} />
            <Field label="Model" name="model" value={formData.model} onChange={handleChange} />
        </div>
      </div>

      {/* VISUAL ASSETS (UPDATED WITH PRUNING) */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] flex items-center gap-2">
          <Camera size={14} /> Visual Documentation
        </h3>
        <div className="grid grid-cols-1 gap-6 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
          <div className="space-y-2">
            <label className="text-[8px] font-black uppercase text-gray-500 ml-1">Current Vault Images (Select to Remove)</label>
            <div className="flex flex-wrap gap-4 pb-2">
              {formData.pictures?.map((url: string, i: number) => {
                const isMarked = photosToRemove.includes(url);
                return (
                  <div key={i} className={`relative w-24 h-24 rounded-xl overflow-hidden border transition-all duration-300 ${isMarked ? 'opacity-20 grayscale border-red-500 scale-90' : 'border-white/10 hover:border-orange-500/50'}`}>
                    <img src={url} alt="asset" className="object-cover w-full h-full" />
                    <button 
                      type="button" 
                      onClick={() => togglePhotoRemoval(url)}
                      className={`absolute top-1 right-1 rounded-full p-1 transition-colors ${isMarked ? 'bg-red-500 text-white' : 'bg-black/80 text-white hover:text-red-500'}`}
                    >
                      {isMarked ? <Plus size={12} /> : <X size={12} />}
                    </button>
                    {isMarked && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-black text-red-500 uppercase">Delete</span>
                        </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-2 border-dashed border-white/5 rounded-2xl p-6 text-center hover:border-orange-500 transition-all">
            <input type="file" multiple accept="image/*" className="hidden" id="photo-add" 
              onChange={e => e.target.files && setNewPhotos([...newPhotos, ...Array.from(e.target.files)])} 
            />
            <label htmlFor="photo-add" className="cursor-pointer flex flex-col items-center gap-2">
              <Camera size={24} className="text-gray-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Add New Visuals</span>
            </label>
          </div>

          {newPhotos.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {newPhotos.map((file, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg border border-orange-500 overflow-hidden">
                  <img src={URL.createObjectURL(file)} className="object-cover w-full h-full" alt="pending" />
                  <button type="button" onClick={() => setNewPhotos(newPhotos.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-black/80 rounded-full p-0.5 text-red-500">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] flex items-center gap-2">
            <Wind size={14} /> Technical Intelligence
          </h3>
          <div className="space-y-4 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="0-100 km/h" name="acceleration_0_100" value={formData.acceleration_0_100} onChange={handleChange} />
              <Field label="Max Speed" name="max_speed" value={formData.max_speed} onChange={handleChange} />
              <Field label="Power" name="engine_power" value={formData.engine_power} onChange={handleChange} />
              <Field label="Torque" name="max_torque" value={formData.max_torque} onChange={handleChange} />
              <Field label="Capacity" name="engine_capacity" value={formData.engine_capacity} onChange={handleChange} />
              <Field label="Layout" name="cylinder_layout" value={formData.cylinder_layout} onChange={handleChange} />
              <Field label="Cylinders" name="number_of_cylinders" type="number" value={formData.number_of_cylinders} onChange={handleChange} />
              <Field label="Gearbox" name="gearbox_type" value={formData.gearbox_type} onChange={handleChange} />
              <Field label="Gears" name="number_of_gears" type="number" value={formData.number_of_gears} onChange={handleChange} />
              <Field label="Drive" name="drive_wheels" value={formData.drive_wheels} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] flex items-center gap-2">
            <Scaling size={14} /> Logistics
          </h3>
          <div className="space-y-4 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Body Type" name="body_type" value={formData.body_type} onChange={handleChange} />
              <Field label="Weight" name="curb_weight" value={formData.curb_weight} onChange={handleChange} />
              <Field label="Fuel" name="fuel_tank_capacity" value={formData.fuel_tank_capacity} onChange={handleChange} />
              <Field label="Trunk" name="max_trunk_capacity" value={formData.max_trunk_capacity} onChange={handleChange} />
              <Field label="Seats" name="number_of_seats" type="number" value={formData.number_of_seats} onChange={handleChange} />
              <Field label="Location" name="location" value={formData.location} onChange={handleChange} icon={<MapPin size={8} />} />
              <div className="col-span-2 grid grid-cols-2 gap-4 pt-2">
                  <Field label="Mileage" name="mileage" type="number" value={formData.mileage} onChange={handleChange} />
                  <Field label="Price" name="price" type="number" value={formData.price} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-[0.4em] flex items-center gap-2">
            <Settings2 size={14} /> Compliance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
              <Field label="MOT" name="mot" value={formData.mot} onChange={handleChange} />
              <Field label="Tax" name="tax_status" value={formData.tax_status} onChange={handleChange} />
              <Field label="Due" name="tax_due_date" value={formData.tax_due_date} onChange={handleChange} />
              <Field label="Service Date" name="service_date" type="date" value={formData.service_date ?? ""} onChange={handleChange} icon={<Calendar size={10} />} />
          </div>
      </div>

      <div className="flex justify-between items-center pt-10 border-t border-white/5">
        <button 
          type="button" 
          onClick={handleDecommission} 
          disabled={isDeleting}
          className="text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-50 transition-all disabled:opacity-20"
        >
          {isDeleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />} 
          Decommission Asset
        </button>
        <button 
          type="submit" 
          disabled={loading || isCompressing || isDeleting} 
          className="bg-orange-500 text-black px-12 py-4 rounded-full font-black uppercase text-[11px] tracking-[0.3em] hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(249,115,22,0.3)]"
        >
          {loading || isCompressing ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
          {isCompressing ? "Compressing..." : "Commit Overrides"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, name, value, onChange, type = "text", icon }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[8px] font-black uppercase text-gray-500 ml-1 flex items-center gap-1">{icon} {label}</label>
      <Input type={type} name={name} value={value ?? ""} onChange={onChange} className="bg-black border-white/5 text-white font-mono text-xs h-9 focus:border-orange-500/50" />
    </div>
  );
}